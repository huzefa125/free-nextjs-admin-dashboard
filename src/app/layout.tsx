import { Outfit } from 'next/font/google';
import type { Metadata } from 'next';
import './globals.css';
import "flatpickr/dist/flatpickr.css";
import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';
<<<<<<< HEAD
import { AuthProvider } from '@/context/AuthContext';
=======
import QueryProvider from '@/components/QueryProvider';
>>>>>>> fed37646de9ea1a0c0b5a2e0b00e6c03aa6d2fdb

const outfit = Outfit({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://royalautogarage.com"),
  title: {
    default: "Royal Auto Garage",
    template: "%s | Royal Auto Garage",
  },
  description:
    "Royal Auto Garage management system for customers, vehicles, services, inventory, and invoicing.",
  keywords: [
    "Royal Auto Garage",
    "garage management",
    "vehicle service",
    "inventory management",
    "auto workshop software",
  ],
  applicationName: "Royal Auto Garage",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    siteName: "Royal Auto Garage",
    title: "Royal Auto Garage",
    description:
      "Garage management platform for customers, vehicles, services, and inventory.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Royal Auto Garage",
    description:
      "Garage management platform for customers, vehicles, services, and inventory.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.className} dark:bg-gray-900`}>
<<<<<<< HEAD
        <AuthProvider>
          <ThemeProvider>
            <SidebarProvider>{children}</SidebarProvider>
          </ThemeProvider>
        </AuthProvider>
=======
        <ThemeProvider>
          <SidebarProvider>
            <QueryProvider>{children}</QueryProvider>
          </SidebarProvider>
        </ThemeProvider>
>>>>>>> fed37646de9ea1a0c0b5a2e0b00e6c03aa6d2fdb
      </body>
    </html>
  );
}
