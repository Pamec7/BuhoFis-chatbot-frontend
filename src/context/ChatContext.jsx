import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
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

const extractSources = (meta) => {
  if (!meta) return [];
  const payload = meta?.payload ?? meta;
  const sources = payload?.sources ?? [];
  if (!Array.isArray(sources)) return [];
  return sources
    .map((s) => ({
      file_id: s?.file_id ?? s?.fileId ?? null,
      file_name: s?.file_name ?? s?.fileName ?? null,
      url: s?.url ?? s?.file_url ?? s?.fileUrl ?? null,
      page: s?.page ?? null,
      score: s?.score ?? null,
    }))
    .filter((s) => s.file_name || s.file_id || s.url);
};

const classifyError = (err) => {
  const msg = String(err?.message || "");
  const isNetwork = /Failed to fetch|NetworkError|ERR_NETWORK|fetch failed/i.test(msg);
  return { msg, isNetwork };
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

  const streamAbortRef = useRef(null);
  const streamingBotIdRef = useRef(null);

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

          const shouldRename = isDefaultName && message.type === MESSAGE_TYPES.USER && userCount === 0;

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
    } catch (err) {
      const { msg, isNetwork } = classifyError(err);

      addMessage({
        id: Date.now(),
        type: MESSAGE_TYPES.BOT,
        variant: "error",
        title: isNetwork ? "Error de conexión" : "Error del servidor",
        content: isNetwork
          ? "No pude conectarme al servidor para cargar las opciones guiadas.\nRevisa tu conexión/backend."
          : "El servidor respondió con error al cargar las opciones guiadas.",
        detail: msg || null,
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

          const rawFile =
            node?.file_name ??
            node?.fileName ??
            node?.file ??
            node?.filename ??
            null;

          const fileName = typeof rawFile === "string" ? rawFile.trim() : null;
          const hasFile = !!(fileName && fileName.length > 0);

          addMessage({
            id: Date.now() + 1,
            type: MESSAGE_TYPES.BOT,
            content: node.answer || "Listo.",
            timestamp: new Date(),
            fileName: hasFile ? fileName : null,
            fileMissing: !hasFile,
            fileMissingVariant: "warning",
          });
        } else {
          setFlowOptions(node.options || []);
        }
      } catch (err) {
        const { msg, isNetwork } = classifyError(err);

        addMessage({
          id: Date.now() + 1,
          type: MESSAGE_TYPES.BOT,
          variant: "error",
          title: isNetwork ? "Error de conexión" : "Error del servidor",
          content: isNetwork
            ? "No pude conectarme al servidor para completar esa consulta.\nRevisa tu conexión/backend."
            : "El servidor respondió con error al completar esa consulta.",
          detail: msg || null,
          timestamp: new Date(),
        });
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
    } catch (err) {
      const { msg, isNetwork } = classifyError(err);

      addMessage({
        id: Date.now(),
        type: MESSAGE_TYPES.BOT,
        variant: "error",
        title: isNetwork ? "Error de conexión" : "Error del servidor",
        content: isNetwork
          ? "No pude conectarme al servidor para volver atrás en el flujo.\nRevisa tu conexión/backend."
          : "El servidor respondió con error al volver atrás en el flujo.",
        detail: msg || null,
        timestamp: new Date(),
      });
    } finally {
      setIsFlowLoading(false);
      setIsTyping(false);
    }
  }, [flowPath, startFlow, addMessage]);

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
      variant: "info",
      title: "Modo chat libre",
      content: "Has salido de las opciones guiadas. Puedes escribir tu pregunta.",
      timestamp: new Date(),
    });
  }, [addMessage]);

  const stopStreaming = useCallback(() => {
    const controller = streamAbortRef.current;
    if (controller) {
      try {
        controller.abort();
      } catch {}
    }
  }, []);

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
      streamingBotIdRef.current = botId;

      addMessage({
        id: botId,
        type: MESSAGE_TYPES.BOT,
        content: "",
        timestamp: new Date(),
        isStreaming: true,
        sources: [],
      });

      let fullAnswer = "";
      let lastSources = [];

      if (streamAbortRef.current) {
        try {
          streamAbortRef.current.abort();
        } catch {}
      }

      const controller = new AbortController();
      streamAbortRef.current = controller;

      await askRagStream(
        content,
        {
          onMetadata: (meta) => {
            const sources = extractSources(meta);
            if (!sources.length) return;

            const key = (s) => `${s.file_id || ""}::${s.file_name || ""}::${s.url || ""}::${s.page || ""}`;
            const merged = [...lastSources, ...sources];
            const uniq = [];
            const seen = new Set();
            for (const s of merged) {
              const k = key(s);
              if (seen.has(k)) continue;
              seen.add(k);
              uniq.push(s);
            }
            lastSources = uniq;

            setChats((prev) =>
              prev.map((chat) =>
                chat.id === activeChat
                  ? {
                      ...chat,
                      messages: chat.messages.map((m) =>
                        m.id === botId ? { ...m, sources: lastSources } : m
                      ),
                    }
                  : chat
              )
            );
          },
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
            streamAbortRef.current = null;
            streamingBotIdRef.current = null;

            setIsTyping(false);
            setChats((prev) =>
              prev.map((chat) =>
                chat.id === activeChat
                  ? {
                      ...chat,
                      messages: chat.messages.map((m) =>
                        m.id === botId ? { ...m, isStreaming: false, sources: lastSources } : m
                      ),
                    }
                  : chat
              )
            );
          },
          onAbort: () => {
            streamAbortRef.current = null;
            const currentBotId = streamingBotIdRef.current;
            streamingBotIdRef.current = null;

            setIsTyping(false);
            setChats((prev) =>
              prev.map((chat) =>
                chat.id === activeChat
                  ? {
                      ...chat,
                      messages: chat.messages.map((m) =>
                        m.id === currentBotId
                          ? {
                              ...m,
                              isStreaming: false,
                              content: (m.content || fullAnswer || "").trimEnd(),
                              sources: lastSources,
                            }
                          : m
                      ),
                    }
                  : chat
              )
            );
          },
          onError: (err) => {
            streamAbortRef.current = null;
            streamingBotIdRef.current = null;

            const { msg, isNetwork } = classifyError(err);

            setIsTyping(false);
            setChats((prev) =>
              prev.map((chat) =>
                chat.id === activeChat
                  ? {
                      ...chat,
                      messages: chat.messages.map((m) =>
                        m.id === botId
                          ? {
                              ...m,
                              isStreaming: false,
                              variant: "error",
                              title: isNetwork ? "Error de conexión" : "Error del servidor",
                              content: isNetwork
                                ? "No pude conectarme al servidor.\nRevisa tu conexión/backend."
                                : "El servidor respondió con error.",
                              detail: msg || null,
                              sources: lastSources,
                            }
                          : m
                      ),
                    }
                  : chat
              )
            );
          },
        },
        true,
        controller.signal
      );
    },
    [addMessage, activeChat, isTyping, flowPath]
  );

  const createNewChat = useCallback(() => {
    stopStreaming();
    const id = Date.now();
    setChats((prev) => [
      ...prev.map((c) => ({ ...c, active: false })),
      { id, name: "Nueva conversación", messages: [], createdAt: new Date(), active: true },
    ]);
    setActiveChat(id);
    setInputValue("");
    setFlowPath(null);
    setFlowOptions([]);
  }, [stopStreaming]);

  const switchChat = useCallback(
    (chatId) => {
      stopStreaming();
      setChats((prev) => prev.map((c) => ({ ...c, active: c.id === chatId })));
      setActiveChat(chatId);
      setInputValue("");
      setFlowPath(null);
      setFlowOptions([]);
    },
    [stopStreaming]
  );

  return (
    <ChatContext.Provider
      value={{
        messages,
        inputValue,
        setInputValue,
        isTyping,
        sendMessage,
        stopStreaming,
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
