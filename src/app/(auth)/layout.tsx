import { FileText } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <Link href="/" className="mb-8 flex items-center gap-2">
        <FileText className="h-8 w-8 text-primary" />
        <span className="text-2xl font-bold">QuoteVoice</span>
      </Link>
      {children}
    </div>
  );
}
