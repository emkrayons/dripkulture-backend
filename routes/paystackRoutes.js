import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import Order from "../models/Order.js";

dotenv.config();

const router = express.Router();

// ✅ VERIFY PAYMENT
router.post("/verify", async (req, res) => {
  const { reference, orderId } = req.body;

  if (!reference || !orderId) {
    return res.status(400).json({ message: "Missing reference or order ID" });
  }

  try {
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const data = response.data;

    if (data.status && data.data.status === "success") {
      // ✅ Payment successful
      const order = await Order.findById(orderId);
      if (!order) return res.status(404).json({ message: "Order not found" });

      order.isPaid = true;
      order.status = "paid"; // ✅ Add this line
      order.paidAt = Date.now();
      order.paymentResult = {
        id: data.data.id,
        reference: data.data.reference,
        status: data.data.status,
        channel: data.data.channel,
      };

      await order.save();

      res.status(200).json({ message: "Payment verified", order });
    } else {
      res.status(400).json({ message: "Payment not verified" });
    }
  } catch (error) {
    console.error("Payment verification error:", error.response?.data || error);
    res.status(500).json({ message: "Payment verification failed" });
  }
});

export default router;
