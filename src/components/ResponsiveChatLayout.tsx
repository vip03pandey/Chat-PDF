'use client'

import React, { useState } from 'react'
import { AlignJustify, CircleX, ExternalLink } from 'lucide-react'
import ChatSideBar from '@/components/ui/ChatSideBar'
import PDFViewer from '@/components/ui/PDFViewer'
import ChatComponent from '@/components/ui/ChatComponent'
import { DrizzleChat } from '@/lib/db/schema'

interface ResponsiveChatLayoutProps {
  chats: DrizzleChat[];
  chatId: number;
  currentChat?: DrizzleChat;
}

const ResponsiveChatLayout: React.FC<ResponsiveChatLayoutProps> = ({
  chats,
  chatId,
  currentChat
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const closeSidebar = () => {
    setIsSidebarOpen(false)
  }

  const openPDFInNewTab = () => {
    if (currentChat?.pdfUrl) {
      window.open(currentChat.pdfUrl, '_blank')
    }
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:block w-80 h-full flex-shrink-0">
        <ChatSideBar chats={chats} chatId={chatId} />
      </div>

      {/* Mobile Menu Button */}
      {!isSidebarOpen &&(<button
        onClick={toggleSidebar}
        className="md:hidden fixed top-7 !h-8 !w-10 left-2 z-50 p-2 bg-black text-white rounded-lg shadow-md border border-gray-200 hover:bg-gray-50 transition-colors align-middle"
        aria-label="Toggle sidebar"
      >
        <AlignJustify className="h-8 w-8 text-white-600 " />
      </button>)}

      {/* Mobile PDF Link Button */}
      {currentChat?.pdfUrl && (
        <button
          onClick={openPDFInNewTab}
          className="md:hidden fixed top-1 left-[50%] z-50 !p-2 bg-gray-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors flex items-center gap-2"
          aria-label="Open PDF in new tab"
        >
          <ExternalLink className="h-4 w-4" />
          <span className="text-sm font-medium">PDF</span>
        </button>
      )}

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={closeSidebar}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`
          fixed top-0 left-0 w-[80%] sm:w-[320px] md:hidden h-full 
          transition-transform duration-300 z-40
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Close Button */}
        <button 
          onClick={closeSidebar} 
          className="absolute top-4 right-4 z-10 p-2 text-white hover:bg-gray-700 rounded-lg transition-colors"
        >
          <CircleX className="h-5 w-5" />
        </button>
        
        <ChatSideBar 
          chats={chats} 
          chatId={chatId} 
          setNavDrawerOpen={setIsSidebarOpen}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex h-full min-w-0">
        {/* Chat Component */}
        <div className="flex-1 md:flex-none md:w-96 lg:w-[480px] border-r border-l-4 border-l-slate-200 h-full flex flex-col bg-white">
          <div className="pt-16 md:pt-0 h-full">
            <ChatComponent chatId={chatId} />
          </div>
        </div>

        {/* PDF Viewer - Hidden on Mobile */}
        <div className="hidden md:flex flex-1 h-full">
          <PDFViewer pdf_url={currentChat?.pdfUrl || ''} />
        </div>
      </div>
    </div>
  )
}

export default ResponsiveChatLayout