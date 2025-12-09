import React from "react";
import { useParams } from "react-router-dom";
import AdminGuard from "../../components/admin/AdminGuard";
import AdminNavbar from "../../components/admin/AdminNavbar";
import AdminSidebar from "../../components/admin/AdminSidebar";
import FeaturedForm from "../../components/admin/FeaturedForm";

const AdminFeaturedEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <AdminGuard>
      <AdminNavbar />
      <div className="flex pt-[65px]">
        <AdminSidebar />
        <div className="flex-1 ml-56">
          <FeaturedForm mode="edit" collectionId={id} />
        </div>
      </div>
    </AdminGuard>
  );
};

export default AdminFeaturedEdit;
