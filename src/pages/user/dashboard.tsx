import { useState } from "react";
import Order from "../../components/postauth/user_order";
import Shipping from "../../components/postauth/user_shipping";
import Sidebar from "../../components/postauth/sidebar";
import Navbar from "../../components/postauth/navbar";

const sidebarItems = [
  {
    tab: "ORDERS",
    name: "Orders",
    path: "/user/orders",
    component: <Order />,
  },
  {
    tab: "SHIPPING",
    name: "Shipping info",
    path: "/user",
    component: <Shipping />,
  },
];

export function Dashboard() {
  const [activeTab, setActiveTab] = useState("ORDERS");
  return (
    <>
      {/* Navbar with navigation links for mobile, regular for desktop */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white">
        <Navbar
          navLinks={sidebarItems}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </header>
      <section className="w-full px-4 font-clash flex flex-col lg:flex-row mt-20">
        <aside className="hidden lg:block lg:fixed lg:top-20 lg:left-0 lg:w-[20%] w-full border-r lg:border-r-gray-400 lg:h-screen lg:overflow-auto">
          <Sidebar
            navlink={sidebarItems}
            setActiveTab={setActiveTab}
            activeTab={activeTab}
          />
        </aside>
        <main className="flex-1 min-h-[60vh] px-0 py-6 lg:ml-[20%]">
          <div className="mt-5 max-md:mt-1">
            {sidebarItems.find((item) => item.tab === activeTab)?.component}
          </div>
        </main>
      </section>
    </>
  );
}
