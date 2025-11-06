import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Navigate } from "react-router-dom";
import Logo from "../../assets/ktg-text-logo.png";

const AdminGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let mounted = true;
    const check = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          if (mounted) {
            setIsAdmin(false);
            setChecking(false);
          }
          return;
        }

        const { data, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Admin check error:", error);
          if (mounted) {
            setIsAdmin(false);
            setChecking(false);
          }
          return;
        }

        if (mounted) {
          setIsAdmin(data?.role === "admin");
          setChecking(false);
        }
      } catch (err) {
        console.error("Admin check failed:", err);
        if (mounted) {
          setIsAdmin(false);
          setChecking(false);
        }
      }
    };

    check();
    return () => {
      mounted = false;
    };
  }, []);

  if (checking)
    return (
      <div
        className="w-full h-screen flex items-center justify-center"
        aria-busy
      >
        <img src={Logo} alt="loading" className="w-15 h-auto animate-pulse" />
      </div>
    );
  if (!isAdmin) return <Navigate to="/" replace />;

  return <>{children}</>;
};

export default AdminGuard;
