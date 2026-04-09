"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      };
      setCurrentTime(now.toLocaleDateString("ru-RU", options));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#1C1C1E]">
      <header className="fixed top-0 left-0 right-0 h-16 bg-[#2C2C2E]/95 backdrop-blur-sm border-b border-[#3A3A3C] flex items-center justify-between px-6 z-50">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-2xl font-black text-[#9ffb00]">ЁЛКА CRM</Link>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-gray-400 text-lg font-mono">{currentTime}</span>
          <Link 
            href="/" 
            className="text-sm text-gray-400 hover:text-[#9ffb00] transition-colors"
          >
            ← На сайт
          </Link>
        </div>
      </header>
      <main className="pt-20 p-6">{children}</main>
    </div>
  );
}
