import { Link } from "react-router";
import { config } from "../config";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import { toast } from "../lib/toast";
import { NewsletterForm } from "./NewsletterForm";
import { SocialButtons } from "./SocialButtons";

export function Footer() {
  const { session } = useAuth();

  const resetDemo = async () => {
    if (api.mode === "supabase" && !session) {
      toast("Los datos están en Supabase y son compartidos: inicia sesión (portal o admin) para restablecerlos.", "warn", 6000);
      return;
    }
    if (!confirm("Se borrarán suscriptores, mensajes, firmas y sesiones creados en esta demo. ¿Continuar?")) return;
    try {
      await api.resetDemo();
      if (api.mode === "local") sessionStorage.clear();
      location.assign("/");
    } catch (e) {
      toast((e as Error).message, "err");
    }
  };

  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="footer-grid">
          <div>
            <h2>
              La música que suena <span className="serif accent">después de medianoche.</span>
            </h2>
            <p className="muted">Lanzamientos, fechas y noticias del sello. Un email al mes, sin ruido.</p>
            <NewsletterForm />
          </div>
          <div>
            <h3>Explorar</h3>
            <ul className="footer-links">
              <li><Link to="/">Inicio</Link></li>
              <li><Link to="/sello">El sello</Link></li>
              <li><Link to="/artistas">Artistas y playlists</Link></li>
              <li><Link to="/contacto">Contacto y demos</Link></li>
            </ul>
          </div>
          <div>
            <h3>Accesos privados</h3>
            <ul className="footer-links">
              <li><Link to="/portal">Portal de artistas</Link></li>
              <li><Link to="/admin">Panel del sello</Link></li>
            </ul>
            <h3 className="mt-7">Síguenos</h3>
            <div className="socials">
              <SocialButtons socials={config.label.socials} />
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} {config.label.name} · Sello ficticio creado para una demo comercial.
          </span>
          <button type="button" className="link-btn" onClick={resetDemo}>
            Restablecer datos de la demo
          </button>
        </div>
      </div>
    </footer>
  );
}
