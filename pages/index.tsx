import React from "react";
import Stats from "data/stats.json";
import RecentlyDownloaded from "data/recently-downloaded.json";
import Link from "next/link";
import { License, LicenseLabel, OutputPhoto } from "lib/types";
import { getUrl } from "lib/species";
import Families from "data/taxon-families.json";
import SelectBasic from "components/ReactSelectStyled";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import Head from "next/head";

const PAGE_SIZE = 12;

export default function Landing() {
  const [family, setFamily] = React.useState<string>("anatid1");
  const [page, setPage] = React.useState<number>(1);
  const { total, withImg, percent, license, source, taxonVersions } = Stats;

  const { data } = useQuery<{ photos: OutputPhoto[] }>({
    queryKey: ["/api/photos-by-family", { family }],
    refetchOnWindowFocus: false,
  });

  const photos = data?.photos || [];
  const start = (page - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE;
  const paginatedPhotos = photos.slice(0, end);
  const hasMore = photos.length > end;

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Avicommons | Creative Commons Bird Thumbnails</title>
        <meta
          name="description"
          content="Integrate Creative Commons licensed bird thumbnails into your app or website."
        />
      </Head>
      <section className="bg-gray-800 py-12">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-200">Your Source for Bird Thumbnails</h2>
          <p className="mt-4 text-lg text-gray-200">
            Integrate <strong>Creative Commons</strong> licensed images into your app or website.
          </p>
          <p className="mt-2 text-gray-200">Supported eBird Taxonomy Versions: {taxonVersions.join(", ")}.</p>
          <a
            href="https://github.com/rawcomposition/avicommons?tab=readme-ov-file#getting-started"
            target="_blank"
            className="mt-6 px-6 py-3 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition inline-block"
          >
            Get Started Now
          </a>
        </div>
      </section>

      <section className="container mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white rounded shadow">
            <h3 className="text-lg font-bold text-gray-800">Total Species</h3>
            <p className="mt-2 text-gray-600 text-xl">{total.toLocaleString()}</p>
          </div>
          <div className="p-6 bg-white rounded shadow">
            <h3 className="text-lg font-bold text-gray-800">With Images</h3>
            <p className="mt-2 text-gray-600 text-xl">
              {withImg.toLocaleString()} <span className="text-gray-500">({percent})</span>
            </p>
          </div>
          <div className="p-6 bg-white rounded shadow">
            <h3 className="text-lg font-bold text-gray-800">Taxonomy</h3>
            <p className="mt-2 text-gray-600 text-lg">eBird/Clements v2024</p>
          </div>
        </div>
      </section>

      <section className="bg-gray-100 py-10">
        <div className="container mx-auto">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Browse by Family</h3>
          <SelectBasic
            options={Families.map((family) => ({ label: `${family.name}`, value: family.code }))}
            onChange={(selectedOption) => setFamily(selectedOption?.value || Families[0].code)}
            value={{
              label: Families.find((it) => it.code === family)?.name,
              value: family,
            }}
            placeholder="Select a family"
            className="w-[260px] sm:w-[360px]"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
            {paginatedPhotos.map((item) => (
              <div key={item.code} className="bg-white rounded shadow overflow-hidden flex">
                <img
                  src={getUrl(item.code, item.key, "240")}
                  alt={item.name}
                  className="w-[120px] aspect-[4/3]"
                  loading="lazy"
                />
                <div className="p-4">
                  <h4 className="font-bold text-gray-800 text-[16px]">{item.name}</h4>
                  <p className="text-sm text-gray-600 mt-2">
                    <span className="font-medium">{item.by}</span>{" "}
                    <span className="bg-gray-200/70 rounded-md px-1.5 py-0.5 text-xs">
                      {LicenseLabel[item.license as License] || item.license}
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-gray-500 text-sm mt-2">
            Showing {paginatedPhotos.length} of {photos.length}
          </p>
          <div className="flex justify-center mt-4">
            {hasMore && (
              <button
                className="px-4 py-1 border-2 border-blue-600 text-blue-600 rounded hover:shadow transition font-medium"
                onClick={() => setPage(page + 1)}
              >
                Load More
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 py-10">
        <h3 className="text-2xl font-bold text-gray-800 mb-4">License Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {license.map((item, index) => (
            <div key={index} className="p-4 bg-white rounded shadow">
              <h4 className="text-lg font-bold text-gray-800">{item.label || "Unknown"}</h4>
              <p className="text-gray-600 mt-2">Count: {item.count.toLocaleString()}</p>
              <p className="text-gray-600">Percent: {item.percent}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gray-100 py-10">
        <div className="container mx-auto">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Recently Updated Images</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {RecentlyDownloaded.map((item) => (
              <div key={item.code} className="bg-white rounded shadow overflow-hidden">
                <img src={getUrl(item.code, item.key, "320")} alt={item.name} className="w-full aspect-[4/3]" />
                <div className="p-4">
                  <p className="text-[13px] text-gray-600 leading-4 mb-1">
                    {dayjs(item.downloadedAt).format("MMM DD, YYYY")}
                  </p>
                  <h4 className="font-bold text-gray-800 text-lg">{item.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    <span className="font-medium">{item.author}</span>{" "}
                    <span className="bg-gray-200/70 rounded-md px-1.5 py-0.5 text-xs">
                      {LicenseLabel[item.license as License] || item.license}
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-gray-800 text-white py-4">
        <div className="container mx-auto text-center">
          <p>
            Developed and maintained by{" "}
            <a href="https://rawcomposition.com" className="text-white hover:underline" target="_blank">
              Adam Jackson
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
