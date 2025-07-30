import React from 'react';
import { FiFileText, FiMessageSquare, FiClock, FiLogOut } from 'react-icons/fi';

interface HeaderProps {
  onNavigate: (view: string) => void;
  currentView: string;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ onNavigate, currentView, onLogout }) => {
  return (
    <header className="bg-primary-700 text-Black shadow-md sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3 flex flex-col md:flex-row md:justify-between md:items-center">
        <div className="flex justify-between items-center mb-2 md:mb-0">
          <h1 className="text-2xl font-bold flex items-center">
            <svg 
              className="w-8 h-8 mr-2" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                d="M9 12H15M9 16H15M17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H12.5858C12.851 3 13.1054 3.10536 13.2929 3.29289L18.7071 8.70711C18.8946 8.89464 19 9.149 19 9.41421V19C19 20.1046 18.1046 21 17 21Z" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
              <path 
                d="M13 3V7C13 8.10457 13.8954 9 15 9H19" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
            AI Document Analyzer
          </h1>
          <div className="md:hidden">
            {/* Mobile menu button would go here */}
          </div>
        </div>
        <nav className="flex flex-col md:flex-row md:items-center md:space-x-1">
          <ul className="flex flex-wrap justify-center space-x-1">
            <li>
              <button 
                onClick={() => onNavigate('list')}
                className={`flex items-center px-3 py-2 rounded-lg transition-colors ${currentView === 'list' 
                  ? 'bg-primary-600 text-Black' 
                  : 'hover:bg-primary-600/50 text-primary-100'}`}
              >
                <FiFileText className="mr-1" />
                Documents
              </button>
            </li>
            <li>
              <button 
                onClick={() => onNavigate('multi-qa')}
                className={`flex items-center px-3 py-2 rounded-lg transition-colors ${currentView === 'multi-qa' 
                  ? 'bg-primary-600 text-Black' 
                  : 'hover:bg-primary-600/50 text-primary-100'}`}
              >
                <FiMessageSquare className="mr-1" />
                Multi-Doc Q&A
              </button>
            </li>
            <li>
              <button 
                onClick={() => onNavigate('history')}
                className={`flex items-center px-3 py-2 rounded-lg transition-colors ${currentView === 'history' 
                  ? 'bg-primary-600 text-Black' 
                  : 'hover:bg-primary-600/50 text-primary-100'}`}
              >
                <FiClock className="mr-1" />
                History
              </button>
            </li>
          </ul>
          <div className="mt-2 md:mt-0 md:ml-4 flex justify-center">
            <button 
              onClick={onLogout}
              className="flex items-center px-3 py-2 text-primary-100 hover:bg-primary-600/50 rounded-lg transition-colors"
            >
              <FiLogOut className="mr-1" />
              Logout
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;