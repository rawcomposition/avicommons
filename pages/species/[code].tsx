/* eslint-disable @next/next/no-img-element */
import React from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import ClientPage from "components/ClientPage";
import { License, LicenseLabel, ImgSource, ImgSourceLabel, SpeciesT } from "lib/types";
import { getUrl, getSourceUrl } from "lib/species";

export default function SpeciesDetail() {
  const router = useRouter();
  const { code } = router.query;

  const { data: species, isLoading } = useQuery<SpeciesT>({
    queryKey: ["/api/species", code],
    queryFn: async () => {
      const res = await fetch(`/api/species/${code}`);
      const json = await res.json();
      return json.species;
    },
    enabled: !!code,
    refetchOnWindowFocus: false,
  });

  const hasImage = !!species?.sourceKey && !!species?.downloadedAt;
  const name = species?.latestNomenclature?.name;
  const sciName = species?.latestNomenclature?.sciName;
  const isExtinct = species?.latestNomenclature?.isExtinct;

  const sourceUrl = React.useMemo(() => {
    if (!species?.source || !species?.sourceId) return null;
    return getSourceUrl(species.source, species.sourceId, species.iNatObsId);
  }, [species]);

  if (isLoading || (code && !species)) {
    return (
      <ClientPage>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <p className="text-gray-500">Loading...</p>
        </div>
      </ClientPage>
    );
  }

  if (!species) {
    return (
      <ClientPage>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500 text-lg">Species not found</p>
            <Link href="/" className="text-blue-600 hover:underline mt-2 inline-block">
              Back
            </Link>
          </div>
        </div>
      </ClientPage>
    );
  }

  return (
    <ClientPage>
      <div className="min-h-screen bg-gray-50">
        <Head>
          <title>{name} - Avicommons</title>
          <meta
            name="description"
            content={
              hasImage
                ? `${name} (${sciName}) - Creative Commons bird image by ${species.author}`
                : `${name} (${sciName}) - Avicommons`
            }
          />
        </Head>

        <div className="container mx-auto px-6 py-8">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
            &larr; Back
          </Link>

          <div className="mt-6 bg-white rounded-lg shadow-lg overflow-hidden max-w-3xl mx-auto">
            {hasImage ? (
              <img
                src={getUrl(species._id, species.sourceKey, "900")}
                alt={name}
                className="w-full aspect-[4/3] object-cover"
              />
            ) : (
              <div className="w-full aspect-[4/3] bg-gray-200 flex items-center justify-center">
                <p className="text-gray-400 text-lg">No image available</p>
              </div>
            )}
            <div className="p-6">
              <h1 className="text-3xl font-bold text-gray-800">
                {name}
                {isExtinct && (
                  <span className="ml-2 text-sm font-medium text-red-600 border border-red-300 rounded-md px-1.5 py-0.5 align-middle">
                    Extinct
                  </span>
                )}
              </h1>
              <p className="text-lg text-gray-500 italic mt-1">{sciName}</p>

              {hasImage && (
                <div className="mt-4 border-t pt-4">
                  <p className="text-sm text-gray-600">
                    Photo by <span className="font-medium">{species.author}</span>
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    License:{" "}
                    <span className="bg-gray-200/70 rounded-md px-1.5 py-0.5 text-xs">
                      {LicenseLabel[species.license as License] || species.license}
                    </span>
                  </p>
                  {species.source && (
                    <p className="text-sm text-gray-600 mt-1">
                      Source: {ImgSourceLabel[species.source as ImgSource] || species.source}
                      {sourceUrl && (
                        <>
                          {" · "}
                          <a href={sourceUrl} target="_blank" className="text-blue-600 hover:underline">
                            View original
                          </a>
                        </>
                      )}
                    </p>
                  )}
                </div>
              )}

              {!hasImage && (
                <div className="mt-4 border-t pt-4">
                  <p className="text-sm text-gray-600">
                    Know of a Creative Commons image for this species?{" "}
                    <Link href="/suggest" className="text-blue-600 hover:underline">
                      Suggest one
                    </Link>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ClientPage>
  );
}
