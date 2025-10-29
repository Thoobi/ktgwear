import React from "react";
import { useAuth } from "../hooks/useAuth";
import { useEffect, useState } from "react";
import { RiLogoutBoxRLine } from "react-icons/ri";

export function Sidebar({
  navlink,
  setActiveTab,
  activeTab,
}: {
  navlink: {
    tab: string;
    name: string;
    path: string;
    component: React.JSX.Element;
  }[];
  setActiveTab: (tab: string) => void;
  activeTab: string;
}) {
  const { handleLogout, getUser, isUserDataLoading } = useAuth();
  const [userName, setUserName] = useState("");
  useEffect(() => {
    const fetchUser = async () => {
      const user = await getUser();
      if (user) {
        setUserName(user.user_metadata?.display_name || user.email || "");
      }
    };
    fetchUser();
  }, []);

  return (
    <section className="relative w-full h-full py-5">
      <div className="w-full space-y-6 font-clash px-4 lg:px-0">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-lg lg:text-2xl font-normal text-gray-600">
            Hello,
            <span
              className={`ml-2 text-lg lg:text-2xl font-medium text-black ${
                isUserDataLoading && "animate-ping bg-gray-100 p-3 w-full"
              }`}
            >
              {isUserDataLoading ? "user..." : userName}
            </span>
          </h2>
        </div>

        <div className="flex flex-col space-y-2 mt-8">
          {navlink.map((item, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(item.tab)}
              className={`text-lg lg:text-lg font-normal p-2 text-left cursor-pointer ${
                activeTab === item.tab
                  ? "text-white font-bold bg-black"
                  : "text-black hover:bg-gray-100"
              }`}
            >
              {item.name}
            </button>
          ))}
        </div>
      </div>

      {/* mobile logout button fixed near bottom */}
      <button
        onClick={handleLogout}
        className="lg:hidden fixed right-4 bottom-6 px-4 py-3 bg-red-600 text-white rounded-full shadow-md"
      >
        <RiLogoutBoxRLine className="text-xl" />
      </button>
    </section>
  );
}

export default Sidebar;
