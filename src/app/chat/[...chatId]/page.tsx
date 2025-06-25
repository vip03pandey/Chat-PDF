import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { chats } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { type NextPage } from 'next';
import ResponsiveChatLayout from '@/components/ResponsiveChatLayout';

// Define the props type correctly
interface ChatPageProps {
  params: Promise<{ chatId: string }>;
}

const ChatPage: NextPage<ChatPageProps> = async ({ params }) => {
  const { chatId } = await params;
  const numericChatId = parseInt(chatId);

  const { userId } = await auth();
  if (!userId) return redirect('/sign-in');

  const _chats = await db.select().from(chats).where(eq(chats.userId, userId));
  if (!_chats.length) return redirect('/');

  const currentChat = _chats.find(chat => chat.id === numericChatId);
  if (!currentChat) return redirect('/');

  return (
    <ResponsiveChatLayout
      chats={_chats}
      chatId={numericChatId}
      currentChat={currentChat}
    />
  );
};

export default ChatPage;