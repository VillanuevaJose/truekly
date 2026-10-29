import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Landing from "./pages/Landing";
import Feed from "./pages/Feed";
import { PublicationDetail } from "./pages/PublicationDetail";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import { products, type Product } from "./data/mockProducts";

/**
 * Vista Principal unificada (Landing / Feed / Detalle Producto)
 * Compatible con la navegación actual y enrutada hacia /ingresar y /registro
 */
function MainView() {
  const navigate = useNavigate();

  const [currentView, setCurrentView] = useState<"landing" | "feed" | "product">(() => {
    if (window.location.hash.startsWith("#producto/")) {
      return "product";
    }
    return window.location.hash === "#feed" ? "feed" : "landing";
  });

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(() => {
    if (window.location.hash.startsWith("#producto/")) {
      const id = window.location.hash.replace("#producto/", "");
      return products.find((p) => p.id === id) || products[0];
    }
    return null;
  });

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith("#producto/")) {
        const id = hash.replace("#producto/", "");
        const found = products.find((p) => p.id === id);
        if (found) {
          setSelectedProduct(found);
          setCurrentView("product");
          return;
        }
      }
      if (hash === "#feed") {
        setCurrentView("feed");
      } else {
        setCurrentView("landing");
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const navigateToFeed = () => {
    window.location.hash = "#feed";
    setCurrentView("feed");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const navigateToLanding = () => {
    window.location.hash = "#inicio";
    setCurrentView("landing");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelectProduct = (prod: Product) => {
    setSelectedProduct(prod);
    window.location.hash = `#producto/${prod.id}`;
    setCurrentView("product");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Redirecciones hacia las nuevas páginas de autenticación
  const handleOpenAuth = (mode: "login" | "register" = "login") => {
    if (mode === "register") {
      navigate("/registro");
    } else {
      navigate("/ingresar");
    }
  };

  if (currentView === "product" && selectedProduct) {
    return (
      <PublicationDetail
        product={selectedProduct}
        relatedProducts={products.filter(
          (p) => p.id !== selectedProduct.id && p.category === selectedProduct.category
        )}
        onBack={navigateToFeed}
        onSelectProduct={handleSelectProduct}
        onOpenAuth={handleOpenAuth}
      />
    );
  }

  if (currentView === "feed") {
    return (
      <Feed
        onNavigateToLanding={navigateToLanding}
        onOpenAuth={(mode) => handleOpenAuth(mode || "login")}
        onSelectProduct={handleSelectProduct}
      />
    );
  }

  return (
    <Landing
      onNavigateToFeed={navigateToFeed}
      onOpenAuth={() => handleOpenAuth("login")}
    />
  );
}

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainView />} />
          <Route path="/ingresar" element={<LoginPage />} />
          <Route path="/registro" element={<RegisterPage />} />
          {/* Rutas de compatibilidad directa */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="*" element={<MainView />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
