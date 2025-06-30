import express from 'express';
import { addOrder, getOrders, getReceivedOrders, updateOrderStatusA, getUserOrdersA, markOrderAsReceived, cancelOrder, getUserOrderHistory, getDeliveryDetailsController, getDeliveryDetailByIdController, addDeliveryDetailController, updateDeliveryDetailController, deleteDeliveryDetailController, getTopSellingProducts, getMonthlySalesReport } from '../controllers/orderController.js';
import { authenticateUser } from '../middleware/authMiddleware.js'; // Import authentication middleware

const router = express.Router();

// Route to get all orders
router.get('/', getOrders);
// Route to get all received orders
router.get('/received', getReceivedOrders);
// Route to add a new order
router.post('/add', authenticateUser, addOrder);
// Route to get user-specific orders
router.get('/user',authenticateUser, getUserOrdersA);
// Route to update order status (receivedToSupplier)
router.put('/update-status', updateOrderStatusA);
// Route to mark an order as received
router.put('/:orderId/received', markOrderAsReceived);
// Route to cancel an order
router.delete('/:orderId', cancelOrder);
// Route to get user order history (new route)
router.get('/history', authenticateUser, getUserOrderHistory); 
// Route to get delivery details
router.get('/delivery-details', authenticateUser, getDeliveryDetailsController);
// Route to get a single delivery detail by ID
router.get('/delivery-details/:id', authenticateUser, getDeliveryDetailByIdController);
// Route to add a new delivery detail
router.post('/delivery-details', authenticateUser, addDeliveryDetailController);
// Route to update a delivery detail
router.put('/delivery-details/:id', authenticateUser, updateDeliveryDetailController);
// Route to delete a delivery detail
router.delete('/delivery-details/:id', authenticateUser, deleteDeliveryDetailController);
// Route to get top-selling products
router.get('/top-selling', getTopSellingProducts);
// Route to get monthly sales report
router.get('/sales-report', getMonthlySalesReport);


export default router;