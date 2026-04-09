"use client";

import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster 
        position="top-right" 
        richColors 
        closeButton
        theme="dark"
        toastOptions={{
          style: {
            background: '#2C2C2E',
            border: '1px solid #3A3A3C',
            color: '#F5F5F7',
          },
        }}
      />
    </>
  );
}
