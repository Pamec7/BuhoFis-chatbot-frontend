import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { MESSAGE_TYPES } from "../utils/constants";
import { askRagStream } from "../Services/ragService";
import { getNavigationRoot, getNavigationNext } from "../Services/navigationService";
import { FLOW_TREE, resolveNodeByPath } from "../mocks/mockApiData";
import { pingBackend } from "../Services/apiClient";

const ChatContext = createContext();
const STORAGE_KEY = "buhoFis_chat_data";

const API_BASE = (import.meta.env.VITE_API_BASE_URL || "").toString().trim().replace(/\/+$/, "");

const buildBackendUrl = (path) => {
  if (!path) return null;
  const p = String(path);
  if (/^https?:\/\//i.test(p)) return p;
  if (!API_BASE) return p;
  return API_BASE + (p.startsWith("/") ? p : `/${p}`);
};

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

  const nameFromUrl = (url) => {
    try {
      const u = new URL(url);
      const last = u.pathname.split("/").filter(Boolean).pop();
      if (!last) return null;
      return decodeURIComponent(last);
    } catch {
      return null;
    }
  };

  const buildDownloadUrlByName = (fileName) => {
    const n = typeof fileName === "string" ? fileName.trim() : "";
    if (!n) return null;
    return buildBackendUrl(`/files/download/${encodeURIComponent(n)}`);
  };

  return sources
    .map((s) => {
      if (typeof s === "string") {
        const fileName = s.trim();
        const display_name = fileName || null;
        const url = buildDownloadUrlByName(fileName);
        return {
          file_id: null,
          file_name: fileName || null,
          url,
          chunk_index: null,
          page: null,
          score: null,
          display_name,
          download_name: display_name,
        };
      }

      const file_id = s?.file_id ?? s?.fileId ?? null;
      const file_name = s?.file_name ?? s?.fileName ?? null;

      const rawUrl = s?.url ?? s?.file_url ?? s?.fileUrl ?? null;
      const url = rawUrl || buildDownloadUrlByName(file_name);

      const chunk_index = s?.chunk_index ?? s?.chunkIndex ?? null;
      const page = s?.page ?? null;
      const score = s?.score ?? null;

      const derived = !file_name && url ? nameFromUrl(url) : null;
      const display_name = (file_name || derived || file_id || "").toString().trim() || null;
      const download_name = (file_name || derived || display_name || "documento").toString().trim() || "documento";

      return { file_id, file_name, url, chunk_index, page, score, display_name, download_name };
    })
    .filter((x) => x.display_name || x.url);
};

const classifyError = (err) => {
  const msg = String(err?.message || "");
  const isNetwork = /Failed to fetch|NetworkError|ERR_NETWORK|fetch failed/i.test(msg);
  return { msg, isNetwork };
};

const createDefaultChat = () => ({
  id: Date.now(),
  name: "Nueva conversación",
  messages: [],
  createdAt: new Date(),
  active: true,
});

export function ChatProvider({ children }) {
  const savedData = loadFromSessionStorage();

  const [chats, setChats] = useState(
    savedData?.chats || [{ id: 1, name: "Nueva conversación", messages: [], createdAt: new Date(), active: true }]
  );
  const [activeChat, setActiveChat] = useState(savedData?.activeChat || 1);

  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const [flowPath, setFlowPath] = useState(null);
  const [flowOptions, setFlowOptions] = useState([]);
  const [flowTitle, setFlowTitle] = useState("Opciones guiadas");
  const [isFlowLoading, setIsFlowLoading] = useState(false);

  const [backendMode, setBackendMode] = useState("unknown");
  const offlineNoticeRef = useRef(false);

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

  useEffect(() => {
    let alive = true;

    const check = async () => {
      const ok = await pingBackend({ timeoutMs: 3500 });
      if (!alive) return;
      setBackendMode(ok ? "online" : "offline");
    };

    check();
    const id = setInterval(check, 25000);

    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  const stopStreaming = useCallback(() => {
    const controller = streamAbortRef.current;
    if (controller) {
      try {
        controller.abort();
      } catch {}
    }
  }, []);

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
            name: shouldRename ? message.content.slice(0, 30) + (message.content.length > 30 ? "..." : "") : chat.name,
          };
        })
      );
    },
    [activeChat]
  );

  const markOfflineOnce = useCallback(() => {
    setBackendMode("offline");
    if (offlineNoticeRef.current) return;
    offlineNoticeRef.current = true;

    addMessage({
      id: Date.now(),
      type: MESSAGE_TYPES.BOT,
      variant: "info",
      title: "Modo sin conexión",
      content:
        "Estoy teniendo problemas para conectar con el backend.\nMientras tanto, usaré respuestas de demostración para que el chat siga funcionando.",
      timestamp: new Date(),
    });
  }, [addMessage]);

  const markOnline = useCallback(() => {
    setBackendMode("online");
  }, []);

  const startMockRagStream = useCallback(
    ({ question, botId }) => {
      const tokens = [
        `Respuesta simulada para: "${question}". `,
        "Este es un ejemplo. ",
        "Cuando el backend esté disponible, la respuesta vendrá del RAG.",
      ];

      const meta = {
        payload: {
          sources: [
            { file_name: "mock_doc_practicas.pdf", chunk_index: 1, score: 0.6, file_id: "mock-1" },
            { file_name: "mock_doc_matricula.pdf", chunk_index: 2, score: 0.55, file_id: "mock-2" },
            { file_name: "mock_doc_general.pdf", chunk_index: 1, score: 0.52, file_id: "mock-3" },
          ],
        },
      };

      const sources = extractSources(meta);

      setIsTyping(true);

      setChats((prev) =>
        prev.map((chat) =>
          chat.id === activeChat
            ? { ...chat, messages: chat.messages.map((m) => (m.id === botId ? { ...m, sources } : m)) }
            : chat
        )
      );

      let i = 0;
      let full = "";

      const interval = setInterval(() => {
        if (i < tokens.length) {
          full += tokens[i];
          setChats((prev) =>
            prev.map((chat) =>
              chat.id === activeChat
                ? { ...chat, messages: chat.messages.map((m) => (m.id === botId ? { ...m, content: full } : m)) }
                : chat
            )
          );
          i++;
        } else {
          clearInterval(interval);
          setIsTyping(false);
          setChats((prev) =>
            prev.map((chat) =>
              chat.id === activeChat
                ? {
                    ...chat,
                    messages: chat.messages.map((m) => (m.id === botId ? { ...m, isStreaming: false, sources } : m)),
                  }
                : chat
            )
          );
        }
      }, 220);
    },
    [activeChat]
  );

  const prefillInput = useCallback(
    (text) => {
      stopStreaming();
      setFlowPath(null);
      setFlowOptions([]);
      setFlowTitle("Opciones guiadas");
      setIsFlowLoading(false);
      setInputValue(text || "");
      window.dispatchEvent(new Event("buhoFis:focus-input"));
    },
    [stopStreaming]
  );

  const deleteChat = useCallback(
    (chatId) => {
      stopStreaming();
      setChats((prev) => {
        const remaining = prev.filter((c) => c.id !== chatId);
        if (remaining.length === 0) {
          const fresh = createDefaultChat();
          setActiveChat(fresh.id);
          return [fresh];
        }

        if (chatId === activeChat) {
          const next = remaining[remaining.length - 1];
          setActiveChat(next.id);
          return remaining.map((c) => ({ ...c, active: c.id === next.id }));
        }

        return remaining;
      });

      setInputValue("");
      setFlowPath(null);
      setFlowOptions([]);
    },
    [activeChat, stopStreaming]
  );

  const clearAllChats = useCallback(() => {
    stopStreaming();
    const fresh = createDefaultChat();
    setChats([fresh]);
    setActiveChat(fresh.id);
    setInputValue("");
    setFlowPath(null);
    setFlowOptions([]);
    setFlowTitle("Opciones guiadas");
    setIsFlowLoading(false);
  }, [stopStreaming]);

  const startFlow = useCallback(async () => {
    setIsFlowLoading(true);
    setIsTyping(true);

    try {
      const root = await getNavigationRoot();
      markOnline();
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

      if (isNetwork) {
        markOfflineOnce();
        setFlowTitle("Opciones guiadas");
        setFlowOptions(FLOW_TREE.options || []);
        setFlowPath([]);

        addMessage({
          id: Date.now(),
          type: MESSAGE_TYPES.BOT,
          content: "Selecciona una opción para continuar.",
          timestamp: new Date(),
        });
      } else {
        addMessage({
          id: Date.now(),
          type: MESSAGE_TYPES.BOT,
          variant: "error",
          title: "Error del servidor",
          content: "El servidor respondió con error al cargar las opciones guiadas.",
          detail: msg || null,
          timestamp: new Date(),
        });
      }
    } finally {
      setIsFlowLoading(false);
      setIsTyping(false);
    }
  }, [addMessage, markOfflineOnce, markOnline]);

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

        let node;
        try {
          node = await getNavigationNext(newPath);
          markOnline();
        } catch (err) {
          const { isNetwork } = classifyError(err);
          if (!isNetwork) throw err;
          markOfflineOnce();
          node = resolveNodeByPath(newPath);
        }

        setFlowTitle(node.title || "Opciones guiadas");
        setFlowPath(newPath);

        if (node.type === "answer") {
          setFlowOptions([]);

          const rawFile = node?.file_name ?? node?.fileName ?? node?.file ?? node?.filename ?? null;
          const fileName = typeof rawFile === "string" ? rawFile.trim() : null;
          const hasFile = !!(fileName && fileName.length > 0);

          addMessage({
            id: Date.now() + 1,
            type: MESSAGE_TYPES.BOT,
            content: node.answer || "Listo.",
            timestamp: new Date(),
            fileName: hasFile ? fileName : null,
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
            ? "No pude conectarme al servidor para completar esa consulta.\nRevisa tu conexión o la URL del backend."
            : "El servidor respondió con error al completar esa consulta.",
          detail: msg || null,
          timestamp: new Date(),
        });
      } finally {
        setIsFlowLoading(false);
        setIsTyping(false);
      }
    },
    [addMessage, flowPath, isFlowLoading, markOfflineOnce, markOnline]
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
        try {
          const root = await getNavigationRoot();
          markOnline();
          setFlowTitle("Opciones guiadas");
          setFlowOptions(root.options || []);
          setFlowPath([]);
        } catch (err) {
          const { isNetwork } = classifyError(err);
          if (isNetwork) {
            markOfflineOnce();
            setFlowTitle("Opciones guiadas");
            setFlowOptions(FLOW_TREE.options || []);
            setFlowPath([]);
          } else {
            throw err;
          }
        }
        return;
      }

      let node;
      try {
        node = await getNavigationNext(newPath);
        markOnline();
      } catch (err) {
        const { isNetwork } = classifyError(err);
        if (!isNetwork) throw err;
        markOfflineOnce();
        node = resolveNodeByPath(newPath);
      }

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
          ? "No pude conectarme al servidor para volver atrás en el flujo.\nRevisa tu conexión o la URL del backend."
          : "El servidor respondió con error al volver atrás en el flujo.",
        detail: msg || null,
        timestamp: new Date(),
      });
    } finally {
      setIsFlowLoading(false);
      setIsTyping(false);
    }
  }, [flowPath, startFlow, addMessage, markOfflineOnce, markOnline]);

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

            const key = (s) => `${s.file_name || ""}::${s.url || ""}::${s.chunk_index || ""}::${s.page || ""}`;

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
                  ? { ...chat, messages: chat.messages.map((m) => (m.id === botId ? { ...m, sources: lastSources } : m)) }
                  : chat
              )
            );
          },
          onMessage: (fragment) => {
            fullAnswer += fragment;
            setChats((prev) =>
              prev.map((chat) =>
                chat.id === activeChat
                  ? { ...chat, messages: chat.messages.map((m) => (m.id === botId ? { ...m, content: fullAnswer } : m)) }
                  : chat
              )
            );
          },
          onDone: () => {
            streamAbortRef.current = null;
            streamingBotIdRef.current = null;

            const finalText = (fullAnswer || "").trimEnd();
            const ensured = finalText.length ? finalText : "No se recibió una respuesta del servidor.";

            setIsTyping(false);
            setChats((prev) =>
              prev.map((chat) =>
                chat.id === activeChat
                  ? {
                      ...chat,
                      messages: chat.messages.map((m) =>
                        m.id === botId ? { ...m, isStreaming: false, content: (m.content || "").trimEnd() || ensured, sources: lastSources } : m
                      ),
                    }
                  : chat
              )
            );
            markOnline();
          },
          onAbort: () => {
            streamAbortRef.current = null;
            const currentBotId = streamingBotIdRef.current;
            streamingBotIdRef.current = null;

            const finalText = (fullAnswer || "").trimEnd();

            setIsTyping(false);
            setChats((prev) =>
              prev.map((chat) =>
                chat.id === activeChat
                  ? {
                      ...chat,
                      messages: chat.messages.map((m) =>
                        m.id === currentBotId
                          ? { ...m, isStreaming: false, content: (m.content || finalText || "").trimEnd(), sources: lastSources }
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

            if (isNetwork) {
              markOfflineOnce();

              setChats((prev) =>
                prev.map((chat) =>
                  chat.id === activeChat
                    ? { ...chat, messages: chat.messages.map((m) => (m.id === botId ? { ...m, isStreaming: true, content: "" } : m)) }
                    : chat
                )
              );

              startMockRagStream({ question: content, botId });
              return;
            }

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
                              title: "Error del servidor",
                              content: "El servidor respondió con error.",
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
    [addMessage, activeChat, isTyping, flowPath, markOfflineOnce, markOnline, startMockRagStream]
  );

  const createNewChat = useCallback(() => {
    stopStreaming();
    const fresh = createDefaultChat();
    setChats((prev) => [...prev.map((c) => ({ ...c, active: false })), fresh]);
    setActiveChat(fresh.id);
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
        prefillInput,
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
        deleteChat,
        clearAllChats,
        backendMode,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  return useContext(ChatContext);
}
