import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { ArrowRight, Check, Loader2, Package, Search, ShieldCheck, SlidersHorizontal } from "lucide-react";
import { Link } from "react-router-dom";

interface ProductVariant {
  _id: string;
  color: string;
  storage: string;
  mrp: number;
  price: number;
  image: string;
}

interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  variants: ProductVariant[];
}

function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const apiUrl = import.meta.env.VITE_API_URL as string;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axios.get(`${apiUrl}/products`);

        setProducts(response.data.products ?? []);
      } catch (error) {
        console.error(error);

        if (axios.isAxiosError(error)) {
          setError(
            error.response?.data?.message ||
              "Unable to fetch products. Please try again."
          );
        } else {
          setError("Unable to fetch products. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    void fetchProducts();
  }, [apiUrl]);

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return products;
    }

    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.variants.some(
          (variant) =>
            variant.color.toLowerCase().includes(query) ||
            variant.storage.toLowerCase().includes(query)
        )
    );
  }, [products, searchQuery]);


  return (
    <main className="min-h-screen bg-slate-50">
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
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
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
            {filteredProducts.length}{" "}
            {filteredProducts.length === 1 ? "product" : "products"} available
          </p>

        </div>
        {loading ? (
          <div className="card flex min-h-72 items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-slate-500">
              <Loader2 className="h-7 w-7 animate-spin text-primary-600" />
              <p className="text-sm font-medium">Loading products...</p>
            </div>
          </div>
        ) : error ? (
          <div className="card flex min-h-72 flex-col items-center justify-center p-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-danger-50">
              <Package className="h-6 w-6 text-danger-600" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-slate-900">
              Unable to load products
            </h3>
            <p className="mt-2 max-w-md text-sm text-slate-500">
              {error}
            </p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="card flex min-h-72 flex-col items-center justify-center p-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
              <Search className="h-6 w-6 text-slate-400" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-slate-900">
              No products found
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Try searching with a different product name, color or storage.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => {
              const variant = product.variants[0];

              if (!variant) {
                return null;
              }

              const discount = Math.max(0, variant.mrp - variant.price);

              return (
                <article
                  key={product._id}
                  className="card card-hover group overflow-hidden"
                >
                  <Link
                    to={`/products/${product.slug}`}
                    className="relative block overflow-hidden bg-slate-100"
                  >
                    <div className="flex aspect-square items-center justify-center p-8">
                      {variant.image ? (
                        <img
                          src={variant.image}
                          alt={product.name}
                          className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <Package className="h-16 w-16 text-slate-300" />
                      )}
                    </div>

                    {/* Discount */}
                    {discount > 0 && (
                      <span className="absolute left-4 top-4 badge-success">
                        Save ₹{discount.toLocaleString("en-IN")}
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
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                        {variant.color}
                      </span>

                      <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                        {variant.storage}
                      </span>
                    </div>
                    <div className="mt-5">
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-slate-900">
                          ₹{variant.price.toLocaleString("en-IN")}
                        </span>

                        {variant.mrp > variant.price && (
                          <span className="text-sm text-slate-400 line-through">
                            ₹{variant.mrp.toLocaleString("en-IN")}
                          </span>
                        )}
                      </div>

                      {discount > 0 && (
                        <p className="mt-1 text-xs text-success-600">
                          Inclusive of product discount
                        </p>
                      )}
                    </div>

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
        )}

      </section>
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