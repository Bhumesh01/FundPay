import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, Check, ChevronDown, CreditCard, IndianRupee, Loader2, ShieldCheck, ShoppingBag, Sparkles } from "lucide-react";

interface ProductVariant {
  _id: string;
  color: string;
  storage: string;
  mrp: number;
  price: number;
  discount?: number;
  image: string;
}
interface PendingOrder {
  productId: string;
  variantId: string;
  emiPlanId: string;
  purchasePrice: number;
}
interface Product {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  variants: ProductVariant[];
}

interface EMIPlan {
  _id: string;
  productId: string;
  tenureMonths: number;
  monthlyAmount: number;
  interestRate: number;
  cashback: number;
  isActive: boolean;
}

interface ProductResponse {
  message: string;
  product: Product;
}

interface EMIResponse {
  message: string;
  plans: EMIPlan[];
}

const apiUrl = import.meta.env.VITE_API_URL;

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

const getDiscountPercent = (mrp: number, price: number) => {
  if (!mrp || mrp <= price) return 0;

  return Math.round(((mrp - price) / mrp) * 100);
};

export default function ProductDetails() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [product, setProduct] = useState<Product | null>(null);

  const [emiPlans, setEmiPlans] = useState<EMIPlan[]>([]);

  const [selectedVariantId, setSelectedVariantId] = useState("");
  const [selectedPlanId, setSelectedPlanId] = useState("");

  // EMI or full payment
  const [purchaseMode, setPurchaseMode] = useState<"emi" | "full">("emi");

  const [loadingProduct, setLoadingProduct] = useState(true);
  const [loadingPlans, setLoadingPlans] = useState(false);

  const [error, setError] = useState("");

  const handleProceed = () => {
    if (!product || !selectedVariant || !selectedPlan) {
      return;
    }
  
    const token = localStorage.getItem("token");
  
    const pendingOrder: PendingOrder = {
      productId: product._id,
      variantId: selectedVariant._id,
      emiPlanId: selectedPlan._id,
      purchasePrice: selectedVariant.price,
    };
  
    // User is already logged in
    if (token) {
      createOrder(pendingOrder);
      return;
    }
  
    // User is not logged in
    navigate("/signin", {
      state: {
        from: location.pathname,
        pendingOrder,
      },
    });
  };
  const createOrder = async (order: PendingOrder) => {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/signin", {
        state: {
          from: location.pathname,
          pendingOrder: order,
        },
      });

      return;
    }

    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/orders`,
      {
        productId: order.productId,
        variantId: order.variantId,
        emiPlanId: order.emiPlanId,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("Order created:", response.data);

    navigate("/dashboard");
  } catch (error) {
    console.error("Unable to create order:", error);

    if (axios.isAxiosError(error)) {
      if (
        error.response?.status === 401 ||
        error.response?.status === 403
      ) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/signin", {
          state: {
            from: location.pathname,
            pendingOrder: order,
          },
        });

        return;
      }

      alert(
        error.response?.data?.message ||
          "Unable to place order. Please try again."
      );

      return;
    }

    alert("Something went wrong while placing the order.");
  }
};
  useEffect(() => {
    if (!slug) {
      setError("Product not found.");
      setLoadingProduct(false);
      return;
    }

    const fetchProduct = async () => {
      try {
        setLoadingProduct(true);
        setError("");

        const response = await axios.get<ProductResponse>(
          `${apiUrl}/products/${slug}`
        );

        const fetchedProduct = response.data.product;

        if (!fetchedProduct) {
          throw new Error("Product not found");
        }

        setProduct(fetchedProduct);

        // Select first variant by default
        setSelectedVariantId(
          fetchedProduct.variants[0]?._id ?? ""
        );
      } catch (error) {
        console.error("Failed to fetch product:", error);

        setError(
          "Unable to load this product. Please try again."
        );
      } finally {
        setLoadingProduct(false);
      }
    };

    fetchProduct();
  }, [slug]);

  useEffect(() => {
    if (!product?._id) return;

    const fetchEMIPlans = async () => {
      try {
        setLoadingPlans(true);
        setError("");

        const response = await axios.get<EMIResponse>(
          `${apiUrl}/emi-plans/product/${product._id}`
        );

        const plans = response.data.plans ?? [];

        setEmiPlans(plans);

        // Select first EMI plan by default
        setSelectedPlanId(
          plans[0]?._id ?? ""
        );
      } catch (error) {
        console.error("Failed to fetch EMI plans:", error);

        setEmiPlans([]);
        setSelectedPlanId("");

        setError(
          "Unable to load EMI plans for this product."
        );
      } finally {
        setLoadingPlans(false);
      }
    };

    fetchEMIPlans();
  }, [product?._id]);

  const selectedVariant = useMemo(() => {
    if (!product) return undefined;

    return (
      product.variants.find(
        (variant) =>
          variant._id === selectedVariantId
      ) ?? product.variants[0]
    );
  }, [product, selectedVariantId]);


  const selectedPlan = useMemo(() => {
    return emiPlans.find(
      (plan) =>
        plan._id === selectedPlanId
    );
  }, [emiPlans, selectedPlanId]);


  const discountPercent = selectedVariant
    ? selectedVariant.discount ??
      getDiscountPercent(
        selectedVariant.mrp,
        selectedVariant.price
      )
    : 0;
  if (loadingProduct) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto flex min-h-[70vh] max-w-7xl items-center justify-center px-4">
          <div className="flex items-center gap-3 text-slate-600">
            <Loader2 className="h-5 w-5 animate-spin" />

            Loading product...
          </div>
        </div>
      </main>
    );
  }


  if (!product) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-4 text-center">

          <div className="mb-5 rounded-full bg-indigo-100 p-4 text-indigo-600">
            <ShoppingBag className="h-7 w-7" />
          </div>

          <h1 className="text-2xl font-bold text-slate-900">
            Product unavailable
          </h1>

          <p className="mt-2 max-w-md text-slate-500">
            {error ||
              "We couldn't find the requested product."}
          </p>

          <Link
            to="/products"
            className="btn-primary mt-6 inline-flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />

            Back to products
          </Link>

        </div>
      </main>
    );
  }


  return (
    <main className="min-h-screen bg-slate-50">

      <div className="page-container py-6 sm:py-8">

        <Link
          to="/products"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-indigo-600"
        >
          <ArrowLeft className="h-4 w-4" />

          Back to products
        </Link>

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">


          <div className="card flex min-h-105  items-center justify-center overflow-hidden bg-white p-6 sm:min-h-[560px] sm:p-10">

            <div className="relative flex h-full w-full items-center justify-center">

              {/* Discount Badge */}

              {discountPercent > 0 && (
                <span className="absolute left-0 top-0 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                  {discountPercent}% OFF
                </span>
              )}

              {/* Product Image */}

              {selectedVariant?.image ? (
                <img
                  src={selectedVariant.image}
                  alt={`${product.name} ${selectedVariant.color}`}
                  className="max-h-107.5 w-full object-contain transition duration-300"
                />
              ) : (
                <div className="flex h-80 w-full items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                  No image available
                </div>
              )}

            </div>
          </div>

          <div className="flex flex-col">

            {/* Small Label */}

            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-indigo-600">

              <Sparkles className="h-4 w-4" />

              Flexible purchase options

            </div>

            {/* Product Name */}

            <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              {product.name}
            </h1>

            {/* Product Description */}

            {product.description && (
              <p className="mt-4 max-w-2xl leading-7 text-slate-500">
                {product.description}
              </p>
            )}

            <div className="mt-7">

              <div className="mb-3 flex items-center justify-between">

                <h2 className="text-sm font-semibold text-slate-900">
                  Choose variant
                </h2>

                {selectedVariant && (
                  <span className="text-sm text-slate-500">
                    {selectedVariant.color} ·{" "}
                    {selectedVariant.storage}
                  </span>
                )}

              </div>

              <div className="grid gap-3 sm:grid-cols-2">

                {product.variants.map((variant) => {

                  const isSelected =
                    variant._id ===
                    selectedVariantId;

                  return (
                    <button
                      key={variant._id}
                      type="button"
                      onClick={() =>
                        setSelectedVariantId(
                          variant._id
                        )
                      }
                      className={`relative rounded-2xl border p-3 text-left transition ${
                        isSelected
                          ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-100"
                          : "border-slate-200 bg-white hover:border-indigo-300"
                      }`}
                    >

                      {/* Selected Icon */}

                      {isSelected && (
                        <span className="absolute right-3 top-3 rounded-full bg-indigo-600 p-1 text-white">
                          <Check className="h-3 w-3" />
                        </span>
                      )}

                      <div className="flex items-center gap-3">

                        <img
                          src={variant.image}
                          alt={variant.color}
                          className="h-16 w-16 rounded-xl bg-slate-50 object-contain"
                        />

                        <div>

                          <p className="font-semibold text-slate-900">
                            {variant.color}
                          </p>

                          <p className="mt-1 text-sm text-slate-500">
                            {variant.storage}
                          </p>

                          <p className="mt-1 text-sm font-semibold text-slate-900">
                            {formatCurrency(
                              variant.price
                            )}
                          </p>

                        </div>

                      </div>

                    </button>
                  );
                })}

              </div>
            </div>


            {selectedVariant && (
              <div className="mt-6 flex items-end gap-3">

                <span className="text-3xl font-bold text-slate-950">
                  {formatCurrency(
                    selectedVariant.price
                  )}
                </span>

                {selectedVariant.mrp >
                  selectedVariant.price && (
                  <>

                    <span className="pb-1 text-sm text-slate-400 line-through">
                      {formatCurrency(
                        selectedVariant.mrp
                      )}
                    </span>

                    <span className="pb-1 text-sm font-semibold text-emerald-600">
                      Save{" "}
                      {formatCurrency(
                        selectedVariant.mrp -
                          selectedVariant.price
                      )}
                    </span>

                  </>
                )}

              </div>
            )}


            <div className="mt-8">

              <h2 className="text-lg font-bold text-slate-950">
                Choose payment method
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Choose how you want to pay for your purchase.
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">


                <button
                  type="button"
                  onClick={() =>
                    setPurchaseMode("emi")
                  }
                  className={`rounded-2xl border p-4 text-left transition ${
                    purchaseMode === "emi"
                      ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-100"
                      : "border-slate-200 bg-white hover:border-indigo-300"
                  }`}
                >

                  <div className="flex items-start justify-between">

                    <div className="flex items-center gap-3">

                      <div className="rounded-xl bg-indigo-100 p-2 text-indigo-600">
                        <CreditCard className="h-5 w-5" />
                      </div>

                      <div>

                        <p className="font-semibold text-slate-900">
                          Pay with EMI
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Split your purchase into monthly payments.
                        </p>

                      </div>

                    </div>

                    {purchaseMode === "emi" && (
                      <span className="rounded-full bg-indigo-600 p-1 text-white">
                        <Check className="h-3 w-3" />
                      </span>
                    )}

                  </div>

                </button>

                <button
                  type="button"
                  onClick={() =>
                    setPurchaseMode("full")
                  }
                  className={`rounded-2xl border p-4 text-left transition ${
                    purchaseMode === "full"
                      ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-100"
                      : "border-slate-200 bg-white hover:border-indigo-300"
                  }`}
                >

                  <div className="flex items-start justify-between">

                    <div className="flex items-center gap-3">

                      <div className="rounded-xl bg-emerald-100 p-2 text-emerald-600">
                        <IndianRupee className="h-5 w-5" />
                      </div>

                      <div>

                        <p className="font-semibold text-slate-900">
                          Buy Fully
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Pay the entire amount upfront.
                        </p>

                      </div>

                    </div>

                    {purchaseMode === "full" && (
                      <span className="rounded-full bg-indigo-600 p-1 text-white">
                        <Check className="h-3 w-3" />
                      </span>
                    )}

                  </div>

                </button>

              </div>
            </div>

            {purchaseMode === "emi" && (
              <div className="mt-8">

                <div className="mb-3 flex items-center justify-between">

                  <div>

                    <h2 className="text-lg font-bold text-slate-950">
                      Choose your EMI plan
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Pick a tenure that works for you.
                    </p>

                  </div>

                  <CreditCard className="h-5 w-5 text-indigo-500" />

                </div>

                {/* Loading EMI Plans */}

                {loadingPlans ? (
                  <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 text-slate-500">

                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />

                    Loading EMI plans...

                  </div>
                ) : emiPlans.length === 0 ? (

                  <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
                    No active EMI plans are available for this product.
                  </div>

                ) : (

                  <div className="space-y-3">

                    {emiPlans.map((plan) => {

                      const isSelected =
                        plan._id ===
                        selectedPlanId;

                      return (
                        <button
                          key={plan._id}
                          type="button"
                          onClick={() =>
                            setSelectedPlanId(
                              plan._id
                            )
                          }
                          className={`w-full rounded-2xl border p-4 text-left transition ${
                            isSelected
                              ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-100"
                              : "border-slate-200 bg-white hover:border-indigo-300"
                          }`}
                        >

                          <div className="flex items-center justify-between gap-4">

                            <div>

                              <div className="flex items-center gap-2">

                                <span className="text-base font-bold text-slate-900">
                                  {formatCurrency(
                                    plan.monthlyAmount
                                  )}
                                </span>

                                <span className="text-sm text-slate-500">
                                  / month
                                </span>

                              </div>

                              <div className="mt-2 flex flex-wrap gap-2 text-xs">

                                <span className="rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-600">
                                  {plan.tenureMonths} months
                                </span>

                                <span className="rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-600">
                                  {plan.interestRate}% interest
                                </span>

                                {plan.cashback > 0 && (
                                  <span className="rounded-full bg-emerald-100 px-2.5 py-1 font-semibold text-emerald-700">
                                    {formatCurrency(
                                      plan.cashback
                                    )}{" "}
                                    cashback
                                  </span>
                                )}

                              </div>

                            </div>

                            {/* Radio */}

                            <span
                              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                                isSelected
                                  ? "border-indigo-600 bg-indigo-600 text-white"
                                  : "border-slate-300 bg-white"
                              }`}
                            >

                              {isSelected && (
                                <Check className="h-3 w-3" />
                              )}

                            </span>

                          </div>

                        </button>
                      );
                    })}

                  </div>
                )}

              </div>
            )}

            {/* =================================================
                PURCHASE SUMMARY
            ================================================= */}

            {selectedVariant && (
              <div className="mt-6 rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm">

                {/* Product Price */}

                <div className="flex items-center justify-between">

                  <span className="text-sm text-slate-500">
                    Product price
                  </span>

                  <span className="font-semibold text-slate-900">
                    {formatCurrency(
                      selectedVariant.price
                    )}
                  </span>

                </div>

                {/* =================================================
                    EMI SUMMARY
                ================================================= */}

                {purchaseMode === "emi" &&
                  selectedPlan && (
                    <>

                      <div className="mt-3 flex items-center justify-between">

                        <span className="text-sm text-slate-500">
                          Monthly payment
                        </span>

                        <span className="text-lg font-bold text-indigo-600">
                          {formatCurrency(
                            selectedPlan.monthlyAmount
                          )}
                        </span>

                      </div>

                      <div className="mt-2 flex items-center justify-between">

                        <span className="text-sm text-slate-500">
                          Tenure
                        </span>

                        <span className="font-semibold text-slate-900">
                          {selectedPlan.tenureMonths}{" "}
                          months
                        </span>

                      </div>

                      <div className="mt-2 flex items-center justify-between">

                        <span className="text-sm text-slate-500">
                          Interest rate
                        </span>

                        <span className="font-semibold text-slate-900">
                          {selectedPlan.interestRate}%
                        </span>

                      </div>

                      {selectedPlan.cashback > 0 && (
                        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">

                          <span className="text-sm text-slate-500">
                            Cashback
                          </span>

                          <span className="font-semibold text-emerald-600">
                            {formatCurrency(
                              selectedPlan.cashback
                            )}
                          </span>

                        </div>
                      )}

                    </>
                  )}


                {purchaseMode === "full" && (
                  <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">

                    <span className="text-sm text-slate-500">
                      Payment
                    </span>

                    <span className="font-bold text-emerald-600">
                      Full Payment
                    </span>

                  </div>
                )}


                <button
                  type="button"
                  onClick={handleProceed}
                  disabled={
                    purchaseMode === "emi" &&
                    !selectedPlan
                  }
                  className="btn-primary mt-5 flex w-full items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
                >

                  {purchaseMode === "emi"
                    ? "Proceed with EMI"
                    : "Buy Now"}

                  <ChevronDown className="h-4 w-4 -rotate-90" />

                </button>

                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400">

                  <ShieldCheck className="h-4 w-4" />

                  Secure purchase flow

                </div>

              </div>
            )}

          </div>

        </section>

        <section className="mt-8 grid gap-4 sm:grid-cols-3">

          <div className="rounded-2xl border border-slate-200 bg-white p-5">

            <CreditCard className="h-5 w-5 text-indigo-600" />

            <h3 className="mt-3 font-semibold text-slate-900">
              Flexible EMI
            </h3>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              Choose the tenure that suits your budget.
            </p>

          </div>


          <div className="rounded-2xl border border-slate-200 bg-white p-5">

            <IndianRupee className="h-5 w-5 text-indigo-600" />

            <h3 className="mt-3 font-semibold text-slate-900">
              Buy Fully
            </h3>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              Prefer to pay upfront? Pay the full product price.
            </p>

          </div>


          <div className="rounded-2xl border border-slate-200 bg-white p-5">

            <ShieldCheck className="h-5 w-5 text-indigo-600" />

            <h3 className="mt-3 font-semibold text-slate-900">
              Secure checkout
            </h3>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              Authentication protects your purchase flow.
            </p>

          </div>

        </section>

      </div>

    </main>
  );
}