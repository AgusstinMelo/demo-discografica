import type { SocialNetwork, Socials } from "../config";
import { toast } from "../lib/toast";
import { Icon } from "./Icon";

/** Botones de redes. En la demo muestran un aviso; en la real serían enlaces a cada perfil. */
export function SocialButtons({ socials }: { socials: Socials }) {
  return (
    <>
      {(Object.entries(socials) as [SocialNetwork, string][]).map(([net, handle]) => (
        <button
          key={net}
          type="button"
          className="icon-btn"
          aria-label={`${net} (${handle})`}
          title={handle}
          onClick={() =>
            toast(
              <>
                Enlace simulado a {net}: <strong>{handle}</strong>
              </>,
              "info",
            )
          }
        >
          <Icon name={net} />
        </button>
      ))}
    </>
  );
}
