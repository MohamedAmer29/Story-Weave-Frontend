import type { ReactNode } from "react";
import { Provider } from "react-redux";
import { QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { store } from "../store";
import { queryClient } from "../lib/queryClient";
import { I18nProvider } from "../i18n";
import { ThemeProvider } from "../theme";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <HelmetProvider>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <I18nProvider>
            <ThemeProvider>{children}</ThemeProvider>
          </I18nProvider>
        </QueryClientProvider>
      </Provider>
    </HelmetProvider>
  );
}