import React, { useState } from "react";
import { ThemeProvider } from "./context/ThemeContext";
import { ChatProvider, useChat } from "./context/ChatContext";
import LandingPage from "./pages/LandingPage";
import ChatPage from "./pages/ChatPage";

function AppContent() {
  const [currentPage, setCurrentPage] = useState("landing");
  const { createNewChat } = useChat();

  const handleNewChat = () => createNewChat();

  if (currentPage === "chat") {
    return <ChatPage onNavigate={setCurrentPage} onNewChat={handleNewChat} />;
  }
  return <LandingPage onNavigate={setCurrentPage} />;
}

function App() {
  return (
    <ThemeProvider>
      <ChatProvider>
        <AppContent />
      </ChatProvider>
    </ThemeProvider>
  );
}

export default App;
