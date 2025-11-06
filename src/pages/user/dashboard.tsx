import { useState } from "react";
import Order from "../../components/postauth/user_order";
import Shipping from "../../components/postauth/user_shipping";
import Sidebar from "../../components/postauth/sidebar";

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
    <section className="w-full px-4 font-clash flex flex-col lg:flex-row">
      <aside className="lg:fixed lg:top-16 lg:left-0 lg:w-[20%] w-full border-r lg:border-r-gray-400 lg:h-screen lg:overflow-auto">
        <Sidebar
          navlink={sidebarItems}
          setActiveTab={setActiveTab}
          activeTab={activeTab}
        />
      </aside>
      <main className="flex-1 min-h-[60vh] px-5 py-6 lg:ml-[20%]">
        <div className="mt-5">
          {sidebarItems.find((item) => item.tab === activeTab)?.component}
        </div>
      </main>
    </section>
  );
}
