import React, { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiLoader, FiUpload, FiCheckCircle, FiFileText } from 'react-icons/fi';
import { useDropzone } from 'react-dropzone';
import documentService, { type Document } from '../api/documentService';

interface MultiDocumentQAProps {
  onBack: () => void;
}

const MultiDocumentQA: React.FC<MultiDocumentQAProps> = ({ onBack }) => {
  const [selectedDocuments, setSelectedDocuments] = useState<number[]>([]);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [summary, setSummary] = useState<string | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const queryClient = useQueryClient();

  const { data: documents, isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: documentService.getDocuments,
  });

  const uploadMutation = useMutation({
    mutationFn: (files: File[]) => {
      // Upload files sequentially
      return Promise.all(files.map(file => documentService.uploadDocument(file)));
    },
    onSuccess: () => {
      setUploadStatus('success');
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      setTimeout(() => setUploadStatus('idle'), 3000);
    },
    onError: () => {
      setUploadStatus('error');
      setTimeout(() => setUploadStatus('idle'), 3000);
    },
  });

  const askQuestionMutation = useMutation({
    mutationFn: async ({ question, documentIds }: { question: string; documentIds: number[] }) => {
      const formData = new FormData();
      formData.append('question', question);
      documentIds.forEach(id => formData.append('document_ids', id.toString()));
      
      const response = await documentService.askMultiDocumentQuestion(formData);
      return response;
    },
    onSuccess: (data) => {
      setAnswer(data.content);
    },
  });

  const generateSummaryMutation = useMutation({
    mutationFn: async (documentIds: number[]) => {
      // This would ideally call a backend endpoint for multi-document summarization
      // For now, we'll use the existing single-document analysis for each document
      const analyses = await Promise.all(
        documentIds.map(id => documentService.analyzeDocument(id))
      );
      
      // Combine summaries
      return analyses.map(a => a.summary).join('\n\n');
    },
    onSuccess: (data) => {
      setSummary(data);
      setIsGeneratingSummary(false);
    },
    onError: () => {
      setIsGeneratingSummary(false);
    }
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setUploadStatus('uploading');
      uploadMutation.mutate(acceptedFiles);
    }
  }, [uploadMutation]);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
    },
    multiple: true,
  });

  const handleToggleDocument = (id: number) => {
    setSelectedDocuments(prev =>
      prev.includes(id) ? prev.filter(docId => docId !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim() && selectedDocuments.length > 0) {
      askQuestionMutation.mutate({ question, documentIds: selectedDocuments });
    }
  };

  const handleGenerateSummary = () => {
    if (selectedDocuments.length > 0) {
      setIsGeneratingSummary(true);
      setSummary(null);
      generateSummaryMutation.mutate(selectedDocuments);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center"><FiLoader className="animate-spin h-8 w-8" /></div>;
  }

  return (
    <div className="bg-white shadow rounded-lg p-6 mt-8 w-full max-w-800px">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Multi-Document Q&A</h2>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
        >
          Back
        </button>
      </div>

      {/* Document Upload Section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">Upload Documents</h3>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400'
          }`}
        >
          <input {...getInputProps()} />
          
          {uploadStatus === 'uploading' ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mb-4"></div>
              <p className="text-lg">Uploading documents...</p>
            </div>
          ) : uploadStatus === 'success' ? (
            <div className="flex flex-col items-center text-green-600">
              <FiCheckCircle className="h-12 w-12 mb-4" />
              <p className="text-lg">Documents uploaded successfully!</p>
            </div>
          ) : uploadStatus === 'error' ? (
            <div className="flex flex-col items-center text-red-600">
              <p className="text-lg">Error uploading documents. Please try again.</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <FiUpload className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-lg">
                {isDragActive ? 'Drop the files here' : 'Drag & drop documents, or click to select'}
              </p>
              <p className="text-sm text-gray-500 mt-2">Supports multiple PDF, DOCX, and TXT files</p>
            </div>
          )}
        </div>
      </div>

      {/* Document Selection Section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold">Select Documents</h3>
          {selectedDocuments.length > 0 && (
            <button
              onClick={handleGenerateSummary}
              disabled={isGeneratingSummary}
              className="px-4 py-2 bg-primary-600 text-Black rounded hover:bg-primary-700 disabled:bg-gray-400"
            >
              {isGeneratingSummary ? (
                <><FiLoader className="animate-spin h-5 w-5 inline mr-1" /> Generating Summary...</>
              ) : (
                'Generate Summary'
              )}
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {documents?.map((doc: Document) => (
            <div 
              key={doc.id} 
              className={`border p-3 rounded cursor-pointer flex items-center ${selectedDocuments.includes(doc.id) ? 'bg-primary-100 border-primary-500' : ''}`}
              onClick={() => handleToggleDocument(doc.id)}
            >
              <FiFileText className="mr-2" />
              <span className="font-medium">{doc.filename}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Section */}
      {summary && (
        <div className="mb-6 border p-4 rounded bg-gray-50">
          <h3 className="text-lg font-semibold mb-2">Combined Summary</h3>
          <p className="text-gray-700 whitespace-pre-line">{summary}</p>
        </div>
      )}

      {/* Question Form */}
      <div className="mb-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-lg font-semibold mb-2">Ask a Question</label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full border rounded p-2 min-h-[100px]"
              placeholder="Enter your question about the selected documents..."
              disabled={selectedDocuments.length === 0}
            />
          </div>
          <button
            type="submit"
            disabled={!question.trim() || selectedDocuments.length === 0 || askQuestionMutation.isPending}
            className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 disabled:bg-gray-400 disabled:text-black disabled:border disabled:border-gray-600"
          >
            {askQuestionMutation.isPending ? (
              <><FiLoader className="animate-spin h-5 w-5 inline mr-1" /> Processing...</>
            ) : (
              'Ask Question'
            )}
          </button>
        </form>
      </div>

      {/* Answer Section */}
      {answer && (
        <div className="border-t pt-4">
          <h3 className="text-lg font-semibold mb-2">Answer</h3>
          <div className="bg-gray-50 p-4 rounded">
            <p className="whitespace-pre-line">{answer}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiDocumentQA;