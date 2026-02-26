/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { OutputPhoto, License, LicenseLabel } from "lib/types";
import { getUrl } from "lib/species";

type Props = {
  item: OutputPhoto;
};

export default function SpeciesCard({ item }: Props) {
  return (
    <Link href={`/species/${item.code}`} className="block">
      <div className="bg-white rounded shadow overflow-hidden flex hover:shadow-md transition">
        <img
          src={getUrl(item.code, item.key, "240")}
          alt={item.name}
          className="w-[120px] aspect-[4/3] object-cover"
          loading="lazy"
        />
        <div className="p-4">
          <h4 className="font-bold text-gray-800 text-[16px]">{item.name}</h4>
          <p className="text-xs text-gray-500 italic">{item.sciName}</p>
          <p className="text-sm text-gray-600 mt-2">
            <span className="font-medium">{item.by}</span>{" "}
            <span className="bg-gray-200/70 rounded-md px-1.5 py-0.5 text-xs">
              {LicenseLabel[item.license as License] || item.license}
            </span>
          </p>
        </div>
      </div>
    </Link>
  );
}
