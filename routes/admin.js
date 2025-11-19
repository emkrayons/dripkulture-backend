import express from "express";
import protect from "../middleware/authMiddleware.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import User from "../models/User.js";

const router = express.Router();

// ✅ Test route
router.get("/", (req, res) => {
  res.json({ message: "Admin routes are working!" });
});

// ✅ Get all users (Admin only)
router.get("/users", protect, async (req, res) => {
  try {
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    const users = await User.find().select("-password"); // exclude passwords
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ Delete user (Admin only)
router.delete("/users/:id", protect, async (req, res) => {
  try {
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user.isAdmin) {
      return res.status(400).json({ message: "Cannot delete an admin user." });
    }

    await user.deleteOne();
    res.json({ message: "User removed successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ Update user role (make/remove admin)
router.put("/users/:id/role", protect, async (req, res) => {
  try {
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    const { isAdmin } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    user.isAdmin = isAdmin;
    await user.save();

    res.json({ message: "User role updated successfully.", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ Get all orders (Admin only)
router.get("/orders", protect, async (req, res) => {
  try {
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    const orders = await Order.find()
      .populate("customer", "name email")
      .populate("items.productId", "name price")
      .sort({ createdAt: -1 }); // newest first
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ Update order status (Admin only)
router.put("/orders/:id", protect, async (req, res) => {
  try {
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    if (req.body.status) {
      order.status = req.body.status;
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ Delete order (Admin only)
router.delete("/orders/:id", protect, async (req, res) => {
  try {
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    await order.deleteOne();
    res.json({ message: "Order removed successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ Add new product (Admin only)
router.post("/products", protect, async (req, res) => {
  try {
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    const { name, price, description, image, category, stock } = req.body;

    if (!name || !price || !description || !image || !category || stock == null) {
      return res.status(400).json({ message: "All product fields are required." });
    }

    const product = new Product({
      name,
      price,
      description,
      image,
      category,
      stock,
    });

    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ Get all products (Admin only)
router.get("/products", protect, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ Update product (Admin only)
router.put("/products/:id", protect, async (req, res) => {
  try {
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    const { name, price, description, image, category, stock } = req.body;

    product.name = name || product.name;
    product.price = price || product.price;
    product.description = description || product.description;
    product.image = image || product.image;
    product.category = category || product.category;
    product.stock = stock ?? product.stock;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ Delete product (Admin only)
router.delete("/products/:id", protect, async (req, res) => {
  try {
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    await product.deleteOne();
    res.json({ message: "Product removed successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
