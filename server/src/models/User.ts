import { Schema, model } from "mongoose";

const orderSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    variantId: { type: Schema.Types.ObjectId, required: true },
    emiPlanId: { type: Schema.Types.ObjectId, ref: "EMIPlan", required: true },
    purchasePrice: { type: Number, required: true},
    startDate: { type: Date, required: true },
    nextInstallmentDate: { type: Date, required: true },
    status: { type: String, enum: ["active", "completed", "cancelled"], default: "active",},
  },
  { timestamps: true }
);

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["customer", "admin"], default: "customer" },
    orders: { type: [orderSchema], default: [] },
  },
  { timestamps: true }
);

export const User = model("User", userSchema);