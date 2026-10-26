import { AppShell } from "../../components/private/AppShell";
import { Photo } from "../../components/Photo";
import { config } from "../../config";
import { useData } from "../../hooks/useData";
import { usePageTitle } from "../../hooks/usePageTitle";
import { api } from "../../lib/api";
import { artistById } from "../../lib/catalog";
import { contractState } from "../../lib/contracts";

/** Contratos del artista con sesión (RLS en Supabase), del más reciente al más antiguo */
export function useContracts() {
  return useData(async () => (await api.listContracts()).sort((a, b) => b.start.localeCompare(a.start)));
}

export function PortalLayout() {
  usePageTitle("Portal de artistas");
  const artist = artistById(config.portal.artistId)!;
  const pending = useContracts().data?.filter((c) => contractState(c) === "pending").length ?? 0;
  return (
    <AppShell
      role="artist"
      loginPath="/portal/login"
      ariaLabel="Portal de artistas"
      sideTitle="Menú"
      user={
        <>
          <Photo src={artist.photo} alt={artist.name} />
          <div>
            <strong>{artist.name}</strong>
            <span>Portal de artistas</span>
          </div>
        </>
      }
      links={[
        { to: "/portal", icon: "home", label: "Dashboard" },
        { to: "/portal/contratos", icon: "file", label: "Mis contratos", count: pending, countLabel: `${pending} pendiente` },
        { to: "/portal/catalogo", icon: "disc", label: "Mi catálogo" },
        { to: "/portal/fechas", icon: "calendar", label: "Fechas de contrato" },
        { to: "/portal/relacion", icon: "heart", label: "Mi relación con el sello" },
      ]}
    />
  );
}
