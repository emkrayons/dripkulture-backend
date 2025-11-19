import express from "express";
import { updateOrder, deleteOrder } from "../controllers/adminController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Update order (status, etc.)
router.put("/orders/:id", protect, admin, updateOrder);

// Delete order
router.delete("/orders/:id", protect, admin, deleteOrder);

export default router;