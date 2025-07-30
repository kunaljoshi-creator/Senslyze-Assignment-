import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Header from './components/Header';
import FileUpload from './components/FileUpload';
import DocumentList from './components/DocumentList';
import DocumentViewer from './components/DocumentViewer';
import ChatInterface from './components/ChatInterface';
import MultiDocumentQA from './components/MultiDocumentQA';
import HistoryView from './components/HistoryView';
import AuthContainer from './components/AuthContainer';
import authService from './services/authService';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  const [view, setView] = useState<'list' | 'document' | 'chat' | 'multi-qa' | 'history'>('list');
  const [selectedDocumentId, setSelectedDocumentId] = useState<number | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      setIsLoading(true);
      const token = authService.getToken();
      if (token) {
        try {
          await authService.getCurrentUser();
          setIsAuthenticated(true);
        } catch (error) {
          authService.removeToken();
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const handleViewDocument = (documentId: number) => {
    setSelectedDocumentId(documentId);
    setView('document');
  };

  const handleChatWithDocument = (documentId: number) => {
    setSelectedDocumentId(documentId);
    setView('chat');
  };

  const handleBackToList = () => {
    setView('list');
    setSelectedDocumentId(null);
  };

  const handleLogout = () => {
    authService.removeToken();
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center animate-fade-in">
          <div className="spinner"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <QueryClientProvider client={queryClient}>
        <div className="animate-fade-in">
          <AuthContainer onAuthSuccess={() => setIsAuthenticated(true)} />
        </div>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header 
          onNavigate={(view) => setView(view as any)} 
          currentView={view}
          onLogout={handleLogout}
        />
        <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
          <div className="space-y-6 animate-fade-in">
            {view === 'list' && (
              <div className="space-y-6">
                <div className="card card-hover">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-6">Upload Document</h2>
                  <FileUpload />
                </div>
                <div className="card card-hover">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-6">Your Documents</h2>
                  <DocumentList
                    onViewDocument={handleViewDocument}
                    onChatWithDocument={handleChatWithDocument}
                  />
                </div>
              </div>
            )}
            {view === 'document' && selectedDocumentId && (
              <div className="card card-hover">
                <DocumentViewer
                  documentId={selectedDocumentId}
                  onBack={handleBackToList}
                  onChat={handleChatWithDocument}
                />
              </div>
            )}
            {view === 'chat' && selectedDocumentId && (
              <div className="card card-hover h-[calc(100vh-12rem)]">
                <ChatInterface
                  documentId={selectedDocumentId}
                  onBack={handleBackToList}
                />
              </div>
            )}
            {view === 'multi-qa' && (
              <div className="card card-hover">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Multi-Document Q&A</h2>
                <MultiDocumentQA onBack={handleBackToList} />
              </div>
            )}
            {view === 'history' && (
              <div className="card card-hover">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Analysis History</h2>
                <HistoryView onBack={handleBackToList} />
              </div>
            )}
          </div>
        </main>
        <footer className="bg-white border-t border-gray-200 py-4 text-center text-gray-500 text-sm">
          <p>AI Document Analyzer © {new Date().getFullYear()}</p>
        </footer>
      </div>
    </QueryClientProvider>
  );
}

export default App;
