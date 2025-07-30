import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FiFileText, FiLoader, FiMessageSquare, FiDownload, FiArrowLeft, FiCpu } from 'react-icons/fi';
import documentService, { type DocumentDetail, type Analysis } from '../api/documentService';

interface DocumentViewerProps {
  documentId: number;
  onBack: () => void;
  onChat: (documentId: number) => void;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ documentId, onBack, onChat }) => {
  const [showAnalysis, setShowAnalysis] = useState(false);

  const {
    data: document,
    isLoading: isLoadingDoc,
    isError: isDocError,
  } = useQuery<DocumentDetail>({
    queryKey: ['document', documentId],
    queryFn: () => documentService.getDocument(documentId),
  });

  const {
    data: analysis,
    isLoading: isLoadingAnalysis,
    isError: isAnalysisError,
    refetch: refetchAnalysis
  } = useQuery<Analysis>({
    queryKey: ['analysis', documentId],
    queryFn: () => documentService.analyzeDocument(documentId),
    enabled: showAnalysis,
  });

  const handleAnalyze = () => {
    setShowAnalysis(true);
    refetchAnalysis();
  };

  const handleDownloadSummary = async () => {
    try {
      await documentService.downloadSummary(documentId);
    } catch (error) {
      console.error('Error downloading summary:', error);
    }
  };

  const renderTopics = () => {
    if (!analysis || analysis.key_topics === '[]') return null;
    try {
      const topics = JSON.parse(analysis.key_topics);
      return (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2 text-gray-800">Key Topics</h3>
          <div className="flex flex-wrap gap-2">
            {topics.map((topic: string, idx: number) => (
              <span 
                key={idx} 
                className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm font-medium"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
      );
    } catch {
      return null;
    }
  };

  if (isLoadingDoc) {
    return (
      <div className="flex justify-center items-center h-64 animate-pulse-slow">
        <FiLoader className="animate-spin h-12 w-12 text-primary-500" />
        <span className="ml-3 text-gray-600 font-medium">Loading document...</span>
      </div>
    );
  }

  if (isDocError || !document) {
    return (
      <div className="text-center py-8 text-danger-500 bg-danger-50 rounded-lg p-6 border border-danger-200">
        <p className="font-medium text-lg">Error loading document</p>
        <p className="mt-2 mb-6">The document could not be loaded. Please try again later.</p>
        <button
          onClick={onBack}
          className="btn btn-primary inline-flex items-center"
        >
          <FiArrowLeft className="mr-2" />
          Back to Documents
        </button>
      </div>
    );
  }

  return (
    <div className="document-viewer animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold flex items-center text-primary-700">
          <FiFileText className="mr-2 flex-shrink-0" />
          <span className="truncate">{document.filename}</span>
        </h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onChat(documentId)}
            className="btn btn-primary flex items-center"
          >
            <FiMessageSquare className="mr-1" /> Chat
          </button>
          <button
            onClick={onBack}
            className="btn btn-secondary flex items-center"
          >
            <FiArrowLeft className="mr-1" /> Back
          </button>
        </div>
      </div>

      {!showAnalysis ? (
        <>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 max-h-96 overflow-y-auto mb-6 shadow-inner">
            <pre className="whitespace-pre-wrap font-sans text-gray-800">{document.content}</pre>
          </div>
          <div className="flex justify-center">
            <button
              onClick={handleAnalyze}
              className="btn btn-primary flex items-center text-lg px-6 py-3"
            >
              <FiCpu className="mr-2" /> Summarize Document
            </button>
          </div>
        </>
      ) : (
        <div>
          {isLoadingAnalysis ? (
            <div className="flex flex-col items-center justify-center h-64 animate-pulse-slow">
              <FiLoader className="animate-spin h-12 w-12 text-primary-500 mb-4" />
              <p className="text-gray-700 font-medium">Analyzing document...</p>
              <p className="text-sm text-gray-500 mt-1">This may take a moment</p>
            </div>
          ) : analysis ? (
            <>
              <div className="mb-4">
                <button
                  onClick={() => setShowAnalysis(false)}
                  className="btn btn-secondary flex items-center"
                >
                  <FiFileText className="mr-1" /> View Original Document
                </button>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-800">Summary</h3>
                  <button
                    onClick={handleDownloadSummary}
                    className="flex items-center text-primary-600 hover:text-primary-800 transition-colors px-3 py-1 rounded-lg hover:bg-primary-50"
                    title="Download Summary"
                  >
                    <FiDownload className="mr-1" /> Download
                  </button>
                </div>
                <div className="prose prose-primary max-w-none">
                  <p className="whitespace-pre-line text-gray-700">{analysis.summary}</p>
                </div>
                {renderTopics()}
              </div>
            </>
          ) : isAnalysisError ? (
            <div className="text-center py-8 bg-danger-50 rounded-lg border border-danger-200 p-6">
              <p className="text-danger-700 font-medium mb-4">Failed to load analysis</p>
              <button
                onClick={handleAnalyze}
                className="btn btn-primary"
              >
                Try Again
              </button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default DocumentViewer;
