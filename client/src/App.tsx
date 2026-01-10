import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/Home";
import NotFound from "@/pages/not-found";
import { useEffect, useState, createContext, useContext } from 'react';
import { v4 as uuidv4 } from 'uuid';

const SessionContext = createContext<string | null>(null);

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) throw new Error("useSession must be used within SessionProvider");
  return context;
};

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [sessionId] = useState(() => {
    const id = sessionStorage.getItem('chat_session_id') || uuidv4();
    sessionStorage.setItem('chat_session_id', id);
    return id;
  });

  useEffect(() => {
    const handleBeforeUnload = () => {
      sessionStorage.removeItem('chat_session_id');
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SessionContext.Provider value={sessionId}>
          <Toaster />
          <Router />
        </SessionContext.Provider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
