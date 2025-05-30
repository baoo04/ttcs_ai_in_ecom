import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import mysql from "mysql2/promise";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query } = body;

    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { result: "Truy vấn không hợp lệ." },
        { status: 400 }
      );
    }

    const db = await mysql.createConnection({
      host: "localhost",
      port: 3306,
      user: "root",
      password: "baodang123", 
      database: "inventory_db",
    });


    const sqlPrompt = `Bạn là một trợ lý viết SQL. Câu hỏi: "${query}"
    Trả về một truy vấn SQL phù hợp để lấy dữ liệu từ cơ sở dữ liệu MySQL (không giải thích).
    `;

    const sqlResponse = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: sqlPrompt }],
    });

    const sqlContent = sqlResponse?.choices[0]?.message?.content;
    const sql = sqlContent ? sqlContent.trim() : "";

    console.log("💡 GPT Generated SQL:", sql);

    if (!sql || !sql.toLowerCase().includes("select")) {
      return NextResponse.json(
        { result: "Câu truy vấn không hợp lệ hoặc không an toàn." },
        { status: 400 }
      );
    }

    const [rows] = await db.execute(sql);
    console.log("Query Result:", rows);

    const explainPrompt = `
    Câu hỏi bạn: "${query}"
    Dữ liệu kết quả: ${JSON.stringify(rows, null, 2)}

    Viết câu trả lời ngắn gọn, dễ hiểu, bằng tiếng Việt dựa trên dữ liệu này.
    `;

    const explanation = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: explainPrompt }],
    });

    const messageContent = explanation.choices[0]?.message?.content;
    const result = messageContent ? messageContent.trim() : "";

    return NextResponse.json({ result });
  } catch (error: any) {
    console.error("❌ Đã xảy ra lỗi:", error);

    if (error.response) {
      console.error("📡 OpenAI API Error Response:", error.response.status);
      console.error(error.response.data);
    }

    if (error instanceof Error) {
      return NextResponse.json(
        {
          result: `Lỗi: ${error.message}`,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { result: "Đã xảy ra lỗi không xác định." },
      { status: 500 }
    );
  }
}
