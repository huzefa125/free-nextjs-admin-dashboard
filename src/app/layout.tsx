import { Outfit } from 'next/font/google';
import type { Metadata } from 'next';
import './globals.css';
import "flatpickr/dist/flatpickr.css";
import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';
import QueryProvider from '@/components/QueryProvider';

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
        <ThemeProvider>
          <SidebarProvider>
            <QueryProvider>{children}</QueryProvider>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
