import { Schema, model } from "mongoose";

const variantSchema = new Schema({
  color: { type: String, required: true },
  storage: { type: String, required: true },
  mrp: { type: Number, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
});

const productSchema = new Schema(
  {
    name: { type: String,required: true },
    slug: { type: String, required: true, unique: true },
    description: String,
    variants: { type: [variantSchema], required: true },
  },
  { timestamps: true }
);

export const Product = model("Product", productSchema);