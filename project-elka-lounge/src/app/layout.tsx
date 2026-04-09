import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const manrope = Manrope({
  subsets: ["cyrillic", "latin"],
  weight: ["200", "400", "600", "700", "800"],
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  title: "ЁЛКА Lounge Bar — Новосибирск",
  description: "Премиальная lounge атмосфера на крыше. г. Новосибирск, Красный проспект 182/1, 12 этаж. Бронирование столов онлайн.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.svg",
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Ёлка",
  },
  openGraph: {
    title: "ЁЛКА Lounge Bar",
    description: "Премиальная lounge атмосфера на крыше",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        <meta name="theme-color" content="#1C1C1E" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className={`${manrope.variable} antialiased`}>
        {children}
        <Toaster 
          position="top-right" 
          theme="dark"
          toastOptions={{
            style: {
              background: '#2C2C2E',
              border: '1px solid #3A3A3C',
              color: '#F5F5F7',
            },
          }}
        />
      </body>
    </html>
  );
}
