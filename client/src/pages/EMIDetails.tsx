import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowRight, ArrowLeft, CalendarDays, CheckCircle2, CreditCard, Loader2, Package, ShieldCheck, WalletCards, X } from "lucide-react";

interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

interface Variant {
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

interface Order {
  id: string;

  product: Product;
  variant: Variant;
  emiPlan: EMIPlan;

  purchasePrice: number;

  // DB-backed payment state
  paidEMIs: number;
  paidAmount: number;

  startDate: string;
  nextInstallmentDate: string;

  status: "active" | "completed" | "cancelled";

  createdAt: string;
  updatedAt: string;
}

interface OrdersResponse {
  message: string;
  orders: Order[];
}

interface PaymentResponse {
  message: string;
  order: {
    id: string;
    paidEMIs: number;
    paidAmount: number;
    nextInstallmentDate: string;
    status: "active" | "completed" | "cancelled";
  };
}

interface Toast {
  type: "success" | "error";
  message: string;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
};

const formatDate = (date: string) => {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function EMIDetails() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  const apiUrl = import.meta.env.VITE_API_URL;

  const [order, setOrder] = useState<Order | null>(null);

  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const [error, setError] = useState("");

  const [toast, setToast] = useState<Toast | null>(null);

  const [showEMIConfirm, setShowEMIConfirm] = useState(false);
  const [showFullConfirm, setShowFullConfirm] = useState(false);

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
   * FETCH ORDER
   * ============================================================
   */

  useEffect(() => {
    if (!orderId) {
      setError("Invalid order ID.");
      setLoading(false);
      return;
    }

    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/signin");
        return;
      }

      const response = await axios.get<OrdersResponse>(
        `${apiUrl}/orders`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const foundOrder = response.data.orders.find(
        (item) => item.id === orderId
      );

      if (!foundOrder) {
        setError("Order not found.");
        return;
      }

      setOrder(foundOrder);
    } catch (err: any) {
      console.error("Error fetching order:", err);

      if (
        err?.response?.status === 401 ||
        err?.response?.status === 403
      ) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/signin");
        return;
      }

      setError(
        err?.response?.data?.message ||
          "Unable to load EMI details."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * ============================================================
   * CALCULATED VALUES
   * ============================================================
   */

  const completedEMIs = order?.paidEMIs || 0;

  const totalEMIs = order?.emiPlan?.tenureMonths || 0;

  const remainingEMIs = useMemo(() => {
    if (!order?.emiPlan) return 0;

    return Math.max(
      order.emiPlan.tenureMonths -
        (order.paidEMIs || 0),
      0
    );
  }, [order]);

  const remainingAmount = useMemo(() => {
    if (!order?.emiPlan) return 0;

    return (
      remainingEMIs *
      order.emiPlan.monthlyAmount
    );
  }, [order, remainingEMIs]);

  const progress = useMemo(() => {
    if (
      !order?.emiPlan ||
      order.emiPlan.tenureMonths <= 0
    ) {
      return 0;
    }

    return Math.min(
      Math.round(
        ((order.paidEMIs || 0) /
          order.emiPlan.tenureMonths) *
          100
      ),
      100
    );
  }, [order]);

  const isCompleted = order?.status === "completed";

  /*
   * ============================================================
   * PAY EMI
   * ============================================================
   */

  const handlePayEMI = async () => {
    if (!order) return;

    try {
      setPaymentLoading(true);
      setError("");
      setToast(null);

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/signin");
        return;
      }

      const response = await axios.post<PaymentResponse>(
        `${apiUrl}/orders/${order.id}/pay-emi`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      /*
       * Merge backend payment state into current order.
       */
      setOrder((currentOrder) => {
        if (!currentOrder) return currentOrder;

        return {
          ...currentOrder,
          paidEMIs: response.data.order.paidEMIs,
          paidAmount: response.data.order.paidAmount,
          nextInstallmentDate:
            response.data.order.nextInstallmentDate,
          status: response.data.order.status,
          updatedAt: new Date().toISOString(),
        };
      });

      setShowEMIConfirm(false);

      setToast({
        type: "success",
        message:
          response.data.message ||
          "Your EMI payment was successful.",
      });
    } catch (err: any) {
      console.error("EMI payment error:", err);

      if (
        err?.response?.status === 401 ||
        err?.response?.status === 403
      ) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/signin");
        return;
      }

      setToast({
        type: "error",
        message:
          err?.response?.data?.message ||
          "Unable to process EMI payment.",
      });
    } finally {
      setPaymentLoading(false);
    }
  };

  /*
   * ============================================================
   * PAY FULL AMOUNT
   * ============================================================
   */

  const handlePayFullAmount = async () => {
    if (!order) return;

    try {
      setPaymentLoading(true);
      setError("");
      setToast(null);

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/signin");
        return;
      }

      const response = await axios.post<PaymentResponse>(
        `${apiUrl}/orders/${order.id}/pay-full`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      /*
       * Merge backend payment state into current order.
       */
      setOrder((currentOrder) => {
        if (!currentOrder) return currentOrder;

        return {
          ...currentOrder,
          paidEMIs: response.data.order.paidEMIs,
          paidAmount: response.data.order.paidAmount,
          nextInstallmentDate:
            response.data.order.nextInstallmentDate,
          status: response.data.order.status,
          updatedAt: new Date().toISOString(),
        };
      });

      setShowFullConfirm(false);

      setToast({
        type: "success",
        message:
          response.data.message ||
          "Your full payment was successful.",
      });
    } catch (err: any) {
      console.error("Full payment error:", err);

      if (
        err?.response?.status === 401 ||
        err?.response?.status === 403
      ) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/signin");
        return;
      }

      setToast({
        type: "error",
        message:
          err?.response?.data?.message ||
          "Unable to process full payment.",
      });
    } finally {
      setPaymentLoading(false);
    }
  };

  /*
   * ============================================================
   * LOADING
   * ============================================================
   */

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f7f7fb]">
        <div className="mx-auto flex min-h-[70vh] max-w-5xl items-center justify-center px-5">
          <div className="flex flex-col items-center gap-3 text-slate-500">
            <Loader2 className="h-8 w-8 animate-spin text-violet-600" />

            <p className="text-sm font-medium">
              Loading EMI details...
            </p>
          </div>
        </div>
      </main>
    );
  }

  /*
   * ============================================================
   * ERROR
   * ============================================================
   */

  if (!order) {
    return (
      <main className="min-h-screen bg-[#f7f7fb]">
        <div className="mx-auto flex min-h-[70vh] max-w-5xl items-center justify-center px-5">
          <div className="rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
            <p className="font-semibold text-red-700">
              {error || "Order not found."}
            </p>

            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="mt-5 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </main>
    );
  }

  const product = order.product;
  const variant = order.variant;
  const emi = order.emiPlan;

  /*
   * ============================================================
   * UI
   * ============================================================
   */

  return (
    <main className="min-h-screen bg-[#f7f7fb] text-slate-900">
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:px-10 lg:py-10">

        {/* ======================================================
            HEADER
        ====================================================== */}

        <div className="mb-8">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </button>

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-violet-600">
                EMI Management
              </p>

              <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                Your EMI Details
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Manage your investment-backed purchase and payments.
              </p>
            </div>

            <div>
              {isCompleted ? (
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" />
                  Completed
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 rounded-full bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700">
                  <span className="h-2 w-2 rounded-full bg-violet-600" />
                  Active
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ======================================================
            PRODUCT CARD
        ====================================================== */}

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="grid lg:grid-cols-[0.8fr_1.2fr]">

            {/* IMAGE */}

            <div className="flex min-h-[300px] items-center justify-center bg-[#f5f5f7] p-8">
              {variant?.image ? (
                <img
                  src={variant.image}
                  alt={product?.name || "Product"}
                  className="max-h-[280px] w-full max-w-[380px] object-contain drop-shadow-[0_20px_25px_rgba(15,23,42,0.12)]"
                />
              ) : (
                <Package className="h-20 w-20 text-slate-300" />
              )}
            </div>

            {/* DETAILS */}

            <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-violet-600">
                Purchase
              </p>

              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                {product?.name || "Product"}
              </h2>

              {variant && (
                <p className="mt-2 text-sm text-slate-500">
                  {variant.color}
                  <span className="mx-2">·</span>
                  {variant.storage}
                </p>
              )}

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-400">
                    Purchase Price
                  </p>

                  <p className="mt-1 text-lg font-bold text-slate-950">
                    {formatCurrency(order.purchasePrice)}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-400">
                    Amount Paid
                  </p>

                  <p className="mt-1 text-lg font-bold text-emerald-600">
                    {formatCurrency(order.paidAmount || 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================
            EMI OVERVIEW
        ====================================================== */}

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <CreditCard className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-950">
                EMI Plan
              </h2>

              <p className="text-sm text-slate-500">
                Your selected repayment plan
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="text-xs text-slate-400">
                Monthly EMI
              </p>

              <p className="mt-2 text-xl font-bold text-slate-950">
                {formatCurrency(emi.monthlyAmount)}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="text-xs text-slate-400">
                Tenure
              </p>

              <p className="mt-2 text-xl font-bold text-slate-950">
                {emi.tenureMonths} months
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="text-xs text-slate-400">
                Interest Rate
              </p>

              <p className="mt-2 text-xl font-bold text-slate-950">
                {emi.interestRate}%
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="text-xs text-slate-400">
                Cashback
              </p>

              <p className="mt-2 text-xl font-bold text-emerald-600">
                {formatCurrency(emi.cashback)}
              </p>
            </div>
          </div>
        </section>

        {/* ======================================================
            PAYMENT PROGRESS
        ====================================================== */}

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-950">
                Payment Progress
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Track your completed EMI payments.
              </p>
            </div>

            <p className="text-lg font-bold text-violet-600">
              {completedEMIs} / {totalEMIs} EMIs
            </p>
          </div>

          {/* PROGRESS BAR */}

          <div className="mt-6">
            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-violet-600 transition-all duration-500"
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>

            <div className="mt-2 flex justify-between text-xs text-slate-400">
              <span>{progress}% completed</span>

              <span>
                {remainingEMIs}{" "}
                {remainingEMIs === 1 ? "EMI" : "EMIs"} remaining
              </span>
            </div>
          </div>

          {/* PAYMENT STATS */}

          <div className="mt-7 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-100 p-5">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <WalletCards className="h-4 w-4" />
                Amount Paid
              </div>

              <p className="mt-2 text-xl font-bold text-slate-950">
                {formatCurrency(order.paidAmount || 0)}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 p-5">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <CreditCard className="h-4 w-4" />
                Remaining
              </div>

              <p className="mt-2 text-xl font-bold text-slate-950">
                {formatCurrency(remainingAmount)}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 p-5">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <CalendarDays className="h-4 w-4" />
                Next Payment
              </div>

              <p className="mt-2 text-xl font-bold text-slate-950">
                {isCompleted
                  ? "Completed"
                  : formatDate(order.nextInstallmentDate)}
              </p>
            </div>
          </div>
        </section>

        {/* ======================================================
            PAYMENT OPTIONS
        ====================================================== */}

        {!isCompleted && remainingEMIs > 0 && (
          <section className="mt-6">
            <div className="mb-4">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                Payment
              </p>

              <h2 className="mt-1 text-xl font-bold text-slate-950">
                Choose how you want to pay
              </h2>
            </div>

            <div className="grid gap-5 md:grid-cols-2">

              {/* PAY EMI */}

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                  <CreditCard className="h-5 w-5" />
                </div>

                <h3 className="mt-5 text-lg font-bold text-slate-950">
                  Pay Next EMI
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Pay your next scheduled installment and
                  continue your EMI plan.
                </p>

                <div className="mt-5">
                  <p className="text-xs text-slate-400">
                    Amount
                  </p>

                  <p className="mt-1 text-3xl font-bold text-slate-950">
                    {formatCurrency(emi.monthlyAmount)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setToast(null);
                    setShowEMIConfirm(true);
                  }}
                  disabled={paymentLoading}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Pay EMI
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              {/* PAY FULL */}

              <div className="rounded-3xl border border-violet-200 bg-white p-6 shadow-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <WalletCards className="h-5 w-5" />
                </div>

                <h3 className="mt-5 text-lg font-bold text-slate-950">
                  Pay Full Amount
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Clear all remaining EMIs at once and complete
                  your purchase.
                </p>

                <div className="mt-5">
                  <p className="text-xs text-slate-400">
                    Remaining Amount
                  </p>

                  <p className="mt-1 text-3xl font-bold text-slate-950">
                    {formatCurrency(remainingAmount)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setToast(null);
                    setShowFullConfirm(true);
                  }}
                  disabled={paymentLoading}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-violet-600 px-5 py-3.5 text-sm font-bold text-violet-600 transition hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Pay Full Amount
                  <CheckCircle2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ======================================================
            COMPLETED MESSAGE
        ====================================================== */}

        {isCompleted && (
          <section className="mt-6 overflow-hidden rounded-3xl border border-emerald-200 bg-emerald-50 p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="h-7 w-7" />
            </div>

            <h2 className="mt-4 text-2xl font-bold text-emerald-900">
              EMI Completed 🎉
            </h2>

            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-emerald-700">
              All payments for this purchase have been
              completed successfully.
            </p>
          </section>
        )}

        {/* ======================================================
            SECURITY INFO
        ====================================================== */}

        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="h-4 w-4" />
          Payments are securely processed through your
          investment-backed EMI plan.
        </div>
      </div>

      {/* ========================================================
          TOAST
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
                  <CheckCircle2 className="h-5 w-5" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-900">
                  {toast.type === "error"
                    ? "Something went wrong"
                    : "Payment Successful"}
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
          EMI CONFIRMATION MODAL
      ======================================================== */}

      {showEMIConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-5 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
              <CreditCard className="h-6 w-6" />
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-950">
              Confirm EMI Payment
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Are you sure you want to pay your next EMI?
            </p>

            <div className="mt-5 rounded-2xl bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">
                  EMI Amount
                </span>

                <span className="font-bold text-slate-950">
                  {formatCurrency(emi.monthlyAmount)}
                </span>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setShowEMIConfirm(false)}
                disabled={paymentLoading}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handlePayEMI}
                disabled={paymentLoading}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-bold text-white hover:bg-violet-700 disabled:opacity-50"
              >
                {paymentLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing
                  </>
                ) : (
                  "Confirm Payment"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          FULL PAYMENT CONFIRMATION MODAL
      ======================================================== */}

      {showFullConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-5 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <WalletCards className="h-6 w-6" />
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-950">
              Confirm Full Payment
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              This will clear all your remaining EMIs and
              mark this purchase as completed.
            </p>

            <div className="mt-5 rounded-2xl bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">
                  Remaining Amount
                </span>

                <span className="font-bold text-slate-950">
                  {formatCurrency(remainingAmount)}
                </span>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3">
                <span className="text-sm text-slate-500">
                  Remaining EMIs
                </span>

                <span className="font-bold text-slate-950">
                  {remainingEMIs}
                </span>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setShowFullConfirm(false)}
                disabled={paymentLoading}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handlePayFullAmount}
                disabled={paymentLoading}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                {paymentLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing
                  </>
                ) : (
                  "Confirm Payment"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}