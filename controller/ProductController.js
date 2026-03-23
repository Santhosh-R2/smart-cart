const Product = require('../models/Product');

// @desc    Add a new product
// @route   POST /api/products/add
exports.addProduct = async (req, res) => {
  try {
    const { product_name, price, discount, quantity, section, category } = req.body;
    
    // Check if an image file was uploaded
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an image' });
    }

    // Convert file buffer to base64 string
    const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    const newProduct = new Product({
      product_name,
      price: Number(price),
      discount: Number(discount || 0),
      quantity,
      image: base64Image,
      section,
      category
    });

    await newProduct.save();
    res.status(201).json({ success: true, message: 'Product added successfully', data: newProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all products grouped by sections and categories
// @route   GET /api/products/all
exports.viewAllProducts = async (req, res) => {
  try {
    const products = await Product.find({});

    const sectionsMap = {};

    products.forEach(p => {
      const { section, category } = p;
      if (!sectionsMap[section]) {
        sectionsMap[section] = {};
      }
      if (!sectionsMap[section][category]) {
        sectionsMap[section][category] = [];
      }
      sectionsMap[section][category].push({
        product_name: p.product_name,
        price: p.price,
        discount: p.discount,
        quantity: p.quantity,
        image: p.image
      });
    });

    const formattedSections = Object.keys(sectionsMap).map(sectionName => {
      const categories = sectionsMap[sectionName];
      return Object.keys(categories).map(categoryName => ({
        section: sectionName,
        category: categoryName,
        products: categories[categoryName]
      }));
    }).flat();

    res.status(200).json({ sections: formattedSections });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
