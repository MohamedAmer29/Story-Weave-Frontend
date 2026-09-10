import { BrowserRouter } from "react-router-dom";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
import { IdleCursor } from "./components/common/IdleCursor";
import { AppProviders } from "./providers";
import { AppRoutes } from "./routes";

const App = () => {
  return (
    <ErrorBoundary>
      <AppProviders>
        <IdleCursor />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AppProviders>
    </ErrorBoundary>
  );
};

export default App;
