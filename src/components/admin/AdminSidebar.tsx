import React from "react";
import { NavLink } from "react-router-dom";

const linkBase = "block text-sm text-black hover:opacity-80 px-2 py-1";
const activeClass = "font-semibold border-l-4 border-black pl-2 bg-black/5";

const AdminSidebar: React.FC = () => {
  return (
    <aside className="w-56 h-screen border-r bg-white p-4 font-clash fixed left-0 top-[70px] z-40 overflow-y-auto">
      <nav className="space-y-3">
        <NavLink
          to="/admin"
          end
          className={({ isActive }) =>
            linkBase + (isActive ? ` ${activeClass}` : "")
          }
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/admin/products"
          className={({ isActive }) =>
            linkBase + (isActive ? ` ${activeClass}` : "")
          }
        >
          Manage products
        </NavLink>
        <NavLink
          to="/admin/featured"
          className={({ isActive }) =>
            linkBase + (isActive ? ` ${activeClass}` : "")
          }
        >
          Featured Collections
        </NavLink>
        <NavLink
          to="/admin/orders"
          className={({ isActive }) =>
            linkBase + (isActive ? ` ${activeClass}` : "")
          }
        >
          Orders
        </NavLink>
        <NavLink
          to="/admin/manage"
          className={({ isActive }) =>
            linkBase + (isActive ? ` ${activeClass}` : "")
          }
        >
          Manage admins
        </NavLink>
      </nav>
    </aside>
  );
};

export default AdminSidebar;
