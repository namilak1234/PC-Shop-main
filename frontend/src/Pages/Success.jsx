import React from 'react';
import Nav from '../Components/Nav';

const success = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-white">
        <Nav/>
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="relative">
            <svg 
              className="w-16 h-16 text-green-400" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect 
                x="3" 
                y="3" 
                width="18" 
                height="18" 
                rx="2" 
                stroke="currentColor" 
                strokeWidth="2" 
                fill="none"
              />
              <path 
                d="M7 8H14" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round"
              />
              <path 
                d="M7 12H12" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round"
              />
              <path 
                d="M7 16H10" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round"
              />
              <circle 
                cx="17" 
                cy="17" 
                r="5" 
                fill="currentColor"
                stroke="white"
                strokeWidth="1"
              />
              <path 
                d="M15 17L16.5 18.5L19 16" 
                stroke="white" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-green-400 mb-1">Congratulations!</h1>
        <p className="text-xl text-green-400">Your Order Submitted.</p>
      </div>
    </div>
  );
};

export default success;