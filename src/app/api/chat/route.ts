import { streamText } from "ai";
import { openai as AIModel } from "@ai-sdk/openai";
import { getContext } from "@/lib/context";
import { db } from "@/lib/db";
import { chats, messages as _messages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";

export const runtime = "nodejs";

const model = AIModel("gpt-3.5-turbo");

export async function POST(req: NextRequest) {
  try {
    console.log("=== Chat API Called ===");
    console.log("Method:", req.method);
    console.log("Headers:", Object.fromEntries(req.headers.entries()));
    
    const body = await req.json();
    console.log("Request body:", JSON.stringify(body, null, 2));
    const { messages, chatId } = body;

    if (!messages || !chatId) {
      console.log("Missing required fields:", { 
        hasMessages: !!messages, 
        hasChatId: !!chatId,
        bodyKeys: Object.keys(body)
      });
      return Response.json({ error: "Missing messages or chatId" }, { status: 400 });
    }

    console.log("Processing chat for chatId:", chatId);
    console.log("Messages count:", messages.length);

    const _chats = await db.select().from(chats).where(eq(chats.id, chatId));
    if (_chats.length !== 1) {
      console.log("Chat not found for ID:", chatId);
      return Response.json({ error: "Chat not found" }, { status: 404 });
    }

    const fileKey = _chats[0].fileKey;
    const lastMessage = messages[messages.length - 1];

    if (!lastMessage?.content) {
      console.log("Invalid last message:", lastMessage);
      return Response.json({ error: "Invalid input" }, { status: 400 });
    }

    console.log("Getting context for:", lastMessage.content.substring(0, 100));
    const context = await getContext(lastMessage.content, fileKey);

    const systemPrompt = {
      role: "system",
      content: `AI assistant is a brand new, powerful, human-like artificial intelligence.
                The traits of AI include expert knowledge, helpfulness, cleverness, and articulateness.
                AI is a well-behaved and well-mannered individual.
                AI is always friendly, kind, and inspiring, and he is eager to provide vivid and thoughtful responses to the user.
                AI has the sum of all knowledge in their brain, and is able to accurately answer nearly any question about any topic in conversation.
                AI assistant is a big fan of Pinecone and Vercel.
                START CONTEXT BLOCK
                ${context}
                END OF CONTEXT BLOCK
                AI assistant will take into account any CONTEXT BLOCK that is provided in a conversation.
                If the context does not provide the answer to question, the AI assistant will say, "I'm sorry, but I don't know the answer to that question".
                AI assistant will not apologize for previous responses, but instead will indicate new information was gained.
                AI assistant will not invent anything that is not drawn directly from the context.`,
    };

    // Save user message
    console.log("Saving user message to database");
    await db.insert(_messages).values({
      chatId,
      content: lastMessage.content,
      role: "user",
    });

    // Prepare messages for AI - only include user messages + system prompt
    const streamMessages = [
      systemPrompt, 
      ...messages.filter((msg: any) => msg.role === "user" || msg.role === "assistant")
    ];

    console.log("Starting AI stream with messages:", streamMessages.length);

    const result = await streamText({
      model: model,
      messages: streamMessages,
      onFinish: async (completion) => {
        console.log("AI response completed, saving to database");
        await db.insert(_messages).values({
          chatId,
          content: completion.text,
          role: "system", // Change from "system" to "assistant"
        });
      },
    });

    console.log("Returning streaming response");
    return result.toDataStreamResponse();

  } catch (error) {
    console.error("Error in chat API:", error);
    return Response.json({ 
      error: "Internal server error", 
    }, { status: 500 });
  }
}

// Make sure GET is handled properly
export async function GET() {
  return Response.json({ error: "GET method not supported" }, { status: 405 });
}