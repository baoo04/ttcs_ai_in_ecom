"use client";
import { useState } from "react";
import { IoSend } from "react-icons/io5";
import { VscLoading } from "react-icons/vsc";

type ChatbotInputProps = {
  onQuery: (query: string) => void;
};

export default function ChatbotInput({ onQuery }: ChatbotInputProps) {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim() || isLoading) return;

    const query = input.trim();
    setInput("");
    setIsLoading(true);

    try {
      onQuery(query);
    } finally {
      setIsLoading(false);
    }
  };

  const quickQuestions = [
    "Sản phẩm nào sắp hết hàng?",
    "Hiển thị tất cả sản phẩm",
    "Sắp xếp theo delay giảm dần",
    "Biểu đồ thống kê tồn kho",
    "Hello, bạn khỏe không?",
  ];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 pt-10 pb-4">
        {quickQuestions.map((question, index) => (
          <button
            key={index}
            onClick={() => {
              if (!isLoading) {
                setInput(question);
              }
            }}
            className="cursor-pointer px-3 py-1 text-xs bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors"
            disabled={isLoading}
          >
            {question}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Hỏi về hàng tồn kho hoặc chat thông thường..."
          className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? <VscLoading /> : <IoSend />}
        </button>
      </form>
    </div>
  );
}
