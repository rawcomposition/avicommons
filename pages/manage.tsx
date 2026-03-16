/* eslint-disable @next/next/no-img-element */
import * as React from "react";
import Link from "next/link";
import { GetServerSideProps } from "next";
import { ImgSourceLabel, LicenseLabel, SpeciesT } from "lib/types";
import Species from "models/Species";
import AdminPage from "components/AdminPage";
import { getUrl } from "lib/species";
import connect from "lib/mongo";
import Families from "data/taxon-families.json";
import SelectBasic from "components/ReactSelectStyled";
import { useRouter } from "next/router";
import { VERSIONS } from "lib/config";

const PER_PAGE = 200;

type Props = {
  species: SpeciesT[];
  currentPage: number;
  totalPages: number;
  percentWithImg: string;
  totalCount: number;
  filteredCount: number;
  withoutImgCount: number;
  filter: string;
  family: string;
  sort: string;
  startCount: number;
  newInLatest: boolean;
};

export default function SpeciesList({
  species,
  currentPage,
  totalPages,
  percentWithImg,
  totalCount,
  filteredCount,
  withoutImgCount,
  filter,
  family,
  sort,
  startCount,
  newInLatest,
}: Props) {
  const router = useRouter();
  const latestVersion = VERSIONS[VERSIONS.length - 1];
  const selectedFamily = Families.find((f) => f.code === family);

  const buildUrl = (overrides: Record<string, string | boolean>) => {
    const params = { page: "1", filter, family, sort, newInLatest: String(newInLatest), ...overrides };
    return `/manage?page=${params.page}&filter=${params.filter}&family=${params.family}&sort=${params.sort}&newInLatest=${params.newInLatest}`;
  };

  return (
    <AdminPage title="Species List">
      <div className="container py-8 mx-auto max-w-3xl">
        <h1 className="text-2xl font-bold mb-4">Species List</h1>
        <div className="flex items-center gap-4 mb-8">
          <p className="font-medium text-sm">
            Images: <span className="font-bold">{percentWithImg}%</span>
          </p>
        </div>
        <div className="flex gap-4 items-center">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image Status</label>
            <SelectBasic
              options={[
                { label: `All (${totalCount.toLocaleString()})`, value: "all" },
                { label: `Without Image (${withoutImgCount.toLocaleString()})`, value: "withoutImg" },
              ]}
              onChange={(selectedOption) => {
                if (selectedOption) {
                  router.push(buildUrl({ filter: selectedOption.value }));
                }
              }}
              value={
                filter === "withoutImg"
                  ? { label: `Without Image (${withoutImgCount.toLocaleString()})`, value: "withoutImg" }
                  : { label: `All (${totalCount.toLocaleString()})`, value: "all" }
              }
              className="w-[220px]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Family</label>
            <SelectBasic
              options={Families.map((family) => ({ label: `${family.name} (${family.count})`, value: family.code }))}
              onChange={(selectedOption) => {
                if (selectedOption) {
                  router.push(buildUrl({ family: selectedOption.value }));
                } else {
                  router.push(buildUrl({ family: "all" }));
                }
              }}
              value={
                selectedFamily
                  ? { label: `${selectedFamily.name} (${selectedFamily.count})`, value: selectedFamily.code }
                  : undefined
              }
              placeholder="Filter by family"
              className="w-[260px]"
              isClearable
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
            <SelectBasic
              options={[
                { label: "Taxonomic", value: "taxonomic" },
                { label: "Downloaded At", value: "downloadedAt" },
              ]}
              onChange={(selectedOption) => {
                if (selectedOption) {
                  router.push(buildUrl({ sort: selectedOption.value }));
                }
              }}
              value={
                sort === "downloadedAt"
                  ? { label: "Downloaded At", value: "downloadedAt" }
                  : { label: "Taxonomic", value: "taxonomic" }
              }
              className="w-[200px]"
            />
          </div>
        </div>
        <div className="mt-3">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={newInLatest}
              onChange={(e) => router.push(buildUrl({ newInLatest: e.target.checked }))}
              className="rounded"
            />
            New in {latestVersion}
          </label>
        </div>
        <p className="mb-4 font-medium mt-6">
          Filtered count: <strong>{filteredCount.toLocaleString()}</strong>
        </p>
        <div className="flex flex-col gap-4">
          {species.map((species, index) => (
            <div key={species._id} className="flex items-center gap-4 bg-gray-100/80 p-4 rounded-md">
              <Link href={`/${species._id}/edit`} target="_blank" className="flex-shrink-0">
                {species.crop && species.downloadedAt ? (
                  <div className="relative">
                    <img
                      src={species.sourceKey ? getUrl(species._id, species.sourceKey, "240") : ""}
                      alt={species.latestNomenclature.name}
                      loading="lazy"
                      className="aspect-[4/3] object-cover w-[100px] rounded-md"
                    />
                  </div>
                ) : (
                  <div className="aspect-[4/3] flex items-center text-gray-500 text-sm justify-center w-[100px] rounded-md bg-gray-200">
                    {!species.crop ? "No Image" : "Pending"}
                  </div>
                )}
              </Link>
              <div>
                <h2 className="text-lg font-bold mb-2">
                  <span className="font-medium text-gray-500 text-[17px]">{index + 1 + startCount}.</span>{" "}
                  {species.latestNomenclature.name}
                  {species.latestNomenclature.isExtinct && <span className="text-red-700 text-sm ml-2">(Extinct)</span>}
                </h2>
                <div className="flex gap-4 text-[13px] text-gray-500">
                  <span>
                    Source: <strong>{ImgSourceLabel[species.source] || "Unknown"}</strong>
                  </span>
                  <span>
                    Author: <strong>{species.author || "None"}</strong>
                  </span>
                  <span>
                    License: <strong>{LicenseLabel[species.license] || "Unknown"}</strong>
                  </span>
                </div>
                <div className="flex gap-4">
                  <Link
                    className="text-sky-600 hover:text-sky-700 font-semibold"
                    href={`/${species._id}/edit`}
                    target="_blank"
                  >
                    {species.crop ? "Edit Image" : "Add Image"}
                  </Link>
                  {!species.crop && (
                    <>
                      <Link
                        className="text-sky-600 hover:text-sky-700 font-semibold"
                        href={`https://www.google.com/search?q=${species.latestNomenclature.name}`}
                        target="_blank"
                      >
                        Google
                      </Link>
                      <Link
                        className="text-sky-600 hover:text-sky-700 font-semibold"
                        href={`https://ebird.org/species/${species._id}`}
                        target="_blank"
                      >
                        eBird
                      </Link>
                      <button
                        type="button"
                        className="text-sky-600 hover:text-sky-700 font-semibold"
                        onClick={() => {
                          open(`/${species._id}/edit`, "_blank");
                          open(
                            `https://www.inaturalist.org/observations?q=${species.latestNomenclature.sciName}&photo_license=cc0,cc-by-nc-sa,cc-by-sa,cc-by-nc,cc-by`,
                            "_blank"
                          );
                          open(
                            `https://www.inaturalist.org/observations?q=${species.latestNomenclature.sciName}&photo_license=cc0,cc-by-nc-sa,cc-by-sa,cc-by-nc,cc-by&order_by=votes`,
                            "_blank"
                          );
                          open(`https://www.inaturalist.org/taxa/${species.latestNomenclature.sciName}`, "_blank");
                        }}
                      >
                        iNat CC
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 flex justify-center">
          {currentPage > 1 && (
            <Link
              href={buildUrl({ page: String(currentPage - 1) })}
              className="mx-2 px-4 py-2 bg-primary hover:bg-secondary text-white rounded"
            >
              Previous
            </Link>
          )}
          <span className="mx-2 px-4 py-2">
            Page {currentPage} of {totalPages}
          </span>
          {currentPage < totalPages && (
            <Link
              href={buildUrl({ page: String(currentPage + 1) })}
              className="mx-2 px-4 py-2 bg-primary hover:bg-secondary text-white rounded"
            >
              Next
            </Link>
          )}
        </div>
      </div>
    </AdminPage>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  if (process.env.NODE_ENV !== "development") {
    return { notFound: true };
  }

  const page = Number(context.query.page) || 1;
  const limit = PER_PAGE;
  const skip = (page - 1) * limit;
  const filter = context.query.filter || "all";
  const family = context.query.family || "all";
  const sort = context.query.sort || "taxonomic";
  const newInLatest = context.query.newInLatest === "true";
  const latestVersion = VERSIONS[VERSIONS.length - 1];

  const baseQuery = { active: true };
  let query: any = baseQuery;
  if (filter === "withoutImg") {
    query = { ...query, crop: { $exists: false } };
  }
  if (family !== "all") {
    query = { ...query, "latestNomenclature.familyCode": family };
  }
  if (newInLatest) {
    query = { ...query, taxonVersions: [latestVersion] };
  }

  await connect();
  const totalCount = await Species.countDocuments(baseQuery);
  const filteredCount = await Species.countDocuments(query);
  const withImgCount = await Species.countDocuments({ ...baseQuery, crop: { $exists: true } });
  const totalPages = Math.ceil(filteredCount / limit);
  const percentWithImg = ((withImgCount / totalCount) * 100).toFixed(1);
  const startCount = (page - 1) * limit;

  const speciesRes = await Species.find(query, [
    "_id",
    "latestNomenclature",
    "source",
    "sourceId",
    "iNatFileExt",
    "downloadedAt",
    "crop",
    "license",
    "author",
    "sourceKey",
  ])
    .sort(sort === "downloadedAt" ? { downloadedAt: -1 } : { "latestNomenclature.order": 1 })
    .skip(skip)
    .limit(limit);

  const species = JSON.parse(JSON.stringify(speciesRes));

  return {
    props: {
      species,
      currentPage: page,
      totalPages,
      percentWithImg,
      totalCount,
      filteredCount,
      withoutImgCount: totalCount - withImgCount,
      filter,
      family,
      sort,
      startCount,
      newInLatest,
    },
  };
};
