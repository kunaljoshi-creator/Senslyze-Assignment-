import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiSend, FiFileText, FiArrowLeft } from 'react-icons/fi';
import documentService, { type DocumentDetail, type Conversation, type Message } from '../api/documentService';

interface ChatInterfaceProps {
  documentId: number;
  onBack: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ documentId, onBack }) => {
  const [message, setMessage] = useState('');
  const [conversationId, setConversationId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  
  const { data: document } = useQuery<DocumentDetail>({
    queryKey: ['document', documentId],
    queryFn: () => documentService.getDocument(documentId),
  });
  
  // Create or get conversation
  const { isLoading: isLoadingConversation } = useQuery<Conversation>({
    queryKey: ['conversation', documentId],
    queryFn: async () => {
      try {
        const newConversation = await documentService.createConversation(documentId);
        setConversationId(newConversation.id);
        return newConversation;
      } catch (error) {
        console.error('Error creating conversation:', error);
        throw error;
      }
    },
    enabled: !!documentId,
  });
  
  // Get conversation with messages
  const { data: conversationWithMessages } = useQuery<Conversation>({
    queryKey: ['conversation-messages', conversationId],
    queryFn: () => documentService.getConversation(conversationId!),
    enabled: !!conversationId,
    refetchInterval: 2000, // Refetch every 2 seconds for real-time updates
  });
  
  const sendMessageMutation = useMutation({
    mutationFn: ({ conversationId, content }: { conversationId: number; content: string }) =>
      documentService.sendMessage(conversationId, content),
    onSuccess: () => {
      if (conversationId) {
        queryClient.invalidateQueries({ queryKey: ['conversation-messages', conversationId] });
      }
    },
  });
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !conversationId) return;
    
    sendMessageMutation.mutate({ conversationId, content: message });
    setMessage('');
    
    // Focus the input after sending
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationWithMessages?.messages]);
  
  // Focus input on initial load
  useEffect(() => {
    if (!isLoadingConversation) {
      inputRef.current?.focus();
    }
  }, [isLoadingConversation]);
  
  if (isLoadingConversation) {
    return (
      <div className="flex justify-center items-center h-64 animate-pulse-slow">
        <div className="spinner mr-3"></div>
        <span className="text-gray-600 font-medium">Initializing chat...</span>
      </div>
    );
  }
  
  const messages = conversationWithMessages?.messages || [];
  
  return (
    <div className="chat-container flex flex-col h-full">
      <div className="bg-white p-4 border-b border-gray-200 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center">
          <button
            onClick={onBack}
            className="mr-3 text-gray-600 hover:text-gray-900 p-1 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Back"
          >
            <FiArrowLeft size={20} />
          </button>
          <h2 className="text-xl font-semibold flex items-center text-gray-800 truncate max-w-[calc(100vw-200px)]">
            <FiFileText className="mr-2 flex-shrink-0" />
            <span className="truncate">{document?.filename}</span>
          </h2>
        </div>
      </div>
      
      <div className="chat-messages flex-1 overflow-y-auto p-4 bg-gray-50">
        {messages.length > 0 ? (
          <div className="space-y-4">
            {messages.map((msg: Message) => (
              <div
                key={msg.id}
                className={`message-container ${msg.is_user ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`message ${msg.is_user ? 'user-message' : 'ai-message'}`}
                >
                  <p className="whitespace-pre-line">{msg.content}</p>
                </div>
              </div>
            ))}
            {sendMessageMutation.isPending && (
              <div className="message-container justify-start">
                <div className="typing-indicator">
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <p className="text-lg mb-2">Ask a question about the document</p>
            <p className="text-sm">The AI will analyze the document and provide answers based on its content</p>
          </div>
        )}
      </div>
      
      <form onSubmit={handleSendMessage} className="chat-input-container p-4 bg-white border-t border-gray-200 sticky bottom-0">
        <div className="flex items-center bg-gray-100 rounded-full px-4 py-2">
          <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your question here..."
            className="flex-1 bg-transparent border-none focus:outline-none text-gray-700"
            disabled={sendMessageMutation.isPending}
          />
          <button
            type="submit"
            disabled={!message.trim() || sendMessageMutation.isPending}
            className={`ml-2 p-2 rounded-full ${message.trim() && !sendMessageMutation.isPending ? 'bg-primary-600 text-white' : 'bg-gray-300 text-gray-500'} transition-colors`}
            aria-label="Send message"
          >
            <FiSend size={18} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;