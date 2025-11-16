import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Navigate } from "react-router-dom";
import Logo from "../../assets/ktg-text-logo.png";
import { FiMonitor } from "react-icons/fi";

function isUserAdmin(data: { role?: string } | null): boolean {
  return data?.role === "admin";
}

const AdminGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 1024);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

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
          const adminStatus = isUserAdmin(data);
          setIsAdmin(adminStatus);
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

  if (isSmallScreen) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-gray-50 px-6">
        <div className="max-w-md text-center">
          <FiMonitor className="w-16 h-16 mx-auto mb-6 text-gray-400" />
          <h1 className="text-2xl font-semibold text-gray-900 mb-4 font-clash">
            Desktop Only
          </h1>
          <p className="text-gray-600 mb-6 font-clash">
            The admin panel is only available on desktop devices. Please use a
            device with a larger screen (1024px or wider) to access the admin
            dashboard.
          </p>
          <button
            onClick={() => (window.location.href = "/")}
            className="bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition-colors font-clash"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AdminGuard;
