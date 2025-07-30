import React, { useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import { useQuery } from '@tanstack/react-query';
import documentService from '../api/documentService';

interface SearchBarProps {
  onResultClick: (documentId: number) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onResultClick }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  const { data: searchResults, refetch, isLoading } = useQuery({
    queryKey: ['search', searchQuery],
    queryFn: () => documentService.searchDocuments(searchQuery),
    enabled: false,
  });
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    refetch().then(() => {});
  };
  
  const handleResultClick = (documentId: number) => {
    onResultClick(documentId);
    setIsSearching(false);
    setSearchQuery('');
  };
  
  return (
    <div className="relative">
      <form onSubmit={handleSearch} className="flex items-center">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
        <button
          type="submit"
          className="ml-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          disabled={!searchQuery.trim() || isLoading}
        >
          {isLoading ? 'Searching...' : 'Search'}
        </button>
      </form>
      
      {isSearching && searchResults && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {searchResults.length > 0 ? (
            <ul>
              {searchResults.map((doc) => (
                <li key={doc.id} className="border-b border-gray-200 last:border-b-0">
                  <button
                    onClick={() => handleResultClick(doc.id)}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors"
                  >
                    <div className="font-medium">{doc.filename}</div>
                    <div className="text-sm text-gray-500">{doc.file_type} • {new Date(doc.upload_date).toLocaleDateString()}</div>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-3 text-gray-500">No results found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;