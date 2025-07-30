import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiFile, FiFilePlus, FiFileText, FiTrash2, FiEye, FiMessageSquare, FiSearch, FiX } from 'react-icons/fi';
import documentService, { type Document } from '../api/documentService';

interface DocumentListProps {
  onViewDocument: (documentId: number) => void;
  onChatWithDocument: (documentId: number) => void;
}

const DocumentList: React.FC<DocumentListProps> = ({ onViewDocument, onChatWithDocument }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();
  
  const { data: documents, isLoading, error } = useQuery({
    queryKey: ['documents'],
    queryFn: documentService.getDocuments,
  });
  
  const deleteMutation = useMutation({
    mutationFn: (id: number) => documentService.deleteDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
  
  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      deleteMutation.mutate(id);
    }
  };
  
  const getFileIcon = (fileType: string) => {
    switch(fileType.toLowerCase()) {
      case 'pdf':
        return <FiFilePlus className="h-5 w-5 text-danger-500" />;
      case 'docx':
        return <FiFileText className="h-5 w-5 text-primary-500" />;
      case 'txt':
        return <FiFile className="h-5 w-5 text-gray-500" />;
      default:
        return <FiFile className="h-5 w-5" />;
    }
  };

  const filteredDocuments = documents?.filter((doc: Document) => 
    doc.filename.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="spinner"></div>
        <span className="ml-3 text-gray-600">Loading documents...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center py-8 text-danger-500 bg-danger-50 rounded-lg p-4 border border-danger-200">
        <p className="font-medium">Error loading documents</p>
        <p className="text-sm mt-1">Please try refreshing the page</p>
      </div>
    );
  }
  
  return (
    <div className="animate-fade-in">
      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FiSearch className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="input-field pl-10 pr-10"
          placeholder="Search documents..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={() => setSearchTerm('')}
          >
            <FiX className="h-5 w-5 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {!documents || documents.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <FiFile className="h-12 w-12 mx-auto text-gray-400 mb-3" />
          <p className="text-gray-600 font-medium">No documents found</p>
          <p className="text-sm text-gray-500 mt-1">Upload a document to get started</p>
        </div>
      ) : filteredDocuments?.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-600">No documents match your search</p>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uploaded</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDocuments?.map((doc: Document) => (
                  <tr key={doc.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getFileIcon(doc.file_type)}
                        <span className="ml-2 font-medium text-gray-900">{doc.filename}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        {doc.file_type.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(doc.upload_date).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => onViewDocument(doc.id)}
                          className="text-primary-600 hover:text-primary-900 transition-colors"
                          title="View Document"
                        >
                          <FiEye className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => onChatWithDocument(doc.id)}
                          className="text-success-500 hover:text-success-700 transition-colors"
                          title="Chat with Document"
                        >
                          <FiMessageSquare className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(doc.id)}
                          className="text-danger-500 hover:text-danger-700 transition-colors"
                          title="Delete Document"
                        >
                          <FiTrash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentList;