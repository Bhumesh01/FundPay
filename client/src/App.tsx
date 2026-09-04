import { BrowserRouter, Routes, Route } from "react-router-dom";
import SignIn from "./pages/Signin";
import SignUp from "./pages/Signup";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import NotFound from "./pages/NotFound";

function App() {

  return (
    <BrowserRouter>
      <Routes>

        {/* Authentication */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Admin */}
        <Route path="/admin" element={<AdminDashboard />} />

        {/* User */}
        <Route path="/dashboard" element={<UserDashboard />} />

        {/* Products */}
        <Route path="/products" element={<Products />} />
        <Route
          path="/products/:slug"
          element={<ProductDetails />}
        />

        {/* Error Boundary */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App
