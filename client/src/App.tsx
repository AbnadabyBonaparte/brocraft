import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Spinner } from "@/components/ui/spinner";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/common/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ROUTES } from "./shared/routes";

const RouterFallback = () => (
  <div className="flex min-h-[50vh] items-center justify-center">
    <Spinner className="size-6 text-primary" />
  </div>
);

const Home = lazy(() => import("./pages/Home"));
const Recipes = lazy(() => import("./pages/Recipes"));
const ConversationHistory = lazy(() => import("./pages/ConversationHistory"));
const Badges = lazy(() => import("./pages/Badges"));
const Community = lazy(() => import("./pages/Community"));
const UpgradeSuccess = lazy(() => import("./pages/UpgradeSuccess"));
const UpgradeCancel = lazy(() => import("./pages/UpgradeCancel"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));
const NotFound = lazy(() => import("./pages/NotFound"));

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Suspense fallback={<RouterFallback />}>
      <Switch>
        <Route path={ROUTES.HOME} component={Home} />
        <Route path={ROUTES.RECIPES} component={Recipes} />
        <Route path={ROUTES.HISTORY} component={ConversationHistory} />
        <Route path={ROUTES.BADGES} component={Badges} />
        <Route path={ROUTES.COMMUNITY} component={Community} />
        <Route path={ROUTES.UPGRADE_SUCCESS} component={UpgradeSuccess} />
        <Route path={ROUTES.UPGRADE_CANCEL} component={UpgradeCancel} />
        <Route path={ROUTES.TERMS} component={Terms} />
        <Route path={ROUTES.PRIVACY} component={Privacy} />
        <Route path={ROUTES.NOT_FOUND} component={NotFound} />
        {/* Final fallback route */}
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
