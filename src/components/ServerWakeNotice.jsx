import { useEffect, useState } from "react";

// Banner shown when the server is slow to answer (usually a sleeping free-tier server waking up).
export default function ServerWakeNotice() {
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    const onSlow = (e) => setSlow(Boolean(e.detail));
    window.addEventListener("api:slow", onSlow);
    return () => window.removeEventListener("api:slow", onSlow);
  }, []);

  if (!slow) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 9999,
        padding: "calc(10px + env(safe-area-inset-top, 0px)) 16px 10px",
        background: "#fff7e6", color: "#7a4b00", borderBottom: "1px solid #ffd591",
        fontSize: 13, textAlign: "center",
      }}
    >
      Waking up the server… the first request can take up to a minute. Please wait.
    </div>
  );
}
