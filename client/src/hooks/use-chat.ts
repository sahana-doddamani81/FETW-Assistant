import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type ChatResponse } from "@shared/routes";

export function useChatHistory() {
  return useQuery({
    queryKey: [api.chat.history.path],
    queryFn: async () => {
      const res = await fetch(api.chat.history.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch chat history");
      return api.chat.history.responses[200].parse(await res.json());
    },
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (message: string) => {
      // Optimistic updates are handled in the UI for speed, but we validate here
      const validated = api.chat.send.input.parse({ message });
      
      const res = await fetch(api.chat.send.path, {
        method: api.chat.send.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 500) {
          const error = api.chat.send.responses[500].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to send message");
      }

      return api.chat.send.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      // Invalidate history to ensure sync
      queryClient.invalidateQueries({ queryKey: [api.chat.history.path] });
    },
  });
}
