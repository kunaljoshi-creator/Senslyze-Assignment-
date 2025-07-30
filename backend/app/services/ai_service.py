import json
import os
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.chains.summarize import load_summarize_chain
from langchain.chains.question_answering import load_qa_chain
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.docstore.document import Document as LangchainDocument
from langchain.callbacks import LangChainTracer
from langchain.smith import RunEvalConfig
from langchain.callbacks.tracers.langchain import wait_for_all_tracers
from app.core.config import settings

# Set LangSmith environment variables
os.environ["LANGCHAIN_TRACING"] = str(settings.LANGSMITH_TRACING).lower()
os.environ["LANGCHAIN_ENDPOINT"] = settings.LANGSMITH_ENDPOINT
os.environ["LANGCHAIN_API_KEY"] = settings.LANGSMITH_API_KEY
os.environ["LANGCHAIN_PROJECT"] = settings.LANGSMITH_PROJECT


class AIService:
    def __init__(self):
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash",
            google_api_key=settings.GOOGLE_API_KEY,
            temperature=0.1
        )
        
        # Set up LangSmith tracer
        self.callbacks = []
        if settings.LANGSMITH_API_KEY:
            self.tracer = LangChainTracer(project_name=settings.LANGSMITH_PROJECT)
            self.callbacks.append(self.tracer)
            self.eval_config = RunEvalConfig(
                evaluators=["qa", "criteria"],
                custom_evaluators=[]
            )
        
    def _split_text(self, text: str):
        """Split text into chunks for processing"""
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=2000,  # Increased chunk size
            chunk_overlap=200
        )
        return text_splitter.split_text(text)
    
    def analyze_document(self, text: str):
        """Generate summary and key topics from document text"""
        # Split text into chunks
        texts = self._split_text(text)
        docs = [LangchainDocument(page_content=t) for t in texts]
        
        # Generate summary with tracing
        chain = load_summarize_chain(self.llm, chain_type="map_reduce")
        summary = chain.run(input_documents=docs, callbacks=self.callbacks)
        
        # Extract key topics with tracing
        topic_prompt = f"""Based on the following document, identify and list the 5-7 most important topics or key points.
        Format the output as a JSON array of strings.
        
        Document: {text[:5000]}... (truncated)
        
        Key Topics:"""
        
        topics_text = self.llm.predict(topic_prompt, callbacks=self.callbacks)
        
        # Ensure topics are in JSON format
        try:
            # Clean up the response to ensure it's valid JSON
            topics_text = topics_text.strip()
            if not topics_text.startswith('['):
                topics_text = topics_text[topics_text.find('['):]
            if not topics_text.endswith(']'):
                topics_text = topics_text[:topics_text.rfind(']')+1]
                
            topics = json.loads(topics_text)
        except json.JSONDecodeError:
            # Fallback if JSON parsing fails
            topics = ["Topic extraction failed"]
        
        # Ensure all traces are properly recorded
        wait_for_all_tracers()
        
        return {
            "summary": summary,
            "key_topics": json.dumps(topics)
        }
    
    def answer_question(self, question: str, document_text: str):
        """Answer a question based on the document content"""
        # Split text into chunks
        texts = self._split_text(document_text)
        docs = [LangchainDocument(page_content=t) for t in texts]
        
        # Create QA chain with tracing
        chain = load_qa_chain(self.llm, chain_type="stuff")
        
        # Get answer with tracing
        answer = chain.run(input_documents=docs, question=question, callbacks=self.callbacks)
        
        # Ensure all traces are properly recorded
        wait_for_all_tracers()
        
        return answer