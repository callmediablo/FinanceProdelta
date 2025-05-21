import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import ExpenseTracker from "@/pages/ExpenseTracker";
import Budgets from "@/pages/Budgets";
import SavingsGoals from "@/pages/SavingsGoals";
import Contracts from "@/pages/Contracts";
import Schufa from "@/pages/Schufa";
import Crypto from "@/pages/Crypto";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

function Router() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow py-6 px-4">
        <div className="container mx-auto">
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/expenses" component={ExpenseTracker} />
            <Route path="/budgets" component={Budgets} />
            <Route path="/savings" component={SavingsGoals} />
            <Route path="/contracts" component={Contracts} />
            <Route path="/schufa" component={Schufa} />
            <Route path="/crypto" component={Crypto} />
            <Route component={NotFound} />
          </Switch>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
