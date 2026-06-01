"use client";

import { useEffect, useId, useRef } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        opts: {
          sitekey: string;
          callback?: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
          theme?: "auto" | "light" | "dark";
          size?: "normal" | "compact" | "flexible" | "invisible";
        }
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
  }
}

const SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?onload=__kaiveronTurnstileReady&render=explicit";

let scriptInjected = false;
let scriptReady = false;
const readyWaiters: Array<() => void> = [];

function ensureScript(): Promise<void> {
  if (scriptReady) return Promise.resolve();

  return new Promise((resolve) => {
    readyWaiters.push(resolve);
    if (scriptInjected) return;
    scriptInjected = true;

    (window as unknown as { __kaiveronTurnstileReady: () => void }).__kaiveronTurnstileReady = () => {
      scriptReady = true;
      readyWaiters.splice(0).forEach((fn) => fn());
    };

    const s = document.createElement("script");
    s.src = SCRIPT_SRC;
    s.async = true;
    s.defer = true;
    document.head.appendChild(s);
  });
}

interface Props {
  onToken: (token: string) => void;
  onExpire?: () => void;
  theme?: "auto" | "light" | "dark";
}

/**
 * Cloudflare Turnstile widget. Renders nothing (and the captcha is skipped
 * on the backend too) until NEXT_PUBLIC_TURNSTILE_SITE_KEY is set, so the
 * site keeps working before the Cloudflare account is provisioned.
 *
 * The token is one-shot: each successful render produces a token that
 * must be sent with the next request. After submit, call `reset()` (via
 * the ref) to get a fresh token for the next attempt.
 */
export function TurnstileWidget({ onToken, onExpire, theme = "auto" }: Props) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const id = useId();

  useEffect(() => {
    if (!siteKey || !containerRef.current) return;

    let cancelled = false;
    void ensureScript().then(() => {
      if (cancelled || !window.turnstile || !containerRef.current) return;

      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        theme,
        callback: (token) => onToken(token),
        "expired-callback": () => onExpire?.(),
        "error-callback": () => onExpire?.(),
      });
    });

    return () => {
      cancelled = true;
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch { /* swallow — widget may already be gone */ }
      }
      widgetIdRef.current = null;
    };
  }, [siteKey, theme, onToken, onExpire]);

  if (!siteKey) return null;

  return <div ref={containerRef} id={`turnstile-${id}`} className="my-2 flex justify-center" />;
}

/**
 * Imperative reset hook — pass the same ref-style API as the widget itself.
 * Use when the form-submit handler errored and the token needs to be re-issued.
 */
export function resetTurnstileById(containerId: string) {
  if (!window.turnstile) return;
  try {
    window.turnstile.reset(containerId);
  } catch { /* ignore */ }
}
