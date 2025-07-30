import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUpload, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import documentService from '../api/documentService';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const FileUpload: React.FC = () => {
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const queryClient = useQueryClient();
  
  const uploadMutation = useMutation({
    mutationFn: (file: File) => documentService.uploadDocument(file),
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
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setUploadStatus('uploading');
      uploadMutation.mutate(acceptedFiles[0]);
    }
  }, [uploadMutation]);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
    },
    maxFiles: 1,
  });
  
  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-300 ${
          isDragActive 
            ? 'border-primary-500 bg-primary-50' 
            : uploadStatus === 'success'
              ? 'border-success-500 bg-success-50'
              : uploadStatus === 'error'
                ? 'border-danger-500 bg-danger-50'
                : 'border-gray-300 hover:border-primary-400'
        }`}
      >
        <input {...getInputProps()} />
        
        {uploadStatus === 'uploading' ? (
          <div className="flex flex-col items-center animate-pulse-slow">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mb-4"></div>
            <p className="text-lg font-medium">Uploading document...</p>
            <p className="text-sm text-gray-500 mt-1">Please wait while we process your file</p>
          </div>
        ) : uploadStatus === 'success' ? (
          <div className="flex flex-col items-center text-success-700 animate-fade-in">
            <FiCheckCircle className="h-12 w-12 mb-4" />
            <p className="text-lg font-medium">Document uploaded successfully!</p>
            <p className="text-sm mt-1">Your document is now available in your library</p>
          </div>
        ) : uploadStatus === 'error' ? (
          <div className="flex flex-col items-center text-danger-700 animate-fade-in">
            <FiAlertCircle className="h-12 w-12 mb-4" />
            <p className="text-lg font-medium">Error uploading document</p>
            <p className="text-sm mt-1">Please try again or use a different file</p>
          </div>
        ) : (
          <div className="flex flex-col items-center group animate-fade-in">
            <div className="h-12 w-12 text-gray-400 mb-4 group-hover:text-primary-500 transition-colors duration-300">
              <FiUpload className="h-full w-full" />
            </div>
            <p className="text-lg font-medium group-hover:text-primary-700 transition-colors duration-300">
              {isDragActive ? 'Drop the file here' : 'Drag & drop a document, or click to select'}
            </p>
            <p className="text-sm text-gray-500 mt-2 group-hover:text-primary-600 transition-colors duration-300">
              Supports PDF, DOCX, and TXT files
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;