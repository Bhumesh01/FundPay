import { ArrowRight, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">

      {/* Main Footer */}
      <div className="page-container py-12 sm:py-16">

        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">

          {/* Brand */}
          <div className="lg:col-span-2">

            <Link
              to="/"
              className="text-2xl font-bold tracking-tight text-slate-900"
            >
              Fund<span className="text-primary-600">Pay</span>
            </Link>

            <p className="mt-4 max-w-sm text-sm leading-6 text-slate-500">
              Your investments. Your purchases. Your flexibility.
            </p>

            <p className="mt-3 max-w-md text-xs leading-5 text-slate-400">
              Explore products, compare flexible EMI plans, and choose a
              payment option that works for you.
            </p>

          </div>


          {/* Product */}
          <div>

            <h3 className="text-sm font-semibold text-slate-900">
              Product
            </h3>

            <div className="mt-4 flex flex-col gap-3">

              <Link
                to="/products"
                className="text-sm text-slate-500 transition-colors hover:text-primary-600"
              >
                Products
              </Link>

              <Link
                to="/dashboard"
                className="text-sm text-slate-500 transition-colors hover:text-primary-600"
              >
                Dashboard
              </Link>

              <Link
                to="/signup"
                className="text-sm text-slate-500 transition-colors hover:text-primary-600"
              >
                Get Started
              </Link>

            </div>

          </div>


          {/* Company */}
          <div>

            <h3 className="text-sm font-semibold text-slate-900">
              FundPay
            </h3>

            <div className="mt-4 flex flex-col gap-3">

              <Link
                to="/"
                className="text-sm text-slate-500 transition-colors hover:text-primary-600"
              >
                About
              </Link>

              <Link
                to="/"
                className="text-sm text-slate-500 transition-colors hover:text-primary-600"
              >
                Contact
              </Link>

              <Link
                to="/"
                className="text-sm text-slate-500 transition-colors hover:text-primary-600"
              >
                Privacy Policy
              </Link>

            </div>

          </div>

        </div>


        {/* Trust Banner */}
        <div className="mt-12 flex flex-col gap-4 rounded-2xl bg-slate-50 p-5 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-success-50">
              <ShieldCheck className="h-5 w-5 text-success-600" />
            </div>

            <div>

              <p className="text-sm font-semibold text-slate-900">
                Simple and transparent
              </p>

              <p className="mt-0.5 text-xs text-slate-500">
                Compare EMI plans before making your decision.
              </p>

            </div>

          </div>


          <Link
            to="/products"
            className="group inline-flex items-center text-sm font-semibold text-primary-600 transition-colors hover:text-primary-700"
          >
            Explore products

            <ArrowRight
              className="ml-1.5 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
            />
          </Link>

        </div>

      </div>


      {/* Bottom Footer */}
      <div className="border-t border-slate-200">

        <div className="page-container flex flex-col gap-2 py-5 sm:flex-row sm:items-center sm:justify-between">

          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} FundPay. All rights reserved.
          </p>

          <p className="text-xs text-slate-400">
            Your investments. Your purchases. Your flexibility.
          </p>

        </div>

      </div>

    </footer>
  );
}

export default Footer;