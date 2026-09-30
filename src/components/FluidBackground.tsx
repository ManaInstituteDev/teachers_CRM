"use client";

import { useEffect, useRef } from "react";

interface FluidBackgroundProps {
  className?: string;
  theme?: "light" | "dark";
  /**
   * آیا با حرکت موس در هر نقطه از صفحه (حتی روی کارت لاگین) سیال واکنش نشان دهد؟
   * پیش‌فرض: true
   */
  globalMouseEvents?: boolean;
}

export default function FluidBackground({
  className = "",
  theme = "light",
  globalMouseEvents = true,
}: FluidBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let isMounted = true;
    let removeGlobalListeners: (() => void) | null = null;

    async function initFluid() {
      if (!canvasRef.current) return;

      try {
        const module = await import("webgl-fluid");
        const WebGLFluid = module.default;

        if (!isMounted || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const isLight = theme === "light";

        // تنظیمات سیال دقیقاً هماهنگ با افکت لوکس و روان
        WebGLFluid(canvas, {
          IMMEDIATE: true,
          TRIGGER: "hover",
          AUTO: false,
          SIM_RESOLUTION: 128,
          DYE_RESOLUTION: 1024,
          CAPTURE_RESOLUTION: 512,
          // dissipation ملایم برای ماندگاری طبیعی دودهای رنگی
          DENSITY_DISSIPATION: 0.98,
          VELOCITY_DISSIPATION: 0.2,
          PRESSURE: 0.8,
          PRESSURE_ITERATIONS: 20,
          CURL: 28,
          SPLAT_RADIUS: 0.35,
          SPLAT_FORCE: 6000,
          SPLAT_COUNT: 5,
          SHADING: true,
          COLORFUL: true,
          COLOR_UPDATE_SPEED: 10,
          PAUSED: false,
          // رنگ پس‌زمینه: در حالت روشن، رنگ یخی ملایم دقیقاً مانند تصویر دانشگاه اصفهان
          BACK_COLOR: isLight
            ? { r: 236, g: 242, b: 248 }
            : { r: 15, g: 23, b: 42 },
          TRANSPARENT: false,
          BLOOM: false,
          BLOOM_ITERATIONS: 8,
          BLOOM_RESOLUTION: 256,
          BLOOM_INTENSITY: isLight ? 0.45 : 0.85,
          BLOOM_THRESHOLD: isLight ? 0.75 : 0.6,
          BLOOM_SOFT_KNEE: 0.7,
          SUNRAYS: true,
          SUNRAYS_RESOLUTION: 196,
          SUNRAYS_WEIGHT: 1.0,
        });

        // برای اینکه وقتی موس روی فرم لاگین حرکت می‌کند هم افکت دود در پس‌زمینه تحریک شود:
        if (globalMouseEvents) {
          const handlePointerMove = (e: MouseEvent | TouchEvent) => {
            if (!canvas) return;

            let clientX = 0;
            let clientY = 0;

            if ("touches" in e && e.touches.length > 0) {
              clientX = e.touches[0].clientX;
              clientY = e.touches[0].clientY;
            } else if ("clientX" in e) {
              clientX = e.clientX;
              clientY = e.clientY;
            }

            const rect = canvas.getBoundingClientRect();
            const offsetX = clientX - rect.left;
            const offsetY = clientY - rect.top;

            // اگر موس روی بوم نباشد، رویداد حرکت را به canvas ارسال می‌کنیم
            const evt = new MouseEvent("mousemove", {
              clientX,
              clientY,
              bubbles: false,
              cancelable: true,
            });

            // مقداردهی offsetX و offsetY برای موتور شبیه‌سازی
            Object.defineProperty(evt, "offsetX", { get: () => offsetX });
            Object.defineProperty(evt, "offsetY", { get: () => offsetY });

            canvas.dispatchEvent(evt);
          };

          window.addEventListener("mousemove", handlePointerMove, { passive: true });
          window.addEventListener("touchmove", handlePointerMove, { passive: true });

          removeGlobalListeners = () => {
            window.removeEventListener("mousemove", handlePointerMove);
            window.removeEventListener("touchmove", handlePointerMove);
          };
        }
      } catch (err) {
        console.error("خطا در بارگذاری WebGL Fluid:", err);
      }
    }

    initFluid();

    return () => {
      isMounted = false;
      if (removeGlobalListeners) {
        removeGlobalListeners();
      }
    };
  }, [theme, globalMouseEvents]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 w-full h-full pointer-events-auto transition-opacity duration-700 ${className}`}
      style={{ zIndex: 0 }}
    />
  );
}
