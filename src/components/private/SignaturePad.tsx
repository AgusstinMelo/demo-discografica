import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { Icon } from "../Icon";

export interface SignaturePadHandle {
  hasInk: () => boolean;
  toDataURL: () => string;
}

interface Props {
  invalid: boolean;
  onInk: () => void;
}

/** Pad de firma sobre canvas (ratón, dedo o lápiz) con trazo suavizado */
export const SignaturePad = forwardRef<SignaturePadHandle, Props>(function SignaturePad({ invalid, onInk }, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inkRef = useRef(false);
  const onInkRef = useRef(onInk);
  onInkRef.current = onInk;

  useImperativeHandle(ref, () => ({
    hasInk: () => inkRef.current,
    toDataURL: () => canvasRef.current?.toDataURL("image/png") ?? "",
  }));

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const rect = cv.getBoundingClientRect();
    cv.width = Math.round(rect.width * dpr);
    cv.height = Math.round(rect.height * dpr);
    const ctx = cv.getContext("2d")!;
    ctx.scale(dpr, dpr);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = ctx.fillStyle = "#14110e";
    ctx.lineWidth = 2.4;

    let drawing = false;
    let pts: { x: number; y: number }[] = [];
    const at = (e: PointerEvent) => {
      const r = cv.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const down = (e: PointerEvent) => {
      e.preventDefault();
      cv.setPointerCapture(e.pointerId);
      drawing = true;
      pts = [at(e)];
      ctx.beginPath();
      ctx.arc(pts[0].x, pts[0].y, 1.1, 0, Math.PI * 2);
      ctx.fill();
    };
    const move = (e: PointerEvent) => {
      if (!drawing) return;
      const q = at(e);
      pts.push(q);
      if (pts.length >= 3) {
        const a = pts[pts.length - 3], b = pts[pts.length - 2];
        ctx.lineWidth = e.pressure && e.pointerType === "pen" ? 1.2 + e.pressure * 2.6 : 2.4;
        ctx.beginPath();
        ctx.moveTo((a.x + b.x) / 2, (a.y + b.y) / 2);
        ctx.quadraticCurveTo(b.x, b.y, (b.x + q.x) / 2, (b.y + q.y) / 2);
        ctx.stroke();
      }
      if (!inkRef.current && pts.length > 4) {
        inkRef.current = true;
        onInkRef.current();
      }
    };
    const end = () => (drawing = false);
    cv.addEventListener("pointerdown", down);
    cv.addEventListener("pointermove", move);
    cv.addEventListener("pointerup", end);
    cv.addEventListener("pointercancel", end);
    cv.addEventListener("pointerleave", end);
    return () => {
      cv.removeEventListener("pointerdown", down);
      cv.removeEventListener("pointermove", move);
      cv.removeEventListener("pointerup", end);
      cv.removeEventListener("pointercancel", end);
      cv.removeEventListener("pointerleave", end);
    };
  }, []);

  const clear = () => {
    const cv = canvasRef.current;
    if (!cv) return;
    cv.getContext("2d")!.clearRect(0, 0, cv.width, cv.height);
    inkRef.current = false;
  };

  return (
    <div className="field">
      <span className="label" id="padLabel">
        Firma manuscrita
      </span>
      <div className={`pad-wrap ${invalid ? "invalid" : ""}`}>
        <canvas ref={canvasRef} role="img" aria-labelledby="padLabel" aria-describedby="padHelp" />
        <span className="pad-line">
          <span>Firme aquí</span>
        </span>
      </div>
      <div className="pad-actions">
        <span id="padHelp">Dibuja con el ratón, el dedo o un lápiz.</span>
        <button type="button" className="btn btn-ghost btn-sm" onClick={clear}>
          <Icon name="trash" size={15} /> Borrar
        </button>
      </div>
    </div>
  );
});
