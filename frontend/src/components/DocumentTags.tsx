import React, { useState, useEffect } from 'react';
import { FiX, FiPlus } from 'react-icons/fi';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import documentService from '../api/documentService';

interface DocumentTagsProps {
  documentId: number;
  initialTags?: string[];
}

const DocumentTags: React.FC<DocumentTagsProps> = ({ documentId, initialTags = [] }) => {
  const [tags, setTags] = useState<string[]>(initialTags);
  const [newTag, setNewTag] = useState('');
  const queryClient = useQueryClient();
  
  useEffect(() => {
    if (initialTags) {
      setTags(initialTags);
    }
  }, [initialTags]);
  
  const updateTagsMutation = useMutation({
    mutationFn: (tags: string[]) => documentService.updateTags(documentId, tags),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document', documentId] });
    },
  });
  
  const handleAddTag = () => {
    if (!newTag.trim()) return;
    
    const updatedTags = [...tags, newTag.trim()];
    setTags(updatedTags);
    updateTagsMutation.mutate(updatedTags);
    setNewTag('');
  };
  
  const handleRemoveTag = (index: number) => {
    const updatedTags = tags.filter((_, i) => i !== index);
    setTags(updatedTags);
    updateTagsMutation.mutate(updatedTags);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };
  
  return (
    <div className="mt-4">
      <h3 className="text-sm font-medium text-gray-700 mb-2">Tags</h3>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag, index) => (
          <div 
            key={index} 
            className="bg-primary-100 text-primary-800 px-2 py-1 rounded-full text-sm flex items-center"
          >
            {tag}
            <button 
              onClick={() => handleRemoveTag(index)}
              className="ml-1 text-primary-600 hover:text-primary-800"
            >
              <FiX size={14} />
            </button>
          </div>
        ))}
      </div>
      <div className="flex">
        <input
          type="text"
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add a tag"
          className="flex-1 border border-gray-300 rounded-l-md px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
        <button
          onClick={handleAddTag}
          disabled={!newTag.trim()}
          className="bg-primary-600 text-white px-2 py-1 rounded-r-md hover:bg-primary-700 disabled:bg-gray-400 transition-colors"
        >
          <FiPlus size={16} />
        </button>
      </div>
    </div>
  );
};

export default DocumentTags;