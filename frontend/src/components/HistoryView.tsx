import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { FiLoader, FiFileText, FiCalendar, FiArrowLeft, FiInfo } from 'react-icons/fi';
import documentService from '../api/documentService';

interface HistoryViewProps {
  onBack: () => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ onBack }) => {
  const { data: history, isLoading, error } = useQuery({
    queryKey: ['analyses-history'],
    queryFn: documentService.getAnalysesHistory,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="spinner mr-3"></div>
        <span className="text-gray-600 font-medium animate-pulse">Loading history...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="bg-danger-50 text-danger-700 p-4 rounded-lg mb-6 max-w-md w-full flex items-center">
          <FiInfo className="h-5 w-5 mr-2 flex-shrink-0" />
          <p>Error loading history. Please try again later.</p>
        </div>
        <button
          onClick={onBack}
          className="btn btn-primary flex items-center"
        >
          <FiArrowLeft className="mr-2" /> Back to Documents
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto w-full animate-fade-in">
      <div className="bg-white shadow-card rounded-xl p-6 border border-gray-100">
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <FiCalendar className="mr-2 text-primary-600" />
            Analysis History
          </h2>
          <button
            onClick={onBack}
            className="btn btn-secondary flex items-center"
          >
            <FiArrowLeft className="mr-1.5" /> Back
          </button>
        </div>

        {history && history.length > 0 ? (
          <div className="space-y-4">
            {history.map((item: any, index: number) => (
              <div 
                key={index} 
                className="card card-hover p-5 transition-all duration-200"
              >
                <div className="flex items-center mb-3">
                  <div className="p-2 bg-primary-50 rounded-lg mr-3">
                    <FiFileText className="h-5 w-5 text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{item.document.filename}</h3>
                    <div className="flex items-center text-sm text-gray-500">
                      <FiCalendar className="mr-1 h-3 w-3" />
                      <span>{new Date(item.analysis.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 pl-10">
                  <h4 className="font-medium text-gray-700 mb-1">Summary:</h4>
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <p className="text-sm text-gray-700 whitespace-pre-line">{item.analysis.summary}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <div className="bg-gray-100 p-4 rounded-full mb-4">
              <FiInfo className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-lg font-medium mb-1">No analysis history found</p>
            <p className="text-sm text-gray-500">Analyze some documents to see your history here</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryView;