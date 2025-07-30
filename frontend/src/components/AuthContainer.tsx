import React, { useState } from 'react';
import Login from './Login';
import Signup from './Signup';

interface AuthContainerProps {
  onAuthSuccess: () => void;
}

const AuthContainer: React.FC<AuthContainerProps> = ({ onAuthSuccess }) => {
  const [showLogin, setShowLogin] = useState(true);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-card border border-gray-100 animate-slide-up">
        <div>
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-primary-600 text-white rounded-2xl flex items-center justify-center shadow-lg transform -rotate-3 transition-transform hover:rotate-0 duration-300">
              <svg 
                className="w-12 h-12" 
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
            </div>
          </div>
          <h1 className="mt-6 text-3xl font-extrabold text-center text-gray-900 flex flex-col items-center">
            <span className="bg-clip-text text-Black bg-gradient-to-r from-primary-600 to-primary-800">AI Document Analyzer</span>
            <div className="h-1 w-16 bg-primary-600 rounded-full mt-2"></div>
          </h1>
          <p className="mt-3 text-center text-gray-600">
            {showLogin ? 'Sign in to your account' : 'Create a new account'}
          </p>
        </div>
        
        <div className="mt-8 transition-all duration-300 transform">
          {showLogin ? (
            <Login 
              onLoginSuccess={onAuthSuccess} 
              onSwitchToSignup={() => setShowLogin(false)} 
            />
          ) : (
            <Signup 
              onSignupSuccess={() => setShowLogin(true)} 
              onSwitchToLogin={() => setShowLogin(true)} 
            />
          )}
        </div>
        
        <div className="mt-6 text-center text-xs text-gray-500">
          <p>© {new Date().getFullYear()} AI Document Analyzer. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default AuthContainer;