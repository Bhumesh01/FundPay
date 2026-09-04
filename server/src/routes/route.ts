import { Router } from "express";
import { getEmiPlans, getProducts, getProductsBySlug } from "../controllers/publicControllers/products.js";
import { getOrder, makeOrder, payEMI, payFullAmount } from "../controllers/customerControllers/customer.js";
import { authMiddleware } from "../middleware/middleware.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { createEmiPlan, createProduct, deleteProduct, toggleEmiPlan, updateProduct } from "../controllers/adminControllers/admin.js";
import { signin, signup } from "../controllers/authControllers/auth.js";

export const router = Router();

router.get("/test", (req, res)=>{
    res.status(200).json({
        message: "Router is working"
    });
});

router.post("/auth/signup", signup);
router.post("/auth/signin", signin);

router.get("/products", getProducts);
router.get("/products/:slug", getProductsBySlug);
router.get("/emi-plans/product/:productId", getEmiPlans);

router.post("/orders", authMiddleware, makeOrder);
router.get("/orders", authMiddleware, getOrder);
router.post("/orders/:orderId/pay-full", authMiddleware, payFullAmount);
router.post("/orders/:orderId/pay-emi", authMiddleware, payEMI);

router.post("/admin/products", authMiddleware, requireAdmin, createProduct);
router.put("/admin/products/:id", authMiddleware, requireAdmin, updateProduct);
router.delete("/admin/products/:id", authMiddleware, requireAdmin, deleteProduct);
router.post("/admin/emi-plans", authMiddleware, requireAdmin, createEmiPlan);
router.patch("/admin/emi-plans/:id/toggle", authMiddleware, requireAdmin, toggleEmiPlan);