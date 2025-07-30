import apiClient from './client';

export interface Document {
  id: number;
  filename: string;
  file_type: string;
  upload_date: string;
  file_path: string;
}

export interface DocumentDetail extends Document {
  createElement(arg0: string): unknown;
  getElementById(arg0: string): unknown;
  content?: string;
}

export interface Analysis {
  id: number;
  document_id: number;
  summary: string;
  key_topics: string;
  created_at: string;
}

export interface Message {
  id: number;
  content: string;
  is_user: number; // 1 for user, 0 for AI
  created_at: string;
}

export interface Conversation {
  id: number;
  document_id: number;
  created_at: string;
  messages: Message[];
}

const documentService = {
  // Document operations
  uploadDocument: async (file: File): Promise<Document> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post('/api/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },
  
  getDocuments: async (): Promise<Document[]> => {
    const response = await apiClient.get('/api/documents/');
    return response.data;
  },
  
  getDocument: async (id: number): Promise<DocumentDetail> => {
    const response = await apiClient.get(`/api/documents/${id}`);
    return response.data;
  },
  
  deleteDocument: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/documents/${id}`);
  },
  
  // Analysis operations
  analyzeDocument: async (documentId: number): Promise<Analysis> => {
    const response = await apiClient.post(`/api/analysis/documents/${documentId}/analyze`);
    return response.data;
  },
  
  // Conversation operations
  createConversation: async (documentId: number): Promise<Conversation> => {
    const response = await apiClient.post(`/api/analysis/documents/${documentId}/conversations`);
    return response.data;
  },
  
  sendMessage: async (conversationId: number, content: string): Promise<Message> => {
    const response = await apiClient.post(`/api/analysis/conversations/${conversationId}/messages`, {
      conversation_id: conversationId,
      content,
      is_user: 1,
    });
    
    return response.data;
  },
  
  getConversation: async (conversationId: number): Promise<Conversation> => {
    const response = await apiClient.get(`/api/analysis/conversations/${conversationId}`);
    return response.data;
  },

  // Add this method to get messages for a conversation
  getMessages: async (conversationId: number): Promise<Message[]> => {
    const conversation = await documentService.getConversation(conversationId);
    return conversation.messages;
  },
  
  // Multi-document Q&A
  askMultiDocumentQuestion: async (formData: FormData): Promise<Message> => {
    const response = await apiClient.post('/api/analysis/multi-document-qa', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  // Analysis history
  getAnalysesHistory: async (): Promise<any[]> => {
    const response = await apiClient.get('/api/analysis/history');
    return response.data;
  },
  
  // Document tags
  updateTags: async (id: number, tags: string[]): Promise<void> => {
    await apiClient.put(`/api/documents/${id}/tags`, tags);
  },
  
  // Search functionality
  searchDocuments: async (query: string): Promise<Document[]> => {
    const response = await apiClient.get(`/api/documents/search?query=${encodeURIComponent(query)}`);
    return response.data;
  },
  
  // Add this method to the documentService object
  downloadSummary: async (documentId: number): Promise<void> => {
    const response = await apiClient.get(`/api/analysis/documents/${documentId}/summary/download`, {
      responseType: 'blob'
    });
    
    // Create a URL for the blob
    const url = window.URL.createObjectURL(new Blob([response.data]));
    
    // Create a temporary link element
    const link = document.createElement('a');
    link.href = url;
    
    // Get the filename from the Content-Disposition header if available
    const contentDisposition = response.headers['content-disposition'];
    let filename = `document_${documentId}_summary.txt`;
    
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename=(.+)/);
      if (filenameMatch && filenameMatch.length > 1) {
        filename = filenameMatch[1];
      }
    }
    
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};

export default documentService;