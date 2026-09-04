import { BrowserRouter, Routes, Route } from "react-router-dom";
import SignIn from "./pages/Signin";
import SignUp from "./pages/Signup";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import NotFound from "./pages/NotFound";
import Home from "./pages/Home";
import Layout from "./components/Layout";

function App() {

  return (
    <BrowserRouter>
      <Routes>

        {/* Pages with Navbar + Footer */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:slug" element={<ProductDetails />} />
          <Route path="/dashboard" element={<UserDashboard />} />
        </Route>


        {/* Auth pages */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />


        {/* Admin */}
        <Route path="/admin" element={<AdminDashboard />} />


        {/* 404 */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App
