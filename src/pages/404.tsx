import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../components/hooks/useAuth";

export default function NotFound() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate(isAuthenticated ? "/user/dashboard" : "/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate, isAuthenticated]);

  const redirectPath = isAuthenticated ? "/user/dashboard" : "/";
  const redirectLabel = isAuthenticated ? "Dashboard" : "Home";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center px-4 font-clash overflow-x-hidden">
      <div className="max-w-2xl w-full text-center">
        {/* 404 Text with Animation */}
        <div className="relative mb-8">
          <h1
            className="font-bold text-gray-200 leading-none select-none max-w-full overflow-hidden text-[clamp(6rem,20vw,12rem)] sm:text-[clamp(8rem,24vw,16rem)] md:text-[clamp(10rem,28vw,20rem)]"
            style={{ wordBreak: "break-word" }}
          >
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white/80 backdrop-blur-sm p-6 sm:p-8 shadow-lg">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-gray-900 mb-3">
                Page Not Found
              </h2>
              <p className="text-base sm:text-lg text-gray-600 mb-1">
                Oops! The page you're looking for doesn't exist.
              </p>
              <p className="text-sm sm:text-base text-gray-500">
                It might have been moved or deleted.
              </p>
            </div>
          </div>
        </div>

        {/* Countdown and Actions */}
        <div className="space-y-6 mt-12">
          <div className="flex items-center justify-center gap-2 text-gray-600">
            <span className="text-base sm:text-lg">
              Redirecting to {redirectLabel} in
            </span>
            <span className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-black text-white rounded-full text-lg sm:text-xl font-semibold">
              {countdown}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to={redirectPath}
              className="w-full sm:w-auto px-8 py-3 bg-black text-white hover:bg-gray-800 transition-all duration-300 font-medium text-base sm:text-lg"
            >
              Go to {redirectLabel}
            </Link>
            <Link
              to="/shop"
              className="w-full sm:w-auto px-8 py-3 bg-white text-black border-2 border-gray-200 rounded-lg hover:border-gray-400 transition-all duration-300 font-medium text-base sm:text-lg"
            >
              Browse Shop
            </Link>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="mt-16 grid grid-cols-3 gap-4 opacity-40">
          <div className="h-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent rounded"></div>
          <div className="h-1 bg-gradient-to-r from-transparent via-gray-400 to-transparent rounded"></div>
          <div className="h-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent rounded"></div>
        </div>
      </div>
    </div>
  );
}
