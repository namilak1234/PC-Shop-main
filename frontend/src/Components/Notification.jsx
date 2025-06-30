import React from 'react';

// Notification component definition
const Notification = ({ message, type, onClose }) => {
  // If there is no message, do not render the component
  if (!message) return null;

  return (
    <div
      className={`fixed top-4 right-4 p-4 rounded shadow-lg z-50 ${
        type === 'success'
          ? 'bg-white border-green-600 text-green-600 px-10 rounded-lg'
          : 'bg-white border-red-600 text-red-600 px-10 rounded-lg'
      }`}
    >
      {/* Container for the notification message and close button */}
      <div className="flex justify-between items-center">
        {/* Display the notification message */}
        <span>{message}</span>
        {/* Close button to dismiss the notification */}
        <button onClick={onClose} className="ml-4 text-xl font-bold">&times;</button>
      </div>
    </div>
  );
};

export default Notification;
