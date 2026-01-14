import { apiFetch } from "./apiClient";

export async function askRagStream(question, callbacks = {}, optimize_query = true, signal) {
  const { onMessage, onMetadata, onDone, onError, onAbort } = callbacks;

  try {
    const res = await apiFetch("/rag/stream", {
      method: "POST",
      body: { question, optimize_query },
      headers: { Accept: "text/event-stream" },
      signal,
    });

    if (!res.body) throw new Error("Respuesta sin body (stream no soportado).");

    const reader = res.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      const chunks = buffer.split(/\r?\n\r?\n/);
      buffer = chunks.pop() || "";

      for (const chunk of chunks) {
        const lines = chunk.split(/\r?\n/);

        let event = "message";
        let data = "";

        for (const line of lines) {
          if (line.startsWith("event:")) {
            event = line.slice("event:".length).trim() || "message";
          } else if (line.startsWith("data:")) {
            const part = line.replace(/^data:\s?/, "");
            data += part + "\n";
          }
        }

        if (data.endsWith("\n")) data = data.slice(0, -1);

        if (data === "[DONE]") {
          onDone?.();
          return;
        }

        if (event === "message") onMessage?.(data);
        else if (event === "metadata") {
          let meta = data;
          try {
            meta = JSON.parse(data);
          } catch {}
          onMetadata?.(meta);
        } else if (event === "done") {
          onDone?.();
          return;
        }
      }
    }

    onDone?.();
  } catch (err) {
    if (err?.name === "AbortError") {
      onAbort?.();
      return;
    }
    onError?.(err);
  }
}

