import { BarChart3, CreditCard, LayoutDashboard, LogOut, Package, Plus, Settings, ShieldCheck, ShoppingBag, Users } from "lucide-react";
import { Link } from "react-router-dom";

function AdminDashboard() {
  return (
    <div className="min-h-screen bg-slate-50">

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
            Overview
          </p>

          <Link
            to="/admin"
            className="flex items-center gap-3 rounded-xl bg-primary-50 px-3 py-3 text-sm font-semibold text-primary-700"
          >
            <LayoutDashboard className="h-5 w-5" />
            Dashboard
          </Link>

          <Link
            to="/admin/products"
            className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
          >
            <Package className="h-5 w-5" />
            Products
          </Link>

          <Link
            to="/admin/emi-plans"
            className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
          >
            <CreditCard className="h-5 w-5" />
            EMI Plans
          </Link>

          <Link
            to="/admin/orders"
            className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
          >
            <ShoppingBag className="h-5 w-5" />
            Orders
          </Link>

          <p className="mb-3 mt-8 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Management
          </p>

          <Link
            to="/admin/users"
            className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
          >
            <Users className="h-5 w-5" />
            Users
          </Link>

          <Link
            to="/admin/analytics"
            className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
          >
            <BarChart3 className="h-5 w-5" />
            Analytics
          </Link>

          <Link
            to="/admin/settings"
            className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
          >
            <Settings className="h-5 w-5" />
            Settings
          </Link>

        </nav>

        {/* Admin profile */}
        <div className="border-t border-slate-200 p-4">

          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100">
              <ShieldCheck className="h-5 w-5 text-primary-600" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900">
                Administrator
              </p>

              <p className="truncate text-xs text-slate-500">
                Admin account
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

        {/* Top Header */}
        <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-slate-200 bg-white/90 px-5 backdrop-blur-md sm:px-8">

          <div>
            <p className="text-sm text-slate-500">
              Welcome back,
            </p>

            <h1 className="text-xl font-bold text-slate-900">
              Admin Dashboard
            </h1>
          </div>

          {/* Mobile menu placeholder */}
          <button
            type="button"
            className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 lg:hidden"
          >
            <LayoutDashboard className="h-5 w-5" />
          </button>

        </header>


        {/* Dashboard */}
        <div className="page-container section">

          {/* Page heading */}
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                Overview
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Manage your FundPay platform from one place.
              </p>
            </div>

            <Link
              to="/admin/products/new"
              className="btn-primary"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Link>

          </div>


          {/* =================================================
              Stats
              ================================================= */}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

            {/* Products */}
            <div className="card p-5">

              <div className="flex items-start justify-between">

                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Total Products
                  </p>

                  <p className="mt-2 text-3xl font-bold text-slate-900">
                    12
                  </p>

                  <p className="mt-2 text-xs font-medium text-success-600">
                    +2 this month
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50">
                  <Package className="h-5 w-5 text-primary-600" />
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
                    148
                  </p>

                  <p className="mt-2 text-xs font-medium text-success-600">
                    +12.5% this month
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-success-50">
                  <ShoppingBag className="h-5 w-5 text-success-600" />
                </div>

              </div>

            </div>


            {/* Users */}
            <div className="card p-5">

              <div className="flex items-start justify-between">

                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Customers
                  </p>

                  <p className="mt-2 text-3xl font-bold text-slate-900">
                    324
                  </p>

                  <p className="mt-2 text-xs font-medium text-success-600">
                    +24 this month
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50">
                  <Users className="h-5 w-5 text-primary-600" />
                </div>

              </div>

            </div>


            {/* EMI */}
            <div className="card p-5">

              <div className="flex items-start justify-between">

                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Active EMI Plans
                  </p>

                  <p className="mt-2 text-3xl font-bold text-slate-900">
                    28
                  </p>

                  <p className="mt-2 text-xs font-medium text-success-600">
                    26 active products
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-warning-50">
                  <CreditCard className="h-5 w-5 text-warning-600" />
                </div>

              </div>

            </div>

          </div>


          {/* =================================================
              Quick Actions
              ================================================= */}

          <div className="mt-8 grid gap-6 lg:grid-cols-3">

            <div className="card p-6 lg:col-span-2">

              <div className="mb-6 flex items-center justify-between">

                <div>
                  <h3 className="font-semibold text-slate-900">
                    Quick Actions
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Manage your platform efficiently.
                  </p>
                </div>

              </div>

              <div className="grid gap-3 sm:grid-cols-2">

                <Link
                  to="/admin/products/new"
                  className="group flex items-center gap-4 rounded-xl border border-slate-200 p-4 transition-all hover:border-primary-200 hover:bg-primary-50"
                >

                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100">
                    <Plus className="h-5 w-5 text-primary-600" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Add Product
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Create a new product
                    </p>
                  </div>

                </Link>


                <Link
                  to="/admin/emi-plans/new"
                  className="group flex items-center gap-4 rounded-xl border border-slate-200 p-4 transition-all hover:border-primary-200 hover:bg-primary-50"
                >

                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100">
                    <CreditCard className="h-5 w-5 text-primary-600" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Create EMI Plan
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Add a new EMI option
                    </p>
                  </div>

                </Link>


                <Link
                  to="/admin/orders"
                  className="group flex items-center gap-4 rounded-xl border border-slate-200 p-4 transition-all hover:border-primary-200 hover:bg-primary-50"
                >

                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success-100">
                    <ShoppingBag className="h-5 w-5 text-success-600" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      View Orders
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Manage customer orders
                    </p>
                  </div>

                </Link>


                <Link
                  to="/admin/users"
                  className="group flex items-center gap-4 rounded-xl border border-slate-200 p-4 transition-all hover:border-primary-200 hover:bg-primary-50"
                >

                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                    <Users className="h-5 w-5 text-slate-600" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Manage Users
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      View registered customers
                    </p>
                  </div>

                </Link>

              </div>

            </div>


            {/* Platform Status */}

            <div className="card p-6">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success-50">
                  <ShieldCheck className="h-5 w-5 text-success-600" />
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900">
                    Platform Status
                  </h3>

                  <p className="text-xs text-slate-500">
                    Everything looks good
                  </p>
                </div>

              </div>

              <div className="mt-6 space-y-4">

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">
                    API
                  </span>

                  <span className="badge-success">
                    Operational
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">
                    Database
                  </span>

                  <span className="badge-success">
                    Connected
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">
                    Payments
                  </span>

                  <span className="badge-success">
                    Operational
                  </span>
                </div>

              </div>

            </div>

          </div>


          {/* =================================================
              Recent Orders
              ================================================= */}

          <div className="card mt-8 overflow-hidden">

            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">

              <div>
                <h3 className="font-semibold text-slate-900">
                  Recent Orders
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Latest customer activity.
                </p>
              </div>

              <Link
                to="/admin/orders"
                className="text-sm font-semibold text-primary-600 hover:text-primary-700"
              >
                View all
              </Link>

            </div>

            <div className="overflow-x-auto">

              <table className="w-full min-w-175">

                <thead className="bg-slate-50">

                  <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500">

                    <th className="px-6 py-4">
                      Customer
                    </th>

                    <th className="px-6 py-4">
                      Product
                    </th>

                    <th className="px-6 py-4">
                      Amount
                    </th>

                    <th className="px-6 py-4">
                      Status
                    </th>

                    <th className="px-6 py-4">
                      Date
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-slate-200">

                  <tr className="transition-colors hover:bg-slate-50">

                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-slate-900">
                        Rahul Sharma
                      </p>
                      <p className="text-xs text-slate-500">
                        rahul@example.com
                      </p>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      iPhone 17 Pro
                    </td>

                    <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                      ₹1,29,900
                    </td>

                    <td className="px-6 py-4">
                      <span className="badge-success">
                        Active
                      </span>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-500">
                      Today
                    </td>

                  </tr>


                  <tr className="transition-colors hover:bg-slate-50">

                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-slate-900">
                        Priya Singh
                      </p>
                      <p className="text-xs text-slate-500">
                        priya@example.com
                      </p>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      Samsung Galaxy S25
                    </td>

                    <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                      ₹89,999
                    </td>

                    <td className="px-6 py-4">
                      <span className="badge-success">
                        Active
                      </span>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-500">
                      Yesterday
                    </td>

                  </tr>

                </tbody>

              </table>

            </div>

          </div>

        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;