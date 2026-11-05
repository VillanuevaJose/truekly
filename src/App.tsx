import { useState, useEffect, useRef } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Landing from "./pages/Landing";
import Feed from "./pages/Feed";
import { PublicationDetail } from "./pages/PublicationDetail";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import { products, type Product } from "./data/mockProducts";
import { fetchPublications, removePublication } from "./services/publicationService";

/**
 * Vista Principal unificada (Landing / Feed / Detalle Producto / Perfil)
 * Compatible con la navegación actual y enrutada hacia /ingresar, /registro y /perfil
 */
function MainView() {
  const navigate = useNavigate();

  const [currentView, setCurrentView] = useState<"landing" | "feed" | "product" | "profile">(() => {
    if (window.location.hash === "#perfil") {
      return "profile";
    }
    if (window.location.hash.startsWith("#producto/")) {
      return "product";
    }
    return window.location.hash === "#feed" ? "feed" : "landing";
  });

  const previousViewRef = useRef<"landing" | "feed">("landing");
  const scrollPositionsRef = useRef<{ landing: number; feed: number }>({
    landing: 0,
    feed: 0,
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
        fetchPublications().then((customs) => {
          const customFound = customs.find((p) => p.id === id);
          if (customFound) {
            setSelectedProduct(customFound);
            setCurrentView("product");
          }
        });
        return;
      }
      if (hash === "#perfil") {
        setCurrentView("profile");
        return;
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
    const targetY = scrollPositionsRef.current.feed;
    requestAnimationFrame(() => {
      window.scrollTo({ top: targetY, behavior: "instant" });
    });
  };

  const navigateToLanding = () => {
    window.location.hash = "#inicio";
    setCurrentView("landing");
    const targetY = scrollPositionsRef.current.landing;
    requestAnimationFrame(() => {
      window.scrollTo({ top: targetY, behavior: "instant" });
    });
  };

  const handleBackToOrigin = () => {
    if (previousViewRef.current === "landing") {
      navigateToLanding();
    } else {
      navigateToFeed();
    }
  };

  const handleSelectProduct = (prod: Product) => {
    if (currentView === "landing" || currentView === "feed") {
      previousViewRef.current = currentView;
      scrollPositionsRef.current[currentView] = window.scrollY;
    }
    setSelectedProduct(prod);
    window.location.hash = `#producto/${prod.id}`;
    setCurrentView("product");
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  const handleOpenAuth = (mode: "login" | "register" = "login") => {
    if (mode === "register") {
      navigate("/registro");
    } else {
      navigate("/ingresar");
    }
  };

  const handleOpenProfileFromOrigin = (origin: "landing" | "feed") => {
    previousViewRef.current = origin;
    scrollPositionsRef.current[origin] = window.scrollY;
    window.location.hash = "#perfil";
    setCurrentView("profile");
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  if (currentView === "product" && selectedProduct) {
    return (
      <PublicationDetail
        product={selectedProduct}
        relatedProducts={products.filter(
          (p) => p.id !== selectedProduct.id && p.category === selectedProduct.category
        )}
        onBack={handleBackToOrigin}
        onSelectProduct={handleSelectProduct}
        onOpenAuth={handleOpenAuth}
        onDeleteProduct={async (id) => {
          await removePublication(id);
          setSelectedProduct(null);
          handleBackToOrigin();
        }}
      />
    );
  }

  if (currentView === "profile") {
    return (
      <ProfilePage
        onBack={handleBackToOrigin}
        onNavigateToFeed={navigateToFeed}
      />
    );
  }

  if (currentView === "feed") {
    return (
      <Feed
        onNavigateToLanding={() => {
          scrollPositionsRef.current.feed = window.scrollY;
          navigateToLanding();
        }}
        onOpenAuth={(mode) => handleOpenAuth(mode || "login")}
        onSelectProduct={handleSelectProduct}
        onOpenProfile={() => handleOpenProfileFromOrigin("feed")}
      />
    );
  }

  return (
    <Landing
      onNavigateToFeed={() => {
        scrollPositionsRef.current.landing = window.scrollY;
        navigateToFeed();
      }}
      onOpenAuth={() => handleOpenAuth("login")}
      onOpenProfile={() => handleOpenProfileFromOrigin("landing")}
    />
  );
}

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainView />} />
          <Route path="/perfil" element={<ProfilePage />} />
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
