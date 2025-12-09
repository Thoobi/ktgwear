import React from "react";
import AdminGuard from "../../components/admin/AdminGuard";
import AdminNavbar from "../../components/admin/AdminNavbar";
import AdminSidebar from "../../components/admin/AdminSidebar";
import FeaturedForm from "../../components/admin/FeaturedForm";

const AdminFeaturedAdd: React.FC = () => {
  return (
    <AdminGuard>
      <AdminNavbar />
      <div className="flex pt-[65px]">
        <AdminSidebar />
        <div className="flex-1 ml-56">
          <FeaturedForm mode="add" />
        </div>
      </div>
    </AdminGuard>
  );
};

export default AdminFeaturedAdd;
