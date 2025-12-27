import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface SuggestedQuestionsProps {
  onSelect: (question: string) => void;
  disabled?: boolean;
}

const suggestions = [
  "Who is the HOD of ECE?",
  "Explain basic electronic components",
  "Where is FETW located?",
  "What is Digital Communication?",
];

export function SuggestedQuestions({ onSelect, disabled }: SuggestedQuestionsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-3xl mx-auto mt-6">
      {suggestions.map((question, idx) => (
        <motion.button
          key={question}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: idx * 0.1 }}
          onClick={() => onSelect(question)}
          disabled={disabled}
          className="
            group flex items-center justify-between p-4 text-left
            bg-white border border-border/60 rounded-xl shadow-sm
            hover:shadow-md hover:border-primary/30 hover:bg-primary/5
            transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          <span className="text-sm font-medium text-foreground/80 group-hover:text-primary transition-colors">
            {question}
          </span>
          <Sparkles className="w-4 h-4 text-primary/40 group-hover:text-primary transition-colors" />
        </motion.button>
      ))}
    </div>
  );
}
