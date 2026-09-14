import connectDb from "@/lib/db";
import Settings from "@/model/settings.model";
import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: corsHeaders,
    });
}

export async function POST(req: NextRequest) {
    try {
        const { message, ownerId } = await req.json();

        console.log("Chat request received:", { ownerId, message });

        if (!message || !ownerId) {
            return NextResponse.json(
                { message: "message and owner id are required" },
                { status: 400, headers: corsHeaders } // ✅ CORS headers included
            );
        }

        await connectDb();

        const setting = await Settings.findOne({ ownerId });
        if (!setting) {
            console.warn(`No settings found in DB for ownerId: "${ownerId}"`);
            return NextResponse.json(
                { message: "Chat bot is not configured yet for this owner ID." },
                { status: 400, headers: corsHeaders } // ✅ CORS headers included
            );
        }

        const KNOWLEDGE = `
business name - ${setting.businessName || "not provided"}
supportEmail - ${setting.supportEmail || "not provided"}
knowledge - ${setting.knowledge || "not provided"}
`;

        const prompt = `
You are a professional customer support assistant for this business.

Use ONLY the information provided below to answer the customer's question.
You may rephrase, summarize, or interpret the information if needed.
Do NOT invent new policies, prices, or promises.

--------------------
BUSINESS INFORMATION
--------------------
${KNOWLEDGE}

--------------------
CUSTOMER QUESTION
--------------------
${message}

--------------------
ANSWER
--------------------
`;

        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const res = await ai.models.generateContent({
            model: "gemini-3.6-flash",
            contents: prompt,
        });

        return NextResponse.json(
            { reply: res.text },
            { status: 200, headers: corsHeaders }
        );
    } catch (error: any) {
        console.error("API error:", error);
        return NextResponse.json(
            { message: `Chat error: ${error?.message || error}` },
            { status: 500, headers: corsHeaders }
        );
    }
}