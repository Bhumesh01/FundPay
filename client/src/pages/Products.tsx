import {
  ArrowRight,
  Check,
  Package,
  Search,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";
import { Link } from "react-router-dom";

interface ProductVariant {
  id: string;
  color: string;
  storage: string;
  mrp: number;
  price: number;
  discount: number;
  image: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  variants: ProductVariant[];
}

const products: Product[] = [
  {
    id: "1",
    name: "iPhone 17 Pro",
    slug: "iphone-17-pro",
    description:
      "Powerful performance with a pro-grade camera system.",
    variants: [
      {
        id: "1-1",
        color: "Deep Blue",
        storage: "256 GB",
        mrp: 139900,
        price: 129900,
        discount: 10000,
        image:
          "https://images.unsplash.com/photo-1592286927505-2fd6b9c8f5a1?auto=format&fit=crop&w=800&q=80",
      },
    ],
  },
  {
    id: "2",
    name: "Samsung Galaxy S25",
    slug: "samsung-galaxy-s25",
    description:
      "Flagship performance with an immersive display.",
    variants: [
      {
        id: "2-1",
        color: "Navy",
        storage: "256 GB",
        mrp: 99999,
        price: 89999,
        discount: 10000,
        image:
          "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=800&q=80",
      },
    ],
  },
  {
    id: "3",
    name: "Google Pixel 10",
    slug: "google-pixel-10",
    description:
      "Smart photography and a pure Android experience.",
    variants: [
      {
        id: "3-1",
        color: "Obsidian",
        storage: "256 GB",
        mrp: 89999,
        price: 79999,
        discount: 10000,
        image:
          "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80",
      },
    ],
  },
];

function Products() {
  return (
    <main className="min-h-screen bg-slate-50">

      {/* =====================================================
          Header
          ===================================================== */}

      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-md">

        <div className="page-container flex h-18 items-center justify-between">

          {/* Logo */}
          <Link
            to="/"
            className="text-2xl font-bold tracking-tight text-slate-900"
          >
            Fund<span className="text-primary-600">Pay</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden items-center gap-8 md:flex">

            <Link
              to="/products"
              className="text-sm font-semibold text-primary-600"
            >
              Products
            </Link>

            <Link
              to="/dashboard"
              className="text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
            >
              Dashboard
            </Link>

          </nav>

          {/* Auth */}
          <div className="flex items-center gap-3">

            <Link
              to="/signin"
              className="hidden text-sm font-semibold text-slate-600 transition-colors hover:text-slate-900 sm:block"
            >
              Sign in
            </Link>

            <Link
              to="/signup"
              className="btn-primary px-4 py-2.5 text-sm"
            >
              Get started
            </Link>

          </div>

        </div>

      </header>


      {/* =====================================================
          Hero
          ===================================================== */}

      <section className="border-b border-slate-200 bg-white">

        <div className="page-container py-12 sm:py-16">

          <div className="max-w-2xl">

            <span className="badge-primary">
              Flexible EMI plans
            </span>

            <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Buy what you want.
              <br />
              <span className="text-primary-600">
                Pay your way.
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-7 text-slate-500">
              Explore premium products and choose an EMI plan
              backed by your investments.
            </p>

          </div>


          {/* Search */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">

            <div className="relative flex-1">

              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

              <input
                type="search"
                placeholder="Search products..."
                className="input pl-12"
              />

            </div>

            <button
              type="button"
              className="btn-secondary"
            >
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Filters
            </button>

          </div>

        </div>

      </section>


      {/* =====================================================
          Products
          ===================================================== */}

      <section className="page-container section">

        {/* Section header */}
        <div className="mb-8 flex items-end justify-between">

          <div>
            <p className="text-sm font-medium text-slate-500">
              Explore our collection
            </p>

            <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
              Featured Products
            </h2>
          </div>

          <p className="hidden text-sm text-slate-500 sm:block">
            {products.length} products available
          </p>

        </div>


        {/* Product Grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

          {products.map((product) => {

            const variant = product.variants[0];

            if (!variant) {
              return null;
            }

            return (
              <article
                key={product.id}
                className="card card-hover group overflow-hidden"
              >

                {/* Product Image */}
                <Link
                  to={`/products/${product.slug}`}
                  className="relative block overflow-hidden bg-slate-100"
                >

                  <div className="flex aspect-square items-center justify-center p-8">

                    <img
                      src={variant.image}
                      alt={product.name}
                      className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
                    />

                  </div>

                  {/* Discount */}
                  {variant.discount > 0 && (
                    <span className="absolute left-4 top-4 badge-success">
                      Save ₹{variant.discount.toLocaleString("en-IN")}
                    </span>
                  )}

                </Link>


                {/* Product Details */}
                <div className="p-5">

                  <div className="flex items-start justify-between gap-4">

                    <div>
                      <Link
                        to={`/products/${product.slug}`}
                        className="text-lg font-bold text-slate-900 transition-colors hover:text-primary-600"
                      >
                        {product.name}
                      </Link>

                      <p className="mt-1 line-clamp-2 text-sm leading-5 text-slate-500">
                        {product.description}
                      </p>
                    </div>

                  </div>


                  {/* Variant */}
                  <div className="mt-4 flex items-center gap-2">

                    <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                      {variant.color}
                    </span>

                    <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                      {variant.storage}
                    </span>

                  </div>


                  {/* Price */}
                  <div className="mt-5">

                    <div className="flex items-baseline gap-2">

                      <span className="text-2xl font-bold text-slate-900">
                        ₹{variant.price.toLocaleString("en-IN")}
                      </span>

                      <span className="text-sm text-slate-400 line-through">
                        ₹{variant.mrp.toLocaleString("en-IN")}
                      </span>

                    </div>

                    <p className="mt-1 text-xs text-success-600">
                      Inclusive of product discount
                    </p>

                  </div>


                  {/* CTA */}
                  <Link
                    to={`/products/${product.slug}`}
                    className="btn-primary mt-5 w-full"
                  >
                    View product
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>

                </div>

              </article>
            );
          })}

        </div>

      </section>


      {/* =====================================================
          Trust Section
          ===================================================== */}

      <section className="border-t border-slate-200 bg-white">

        <div className="page-container py-10">

          <div className="grid gap-6 sm:grid-cols-3">

            <div className="flex items-center gap-4">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-50">
                <CreditCardIcon />
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Flexible EMI
                </p>

                <p className="text-xs text-slate-500">
                  Choose a plan that fits
                </p>
              </div>

            </div>


            <div className="flex items-center gap-4">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-success-50">
                <ShieldCheck className="h-5 w-5 text-success-600" />
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Secure payments
                </p>

                <p className="text-xs text-slate-500">
                  Your data stays protected
                </p>
              </div>

            </div>


            <div className="flex items-center gap-4">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-50">
                <Package className="h-5 w-5 text-primary-600" />
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Simple shopping
                </p>

                <p className="text-xs text-slate-500">
                  Browse and purchase easily
                </p>
              </div>

            </div>

          </div>

        </div>

      </section>

    </main>
  );
}


/* Small reusable icon wrapper */

function CreditCardIcon() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <Check className="h-5 w-5 text-primary-600" />
    </div>
  );
}

export default Products;