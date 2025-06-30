import React, { useState, useEffect } from 'react';
import { FaEye, FaEyeSlash, FaArrowRight, FaCheck, FaTimes } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import Notification from '../Components/Notification';
import { useAuth } from '../context/AuthContext';

// Authentication form component for Sign In and Sign Up
const AuthForm = () => {
  // State variables for managing form behavior and data
  const [activeTab, setActiveTab] = useState('signin'); // Track active tab (signin/signup)
  const [showPassword, setShowPassword] = useState(false); // Toggle password visibility
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // Toggle confirm password visibility
  const [values, setValues] = useState({ email: '', password: '', confirmPassword: '' }); // Form values
  const [errors, setErrors] = useState({}); // Form validation errors
  const [notification, setNotification] = useState({ message: '', type: '' }); // Notification state
  const [passwordRequirements, setPasswordRequirements] = useState({
    lowercase: false,
    uppercase: false,
    number: false,
    special: false,
    length: false
  }); // Password strength requirements

  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Get the intended destination from location state (if any)
  const from = location.state?.from || '/';

  // Validate form inputs
  const validate = () => {
    let tempErrors = {};

    // Validate email
    if (!values.email) tempErrors.email = 'Email is required';

    // Validate password
    if (!values.password) tempErrors.password = 'Password is required';

    // Password strength validation for signup
    if (activeTab === 'signup') {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(values.password)) {
        tempErrors.password = 'Password must meet the requirements';
      }

      // Confirm password validation
      if (values.password !== values.confirmPassword) {
        tempErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  // Function to handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues({ ...values, [name]: value });

    // Update password strength requirements dynamically
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

    // Validate inputs before proceeding
    if (!validate()) return;

    try {
      // Send form data to the server (signin or signup)
      const response = await axios.post(`http://localhost:3000/api/auth/${activeTab}`, values);
      console.log('Response from server:', response.data); // Log the response data

      // Show success notification
      setNotification({ message: response.data.message, type: 'success' });

      // If the response is successful, store user data and token in context
      if (response.status === 200) {
        const userData = {
          id: response.data.userId,
          email: values.email,
          role: response.data.role
        };

        // Use the login function from AuthContext
        login(userData, response.data.token);

        // Navigate based on user role or to the original destination
        setTimeout(() => {
          const role = response.data.role;
          console.log('Navigating to:', role === 'admin' ? '/admin' : role === 'delivery_partner' ? '/delivery' : from); // Log navigation path

          if (role === 'admin') {
            navigate('/admin');
          } else if (role === 'delivery_partner') {
            navigate('/delivery');
          } else {
            // If user was redirected from /checkout or /payment, send to /cart
            if (from === '/checkout' || from === '/payment') {
              navigate('/cart', { replace: true });
            } else {
              // Otherwise, go to the original destination or home
              navigate(from, { replace: true });
            }
          }
        }, 2000);
      }
    } catch (error) {
      // Handle errors and show error notification
      if (error.response && error.response.data.message) {
        setNotification({ message: error.response.data.message, type: 'error' });
      } else {
        setNotification({ message: 'An error occurred. Please try again.', type: 'error' });
      }
    }
  };

  // Check if all password requirements are met
  const allRequirementsMet = Object.values(passwordRequirements).every(requirement => requirement);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-200 to-blue-950">
      {/* Notification component for displaying messages */}
      <Notification
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification({ message: '', type: '' })}
      />

      {/* Header section */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-black">
          {activeTab === 'signin' ? 'Sign in' : 'Sign up'}
        </h1>
        {/* Show info if redirected from a protected route */}
        {location.state?.from && (
          <p className="text-sm text-red-700 font-semibold mt-2">
            Please sign in to access {location.state.from.replace(/^\//, '')}
          </p>
        )}
      </div>

      {/* Form container */}
      <div className="bg-white p-5 rounded-lg shadow-lg w-full max-w-md overflow-hidden">
        {/* Tab navigation for Sign In and Sign Up */}
        <div className="flex border-b">
          <button
            className={`w-1/2 py-3 text-center font-medium ${activeTab === 'signin' ? 'border-b-2 cursor-pointer border-orange-500 text-orange-500' : 'text-gray-500 cursor-pointer'}`}
            onClick={() => setActiveTab('signin')}
          >
            Sign In
          </button>
          <button
            className={`w-1/2 py-3 text-center font-medium ${activeTab === 'signup' ? 'border-b-2 cursor-pointer border-orange-500 text-orange-500' : 'text-gray-500 cursor-pointer'}`}
            onClick={() => setActiveTab('signup')}
          >
            Sign Up
          </button>
        </div>

        {/* Form content */}
        <div className="p-6">
          {/* Sign In form */}
          {activeTab === 'signin' && (
            <form onSubmit={handleSubmit}>
              {/* Email input */}
              <div className="mb-4">
                <label className="block text-sm text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  name='email'
                  onChange={handleChange}
                  required
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              {/* Password input */}
              <div className="mb-6 relative">
                <div className="mb-1">
                  <label className="block text-sm text-gray-700">Password</label>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    name='password'
                    onChange={handleChange}
                    required
                  />
                  {/* Toggle password visibility */}
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

              {/* Submit button */}
              <button
                type="submit"
                className="w-full hover:bg-amber-500 bg-amber-600 cursor-pointer text-white py-2 rounded-md font-medium flex items-center justify-center"
              >
                SIGN IN
                <FaArrowRight className="h-4 w-4 ml-2" />
              </button>

              {/* Sign Up link */}
              <p className="mt-4 text-sm text-gray-600">
                Don't have an account?{' '}
                <a href="#" className="text-blue-500 hover:underline" onClick={() => setActiveTab('signup')}>
                  Sign Up
                </a>
              </p>

            </form>
          )}

          {/* Sign Up form */}
          {activeTab === 'signup' && (
            <form onSubmit={handleSubmit}>
              {/* Email input */}
              <div className="mb-4">
                <label className="block text-sm text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  name='email'
                  onChange={handleChange}
                  required
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              {/* Password input */}
              <div className="mb-4 relative">
                <label className="block text-sm text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    name='password'
                    onChange={handleChange}
                    required
                  />
                  {/* Toggle password visibility */}
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

              {/* Password requirements */}
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

              {/* Confirm password input */}
              <div className="mb-6 relative">
                <label className="block text-sm text-gray-700 mb-1">Re-enter Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    name='confirmPassword'
                    onChange={handleChange}
                    required
                  />
                  {/* Toggle confirm password visibility */}
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

              {/* Submit button */}
              <button
                type="submit"
                className="w-full hover:bg-amber-500 bg-amber-600 cursor-pointer text-white py-2 rounded-md font-medium flex items-center justify-center"
              >
                SIGN UP
                <FaArrowRight className="h-4 w-4 ml-2" />
              </button>

              {/* Sign in link */}
              <p className="mt-4 text-sm text-gray-600">
                Already have an account?{' '}
                <a href="#" className="text-blue-500 hover:underline" onClick={() => setActiveTab('signin')}>
                  Sign In
                </a>
              </p>

            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthForm;