import { useState } from "react";
import { initials } from "../lib/format";

interface Props {
  src: string;
  alt: string;
  className?: string;
}

/** Foto en duotono sobre gradiente; si no carga, quedan las iniciales. */
export function Photo({ src, alt, className = "" }: Props) {
  const [failed, setFailed] = useState(false);
  return (
    <div className={`photo ${className}`} data-initials={initials(alt)}>
      {!failed && <img src={src} alt={alt} loading="lazy" decoding="async" onError={() => setFailed(true)} />}
    </div>
  );
}
