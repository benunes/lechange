"use client";

import { useEffect, useRef, useState } from "react";

interface Message {
  id: string;
  content: string;
  createdAt: Date;
  sender: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

interface UseRealtimeMessagesProps {
  conversationId: string;
  initialMessages: Message[];
}

export function useRealtimeMessages({
  conversationId,
  initialMessages,
}: UseRealtimeMessagesProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    // Créer la connexion SSE
    const eventSource = new EventSource(
      `/api/messages/stream?conversationId=${conversationId}`,
    );
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      console.log("✅ Connexion temps réel établie");
      setIsConnected(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case "connected":
            console.log("🔗 Connecté au stream de messages");
            break;

          case "new_message":
            console.log("📨 Nouveau message reçu:", data.message);
            setMessages((prev) => {
              // Éviter les doublons
              const exists = prev.some((msg) => msg.id === data.message.id);
              if (exists) return prev;

              return [
                ...prev,
                {
                  ...data.message,
                  createdAt: new Date(data.message.createdAt),
                },
              ];
            });
            break;
        }
      } catch (error) {
        console.error("Erreur parsing message SSE:", error);
      }
    };

    eventSource.onerror = (error) => {
      console.error("❌ Erreur connexion SSE:", error);
      setIsConnected(false);

      // Reconnexion automatique après 5 secondes
      setTimeout(() => {
        if (eventSourceRef.current?.readyState === EventSource.CLOSED) {
          console.log("🔄 Tentative de reconnexion...");
          eventSourceRef.current = new EventSource(
            `/api/messages/stream?conversationId=${conversationId}`,
          );
        }
      }, 5000);
    };

    // Nettoyage à la déconnexion
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      setIsConnected(false);
    };
  }, [conversationId]);

  // Fonction pour ajouter un message localement (optimistic update)
  const addMessageOptimistically = (message: Message) => {
    setMessages((prev) => [...prev, message]);
  };

  return {
    messages,
    isConnected,
    addMessageOptimistically,
  };
}
