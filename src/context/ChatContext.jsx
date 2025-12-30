import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { MESSAGE_TYPES } from "../utils/constants";
import { askRagStream } from "../Services/ragService";
import { getNavigationRoot, getNavigationNext } from "../Services/navigationService";

const ChatContext = createContext();
const STORAGE_KEY = "fiswize_chat_data";

// sessionStorage: se borra al cerrar pestaña/navegador
const loadFromSessionStorage = () => {
  try {
    const savedData = sessionStorage.getItem(STORAGE_KEY);
    if (savedData) {
      const parsed = JSON.parse(savedData);
      const chatsWithDates = parsed.chats.map((chat) => ({
        ...chat,
        createdAt: new Date(chat.createdAt),
        messages: chat.messages.map((msg) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        })),
      }));
      return {
        chats: chatsWithDates,
        activeChat: parsed.activeChat,
      };
    }
  } catch (error) {
    console.error("Error al cargar desde sessionStorage:", error);
  }
  return null;
};

export function ChatProvider({ children }) {
  const savedData = loadFromSessionStorage();

  const [chats, setChats] = useState(
    savedData?.chats || [
      {
        id: 1,
        name: "Nueva conversación",
        messages: [],
        createdAt: new Date(),
        active: true,
      },
    ]
  );
  const [activeChat, setActiveChat] = useState(savedData?.activeChat || 1);
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState("");

  // FLUJOS
  const [flowPath, setFlowPath] = useState(null); // null = no hay flujo activo
  const [flowOptions, setFlowOptions] = useState([]);
  const [flowTitle, setFlowTitle] = useState("Opciones guiadas");
  const [isFlowLoading, setIsFlowLoading] = useState(false);

  const currentChat = chats.find((c) => c.id === activeChat);
  const messages = currentChat?.messages || [];

  // sessionStorage
  useEffect(() => {
    try {
      const dataToSave = {
        chats: chats.map((chat) => ({
          ...chat,
          createdAt: chat.createdAt.toISOString(),
          messages: chat.messages.map((msg) => ({
            ...msg,
            timestamp: msg.timestamp.toISOString(),
          })),
        })),
        activeChat,
      };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (error) {
      console.error("Error al guardar en sessionStorage:", error);
    }
  }, [chats, activeChat]);

  const addMessage = useCallback(
    (message) => {
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === activeChat
            ? {
                ...chat,
                messages: [...chat.messages, message],
                name:
                  chat.messages.length === 0 && message.type === MESSAGE_TYPES.USER
                    ? message.content.slice(0, 30) +
                      (message.content.length > 30 ? "..." : "")
                    : chat.name,
              }
            : chat
        )
      );
    },
    [activeChat]
  );

  // FLUJOS
  const startFlow = useCallback(async () => {
    setIsFlowLoading(true);
    setIsTyping(true);

    try {
      const root = await getNavigationRoot(); // { options }
      setFlowTitle("Opciones guiadas");
      setFlowOptions(root.options || []);
      setFlowPath([]); // flujo activo

      addMessage({
        id: Date.now(),
        type: MESSAGE_TYPES.BOT,
        content: "Selecciona una opción de la barra superior para continuar.",
        timestamp: new Date(),
        mode: "flow",
      });
    } catch (error) {
      console.error(error);
      addMessage({
        id: Date.now(),
        type: MESSAGE_TYPES.BOT,
        content: "No pude cargar las opciones guiadas. Revisa el servidor o intenta de nuevo.",
        timestamp: new Date(),
        isError: true,
      });

      setFlowTitle("Opciones guiadas");
      setFlowOptions([]);
      setFlowPath(null);
    } finally {
      setIsFlowLoading(false);
      setIsTyping(false);
    }
  }, [addMessage]);

  const pickFlowOption = useCallback(
    async (optionId, optionLabel) => {
      if (isFlowLoading) return;

      if (flowPath === null) {
        await startFlow();
        return;
      }

      addMessage({
        id: Date.now(),
        type: MESSAGE_TYPES.USER,
        content: optionLabel,
        timestamp: new Date(),
      });

      setIsFlowLoading(true);
      setIsTyping(true);

      try {
        const newPath = [...(flowPath || []), optionId];
        const node = await getNavigationNext(newPath);

        setFlowTitle(node.title || "Opciones guiadas");

        if (node.type === "answer") {
          // SE ocultAN botones:
          setFlowOptions([]);
          setFlowPath(newPath);

          addMessage({
            id: Date.now() + 1,
            type: MESSAGE_TYPES.BOT,
            content: node.answer || "Listo.",
            timestamp: new Date(),
            fileName: node.file_name || null,
            mode: "flow",
          });
        } else {
          setFlowOptions(node.options || []);
          setFlowPath(newPath);

          addMessage({
            id: Date.now() + 1,
            type: MESSAGE_TYPES.BOT,
            content: node.title
              ? `${node.title}: selecciona una opción en la barra superior.`
              : "Selecciona una opción en la barra superior.",
            timestamp: new Date(),
            mode: "flow",
          });
        }
      } catch (error) {
        console.error(error);
        addMessage({
          id: Date.now() + 1,
          type: MESSAGE_TYPES.BOT,
          content: "Error al avanzar en el flujo. Intenta otra opción o reinicia el flujo.",
          timestamp: new Date(),
          isError: true,
        });
      } finally {
        setIsFlowLoading(false);
        setIsTyping(false);
      }
    },
    [addMessage, flowPath, isFlowLoading, startFlow]
  );

  // Salir del flujo -> chat libre
  const exitFlow = useCallback(() => {
    setFlowPath(null);
    setFlowOptions([]);
    setFlowTitle("Opciones guiadas");
    setIsFlowLoading(false);

    addMessage({
      id: Date.now(),
      type: MESSAGE_TYPES.BOT,
      content: "Listo ✅ Volviste al modo chat libre. Puedes escribir tu pregunta.",
      timestamp: new Date(),
    });
  }, [addMessage]);

  // Reiniciar el flujo 
  const restartFlow = useCallback(async () => {
    await startFlow();
  }, [startFlow]);

  // RAG
  const sendMessage = useCallback(
    async (content) => {
      if (!content || content.trim() === "" || content.length > 1000) return;
      if (isTyping) return;

      // escribir manualmente, modo chat libre, se oculta barra)
      setFlowPath(null);
      setFlowOptions([]);
      setFlowTitle("Opciones guiadas");
      setIsFlowLoading(false);

      const userMsg = {
        id: Date.now(),
        type: MESSAGE_TYPES.USER,
        content: content.trim(),
        timestamp: new Date(),
      };

      addMessage(userMsg);
      setInputValue("");
      setIsTyping(true);

      const botId = Date.now() + 1;
      addMessage({
        id: botId,
        type: MESSAGE_TYPES.BOT,
        content: "",
        timestamp: new Date(),
        isStreaming: true,
        sources: [],
      });

      let fullAnswer = "";
      let sources = [];

      await askRagStream(content, {
        onMessage: (fragment) => {
          fullAnswer += fragment;

          setChats((prev) =>
            prev.map((chat) => {
              if (chat.id !== activeChat) return chat;
              return {
                ...chat,
                messages: chat.messages.map((m) =>
                  m.id === botId ? { ...m, content: fullAnswer } : m
                ),
              };
            })
          );
        },
        onMetadata: (meta) => {
          if (meta?.sources) sources = meta.sources;
        },
        onDone: () => {
          setIsTyping(false);
          setChats((prev) =>
            prev.map((chat) => {
              if (chat.id !== activeChat) return chat;
              return {
                ...chat,
                messages: chat.messages.map((m) =>
                  m.id === botId ? { ...m, isStreaming: false, sources } : m
                ),
              };
            })
          );
        },
        onError: (error) => {
          console.error(error);
          setIsTyping(false);
          setChats((prev) =>
            prev.map((chat) => {
              if (chat.id !== activeChat) return chat;
              return {
                ...chat,
                messages: chat.messages.map((m) =>
                  m.id === botId
                    ? {
                        ...m,
                        isStreaming: false,
                        isError: true,
                        content:
                          "Lo siento, no pude conectarme con el servidor. Verifica tu conexión o el backend.",
                      }
                    : m
                ),
              };
            })
          );
        },
      });
    },
    [addMessage, activeChat, isTyping]
  );

  // CHATS
  const createNewChat = useCallback(() => {
    const newChatId = Date.now();
    const newChat = {
      id: newChatId,
      name: "Nueva conversación",
      messages: [],
      createdAt: new Date(),
      active: true,
    };

    setChats((prev) => [...prev.map((c) => ({ ...c, active: false })), newChat]);
    setActiveChat(newChatId);
    setInputValue("");

    setFlowPath(null);
    setFlowOptions([]);
    setFlowTitle("Opciones guiadas");
    setIsFlowLoading(false);
  }, []);

  const switchChat = useCallback((chatId) => {
    setChats((prev) => prev.map((c) => ({ ...c, active: c.id === chatId })));
    setActiveChat(chatId);
    setInputValue("");

    setFlowPath(null);
    setFlowOptions([]);
    setFlowTitle("Opciones guiadas");
    setIsFlowLoading(false);
  }, []);

  const clearAllData = useCallback(() => {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
      setChats([
        {
          id: 1,
          name: "Nueva conversación",
          messages: [],
          createdAt: new Date(),
          active: true,
        },
      ]);
      setActiveChat(1);
      setInputValue("");

      setFlowPath(null);
      setFlowOptions([]);
      setFlowTitle("Opciones guiadas");
      setIsFlowLoading(false);
    } catch (error) {
      console.error("Error al limpiar datos:", error);
    }
  }, []);

  const value = {
    messages,
    isTyping,
    inputValue,
    setInputValue,

    chatHistory: chats,
    activeChat,

    addMessage,
    sendMessage,

    // flujo + controles
    startFlow,
    pickFlowOption,
    exitFlow,
    restartFlow,
    flowPath,
    flowOptions,
    flowTitle,
    isFlowLoading,

    createNewChat,
    switchChat,
    clearAllData,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) throw new Error("useChat must be used within ChatProvider");
  return context;
}
