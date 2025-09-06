import { createBrowserRouter } from "react-router-dom";
import Dashboard from "./pages/user/dashboard";
import AuthLayout from "./layout/auth_layout";
import UserLogin from "./pages/auth/user_login";
import UserRegister from "./pages/auth/user_register";
import LandingPage from "./pages/landing/landing_page";

const routes = createBrowserRouter([
  {
    path: "/",
    Component: LandingPage,
  },
  {
    path: "auth",
    Component: AuthLayout,
    children: [
      { path: "login", Component: UserLogin },
      { path: "signup", Component: UserRegister },
    ],
  },
  {
    path: "user",
    Component: AuthLayout,
    children: [{ path: "dashboard", Component: Dashboard }],
  },
]);

export default routes;
