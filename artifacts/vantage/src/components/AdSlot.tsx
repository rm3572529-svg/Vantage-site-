import { useEffect } from "react";

declare global {
  interface Window { adsbygoogle: unknown[] }
}

export function AdSlot({ slot, format = "auto" }: { slot: string; format?: string }) {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {}
  }, []);

  const publisherId = import.meta.env.VITE_ADSENSE_PUBLISHER_ID;

  if (!publisherId || publisherId === "ca-pub-PLACEHOLDER") return null;

  return (
    <ins className="adsbygoogle" style={{ display: "block" }}
      data-ad-client={publisherId} data-ad-slot={slot}
      data-ad-format={format} data-full-width-responsive="true" />
  );
}