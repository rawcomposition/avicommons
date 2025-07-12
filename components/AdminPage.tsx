import React from "react";
import Link from "next/link";
import Title from "components/Title";
import ErrorBoundary from "components/ErrorBoundary";

type PropTypes = {
  title?: string;
  children: React.ReactNode;
};

export default function AdminPage({ title, children }: PropTypes) {
  return (
    <>
      <header className="bg-gray-800 shadow">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/">
            <h1 className="text-3xl font-extrabold text-white">Avicommons Admin</h1>
          </Link>
          <nav>
            <Link href="/manage" className="text-gray-300 hover:text-white px-4 font-medium">
              Manage
            </Link>
            <Link href="/sync" className="text-gray-300 hover:text-white px-4 font-medium">
              Sync
            </Link>
            <Link href="/" className="text-gray-300 hover:text-white px-4 font-medium">
              Home
            </Link>
          </nav>
        </div>
      </header>
      <div className="min-h-[600px]">
        <Title>{title}</Title>
        <ErrorBoundary>{children}</ErrorBoundary>
      </div>
    </>
  );
}
