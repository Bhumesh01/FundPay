import type { Request, Response } from "express";
import { z } from "zod";
import mongoose from "mongoose";
import { Product } from "../../models/Product.js";
import { User } from "../../models/User.js";
import { EMIPlan } from "../../models/EMIPlan.js";

const objectId = z.string().regex(/^[a-fA-F0-9]{24}$/, "Invalid ObjectId");

const variantSchema = z.object({
    _id: objectId.optional(),
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
    productId: objectId,
    variantId: objectId,
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
        if (result.data.variants) {
            const existing = await Product.findById(id);
            if (!existing) return res.status(404).json({ message: "Product not found" });
            const kept = new Set(result.data.variants.flatMap(v => v._id ? [v._id] : []));
            for (const variant of result.data.variants) {
                if (variant._id && !existing.variants.id(variant._id)) {
                    return res.status(400).json({ message: "Variant does not belong to this product" });
                }
            }
            const removed = existing.variants.filter(v => !kept.has(v._id.toString())).map(v => v._id);
            if (removed.length && (await EMIPlan.exists({ productId: existing._id, variantId: { $in: removed } }) ||
                await User.exists({ orders: { $elemMatch: { productId: existing._id, variantId: { $in: removed } } } }))) {
                return res.status(409).json({ message: "Cannot remove variants referenced by EMI plans or orders" });
            }
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
        if (typeof id !== "string" || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid product ID" });
        }
        if (await User.exists({ "orders.productId": new mongoose.Types.ObjectId(id) })) {
            return res.status(409).json({ message: "Cannot delete a product referenced by existing orders" });
        }
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
        const { productId, variantId, tenureMonths, monthlyAmount, interestRate, cashback } = result.data;
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

        if (!product.variants.id(variantId)) {
            return res.status(400).json({ message: "Variant does not belong to this product" });
        }

        const emiPlan = await EMIPlan.create({
            productId,
            variantId,
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
        if (!emiPlan.isActive) {
            const product = await Product.findById(emiPlan.productId);
            if (!emiPlan.variantId || !product?.variants.id(emiPlan.variantId)) {
                return res.status(400).json({ message: "Assign this plan to a valid variant before activation" });
            }
        }
        emiPlan.isActive = !emiPlan.isActive;
        // Permit deactivation of legacy plans pending migration.
        await emiPlan.save({ validateModifiedOnly: true });
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
export async function listEmiPlans(_req: Request, res: Response) {
    try {
        return res.json({ plans: await EMIPlan.find() });
    } catch {
        return res.status(500).json({ message: "Unable to fetch EMI plans" });
    }
}
