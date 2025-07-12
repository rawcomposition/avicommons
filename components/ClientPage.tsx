import React from "react";
import Link from "next/link";

interface ClientPageProps {
  children: React.ReactNode;
}

export default function ClientPage({ children }: ClientPageProps) {
  return (
    <>
      <header className="bg-white shadow">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/">
            <h1 className="text-3xl font-extrabold text-gray-800">Avicommons</h1>
          </Link>
          <nav>
            <Link
              href="https://github.com/rawcomposition/avicommons?tab=readme-ov-file#getting-started"
              target="_blank"
              className="text-blue-600 hover:underline px-4 font-medium"
            >
              Get Started
            </Link>
            <Link
              href="https://github.com/rawcomposition/avicommons/blob/main/FAQ.md"
              target="_blank"
              className="text-blue-600 hover:underline px-4 font-medium"
            >
              FAQ
            </Link>
          </nav>
        </div>
      </header>
      <main>{children}</main>
    </>
  );
}
