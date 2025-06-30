import React, { useState } from 'react';
import axios from 'axios';
import { FaEye, FaEyeSlash, FaCheck, FaTimes } from 'react-icons/fa';
import Notification from '../Components/Notification'; // Import the Notification component

const CreateAccount = ({ role }) => {
  // State to manage form values
  const [values, setValues] = useState({ email: '', password: '', confirmPassword: '' });

  // State to manage form validation errors
  const [errors, setErrors] = useState({});

  // State to toggle password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // State to track password requirements
  const [passwordRequirements, setPasswordRequirements] = useState({
    lowercase: false,
    uppercase: false,
    number: false,
    special: false,
    length: false
  });

  // State to manage notifications (success or error messages)
  const [notification, setNotification] = useState({ message: '', type: '' });

  // Function to validate form inputs
  const validate = () => {
    let tempErrors = {};

    // Check if email is provided
    if (!values.email) tempErrors.email = 'Email is required';

    // Check if password is provided
    if (!values.password) tempErrors.password = 'Password is required';

    // Validate password against regex for requirements
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(values.password)) {
      tempErrors.password = 'Password must meet the requirements';
    }

    // Check if passwords match
    if (values.password !== values.confirmPassword) {
      tempErrors.confirmPassword = 'Passwords do not match';
    }

    // Update errors state
    setErrors(tempErrors);

    // Return true if no errors, false otherwise
    return Object.keys(tempErrors).length === 0;
  };

  // Function to handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Update form values
    setValues({ ...values, [name]: value });

    // Update password requirements if password field is being updated
    if (name === 'password') {
      const lowercase = /[a-z]/.test(value);
      const uppercase = /[A-Z]/.test(value);
      const number = /\d/.test(value);
      const special = /[@$!%*?&]/.test(value);
      const length = value.length >= 8;
      setPasswordRequirements({ lowercase, uppercase, number, special, length });
    }
  };

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous notifications
    setNotification({ message: '', type: '' });

    // Validate form inputs
    if (!validate()) return;

    try {
      // Send signup request to the server
      const response = await axios.post('http://localhost:3000/api/auth/signup', {
        ...values,
        role
      });

      // Show success notification
      setNotification({ message: response.data.message, type: 'success' });

      // Reset form values and password requirements
      setValues({ email: '', password: '', confirmPassword: '' });
      setPasswordRequirements({
        lowercase: false,
        uppercase: false,
        number: false,
        special: false,
        length: false
      });
    } catch (error) {
      // Show error notification if request fails
      if (error.response && error.response.data.message) {
        setNotification({ message: error.response.data.message, type: 'error' });
      }
    }
  };

  // Check if all password requirements are met
  const allRequirementsMet = Object.values(passwordRequirements).every(requirement => requirement);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      {/* Notification Component */}
      <Notification
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification({ message: '', type: '' })} // Clear notification on close
      />

      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-3">Create {role === 'admin' ? 'Admin' : 'Delivery Partner'} Account</h1>
      </div>

      <div className="bg-white p-5 rounded-lg shadow-lg w-full max-w-md overflow-hidden">
        <div className="p-6">
          <form onSubmit={handleSubmit}>
            {/* Email Input */}
            <div className="mb-4">
              <label className="block text-sm text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                name="email"
                onChange={handleChange}
                value={values.email}
                required
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            {/* Password Input */}
            <div className="mb-4 relative">
              <label className="block text-sm text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  name="password"
                  onChange={handleChange}
                  value={values.password}
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash className="h-5 w-5 text-gray-500" /> : <FaEye className="h-5 w-5 text-gray-500" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            {/* Password Requirements */}
            {!allRequirementsMet && (
              <div className="mb-4">
                <h3 className="text-sm text-gray-700 mb-2">Password must contain the following:</h3>
                <ul className="space-y-1">
                  <li className="flex items-center">
                    {passwordRequirements.lowercase ? <FaCheck className="text-green-500 mr-2" /> : <FaTimes className="text-red-500 mr-2" />}
                    <span>A lowercase letter</span>
                  </li>
                  <li className="flex items-center">
                    {passwordRequirements.uppercase ? <FaCheck className="text-green-500 mr-2" /> : <FaTimes className="text-red-500 mr-2" />}
                    <span>A capital (uppercase) letter</span>
                  </li>
                  <li className="flex items-center">
                    {passwordRequirements.number ? <FaCheck className="text-green-500 mr-2" /> : <FaTimes className="text-red-500 mr-2" />}
                    <span>A number</span>
                  </li>
                  <li className="flex items-center">
                    {passwordRequirements.special ? <FaCheck className="text-green-500 mr-2" /> : <FaTimes className="text-red-500 mr-2" />}
                    <span>A special character</span>
                  </li>
                  <li className="flex items-center">
                    {passwordRequirements.length ? <FaCheck className="text-green-500 mr-2" /> : <FaTimes className="text-red-500 mr-2" />}
                    <span>Minimum 8 characters</span>
                  </li>
                </ul>
              </div>
            )}

            {/* Confirm Password Input */}
            <div className="mb-6 relative">
              <label className="block text-sm text-gray-700 mb-1">Re-enter Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  name="confirmPassword"
                  onChange={handleChange}
                  value={values.confirmPassword}
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FaEyeSlash className="h-5 w-5 text-gray-500" /> : <FaEye className="h-5 w-5 text-gray-500" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full hover:bg-green-700 bg-green-800 cursor-pointer text-white py-2 rounded-md font-medium flex items-center justify-center"
            >
              CREATE ACCOUNT
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateAccount;