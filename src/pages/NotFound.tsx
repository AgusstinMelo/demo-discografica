import { Link } from "react-router";
import { usePageTitle } from "../hooks/usePageTitle";

export function NotFound() {
  usePageTitle("No encontrado");
  return (
    <section className="section">
      <div className="wrap text-center">
        <p className="eyebrow justify-center">Error 404</p>
        <h1 className="display text-[clamp(3rem,10vw,7rem)]">Silencio.</h1>
        <p className="lead mx-auto mb-7">Esta página no existe o se ha quedado sin batería.</p>
        <Link className="btn btn-accent" to="/">
          Volver al inicio
        </Link>
      </div>
    </section>
  );
}
