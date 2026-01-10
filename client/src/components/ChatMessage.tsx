import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  createdAt?: string | Date | null;
}

export function ChatMessage({ role, content, createdAt }: ChatMessageProps) {
  const isBot = role === "assistant";
  const timestamp = createdAt ? new Date(createdAt) : new Date();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex w-full gap-4 p-4 md:p-6",
        isBot ? "bg-white/50 backdrop-blur-sm" : "bg-transparent flex-row-reverse"
      )}
    >
      {/* Avatar */}
      <div className={cn(
        "flex h-10 w-10 shrink-0 select-none items-center justify-center rounded-xl shadow-sm border",
        isBot 
          ? "bg-primary text-primary-foreground border-primary/20" 
          : "bg-secondary text-secondary-foreground border-secondary-foreground/10"
      )}>
        {isBot ? <Bot className="h-6 w-6" /> : <User className="h-6 w-6" />}
      </div>

      {/* Message Content */}
      <div className={cn("flex-1 space-y-2", !isBot && "text-right")}>
        <div className="flex items-center gap-2 text-sm text-muted-foreground" style={{ justifyContent: isBot ? 'flex-start' : 'flex-end' }}>
          <span className="font-semibold text-foreground">
            {isBot ? "FETW Assistant" : "You"}
          </span>
          <span>•</span>
          <time dateTime={timestamp.toISOString()}>
            {format(timestamp, "h:mm a")}
          </time>
        </div>
        
        <div className={cn(
          "prose prose-blue max-w-none text-base leading-relaxed break-words",
          isBot ? "text-left" : "bg-primary text-primary-foreground p-4 rounded-2xl rounded-tr-sm shadow-md inline-block text-left"
        )}>
          {isBot ? (
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                ul: ({ children }) => <ul className="list-disc pl-4 mb-2">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal pl-4 mb-2">{children}</ol>,
                li: ({ children }) => <li className="mb-1">{children}</li>,
                strong: ({ children }) => <strong className="font-bold text-foreground">{children}</strong>,
              }}
            >
              {content}
            </ReactMarkdown>
          ) : (
            content
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function TypingIndicator() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex w-full gap-4 p-4 md:p-6 bg-white/50 backdrop-blur-sm"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
        <Bot className="h-6 w-6" />
      </div>
      <div className="flex items-center gap-1 h-10">
        <div className="typing-dot h-2 w-2 rounded-full bg-primary/60" />
        <div className="typing-dot h-2 w-2 rounded-full bg-primary/60" />
        <div className="typing-dot h-2 w-2 rounded-full bg-primary/60" />
      </div>
    </motion.div>
  );
}
