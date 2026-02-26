import React from "react";
import Link from "next/link";
import SearchModal from "components/SearchModal";
import SearchIcon from "icons/Search";

interface ClientPageProps {
  children: React.ReactNode;
}

export default function ClientPage({ children }: ClientPageProps) {
  const [searchOpen, setSearchOpen] = React.useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <header className="bg-white shadow">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/">
            <h1 className="text-3xl font-extrabold text-gray-800">Avicommons</h1>
          </Link>
          <nav className="flex items-center">
            <Link href="/suggest" className="text-gray-700 hover:text-gray-900 px-4 font-medium">
              Suggest Image
            </Link>
            <Link
              href="https://github.com/rawcomposition/avicommons?tab=readme-ov-file#getting-started"
              target="_blank"
              className="text-gray-700 hover:text-gray-900 px-4 font-medium"
            >
              Get Started
            </Link>
            <Link
              href="https://github.com/rawcomposition/avicommons/blob/main/FAQ.md"
              target="_blank"
              className="text-gray-700 hover:text-gray-900 px-4 font-medium"
            >
              FAQ
            </Link>
            <button
              onClick={() => setSearchOpen(true)}
              className="text-gray-600 hover:text-gray-900 px-3 py-1"
              title="Search species (Cmd+K)"
            >
              <SearchIcon className="!w-4 !h-4" />
            </button>
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
