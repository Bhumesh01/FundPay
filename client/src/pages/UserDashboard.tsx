import {
  ArrowRight,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Package,
  ShoppingBag,
  User,
  Wallet,
} from "lucide-react";
import { Link } from "react-router-dom";

function UserDashboard() {
  return (
    <div className="min-h-screen bg-slate-50">

      {/* =====================================================
          Sidebar
          ===================================================== */}

      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-white lg:flex lg:flex-col">

        {/* Logo */}
        <div className="flex h-20 items-center border-b border-slate-200 px-6">
          <Link
            to="/"
            className="text-2xl font-bold tracking-tight text-slate-900"
          >
            Fund<span className="text-primary-600">Pay</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-4 py-6">

          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Account
          </p>

          <Link
            to="/dashboard"
            className="flex items-center gap-3 rounded-xl bg-primary-50 px-3 py-3 text-sm font-semibold text-primary-700"
          >
            <LayoutDashboard className="h-5 w-5" />
            Dashboard
          </Link>

          <Link
            to="/products"
            className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
          >
            <ShoppingBag className="h-5 w-5" />
            Shop Products
          </Link>

          <Link
            to="/orders"
            className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
          >
            <Package className="h-5 w-5" />
            My Orders
          </Link>

          <Link
            to="/profile"
            className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
          >
            <User className="h-5 w-5" />
            Profile
          </Link>

        </nav>

        {/* User profile */}
        <div className="border-t border-slate-200 p-4">

          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100">
              <User className="h-5 w-5 text-primary-600" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900">
                User
              </p>

              <p className="truncate text-xs text-slate-500">
                Customer account
              </p>
            </div>

            <button
              type="button"
              className="text-slate-400 transition-colors hover:text-danger-500"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>

          </div>

        </div>

      </aside>


      {/* =====================================================
          Main Content
          ===================================================== */}

      <main className="lg:pl-64">

        {/* Header */}
        <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-slate-200 bg-white/90 px-5 backdrop-blur-md sm:px-8">

          <div>
            <p className="text-sm text-slate-500">
              Welcome back,
            </p>

            <h1 className="text-xl font-bold text-slate-900">
              Your Dashboard
            </h1>
          </div>

          <Link
            to="/products"
            className="btn-primary hidden sm:inline-flex"
          >
            <ShoppingBag className="mr-2 h-4 w-4" />
            Browse Products
          </Link>

        </header>


        {/* =====================================================
            Dashboard Content
            ===================================================== */}

        <div className="page-container section">

          {/* Welcome */}
          <section className="mb-8">

            <div className="rounded-3xl bg-primary-gradient p-7 shadow-primary sm:p-9">

              <div className="max-w-2xl">

                <p className="text-sm font-medium text-primary-200">
                  FundPay
                </p>

                <h2 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  Your purchases,
                  <br />
                  your way.
                </h2>

                <p className="mt-4 max-w-lg text-sm leading-6 text-primary-100 sm:text-base">
                  Manage your active EMIs, track your purchases,
                  and discover products with flexible payment plans.
                </p>

                <Link
                  to="/products"
                  className="mt-6 inline-flex items-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-primary-700 transition-all hover:bg-primary-50"
                >
                  Explore products
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>

              </div>

            </div>

          </section>


          {/* =================================================
              Summary Cards
              ================================================= */}

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">

            {/* Active EMI */}
            <div className="card p-5">

              <div className="flex items-start justify-between">

                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Active EMI
                  </p>

                  <p className="mt-2 text-3xl font-bold text-slate-900">
                    ₹4,999
                    <span className="text-sm font-medium text-slate-400">
                      /month
                    </span>
                  </p>

                  <p className="mt-2 text-xs text-slate-500">
                    Next payment in 12 days
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50">
                  <CreditCard className="h-5 w-5 text-primary-600" />
                </div>

              </div>

            </div>


            {/* Orders */}
            <div className="card p-5">

              <div className="flex items-start justify-between">

                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Total Orders
                  </p>

                  <p className="mt-2 text-3xl font-bold text-slate-900">
                    3
                  </p>

                  <p className="mt-2 text-xs text-slate-500">
                    1 active EMI
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-success-50">
                  <Package className="h-5 w-5 text-success-600" />
                </div>

              </div>

            </div>


            {/* Outstanding */}
            <div className="card p-5">

              <div className="flex items-start justify-between">

                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Outstanding
                  </p>

                  <p className="mt-2 text-3xl font-bold text-slate-900">
                    ₹24,995
                  </p>

                  <p className="mt-2 text-xs text-slate-500">
                    Remaining EMI balance
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-warning-50">
                  <Wallet className="h-5 w-5 text-warning-600" />
                </div>

              </div>

            </div>

          </section>


          {/* =================================================
              Active EMI
              ================================================= */}

          <section className="mt-8">

            <div className="mb-4 flex items-center justify-between">

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Active EMI
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Your current investment-backed purchase.
                </p>
              </div>

              <Link
                to="/orders"
                className="text-sm font-semibold text-primary-600 hover:text-primary-700"
              >
                View all
              </Link>

            </div>


            <div className="card overflow-hidden">

              <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center">

                {/* Product image placeholder */}
                <div className="flex h-32 w-full shrink-0 items-center justify-center rounded-2xl bg-slate-100 sm:w-32">
                  <Package className="h-10 w-10 text-slate-300" />
                </div>

                {/* Product details */}
                <div className="flex-1">

                  <div className="flex flex-wrap items-center gap-2">

                    <h3 className="text-lg font-bold text-slate-900">
                      Product Name
                    </h3>

                    <span className="badge-success">
                      Active
                    </span>

                  </div>

                  <p className="mt-1 text-sm text-slate-500">
                    Variant details
                  </p>

                  <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">

                    <div>
                      <p className="text-xs text-slate-400">
                        Monthly EMI
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        ₹4,999
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-400">
                        Tenure
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        12 months
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-400">
                        Next payment
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        16 Sep 2026
                      </p>
                    </div>

                  </div>

                </div>

                {/* Action */}
                <Link
                  to="/orders"
                  className="btn-secondary shrink-0"
                >
                  View details
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>

              </div>

            </div>

          </section>


          {/* =================================================
              Recent Orders
              ================================================= */}

          <section className="mt-8">

            <div className="mb-4 flex items-center justify-between">

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Recent Orders
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Your latest purchases.
                </p>
              </div>

              <Link
                to="/orders"
                className="text-sm font-semibold text-primary-600 hover:text-primary-700"
              >
                View all
              </Link>

            </div>


            <div className="card divide-y divide-slate-200">

              {/* Order 1 */}
              <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                  <Package className="h-5 w-5 text-slate-500" />
                </div>

                <div className="flex-1">

                  <div className="flex flex-wrap items-center gap-2">

                    <h3 className="text-sm font-semibold text-slate-900">
                      Product Name
                    </h3>

                    <span className="badge-success">
                      Active
                    </span>

                  </div>

                  <p className="mt-1 text-xs text-slate-500">
                    Purchased on 04 Sep 2026
                  </p>

                </div>

                <div className="text-left sm:text-right">

                  <p className="text-sm font-bold text-slate-900">
                    ₹59,999
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    12 month EMI
                  </p>

                </div>

              </div>


              {/* Order 2 */}
              <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                  <Package className="h-5 w-5 text-slate-500" />
                </div>

                <div className="flex-1">

                  <div className="flex flex-wrap items-center gap-2">

                    <h3 className="text-sm font-semibold text-slate-900">
                      Previous Product
                    </h3>

                    <span className="badge-primary">
                      Completed
                    </span>

                  </div>

                  <p className="mt-1 text-xs text-slate-500">
                    Purchased on 12 Aug 2026
                  </p>

                </div>

                <div className="text-left sm:text-right">

                  <p className="text-sm font-bold text-slate-900">
                    ₹39,999
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    EMI completed
                  </p>

                </div>

              </div>

            </div>

          </section>


          {/* =================================================
              Browse Products CTA
              ================================================= */}

          <section className="mt-8">

            <div className="card flex flex-col items-start justify-between gap-5 p-6 sm:flex-row sm:items-center">

              <div>

                <h2 className="font-bold text-slate-900">
                  Looking for something new?
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Explore products and find an EMI plan that works for you.
                </p>

              </div>

              <Link
                to="/products"
                className="btn-primary shrink-0"
              >
                Browse Products
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>

            </div>

          </section>

        </div>

      </main>

    </div>
  );
}

export default UserDashboard;