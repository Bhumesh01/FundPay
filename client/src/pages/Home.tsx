import { useEffect, useState } from "react";
import { ArrowRight, Check, CreditCard, ShieldCheck, Sparkles, Wallet } from "lucide-react";
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

function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getProducts();
        setProducts(data);
      } catch (err) {
        console.error(err);
        setError("Unable to load products right now.");
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  return (
    <div>
      <section className="bg-white">
        <div className="page-container py-16 sm:py-20 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="max-w-xl">
              <div className="mb-5 inline-flex cursor-pointer items-center gap-2 rounded-full bg-primary-50 px-4 py-2 text-sm font-medium text-primary-700">
                <Sparkles className="h-4 w-4" />
                Smarter way to purchase
              </div>

              <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                Your investments.
                <br />
                Your purchases.
                <br />
                <span className="text-primary-600">
                  Your flexibility.
                </span>
              </h1>

              <p className="mt-6 text-base leading-7 text-slate-600 sm:text-lg">
                Explore products, compare flexible EMI plans, and choose
                a payment option that works for you.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/products"
                  className="btn-primary cursor-pointer"
                >
                  Explore Products
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>

                <a
                  href="#how-it-works"
                  className="btn-secondary cursor-pointer"
                >
                  How it works
                </a>
              </div>

              <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-success-600" />
                  Flexible EMI plans
                </div>

                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-success-600" />
                  Transparent pricing
                </div>
              </div>
            </div>

            {/* RIGHT */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative w-full max-w-md">
                <div className="rounded-3xl bg-soft-gradient p-6 sm:p-8">
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                          FundPay
                        </p>

                        <p className="mt-1 font-semibold text-slate-900">
                          Flexible EMI
                        </p>
                      </div>

                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50">
                        <Wallet className="h-5 w-5 text-primary-600" />
                      </div>
                    </div>

                    <div className="mt-6 rounded-xl bg-slate-50 p-5">
                      <div className="flex h-32 items-center justify-center rounded-xl bg-white">
                        <CreditCard className="h-14 w-14 text-primary-300" />
                      </div>

                      <p className="mt-4 text-sm text-slate-500">
                        Choose a product
                      </p>

                      <p className="mt-1 text-lg font-bold text-slate-900">
                        Compare your EMI options
                      </p>
                    </div>

                    <div className="mt-4 flex items-center gap-3 rounded-xl bg-success-50 p-4">
                      <ShieldCheck className="h-5 w-5 shrink-0 text-success-600" />

                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          Simple & transparent
                        </p>

                        <p className="mt-0.5 text-xs text-slate-500">
                          Compare before you choose
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="section bg-slate-50">
        <div className="page-container">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <span className="badge-primary">Explore</span>

              <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
                Featured Products
              </h2>

              <p className="mt-2 text-slate-500">
                Find a product and choose an EMI plan that works for you.
              </p>
            </div>

            <Link
              to="/products"
              className="group inline-flex cursor-pointer items-center text-sm font-semibold text-primary-600 transition-colors hover:text-primary-700"
            >
              View all
              <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* LOADING */}
          {loading && (
            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5"
                >
                  <div className="h-56 rounded-xl bg-slate-100" />

                  <div className="mt-5 h-5 w-2/3 rounded bg-slate-100" />

                  <div className="mt-3 h-4 w-1/2 rounded bg-slate-100" />

                  <div className="mt-5 h-5 w-1/3 rounded bg-slate-100" />
                </div>
              ))}
            </div>
          )}

          {/* ERROR */}
          {!loading && error && (
            <div className="mt-10 rounded-2xl border border-danger-100 bg-danger-50 p-8 text-center">
              <p className="font-medium text-danger-600">
                {error}
              </p>

              <Link
                to="/products"
                className="mt-4 inline-flex cursor-pointer text-sm font-semibold text-danger-600 underline"
              >
                Browse products
              </Link>
            </div>
          )}

          {/* DYNAMIC PRODUCTS */}
          {!loading && !error && products.length > 0 && (
            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {products.slice(0, 3).map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                />
              ))}
            </div>
          )}

          {/* EMPTY */}
          {!loading && !error && products.length === 0 && (
            <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-10 text-center">
              <p className="text-slate-500">
                No products are available right now.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section
        id="how-it-works"
        className="section bg-white"
      >
        <div className="page-container">
          <div className="mx-auto max-w-2xl text-center">
            <span className="badge-primary">
              How it works
            </span>

            <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Simple from start to finish
            </h2>

            <p className="mt-4 text-slate-500">
              Choose a product, compare your options, and proceed.
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <Step
              number="01"
              title="Choose a product"
              description="Browse products and select the variant you want."
            />

            <Step
              number="02"
              title="Select an EMI plan"
              description="Compare tenure, interest rate, monthly payment and cashback."
            />

            <Step
              number="03"
              title="Proceed"
              description="Confirm your selection and create your order."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-dark-gradient py-16 sm:py-20">
        <div className="page-container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-primary-800 sm:text-4xl">
              Ready to get started?
            </h2>

            <p className="mt-4 text-slate-500">
              Explore products and find an EMI plan that works for you.
            </p>

            <Link
              to="/products"
              className="mt-7 inline-flex cursor-pointer items-center rounded-xl bg-white px-6 py-3 font-semibold text-primary-700 transition hover:bg-primary-50"
            >
              Explore Products
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  const variant = product.variants[0];

  if (!variant) return null;

  return (
    <Link
      to={`/products/${product.slug}`}
      className="card card-hover group cursor-pointer overflow-hidden"
    >
      <div className="relative flex h-56 items-center justify-center bg-slate-50 p-7">
        <img
          src={variant.image}
          alt={product.name}
          className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
        />

        {variant.discount > 0 && (
          <span className="badge-success absolute left-4 top-4">
            {variant.discount}% OFF
          </span>
        )}
      </div>

      <div className="p-5">
        <h3 className="font-semibold text-slate-900">
          {product.name}
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          {variant.storage} • {variant.color}
        </p>

        <div className="mt-4 flex items-end gap-2">
          <span className="text-xl font-bold text-slate-900">
            ₹{variant.price.toLocaleString("en-IN")}
          </span>

          {variant.mrp > variant.price && (
            <span className="text-sm text-slate-400 line-through">
              ₹{variant.mrp.toLocaleString("en-IN")}
            </span>
          )}
        </div>

        <div className="mt-5 flex cursor-pointer items-center text-sm font-semibold text-primary-600">
          View product
          <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}

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
    <div className="text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600 text-sm font-bold text-white">
        {number}
      </div>

      <h3 className="mt-5 text-lg font-semibold text-slate-900">
        {title}
      </h3>

      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}

export default Home;