import { Outlet } from "react-router-dom";
import Navbar from "../components/postauth/navbar";
export default function AuthLayout() {
  return (
    <div>
      <header className="sticky top-0 z-50 bg-white">
        <Navbar />
      </header>
      <Outlet />
    </div>
  );
}
