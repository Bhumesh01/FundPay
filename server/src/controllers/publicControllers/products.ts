import type { Request, Response } from "express";
import { z } from "zod";
import { Product } from "../../models/Product.js";
import { EMIPlan } from "../../models/EMIPlan.js";

export async function getProducts(req: Request, res: Response){
    try{
        const products = await Product.find();
        res.status(200).json({
            message: "Products Fetched Successfully",
            products: products
        });
    }
    catch(err){
        console.log(err);
        res.status(500).json({
            message: "Unable to fetch the Products"
        });
    }
}
export async function getProductsBySlug(req: Request, res: Response){
    try{
        const slug = req.params.slug;
        if(!slug){
            return res.status(404).json({
                message: "Please enter the valid slug"
            });
        }
        const product = await Product.findOne({
            slug: slug
        })
        if(!product){
            return res.status(404).json({
                message: "Product not found",
            });
        }
        res.status(200).json({
            message: "Product Fetched Successfully",
            product: product
        });
    }
    catch(err){
        console.log(err);
        res.status(500).json({
            message: "Unable to fetch the Products"
        });
    }
}
export async function getEmiPlans(req: Request, res: Response){
    try{
        const ids = z.object({
            productId: z.string().regex(/^[a-fA-F0-9]{24}$/),
            variantId: z.string().regex(/^[a-fA-F0-9]{24}$/)
        }).safeParse({ productId: req.params.productId, variantId: req.query.variantId });
        if (!ids.success) return res.status(400).json({ message: "Valid productId and variantId are required" });
        const { productId, variantId } = ids.data;
        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ message: "Product not found" });
        if (!product.variants.id(variantId)) return res.status(404).json({ message: "Variant not found for this product" });
        const plans = await EMIPlan.find({ productId, variantId, isActive: true });
        res.status(200).json({
            message: "Plan Fetched Successfully",
            plans: plans
        });
    }
    catch(err){
        console.log(err);
        res.status(500).json({
            message: "Unable to fetch the plan"
        });
    }
}