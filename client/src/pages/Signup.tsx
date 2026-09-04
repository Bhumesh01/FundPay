import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, ShieldCheck, TrendingUp, Loader2 } from "lucide-react";
import axios from "axios";

function SignUp() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    setServerError("");
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setErrors({
      name: "",
      email: "",
      password: "",
    });

    setServerError("");
    setLoading(true);

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/signup`,
        formData
      );

      navigate("/signin");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const data = error.response?.data;

        if (data?.nameErrors || data?.emailErrors || data?.passwordErrors) {
          setErrors({
            name: data.nameErrors?.[0] || "",
            email: data.emailErrors?.[0] || "",
            password: data.passwordErrors?.[0] || "",
          });
        }
        else if (data?.message) {
          setServerError(data.message);
        }

        else {
          setServerError("Something went wrong. Please try again.");
        }
      } else {
        setServerError("Unable to connect to the server.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="grid min-h-screen lg:grid-cols-2">

        {/* LEFT - BRANDING */}
        <section className="relative hidden overflow-hidden bg-primary-700 lg:flex">
          <div className="absolute inset-0 bg-primary-gradient" />

          <div className="relative z-10 flex w-full flex-col justify-between p-12 xl:p-16">

            {/* Logo */}
            <div>
              <Link
                to="/"
                className="cursor-pointer text-2xl font-bold tracking-tight text-white"
              >
                Fund<span className="text-primary-200">Pay</span>
              </Link>
            </div>

            {/* Main Content */}
            <div className="max-w-lg">

              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
                <TrendingUp className="h-7 w-7 text-white" />
              </div>

              <h1 className="text-4xl font-bold leading-tight text-white xl:text-5xl">
                Your investments.
                <br />
                Your purchases.
                <br />
                <span className="text-primary-200">
                  Your flexibility.
                </span>
              </h1>

              <p className="mt-6 max-w-md text-base leading-7 text-primary-100">
                Purchase the products you love with flexible EMI plans
                backed by your investments.
              </p>

              {/* Benefits */}
              <div className="mt-10 space-y-4">

                <div className="flex items-center gap-3 text-primary-100">
                  <ShieldCheck className="h-5 w-5 text-primary-200" />
                  <span>Secure and transparent payments</span>
                </div>

                <div className="flex items-center gap-3 text-primary-100">
                  <TrendingUp className="h-5 w-5 text-primary-200" />
                  <span>Flexible investment-backed EMIs</span>
                </div>

              </div>
            </div>

            {/* Footer */}
            <p className="text-sm text-primary-200">
              © 2026 FundPay. All rights reserved.
            </p>

          </div>
        </section>

        {/* RIGHT - SIGNUP */}
        <section className="flex items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-md">

            {/* Mobile Logo */}
            <div className="mb-10 lg:hidden">
              <Link
                to="/"
                className="cursor-pointer text-2xl font-bold tracking-tight text-slate-900"
              >
                Fund<span className="text-primary-600">Pay</span>
              </Link>
            </div>

            {/* Heading */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                Create your account
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Start shopping with flexible EMI plans.
              </p>
            </div>

            {/* Server Error */}
            {serverError && (
              <div className="mb-5 rounded-xl border border-danger-100 bg-danger-50 px-4 py-3 text-sm text-danger-600">
                {serverError}
              </div>
            )}

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="label"
                >
                  Name
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your name"
                  autoComplete="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={loading}
                  className={`input ${
                    errors.name
                      ? "border-danger-500 focus:border-danger-500 focus:ring-danger-100"
                      : ""
                  }`}
                />

                {errors.name && (
                  <p className="mt-2 text-xs text-danger-600">
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="label"
                >
                  Email
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                  className={`input ${
                    errors.email
                      ? "border-danger-500 focus:border-danger-500 focus:ring-danger-100"
                      : ""
                  }`}
                />

                {errors.email && (
                  <p className="mt-2 text-xs text-danger-600">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="label"
                >
                  Password
                </label>

                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Create a strong password"
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                  className={`input ${
                    errors.password
                      ? "border-danger-500 focus:border-danger-500 focus:ring-danger-100"
                      : ""
                  }`}
                />

                <p className="mt-2 text-xs text-slate-400">
                  At least 8 characters with uppercase, lowercase,
                  number and special character.
                </p>

                {errors.password && (
                  <p className="mt-2 text-xs text-danger-600">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create account
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </button>

            </form>

            {/* Login */}
            <p className="mt-8 text-center text-sm text-slate-500">
              Already have an account?{" "}
              <Link
                to="/login"
                className="cursor-pointer font-semibold text-primary-600 transition-colors hover:text-primary-700"
              >
                Sign in
              </Link>
            </p>

            {/* Terms */}
            <p className="mt-6 text-center text-xs leading-5 text-slate-400">
              By creating an account, you agree to our{" "}
              <span className="text-slate-500">
                Terms of Service
              </span>{" "}
              and{" "}
              <span className="text-slate-500">
                Privacy Policy
              </span>
              .
            </p>

          </div>
        </section>

      </div>
    </main>
  );
}

export default SignUp;