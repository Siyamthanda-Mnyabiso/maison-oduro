import type { Metadata } from "next";
import { Montserrat, Pinyon_Script, Playfair_Display } from "next/font/google";
import "./globals.css";
import CartDrawer from "@/components/CartDrawer";
import { CartProvider } from "@/lib/cart";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const pinyon = Pinyon_Script({
  variable: "--font-pinyon",
  subsets: ["latin"],
  weight: "400",
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Maison Oduro | Inspired By Icons. Made For You.",
  description:
    "Maison Oduro captures the spirit of iconic scents in refined, long-lasting elixirs.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${montserrat.variable} ${pinyon.variable} h-full`}
    >
      <body className="min-h-full flex flex-col">
        <CartProvider>
          {children}
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
