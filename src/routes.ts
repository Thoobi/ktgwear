import { createBrowserRouter } from "react-router-dom";
import { Dashboard } from "./pages/user/dashboard";
import AuthLayout from "./layout/auth_layout";
import UserLogin from "./pages/auth/user_login";
import UserRegister from "./pages/auth/user_register";
import UserForgot from "./pages/auth/user_forgot";
import ResetPasswordPage from "./pages/auth/reset_password_page";
import LandingPage from "./pages/landing/landing_page";
import Checkout from "./pages/landing/checkout";
import ProductDetails from "./pages/landing/product_details";
import About from "./pages/landing/about";
import Contact from "./pages/landing/contact";
import ShopCategoryPage from "./pages/landing/shop_category";
import HomeLayout from "./layout/home_layout";
import OrderDetails from "./components/postauth/order_details";
import AdminDashboard from "./pages/admin/admin_dashboard";
import AdminProducts from "./pages/admin/admin_products";
import AdminOrders from "./pages/admin/admin_orders";
import AdminManage from "./pages/admin/admin_manage";

const routes = createBrowserRouter([
  {
    path: "/",
    Component: HomeLayout,
    children: [
      { index: true, Component: LandingPage },
      {
        path: "about",
        Component: About,
      },
      {
        path: "contact",
        Component: Contact,
      },
      {
        path: "shop",
        Component: ShopCategoryPage,
      },
      {
        path: "shop/:category",
        Component: ShopCategoryPage,
      },
      {
        path: "account",
        children: [
          { path: "login", Component: UserLogin },
          { path: "signup", Component: UserRegister },
          { path: "forgot", Component: UserForgot },
          { path: "reset", Component: ResetPasswordPage },
        ],
      },
      {
        path: "checkout",
        Component: Checkout,
      },
      {
        path: "product/:id",
        Component: ProductDetails,
      },
    ],
  },
  {
    path: "user",
    Component: AuthLayout,
    children: [
      { path: "dashboard", Component: Dashboard },
      { path: "orders/:id", Component: OrderDetails },
    ],
  },
  {
    path: "admin",
    children: [
      { index: true, Component: AdminDashboard },
      { path: "products", Component: AdminProducts },
      { path: "orders", Component: AdminOrders },
      { path: "manage", Component: AdminManage },
    ],
  },
]);

export default routes;
