import React from "react";
import AdminGuard from "../../components/admin/AdminGuard";
import AdminNavbar from "../../components/admin/AdminNavbar";
import AdminSidebar from "../../components/admin/AdminSidebar";
import ManageFeaturedCollections from "../../components/admin/ManageFeaturedCollections";

const AdminFeatured: React.FC = () => {
  return (
    <AdminGuard>
      <AdminNavbar />
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1">
          <ManageFeaturedCollections />
        </div>
      </div>
    </AdminGuard>
  );
};

export default AdminFeatured;
