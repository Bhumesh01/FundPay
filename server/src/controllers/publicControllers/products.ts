import type { Request, Response } from "express";
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
        const productId = req.params.productId;
        if(!productId){
            return res.status(404).json({
                message: "Please enter the valid productId"
            });
        }
        const plans = await EMIPlan.find({
            productId: productId,
            isActive: true
        })
        if(plans.length === 0){
            return res.status(404).json({
                message: "No Plans found",
            });
        }
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