from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.models.document import Document
from app.schemas.document import DocumentResponse, DocumentDetail
from app.services.document_processor import DocumentProcessor
from app.services.analysis_runner import run_analysis
 # Import the analysis function
from app.models.document import Analysis  # Import the Analysis model
from fastapi import Body

router = APIRouter()


@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    file: UploadFile = File(...),
    background_tasks: BackgroundTasks = None,
    db: Session = Depends(get_db)
):
    """Upload a document file (PDF, DOCX, TXT)"""
    # Validate file type
    file_extension = file.filename.split(".")[-1].lower()
    if file_extension not in ["pdf", "docx", "txt"]:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {file_extension}"
        )
    
    # Save file
    file_path = await DocumentProcessor.save_upload_file(file)
    
    # Extract text
    text_content = DocumentProcessor.extract_text(file_path)
    
    # Create document record
    db_document = Document(
        filename=file.filename,
        file_path=file_path,
        file_type=file_extension,
        content=text_content
    )
    
    db.add(db_document)
    db.commit()
    db.refresh(db_document)
    
    # Automatically start analysis in background
    analysis = Analysis(
        document_id=db_document.id,
        summary="Analysis in progress...",
        key_topics="[]"
    )
    db.add(analysis)
    db.commit()
    db.refresh(analysis)
    
    # Run analysis in background
    background_tasks.add_task(run_analysis, db_document.content, analysis.id, db)
    
    return db_document


@router.get("/", response_model=List[DocumentResponse])
def get_documents(db: Session = Depends(get_db)):
    """Get all documents"""
    return db.query(Document).all()


@router.get("/{document_id}", response_model=DocumentDetail)
def get_document(document_id: int, db: Session = Depends(get_db)):
    """Get a specific document by ID"""
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    return document


@router.delete("/{document_id}")
def delete_document(document_id: int, db: Session = Depends(get_db)):
    """Delete a document"""
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Delete the file
    try:
        import os
        if os.path.exists(document.file_path):
            os.remove(document.file_path)
    except Exception as e:
        # Log the error but continue with DB deletion
        print(f"Error deleting file: {e}")
    
    # Delete from database
    db.delete(document)
    db.commit()
    
    return {"message": "Document deleted successfully"}


@router.put("/{document_id}/tags")
def update_document_tags(document_id: int, tags: List[str] = Body(...), db: Session = Depends(get_db)):
    """Update document tags"""
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    document.tags = json.dumps(tags)
    db.commit()
    db.refresh(document)
    
    return {"message": "Tags updated successfully"}


@router.get("/search")
def search_documents(query: str, db: Session = Depends(get_db)):
    """Search documents by content or tags"""
    # Search in content
    content_results = db.query(Document).filter(Document.content.ilike(f"%{query}%")).all()
    
    # Search in tags
    tag_results = []
    all_docs = db.query(Document).all()
    for doc in all_docs:
        try:
            tags = json.loads(doc.tags)
            if any(query.lower() in tag.lower() for tag in tags):
                tag_results.append(doc)
        except:
            pass
    
    # Combine results and remove duplicates
    combined_results = list({doc.id: doc for doc in content_results + tag_results}.values())
    
    return combined_results