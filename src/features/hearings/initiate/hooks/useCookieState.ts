import { useState, useEffect, useCallback } from "react";
import Cookies from "universal-cookie";

type CookieOptions = {
  path?: string;
  maxAge?: number;
  secure?: boolean;
};

const cookieEventTarget = new EventTarget();
const cookies = new Cookies();

function tryParseJSON(value: any) {
  if (
    typeof value === "string" &&
    (value.startsWith("{") || value.startsWith("["))
  ) {
    try {
      return JSON.parse(value);
    } catch (e) {
      return value;
    }
  }
  return value;
}

export const isCaseDataCleared = () => {
  const value = cookies.get("caseDataCleared");
  return tryParseJSON(value) === true;
};

export function useCookieState(
  defaults?: Record<string, any>,
  options: CookieOptions = {},
) {
  const [_cookieState, setCookieState] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {};
    if (defaults) {
      for (const key in defaults) {
        const value = cookies.get(key);
        initial[key] =
          value !== undefined ? tryParseJSON(value) : defaults[key];
      }
    }
    return initial;
  });

  const getCookie = useCallback((key: string) => {
    const value = cookies.get(key);
    return tryParseJSON(value);
  }, []);

  const setCookie = useCallback(
    (key: string, value: any) => {
      if (key === "caseId" && isCaseDataCleared()) {
        return;
      }

      let cookieValue = value;

      if (typeof value === "object" && value !== null) {
        try {
          cookieValue = JSON.stringify(value);
        } catch (err) {
          return;
        }
      }

      cookies.set(key, cookieValue, {
        path: options.path || "/",
        maxAge: options.maxAge || 31536000,
        secure: options.secure,
      });

      setCookieState((prev) => ({ ...prev, [key]: value }));
      cookieEventTarget.dispatchEvent(new Event(key));
    },
    [options.path, options.maxAge, options.secure],
  );

  const removeCookie = useCallback(
    (key: string) => {
      cookies.remove(key, { path: options.path || "/" });
      setCookieState((prev) => {
        const newState = { ...prev };
        delete newState[key];
        return newState;
      });
      cookieEventTarget.dispatchEvent(new Event(key));
    },
    [options.path],
  );

  const removeAll = useCallback((_path: string = "/") => {
    const all = cookies.getAll();
    for (const name of Object.keys(all)) {
      removeCookie(name);
    }
  }, [removeCookie]);

  useEffect(() => {
    const handlers: { [key: string]: () => void } = {};

    if (defaults) {
      Object.keys(defaults).forEach((key) => {
        const handler = () => {
          const latest = cookies.get(key);
          setCookieState((prev) => ({
            ...prev,
            [key]: tryParseJSON(latest),
          }));
        };
        cookieEventTarget.addEventListener(key, handler);
        handlers[key] = handler;
      });
    }

    return () => {
      Object.entries(handlers).forEach(([key, handler]) => {
        cookieEventTarget.removeEventListener(key, handler);
      });
    };
  }, [defaults]);

  return [getCookie, setCookie, removeCookie, removeAll] as const;
}
