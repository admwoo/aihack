import { Fredoka } from "next/font/google";
import "./globals.css";

const fredoka = Fredoka({ subsets: ["latin"], weight: ["400", "600", "700"] });

export const metadata = {
  title: "Cooked — Food Fight Quiz Battle",
  description:
    "Upload study material, let AI generate questions, then battle an opponent in a turn-based food fight. Get cooked or do the cooking.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={fredoka.className}>{children}</body>
    </html>
  );
}
