const express = require('express');
const router = express.Router();
const productCtrl = require('../controller/ProductController');
const multer = require('multer');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// @route   POST /api/products/add
// Handle single file upload with field name 'image'
router.post('/add', upload.single('image'), productCtrl.addProduct);

// @route   GET /api/products/all
router.get('/all', productCtrl.viewAllProducts);

module.exports = router;
