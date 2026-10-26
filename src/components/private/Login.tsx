import { useRef, useState, type FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router";
import { config } from "../../config";
import { useAuth } from "../../context/AuthContext";
import { usePageTitle } from "../../hooks/usePageTitle";
import { api, type Role } from "../../lib/api";
import { artistById } from "../../lib/catalog";
import { toast } from "../../lib/toast";
import { Icon } from "../Icon";

const SCOPES: Record<Role, { title: string; subtitle: string; base: string; email: string }> = {
  artist: { title: "Portal de artistas", subtitle: "Accede a tus contratos, catálogo, cifras y pagos.", base: "/portal", email: config.demoCredentials.artist },
  admin: { title: "Panel del sello", subtitle: "Gestión de la lista de correos, campañas y mensajes.", base: "/admin", email: config.demoCredentials.admin },
};

export function Login({ role }: { role: Role }) {
  const scope = SCOPES[role];
  usePageTitle(scope.title);
  const { session, signIn } = useAuth();
  const navigate = useNavigate();
  const from = (useLocation().state as { from?: string } | null)?.from;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const passRef = useRef<HTMLInputElement>(null);

  if (session?.role === role) return <Navigate to={scope.base} replace />;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const s = await signIn(email, password);
      if (s.role !== role) throw new Error(`Ese usuario no tiene acceso al ${scope.title.toLowerCase()}. Usa las credenciales de demo.`);
      toast(role === "admin" ? "Sesión iniciada en el panel del sello." : `Hola de nuevo, ${artistById(s.artistId ?? "")?.name.split(" ")[0] ?? ""}.`);
      navigate(from?.startsWith(scope.base) ? from : scope.base, { replace: true });
    } catch (err) {
      setError((err as Error).message);
      setPassword("");
      passRef.current?.focus();
    } finally {
      setBusy(false);
    }
  };

  const other = session && session.role !== role;

  return (
    <section className="login-wrap">
      <div className="hero-glow" aria-hidden="true" />
      <div className="card login-card">
        <span className="logo-mark mb-[18px]" aria-hidden="true" />
        <h1>{scope.title}</h1>
        <p className="muted">{scope.subtitle}</p>
        {other && (
          <div className="alert info" role="note">
            <Icon name="info" size={20} />
            <p className="small">Tienes abierta la sesión de {session.email}. Al entrar aquí se cerrará.</p>
          </div>
        )}
        <div className="demo-creds" role="note">
          <strong>Credenciales de demo</strong>
          Email: <code>{scope.email}</code>
          <br />
          Contraseña: <code>{config.demoCredentials.password}</code>
          <br />
          <button
            type="button"
            className="btn btn-soft btn-sm"
            onClick={() => {
              setEmail(scope.email);
              setPassword(config.demoCredentials.password);
              passRef.current?.focus();
            }}
          >
            Autocompletar
          </button>
        </div>
        <form onSubmit={onSubmit} noValidate>
          <div className="field">
            <label htmlFor="lg-email">Email</label>
            <input id="lg-email" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="lg-pass">Contraseña</label>
            <input id="lg-pass" ref={passRef} type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button className="btn btn-accent w-full" type="submit" disabled={busy}>
            {busy ? "Entrando…" : "Entrar"} <Icon name="arrow" />
          </button>
          <p className="form-msg err" role="alert">
            {error}
          </p>
          {api.mode === "local" && <p className="xs muted m-0">Modo local: los datos se guardan solo en este navegador.</p>}
        </form>
      </div>
    </section>
  );
}
