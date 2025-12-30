import { apiFetch } from "./apiClient";


export async function askRagStream(question, callbacks = {}, optimize_query = true) {
  const { onMessage, onMetadata, onDone, onError } = callbacks;

  try {
    const res = await apiFetch("/rag/stream", {
      method: "POST",
      body: { question, optimize_query },
      headers: { Accept: "text/event-stream" },
    });

    const reader = res.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      const events = buffer.split("\n\n");
      buffer = events.pop() || "";

      for (const evt of events) {
        const lines = evt.split("\n").map((l) => l.trim());
        const eventLine = lines.find((l) => l.startsWith("event:"));
        const dataLines = lines.filter((l) => l.startsWith("data:"));

        const event = eventLine?.replace("event:", "").trim();
        const dataRaw = dataLines.map(l => l.replace("data:", "").trim()).join("\n");

        if (!event) continue;

        if (event === "message") {
          onMessage?.(dataRaw || "");
        } else if (event === "metadata") {
          let meta = dataRaw;
          try { meta = JSON.parse(dataRaw); } catch {}
          onMetadata?.(meta);
        } else if (event === "done") {
          onDone?.();
          return;
        }
      }
    }

    onDone?.();
  } catch (err) {
    onError?.(err);
  }
}
