import type { Metadata } from "next";
import { Noto_Sans_Thai } from "next/font/google";
import "./globals.css";

const notoSansThai = Noto_Sans_Thai({
  variable: "--font-noto-sans-thai",
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "CP Fondue • ระบบแจ้งซ่อมออนไลน์ วิทยาลัยการคอมพิวเตอร์ มข.",
  description: "ระบบแจ้งซ่อมออนไลน์ วิทยาลัยการคอมพิวเตอร์ มหาวิทยาลัยขอนแก่น (CP Fondue Online Repair System)",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="th"
      className={`${notoSansThai.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
