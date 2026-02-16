import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Time Blocks Logger",
  description: "Time Blocks Logger",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
