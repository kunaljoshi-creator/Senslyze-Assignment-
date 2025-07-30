from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Form
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.models.document import Document, Analysis, Conversation, Message
from app.schemas.document import AnalysisResponse, MessageCreate, MessageResponse, ConversationResponse
from app.services.ai_service import AIService
import json

router = APIRouter()
ai_service = AIService()


@router.post("/documents/{document_id}/analyze", response_model=AnalysisResponse)
def analyze_document(document_id: int, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """Analyze a document to generate summary and key topics"""
    # Get the document
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Check if analysis already exists
    existing_analysis = db.query(Analysis).filter(Analysis.document_id == document_id).first()
    if existing_analysis:
        return existing_analysis
    
    # Create a placeholder analysis
    analysis = Analysis(
        document_id=document_id,
        summary="Analysis in progress...",
        key_topics="[]"
    )
    db.add(analysis)
    db.commit()
    db.refresh(analysis)
    
    # Run analysis in background
    background_tasks.add_task(run_analysis, document.content, analysis.id, db)
    
    return analysis


def run_analysis(document_text: str, analysis_id: int, db: Session):
    """Background task to run document analysis"""
    # Get the analysis record
    analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
    if not analysis:
        print(f"Analysis {analysis_id} not found")
        return
    
    try:
        # Run AI analysis
        result = ai_service.analyze_document(document_text)
        
        # Update the analysis record
        analysis.summary = result["summary"]
        analysis.key_topics = result["key_topics"]
        db.commit()
    except Exception as e:
        # Update with error
        analysis.summary = f"Analysis failed: {str(e)}"
        db.commit()
        print(f"Analysis error: {e}")


@router.post("/documents/{document_id}/conversations", response_model=ConversationResponse)
def create_conversation(document_id: int, db: Session = Depends(get_db)):
    """Create a new conversation for a document"""
    # Check if document exists
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Create conversation
    conversation = Conversation(document_id=document_id)
    db.add(conversation)
    db.commit()
    db.refresh(conversation)
    
    return conversation


@router.post("/conversations/{conversation_id}/messages", response_model=MessageResponse)
def create_message(message: MessageCreate, db: Session = Depends(get_db)):
    """Add a message to a conversation and get AI response"""
    # Check if conversation exists
    conversation = db.query(Conversation).filter(Conversation.id == message.conversation_id).first()
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    # Save user message
    db_message = Message(
        conversation_id=message.conversation_id,
        content=message.content,
        is_user=1
    )
    db.add(db_message)
    db.commit()
    
    # Get document content
    document = db.query(Document).filter(Document.id == conversation.document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Generate AI response
    try:
        ai_response = ai_service.answer_question(message.content, document.content)
        
        # Save AI response
        ai_message = Message(
            conversation_id=message.conversation_id,
            content=ai_response,
            is_user=0
        )
        db.add(ai_message)
        db.commit()
        db.refresh(ai_message)
        
        return ai_message
    except Exception as e:
        # Return error message
        error_message = Message(
            conversation_id=message.conversation_id,
            content=f"Error generating response: {str(e)}",
            is_user=0
        )
        db.add(error_message)
        db.commit()
        db.refresh(error_message)
        
        return error_message


@router.get("/conversations/{conversation_id}", response_model=ConversationResponse)
def get_conversation(conversation_id: int, db: Session = Depends(get_db)):
    """Get a conversation with all messages"""
    conversation = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    return conversation


# Add this new endpoint
@router.post("/multi-document-qa", response_model=MessageResponse)
def multi_document_qa(question: str = Form(...), document_ids: List[int] = Form(...), db: Session = Depends(get_db)):
    """Answer questions across multiple documents"""
    # Get all specified documents
    documents = db.query(Document).filter(Document.id.in_(document_ids)).all()
    if not documents:
        raise HTTPException(status_code=404, detail="No documents found")
    
    # Combine document contents
    combined_content = "\n\n---\n\n".join([f"Document: {doc.filename}\n{doc.content}" for doc in documents])
    
    # Generate AI response
    try:
        ai_response = ai_service.answer_question(question, combined_content)
        # Create a Message object to match the schema
        message = Message(
            conversation_id=None,  # This is a standalone message
            content=ai_response,
            is_user=0
        )
        db.add(message)
        db.commit()
        db.refresh(message)
        return message
    except Exception as e:
        # Create an error message that matches the schema
        error_message = Message(
            conversation_id=None,
            content=f"Error generating response: {str(e)}",
            is_user=0
        )
        db.add(error_message)
        db.commit()
        db.refresh(error_message)
        return error_message


@router.get("/history", response_model=List[dict])
def get_analyses_history(db: Session = Depends(get_db)):
    """Get all analyses with their associated documents"""
    analyses = db.query(Analysis).order_by(Analysis.created_at.desc()).all()
    
    result = []
    for analysis in analyses:
        document = db.query(Document).filter(Document.id == analysis.document_id).first()
        if document:
            result.append({
                "analysis": {
                    "id": analysis.id,
                    "document_id": analysis.document_id,
                    "summary": analysis.summary,
                    "key_topics": analysis.key_topics,
                    "created_at": analysis.created_at
                },
                "document": {
                    "id": document.id,
                    "filename": document.filename,
                    "file_type": document.file_type,
                    "file_path": document.file_path,
                    "upload_date": document.upload_date
                }
            })
    
    return result


# Add this new endpoint after the existing multi-document-qa endpoint
@router.post("/multi-document-summary", response_model=dict)
def multi_document_summary(document_ids: List[int] = Form(...), db: Session = Depends(get_db)):
    """Generate a summary across multiple documents"""
    # Get all specified documents
    documents = db.query(Document).filter(Document.id.in_(document_ids)).all()
    if not documents:
        raise HTTPException(status_code=404, detail="No documents found")
    
    # Combine document contents
    combined_content = "\n\n---\n\n".join([f"Document: {doc.filename}\n{doc.content}" for doc in documents])
    
    # Generate AI response
    try:
        summary_result = ai_service.analyze_document(combined_content)
        return {"summary": summary_result["summary"]}
    except Exception as e:
        return {"summary": f"Error generating summary: {str(e)}"}


# Add this new endpoint after the existing endpoints
from fastapi.responses import StreamingResponse
import io

@router.get("/documents/{document_id}/summary/download")
def download_summary(document_id: int, db: Session = Depends(get_db)):
    """Download document summary as a text file"""
    # Get the analysis for the document
    analysis = db.query(Analysis).filter(Analysis.document_id == document_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found for this document")
    
    # Get the document for the filename
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Create a text file with the summary
    summary_text = analysis.summary
    
    # Try to parse key topics if available
    try:
        topics = json.loads(analysis.key_topics)
        if topics and len(topics) > 0:
            topics_text = "\n\nKEY TOPICS:\n" + "\n".join([f"- {topic}" for topic in topics])
            summary_text += topics_text
    except:
        pass
    
    # Create a file-like object
    file_obj = io.StringIO()
    file_obj.write(summary_text)
    file_obj.seek(0)
    
    # Generate a filename based on the original document
    filename = f"{document.filename.rsplit('.', 1)[0]}_summary.txt"
    
    # Return the file as a downloadable response
    return StreamingResponse(
        io.BytesIO(file_obj.getvalue().encode('utf-8')),
        media_type="text/plain",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )