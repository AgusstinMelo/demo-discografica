import { useToasts } from "../lib/toast";
import { Icon, type IconName } from "./Icon";

const ICON: Record<string, IconName> = { ok: "check", info: "zap", warn: "bell", err: "x" };

export function Toasts() {
  const toasts = useToasts();
  return (
    <div className="toasts" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.type} ${t.leaving ? "out" : ""}`}>
          <Icon name={ICON[t.type]} />
          <div>{t.message}</div>
        </div>
      ))}
    </div>
  );
}
