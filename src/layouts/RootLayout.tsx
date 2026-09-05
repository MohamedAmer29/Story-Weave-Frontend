import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import { useLanguage } from "../i18n";
import { useTheme } from "../theme";

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const target = document.getElementById(hash.slice(1));
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
        return;
      }
    }
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname, hash]);
  return null;
}

export function RootLayout() {
  const { dir } = useLanguage();
  const { theme } = useTheme();

  return (
    <div className="flex min-h-screen flex-col bg-canvas text-fg">
      <ScrollToTop />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <ToastContainer
        position={dir === "rtl" ? "bottom-left" : "bottom-right"}
        theme={theme}
        rtl={dir === "rtl"}
        autoClose={4000}
        newestOnTop
      />
    </div>
  );
}