import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { FiFileText, FiLoader, FiClock } from 'react-icons/fi';
import documentService, { type Analysis, type Document } from '../api/documentService';

interface AnalysisHistoryProps {
  onViewDocument: (documentId: number) => void;
  onBack: () => void;
}

const AnalysisHistory: React.FC<AnalysisHistoryProps> = ({ onViewDocument, onBack }) => {
  const { data: analyses, isLoading } = useQuery({
    queryKey: ['analyses-history'],
    queryFn: documentService.getAnalysesHistory,
  });

  if (isLoading) {
    return <div className="flex justify-center"><FiLoader className="animate-spin h-8 w-8" /></div>;
  }

  return (
    <div className="bg-white shadow rounded-lg p-6 mt-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center">
          <FiClock className="mr-2" />
          Analysis History
        </h2>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
        >
          Back
        </button>
      </div>

      {analyses && analyses.length > 0 ? (
        <div className="space-y-4">
          {analyses.map((item: { analysis: Analysis, document: Document }) => (
            <div key={item.analysis.id} className="border rounded p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold flex items-center">
                  <FiFileText className="mr-2" />
                  {item.document.filename}
                </h3>
                <span className="text-sm text-gray-500">
                  {new Date(item.analysis.created_at).toLocaleString()}
                </span>
              </div>
              <p className="text-gray-700 line-clamp-3">{item.analysis.summary}</p>
              <button
                onClick={() => onViewDocument(item.document.id)}
                className="mt-2 px-3 py-1 bg-primary-600 text-white text-sm rounded hover:bg-primary-700"
              >
                View Document
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>No analysis history found.</p>
        </div>
      )}
    </div>
  );
};

export default AnalysisHistory;