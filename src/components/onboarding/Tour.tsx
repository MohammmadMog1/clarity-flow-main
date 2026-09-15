import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";

export interface TourStep {
  /** CSS selector for the element to spotlight. Omit for a centered, non-targeted step. */
  target?: string;
  title: string;
  content: string;
  placement?: "top" | "bottom" | "left" | "right";
}

interface TourContextValue {
  registerSteps: (id: string, steps: TourStep[]) => void;
  startTour: () => void;
  hasTour: boolean;
}

const TourContext = createContext<TourContextValue | null>(null);

const seenKey = (id: string) => `clarity:tour-seen:${id}`;

export function TourProvider({ children }: { children: React.ReactNode }) {
  const [tourId, setTourId] = useState<string | null>(null);
  const [steps, setSteps] = useState<TourStep[]>([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [active, setActive] = useState(false);

  const registerSteps = useCallback((id: string, nextSteps: TourStep[]) => {
    setTourId(id);
    setSteps(nextSteps);
    setStepIndex(0);
    let seen = true;
    try {
      seen = localStorage.getItem(seenKey(id)) === "1";
    } catch {
      seen = true;
    }
    setActive(nextSteps.length > 0 && !seen);
  }, []);

  const finish = useCallback(() => {
    setActive(false);
    if (tourId) {
      try {
        localStorage.setItem(seenKey(tourId), "1");
      } catch {
        /* ignore */
      }
    }
  }, [tourId]);

  const startTour = useCallback(() => {
    setStepIndex(0);
    setActive(true);
  }, []);

  const next = useCallback(() => {
    setStepIndex((i) => {
      if (i + 1 >= steps.length) {
        finish();
        return i;
      }
      return i + 1;
    });
  }, [steps.length, finish]);

  const prev = useCallback(() => setStepIndex((i) => Math.max(0, i - 1)), []);

  const value = useMemo<TourContextValue>(
    () => ({ registerSteps, startTour, hasTour: steps.length > 0 }),
    [registerSteps, startTour, steps.length],
  );

  return (
    <TourContext.Provider value={value}>
      {children}
      {active && steps.length > 0 && (
        <TourOverlay
          step={steps[stepIndex]}
          stepIndex={stepIndex}
          totalSteps={steps.length}
          onNext={next}
          onPrev={prev}
          onSkip={finish}
        />
      )}
    </TourContext.Provider>
  );
}

export function useTourControls() {
  const ctx = useContext(TourContext);
  if (!ctx) throw new Error("useTourControls must be used within a TourProvider");
  return ctx;
}

/** Registers this page's tour. `steps` must be a stable (memoized) reference. */
export function usePageTour(id: string, steps: TourStep[]) {
  const { registerSteps } = useTourControls();
  useEffect(() => {
    registerSteps(id, steps);
  }, [id, steps, registerSteps]);
}

function computeTooltipStyle(rect: DOMRect | null, placement: TourStep["placement"]) {
  if (!rect) {
    return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" } as React.CSSProperties;
  }
  const margin = 14;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const approxWidth = Math.min(360, vw - 32);

  let top = rect.bottom + margin;
  let left = rect.left;
  let transform: string | undefined;

  switch (placement) {
    case "top":
      top = rect.top - margin;
      transform = "translateY(-100%)";
      break;
    case "left":
      top = rect.top;
      left = rect.left - margin;
      transform = "translateX(-100%)";
      break;
    case "right":
      top = rect.top;
      left = rect.right + margin;
      break;
    default:
      top = rect.bottom + margin;
      left = rect.left;
  }

  left = Math.min(Math.max(left, 16), vw - approxWidth - 16);
  top = Math.min(Math.max(top, 16), vh - 16);

  return { top, left, transform } as React.CSSProperties;
}

function TourOverlay({
  step,
  stepIndex,
  totalSteps,
  onNext,
  onPrev,
  onSkip,
}: {
  step: TourStep;
  stepIndex: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
}) {
  const { t } = useTranslation();
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(false);
    setRect(null);

    if (!step.target) {
      setReady(true);
      return;
    }

    const el = document.querySelector<HTMLElement>(step.target);
    const initial = el?.getBoundingClientRect();
    if (!el || !initial || (initial.width === 0 && initial.height === 0)) {
      onNext();
      return;
    }

    el.scrollIntoView({ behavior: "smooth", block: "center" });
    const update = () => setRect(el.getBoundingClientRect());
    update();

    const settleTimer = window.setTimeout(() => {
      update();
      setReady(true);
    }, 300);
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.clearTimeout(settleTimer);
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
    // step identity (title) is enough to detect a real step change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step.target, step.title]);

  if (!ready) return null;

  const pad = 8;
  const spotlightStyle: React.CSSProperties = rect
    ? {
        position: "fixed",
        top: rect.top - pad,
        left: rect.left - pad,
        width: rect.width + pad * 2,
        height: rect.height + pad * 2,
        borderRadius: 16,
        boxShadow: "0 0 0 9999px rgba(15, 23, 42, 0.55)",
        outline: "2px solid var(--primary)",
        outlineOffset: 2,
        pointerEvents: "none",
        zIndex: 100,
        transition: "top .25s ease, left .25s ease, width .25s ease, height .25s ease",
      }
    : {
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.55)",
        pointerEvents: "none",
        zIndex: 100,
      };

  const tooltipStyle = computeTooltipStyle(rect, step.placement);

  return createPortal(
    <>
      <div className="fixed inset-0 z-[100]" />
      <div style={spotlightStyle} />
      <AnimatePresence mode="wait">
        <motion.div
          key={`${step.target ?? "center"}-${stepIndex}`}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.15 }}
          className="fixed z-[101] w-[calc(100vw-2rem)] max-w-sm rounded-2xl border border-border bg-popover text-popover-foreground shadow-card p-4"
          style={tooltipStyle}
        >
          <button
            onClick={onSkip}
            className="absolute top-2.5 end-2.5 text-muted-foreground hover:text-foreground"
            aria-label={t("tour.skip")}
          >
            <X className="h-4 w-4" />
          </button>
          <div className="text-xs font-medium text-primary mb-1.5">
            {t("tour.stepOf", { current: stepIndex + 1, total: totalSteps })}
          </div>
          <h3 className="font-semibold text-sm pe-5">{step.title}</h3>
          <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{step.content}</p>
          <div className="flex items-center justify-between mt-4">
            <div className="flex gap-1">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    i === stepIndex ? "w-4 bg-primary" : "w-1.5 bg-border"
                  }`}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              {stepIndex > 0 && (
                <button
                  onClick={onPrev}
                  className="text-xs font-medium px-2.5 py-1.5 rounded-lg hover:bg-muted"
                >
                  {t("tour.back")}
                </button>
              )}
              <button
                onClick={onNext}
                className="text-xs font-medium px-3 py-1.5 rounded-lg gradient-primary text-primary-foreground"
              >
                {stepIndex + 1 === totalSteps ? t("tour.done") : t("tour.next")}
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </>,
    document.body,
  );
}
