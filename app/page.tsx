// page.tsx

"use client";
import { useState } from "react";

export default function Home() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");

  async function sendMessage() {
    if (!input) return;

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: input }),
    });

    const data = await res.json();

    setMessages(prev => [
      ...prev,
      { role: "user", content: input },
      { role: "assistant", content: data.answer }
    ]);

    setInput("");
  }

  return (
    <div className="p-10 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">MCP CHATBOT for WIKIPEDIA & NEWS-SEARCH</h1>
      <h1 className="text-xl mb-4">Tell me how can I help you today?</h1>

      <div className="space-y-4 mb-4">
        {messages.map((msg, index) => (
          <div key={index} className={msg.role === "user" ? "text-right" : ""}>
            <div className="inline-block bg-gray-200 p-3 rounded-xl text-black">
              {msg.content}
            </div>
          </div>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-black border-t p-3">
  <div className="flex gap-2 max-w-3xl mx-auto">
    <input
      className="border p-2 flex-1 rounded"
      value={input}
      onChange={(e) => setInput(e.target.value)}
      placeholder="Ask something..."
    />
    <button
      onClick={sendMessage}
      className="bg-blue-500 text-white px-4 rounded"
    >
      Send
    </button>
  </div>
</div>
    </div>
  );
}