import { Router } from "express";
import { getEmiPlans, getProducts, getProductsBySlug } from "../controllers/publicControllers/products.js";
import { getOrder, makeOrder } from "../controllers/customerControllers/customer.js";

export const router = Router();

router.get("/test", (req, res)=>{
    res.status(200).json({
        message: "Router is working"
    });
});

router.get("/products", getProducts);
router.get("/products/:slug", getProductsBySlug);
router.get("/emi-plans/product/:productId", getEmiPlans);

router.post("/orders", makeOrder);
router.get("/orders", getOrder);