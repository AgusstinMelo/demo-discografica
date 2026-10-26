import { useEffect, useRef } from "react";
import { BrowserRouter, Outlet, Route, Routes, useLocation } from "react-router";
import { CoverDefs } from "./components/CoverArt";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { MiniPlayer } from "./components/player/MiniPlayer";
import { Login } from "./components/private/Login";
import { Toasts } from "./components/Toasts";
import { AuthProvider } from "./context/AuthContext";
import { usePlayer } from "./lib/player";
import { AdminLayout } from "./pages/admin/AdminLayout";
import { Automations } from "./pages/admin/Automations";
import { Campaign } from "./pages/admin/Campaign";
import { History } from "./pages/admin/History";
import { Messages } from "./pages/admin/Messages";
import { Subscribers } from "./pages/admin/Subscribers";
import { NotFound } from "./pages/NotFound";
import { Catalog } from "./pages/portal/Catalog";
import { ContractDetail } from "./pages/portal/ContractDetail";
import { Contracts } from "./pages/portal/Contracts";
import { Dashboard } from "./pages/portal/Dashboard";
import { Dates } from "./pages/portal/Dates";
import { PortalLayout } from "./pages/portal/PortalLayout";
import { Relation } from "./pages/portal/Relation";
import { ArtistDetail } from "./pages/public/ArtistDetail";
import { Artists } from "./pages/public/Artists";
import { Contact } from "./pages/public/Contact";
import { Home } from "./pages/public/Home";
import { Label } from "./pages/public/Label";

/** Cabecera, contenido (con animación de entrada en cada página) y, en la web pública, pie */
function Layout({ footer }: { footer: boolean }) {
  const { pathname } = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  const hasTrack = usePlayer((s) => !!s.track);

  // Al cambiar de página: arriba del todo y foco en el contenido (lectores de pantalla)
  useEffect(() => {
    window.scrollTo(0, 0);
    mainRef.current?.focus({ preventScroll: true });
  }, [pathname]);

  return (
    <>
      <button type="button" className="skip" onClick={() => mainRef.current?.focus()}>
        Saltar al contenido
      </button>
      <Header />
      <main ref={mainRef} key={footer ? pathname : pathname.split("/")[1]} className="page" tabIndex={-1}>
        <Outlet />
      </main>
      {footer && <Footer />}
      <MiniPlayer />
      <div className={`demo-badge ${hasTrack ? "lifted" : ""}`} role="note">
        DEMO · datos ficticios
      </div>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <CoverDefs />
        <Routes>
          <Route element={<Layout footer />}>
            <Route index element={<Home />} />
            <Route path="sello" element={<Label />} />
            <Route path="artistas" element={<Artists />} />
            <Route path="artistas/:id" element={<ArtistDetail />} />
            <Route path="contacto" element={<Contact />} />
            <Route path="*" element={<NotFound />} />
          </Route>
          <Route element={<Layout footer={false} />}>
            <Route path="portal/login" element={<Login role="artist" />} />
            <Route path="portal" element={<PortalLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="contratos" element={<Contracts />} />
              <Route path="contratos/:id" element={<ContractDetail />} />
              <Route path="catalogo" element={<Catalog />} />
              <Route path="fechas" element={<Dates />} />
              <Route path="relacion" element={<Relation />} />
              <Route path="*" element={<NotFound />} />
            </Route>
            <Route path="admin/login" element={<Login role="admin" />} />
            <Route path="admin" element={<AdminLayout />}>
              <Route index element={<Subscribers />} />
              <Route path="campana" element={<Campaign />} />
              <Route path="automatizaciones" element={<Automations />} />
              <Route path="historial" element={<History />} />
              <Route path="mensajes" element={<Messages />} />
              <Route path="mensajes/:id" element={<Messages />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Route>
        </Routes>
        <Toasts />
      </BrowserRouter>
    </AuthProvider>
  );
}
