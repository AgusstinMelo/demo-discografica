import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router";
import { config } from "../config";
import { Icon } from "./Icon";

export function Header() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  // Cierra el menú móvil al navegar y con Escape
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const privateLinks = (
    <>
      <NavLink to="/portal" className="btn btn-ghost btn-sm">
        Portal artistas
      </NavLink>
      <NavLink to="/admin" className="btn btn-soft btn-sm">
        Admin
      </NavLink>
    </>
  );

  return (
    <header className="site-header">
      <div className="wrap">
        <Link to="/" className="logo" aria-label={`${config.label.name}, ir al inicio`}>
          <span className="logo-mark" aria-hidden="true" />
          <span>
            {config.label.shortName} <small>Records</small>
          </span>
        </Link>
        <nav className={`main-nav ${open ? "open" : ""}`} id="mainNav" aria-label="Navegación principal">
          {config.nav.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.to === "/"}>
              {n.label}
            </NavLink>
          ))}
          <div className="nav-cta-mobile">{privateLinks}</div>
        </nav>
        <div className="nav-cta">{privateLinks}</div>
        <button
          type="button"
          className="menu-btn"
          aria-expanded={open}
          aria-controls="mainNav"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          onClick={() => setOpen((o) => !o)}
        >
          <Icon name={open ? "x" : "menu"} size={22} />
        </button>
      </div>
    </header>
  );
}
