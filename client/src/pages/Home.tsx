import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  ArrowRight,
  Check,
  ChevronRight,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";

interface ProductVariant {
  _id: string;
  color: string;
  storage: string;
  mrp: number;
  price: number;
  discount: number;
  image: string;
}

interface Product {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  variants: ProductVariant[];
}

interface ProductsResponse {
  message: string;
  products: Product[];
}

/* ================================================================
   GET PRODUCTS
   Kept inside Home.tsx as requested
================================================================ */

async function getProducts(): Promise<Product[]> {
  const apiUrl = import.meta.env.VITE_API_URL;

  const response = await axios.get<ProductsResponse>(
    `${apiUrl}/products`
  );

  return response.data.products || [];
}

/* ================================================================
   HELPERS
================================================================ */

function formatCurrency(value: number) {
  return `₹${value.toLocaleString("en-IN")}`;
}

/* ================================================================
   HOME
================================================================ */

function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ---------------------------------------------------------------
     FETCH PRODUCTS
  ---------------------------------------------------------------- */

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getProducts();

        setProducts(data);
      } catch (err) {
        console.error("Unable to fetch products:", err);
        setError("Unable to load products right now.");
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  /* ---------------------------------------------------------------
     FEATURED PRODUCT
  ---------------------------------------------------------------- */

  const featuredProduct = useMemo(() => {
    return products.find(
      (product) => product.variants && product.variants.length > 0
    );
  }, [products]);

  const featuredVariant = featuredProduct?.variants?.[0];

  return (
    <main className="bg-white text-slate-900">

      {/* ==========================================================
          HERO
      ========================================================== */}

      <section className="relative overflow-hidden border-b border-slate-100 bg-white">
        {/* Background decoration */}
        <div className="pointer-events-none absolute -right-40 -top-40 h-96 w-96 rounded-full bg-violet-100/60 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-indigo-100/40 blur-3xl" />

        <div className="page-container relative py-14 sm:py-16 lg:py-20">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">

            {/* ==================================================
                LEFT CONTENT
            ================================================== */}

            <div className="max-w-2xl">

              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-100 bg-violet-50 px-3.5 py-2 text-sm font-medium text-violet-700">
                <Sparkles className="h-4 w-4" />
                Smarter way to purchase
              </div>

              <h1 className="text-4xl font-bold leading-[1.08] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                Your investments.
                <br />

                Your purchases.
                <br />

                <span className="text-violet-600">
                  Your flexibility.
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-base leading-7 text-slate-500 sm:text-lg">
                Explore products, compare flexible EMI plans, and
                choose a payment option that works for you.
              </p>

              {/* Buttons */}
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">

                <Link
                  to="/products"
                  className="group inline-flex items-center justify-center rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-sm shadow-violet-200 transition hover:bg-violet-700 hover:shadow-md"
                >
                  Explore Products

                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>

                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  How it works
                </a>
              </div>

              {/* Benefits */}
              <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3">

                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50">
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                  </span>

                  Flexible EMI plans
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50">
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                  </span>

                  Transparent pricing
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50">
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                  </span>

                  Compare before you choose
                </div>

              </div>
            </div>

            {/* ==================================================
                RIGHT - DYNAMIC PRODUCT
            ================================================== */}

            <div className="flex justify-center lg:justify-end">

              {loading ? (
                <HeroSkeleton />
              ) : featuredProduct && featuredVariant ? (

                <div className="w-full max-w-lg">

                  <div className="relative overflow-hidden rounded-[2rem] bg-[#f6f5fa] p-5 sm:p-7">

                    {/* Featured Badge */}
                    <div className="absolute left-6 top-6 z-20">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-white bg-white/90 px-3 py-1.5 text-xs font-semibold text-violet-700 shadow-sm backdrop-blur">
                        <Sparkles className="h-3.5 w-3.5" />
                        Featured
                      </span>
                    </div>

                    {/* Product Image */}
                    <Link
                      to={`/products/${featuredProduct.slug}`}
                      className="group block"
                    >
                      <div className="flex h-[300px] items-center justify-center sm:h-[340px]">

                        <img
                          src={featuredVariant.image}
                          alt={featuredProduct.name}
                          className="h-full w-full object-contain p-8 drop-shadow-[0_24px_25px_rgba(15,23,42,0.13)] transition duration-500 group-hover:scale-[1.04]"
                        />

                      </div>
                    </Link>

                    {/* Product Information */}
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">

                      <div className="flex items-start justify-between gap-4">

                        <div className="min-w-0">

                          <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-400">
                            Featured product
                          </p>

                          <Link
                            to={`/products/${featuredProduct.slug}`}
                            className="mt-1 block text-lg font-bold text-slate-950 transition hover:text-violet-600"
                          >
                            {featuredProduct.name}
                          </Link>

                          <p className="mt-1 text-sm text-slate-500">
                            {featuredVariant.color}

                            <span className="mx-1.5">
                              ·
                            </span>

                            {featuredVariant.storage}
                          </p>

                        </div>

                        {/* Price */}
                        <div className="shrink-0 text-right">

                          <p className="text-lg font-bold text-slate-950">
                            {formatCurrency(featuredVariant.price)}
                          </p>

                          {featuredVariant.mrp >
                            featuredVariant.price && (
                            <p className="text-xs text-slate-400 line-through">
                              {formatCurrency(featuredVariant.mrp)}
                            </p>
                          )}

                        </div>

                      </div>

                      {/* Bottom Information */}
                      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">

                        <div className="flex items-center gap-2">

                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
                            <ShieldCheck className="h-4 w-4 text-emerald-600" />
                          </div>

                          <div>
                            <p className="text-xs font-semibold text-slate-800">
                              Flexible payment
                            </p>

                            <p className="text-[11px] text-slate-400">
                              Compare EMI options
                            </p>
                          </div>

                        </div>

                        <Link
                          to={`/products/${featuredProduct.slug}`}
                          className="group flex items-center gap-1 text-sm font-semibold text-violet-600"
                        >
                          View

                          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                        </Link>

                      </div>

                    </div>
                  </div>
                </div>

              ) : (

                /* No Products */
                <div className="flex min-h-[420px] w-full max-w-lg items-center justify-center rounded-[2rem] bg-slate-50">

                  <div className="text-center">

                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                      <Sparkles className="h-6 w-6" />
                    </div>

                    <p className="mt-4 text-sm font-medium text-slate-500">
                      Products coming soon
                    </p>

                  </div>

                </div>
              )}

            </div>
          </div>
        </div>
      </section>

      {/* ==========================================================
          FEATURED PRODUCTS
      ========================================================== */}

      <section className="bg-slate-50 py-16 sm:py-20">

        <div className="page-container">

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">

            <div>

              <p className="text-xs font-bold uppercase tracking-[0.14em] text-violet-600">
                Explore
              </p>

              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                Featured Products
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
                Find a product you love and choose an EMI plan
                that fits your payment preference.
              </p>

            </div>

            <Link
              to="/products"
              className="group inline-flex w-fit items-center text-sm font-semibold text-violet-600 transition hover:text-violet-700"
            >
              View all

              <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>

          </div>

          {/* Loading */}

          {loading && (
            <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">

              {[1, 2, 3].map((item) => (
                <ProductSkeleton key={item} />
              ))}

            </div>
          )}

          {/* Error */}

          {!loading && error && (
            <div className="mt-8 rounded-2xl border border-red-100 bg-red-50 px-6 py-10 text-center">

              <p className="text-sm font-medium text-red-600">
                {error}
              </p>

              <Link
                to="/products"
                className="mt-4 inline-flex items-center text-sm font-semibold text-red-600 underline"
              >
                Browse products
              </Link>

            </div>
          )}

          {/* Dynamic Products */}

          {!loading && !error && products.length > 0 && (
            <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">

              {products.slice(0, 3).map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                />
              ))}

            </div>
          )}

          {/* Empty */}

          {!loading && !error && products.length === 0 && (
            <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">

              <p className="text-sm text-slate-500">
                No products are available right now.
              </p>

            </div>
          )}

        </div>
      </section>

      {/* ==========================================================
          HOW IT WORKS
      ========================================================== */}

      <section
        id="how-it-works"
        className="border-t border-slate-100 bg-white py-16 sm:py-20"
      >

        <div className="page-container">

          <div className="mx-auto max-w-2xl text-center">

            <p className="text-xs font-bold uppercase tracking-[0.14em] text-violet-600">
              How it works
            </p>

            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Simple from start to finish
            </h2>

            <p className="mt-4 text-sm leading-6 text-slate-500 sm:text-base">
              Choose a product, compare your options, and select
              the payment plan that works for you.
            </p>

          </div>

          <div className="relative mt-12 grid gap-10 md:grid-cols-3 md:gap-8">

            {/* Connecting line */}

            <div className="absolute left-[16.66%] right-[16.66%] top-6 hidden h-px bg-slate-200 md:block" />

            <Step
              number="01"
              title="Choose a product"
              description="Browse products and select the variant you want."
            />

            <Step
              number="02"
              title="Compare EMI plans"
              description="Compare tenure, monthly payment, interest rate and cashback."
            />

            <Step
              number="03"
              title="Proceed"
              description="Select your preferred plan and create your order."
            />

          </div>
        </div>
      </section>

      {/* ==========================================================
          FINAL CTA
      ========================================================== */}

      <section className="bg-slate-950 py-14 sm:py-16">

        <div className="page-container">

          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">

            <div>

              <p className="text-xs font-bold uppercase tracking-[0.14em] text-violet-400">
                FundPay
              </p>

              <h2 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Make your next purchase more flexible.
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
                Explore products and compare EMI plans before you
                decide.
              </p>

            </div>

            <Link
              to="/products"
              className="group inline-flex shrink-0 items-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-violet-50"
            >
              Explore Products

              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>

          </div>

        </div>
      </section>

    </main>
  );
}

/* ================================================================
   PRODUCT CARD
================================================================ */

function ProductCard({ product }: { product: Product }) {
  const variant = product.variants?.[0];

  if (!variant) return null;

  return (
    <Link
      to={`/products/${product.slug}`}
      className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_15px_35px_rgba(15,23,42,0.08)]"
    >

      {/* Image */}

      <div className="relative flex h-60 items-center justify-center bg-[#f7f7f8] p-7">

        <img
          src={variant.image}
          alt={product.name}
          className="h-full w-full object-contain transition duration-500 group-hover:scale-[1.04]"
        />

        {variant.discount > 0 && (
          <span className="absolute left-4 top-4 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
            {variant.discount}% OFF
          </span>
        )}

      </div>

      {/* Content */}

      <div className="p-5">

        <div className="flex items-start justify-between gap-3">

          <div className="min-w-0">

            <h3 className="truncate font-bold text-slate-950">
              {product.name}
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              {variant.color}

              <span className="mx-1.5">
                ·
              </span>

              {variant.storage}
            </p>

          </div>

          <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-1 group-hover:text-violet-600" />

        </div>

        {/* Price */}

        <div className="mt-5 flex items-end gap-2">

          <span className="text-xl font-bold text-slate-950">
            {formatCurrency(variant.price)}
          </span>

          {variant.mrp > variant.price && (
            <span className="pb-0.5 text-sm text-slate-400 line-through">
              {formatCurrency(variant.mrp)}
            </span>
          )}

        </div>

        {/* Bottom */}

        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">

          <span className="text-xs font-medium text-slate-400">
            Flexible EMI available
          </span>

          <span className="text-sm font-semibold text-violet-600">
            View
          </span>

        </div>

      </div>
    </Link>
  );
}

/* ================================================================
   HOW IT WORKS STEP
================================================================ */

function Step({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="relative z-10 text-center">

      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border-4 border-white bg-violet-600 text-sm font-bold text-white shadow-sm">
        {number}
      </div>

      <h3 className="mt-5 text-lg font-bold text-slate-950">
        {title}
      </h3>

      <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-slate-500">
        {description}
      </p>

    </div>
  );
}

/* ================================================================
   HERO SKELETON
================================================================ */

function HeroSkeleton() {
  return (
    <div className="w-full max-w-lg animate-pulse rounded-[2rem] bg-slate-100 p-5 sm:p-7">

      <div className="h-[300px] rounded-2xl bg-slate-200 sm:h-[340px]" />

      <div className="mt-5 rounded-2xl bg-white p-5">

        <div className="h-3 w-28 rounded bg-slate-200" />

        <div className="mt-3 h-6 w-52 rounded bg-slate-200" />

        <div className="mt-2 h-4 w-32 rounded bg-slate-200" />

        <div className="mt-6 h-8 w-28 rounded bg-slate-200" />

      </div>
    </div>
  );
}

/* ================================================================
   PRODUCT SKELETON
================================================================ */

function ProductSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-slate-200 bg-white">

      <div className="h-60 bg-slate-100" />

      <div className="p-5">

        <div className="h-5 w-2/3 rounded bg-slate-100" />

        <div className="mt-3 h-4 w-1/2 rounded bg-slate-100" />

        <div className="mt-5 h-6 w-1/3 rounded bg-slate-100" />

        <div className="mt-5 h-px bg-slate-100" />

        <div className="mt-4 h-4 w-2/3 rounded bg-slate-100" />

      </div>
    </div>
  );
}

export default Home;