import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-md">
      <div className="page-container">

        <div className="flex h-18 items-center justify-between">

          {/* Logo */}
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className="text-2xl font-bold tracking-tight text-slate-900"
          >
            Fund<span className="text-primary-600">Pay</span>
          </Link>


          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-8 md:flex">

            <Link
              to="/"
              className={`text-sm font-semibold transition-colors ${
                isActive("/")
                  ? "text-primary-600"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Home
            </Link>

            <Link
              to="/products"
              className={`text-sm font-semibold transition-colors ${
                isActive("/products")
                  ? "text-primary-600"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Products
            </Link>

            <Link
              to="/dashboard"
              className={`text-sm font-semibold transition-colors ${
                isActive("/dashboard")
                  ? "text-primary-600"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Dashboard
            </Link>

          </nav>


          {/* Desktop Auth */}
          <div className="hidden items-center gap-4 md:flex">

            <Link
              to="/signin"
              className="text-sm font-semibold text-slate-600 transition-colors hover:text-primary-600"
            >
              Sign in
            </Link>

            <Link
              to="/signup"
              className="btn-primary px-4 py-2.5 text-sm"
            >
              Get Started
            </Link>

          </div>


          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 md:hidden"
            aria-label="Toggle menu"
          >
            {isOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>

        </div>


        {/* Mobile Navigation */}
        {isOpen && (
          <div className="border-t border-slate-100 py-4 md:hidden">

            <nav className="flex flex-col gap-1">

              <Link
                to="/"
                onClick={() => setIsOpen(false)}
                className={`rounded-xl px-4 py-3 text-sm font-semibold ${
                  isActive("/")
                    ? "bg-primary-50 text-primary-600"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                Home
              </Link>

              <Link
                to="/products"
                onClick={() => setIsOpen(false)}
                className={`rounded-xl px-4 py-3 text-sm font-semibold ${
                  isActive("/products")
                    ? "bg-primary-50 text-primary-600"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                Products
              </Link>

              <Link
                to="/dashboard"
                onClick={() => setIsOpen(false)}
                className={`rounded-xl px-4 py-3 text-sm font-semibold ${
                  isActive("/dashboard")
                    ? "bg-primary-50 text-primary-600"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                Dashboard
              </Link>

            </nav>


            <div className="mt-3 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">

              <Link
                to="/signin"
                onClick={() => setIsOpen(false)}
                className="btn-secondary py-2.5 text-sm"
              >
                Sign in
              </Link>

              <Link
                to="/signup"
                onClick={() => setIsOpen(false)}
                className="btn-primary py-2.5 text-sm"
              >
                Get Started
              </Link>

            </div>

          </div>
        )}

      </div>
    </header>
  );
}

export default Navbar;