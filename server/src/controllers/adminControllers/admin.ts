import type { Request, Response } from "express";
import { z } from "zod";
import mongoose from "mongoose";
import { Product } from "../../models/Product.js";
import { EMIPlan } from "../../models/EMIPlan.js";

const variantSchema = z.object({
    color: z.string().min(1),
    storage: z.string().min(1),
    mrp: z.number().positive(),
    price: z.number().positive(),
    image: z.string().url()
});

const productSchema = z.object({
    name: z.string().min(1),
    slug: z.string().min(1),
    description: z.string().min(1),
    variants: z.array(variantSchema).min(1)
});

const updateProductSchema = z.object({
    name: z.string().min(1).optional(),
    slug: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
    variants: z.array(variantSchema).min(1).optional()
}).refine(
    data => Object.keys(data).length > 0,
    {
        message: "At least one field is required"
    }
);

const emiPlanSchema = z.object({
    productId: z.string(),
    tenureMonths: z.number().int().positive(),
    monthlyAmount: z.number().positive(),
    interestRate: z.number().min(0),
    cashback: z.number().min(0).default(0)
});

export async function createProduct(req: Request, res: Response) {
    try {
        const result = productSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({
                message: "Invalid product details",
                errors: result.error.format()
            });
        }
        const product = await Product.create(result.data);
        return res.status(201).json({
            message: "Product created successfully",
            product
        });
    } 
    catch (err: any) {
        if (err?.code === 11000) {
            return res.status(409).json({
                message: "Product slug already exists"
            });
        }
        console.error(err);
        return res.status(500).json({
            message: "Error creating product"
        });
    }
}

export async function updateProduct(req: Request, res: Response) {
    try {

        const id = req.params.id;
        const result = updateProductSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({
                message: "Invalid product details",
                errors: result.error.format()
            });
        }
        const product = await Product.findByIdAndUpdate(
            id,
            result.data,
            {
                new: true,
                runValidators: true
            }
        );
        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }
        return res.status(200).json({
            message: "Product updated successfully",
            product
        });
    } 
    catch (err: any) {
        if (err?.code === 11000) {
            return res.status(409).json({
                message: "Product slug already exists"
            });
        }
        console.error(err);
        return res.status(500).json({
            message: "Error updating product"
        });
    }
}

export async function deleteProduct(req: Request, res: Response) {
    try {
        const id = req.params.id;
        const product = await Product.findByIdAndDelete(id);
        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }
        await EMIPlan.deleteMany({
            productId: id!
        });
        return res.status(200).json({
            message: "Product deleted successfully"
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: "Error deleting product"
        });
    }
}

export async function createEmiPlan(req: Request, res: Response) {
    try {
        const result = emiPlanSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({
                message: "Invalid EMI plan details",
                errors: result.error.format()
            });
        }
        const { productId, tenureMonths, monthlyAmount, interestRate, cashback } = result.data;
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                message: "Invalid product ID"
            });
        }
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        const emiPlan = await EMIPlan.create({
            productId,
            tenureMonths,
            monthlyAmount,
            interestRate,
            cashback
        });
        return res.status(201).json({
            message: "EMI plan created successfully",
            emiPlan
        })
    } 
    catch (err) {
        console.error(err);
        return res.status(500).json({
            message: "Error creating EMI plan"
        });
    }
}

export async function toggleEmiPlan(req: Request, res: Response) {
    try {

        const id = req.params.id;
        const emiPlan = await EMIPlan.findById(id);
        if (!emiPlan) {
            return res.status(404).json({
                message: "EMI plan not found"
            });
        }
        emiPlan.isActive = !emiPlan.isActive;
        await emiPlan.save();
        return res.status(200).json({
            message: `EMI plan ${
                emiPlan.isActive ? "activated" : "deactivated"
            } successfully`,
            emiPlan
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: "Error toggling EMI plan"
        });
    }
}