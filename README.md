      
# AI Document Analyzer

AI Document Analyzer is a modern web application that leverages AI to analyze, summarize, and interact with document content. The application allows users to upload documents, generate summaries, extract key topics, and have interactive conversations with their documents using advanced AI capabilities.

![AI Document Analyzer](https://via.placeholder.com/800x400?text=AI+Document+Analyzer)

## Features

### Document Management
- **Upload Documents**: Support for PDF, DOCX, and TXT file formats
- **Document Viewing**: Read document content directly in the application
- **Document Organization**: Browse and manage your uploaded documents

### AI-Powered Analysis
- **Document Summarization**: Generate concise summaries of document content
- **Key Topic Extraction**: Identify and highlight the most important topics in documents
- **Summary Downloads**: Export and save document summaries

### Interactive Features
- **Chat with Documents**: Ask questions about document content and receive AI-generated answers
- **Multi-Document Q&A**: Ask questions across multiple documents simultaneously
- **Multi-Document Summarization**: Generate combined summaries from multiple documents

### User Experience
- **Modern UI**: Clean, responsive interface with animations and visual feedback
- **Secure Authentication**: User account system with login and signup functionality
- **Analysis History**: View past document analyses and their results

## Technology Stack

### Frontend
- **React**: UI library for building the user interface
- **TypeScript**: Type-safe JavaScript for robust code
- **Tailwind CSS**: Utility-first CSS framework for styling
- **React Query**: Data fetching and state management
- **React Dropzone**: File upload functionality
- **React Icons**: Icon library

### Backend
- **FastAPI**: Modern, high-performance web framework for building APIs
- **SQLAlchemy**: SQL toolkit and ORM for database interactions
- **LangChain**: Framework for building applications with large language models
- **Google Gemini AI**: AI model for document analysis and question answering
- **PostgreSQL**: Relational database for data storage

### Deployment
- **Docker**: Containerization for consistent development and deployment
- **Docker Compose**: Multi-container application orchestration

## Architecture

The application follows a modern client-server architecture:

- **Frontend**: React-based SPA (Single Page Application) that communicates with the backend API
- **Backend API**: FastAPI server that handles document processing, AI analysis, and database operations
- **Database**: PostgreSQL database for storing user data, documents, analyses, and conversations
- **AI Service**: Integration with Google Gemini AI through LangChain for document analysis and question answering

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Google API Key for Gemini AI
- LangSmith API Key (optional, for tracing and evaluation)

### Environment Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/ai-document-analyzer.git
   cd ai-document-analyzer
   ```

2. Create a `.env` file in the root directory with the following variables:
   ```
   GOOGLE_API_KEY=your_google_api_key
   LANGSMITH_API_KEY=your_langsmith_api_key
   ```

### Running the Application

1. Start the application using Docker Compose:
   ```bash
   docker-compose up
   ```

2. Access the application:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000

### Development Setup

#### Frontend

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

#### Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Start the development server:
   ```bash
   uvicorn app.main:app --reload
   ```

## Usage Guide

### Document Upload and Analysis

1. Log in to your account
2. Upload a document using the upload section
3. View your document in the document list
4. Click on a document to view its content
5. Click "Summarize Document" to generate an AI summary and extract key topics

### Chatting with Documents

1. Select a document from your list
2. Click the "Chat" button
3. Ask questions about the document content
4. Receive AI-generated answers based on the document

### Multi-Document Q&A

1. Navigate to the Multi-Document Q&A section
2. Upload or select multiple documents
3. Ask questions that span across the selected documents
4. Optionally generate a combined summary of all selected documents

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Google Gemini AI for powering the document analysis
- LangChain for providing the framework for AI integration
- All open-source libraries used in this project

        
