import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";

interface ProductVariant {
  id: string;
  color: string;
  storage: string;
  mrp: number;
  price: number;
  discount: number;
  image: string;
}

interface EMIPlan {
  id: string;
  tenureMonths: number;
  monthlyAmount: number;
  interestRate: number;
  cashback: number;
}

interface Product {
  name: string;
  slug: string;
  description: string;
  variants: ProductVariant[];
}

const product: Product = {
  name: "iPhone 17 Pro",
  slug: "iphone-17-pro",
  description:
    "Experience powerful performance, a pro-grade camera system, and an exceptional display designed for everyday use and professional creativity.",
  variants: [
    {
      id: "variant-1",
      color: "Deep Blue",
      storage: "256 GB",
      mrp: 139900,
      price: 129900,
      discount: 10000,
      image:
        "https://images.unsplash.com/photo-1592286927505-2fd6b9c8f5a1?auto=format&fit=crop&w=1000&q=80",
    },
    {
      id: "variant-2",
      color: "Silver",
      storage: "512 GB",
      mrp: 159900,
      price: 149900,
      discount: 10000,
      image:
        "https://images.unsplash.com/photo-1592286927505-2fd6b9c8f5a1?auto=format&fit=crop&w=1000&q=80",
    },
  ],
};

const emiPlans: EMIPlan[] = [
  {
    id: "emi-1",
    tenureMonths: 6,
    monthlyAmount: 21650,
    interestRate: 0,
    cashback: 3000,
  },
  {
    id: "emi-2",
    tenureMonths: 12,
    monthlyAmount: 11250,
    interestRate: 5.99,
    cashback: 5000,
  },
  {
    id: "emi-3",
    tenureMonths: 18,
    monthlyAmount: 7850,
    interestRate: 7.99,
    cashback: 7000,
  },
];

function ProductDetails() {
  const { slug } = useParams();

  const [selectedVariantId, setSelectedVariantId] = useState(
    product.variants[0]?.id ?? ""
  );

  const [selectedPlanId, setSelectedPlanId] = useState(
    emiPlans[1]?.id ?? ""
  );

  const selectedVariant = product.variants.find(
    (variant) => variant.id === selectedVariantId
  );

  const selectedPlan = emiPlans.find(
    (plan) => plan.id === selectedPlanId
  );

  if (!selectedVariant || !selectedPlan) {
    return null;
  }

  return (
    <main className="min-h-screen bg-slate-50">

      {/* =====================================================
          Header
          ===================================================== */}

      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-md">

        <div className="page-container flex h-18 items-center justify-between">

          <Link
            to="/"
            className="text-2xl font-bold tracking-tight text-slate-900"
          >
            Fund<span className="text-primary-600">Pay</span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">

            <Link
              to="/products"
              className="text-sm font-semibold text-slate-600 hover:text-primary-600"
            >
              Products
            </Link>

            <Link
              to="/dashboard"
              className="text-sm font-medium text-slate-500 hover:text-slate-900"
            >
              Dashboard
            </Link>

          </nav>

          <Link
            to="/signin"
            className="text-sm font-semibold text-primary-600 hover:text-primary-700"
          >
            Sign in
          </Link>

        </div>

      </header>


      {/* =====================================================
          Breadcrumb
          ===================================================== */}

      <div className="page-container pt-6">

        <div className="flex items-center gap-2 text-sm text-slate-400">

          <Link
            to="/products"
            className="transition-colors hover:text-primary-600"
          >
            Products
          </Link>

          <ChevronRight className="h-4 w-4" />

          <span className="text-slate-600">
            {product.name}
          </span>

        </div>

      </div>


      {/* =====================================================
          Product Section
          ===================================================== */}

      <section className="page-container py-8 lg:py-12">

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">

          {/* =================================================
              Product Image
              ================================================= */}

          <div className="lg:sticky lg:top-28">

            <div className="card overflow-hidden">

              <div className="relative flex aspect-square items-center justify-center bg-slate-100 p-8 sm:p-12">

                <img
                  src={selectedVariant.image}
                  alt={`${product.name} ${selectedVariant.color}`}
                  className="h-full w-full object-contain transition-all duration-300"
                />

                {/* Discount */}
                {selectedVariant.discount > 0 && (
                  <span className="absolute left-5 top-5 badge-success">
                    Save ₹
                    {selectedVariant.discount.toLocaleString("en-IN")}
                  </span>
                )}

              </div>

            </div>


            {/* Trust */}
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="h-4 w-4 text-success-600" />
              Secure purchase with FundPay
            </div>

          </div>


          {/* =================================================
              Product Information
              ================================================= */}

          <div>

            {/* Product name */}
            <div>

              <span className="badge-primary">
                Investment-backed EMI
              </span>

              <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                {product.name}
              </h1>

              <p className="mt-4 text-base leading-7 text-slate-500">
                {product.description}
              </p>

            </div>


            {/* =================================================
                Variant Selection
                ================================================= */}

            <div className="mt-8">

              <div className="flex items-center justify-between">

                <h2 className="text-sm font-semibold text-slate-900">
                  Choose your variant
                </h2>

                <span className="text-sm text-slate-500">
                  {selectedVariant.color}
                </span>

              </div>


              <div className="mt-3 grid gap-3 sm:grid-cols-2">

                {product.variants.map((variant) => {

                  const isSelected =
                    variant.id === selectedVariantId;

                  return (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() =>
                        setSelectedVariantId(variant.id)
                      }
                      className={`relative rounded-2xl border p-4 text-left transition-all duration-200 ${
                        isSelected
                          ? "border-primary-500 bg-primary-50 ring-2 ring-primary-100"
                          : "border-slate-200 bg-white hover:border-primary-200 hover:bg-slate-50"
                      }`}
                    >

                      {/* Selected */}
                      {isSelected && (
                        <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-white">
                          <Check className="h-3 w-3" />
                        </span>
                      )}

                      <p className="text-sm font-semibold text-slate-900">
                        {variant.color}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {variant.storage}
                      </p>

                      <div className="mt-3 flex items-baseline gap-2">

                        <span className="font-bold text-slate-900">
                          ₹
                          {variant.price.toLocaleString("en-IN")}
                        </span>

                        <span className="text-xs text-slate-400 line-through">
                          ₹
                          {variant.mrp.toLocaleString("en-IN")}
                        </span>

                      </div>

                    </button>
                  );
                })}

              </div>

            </div>


            {/* =================================================
                Price
                ================================================= */}

            <div className="mt-8 rounded-2xl bg-white p-5 ring-1 ring-slate-200">

              <p className="text-sm text-slate-500">
                Product price
              </p>

              <div className="mt-1 flex items-baseline gap-3">

                <span className="text-3xl font-bold text-slate-900">
                  ₹{selectedVariant.price.toLocaleString("en-IN")}
                </span>

                <span className="text-sm text-slate-400 line-through">
                  ₹{selectedVariant.mrp.toLocaleString("en-IN")}
                </span>

              </div>

              <p className="mt-2 text-xs font-medium text-success-600">
                You save ₹
                {selectedVariant.discount.toLocaleString("en-IN")}
              </p>

            </div>


            {/* =================================================
                EMI Plans
                ================================================= */}

            <div className="mt-8">

              <div className="flex items-end justify-between">

                <div>

                  <h2 className="text-lg font-bold text-slate-900">
                    Choose your EMI plan
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Select the plan that works best for you.
                  </p>

                </div>

                <span className="hidden text-xs text-slate-400 sm:block">
                  {emiPlans.length} plans
                </span>

              </div>


              <div className="mt-4 space-y-3">

                {emiPlans.map((plan) => {

                  const isSelected =
                    plan.id === selectedPlanId;

                  return (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => setSelectedPlanId(plan.id)}
                      className={`w-full rounded-2xl border p-5 text-left transition-all duration-200 ${
                        isSelected
                          ? "border-primary-500 bg-primary-50 ring-2 ring-primary-100"
                          : "border-slate-200 bg-white hover:border-primary-200"
                      }`}
                    >

                      <div className="flex items-start gap-4">

                        {/* Radio */}
                        <div
                          className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                            isSelected
                              ? "border-primary-600"
                              : "border-slate-300"
                          }`}
                        >
                          {isSelected && (
                            <div className="h-2.5 w-2.5 rounded-full bg-primary-600" />
                          )}
                        </div>


                        {/* Plan */}
                        <div className="min-w-0 flex-1">

                          <div className="flex flex-wrap items-center justify-between gap-3">

                            <div>

                              <p className="font-semibold text-slate-900">
                                ₹
                                {plan.monthlyAmount.toLocaleString(
                                  "en-IN"
                                )}
                                <span className="ml-1 text-xs font-medium text-slate-500">
                                  / month
                                </span>
                              </p>

                              <p className="mt-1 text-xs text-slate-500">
                                {plan.tenureMonths} month tenure
                              </p>

                            </div>


                            {plan.cashback > 0 && (
                              <span className="badge-success">
                                ₹
                                {plan.cashback.toLocaleString(
                                  "en-IN"
                                )}{" "}
                                cashback
                              </span>
                            )}

                          </div>


                          {/* Plan details */}
                          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs">

                            <span className="text-slate-500">
                              Interest{" "}
                              <strong className="text-slate-700">
                                {plan.interestRate}%
                              </strong>
                            </span>

                            <span className="text-slate-500">
                              Total{" "}
                              <strong className="text-slate-700">
                                ₹
                                {(
                                  plan.monthlyAmount *
                                  plan.tenureMonths
                                ).toLocaleString("en-IN")}
                              </strong>
                            </span>

                          </div>

                        </div>

                      </div>

                    </button>
                  );
                })}

              </div>

            </div>


            {/* =================================================
                Purchase Summary
                ================================================= */}

            <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5">

              <div className="flex items-center gap-2">

                <Sparkles className="h-4 w-4 text-primary-600" />

                <h2 className="text-sm font-semibold text-slate-900">
                  Purchase summary
                </h2>

              </div>

              <div className="mt-4 space-y-3">

                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">
                    Product
                  </span>

                  <span className="font-medium text-slate-900">
                    ₹{selectedVariant.price.toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">
                    EMI
                  </span>

                  <span className="font-medium text-slate-900">
                    ₹
                    {selectedPlan.monthlyAmount.toLocaleString(
                      "en-IN"
                    )}
                    /month
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">
                    Tenure
                  </span>

                  <span className="font-medium text-slate-900">
                    {selectedPlan.tenureMonths} months
                  </span>
                </div>

                <div className="my-3 h-px bg-slate-200" />

                <div className="flex justify-between">

                  <span className="font-semibold text-slate-900">
                    Cashback
                  </span>

                  <span className="font-bold text-success-600">
                    ₹
                    {selectedPlan.cashback.toLocaleString(
                      "en-IN"
                    )}
                  </span>

                </div>

              </div>

            </div>


            {/* =================================================
                CTA
                ================================================= */}

            <button
              type="button"
              className="btn-primary mt-5 w-full py-4 text-base"
            >
              Proceed with EMI
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>

            <p className="mt-3 text-center text-xs text-slate-400">
              You will be asked to sign in before completing your purchase.
            </p>

          </div>

        </div>

      </section>


      {/* =====================================================
          Bottom reassurance
          ===================================================== */}

      <section className="border-t border-slate-200 bg-white">

        <div className="page-container py-8">

          <div className="flex flex-col items-center justify-center gap-3 text-center sm:flex-row sm:text-left">

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success-50">
              <ShieldCheck className="h-5 w-5 text-success-600" />
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-900">
                Secure and transparent EMI experience
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Your selected plan and purchase details are clearly shown before confirmation.
              </p>
            </div>

          </div>

        </div>

      </section>

    </main>
  );
}

export default ProductDetails;