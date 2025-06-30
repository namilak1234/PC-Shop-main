import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSearch, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

// AllUsers component definition
const AllUsers = () => {
  // State to manage the list of users
  const [users, setUsers] = useState([]);

  // State to manage the search term
  const [searchTerm, setSearchTerm] = useState('');

  // State to manage the current page for pagination
  const [currentPage, setCurrentPage] = useState(1);

  // State to manage loading status
  const [loading, setLoading] = useState(true);

  // State to manage error messages
  const [error, setError] = useState(null);

  // Number of users to display per page
  const usersPerPage = 10;

  // Fetch users from the API when the component mounts
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/auth/users');
        setUsers(response.data);
        setError(null);
      } catch (error) {
        console.error('Error fetching users:', error);
        setError('Failed to load users. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Filter users based on the search term
  const filteredUsers = users.filter(user =>
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.isBlocked && searchTerm.toLowerCase() === 'blocked') ||
    (!user.isBlocked && searchTerm.toLowerCase() === 'active')
  );

  // Calculate the index of the last user on the current page
  const indexOfLastUser = currentPage * usersPerPage;

  // Calculate the index of the first user on the current page
  const indexOfFirstUser = indexOfLastUser - usersPerPage;

  // Get the users for the current page
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  // Calculate the total number of pages
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  // Handle blocking a user
  const handleBlockUser = async (userId) => {
    if (window.confirm("Are you sure you want to block this user?")) {
      try {
        await axios.put(`/api/auth/users/block/${userId}`);
        setUsers(users.map(user =>
          user.id === userId ? { ...user, isBlocked: true } : user
        ));
      } catch (error) {
        console.error('Error blocking user:', error);
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
    <h1 className="text-2xl font-bold mb-4">All Users</h1>
      {/* Search bar */}
      <div className="flex justify-between items-center mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search user by email or status"
            className="px-4 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-56"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FaSearch className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="text-center py-8">
          <p className="text-gray-600">Loading users...</p>
        </div>
      )}

      {/* Error message */}
      {error && !loading && (
        <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4">
          <p>{error}</p>
        </div>
      )}

      {/* Users table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {!loading && currentUsers.length > 0 ? (
              currentUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.role === 'admin' ? 'Admin' : user.role === 'delivery_partner' ? 'Delivery Partner' : 'User'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.isBlocked ? 'Blocked' : 'Active'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                    <button
                      onClick={() => handleBlockUser(user.id)}
                      className="text-red-600 hover:text-red-900"
                      disabled={user.isBlocked || user.email === 'admin@gmail.com'}
                    >
                      {user.isBlocked ? 'Blocked' : 'Block'}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              !loading && (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                    {searchTerm ? "No users match your search" : "No users available"}
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      {!loading && filteredUsers.length > 0 && (
        <div className="flex items-center justify-between mt-4">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`px-3 py-1 border rounded flex items-center ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
          >
            <FaChevronLeft className="mr-1" /> Previous
          </button>
          <span className="text-sm text-gray-700">
            Page {currentPage} of {totalPages || 1}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages || totalPages === 0}
            className={`px-3 py-1 border rounded flex items-center ${currentPage === totalPages || totalPages === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
          >
            Next <FaChevronRight className="ml-1" />
          </button>
        </div>
      )}
    </div>
  );
};

export default AllUsers;
