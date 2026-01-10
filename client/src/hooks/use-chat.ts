import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type ChatResponse, buildUrl } from "@shared/routes";
import { useSession } from "../App";

export function useChatHistory() {
  const sessionId = useSession();
  
  return useQuery({
    queryKey: [api.chat.history.path, sessionId],
    queryFn: async () => {
      const url = buildUrl(api.chat.history.path, { sessionId });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch chat history");
      return api.chat.history.responses[200].parse(await res.json());
    },
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  const sessionId = useSession();
  
  return useMutation({
    mutationFn: async (message: string) => {
      const validated = api.chat.send.input.parse({ message, sessionId });
      
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
      queryClient.invalidateQueries({ queryKey: [api.chat.history.path, sessionId] });
    },
  });
}
