import { useState, useRef, useEffect } from "react";
import { useChatHistory, useSendMessage } from "@/hooks/use-chat";
import { ChatMessage, TypingIndicator } from "@/components/ChatMessage";
import { SuggestedQuestions } from "@/components/SuggestedQuestions";
import { Send, GraduationCap, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const { data: history, isLoading: isHistoryLoading } = useChatHistory();
  const sendMessage = useSendMessage();

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || sendMessage.isPending) return;

    const message = input;
    setInput("");

    try {
      await sendMessage.mutateAsync(message);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error sending message",
        description: error.message,
      });
      // Optionally put the message back if it failed
      setInput(message);
    }
  };

  const handleSuggestion = (question: string) => {
    setInput(question);
    // Optional: auto-submit suggestions
    // sendMessage.mutate(question); 
  };

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, sendMessage.isPending]);

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-background via-white to-secondary/30">
      {/* Header */}
      <header className="flex-none px-6 py-4 border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <GraduationCap className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
                FETW Assistant
              </h1>
              <p className="text-xs text-muted-foreground font-medium">
                Sharnbasva University • Electronics & Comm.
              </p>
            </div>
          </div>
          
          <button className="p-2 text-muted-foreground hover:text-primary transition-colors rounded-full hover:bg-secondary">
            <Info className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 overflow-hidden relative">
        <div 
          ref={scrollRef}
          className="h-full overflow-y-auto scroll-smooth px-4 pb-4"
        >
          <div className="max-w-4xl mx-auto min-h-full flex flex-col justify-end py-6 space-y-2">
            
            {/* Empty State / Welcome */}
            {(!history || history.length === 0) && !isHistoryLoading && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center flex-1 py-12 text-center space-y-6"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full" />
                  {/* Stock image for university vibe (abstract) */}
                  {/* university campus abstract illustration */}
                  <img 
                    src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=400&h=400&fit=crop&q=80" 
                    alt="University Campus"
                    className="relative w-32 h-32 object-cover rounded-2xl shadow-xl rotate-3 border-4 border-white"
                  />
                </div>
                
                <div className="max-w-md space-y-2">
                  <h2 className="text-2xl font-bold text-foreground">
                    Welcome to FETW
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    I am your AI assistant for Electronics & Communication Engineering. 
                    Ask me about the department, subjects, or college facilities.
                  </p>
                </div>

                <SuggestedQuestions onSelect={handleSuggestion} disabled={sendMessage.isPending} />
              </motion.div>
            )}

            {/* Message History */}
            <AnimatePresence initial={false}>
              {history?.map((msg) => (
                <ChatMessage 
                  key={msg.id}
                  role={msg.role as "user" | "assistant"}
                  content={msg.content}
                  createdAt={msg.createdAt}
                />
              ))}
            </AnimatePresence>

            {/* Loading State */}
            {sendMessage.isPending && <TypingIndicator />}
          </div>
        </div>
      </main>

      {/* Input Area */}
      <footer className="flex-none bg-white border-t p-4 md:p-6 pb-8">
        <div className="max-w-4xl mx-auto">
          <form 
            onSubmit={handleSubmit}
            className="relative flex items-center gap-2 group"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about Electronics, HOD, or Campus..."
              className="
                w-full pl-6 pr-14 py-4 rounded-2xl
                bg-secondary/30 border-2 border-transparent
                text-foreground placeholder:text-muted-foreground/70
                focus:outline-none focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5
                transition-all duration-200 shadow-sm
              "
              disabled={sendMessage.isPending}
            />
            
            <button
              type="submit"
              disabled={!input.trim() || sendMessage.isPending}
              className="
                absolute right-2 top-2 bottom-2 aspect-square
                flex items-center justify-center
                bg-primary text-primary-foreground rounded-xl shadow-lg shadow-primary/20
                hover:shadow-xl hover:bg-primary/90 hover:scale-105
                active:scale-95
                disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none
                transition-all duration-200 ease-out
              "
            >
              <Send className="w-5 h-5 ml-0.5" />
            </button>
          </form>
          <div className="mt-3 text-center text-xs text-muted-foreground/60 font-medium">
            AI can make mistakes. Verify important information with the department.
          </div>
        </div>
      </footer>
    </div>
  );
}
