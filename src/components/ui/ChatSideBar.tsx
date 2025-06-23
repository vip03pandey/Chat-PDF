"use client";
import { DrizzleChat } from "@/lib/db/schema";
import React from "react";
import { SidebarContent } from "./SidebarContent";
import Link from "next/link";

type Props = {
  chats: DrizzleChat[];
  chatId: number;
  setNavDrawerOpen?: (open: boolean) => void; // Optional prop for mobile usage
};

const ChatSideBar = ({ chats, chatId, setNavDrawerOpen }: Props) => {
  return (
    <div className="h-full w-full overflow-y-auto p-4 text-white bg-[#1e272e] flex flex-col relative">
      {/* Sidebar Content */}
      <div className="flex-1">
        <SidebarContent 
          chats={chats} 
          chatId={chatId} 
          setNavDrawerOpen={setNavDrawerOpen || (() => {})}
        />
      </div>
      
      {/* Bottom Navigation */}
      <div className="absolute bottom-4 left-4 right-4 flex gap-4 justify-center">
        <Link 
          href='/' 
          className="text-white hover:text-gray-300 transition-colors"
          onClick={() => setNavDrawerOpen?.(false)}
        >
          Home
        </Link>
        <Link 
          href='/settings' 
          className="text-white hover:text-gray-300 transition-colors"
          onClick={() => setNavDrawerOpen?.(false)}
        >
          Settings
        </Link>
      </div>
    </div>
  );
};

export default ChatSideBar;