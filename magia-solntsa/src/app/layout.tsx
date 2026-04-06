import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Магия Солнца | Студия загара люкс",
  description: "Онлайн-запись на загар в премиальной студии Магия Солнца",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className="bg-background text-on-background font-body antialiased selection:bg-primary-container selection:text-on-primary-container">
        {children}
      </body>
    </html>
  );
}
