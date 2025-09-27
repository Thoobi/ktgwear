import Navbar from "../components/shared/navbar";
import Footer from "../components/shared/footer";
import { Outlet } from "react-router-dom";
export default function HomeLayout() {
  return (
    <main>
      <header className="sticky top-0 z-50 bg-white">
        <Navbar />
      </header>
      <Outlet />
      <Footer />
    </main>
  );
}
