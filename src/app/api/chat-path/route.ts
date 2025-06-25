import { auth } from "@clerk/nextjs/server";
import { streamText } from "ai";
import { openai as AIModel } from "@ai-sdk/openai";
import { getContext } from "@/lib/context";
import { db } from "@/lib/db";
import { chats, messages as _messages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = 'force-dynamic';

const model = AIModel("gpt-3.5-turbo");

export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const { userId } = await auth();
    if (!userId) {
      console.error("Unauthorized access attempt");
      return new Response("Unauthorized", { status: 401 });
    }

    console.log("=== New Streaming Chat API Called ===");
    console.log("User ID:", userId);
    
    // Parse request body
    const body = await req.json();
    console.log("Request body received:", {
      hasChatId: !!body.chatId,
      hasMessages: !!body.messages,
      messagesLength: body.messages?.length || 0
    });

    const { messages, chatId } = body;

    // Validate required fields
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      console.error("Invalid or missing messages array");
      return new Response("Invalid messages array", { status: 400 });
    }

    if (!chatId) {
      console.error("Missing chatId");
      return new Response("Missing chatId", { status: 400 });
    }

    // Verify chat exists and belongs to user
    const chatQuery = await db
      .select()
      .from(chats)
      .where(eq(chats.id, chatId));

    if (chatQuery.length === 0) {
      console.error("Chat not found:", chatId);
      return new Response("Chat not found", { status: 404 });
    }

    const chat = chatQuery[0];
    console.log("Chat found:", { id: chat.id, fileKey: chat.fileKey });

    // Get the last user message
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage?.content || lastMessage.role !== "user") {
      console.error("Invalid last message:", lastMessage);
      return new Response("Last message must be from user with content", { status: 400 });
    }

    console.log("Processing message:", lastMessage.content.substring(0, 100) + "...");

    // Get context from the document
    let context = "";
    try {
      if (chat.fileKey) {
        context = await getContext(lastMessage.content, chat.fileKey);
        console.log("Context retrieved, length:", context.length);
      }
    } catch (contextError) {
      console.error("Error getting context:", contextError);
      // Continue without context rather than failing
    }

    // Create system prompt with context
    const systemMessage = {
      role: "system" as const,
      content: `You are a helpful AI assistant. You have access to information from uploaded documents.

${context ? `CONTEXT FROM DOCUMENT:
${context}

Please use this context to answer questions accurately. If the question cannot be answered from the provided context, please say so clearly.` : 'No document context available for this chat.'}

Be helpful, accurate, and concise in your responses.`
    };

    // Save the user message to database
    try {
      await db.insert(_messages).values({
        chatId: chatId,
        content: lastMessage.content,
        role: "user",
      });
      console.log("User message saved to database");
    } catch (dbError) {
      console.error("Error saving user message:", dbError);
      // Continue with streaming even if DB save fails
    }

    // Prepare messages for the AI
    const conversationMessages = [
      systemMessage,
      ...messages.filter((msg: any) => 
        (msg.role === "user" || msg.role === "assistant") && msg.content
      )
    ];

    console.log("Starting stream with", conversationMessages.length, "messages");

    // Create the streaming response
    const result = await streamText({
      model: model,
      messages: conversationMessages,
      temperature: 0.7,
      maxTokens: 1000,
      onFinish: async (completion) => {
        console.log("Stream completed, saving AI response");
        try {
          await db.insert(_messages).values({
            chatId: chatId,
            content: completion.text,
            role: "assistant", // Changed from "system" to "assistant"
          });
          console.log("AI response saved to database");
        } catch (dbError) {
          console.error("Error saving AI response:", dbError);
        }
      },
    });

    console.log("Streaming response initiated");
    return result.toDataStreamResponse();

  } catch (error) {
    console.error("Streaming Chat API Error:", error);
    
    // Return detailed error in development
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    
    return new Response(
      JSON.stringify({ 
        error: "Internal server error",
        details: errorMessage,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}