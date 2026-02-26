/* eslint-disable @next/next/no-img-element */
import React from "react";
import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import { SearchEntry } from "lib/types";
import { getUrl } from "lib/species";
import Stats from "data/stats.json";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function SearchModal({ open, onClose }: Props) {
  const router = useRouter();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [query, setQuery] = React.useState("");
  const [debouncedQuery, setDebouncedQuery] = React.useState("");
  const [activeIndex, setActiveIndex] = React.useState(0);

  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 200);
    return () => clearTimeout(timer);
  }, [query]);

  React.useEffect(() => {
    setActiveIndex(0);
  }, [debouncedQuery]);

  React.useEffect(() => {
    if (open) {
      requestAnimationFrame(() => inputRef.current?.focus());
    } else {
      setQuery("");
      setDebouncedQuery("");
      setActiveIndex(0);
    }
  }, [open]);

  const { data: allSpecies } = useQuery<SearchEntry[]>({
    queryKey: ["search-index"],
    queryFn: async () => {
      const res = await fetch("/search.json");
      const tuples: (string | number)[][] = await res.json();
      return tuples.map((t) => ({
        code: t[0] as string,
        name: t[1] as string,
        sciName: t[2] as string,
        key: (t[3] as string) || undefined,
        isExtinct: !!t[4],
      }));
    },
    enabled: open,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });

  const results = React.useMemo(() => {
    if (!debouncedQuery || debouncedQuery.length < 2 || !allSpecies) return [];
    const q = debouncedQuery.toLowerCase();
    return allSpecies
      .filter((p) => p.name.toLowerCase().includes(q) || p.sciName.toLowerCase().includes(q))
      .slice(0, 10);
  }, [debouncedQuery, allSpecies]);

  const navigate = (code: string) => {
    onClose();
    router.push(`/species/${code}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[activeIndex]) {
      e.preventDefault();
      navigate(results[activeIndex].code);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[10000]" onKeyDown={handleKeyDown}>
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative mx-auto mt-[15vh] w-full max-w-xl px-4">
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
          <div className="flex items-center border-b px-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 512 512"
              className="w-5 h-5 text-gray-400 shrink-0 fill-current"
            >
              <path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              placeholder="Search species..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full py-4 px-3 text-lg border-0 focus:ring-0 focus:outline-none"
            />
            <kbd className="hidden sm:inline-block text-xs text-gray-400 border border-gray-200 rounded px-1.5 py-0.5">
              ESC
            </kbd>
          </div>
          {debouncedQuery.length >= 2 && (
            <ul className="max-h-[400px] overflow-y-auto">
              {results.length === 0 && (
                <li className="px-4 py-8 text-center text-gray-500">No species found</li>
              )}
              {results.map((item, index) => (
                <li key={item.code}>
                  <button
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                      index === activeIndex ? "bg-blue-100" : "hover:bg-gray-50"
                    }`}
                    onClick={() => navigate(item.code)}
                    onMouseEnter={() => setActiveIndex(index)}
                  >
                    {item.key ? (
                      <img
                        src={getUrl(item.code, item.key, "240")}
                        alt=""
                        className="w-12 h-9 object-cover rounded shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-9 bg-gray-200 rounded shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="font-medium text-gray-800 truncate">{item.name}</p>
                      <p className="text-sm text-gray-500 italic truncate">{item.sciName}</p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {debouncedQuery.length < 2 && (
            <div className="px-4 py-8 text-center text-gray-500 text-sm">
              Type to search across {Stats.total.toLocaleString()} species
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
