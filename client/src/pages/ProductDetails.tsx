import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  CreditCard,
  IndianRupee,
  Loader2,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  X,
} from "lucide-react";

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

interface OrderResponse {
  message: string;
  order: {
    id: string;
    paidEMIs?: number;
    paidAmount?: number;
    nextInstallmentDate?: string;
    status?: string;
  };
}

interface Toast {
  type: "success" | "error";
  message: string;
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

  const [purchaseMode, setPurchaseMode] = useState<"emi" | "full">("emi");

  const [loadingProduct, setLoadingProduct] = useState(true);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [creatingOrder, setCreatingOrder] = useState(false);

  const [error, setError] = useState("");

  // Toast notification
  const [toast, setToast] = useState<Toast | null>(null);

  // Confirmation modal
  const [showConfirmation, setShowConfirmation] = useState(false);

  const [confirmationTitle, setConfirmationTitle] =
    useState("Order Confirmed!");

  const [confirmationMessage, setConfirmationMessage] =
    useState("");

  /*
   * ============================================================
   * TOAST AUTO DISMISS
   * ============================================================
   */

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => {
      setToast(null);
    }, 4000);

    return () => clearTimeout(timer);
  }, [toast]);

  /*
   * ============================================================
   * FETCH PRODUCT
   * ============================================================
   */

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

  /*
   * ============================================================
   * FETCH EMI PLANS
   * ============================================================
   */

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
        setSelectedPlanId(plans[0]?._id ?? "");
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

  /*
   * ============================================================
   * SELECTED VARIANT
   * ============================================================
   */

  const selectedVariant = useMemo(() => {
    if (!product) return undefined;

    return (
      product.variants.find(
        (variant) => variant._id === selectedVariantId
      ) ?? product.variants[0]
    );
  }, [product, selectedVariantId]);

  /*
   * ============================================================
   * SELECTED EMI PLAN
   * ============================================================
   */

  const selectedPlan = useMemo(() => {
    return emiPlans.find(
      (plan) => plan._id === selectedPlanId
    );
  }, [emiPlans, selectedPlanId]);

  const discountPercent = selectedVariant
    ? selectedVariant.discount ??
      getDiscountPercent(
        selectedVariant.mrp,
        selectedVariant.price
      )
    : 0;

  /*
   * ============================================================
   * CREATE ORDER
   * ============================================================
   */

  const createOrder = async (order: PendingOrder) => {
    try {
      setCreatingOrder(true);
      setError("");
      setToast(null);

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

      /*
       * Create the order
       */
      const response = await axios.post<OrderResponse>(
        `${apiUrl}/orders`,
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

      const createdOrderId = response.data.order?.id;

      if (!createdOrderId) {
        throw new Error(
          "Order ID was not returned by the server."
        );
      }

      /*
       * FULL PAYMENT
       *
       * Current backend architecture creates the order first
       * and then marks it as fully paid.
       */
      if (purchaseMode === "full") {
        const paymentResponse = await axios.post<OrderResponse>(
          `${apiUrl}/orders/${createdOrderId}/pay-full`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log(
          "Full payment successful:",
          paymentResponse.data
        );

        setConfirmationTitle("Payment Successful!");

        setConfirmationMessage(
          "Your payment has been completed successfully. Your order is now fully paid and marked as completed."
        );
      } else {
        /*
         * EMI ORDER
         */
        setConfirmationTitle("Order Confirmed!");

        setConfirmationMessage(
          "Your order has been successfully created. You can manage your EMI and make payments from your dashboard."
        );
      }

      /*
       * Show confirmation modal
       */
      setShowConfirmation(true);
    } catch (error) {
      console.error(
        "Unable to create/process order:",
        error
      );

      if (axios.isAxiosError(error)) {
        /*
         * Authentication failure
         */
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

        /*
         * Show API error as toast
         */
        setToast({
          type: "error",
          message:
            error.response?.data?.message ||
            "Unable to process your order. Please try again.",
        });

        return;
      }

      /*
       * Generic error
       */
      setToast({
        type: "error",
        message:
          "Something went wrong while processing your order.",
      });
    } finally {
      setCreatingOrder(false);
    }
  };

  /*
   * ============================================================
   * PROCEED
   * ============================================================
   */

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

    if (token) {
      createOrder(pendingOrder);
      return;
    }

    navigate("/signin", {
      state: {
        from: location.pathname,
        pendingOrder,
      },
    });
  };

  /*
   * ============================================================
   * LOADING
   * ============================================================
   */

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

  /*
   * ============================================================
   * PRODUCT NOT FOUND
   * ============================================================
   */

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

  /*
   * ============================================================
   * MAIN UI
   * ============================================================
   */

  return (
    <>
      <main className="min-h-screen bg-slate-50">
        <div className="page-container py-6 sm:py-8">
          <Link
            to="/products"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-indigo-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to products
          </Link>

          {/* Product / EMI loading errors */}
          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            {/* ==================================================
                PRODUCT IMAGE
            ================================================== */}

            <div className="card flex min-h-105 items-center justify-center overflow-hidden bg-white p-6 sm:min-h-140 sm:p-10">
              <div className="relative flex h-full w-full items-center justify-center">
                {discountPercent > 0 && (
                  <span className="absolute left-0 top-0 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                    {discountPercent}% OFF
                  </span>
                )}

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

            {/* ==================================================
                PRODUCT DETAILS
            ================================================== */}

            <div className="flex flex-col">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-indigo-600">
                <Sparkles className="h-4 w-4" />
                Flexible purchase options
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                {product.name}
              </h1>

              {product.description && (
                <p className="mt-4 max-w-2xl leading-7 text-slate-500">
                  {product.description}
                </p>
              )}

              {/* ==================================================
                  VARIANTS
              ================================================== */}

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
                      variant._id === selectedVariantId;

                    return (
                      <button
                        key={variant._id}
                        type="button"
                        onClick={() =>
                          setSelectedVariantId(variant._id)
                        }
                        className={`relative rounded-2xl border p-3 text-left transition ${
                          isSelected
                            ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-100"
                            : "border-slate-200 bg-white hover:border-indigo-300"
                        }`}
                      >
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
                              {formatCurrency(variant.price)}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ==================================================
                  PRICE
              ================================================== */}

              {selectedVariant && (
                <div className="mt-6 flex items-end gap-3">
                  <span className="text-3xl font-bold text-slate-950">
                    {formatCurrency(selectedVariant.price)}
                  </span>

                  {selectedVariant.mrp >
                    selectedVariant.price && (
                    <>
                      <span className="pb-1 text-sm text-slate-400 line-through">
                        {formatCurrency(selectedVariant.mrp)}
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

              {/* ==================================================
                  PAYMENT METHOD
              ================================================== */}

              <div className="mt-8">
                <h2 className="text-lg font-bold text-slate-950">
                  Choose payment method
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Choose how you want to pay for your purchase.
                </p>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {/* EMI */}
                  <button
                    type="button"
                    onClick={() => setPurchaseMode("emi")}
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
                            Split your purchase into monthly
                            payments.
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

                  {/* FULL PAYMENT */}
                  <button
                    type="button"
                    onClick={() => setPurchaseMode("full")}
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

              {/* ==================================================
                  EMI PLANS
              ================================================== */}

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

                  {loadingPlans ? (
                    <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 text-slate-500">
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Loading EMI plans...
                    </div>
                  ) : emiPlans.length === 0 ? (
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
                      No active EMI plans are available for this
                      product.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {emiPlans.map((plan) => {
                        const isSelected =
                          plan._id === selectedPlanId;

                        return (
                          <button
                            key={plan._id}
                            type="button"
                            onClick={() =>
                              setSelectedPlanId(plan._id)
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

              {/* ==================================================
                  PURCHASE SUMMARY
              ================================================== */}

              {selectedVariant && (
                <div className="mt-6 rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">
                      Product price
                    </span>

                    <span className="font-semibold text-slate-900">
                      {formatCurrency(selectedVariant.price)}
                    </span>
                  </div>

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
                            {selectedPlan.tenureMonths} months
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
                      creatingOrder ||
                      !selectedVariant ||
                      !selectedPlan
                    }
                    className="btn-primary mt-5 flex w-full items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {creatingOrder ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />

                        {purchaseMode === "full"
                          ? "Processing Payment..."
                          : "Creating Order..."}
                      </>
                    ) : (
                      <>
                        {purchaseMode === "emi"
                          ? "Proceed with EMI"
                          : "Pay Full Amount"}

                        <ChevronDown className="h-4 w-4 -rotate-90" />
                      </>
                    )}
                  </button>

                  <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
                    <ShieldCheck className="h-4 w-4" />
                    Secure purchase flow
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* ==================================================
              BENEFITS
          ================================================== */}

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

      {/* ========================================================
          SUCCESS / ERROR TOAST
      ======================================================== */}

      {toast && (
        <div className="fixed bottom-5 right-5 z-[100] w-[calc(100%-2rem)] max-w-sm">
          <div
            className={`rounded-2xl border bg-white p-4 shadow-2xl ${
              toast.type === "error"
                ? "border-red-200"
                : "border-emerald-200"
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                  toast.type === "error"
                    ? "bg-red-100 text-red-600"
                    : "bg-emerald-100 text-emerald-600"
                }`}
              >
                {toast.type === "error" ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Check className="h-5 w-5" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-900">
                  {toast.type === "error"
                    ? "Something went wrong"
                    : "Success"}
                </p>

                <p className="mt-1 text-sm leading-5 text-slate-500">
                  {toast.message}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setToast(null)}
                className="rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close notification"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          CONFIRMATION MODAL
      ======================================================== */}

      {showConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
            {/* Close */}
            <button
              type="button"
              onClick={() => setShowConfirmation(false)}
              className="absolute right-4 top-4 rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              aria-label="Close confirmation"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Success Icon */}
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <Check className="h-8 w-8" />
            </div>

            {/* Confirmation Message */}
            <div className="mt-5 text-center">
              <h2 className="text-2xl font-bold text-slate-950">
                {confirmationTitle}
              </h2>

              <p className="mt-2 leading-6 text-slate-500">
                {confirmationMessage}
              </p>
            </div>

            {/* Order Summary */}
            {selectedVariant && selectedPlan && (
              <div className="mt-6 rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedVariant.image}
                    alt={selectedVariant.color}
                    className="h-14 w-14 rounded-xl bg-white object-contain"
                  />

                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-900">
                      {product.name}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {selectedVariant.color} ·{" "}
                      {selectedVariant.storage}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4">
                  <span className="text-sm text-slate-500">
                    Amount
                  </span>

                  <span className="font-semibold text-slate-900">
                    {formatCurrency(selectedVariant.price)}
                  </span>
                </div>

                {purchaseMode === "emi" && (
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm text-slate-500">
                      EMI
                    </span>

                    <span className="font-semibold text-indigo-600">
                      {formatCurrency(
                        selectedPlan.monthlyAmount
                      )}{" "}
                      × {selectedPlan.tenureMonths} months
                    </span>
                  </div>
                )}

                {purchaseMode === "full" && (
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm text-slate-500">
                      Payment status
                    </span>

                    <span className="font-semibold text-emerald-600">
                      Fully Paid
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="btn-primary flex items-center justify-center gap-2"
              >
                Go to Dashboard
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowConfirmation(false);
                  navigate("/products");
                }}
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Continue Shopping
              </button>
            </div>

            <div className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="h-4 w-4" />
              Your transaction is securely processed
            </div>
          </div>
        </div>
      )}
    </>
  );
}