import { Schema, model } from "mongoose";

const emiPlanSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    tenureMonths: { type: Number, required: true },
    monthlyAmount: { type: Number, required: true },
    interestRate: { type: Number, required: true },
    cashback: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const EMIPlan = model("EMIPlan", emiPlanSchema);