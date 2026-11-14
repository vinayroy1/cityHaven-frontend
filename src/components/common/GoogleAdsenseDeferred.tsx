"use client";

import React from "react";

export function GoogleAdsenseDeferred() {
  React.useEffect(() => {
    let loaded = false;
    const loadScript = () => {
      if (loaded) return;
      loaded = true;
      cleanup();

      const script = document.createElement("script");
      script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7884603260618662";
      script.async = true;
      script.crossOrigin = "anonymous";
      document.body.appendChild(script);
    };

    const cleanup = () => {
      window.removeEventListener("scroll", loadScript);
      window.removeEventListener("click", loadScript);
      window.removeEventListener("touchstart", loadScript);
      window.removeEventListener("keydown", loadScript);
    };

    // Load only on real intentional user interaction (scroll, touch, or click)
    // Avoid mousemove because automated bots, synthetic mouse events, or slight cursor drift trigger it instantly
    window.addEventListener("scroll", loadScript, { once: true, passive: true });
    window.addEventListener("click", loadScript, { once: true, passive: true });
    window.addEventListener("touchstart", loadScript, { once: true, passive: true });
    window.addEventListener("keydown", loadScript, { once: true, passive: true });

    const timer = setTimeout(loadScript, 15000);

    return () => {
      clearTimeout(timer);
      cleanup();
    };
  }, []);

  return null;
}
