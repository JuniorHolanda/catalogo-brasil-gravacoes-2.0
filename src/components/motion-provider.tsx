"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";

/** Define animações discretas e respeita a preferência de movimento do dispositivo. */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <MotionConfig
      reducedMotion="user"
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {children}
    </MotionConfig>
  );
}
