import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/Home";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

// This turns the chat into a session-based experience
import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

// ... other imports

function App() {
  const [sessionId] = useState(() => {
    // Generate a fresh ID for this tab/session
    // sessionStorage is cleared on tab close/refresh as per requirement
    const id = sessionStorage.getItem('chat_session_id') || uuidv4();
    sessionStorage.setItem('chat_session_id', id);
    return id;
  });

  // Ensure fresh start on refresh
  useEffect(() => {
    const handleBeforeUnload = () => {
      sessionStorage.removeItem('chat_session_id');
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // ... rest of the app
}

export default App;
