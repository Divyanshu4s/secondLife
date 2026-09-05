import express from 'express';
import {
  getAmazonProducts,
  getAmazonProductById,
  getRelifeProducts,
  getRelifeProductById,
  getRecommendationsForAsin,
  searchAllProducts,
  getMyRelifeListings,
  deleteRelifeListing
} from '../controllers/productController.js';
import { getSellerDashboard } from '../controllers/sellerController.js';
import { analyzeSellerSEO } from '../controllers/seoController.js';
import { checkout, getMyOrders } from '../controllers/orderController.js';
import { getLeaderboard } from '../controllers/leaderboardController.js';
import { getSustainabilityData, submitCircularAction, inspectImageWithAI } from '../controllers/sustainabilityController.js';
import { getTransactions, getCreditBalance } from '../controllers/creditController.js';
import { getCart, addToCart, removeFromCart, updateCartQuantity, clearCart } from '../controllers/cartController.js';
import { getNotifications, markAsRead } from '../controllers/notificationController.js';
import { protect } from '../middleware/authMiddleware.js';
import { handleAnalyzeProduct, handleChat } from '../controllers/assistantController.js';
import multer from 'multer';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// Assistant
router.post('/assistant/analyze', protect, handleAnalyzeProduct);
router.post('/assistant/chat', protect, handleChat);

// Notifications
router.get('/notifications', protect, getNotifications);
router.put('/notifications/:id/read', protect, markAsRead);

// Amazon Products
router.get('/products', getAmazonProducts);
router.get('/products/:id', getAmazonProductById);

// ReLife Products
router.get('/relife-products', getRelifeProducts);
router.get('/relife-products/my-listings', protect, getMyRelifeListings);
router.get('/relife-products/:id', getRelifeProductById);
router.delete('/relife-products/:id', protect, deleteRelifeListing);

// Recommendations & Search
router.get('/recommendations/:asin', getRecommendationsForAsin);

router.get('/search', searchAllProducts);

// Seller Dashboard
router.get('/seller/dashboard/:sellerId', getSellerDashboard);
router.post('/seller/seo-analyze', protect, analyzeSellerSEO);

// Orders & Sustainability
router.post('/orders/checkout', protect, checkout);
router.get('/orders/my-orders', protect, getMyOrders);
router.get('/sustainability/dashboard', protect, getSustainabilityData);
router.post('/sustainability/circular-action', protect, submitCircularAction);
router.post('/sustainability/ai-inspect', protect, upload.single('image'), inspectImageWithAI);

// Green Credits
router.get('/credits/transactions', protect, getTransactions);
router.get('/credits/balance', protect, getCreditBalance);

// Leaderboard
router.get('/leaderboard', getLeaderboard);

// Cart
router.get('/cart', protect, getCart);
router.post('/cart/add', protect, addToCart);
router.delete('/cart/:productId', protect, removeFromCart);
router.put('/cart/update', protect, updateCartQuantity);
router.delete('/cart', protect, clearCart);

export const apiRouter = router;
