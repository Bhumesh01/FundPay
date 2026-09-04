import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  CreditCard,
  Package,
  ShoppingBag,
  Sparkles,
  WalletCards,
} from "lucide-react";

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
  product: Product | null;
  variant: Variant | null;
  emiPlan: EMIPlan | null;
  purchasePrice: number;
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

const getGreeting = () => {
  const hour = new Date().getHours();

  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

const getMonthsElapsed = (startDate: string) => {
  const start = new Date(startDate);
  const now = new Date();

  let months =
    (now.getFullYear() - start.getFullYear()) * 12 +
    (now.getMonth() - start.getMonth());

  if (now.getDate() < start.getDate()) {
    months -= 1;
  }

  return Math.max(0, months);
};

export default function UserDashboard() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState<Order[]>([]);
  const [userName, setUserName] = useState("there");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token) {
      navigate("/signin");
      return;
    }

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);

        if (parsedUser?.name) {
          setUserName(parsedUser.name);
        }
      } catch {
        console.log("Unable to parse stored user");
      }
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axios.get<OrdersResponse>(
          `${apiUrl}/orders`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setOrders(response.data.orders || []);
      } catch (err: any) {
        console.error("Error fetching orders:", err);

        if (err?.response?.status === 401 || err?.response?.status === 403) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/signin");
          return;
        }

        setError(
          err?.response?.data?.message ||
            "Unable to load your dashboard right now."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [apiUrl, navigate]);

  const activeOrders = useMemo(
    () => orders.filter((order) => order.status === "active"),
    [orders]
  );

  const completedOrders = useMemo(
    () => orders.filter((order) => order.status === "completed"),
    [orders]
  );

  const activeOrder = activeOrders[0] || null;

  const totalMonthlyEMI = useMemo(() => {
    return activeOrders.reduce((total, order) => {
      return total + (order.emiPlan?.monthlyAmount || 0);
    }, 0);
  }, [activeOrders]);

  const estimatedOutstanding = useMemo(() => {
    return activeOrders.reduce((total, order) => {
      if (!order.emiPlan) {
        return total + order.purchasePrice;
      }

      const elapsedMonths = getMonthsElapsed(order.startDate);

      const paidEstimate = Math.min(
        elapsedMonths * order.emiPlan.monthlyAmount,
        order.purchasePrice
      );

      return total + Math.max(order.purchasePrice - paidEstimate, 0);
    }, 0);
  }, [activeOrders]);

  const activeProgress = useMemo(() => {
    if (!activeOrder?.emiPlan) return 0;

    const elapsedMonths = getMonthsElapsed(activeOrder.startDate);

    return Math.min(
      Math.round(
        (elapsedMonths / activeOrder.emiPlan.tenureMonths) * 100
      ),
      100
    );
  }, [activeOrder]);

  const remainingMonths = useMemo(() => {
    if (!activeOrder?.emiPlan) return 0;

    const elapsedMonths = getMonthsElapsed(activeOrder.startDate);

    return Math.max(
      activeOrder.emiPlan.tenureMonths - elapsedMonths,
      0
    );
  }, [activeOrder]);

  const recentOrders = orders.slice(0, 5);

  return (
    <main className="min-h-screen bg-[#f7f7fb] text-slate-900">
      {/* <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-7 sm:px-8 lg:px-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-violet-600">
                <Sparkles className="h-4 w-4" />
                <span>FundPay Dashboard</span>
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                {getGreeting()}, {userName}
                <span className="ml-2">👋</span>
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
                Manage your purchases and keep track of your
                investment-backed EMI plans.
              </p>
            </div>

            <Link
              to="/products"
              className="group inline-flex w-fit items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-sm shadow-violet-200 transition hover:bg-violet-700 hover:shadow-md"
            >
              <ShoppingBag className="h-4 w-4" />
              Explore Products
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </section> */}

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
        {error && (
          <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-full bg-red-100 p-1.5 text-red-600">
                <Clock3 className="h-4 w-4" />
              </div>

              <div>
                <p className="font-semibold text-red-900">
                  Unable to load dashboard
                </p>
                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <DashboardSkeleton />
        ) : (
          <>
            {activeOrder ? (
              <section className="mb-10">
                <div className="mb-4 flex items-end justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-violet-600">
                      Active purchase
                    </p>

                    <h2 className="mt-1 text-xl font-bold text-slate-950 sm:text-2xl">
                      Your current EMI plan
                    </h2>
                  </div>

                  <span className="hidden rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 sm:inline-flex">
                    ● Active
                  </span>
                </div>

                <ActivePurchaseCard
                  order={activeOrder}
                  progress={activeProgress}
                  remainingMonths={remainingMonths}
                />
              </section>
            ) : (
              <></>
            )}

        
            <section className="mb-10">
              <div className="mb-4">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                  Overview
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-950">
                  Your account at a glance
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatCard
                  icon={<Package className="h-5 w-5" />}
                  label="Total Orders"
                  value={orders.length.toString()}
                  helper={
                    activeOrders.length === 1
                      ? "1 active purchase"
                      : `${activeOrders.length} active purchases`
                  }
                  iconClass="bg-violet-50 text-violet-600"
                />

                <StatCard
                  icon={<CreditCard className="h-5 w-5" />}
                  label="Monthly EMI"
                  value={formatCurrency(totalMonthlyEMI)}
                  helper={
                    activeOrders.length > 0
                      ? `${activeOrders.length} active EMI ${
                          activeOrders.length === 1 ? "plan" : "plans"
                        }`
                      : "No active EMI plans"
                  }
                  iconClass="bg-blue-50 text-blue-600"
                />

                <StatCard
                  icon={<WalletCards className="h-5 w-5" />}
                  label="Estimated Remaining"
                  value={formatCurrency(estimatedOutstanding)}
                  helper={
                    activeOrders.length > 0
                      ? "Based on active plans"
                      : "No outstanding purchases"
                  }
                  iconClass="bg-amber-50 text-amber-600"
                />

                <StatCard
                  icon={<CheckCircle2 className="h-5 w-5" />}
                  label="Completed"
                  value={completedOrders.length.toString()}
                  helper="Completed purchases"
                  iconClass="bg-emerald-50 text-emerald-600"
                />
              </div>
            </section>
            <section className="mb-10">
              <div className="mb-4 flex items-end justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                    Purchase history
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-slate-950 sm:text-2xl">
                    Recent purchases
                  </h2>
                </div>

                {orders.length > 0 && (
                  <span className="text-sm font-medium text-slate-400">
                    {orders.length}{" "}
                    {orders.length === 1 ? "purchase" : "purchases"}
                  </span>
                )}
              </div>

              {recentOrders.length > 0 ? (
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="divide-y divide-slate-100">
                    {recentOrders.map((order) => (
                      <OrderRow key={order.id} order={order} />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                    <Package className="h-6 w-6" />
                  </div>

                  <h3 className="mt-4 text-lg font-bold text-slate-900">
                    No purchases yet
                  </h3>

                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                    Your investment-backed purchases will appear here
                    once you make your first purchase.
                  </p>

                  <Link
                    to="/products"
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700"
                  >
                    Browse Products
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              )}
            </section>

            {/* -----------------------------------------------------
                BOTTOM CTA
            ----------------------------------------------------- */}
            <section className="overflow-hidden rounded-3xl bg-slate-950">
              <div className="relative px-6 py-8 sm:px-10 sm:py-10">
                <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-violet-600/20 blur-3xl" />
                <div className="absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />

                <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                  <div className="max-w-xl">
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-violet-200">
                      <Sparkles className="h-3.5 w-3.5" />
                      Invest smarter. Buy smarter.
                    </div>

                    <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                      Ready for your next purchase?
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      Explore products and choose an EMI plan that works
                      for you.
                    </p>
                  </div>

                  <Link
                    to="/products"
                    className="group inline-flex w-fit shrink-0 items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-violet-50"
                  >
                    View Products
                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}

/* ================================================================
   ACTIVE PURCHASE CARD
================================================================ */

function ActivePurchaseCard({
  order,
  progress,
  remainingMonths,
}: {
  order: Order;
  progress: number;
  remainingMonths: number;
}) {
  const product = order.product;
  const variant = order.variant;
  const emi = order.emiPlan;

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
      <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
        {/* Product */}
        <div className="relative flex min-h-[300px] items-center justify-center overflow-hidden bg-[#f5f5f7] p-8 sm:p-10">
          <div className="absolute left-6 top-6">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-emerald-700 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Active
            </span>
          </div>

          {variant?.image ? (
            <img
              src={variant.image}
              alt={product?.name || "Product"}
              className="relative z-10 max-h-[260px] w-full max-w-[360px] object-contain drop-shadow-[0_20px_25px_rgba(15,23,42,0.12)]"
            />
          ) : (
            <div className="flex h-48 w-48 items-center justify-center rounded-3xl bg-white text-slate-300">
              <Package className="h-16 w-16" />
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-violet-600">
              Your purchase
            </p>

            <h3 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              {product?.name || "Product"}
            </h3>

            {variant && (
              <p className="mt-2 text-sm text-slate-500">
                {variant.color} <span className="mx-1.5">·</span>{" "}
                {variant.storage}
              </p>
            )}
          </div>

          {/* EMI */}
          <div className="mt-7 rounded-2xl bg-slate-50 p-5">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500">
                  Monthly EMI
                </p>

                <p className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
                  {emi ? formatCurrency(emi.monthlyAmount) : "—"}
                </p>
              </div>

              {emi && (
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <span className="rounded-lg bg-white px-2.5 py-1.5 font-semibold text-slate-700 shadow-sm">
                    {emi.tenureMonths} months
                  </span>

                  <span className="rounded-lg bg-white px-2.5 py-1.5 font-semibold text-slate-700 shadow-sm">
                    {emi.interestRate}% interest
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Progress */}
          {emi && (
            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="font-medium text-slate-500">
                  EMI progress
                </span>

                <span className="font-semibold text-slate-900">
                  {progress}%
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-violet-600 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                <span>
                  Started {formatDate(order.startDate)}
                </span>

                <span>
                  {remainingMonths > 0
                    ? `${remainingMonths} months remaining`
                    : "Almost complete"}
                </span>
              </div>
            </div>
          )}

          {/* Bottom information */}
          <div className="mt-7 grid grid-cols-2 gap-4 border-t border-slate-100 pt-6">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <CalendarDays className="h-3.5 w-3.5" />
                Next payment
              </div>

              <p className="mt-1 text-sm font-semibold text-slate-900">
                {formatDate(order.nextInstallmentDate)}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-400">
                Purchase value
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-900">
                {formatCurrency(order.purchasePrice)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   ORDER ROW
================================================================ */

function OrderRow({ order }: { order: Order }) {
  const product = order.product;
  const variant = order.variant;
  const emi = order.emiPlan;

  const statusConfig = {
    active: {
      label: "Active",
      className: "bg-emerald-50 text-emerald-700",
    },
    completed: {
      label: "Completed",
      className: "bg-blue-50 text-blue-700",
    },
    cancelled: {
      label: "Cancelled",
      className: "bg-slate-100 text-slate-500",
    },
  };

  const status = statusConfig[order.status];

  return (
    <div className="group flex flex-col gap-4 px-5 py-5 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:px-6">
      {/* Image */}
      <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#f5f5f7]">
        {variant?.image ? (
          <img
            src={variant.image}
            alt={product?.name || "Product"}
            className="h-full w-full object-contain p-2"
          />
        ) : (
          <Package className="h-7 w-7 text-slate-300" />
        )}
      </div>

      {/* Main details */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate text-sm font-bold text-slate-950 sm:text-base">
            {product?.name || "Product"}
          </h3>

          <span
            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${status.className}`}
          >
            {status.label}
          </span>
        </div>

        <p className="mt-1 text-xs text-slate-500 sm:text-sm">
          {variant
            ? `${variant.color} · ${variant.storage}`
            : "Variant unavailable"}
        </p>

        <p className="mt-1.5 text-xs text-slate-400">
          Purchased {formatDate(order.createdAt)}
        </p>
      </div>

      {/* EMI */}
      <div className="sm:min-w-[140px] sm:text-right">
        {emi ? (
          <>
            <p className="text-xs text-slate-400">Monthly EMI</p>
            <p className="mt-1 text-sm font-bold text-slate-950">
              {formatCurrency(emi.monthlyAmount)}
            </p>
            <p className="mt-0.5 text-xs text-slate-400">
              {emi.tenureMonths} months
            </p>
          </>
        ) : (
          <>
            <p className="text-xs text-slate-400">Purchase</p>
            <p className="mt-1 text-sm font-bold text-slate-950">
              {formatCurrency(order.purchasePrice)}
            </p>
          </>
        )}
      </div>

      {/* Arrow */}
      <div className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-400 transition group-hover:border-violet-200 group-hover:bg-violet-50 group-hover:text-violet-600 sm:flex">
        <ChevronRight className="h-4 w-4" />
      </div>
    </div>
  );
}

/* ================================================================
   STAT CARD
================================================================ */

function StatCard({
  icon,
  label,
  value,
  helper,
  iconClass,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  helper: string;
  iconClass: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-slate-500 sm:text-sm">
            {label}
          </p>

          <p className="mt-2 truncate text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
            {value}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
        >
          {icon}
        </div>
      </div>

      <p className="mt-3 truncate text-xs text-slate-400">
        {helper}
      </p>
    </div>
  );
}

/* ================================================================
   EMPTY PURCHASE STATE
================================================================ */

function EmptyPurchaseState() {
  return (
    <section className="mb-10 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="relative px-6 py-12 text-center sm:px-10 sm:py-14">
        <div className="absolute -left-20 -top-20 h-48 w-48 rounded-full bg-violet-100/60 blur-3xl" />
        <div className="absolute -bottom-20 -right-20 h-48 w-48 rounded-full bg-indigo-100/60 blur-3xl" />

        <div className="relative">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
            <ShoppingBag className="h-7 w-7" />
          </div>

          <p className="mt-5 text-xs font-bold uppercase tracking-[0.14em] text-violet-600">
            Your purchases
          </p>

          <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            Your first purchase starts here.
          </h2>

          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-500">
            Choose a product, select an EMI plan, and enjoy the
            flexibility of paying over time.
          </p>

          <Link
            to="/products"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-sm shadow-violet-200 transition hover:bg-violet-700"
          >
            Explore Products
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ================================================================
   LOADING SKELETON
================================================================ */

function DashboardSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Active purchase skeleton */}
      <div className="mb-10">
        <div className="mb-4">
          <div className="h-3 w-28 rounded bg-slate-200" />
          <div className="mt-2 h-6 w-48 rounded bg-slate-200" />
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
          <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
            <div className="min-h-[300px] bg-slate-100" />

            <div className="space-y-5 p-8">
              <div>
                <div className="h-3 w-24 rounded bg-slate-200" />
                <div className="mt-3 h-8 w-64 rounded bg-slate-200" />
                <div className="mt-2 h-4 w-40 rounded bg-slate-200" />
              </div>

              <div className="h-24 rounded-2xl bg-slate-100" />

              <div className="h-10 rounded bg-slate-100" />

              <div className="h-12 rounded bg-slate-100" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats skeleton */}
      <div className="mb-10">
        <div className="mb-4">
          <div className="h-3 w-20 rounded bg-slate-200" />
          <div className="mt-2 h-6 w-56 rounded bg-slate-200" />
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-32 rounded-2xl border border-slate-200 bg-white"
            />
          ))}
        </div>
      </div>

      {/* Orders skeleton */}
      <div>
        <div className="mb-4">
          <div className="h-3 w-28 rounded bg-slate-200" />
          <div className="mt-2 h-6 w-44 rounded bg-slate-200" />
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="flex gap-4 border-b border-slate-100 p-5"
            >
              <div className="h-20 w-20 rounded-2xl bg-slate-100" />

              <div className="flex-1 space-y-3">
                <div className="h-4 w-48 rounded bg-slate-100" />
                <div className="h-3 w-32 rounded bg-slate-100" />
                <div className="h-3 w-24 rounded bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}