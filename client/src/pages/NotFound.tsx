import { ArrowLeft, Home, SearchX } from "lucide-react";
import { Link } from "react-router-dom";

function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-12">
      <div className="w-full max-w-lg text-center">

        {/* Icon */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-primary-50">
          <SearchX className="h-9 w-9 text-primary-600" />
        </div>

        {/* 404 */}
        <p className="mt-8 text-7xl font-bold tracking-tight text-primary-600 sm:text-8xl">
          404
        </p>

        {/* Heading */}
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Page not found
        </h1>

        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500 sm:text-base">
          Sorry, we couldn't find the page you're looking for.
          It may have been moved, deleted, or the URL might be incorrect.
        </p>

        {/* Actions */}
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">

          <Link
            to="/"
            className="btn-primary"
          >
            <Home className="mr-2 h-4 w-4" />
            Go Home
          </Link>

          <button
            type="button"
            onClick={() => window.history.back()}
            className="btn-secondary"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </button>

        </div>

        {/* Brand */}
        <p className="mt-12 text-sm font-semibold tracking-tight text-slate-400">
          Fund<span className="text-primary-500">Pay</span>
        </p>

      </div>
    </main>
  );
}

export default NotFound;