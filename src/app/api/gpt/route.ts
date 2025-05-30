import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const dbConfig = {
  host: "localhost",
  user: "root",
  password: "baodang123",
  database: "inventory_db",
  port: 3306,
};

const SCHEMA_INFO = `
Database: inventory_db
Table: inventory_item
Columns:
- id (int): ID sản phẩm
- product_name (varchar): Tên sản phẩm
- initial_stock (int): Số lượng ban đầu
- delay_days (int): Số ngày delay
- remaining_quantity (int): Số lượng còn lại
- replenish_date (date): Ngày bổ sung hàng
- prediction (varchar): Dự báo tình hình
`;

function getQueryType(
  query: string
): "inventory_query" | "statistics" | "normal_query" {
  const queryLower = query.toLowerCase();

  // 🔍 LOG: In ra query gốc và query đã lowercase
  console.log("🔍 Original query:", query);
  console.log("🔍 Lowercase query:", queryLower);

  const inventoryKeywords = [
    "sản phẩm nào",
    "hiển thị sản phẩm",
    "tìm sản phẩm",
    "sản phẩm có",
    "danh sách sản phẩm",
    "thông tin sản phẩm",
    "chi tiết sản phẩm",
    "sắp hết hàng",
    "còn lại",
    "delay nhất",
    "tên sản phẩm",
    "id sản phẩm",
    "hiển thị tất cả",
    "show all",
    "tất cả sản phẩm",
    "list sản phẩm",
  ];

  const statisticsKeywords = [
    "thống kê",
    "báo cáo",
    "tổng số",
    "số lượng tổng",
    "trung bình",
    "tỷ lệ",
    "phần trăm",
    "biểu đồ",
    "phân tích",
    "xu hướng",
    "so sánh",
    "tổng cộng",
    "tổng hợp",
    "đếm số",
    "count",
    "sum",
    "avg",
    "average",
    "statistics",
    "report",
    "analysis",
    "chart",
    "graph",
  ];

  // 🔍 LOG: Kiểm tra từng loại keyword
  const matchedStatistics = statisticsKeywords.filter((keyword) =>
    queryLower.includes(keyword)
  );
  const matchedInventory = inventoryKeywords.filter((keyword) =>
    queryLower.includes(keyword)
  );

  console.log("📊 Matched Statistics Keywords:", matchedStatistics);
  console.log("📦 Matched Inventory Keywords:", matchedInventory);

  if (matchedStatistics.length > 0) {
    console.log("✅ Classified as: STATISTICS");
    return "statistics";
  }

  if (matchedInventory.length > 0) {
    console.log("✅ Classified as: INVENTORY_QUERY");
    return "inventory_query";
  }

  const generalInventoryKeywords = [
    "hàng tồn kho",
    "inventory",
    "kho",
    "stock",
    "tồn kho",
    "hàng hóa",
    "bổ sung",
    "replenish",
    "dự báo",
    "prediction",
    "hết hàng",
  ];

  const matchedGeneral = generalInventoryKeywords.filter((keyword) =>
    queryLower.includes(keyword)
  );
  console.log("🏪 Matched General Inventory Keywords:", matchedGeneral);

  if (matchedGeneral.length > 0) {
    console.log("✅ Classified as: INVENTORY_QUERY (General)");
    return "inventory_query";
  }

  console.log("✅ Classified as: NORMAL_QUERY (Default)");
  return "normal_query";
}

export async function POST(req: NextRequest) {
  let connection;

  try {
    const body = await req.json();
    const { query } = body;

    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { result: "Truy vấn không hợp lệ." },
        { status: 400 }
      );
    }

    console.log("\n" + "=".repeat(50));
    console.log("🚀 NEW REQUEST RECEIVED");
    console.log("=".repeat(50));

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const queryType = getQueryType(query);

    console.log("🎯 FINAL QUERY TYPE:", queryType);
    console.log("=".repeat(50) + "\n");

    if (queryType === "inventory_query" || queryType === "statistics") {
      try {
        console.log("💾 Attempting database connection...");
        connection = await mysql.createConnection(dbConfig);
        console.log("✅ Database connected successfully");

        let sqlPrompt = "";

        if (queryType === "statistics") {
          console.log("📊 Processing STATISTICS query");
          sqlPrompt = `
          Bạn là một chuyên gia SQL cho phân tích thống kê. Dựa trên schema database sau và câu hỏi thống kê của người dùng, hãy tạo ra câu truy vấn SQL phù hợp.

          ${SCHEMA_INFO}

          Câu hỏi thống kê: "${query}"

          Yêu cầu:
          1. Chỉ trả về câu SQL query, không có text giải thích khác
          2. Sử dụng các hàm tổng hợp như COUNT, SUM, AVG, MAX, MIN
          3. Sử dụng GROUP BY khi cần thiết để phân nhóm dữ liệu
          4. Có thể sử dụng HAVING để lọc kết quả sau GROUP BY
          5. Đảm bảo syntax MySQL chính xác
          6. Không sử dụng DROP, DELETE, UPDATE - chỉ SELECT
          7. Nếu câu hỏi không thể tạo SQL, trả về: "NO_SQL_NEEDED"

          Ví dụ thống kê:
          - "Tổng số sản phẩm" → "SELECT COUNT(*) as total_products FROM inventory_item"
          - "Trung bình số lượng còn lại" → "SELECT AVG(remaining_quantity) as avg_remaining FROM inventory_item"
          - "Tổng số lượng hàng tồn kho" → "SELECT SUM(remaining_quantity) as total_stock FROM inventory_item"
          - "Số sản phẩm theo từng mức delay" → "SELECT delay_days, COUNT(*) as product_count FROM inventory_item GROUP BY delay_days"
          `;
        } else {
          console.log("📦 Processing INVENTORY_QUERY");
          sqlPrompt = `
          Bạn là một chuyên gia SQL. Dựa trên schema database sau và câu hỏi của người dùng, hãy tạo ra câu truy vấn SQL phù hợp.

          ${SCHEMA_INFO}

          Câu hỏi của người dùng: "${query}"

          Yêu cầu:
          1. Chỉ trả về câu SQL query, không có text giải thích khác
          2. Sử dụng SELECT statement phù hợp
          3. Nếu cần, sử dụng WHERE, ORDER BY, GROUP BY, LIMIT
          4. Đảm bảo syntax MySQL chính xác
          5. Không sử dụng DROP, DELETE, UPDATE - chỉ SELECT
          6. Nếu câu hỏi không thể tạo SQL, trả về: "NO_SQL_NEEDED"

          Ví dụ:
          - "Hiển thị tất cả sản phẩm" → "SELECT * FROM inventory_item"
          - "Sản phẩm nào sắp hết hàng?" → "SELECT * FROM inventory_item WHERE remaining_quantity < 30"
          - "Sản phẩm nào delay nhất?" → "SELECT * FROM inventory_item ORDER BY delay_days DESC LIMIT 1"
          `;
        }

        console.log("🤖 Generating SQL with Gemini...");
        const sqlResult = await model.generateContent(sqlPrompt);
        const sqlResponse = await sqlResult.response;
        const sqlQuery = sqlResponse
          .text()
          .trim()
          .replace(/```sql|```/g, "");

        console.log("🔍 Generated SQL:", sqlQuery);

        if (
          sqlQuery === "NO_SQL_NEEDED" ||
          !sqlQuery.toUpperCase().startsWith("SELECT")
        ) {
          console.log(
            "⚠️ SQL not needed or invalid, falling back to normal query"
          );
          const normalResult = await model.generateContent(query);
          const normalResponse = await normalResult.response;
          return NextResponse.json({
            result: normalResponse.text(),
            type: "normal_query",
          });
        }

        console.log("🔍 Executing SQL query...");
        const [rows] = await connection.execute(sqlQuery);
        console.log(
          "✅ SQL executed successfully, rows returned:",
          Array.isArray(rows) ? rows.length : "Unknown"
        );

        let analysisPrompt = "";

        if (queryType === "statistics") {
          analysisPrompt = `
          Dựa trên câu hỏi thống kê: "${query}"
          Kết quả thống kê từ database: ${JSON.stringify(rows)}

          Hãy tạo một báo cáo thống kê chi tiết bằng tiếng Việt để trả lời câu hỏi của người dùng.
          Bao gồm:
          1. Tóm tắt kết quả thống kê chính
          2. Phân tích và giải thích ý nghĩa của các con số
          3. So sánh hoặc đánh giá xu hướng nếu có
          4. Đưa ra nhận xét hoặc khuyến nghị dựa trên dữ liệu
          5. Sử dụng format dễ đọc với số liệu cụ thể và biểu tượng

          Không bao gồm SQL query trong phản hồi.
          `;
        } else {
          analysisPrompt = `
          Dựa trên câu hỏi: "${query}"
          Kết quả từ database: ${JSON.stringify(rows)}

          Hãy tạo một phản hồi thân thiện và chi tiết bằng tiếng Việt để trả lời câu hỏi của người dùng. 
          Bao gồm:
          1. Trả lời trực tiếp câu hỏi
          2. Tóm tắt các thông tin quan trọng từ kết quả
          3. Đưa ra nhận xét hoặc khuyến nghị nếu cần
          4. Sử dụng format dễ đọc với bullet points hoặc số liệu cụ thể

          Không bao gồm SQL query trong phản hồi.
          `;
        }

        console.log("🤖 Generating analysis with Gemini...");
        const analysisResult = await model.generateContent(analysisPrompt);
        const analysisResponse = await analysisResult.response;

        console.log("✅ Analysis generated successfully");
        console.log("📤 Returning response with type:", queryType);

        return NextResponse.json({
          result: analysisResponse.text(),
          data: rows,
          type: queryType,
        });
      } catch (dbError: any) {
        console.error("❌ Database Error:", dbError);
        const fallbackResult = await model.generateContent(`
        Câu hỏi: ${query}
        
        Có vẻ như bạn đang hỏi về hàng tồn kho nhưng tôi không thể truy cập database lúc này. 
        Hãy trả lời một cách thân thiện và hướng dẫn người dùng kiểm tra lại kết nối database.
        `);
        const fallbackResponse = await fallbackResult.response;

        return NextResponse.json({
          result:
            fallbackResponse.text() +
            "\n\n⚠️ Lưu ý: Không thể kết nối database để lấy thông tin chi tiết.",
          type: "normal_query",
        });
      }
    } else {
      // Handle normal queries
      console.log("💬 Processing NORMAL_QUERY");
      const chatPrompt = `
      Bạn là một trợ lý AI thân thiện và hữu ích. Hãy trả lời câu hỏi sau một cách tự nhiên và thân thiện bằng tiếng Việt:
      "${query}"

      Lưu ý: 
      - Nếu người dùng chào hỏi, hãy chào lại một cách thân thiện
      - Nếu hỏi về khả năng của bạn, hãy giải thích bạn có thể chat thông thường, truy vấn hàng tồn kho và tạo báo cáo thống kê
      - Trả lời ngắn gọn và tự nhiên
      `;

      const chatResult = await model.generateContent(chatPrompt);
      const chatResponse = await chatResult.response;

      console.log("✅ Normal chat response generated");
      console.log("📤 Returning response with type: normal_query");

      return NextResponse.json({
        result: chatResponse.text(),
        type: "normal_query",
      });
    }
  } catch (error: any) {
    console.error("❌ Gemini API Error:", error);

    if (error?.message?.includes("404")) {
      return NextResponse.json(
        { result: "Model không tồn tại. Vui lòng kiểm tra tên model." },
        { status: 404 }
      );
    }

    if (error?.message?.includes("API_KEY")) {
      return NextResponse.json(
        { result: "API key không hợp lệ hoặc bị thiếu." },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { result: `Lỗi: ${error?.message || "Không xác định"}` },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
