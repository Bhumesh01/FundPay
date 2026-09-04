import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">

        {/* Footer Content */}
        <div className="grid grid-cols-1 gap-8 py-8 sm:grid-cols-3 sm:gap-12">

          {/* Brand */}
          <div>
            <Link
              to="/"
              className="inline-block text-xl font-bold tracking-tight text-slate-950"
            >
              Fund<span className="text-violet-600">Pay</span>
            </Link>

            <p className="mt-3 max-w-xs text-sm leading-6 text-slate-500">
              Your investments. Your purchases. Your flexibility.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Product
            </h3>

            <div className="mt-4 flex flex-col gap-3">
              <Link
                to="/"
                className="w-fit text-sm text-slate-500 transition hover:text-violet-600"
              >
                Home
              </Link>

              <Link
                to="/products"
                className="w-fit text-sm text-slate-500 transition hover:text-violet-600"
              >
                Products
              </Link>

              <Link
                to="/dashboard"
                className="w-fit text-sm text-slate-500 transition hover:text-violet-600"
              >
                Dashboard
              </Link>
            </div>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Company
            </h3>

            <div className="mt-4 flex flex-col gap-3">
              <Link
                to="/about"
                className="w-fit text-sm text-slate-500 transition hover:text-violet-600"
              >
                About
              </Link>

              <Link
                to="/contact"
                className="w-fit text-sm text-slate-500 transition hover:text-violet-600"
              >
                Contact
              </Link>

              <Link
                to="/privacy"
                className="w-fit text-sm text-slate-500 transition hover:text-violet-600"
              >
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col gap-2 border-t border-slate-100 py-4 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} FundPay. All rights reserved.
          </p>

          <p>
            Your investments. Your purchases. Your flexibility.
          </p>
        </div>
      </div>
    </footer>
  );
}