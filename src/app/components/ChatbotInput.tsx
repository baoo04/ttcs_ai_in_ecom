"use client";
import { useState } from "react";

export default function ChatbotInput({
  onQuery,
}: {
  onQuery: (query: string, response: string) => void;
}) {
  const [input, setInput] = useState("");

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    const query = input.trim();
    if (!query) return;

    setInput("");

    const res = await fetch("/api/gpt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });

    const { result } = await res.json();
    onQuery(query, result);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mt-4 pt-10">
      <input
        className="flex-1 border p-2 text-stone-700 rounded-lg"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Nhập câu hỏi..."
      />
      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Gửi
      </button>
    </form>
  );
}
