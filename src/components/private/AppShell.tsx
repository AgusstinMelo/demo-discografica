import type { ReactNode } from "react";
import { Navigate, NavLink, Outlet, useLocation, useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";
import type { Role } from "../../lib/api";
import { toast } from "../../lib/toast";
import { Icon, type IconName } from "../Icon";

export interface SideLink {
  to: string;
  icon: IconName;
  label: string;
  count?: number;
  countLabel?: string;
}

interface Props {
  role: Role;
  loginPath: string;
  ariaLabel: string;
  user: ReactNode;
  sideTitle: string;
  links: SideLink[];
}

/** Layout de las zonas privadas: barra lateral + contenido. Sin sesión del rol → login. */
export function AppShell({ role, loginPath, ariaLabel, user, sideTitle, links }: Props) {
  const { session, ready, signOut } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  if (!ready) return <div className="login-wrap" aria-busy="true" />;
  if (session?.role !== role) return <Navigate to={loginPath} replace state={{ from: pathname }} />;

  const logout = async () => {
    await signOut();
    toast("Sesión cerrada.", "info");
    navigate(loginPath);
  };

  return (
    <div className="app-shell">
      <nav className="app-side" aria-label={ariaLabel}>
        <div className="side-user">{user}</div>
        <p className="side-title">{sideTitle}</p>
        {links.map((l) => (
          <NavLink key={l.to} to={l.to} end={!l.to.includes("/", 1)} className="side-link">
            <Icon name={l.icon} /> {l.label}
            {!!l.count && (
              <span className="count" aria-label={l.countLabel}>
                {l.count}
              </span>
            )}
          </NavLink>
        ))}
        <div className="side-spacer" />
        <button type="button" className="side-link w-full border-0 bg-transparent text-left" onClick={logout}>
          <Icon name="logout" /> Cerrar sesión
        </button>
      </nav>
      <div className="app-main">
        <Outlet />
      </div>
    </div>
  );
}
