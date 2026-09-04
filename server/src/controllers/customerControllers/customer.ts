import type { Request, Response } from "express";
import mongoose from "mongoose";
import { User } from "../../models/User.js";
import { Product } from "../../models/Product.js";
import { EMIPlan } from "../../models/EMIPlan.js";

export async function makeOrder(req: Request, res: Response) {
  try {
    const { productId, variantId, emiPlanId } = req.body;
    const userId = req.userId;

    // Validate required fields
    if (!productId || !variantId || !emiPlanId) {
      return res.status(400).json({
        message: "productId, variantId and emiPlanId are required",
      });
    }

    // Validate ObjectIds
    if (
      !mongoose.Types.ObjectId.isValid(productId) ||
      !mongoose.Types.ObjectId.isValid(variantId) ||
      !mongoose.Types.ObjectId.isValid(emiPlanId)
    ) {
      return res.status(400).json({
        message: "Invalid product, variant or EMI plan ID",
      });
    }

    // Find user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Find product
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    // Find selected variant
    const variant = product.variants.id(variantId);

    if (!variant) {
      return res.status(404).json({
        message: "Variant not found for this product",
      });
    }

    // Find EMI plan belonging to this product
    const emiPlan = await EMIPlan.findOne({
      _id: emiPlanId,
      productId: productId,
      isActive: true,
    });

    if (!emiPlan) {
      return res.status(404).json({
        message: "EMI plan not found or is currently inactive",
      });
    }

    // Create order
    const orderDetails = {
      productId: product._id,
      variantId: variant._id,
      emiPlanId: emiPlan._id,
      purchasePrice: variant.price,

      // EMI payment tracking
      paidEMIs: 0,
      paidAmount: 0,

      startDate: new Date(),

      nextInstallmentDate: new Date(
        new Date().setMonth(new Date().getMonth() + 1)
      ),
    
      status: "active" as const,
    };

    user.orders.push(orderDetails);

    await user.save();

    const createdOrder = user.orders[user.orders.length - 1];
    if (!createdOrder) {
      return res.status(500).json({
        message: "Order was not created",
      });
    }
    return res.status(201).json({
      message: "Order created successfully",
      order: {
        id: createdOrder._id,
        productId: createdOrder.productId,
        variantId: createdOrder.variantId,
        emiPlanId: createdOrder.emiPlanId,
        purchasePrice: createdOrder.purchasePrice,
        paidEMIs: createdOrder.paidEMIs,
        paidAmount: createdOrder.paidAmount,
        startDate: createdOrder.startDate,
        nextInstallmentDate: createdOrder.nextInstallmentDate,
        status: createdOrder.status,
      },
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      message: "Error creating order",
    });
  }
}


export async function getOrder(req: Request, res: Response) {
  try {
    const userId = req.userId;

    // Get user's orders + product + EMI plan
    const user = await User.findById(userId)
      .select("orders")
      .populate({
        path: "orders.productId",
        model: "Product",
        select: "name slug description variants",
      })
      .populate({
        path: "orders.emiPlanId",
        model: "EMIPlan",
        select:
          "productId tenureMonths monthlyAmount interestRate cashback isActive",
      });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Convert orders into frontend-friendly response
    const orders = user.orders.map((order: any) => {
      const product = order.productId;
      const emiPlan = order.emiPlanId;

      // Find selected variant from the populated product
      const variant = product?.variants?.find(
        (item: any) =>
          item._id.toString() === order.variantId.toString()
      );

      return {
        id: order._id,

        product: product
          ? {
              id: product._id,
              name: product.name,
              slug: product.slug,
              description: product.description,
            }
          : null,

        variant: variant
          ? {
              id: variant._id,
              color: variant.color,
              storage: variant.storage,
              mrp: variant.mrp,
              price: variant.price,
              discount: variant.discount,
              image: variant.image,
            }
          : null,

        emiPlan: emiPlan
          ? {
              id: emiPlan._id,
              tenureMonths: emiPlan.tenureMonths,
              monthlyAmount: emiPlan.monthlyAmount,
              interestRate: emiPlan.interestRate,
              cashback: emiPlan.cashback,
            }
          : null,

        purchasePrice: order.purchasePrice,
        paidEMIs: order.paidEMIs,
        paidAmount: order.paidAmount,
        startDate: order.startDate,
        nextInstallmentDate: order.nextInstallmentDate,
        status: order.status,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      };
    });

    return res.status(200).json({
      message: "Orders fetched successfully",
      orders,
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      message: "Error fetching orders",
    });
  }
}

export async function payEMI(req: Request, res: Response) {
  try {
    const userId = req.userId;
    const orderId = req.params.orderId;

    // Find user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    if ( !orderId || Array.isArray(orderId) || !mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        message: "Invalid order ID",
      });
    }
    // Find order inside user's embedded orders
    const order = user.orders.id(orderId);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    // Check order status
    if (order.status !== "active") {
      return res.status(400).json({
        message: "This EMI plan is not active",
      });
    }

    // Find EMI plan
    const emiPlan = await EMIPlan.findById(order.emiPlanId);

    if (!emiPlan) {
      return res.status(404).json({
        message: "EMI plan not found",
      });
    }

    // Prevent paying after all EMIs are completed
    if (order.paidEMIs >= emiPlan.tenureMonths) {
      return res.status(400).json({
        message: "All EMIs have already been paid",
      });
    }

    // Increase paid EMI count
    order.paidEMIs += 1;

    // Increase paid amount
    order.paidAmount += emiPlan.monthlyAmount;

    // Check if this was the final EMI
    if (order.paidEMIs >= emiPlan.tenureMonths) {
      order.status = "completed";
    } else {
      // Move next installment to next month
      const nextDate = new Date(order.nextInstallmentDate);

      nextDate.setMonth(nextDate.getMonth() + 1);

      order.nextInstallmentDate = nextDate;
    }

    // Save changes to MongoDB
    await user.save();

    return res.status(200).json({
      message: "EMI payment successful",
      order: {
        id: order._id,
        paidEMIs: order.paidEMIs,
        paidAmount: order.paidAmount,
        nextInstallmentDate: order.nextInstallmentDate,
        status: order.status,
      },
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      message: "Error processing EMI payment",
    });
  }
}

export async function payFullAmount(
  req: Request,
  res: Response
) {
  try {
    const userId = req.userId;
    const orderId  = req.params.orderId;

    // Find user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    if ( !orderId || Array.isArray(orderId) || !mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        message: "Invalid order ID",
      });
    }
    // Find order
    const order = user.orders.id(orderId);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    if (order.status !== "active") {
      return res.status(400).json({
        message: "This EMI plan is already completed",
      });
    }

    // Find EMI plan
    const emiPlan = await EMIPlan.findById(order.emiPlanId);

    if (!emiPlan) {
      return res.status(404).json({
        message: "EMI plan not found",
      });
    }

    // Calculate remaining EMIs
    const remainingEMIs =
      emiPlan.tenureMonths - order.paidEMIs;

    if (remainingEMIs <= 0) {
      return res.status(400).json({
        message: "All EMIs have already been paid",
      });
    }

    // Calculate remaining amount
    const remainingAmount =
      remainingEMIs * emiPlan.monthlyAmount;

    // Update order
    order.paidEMIs = emiPlan.tenureMonths;

    order.paidAmount += remainingAmount;

    order.status = "completed";

    // Save to MongoDB
    await user.save();

    return res.status(200).json({
      message: "Full payment successful",
      order: {
        id: order._id,
        paidEMIs: order.paidEMIs,
        paidAmount: order.paidAmount,
        nextInstallmentDate: order.nextInstallmentDate,
        status: order.status,
      },
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      message: "Error processing full payment",
    });
  }
}