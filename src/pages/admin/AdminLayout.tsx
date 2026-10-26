import { AppShell } from "../../components/private/AppShell";
import { config } from "../../config";
import { useData } from "../../hooks/useData";
import { usePageTitle } from "../../hooks/usePageTitle";
import { api } from "../../lib/api";

export const useMessages = () => useData(() => api.listMessages());
export const useSubscribers = () => useData(() => api.listSubscribers());
export const useCampaigns = () => useData(() => api.listCampaigns());

export function AdminLayout() {
  usePageTitle("Panel del sello");
  const unread = useMessages().data?.filter((m) => !m.read).length ?? 0;
  return (
    <AppShell
      role="admin"
      loginPath="/admin/login"
      ariaLabel="Panel de administración"
      sideTitle="Lista de correos"
      user={
        <>
          <span className="logo-mark" aria-hidden="true" />
          <div>
            <strong>Panel del sello</strong>
            <span>{config.demoCredentials.admin}</span>
          </div>
        </>
      }
      links={[
        { to: "/admin", icon: "users", label: "Suscriptores" },
        { to: "/admin/campana", icon: "send", label: "Nueva campaña" },
        { to: "/admin/automatizaciones", icon: "zap", label: "Automatizaciones" },
        { to: "/admin/historial", icon: "chart", label: "Historial" },
        { to: "/admin/mensajes", icon: "inbox", label: "Mensajes", count: unread, countLabel: `${unread} sin leer` },
      ]}
    />
  );
}
