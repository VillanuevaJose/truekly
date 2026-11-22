import { useState, useEffect, useRef, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { products, type Product } from "./data/mockProducts";
import { fetchPublications, removePublication } from "./services/publicationService";

const Landing = lazy(() => import("./pages/Landing"));
const Feed = lazy(() => import("./pages/Feed"));
const PublicationDetail = lazy(() =>
  import("./pages/PublicationDetail").then((m) => ({ default: m.PublicationDetail }))
);
const LoginPage = lazy(() => import("./pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("./pages/auth/RegisterPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const MessagesPage = lazy(() => import("./pages/MessagesPage"));

function PageLoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-paper text-ink">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-jade-600 border-t-transparent" />
    </div>
  );
}

/**
 * Vista Principal unificada (Landing / Feed / Detalle Producto / Perfil)
 * Compatible con la navegación actual y enrutada hacia /ingresar, /registro y /perfil
 */
function MainView() {
  const navigate = useNavigate();

  const [currentView, setCurrentView] = useState<
    "landing" | "feed" | "product" | "profile" | "messages"
  >(() => {
    if (window.location.hash === "#perfil") {
      return "profile";
    }
    if (window.location.hash.startsWith("#mensajes")) {
      return "messages";
    }
    if (window.location.hash.startsWith("#producto/")) {
      return "product";
    }
    return window.location.hash === "#feed" ? "feed" : "landing";
  });

  const [messagesPubId, setMessagesPubId] = useState<string | null>(() => {
    if (window.location.hash.startsWith("#mensajes/")) {
      return window.location.hash.replace("#mensajes/", "");
    }
    return null;
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
      if (hash.startsWith("#mensajes")) {
        const pId = hash.startsWith("#mensajes/")
          ? hash.replace("#mensajes/", "")
          : null;
        setMessagesPubId(pId);
        setCurrentView("messages");
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
        onOpenChat={(pubId) => {
          setMessagesPubId(pubId);
          window.location.hash = `#mensajes/${pubId}`;
          setCurrentView("messages");
        }}
        onDeleteProduct={async (id) => {
          await removePublication(id);
          setSelectedProduct(null);
          handleBackToOrigin();
        }}
      />
    );
  }

  if (currentView === "messages") {
    return (
      <MessagesPage
        onBack={handleBackToOrigin}
        initialPublicationId={messagesPubId}
        onSelectProduct={handleSelectProduct}
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
        onOpenMessages={() => {
          setMessagesPubId(null);
          window.location.hash = "#mensajes";
          setCurrentView("messages");
        }}
      />
    );
  }

  return (
    <Landing
      onNavigateToFeed={() => {
        scrollPositionsRef.current.landing = window.scrollY;
        navigateToFeed();
      }}
      onSelectProduct={(prod) => handleSelectProduct(prod)}
      onOpenAuth={() => handleOpenAuth("login")}
      onOpenProfile={() => handleOpenProfileFromOrigin("landing")}
    />
  );
}

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={<PageLoadingFallback />}>
            <Routes>
              <Route path="/" element={<MainView />} />
              <Route path="/perfil" element={<ProfilePage />} />
              <Route path="/mensajes" element={<MessagesPage onBack={() => { window.location.hash = "#feed"; }} />} />
              <Route path="/ingresar" element={<LoginPage />} />
              <Route path="/registro" element={<RegisterPage />} />
              {/* Rutas de compatibilidad directa */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="*" element={<MainView />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
