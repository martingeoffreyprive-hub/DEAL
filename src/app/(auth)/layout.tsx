import Link from "next/link";
import Image from "next/image";

export const dynamic = "force-dynamic";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#1E2144] px-4">
      <Link href="/" className="mb-8 flex items-center gap-2">
        <Image
          src="/logos/deal-icon-d.svg"
          alt="DEAL"
          width={48}
          height={48}
          className="rounded-xl"
        />
        <span className="text-2xl font-bold text-white">DEAL</span>
        <span className="w-2 h-2 rounded-full bg-[#E85A5A]"></span>
      </Link>
      {children}
    </div>
  );
}
