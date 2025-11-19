import express from "express";
import Order from "../models/Order.js";

const router = express.Router();

// ✅ Get single order details
router.get("/details/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ message: "Failed to fetch order details" });
  }
});



// Get all orders for a specific customer
router.get("/:email", async (req, res) => {
  try {
    const orders = await Order.find({ "customer.email": req.params.email })
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});




router.post("/", async (req, res) => {
  try {
    const { items, total, customer } = req.body;
    const newOrder = new Order({
      customer,
      items: items.map(item => ({
        productId: item.id || item._id,
        name: item.name,
        image: item.image,
        price: item.price,
        quantity: item.quantity
      })),
      total
    });

    await newOrder.save();

    res.status(201).json({
      message: "Order placed successfully",
      orderId: newOrder._id
    });
  } catch (error) {
    console.error("Order creation error:", error);
    res.status(500).json({ message: "Failed to create order" });
  }
});


export default router;
