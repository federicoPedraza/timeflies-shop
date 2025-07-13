"use client";

import { useRouter } from "next/navigation";
import { useCallback, useRef } from "react";

export function useNavigationLoading() {
  const router = useRouter();
  const currentPathRef = useRef<string | null>(null);
  const lastNavigationTimeRef = useRef<number>(0);

  const push = useCallback((href: string, options?: any) => {
    const now = Date.now();

    // Only trigger loading if we're actually navigating to a different path and haven't navigated recently
    if (currentPathRef.current !== href && now - lastNavigationTimeRef.current > 500) {
      currentPathRef.current = href;
      lastNavigationTimeRef.current = now;

      // Emit navigation start event
      window.dispatchEvent(new CustomEvent('navigation-start'));

      // Navigate
      router.push(href, options);

      // Emit navigation complete event after a delay
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('navigation-complete'));
      }, 200);
    } else {
      // Same path or too soon, just navigate without loading indicator
      router.push(href, options);
    }
  }, [router]);

  const replace = useCallback((href: string, options?: any) => {
    const now = Date.now();

    // Only trigger loading if we're actually navigating to a different path and haven't navigated recently
    if (currentPathRef.current !== href && now - lastNavigationTimeRef.current > 500) {
      currentPathRef.current = href;
      lastNavigationTimeRef.current = now;

      // Emit navigation start event
      window.dispatchEvent(new CustomEvent('navigation-start'));

      // Navigate
      router.replace(href, options);

      // Emit navigation complete event after a delay
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('navigation-complete'));
      }, 200);
    } else {
      // Same path or too soon, just navigate without loading indicator
      router.replace(href, options);
    }
  }, [router]);

  const back = useCallback(() => {
    const now = Date.now();
    if (now - lastNavigationTimeRef.current > 500) {
      lastNavigationTimeRef.current = now;

      // Emit navigation start event for back navigation
      window.dispatchEvent(new CustomEvent('navigation-start'));

      // Navigate
      router.back();

      // Emit navigation complete event after a delay
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('navigation-complete'));
      }, 200);
    } else {
      router.back();
    }
  }, [router]);

  const forward = useCallback(() => {
    const now = Date.now();
    if (now - lastNavigationTimeRef.current > 500) {
      lastNavigationTimeRef.current = now;

      // Emit navigation start event for forward navigation
      window.dispatchEvent(new CustomEvent('navigation-start'));

      // Navigate
      router.forward();

      // Emit navigation complete event after a delay
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('navigation-complete'));
      }, 200);
    } else {
      router.forward();
    }
  }, [router]);

  return {
    push,
    replace,
    back,
    forward,
    refresh: router.refresh,
    prefetch: router.prefetch,
  };
}
