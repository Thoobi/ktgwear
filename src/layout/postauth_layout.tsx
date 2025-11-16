import React from "react";

interface PostAuthLayoutProps {
  navbar: React.ReactNode;
  sidebar?: React.ReactNode;
  children: React.ReactNode;
  /**
   * If true, will add top margin to offset fixed navbar (mt-20)
   */
  offsetNavbar?: boolean;
}

export default function PostAuthLayout({
  navbar,
  sidebar,
  children,
  offsetNavbar = true,
}: PostAuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white">
        {navbar}
      </header>
      <section
        className={`w-full px-4 font-clash flex flex-col lg:flex-row ${
          offsetNavbar ? "mt-20" : ""
        }`}
      >
        {sidebar && (
          <aside className="hidden lg:block lg:fixed lg:top-20 lg:left-0 lg:w-[20%] w-full border-r lg:border-r-gray-400 lg:h-screen lg:overflow-auto">
            {sidebar}
          </aside>
        )}
        <main
          className={`flex-1 min-h-[60vh] px-0 py-6 ${
            sidebar ? "lg:ml-[20%]" : ""
          }`}
        >
          <div className="mt-5 max-md:mt-1">{children}</div>
        </main>
      </section>
    </div>
  );
}
