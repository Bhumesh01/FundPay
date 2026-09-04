import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

interface StoredUser {
  id: string;
  name: string;
  email: string;
  role: "customer" | "admin";
}

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState<StoredUser | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);

  /* ==========================================================
     CHECK LOGIN STATUS
  ========================================================== */

  const checkAuth = () => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      setUser(null);
      return;
    }

    try {
      const parsedUser: StoredUser = JSON.parse(storedUser);
      setUser(parsedUser);
    } catch (error) {
      console.error("Unable to read user information:", error);

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      setUser(null);
    }
  };

  /* ==========================================================
     INITIAL AUTH CHECK
  ========================================================== */

  useEffect(() => {
    checkAuth();
  }, []);

  /* ==========================================================
     CLOSE PROFILE WHEN CLICKING OUTSIDE
  ========================================================== */

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  /* ==========================================================
     CLOSE MENUS ON ROUTE CHANGE
  ========================================================== */

  useEffect(() => {
    setProfileOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  /* ==========================================================
     LOGOUT
  ========================================================== */

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
    setProfileOpen(false);
    setMobileMenuOpen(false);

    navigate("/");
  };

  /* ==========================================================
     MOBILE NAVIGATION
  ========================================================== */

  const handleNavigation = () => {
    setMobileMenuOpen(false);
    setProfileOpen(false);
  };

  /* ==========================================================
     ACTIVE TAB
  ========================================================== */

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }

    return location.pathname.startsWith(path);
  };

  const dashboardPath =
    user?.role === "admin"
      ? "/admin"
      : "/dashboard";

  /* ==========================================================
     FIRST LETTER
  ========================================================== */

  const firstLetter =
    user?.name?.trim()?.charAt(0)?.toUpperCase() || "U";

  /* ==========================================================
     NAV LINK STYLE
  ========================================================== */

  const navLinkClass = (active: boolean) =>
    `relative rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
      active
        ? "bg-violet-50 text-violet-700"
        : "text-slate-600 hover:bg-slate-50 hover:text-violet-600"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-md">

      {/* ======================================================
          MAIN NAVBAR
      ====================================================== */}

      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">

        {/* ====================================================
            LOGO
        ==================================================== */}

        <Link
          to="/"
          onClick={handleNavigation}
          className="shrink-0 text-[22px] font-bold tracking-tight text-slate-950 transition-opacity hover:opacity-80"
        >
          Fund<span className="text-violet-600">Pay</span>
        </Link>

        {/* ====================================================
            DESKTOP NAVIGATION
        ==================================================== */}

        <nav className="hidden items-center gap-1 md:flex">

          <Link
            to="/"
            className={navLinkClass(isActive("/"))}
          >
            Home
          </Link>

          <Link
            to="/products"
            className={navLinkClass(isActive("/products"))}
          >
            Products
          </Link>

          {user && (
            <Link
              to={dashboardPath}
              className={navLinkClass(
                isActive(dashboardPath)
              )}
            >
              {user.role === "admin"
                ? "Admin Dashboard"
                : "Dashboard"}
            </Link>
          )}

        </nav>

        {/* ====================================================
            DESKTOP AUTH
        ==================================================== */}

        <div className="hidden items-center gap-3 md:flex">

          {/* ==================================================
              LOGGED OUT
          ================================================== */}

          {!user ? (
            <>
              <Link
                to="/signin"
                className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition-all duration-200 hover:bg-slate-50 hover:text-violet-600"
              >
                Sign In
              </Link>

              <Link
                to="/signup"
                className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-violet-200 transition-all duration-200 hover:bg-violet-700 hover:shadow-md"
              >
                Sign Up
              </Link>
            </>
          ) : (

            /* ==================================================
               LOGGED IN PROFILE
            ================================================== */

            <div
              ref={profileRef}
              className="relative"
              onMouseEnter={() => setProfileOpen(true)}
              onMouseLeave={() => setProfileOpen(false)}
            >

              {/* =================================================
                  PROFILE PILL
              ================================================= */}

              <button
                type="button"
                onClick={() =>
                  setProfileOpen((prev) => !prev)
                }
                className={`flex h-11 items-center gap-2.5 rounded-full border px-1.5 pr-3 transition-all duration-200 ${
                  profileOpen
                    ? "border-violet-200 bg-violet-50 shadow-sm"
                    : "border-slate-200 bg-white hover:border-violet-200 hover:bg-slate-50"
                }`}
                aria-label="Open account menu"
                aria-expanded={profileOpen}
              >

                {/* FIRST LETTER AVATAR */}

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-600 text-sm font-bold text-white shadow-sm">
                  {firstLetter}
                </div>

                {/* USER NAME */}

                <span className="hidden max-w-[120px] truncate text-sm font-semibold text-slate-700 lg:block">
                  {user.name}
                </span>

                {/* CHEVRON */}

                <ChevronDown
                  className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
                    profileOpen ? "rotate-180" : ""
                  }`}
                />

              </button>

              {/* =================================================
                  ACCOUNT DROPDOWN
              ================================================= */}

              {profileOpen && (
                <div
                  className="absolute right-0 top-full w-72 pt-2"
                  onMouseEnter={() => setProfileOpen(true)}
                >

                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-300/30">

                    {/* =================================================
                        USER INFORMATION
                    ================================================= */}

                    <div className="rounded-xl bg-slate-50 p-4">

                      <div className="flex items-center gap-3">

                        {/* BIG FIRST LETTER */}

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-violet-600 text-base font-bold text-white shadow-sm">
                          {firstLetter}
                        </div>

                        {/* NAME + EMAIL */}

                        <div className="min-w-0">

                          <p className="truncate text-sm font-semibold text-slate-900">
                            {user.name}
                          </p>

                          <p className="mt-0.5 truncate text-xs text-slate-500">
                            {user.email}
                          </p>

                        </div>

                      </div>

                      {/* ROLE */}

                      <div className="mt-3">
                        <span className="inline-flex rounded-full bg-violet-100 px-2.5 py-1 text-[11px] font-semibold capitalize text-violet-700">
                          {user.role}
                        </span>
                      </div>

                    </div>

                    {/* DIVIDER */}

                    <div className="my-2 h-px bg-slate-100" />

                    {/* =================================================
                        DASHBOARD
                    ================================================= */}

                    <Link
                      to={dashboardPath}
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-600 transition-colors hover:bg-violet-50 hover:text-violet-700"
                    >

                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                        <LayoutDashboard className="h-4 w-4" />
                      </div>

                      <span>
                        {user.role === "admin"
                          ? "Admin Dashboard"
                          : "Dashboard"}
                      </span>

                    </Link>

                    {/* =================================================
                        LOGOUT
                    ================================================= */}

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                    >

                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50">
                        <LogOut className="h-4 w-4" />
                      </div>

                      <span>Logout</span>

                    </button>

                  </div>

                </div>
              )}

            </div>
          )}

        </div>

        {/* ====================================================
            MOBILE MENU BUTTON
        ==================================================== */}

        <button
          type="button"
          onClick={() =>
            setMobileMenuOpen((prev) => !prev)
          }
          className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition-colors hover:bg-slate-100 md:hidden"
          aria-label="Toggle menu"
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>

      </div>

      {/* ========================================================
          MOBILE MENU
      ======================================================== */}

      {mobileMenuOpen && (
        <div className="border-t border-slate-100 bg-white md:hidden">

          <div className="mx-auto max-w-7xl px-5 py-5 sm:px-8">

            {/* MOBILE NAVIGATION */}

            <nav className="flex flex-col gap-1">

              <Link
                to="/"
                onClick={handleNavigation}
                className={navLinkClass(isActive("/"))}
              >
                Home
              </Link>

              <Link
                to="/products"
                onClick={handleNavigation}
                className={navLinkClass(
                  isActive("/products")
                )}
              >
                Products
              </Link>

              {user && (
                <Link
                  to={dashboardPath}
                  onClick={handleNavigation}
                  className={navLinkClass(
                    isActive(dashboardPath)
                  )}
                >
                  {user.role === "admin"
                    ? "Admin Dashboard"
                    : "Dashboard"}
                </Link>
              )}

            </nav>

            {/* ==================================================
                MOBILE AUTH
            ================================================== */}

            <div className="mt-4 border-t border-slate-100 pt-4">

              {!user ? (

                <div className="grid grid-cols-2 gap-3">

                  <Link
                    to="/signin"
                    onClick={handleNavigation}
                    className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    Sign In
                  </Link>

                  <Link
                    to="/signup"
                    onClick={handleNavigation}
                    className="inline-flex items-center justify-center rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-violet-700"
                  >
                    Sign Up
                  </Link>

                </div>

              ) : (

                <div className="space-y-2">

                  {/* MOBILE USER INFO */}

                  <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-600 text-sm font-bold text-white">
                      {firstLetter}
                    </div>

                    <div className="min-w-0">

                      <p className="cursor-pointer truncate text-sm font-semibold text-slate-900">
                        {user.name}
                      </p>

                      <p className="truncate text-xs text-slate-400">
                        {user.email}
                      </p>

                    </div>

                  </div>

                  {/* DASHBOARD */}

                  <Link
                    to={dashboardPath}
                    onClick={handleNavigation}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    <LayoutDashboard className="h-4 w-4 cursor-pointer" />

                    {user.role === "admin"
                      ? "Admin Dashboard"
                      : "Dashboard"}
                  </Link>

                  {/* LOGOUT */}

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>

                </div>

              )}

            </div>

          </div>

        </div>
      )}

    </header>
  );
}