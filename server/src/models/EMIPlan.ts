import { Schema, model } from "mongoose";

const emiPlanSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    variantId: { type: Schema.Types.ObjectId, required: true },
    tenureMonths: { type: Number, required: true },
    monthlyAmount: { type: Number, required: true },
    interestRate: { type: Number, required: true },
    cashback: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

emiPlanSchema.index({ productId: 1, variantId: 1, isActive: 1 });

export const EMIPlan = model("EMIPlan", emiPlanSchema);