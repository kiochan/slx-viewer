"use client";

import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";

type PortalTooltipProps = {
  show: boolean;
  x: number;
  y: number;
  content: React.ReactNode;
};

export default function PortalTooltip({
  show,
  x,
  y,
  content,
}: PortalTooltipProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 如果组件还没在浏览器端挂载，或 `show` 为 false，则不渲染
  if (!mounted || !show) return null;

  return ReactDOM.createPortal(
    <div
      style={{
        position: "absolute",
        top: y,
        left: x,
        zIndex: 9999,
        backgroundColor: "white",
        border: "1px solid #999",
        borderRadius: 4,
        padding: "8px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
        pointerEvents: "auto",
        maxWidth: 280,
      }}
    >
      {content}
    </div>,
    document.body
  );
}
