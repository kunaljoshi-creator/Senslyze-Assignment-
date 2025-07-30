from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional


class DocumentBase(BaseModel):
    filename: str
    file_type: str


class DocumentCreate(DocumentBase):
    pass


class DocumentResponse(DocumentBase):
    id: int
    upload_date: datetime
    file_path: str
    
    class Config:
        from_attributes = True


class DocumentDetail(DocumentResponse):
    content: Optional[str] = None
    
    class Config:
        from_attributes = True


class AnalysisBase(BaseModel):
    document_id: int
    summary: str
    key_topics: str  # JSON string


class AnalysisCreate(AnalysisBase):
    pass


class AnalysisResponse(AnalysisBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


class MessageBase(BaseModel):
    content: str
    is_user: int = Field(1, description="1 for user, 0 for AI")


class MessageCreate(MessageBase):
    conversation_id: int


class MessageResponse(MessageBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


class ConversationBase(BaseModel):
    document_id: int


class ConversationCreate(ConversationBase):
    pass


class ConversationResponse(ConversationBase):
    id: int
    created_at: datetime
    messages: List[MessageResponse] = []
    
    class Config:
        from_attributes = True