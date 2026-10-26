import type { ComponentPropsWithoutRef, ElementType } from "react";
import { useInView } from "../hooks/useInView";

type Props<T extends ElementType> = { as?: T } & ComponentPropsWithoutRef<T>;

/** Envuelve contenido para que aparezca suavemente al entrar en pantalla. */
export function Reveal<T extends ElementType = "div">({ as, className = "", ...rest }: Props<T>) {
  const [ref, inView] = useInView<HTMLElement>(0.12);
  const Tag: ElementType = as ?? "div";
  return <Tag ref={ref} className={`reveal ${inView ? "in" : ""} ${className}`} {...rest} />;
}
