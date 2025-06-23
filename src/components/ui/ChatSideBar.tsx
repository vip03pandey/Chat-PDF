"use client";
import { DrizzleChat } from "@/lib/db/schema";
import React, { useState } from "react";
import {AlignJustify,CircleX} from "lucide-react";
import {SidebarContent} from "./SidebarContent";
import Link from "next/link";
type Props = {
  chats: DrizzleChat[];
  chatId: number;
};


const ChatSideBar =({ chats, chatId}: Props) => {
  const [navDrawerOpen, setNavDrawerOpen] = useState(false);
  const toggleNavDrawer=()=>{
    setNavDrawerOpen(!navDrawerOpen);
  }
  return (
    <>
    <div className="h-full w-full overflow-y-auto p-4 text-white-200 bg-[#1e272e] md:block hidden">
      <SidebarContent chats={chats} chatId={chatId} setNavDrawerOpen={() => {}}/>
      <div className="absolute bottom-2 !flex !gap-2 justify-center !ml-4 ">
        <Link href='/' className="text-white ">Home</Link>
        <Link  href='/' className="text-white">Settings</Link>
      </div>
    </div>
      <button onClick={toggleNavDrawer} className='md:hidden cursor-pointer !mt-4 !ml-2'><AlignJustify/></button>

      {/* mobile view */}
      <div className={`fixed top-0 left-0 w-[80%] sm:w-[20%] md:hidden h-full bg-[#1e272e] overflow-y-auto p-4 
        transition-transform duration-300 z-50 ${navDrawerOpen?"translate-x-0":"-translate-x-full"}`}>
      <button onClick={toggleNavDrawer} className='md:hidden cursor-pointer !mt-4 !ml-2'><CircleX className="text-white"/></button>
      <SidebarContent chats={chats} chatId={chatId} setNavDrawerOpen={setNavDrawerOpen}/>
      <div className="absolute bottom-2 !flex !gap-2 justify-center !ml-4 ">
        <Link href='/' className="text-white ">Home</Link>
        <Link  href='/' className="text-white">Settings</Link>
      </div>
      </div>
      </>
      );
};

export default ChatSideBar;