import type { Request, Response } from "express";
import mongoose from "mongoose";
import { User } from "../../models/User.js";
import { Product } from "../../models/Product.js";
import { EMIPlan } from "../../models/EMIPlan.js";

export async function makeOrder(req: Request, res: Response) {
  try {
    const { productId, variantId, emiPlanId } = req.body;
    const userId = req.userId;
    if (!productId || !variantId || !emiPlanId) {
      return res.status(400).json({
        message: "productId, variantId and emiPlanId are required"
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(productId) ||
      !mongoose.Types.ObjectId.isValid(variantId) ||
      !mongoose.Types.ObjectId.isValid(emiPlanId)
    ) 
    {
      return res.status(400).json({
        message: "Invalid product, variant or EMI plan ID"
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        message: "Product not found"
      });
    }
    const variant = product.variants.id(variantId);
    if (!variant) {
      return res.status(404).json({
        message: "Variant not found for this product"
      });
    }
    const emiPlan = await EMIPlan.findOne({
      _id: emiPlanId,
      productId: productId,
      isActive: true
    });
    if (!emiPlan) {
      return res.status(404).json({
        message: "EMI plan not found or is currently inactive"
      });
    }

    const orderDetails = {
      productId: product._id,
      variantId: variant._id,
      emiPlanId: emiPlan._id,
      purchasePrice: variant.price,
      startDate: new Date(),
      nextInstallmentDate: new Date(
        new Date().setMonth(new Date().getMonth() + 1)
      ),
      status: "active" as const
    };

    // 8. Add order to user's orders
    user.orders.push(orderDetails);

    await user.save();

    return res.status(201).json({
      message: "Order created successfully",
      order: user.orders[user.orders.length - 1]
    });

  } catch (err) {
    console.log(err);

    return res.status(500).json({
      message: "Error creating order"
    });
  }
}
export async function getOrder(req: Request, res: Response) {
  try {
    const userId = req.userId;

    const user = await User.findById(userId).select("orders");

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    return res.status(200).json({
      message: "Orders fetched successfully",
      orders: user.orders
    });

  } 
  catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Error fetching orders"
    });
  }
}