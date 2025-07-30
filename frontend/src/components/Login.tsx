import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { FiUser, FiLock, FiAlertCircle } from 'react-icons/fi';
import authService from '../services/authService';

interface LoginProps {
  onLoginSuccess: () => void;
  onSwitchToSignup: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess, onSwitchToSignup }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      authService.setToken(data.access_token);
      onLoginSuccess();
    },
    onError: (error: any) => {
      setError(error.response?.data?.detail || 'Login failed. Please try again.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username || !password) {
      setError('Username and password are required');
      return;
    }
    loginMutation.mutate({ username, password });
  };

  return (
    <div className="mt-6">
      {error && (
        <div className="mb-4 p-3 bg-danger-50 text-danger-700 rounded-lg flex items-start">
          <FiAlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="username" className="label">
            Username
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiUser className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-field pl-10"
              placeholder="Enter your username"
            />
          </div>
        </div>
        <div>
          <label htmlFor="password" className="label">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiLock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field pl-10"
              placeholder="Enter your password"
            />
          </div>
        </div>
        <button
          type="submit"
          className="btn btn-primary w-full flex justify-center items-center"
          disabled={loginMutation.isPending}
        >
          {loginMutation.isPending ? (
            <>
              <div className="spinner mr-2 h-4 w-4 border-2"></div>
              Logging in...
            </>
          ) : (
            'Login'
          )}
        </button>
      </form>
      <div className="mt-6 text-center">
        <p className="text-gray-600">
          Don't have an account?{' '}
          <button
            onClick={onSwitchToSignup}
            className="text-primary-600 hover:text-primary-800 font-medium focus:outline-none"
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;