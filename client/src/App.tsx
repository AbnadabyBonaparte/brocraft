import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
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

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/receitas" component={Recipes} />
      <Route path="/historico" component={ConversationHistory} />
      <Route path="/badges" component={Badges} />
      <Route path="/comunidade" component={Community} />
      <Route path="/upgrade/sucesso" component={UpgradeSuccess} />
      <Route path="/upgrade/cancelado" component={UpgradeCancel} />
      <Route path="/docs/terms" component={Terms} />
      <Route path="/docs/privacy" component={Privacy} />
      <Route path="/404" component={NotFound} />
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
