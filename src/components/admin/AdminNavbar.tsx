import React from "react";
import { useAuth } from "../hooks/useAuth";
import Logo from "../../assets/ktg-text-logo.png";

const AdminNavbar: React.FC = () => {
  const { handleAdminLogout } = useAuth();

  return (
    <header className="w-full bg-white border-b font-clash">
      <div className="max-w-7xl mx-auto flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <img src={Logo} alt="logo" className="w-15 h-auto" />
          <div>
            <div className="text-lg font-medium">KTG Admin</div>
            <div className="text-xs text-gray-500 font-medium">
              Administration
            </div>
          </div>
        </div>
        <div>
          <button
            onClick={() => void handleAdminLogout()}
            className="px-5 py-1.5 border text-base cursor-pointer"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default AdminNavbar;
