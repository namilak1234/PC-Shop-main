import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-200 to-blue-950 text-center px-4">
      <h1 className="text-5xl font-bold text-white mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-white mb-6">Page Not Found</h2>
      <p className="text-gray-200 mb-8">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link 
        to="/" 
        className="bg-amber-600 hover:bg-amber-500 text-white font-medium py-2 px-6 rounded-md flex items-center"
      >
        Back to Home
      </Link>
    </div>
  );
};

export default NotFound;