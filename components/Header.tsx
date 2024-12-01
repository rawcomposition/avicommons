import React from "react";
import Link from "next/link";

export default function Header() {
  return (
    <>
      <header className={`bg-white border-b static pr-8 pl-3  shadow-sm z-[10000]`}>
        <div>
          <div className="flex py-2 items-center">
            <Link href="/" className="flex gap-2 items-center">
              <div className="flex flex-col justify-center">
                <h1 className={`text-lg md:text-3xl text-gray-900 transition-all duration-300`}>Avicommons</h1>
              </div>
            </Link>
            <nav>
              <ul className="flex gap-6 sm:gap-7">
                <li>
                  <Link
                    href="/explore"
                    className="text-xs font-bold text-gray-700 hover:text-gray-600 cursor-pointer uppercase"
                  >
                    <span className="hidden sm:inline">Explore Hotspots</span>
                    <span className="sm:hidden">Explore</span>
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </header>
    </>
  );
}
