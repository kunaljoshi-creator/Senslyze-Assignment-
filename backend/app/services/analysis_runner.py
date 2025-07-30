from app.models.document import Document, Analysis, Conversation, Message
from app.services.ai_service import AIService
from sqlalchemy.orm import Session

ai_service = AIService()

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
