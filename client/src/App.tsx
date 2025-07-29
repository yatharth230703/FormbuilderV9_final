import { Switch, Route } from "wouter";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import { useEffect } from "react";
import { AdminProvider } from "@/contexts/admin-context";
import { AuthProvider } from "@/contexts/AuthContext";
import { FormProvider } from "@/contexts/form-context";
import { Toaster } from "@/components/ui/toaster";
import { ApiAccessPage } from "@/pages/api-access"; // ✅ adjust path if needed
import LandingPage from "@/pages/LandingPage";
import EmbedForm from "@/pages/embed";
import { AuthPage } from "@/pages/AuthPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { FormResponsesPage } from "@/pages/FormResponsesPage";
import { FormPreviewPage } from "@/pages/FormPreviewPage";
import { FormEditPage } from "@/pages/FormEditPage";
import FormConsolePage from "@/pages/FormConsolePage";
import EditPage from "@/pages/EditPage";
import { useIframeResize } from "@/hooks/useIframeResize";

function Router() {
  return (
    <Switch>
      
      <Route path="/" component={LandingPage} />
      <Route path="/buildform" component={Home} />
      <Route path="/embed" component={EmbedForm} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/dashboard" component={DashboardPage} />
      <Route path="/form-console" component={FormConsolePage} />
      <Route path="/forms/:id/responses" component={FormResponsesPage} />
      <Route path="/forms/:id/preview" component={FormPreviewPage} />
      <Route path="/preview/:id" component={FormPreviewPage} />
      <Route path="/edit/:id" component={EditPage} />
      <Route path="/forms/:id" component={FormEditPage} />
      <Route path="/api-access" component={ApiAccessPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Dynamically resize when the app is embedded in an iframe
  useIframeResize();
  useEffect(() => {
    // Set the page title
    document.title = "Forms Engine - Prompt to Form Generator";

    // Update favicon
    const link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
    if (!link) {
      const newLink = document.createElement("link");
      newLink.rel = "icon";
      newLink.href = "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%230E565B%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22><path d=%22M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z%22/></svg>";
      document.head.appendChild(newLink);
    } else {
      link.href = "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%230E565B%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22><path d=%22M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z%22/></svg>";
    }
    
    // Clear any dark mode related classes (ensuring light mode)
    document.documentElement.classList.remove('dark');
    
    // Remove any previously stored theme preference
    localStorage.removeItem('theme');
    
  }, []);

  return (
    <AuthProvider>
      <AdminProvider>
        <FormProvider>
          <Router />
          <Toaster />
        </FormProvider>
      </AdminProvider>
    </AuthProvider>
  );
}

export default App;

