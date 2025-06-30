import React, { useState } from 'react';
import AddProduct from './AddProduct';
import Inventory from './Inventory';
import Orders from './Orders';
import AllUsers from './AllUsers';
import BlockedUsers from './BlockedUsers';
import ReceivedOrders from './ReceivedOrders';
import AddSlideForm from './AddSlideForm';
import ManageSlides from './ManageSlides';
import CreateAccount from './CreateAccount'; 
import SalesReport from './SalesReport';
import { FaBox, FaChevronDown, FaChevronUp, FaBars, FaClipboardList, FaShoppingCart, FaUsers, FaUserFriends, FaHome } from 'react-icons/fa';
import { FaClipboardCheck, FaCartShopping, FaUserPlus  } from "react-icons/fa6";
import { MdFormatListBulletedAdd, MdAccountBox, MdAdminPanelSettings   } from 'react-icons/md';
import { RiUserForbidFill, RiSlideshow3Fill, RiSlideshow4Fill } from 'react-icons/ri';
import { BiSolidReport } from "react-icons/bi";
import { LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext'; // Import AuthContext for logout and protection
import { useNavigate } from 'react-router-dom'; 

// Admin component definition
const Admin = () => {
  // State to manage the active component to be displayed
  const [activeComponent, setActiveComponent] = useState('addProduct');

  // States to manage the open/close state of the manage sections
  const [isManageProductsOpen, setIsManageProductsOpen] = useState(true);
  const [isManageOrdersOpen, setIsManageOrdersOpen] = useState(false);
  const [isManageUsersOpen, setIsManageUsersOpen] = useState(false);
  const [isManageSlidesOpen, setIsManageSlidesOpen] = useState(false);
  const [isManageAccountsOpen, setIsManageAccountsOpen] = useState(false); // New state for account management

  const { logout, user, token } = useAuth(); // Use AuthContext for authentication
  const navigate = useNavigate();

  // Protect the admin page: only allow admin users
  React.useEffect(() => {
    if (!token || !user || user.role !== 'admin') {
      navigate('/login');
    }
  }, [token, user, navigate]);

  // Function to toggle the Manage Products section
  const toggleManageProducts = () => {
    setIsManageProductsOpen(!isManageProductsOpen);
  };

  // Function to toggle the Manage Orders section
  const toggleManageOrders = () => {
    setIsManageOrdersOpen(!isManageOrdersOpen);
  };

  // Function to toggle the Manage Users section
  const toggleManageUsers = () => {
    setIsManageUsersOpen(!isManageUsersOpen);
  };

  // Function to toggle the Manage Slides section
  const toggleManageSlides = () => {
    setIsManageSlidesOpen(!isManageSlidesOpen);
  };

  // Function to toggle the Manage Accounts section
  const toggleManageAccounts = () => {
    setIsManageAccountsOpen(!isManageAccountsOpen);
  };

  // Function to handle user logout using AuthContext
  const handleLogout = () => {
    logout(); // This will clear auth and redirect to login
  };

  // Function to render the active component based on the state
  const renderActiveComponent = () => {
    switch (activeComponent) {
      case 'addProduct':
        return <AddProduct />;
      case 'inventory':
        return <Inventory />;
      case 'orders':
        return <Orders />;
      case 'receivedOrders':
        return <ReceivedOrders />;
      case 'salesReport':
        return <SalesReport />;
      case 'slides':
        return <AddSlideForm />;
      case 'manageSlides':
        return <ManageSlides />;
      case 'allUsers':
        return <AllUsers />;
      case 'blockedUsers':
        return <BlockedUsers />;
      case 'createAdmin':
        return <CreateAccount role="admin" />; // Render the new component for creating admin
      case 'createDeliveryPartner':
        return <CreateAccount role="delivery_partner" />; // Render the new component for creating delivery partner
      default:
        return <AddProduct />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-blue-900 text-white flex flex-col justify-between">
        <div>
          <div className="p-4 w-full border-b border-blue-800">
            <h1 className="text-xl font-bold">PC House (Admin)</h1>
          </div>

          {/* Navigation */}
          <nav className="mt-4 flex-grow">
            {/* Manage Products Section */}
            <div>
              <button
                className="flex items-center justify-between w-full p-3 text-left bg-blue-500 hover:bg-blue-600"
                onClick={toggleManageProducts}
              >
                <div className="flex items-center">
                  <FaBox className="w-5 h-5 mr-2" />
                  <span>Manage Products</span>
                </div>
                {isManageProductsOpen ? <FaChevronUp className="w-4 h-4" /> : <FaChevronDown className="w-4 h-4" />}
              </button>

              {isManageProductsOpen && (
                <div className="pl-6 bg-blue-800">
                  <button
                    className={`flex items-center w-full p-3 hover:bg-blue-700 ${activeComponent === 'addProduct' ? 'bg-blue-700' : ''}`}
                    onClick={() => setActiveComponent('addProduct')}
                  >
                    <MdFormatListBulletedAdd className="w-5 h-5 mr-2" />
                    Add Product
                  </button>
                  <button
                    className={`flex items-center w-full p-3 hover:bg-blue-700 ${activeComponent === 'inventory' ? 'bg-blue-700' : ''}`}
                    onClick={() => setActiveComponent('inventory')}
                  >
                    <FaShoppingCart className="w-5 h-5 mr-2" />
                    Inventory
                  </button>
                </div>
              )}
            </div>

            {/* Manage Orders Section */}
            <div className="mt-2">
              <button
                className="flex items-center justify-between w-full p-3 text-left bg-blue-900 hover:bg-blue-800"
                onClick={toggleManageOrders}
              >
                <div className="flex items-center">
                  <FaCartShopping className="w-5 h-5 mr-2" />
                  <span>Manage Orders</span>
                </div>
                {isManageOrdersOpen ? <FaChevronUp className="w-4 h-4" /> : <FaChevronDown className="w-4 h-4" />}
              </button>

              {isManageOrdersOpen && (
                <div className="pl-6 bg-blue-800">
                  <button
                    className={`flex items-center w-full p-3 hover:bg-blue-700 ${activeComponent === 'orders' ? 'bg-blue-700' : ''}`}
                    onClick={() => setActiveComponent('orders')}
                  >
                    <FaClipboardList className="w-5 h-5 mr-2" />
                    Orders
                  </button>
                  <button
                    className={`flex items-center w-full p-3 hover:bg-blue-700 ${activeComponent === 'receivedOrders' ? 'bg-blue-700' : ''}`}
                    onClick={() => setActiveComponent('receivedOrders')}
                  >
                    <FaClipboardCheck className="w-5 h-5 mr-2" />
                    Received Orders
                  </button>
                  <button
                    className={`flex items-center w-full p-3 hover:bg-blue-700 ${activeComponent === 'salesReport' ? 'bg-blue-700' : ''}`}
                    onClick={() => setActiveComponent('salesReport')}
                  >
                    <BiSolidReport className="w-5 h-5 mr-2" />
                    Sales Report                  
                  </button>
                </div>
              )}
            </div>

            {/* Manage Slides Section */}
            <div className="mt-2">
              <button
                className="flex items-center justify-between w-full p-3 text-left bg-blue-900 hover:bg-blue-800"
                onClick={toggleManageSlides}
              >
                <div className="flex items-center">
                  <FaHome className="w-5 h-5 mr-2" />
                  <span>Manage Home</span>
                </div>
                {isManageSlidesOpen ? <FaChevronUp className="w-4 h-4" /> : <FaChevronDown className="w-4 h-4" />}
              </button>

              {isManageSlidesOpen && (
                <div className="pl-6 bg-blue-800">
                  <button
                    className={`flex items-center w-full p-3 hover:bg-blue-700 ${activeComponent === 'slides' ? 'bg-blue-700' : ''}`}
                    onClick={() => setActiveComponent('slides')}
                  >
                    <RiSlideshow3Fill className="w-5 h-5 mr-2" />
                    Add Slides
                  </button>
                  <button
                    className={`flex items-center w-full p-3 hover:bg-blue-700 ${activeComponent === 'manageSlides' ? 'bg-blue-700' : ''}`}
                    onClick={() => setActiveComponent('manageSlides')}
                  >
                    <RiSlideshow4Fill className="w-5 h-5 mr-2" />
                    Manage Slides
                  </button>
                </div>
              )}
            </div>

            {/* Manage Users Section */}
            <div className="mt-2">
              <button
                className="flex items-center justify-between w-full p-3 text-left bg-blue-900 hover:bg-blue-800"
                onClick={toggleManageUsers}
              >
                <div className="flex items-center">
                  <FaUsers className="w-5 h-5 mr-2" />
                  <span>Manage Users</span>
                </div>
                {isManageUsersOpen ? <FaChevronUp className="w-4 h-4" /> : <FaChevronDown className="w-4 h-4" />}
              </button>

              {isManageUsersOpen && (
                <div className="pl-6 bg-blue-800">
                  <button
                    className={`flex items-center w-full p-3 hover:bg-blue-700 ${activeComponent === 'allUsers' ? 'bg-blue-700' : ''}`}
                    onClick={() => setActiveComponent('allUsers')}
                  >
                    <FaUserFriends className="w-5 h-5 mr-2" />
                    All Users
                  </button>
                  <button
                    className={`flex items-center w-full p-3 hover:bg-blue-700 ${activeComponent === 'blockedUsers' ? 'bg-blue-700' : ''}`}
                    onClick={() => setActiveComponent('blockedUsers')}
                  >
                    <RiUserForbidFill className="w-5 h-5 mr-2" />
                    Blocked Users
                  </button>
                </div>
              )}
            </div>

            {/* Manage Accounts Section */}
            <div className="mt-2">
              <button
                className="flex items-center justify-between w-full p-3 text-left bg-blue-900 hover:bg-blue-800"
                onClick={toggleManageAccounts}
              >
                <div className="flex items-center">
                  <MdAccountBox className="w-5 h-5 mr-2" />
                  <span>Account Management</span>
                </div>
                {isManageAccountsOpen ? <FaChevronUp className="w-4 h-4" /> : <FaChevronDown className="w-4 h-4" />}
              </button>

              {isManageAccountsOpen && (
                <div className="pl-6 bg-blue-800">
                  <button
                    className={`flex items-center w-full p-3 hover:bg-blue-700 ${activeComponent === 'createAdmin' ? 'bg-blue-700' : ''}`}
                    onClick={() => setActiveComponent('createAdmin')}
                  >
                    <MdAdminPanelSettings className="w-5 h-5 mr-2" />
                    Create Admin
                  </button>
                  <button
                    className={`flex items-center w-full p-3 hover:bg-blue-700 ${activeComponent === 'createDeliveryPartner' ? 'bg-blue-700' : ''}`}
                    onClick={() => setActiveComponent('createDeliveryPartner')}
                  >
                    <FaUserPlus className="w-5 h-5 mr-2" />
                    Create Delivery Partner
                  </button>
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* Logout Button */}
        <button
          className="flex items-center w-full px-20 py-20"
          onClick={handleLogout}
        >
          <LogOut size={25} className="mr-2" />
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Hamburger menu for mobile */}
        <div className="md:hidden bg-blue-900 text-white p-4">
          <button className="focus:outline-none">
            <FaBars className="w-6 h-6" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6">
          {renderActiveComponent()}
        </div>
      </div>
    </div>
  );
};

export default Admin;
