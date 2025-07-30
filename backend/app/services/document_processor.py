import os
import uuid
from fastapi import UploadFile, HTTPException
from typing import List, Optional
import PyPDF2
import docx
from app.core.config import settings


class DocumentProcessor:
    @staticmethod
    async def save_upload_file(upload_file: UploadFile) -> str:
        """Save an uploaded file to disk and return the file path"""
        # Create upload directory if it doesn't exist
        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
        
        # Generate a unique filename
        file_extension = os.path.splitext(upload_file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(settings.UPLOAD_DIR, unique_filename)
        
        # Write the file
        with open(file_path, "wb") as f:
            content = await upload_file.read()
            if len(content) > settings.MAX_UPLOAD_SIZE:
                raise HTTPException(status_code=413, detail="File too large")
            f.write(content)
        
        return file_path
    
    @staticmethod
    def extract_text(file_path: str) -> str:
        """Extract text from a document file"""
        file_extension = os.path.splitext(file_path)[1].lower()
        
        if file_extension == ".pdf":
            return DocumentProcessor._extract_from_pdf(file_path)
        elif file_extension == ".docx":
            return DocumentProcessor._extract_from_docx(file_path)
        elif file_extension == ".txt":
            return DocumentProcessor._extract_from_txt(file_path)
        else:
            raise HTTPException(
                status_code=400, 
                detail=f"Unsupported file type: {file_extension}"
            )
    
    @staticmethod
    def _extract_from_pdf(file_path: str) -> str:
        """Extract text from a PDF file"""
        text = ""
        with open(file_path, "rb") as f:
            pdf_reader = PyPDF2.PdfReader(f)
            for page_num in range(len(pdf_reader.pages)):
                page = pdf_reader.pages[page_num]
                text += page.extract_text()
        return text
    
    @staticmethod
    def _extract_from_docx(file_path: str) -> str:
        """Extract text from a DOCX file"""
        doc = docx.Document(file_path)
        return "\n".join([paragraph.text for paragraph in doc.paragraphs])
    
    @staticmethod
    def _extract_from_txt(file_path: str) -> str:
        """Extract text from a TXT file"""
        with open(file_path, "r", encoding="utf-8") as f:
            return f.read()