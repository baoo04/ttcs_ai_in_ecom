"use client";
import { useState } from "react";
import InventoryTable from "@/app/components/InventoryTable";
import ChatbotInput from "@/app/components/ChatbotInput";

type InventoryItem = {
  id: number;
  product_name: string;
  initial_stock: number;
  delay_days: number;
  remaining_quantity: number;
  replenish_date: string;
  prediction: string;
};

export default function MainPage() {
  const [messages, setMessages] = useState<{ role: string; text: string }[]>(
    []
  );
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [showTable, setShowTable] = useState(false);

  const handleUserQuery = async (query: string, response: string) => {
    setMessages((prev) => [...prev, { role: "user", text: query }]);
    setMessages((prev) => [...prev, { role: "bot", text: response }]);
    const keywords = ["dự báo", "tồn kho", "hàng tồn", "số lượng"];
    const match = keywords.some((kw) => query.toLowerCase().includes(kw));

    if (match) {
      const res = await fetch("/api/inventory");
      const data = await res.json();
      setInventory(data.items);
      setShowTable(true);
    }
  };

  return (
    <div className="w-full p-20 mx-auto bg-gray-50">
      <div className="bg-blue-500 text-white py-10 shadow-lg rounded-t-lg">
        <h1 className="text-2xl font-bold text-center">Chatbot Quản Lý</h1>
      </div>

      <div className="w-full mx-auto">
        <div className="bg-white rounded-b-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="space-y-3 max-h-[400px] overflow-y-auto mb-10 flex flex-col">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`p-2 rounded w-fit ${
                  msg.role === "user"
                    ? "bg-blue-600 self-end text-right"
                    : "bg-gray-500 text-left self-start"
                }`}
              >
                {msg.text}
              </div>
            ))}
          </div>

          {showTable && (
            <div className="mb-4">
              <h2 className="font-semibold mb-2">📦 Dữ liệu tồn kho:</h2>
              <InventoryTable data={inventory} />
            </div>
          )}

          <ChatbotInput onQuery={handleUserQuery} />
        </div>
      </div>
    </div>
  );
}
