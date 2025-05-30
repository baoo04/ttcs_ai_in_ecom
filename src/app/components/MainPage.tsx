/* eslint-disable react/no-unescaped-entities */
"use client";
import { useState } from "react";
import InventoryTable from "@/app/components/InventoryTable";
import ChatbotInput from "@/app/components/ChatbotInput";
import InventoryChart from "@/app/components/InventoryChart";
import { FaUser, FaRobot } from "react-icons/fa";

type InventoryItem = {
  id: number;
  product_name: string;
  initial_stock: number;
  delay_days: number;
  remaining_quantity: number;
  replenish_date: string;
  prediction: string;
};

type ApiResponse = {
  result: string;
  data?: InventoryItem[];
  type: "normal_query" | "inventory_query" | "statistics";
  sql?: string;
};

// Typing Indicator Component
const TypingIndicator = () => {
  return (
    <div className="flex items-center space-x-1 p-3 bg-gray-100 rounded-lg w-fit max-w-[80%] self-start mr-auto">
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white">
          <FaRobot size={16} />
        </div>
        <div className="flex space-x-1">
          <div
            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: "0ms" }}
          ></div>
          <div
            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: "150ms" }}
          ></div>
          <div
            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: "300ms" }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default function MainPage() {
  const [messages, setMessages] = useState<
    { role: string; text: string; data?: InventoryItem[]; type?: string }[]
  >([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [showTable, setShowTable] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const [chartType, setChartType] = useState<"bar" | "line" | "pie">("bar");
  const [isTyping, setIsTyping] = useState(false);

  const handleUserQuery = async (query: string) => {
    setMessages((prev) => [...prev, { role: "user", text: query }]);

    setIsTyping(true);

    try {
      const res = await fetch("/api/gpt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      const response: ApiResponse = await res.json();

      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: response.result,
          data: response.data,
          type: response.type,
        },
      ]);

      if (
        response.type === "inventory_query" ||
        response.type === "statistics"
      ) {
        if (response.data && response.data.length > 0) {
          setInventory(response.data);
          setShowTable(true);

          if (response.type === "statistics") {
            setShowChart(true);

            const queryLower = query.toLowerCase();
            if (
              queryLower.includes("pie") ||
              queryLower.includes("tròn") ||
              queryLower.includes("phần trăm") ||
              queryLower.includes("tỷ lệ")
            ) {
              setChartType("pie");
            } else if (
              queryLower.includes("line") ||
              queryLower.includes("đường") ||
              queryLower.includes("xu hướng") ||
              queryLower.includes("theo thời gian")
            ) {
              setChartType("line");
            } else {
              setChartType("bar");
            }
          } else {
            const chartKeywords = [
              "biểu đồ",
              "chart",
              "đồ thị",
              "visual",
              "hiển thị",
              "phân tích",
            ];
            const shouldShowChart = chartKeywords.some((keyword) =>
              query.toLowerCase().includes(keyword)
            );

            if (shouldShowChart) {
              setShowChart(true);
            } else {
              setShowChart(false);
            }
          }
        } else {
          setShowTable(false);
          setShowChart(false);
        }
      } else {
        setShowTable(false);
        setShowChart(false);
      }
    } catch (error) {
      console.error("Error calling API:", error);
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: "Xin lỗi, đã có lỗi xảy ra khi xử lý yêu cầu của bạn.",
          type: "error",
        },
      ]);
    }
  };

  const getChartData = () => {
    if (!inventory.length) return [];

    switch (chartType) {
      case "bar":
        return inventory.map((item) => ({
          name:
            item.product_name.length > 15
              ? item.product_name.substring(0, 15) + "..."
              : item.product_name,
          value: item.remaining_quantity,
          delay: item.delay_days,
          initial: item.initial_stock,
        }));

      case "pie":
        return inventory.map((item) => ({
          name:
            item.product_name.length > 20
              ? item.product_name.substring(0, 20) + "..."
              : item.product_name,
          value: item.remaining_quantity,
        }));

      case "line":
        return inventory.map((item, index) => ({
          name: `SP${index + 1}`,
          fullName: item.product_name,
          remaining: item.remaining_quantity,
          initial: item.initial_stock,
          delay: item.delay_days,
        }));

      default:
        return [];
    }
  };

  const getTypeDisplayInfo = (type: string) => {
    switch (type) {
      case "inventory_query":
        return {
          label: "📋 Truy vấn kho",
          color: "bg-green-100 text-green-700",
        };
      case "statistics":
        return { label: "📊 Thống kê", color: "bg-purple-100 text-purple-700" };
      case "normal_query":
        return { label: "💬 Chat", color: "bg-blue-100 text-blue-700" };
      default:
        return { label: "⚠️ Lỗi", color: "bg-red-100 text-red-700" };
    }
  };

  return (
    <div className="w-full p-20 mx-auto bg-gray-50">
      <div className="bg-blue-500 text-white py-10 shadow-lg rounded-t-lg">
        <h1 className="text-2xl font-bold text-center">
          Chatbot Quản Lý Hàng Tồn Kho
        </h1>
        <p className="text-center mt-2 text-blue-100">
          Hỏi về sản phẩm, tồn kho, thống kê hoặc chat thông thường
        </p>
      </div>

      <div className="w-full mx-auto">
        <div className="bg-white rounded-b-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="space-y-3 max-h-[400px] overflow-y-auto mb-10 flex flex-col gap-6">
            {messages.map((msg, i) => (
              <div key={i}>
                <div
                  className={`flex items-start space-x-3 ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.role === "bot" && (
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white flex-shrink-0">
                      <FaRobot size={16} />
                    </div>
                  )}

                  <div
                    className={`p-3 rounded-lg max-w-[80%] ${
                      msg.role === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.text}</div>
                    {msg.role === "bot" && msg.type && (
                      <div className="mt-2">
                        <span
                          className={`inline-block px-2 py-1 text-xs rounded-full ${
                            getTypeDisplayInfo(msg.type).color
                          }`}
                        >
                          {getTypeDisplayInfo(msg.type).label}
                        </span>
                        {msg.data && msg.data.length > 0 && (
                          <span className="ml-2 text-xs text-gray-500">
                            ({msg.data.length} bản ghi)
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {msg.role === "user" && (
                    <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center text-white flex-shrink-0">
                      <FaUser size={16} />
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-start space-x-3 justify-start">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white flex-shrink-0">
                  <FaRobot size={16} />
                </div>
                <div className="p-3 bg-gray-100 rounded-lg max-w-[80%]">
                  <div className="flex space-x-1">
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {showTable && inventory.length > 0 && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-semibold text-gray-800">
                  📦 Dữ liệu tồn kho ({inventory.length} sản phẩm)
                </h2>

                <div className="flex gap-2">
                  <button
                    onClick={() => setShowChart(!showChart)}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      showChart
                        ? "bg-blue-500 text-white hover:bg-blue-600"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {showChart ? "Ẩn biểu đồ" : "Hiện biểu đồ"}
                  </button>

                  {showChart && (
                    <div className="flex gap-1">
                      {(["bar", "line", "pie"] as const).map((type) => (
                        <button
                          key={type}
                          onClick={() => setChartType(type)}
                          className={`px-2 py-1 rounded text-xs transition-colors ${
                            chartType === type
                              ? "bg-green-500 text-white"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                          title={
                            type === "bar"
                              ? "Biểu đồ cột"
                              : type === "line"
                              ? "Biểu đồ đường"
                              : "Biểu đồ tròn"
                          }
                        >
                          {type === "bar"
                            ? "📊"
                            : type === "line"
                            ? "📈"
                            : "🥧"}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <InventoryTable data={inventory} />
            </div>
          )}

          {showChart && inventory.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                📈 Biểu đồ thống kê ({chartType.toUpperCase()})
              </h3>
              <InventoryChart
                data={getChartData()}
                type={chartType}
                title={`Thống kê hàng tồn kho - ${
                  chartType === "bar"
                    ? "Cột"
                    : chartType === "line"
                    ? "Đường"
                    : "Tròn"
                }`}
              />
            </div>
          )}

          <ChatbotInput onQuery={handleUserQuery} />

          <div className="mt-4 pt-10 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">
              💡 <strong>Gợi ý câu hỏi:</strong>
            </p>
            <div className="grid grid-cols-2 gap-3 text-xs text-gray-500">
              <div className="p-2 bg-white rounded border-l-2 border-green-300">
                <strong className="text-green-700">📋 Truy vấn kho:</strong>
                <br />
                "sản phẩm sắp hết hàng", "hiển thị tất cả sản phẩm", "sản phẩm
                delay nhất"
              </div>
              <div className="p-2 bg-white rounded border-l-2 border-purple-300">
                <strong className="text-purple-700">📊 Thống kê:</strong>
                <br />
                "thống kê tổng số sản phẩm", "trung bình số lượng còn lại", "báo
                cáo delay"
              </div>
              <div className="p-2 bg-white rounded border-l-2 border-blue-300">
                <strong className="text-blue-700">💬 Chat thường:</strong>
                <br />
                "xin chào", "bạn có thể làm gì?", "hướng dẫn sử dụng"
              </div>
              <div className="p-2 bg-white rounded border-l-2 border-orange-300">
                <strong className="text-orange-700">📈 Biểu đồ:</strong>
                <br />
                "biểu đồ tròn tồn kho", "biểu đồ đường xu hướng", "phân tích
                bằng chart"
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
