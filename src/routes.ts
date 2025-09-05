import { createBrowserRouter } from "react-router-dom";
import Dashboard from "./pages/user/dashboard";
import AuthLayout from "./layout/auth_layout";
import UserLogin from "./pages/auth/user_login";
import UserRegister from "./pages/auth/user_register";

const routes = createBrowserRouter([
  {
    path: "/",
    Component: Dashboard,
  },
  {
    path: "auth",
    Component: AuthLayout,
    children: [
      { path: "login", Component: UserLogin },
      { path: "signup", Component: UserRegister },
    ],
  },
]);

export default routes;
