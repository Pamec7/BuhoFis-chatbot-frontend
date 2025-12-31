import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { MESSAGE_TYPES } from "../utils/constants";
import { askRagStream } from "../Services/ragService";
import { getNavigationRoot, getNavigationNext } from "../Services/navigationService";

const ChatContext = createContext();
const STORAGE_KEY = "fiswize_chat_data";

const loadFromSessionStorage = () => {
  try {
    const savedData = sessionStorage.getItem(STORAGE_KEY);
    if (!savedData) return null;

    const parsed = JSON.parse(savedData);
    return {
      chats: parsed.chats.map((chat) => ({
        ...chat,
        createdAt: new Date(chat.createdAt),
        messages: chat.messages.map((m) => ({
          ...m,
          timestamp: new Date(m.timestamp),
        })),
      })),
      activeChat: parsed.activeChat,
    };
  } catch {
    return null;
  }
};

export function ChatProvider({ children }) {
  const savedData = loadFromSessionStorage();

  const [chats, setChats] = useState(
    savedData?.chats || [
      { id: 1, name: "Nueva conversación", messages: [], createdAt: new Date(), active: true },
    ]
  );
  const [activeChat, setActiveChat] = useState(savedData?.activeChat || 1);

  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const [flowPath, setFlowPath] = useState(null);
  const [flowOptions, setFlowOptions] = useState([]);
  const [flowTitle, setFlowTitle] = useState("Opciones guiadas");
  const [isFlowLoading, setIsFlowLoading] = useState(false);

  const currentChat = chats.find((c) => c.id === activeChat);
  const messages = currentChat?.messages || [];

  useEffect(() => {
    const data = {
      chats: chats.map((c) => ({
        ...c,
        createdAt: c.createdAt.toISOString(),
        messages: c.messages.map((m) => ({
          ...m,
          timestamp: m.timestamp.toISOString(),
        })),
      })),
      activeChat,
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [chats, activeChat]);

  const addMessage = useCallback(
    (message) => {
      setChats((prev) =>
        prev.map((chat) => {
          if (chat.id !== activeChat) return chat;

          const isDefaultName = chat.name === "Nueva conversación";
          const userCount = chat.messages.filter((m) => m.type === MESSAGE_TYPES.USER).length;

          const shouldRename =
            isDefaultName && message.type === MESSAGE_TYPES.USER && userCount === 0;

          return {
            ...chat,
            messages: [...chat.messages, message],
            name: shouldRename
              ? message.content.slice(0, 30) + (message.content.length > 30 ? "..." : "")
              : chat.name,
          };
        })
      );
    },
    [activeChat]
  );

  const startFlow = useCallback(async () => {
    setIsFlowLoading(true);
    setIsTyping(true);

    try {
      const root = await getNavigationRoot();
      setFlowTitle("Opciones guiadas");
      setFlowOptions(root.options || []);
      setFlowPath([]);

      addMessage({
        id: Date.now(),
        type: MESSAGE_TYPES.BOT,
        content: "Selecciona una opción para continuar.",
        timestamp: new Date(),
      });
    } finally {
      setIsFlowLoading(false);
      setIsTyping(false);
    }
  }, [addMessage]);

  const pickFlowOption = useCallback(
    async (optionId, optionLabel) => {
      if (isFlowLoading) return;

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
        setFlowPath(newPath);

        if (node.type === "answer") {
          setFlowOptions([]);
          addMessage({
            id: Date.now() + 1,
            type: MESSAGE_TYPES.BOT,
            content: node.answer || "Listo.",
            timestamp: new Date(),
            fileName: node.file_name || null,
          });
        } else {
          setFlowOptions(node.options || []);
        }
      } finally {
        setIsFlowLoading(false);
        setIsTyping(false);
      }
    },
    [addMessage, flowPath, isFlowLoading]
  );

  const backFlow = useCallback(async () => {
    if (!flowPath || flowPath.length === 0) {
      await startFlow();
      return;
    }

    setIsFlowLoading(true);
    setIsTyping(true);

    try {
      const newPath = flowPath.slice(0, -1);

      if (newPath.length === 0) {
        const root = await getNavigationRoot();
        setFlowTitle("Opciones guiadas");
        setFlowOptions(root.options || []);
        setFlowPath([]);
        return;
      }

      const node = await getNavigationNext(newPath);
      setFlowTitle(node.title || "Opciones guiadas");
      setFlowOptions(node.options || []);
      setFlowPath(newPath);
    } finally {
      setIsFlowLoading(false);
      setIsTyping(false);
    }
  }, [flowPath, startFlow]);

  const restartFlow = useCallback(async () => {
    await startFlow();
  }, [startFlow]);

  const exitFlow = useCallback(() => {
    setFlowPath(null);
    setFlowOptions([]);
    setFlowTitle("Opciones guiadas");
    setIsFlowLoading(false);

    addMessage({
      id: Date.now(),
      type: MESSAGE_TYPES.BOT,
      content: "Has salido de las opciones guiadas. Puedes escribir tu pregunta.",
      timestamp: new Date(),
    });
  }, [addMessage]);

  const sendMessage = useCallback(
    async (content) => {
      if (!content || isTyping || flowPath) return;

      addMessage({
        id: Date.now(),
        type: MESSAGE_TYPES.USER,
        content: content.trim(),
        timestamp: new Date(),
      });

      setInputValue("");
      setIsTyping(true);

      const botId = Date.now() + 1;
      addMessage({
        id: botId,
        type: MESSAGE_TYPES.BOT,
        content: "",
        timestamp: new Date(),
        isStreaming: true,
      });

      let fullAnswer = "";

      await askRagStream(content, {
        onMessage: (fragment) => {
          fullAnswer += fragment;
          setChats((prev) =>
            prev.map((chat) =>
              chat.id === activeChat
                ? {
                    ...chat,
                    messages: chat.messages.map((m) =>
                      m.id === botId ? { ...m, content: fullAnswer } : m
                    ),
                  }
                : chat
            )
          );
        },
        onDone: () => {
          setIsTyping(false);
          setChats((prev) =>
            prev.map((chat) =>
              chat.id === activeChat
                ? {
                    ...chat,
                    messages: chat.messages.map((m) =>
                      m.id === botId ? { ...m, isStreaming: false } : m
                    ),
                  }
                : chat
            )
          );
        },
      });
    },
    [addMessage, activeChat, isTyping, flowPath]
  );

  const createNewChat = useCallback(() => {
    const id = Date.now();
    setChats((prev) => [
      ...prev.map((c) => ({ ...c, active: false })),
      { id, name: "Nueva conversación", messages: [], createdAt: new Date(), active: true },
    ]);
    setActiveChat(id);
    setInputValue("");
    setFlowPath(null);
    setFlowOptions([]);
  }, []);

  const switchChat = useCallback((chatId) => {
    setChats((prev) => prev.map((c) => ({ ...c, active: c.id === chatId })));
    setActiveChat(chatId);
    setInputValue("");
    setFlowPath(null);
    setFlowOptions([]);
  }, []);

  return (
    <ChatContext.Provider
      value={{
        messages,
        inputValue,
        setInputValue,
        isTyping,

        sendMessage,

        startFlow,
        pickFlowOption,
        backFlow,
        restartFlow,
        exitFlow,

        flowPath,
        flowOptions,
        flowTitle,
        isFlowLoading,

        chatHistory: chats,
        activeChat,
        createNewChat,
        switchChat,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  return useContext(ChatContext);
}
