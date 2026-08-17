import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/context/app-context";
import { PwaRegister } from "@/components/pwa/pwa-register";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SobrioApp · Sobriedad y Bienestar",
  description:
    "Tu compañero personal de sobriedad: contador de días, check-ins diarios de mañana y noche, y apoyo SOS en momentos de craving.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SobrioApp",
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
  keywords: [
    "sobriedad",
    "adicciones",
    "bienestar",
    "recovery",
    "sobrio",
    "check-in",
    "salud mental",
  ],
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <AppProvider>
          {children}
          <PwaRegister />
        </AppProvider>
      </body>
    </html>
  );
}
