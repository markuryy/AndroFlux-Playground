import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import '@mantine/core/styles.css';
import { AppLayout } from '../components/layout/AppLayout';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AndroFlux Playground",
  description: "A Markury Project",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}
