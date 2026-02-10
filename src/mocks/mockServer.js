// src/mocks/mockServer.js
import { FLOW_TREE, resolveNodeByPath } from "./mockApiData";

function jsonResponse(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function sseResponseSynthethic({ question }) {
  // Simula SSE: message/metadata/done
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const tokens = [
        `Respuesta simulada para: "${question}". `,
        "Este es un ejemplo. ",
        "La respuesta vendrá del RAG cuando se haya establecido conexión con Backend.",
      ];

      // metadata fake
      const meta = {
        payload: {
          sources: [
            "documento_ejemplo1.pdf",
            "documento_ejemplo2.pdf",
          ],
        },
      };

      // Enviar metadata
      controller.enqueue(
        encoder.encode(
          `event: metadata\ndata: ${JSON.stringify(meta)}\n\n`
        )
      );

      let i = 0;
      const interval = setInterval(() => {
        if (i < tokens.length) {
          controller.enqueue(
            encoder.encode(`event: message\ndata: ${tokens[i]}\n\n`)
          );
          i++;
        } else {
          clearInterval(interval);
          controller.enqueue(encoder.encode(`event: done\ndata: [DONE]\n\n`));
          controller.close();
        }
      }, 250);
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

export function enableMockApi() {
  const originalFetch = window.fetch;

  window.fetch = async (url, options = {}) => {
    const u = typeof url === "string" ? url : url.url;
    const method = (options.method || "GET").toUpperCase();

    // Solo activamos mock si VITE_USE_MOCK_API=true
    if (import.meta.env.VITE_USE_MOCK_API !== "true") {
      return originalFetch(url, options);
    }

    // -------------------------
    // GET /navigation
    // -------------------------
    if (u.includes("/navigation") && method === "GET") {
      return jsonResponse({
        level: 0,
        options: FLOW_TREE.options,
      });
    }

    // -------------------------
    // POST /navigation/next
    // Body: { path: [...] }
    // -------------------------
    if (u.includes("/navigation/next") && method === "POST") {
      try {
        const body = options.body ? JSON.parse(options.body) : {};
        const path = Array.isArray(body.path) ? body.path : [];
        const node = resolveNodeByPath(path);
        return jsonResponse(node);
      } catch (e) {
        return jsonResponse({ error: "Bad request (mock)" }, 400);
      }
    }

    // -------------------------
    // POST /rag/ask  (no streaming)
    // Body: { question, optimize_query }
    // -------------------------
    if (u.endsWith("/rag/ask") && method === "POST") {
      try {
        const body = options.body ? JSON.parse(options.body) : {};
        const q = body.question || "Pregunta";
        return jsonResponse({
          answer: `Respuesta simulada (no streaming) para: "${q}"`,
          sources: ["mock_source_1.pdf", "mock_source_2.pdf"],
        });
      } catch (e) {
        return jsonResponse({ error: "Bad request (mock)" }, 400);
      }
    }

    // -------------------------
    // POST /rag/stream (SSE)
    // -------------------------
    if (u.endsWith("/rag/stream") && method === "POST") {
      try {
        const body = options.body ? JSON.parse(options.body) : {};
        const question = body.question || "Pregunta";
        return sseResponseSynthethic({ question });
      } catch (e) {
        return jsonResponse({ error: "Bad request (mock)" }, 400);
      }
    }

    // Si no coincide nada → fetch real
    return originalFetch(url, options);
  };
}
