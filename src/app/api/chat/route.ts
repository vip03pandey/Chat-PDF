


import { streamText } from "ai";
import {  openai as AIModel} from "@ai-sdk/openai";
import { getContext } from "@/lib/context";
import { db } from "@/lib/db";
import { chats, messages as _messages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const runtime = "nodejs"; 

const model = AIModel("gpt-3.5-turbo");

export async function POST(req: Request) {
  try {
    const { messages, chatId } = await req.json();

    const _chats = await db.select().from(chats).where(eq(chats.id, chatId));
    if (_chats.length !== 1) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    const fileKey = _chats[0].fileKey;
    const lastMessage = messages[messages.length - 1];

    if (!lastMessage?.content) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

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
    await db.insert(_messages).values({
      chatId,
      content: lastMessage.content,
      role: "user",
    });

    const streamMessages = [systemPrompt, ...messages.filter((msg: any) => msg.role === "user")];

    const result = await streamText({
      model: model,
      messages: streamMessages,
      onFinish: async (completion) => {
        await db.insert(_messages).values({
          chatId,
          content: completion.text,
          role: "system",
        });
      },
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Error in chat API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
