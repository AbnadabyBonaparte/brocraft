import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/common/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Recipes from "./pages/Recipes";
import ConversationHistory from "./pages/ConversationHistory";
import Badges from "./pages/Badges";
import Community from "./pages/Community";
import UpgradeSuccess from "./pages/UpgradeSuccess";
import UpgradeCancel from "./pages/UpgradeCancel";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import { ROUTES } from "./shared/routes";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
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
