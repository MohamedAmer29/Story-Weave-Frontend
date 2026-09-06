/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface PageLoadingValue {
  isLoading: boolean;
  registerLoading: (loading: boolean) => void;
}

const PageLoadingContext = createContext<PageLoadingValue | null>(null);

export function PageLoadingProvider({ children }: { children: ReactNode }) {
  const [loadingCount, setLoadingCount] = useState(0);
  const isLoading = loadingCount > 0;

  const registerLoading = useCallback((loading: boolean) => {
    setLoadingCount((count) => Math.max(0, count + (loading ? 1 : -1)));
  }, []);

  const value = useMemo(
    () => ({ isLoading, registerLoading }),
    [isLoading, registerLoading],
  );

  return (
    <PageLoadingContext.Provider value={value}>
      {children}
    </PageLoadingContext.Provider>
  );
}

/**
 * Register the current page's loading state and read the aggregate.
 * Pass nothing to only read whether anything is loading.
 */
export function useContentLoading(isLoading?: boolean) {
  const ctx = useContext(PageLoadingContext);
  useLayoutEffect(() => {
    if (!ctx || !isLoading) return;
    ctx.registerLoading(true);
    return () => ctx.registerLoading(false);
  }, [ctx, isLoading]);
  return ctx?.isLoading ?? false;
}