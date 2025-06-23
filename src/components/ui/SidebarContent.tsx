import Link from "next/link";
import React from "react";
import { Button } from "./button";
import { MessageCircle, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { DrizzleChat } from "@/lib/db/schema";
type Props = {
  chats: DrizzleChat[];
  chatId: number;
  setNavDrawerOpen: (isOpen: boolean) => void;
};
  
export const SidebarContent = ({ chats, chatId, setNavDrawerOpen }: Props) => (
    <>
      <Link className="flex" href="/">
        <Button className="w-[60%] !m-auto !mt-14 border-white border bg-[#1e272e] !text-white-200">
          <PlusCircle className="mr-2 w-4 h-4" />
          New Chat
        </Button>
      </Link>
      <h1 className="text-center text-white !mt-15 !mb-2">Chats</h1>
      <div className="flex flex-col gap-2 !mt-4 pb-20 !ml-3 !mr-3">
        {chats
          .sort((a, b) => {
            if (a.createdAt && b.createdAt) {
              return b.createdAt.getTime() - a.createdAt.getTime();
            }
            return 0;
          })
          .map((chat) => (
            <Link key={chat.id} href={`/chat/${chat.id}`} onClick={() => setNavDrawerOpen(false)}>
              <div
                className={cn(
                  "rounded-lg !p-3 text-slate-300 flex items-center !mb-1",
                  {
                    "bg-blue-600 text-white": chat.id === chatId,
                    "hover:text-white": chat.id !== chatId,
                  }
                )}
              >
                <MessageCircle className="mr-2" />
                <p className="w-full overflow-hidden !ml-1 text-sm truncate whitespace-nowrap text-ellipsis">
                  {chat.pdfName}
                </p>
              </div>
            </Link>
          ))}
      </div>


    </>
  );
  