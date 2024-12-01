export type SourceInfoT = {
  author: string;
  license?: License;
  licenseVer?: string;
  sourceIds?: string[];
  iNatFileExts?: string[];
  iNatUserId?: string;
  speciesName?: string;
};

export type Crop = {
  percent: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  pixel: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
};

export type ImgSource = "ebird" | "inat" | "wikipedia" | "flickr";
export const ImgSourceLabel: Record<ImgSource, string> = {
  inat: "iNaturalist",
  ebird: "eBird",
  wikipedia: "Wikipedia",
  flickr: "Flickr",
};

export type License = "cc-by" | "cc-by-nc" | "cc0" | "cc-by-sa" | "cc-by-nc-sa";
export const LicenseLabel: Record<License, string> = {
  cc0: "CC0",
  "cc-by": "CC BY",
  "cc-by-nc": "CC BY-NC",
  "cc-by-nc-sa": "CC BY-NC-SA",
  "cc-by-sa": "CC BY-SA",
};

export type SpeciesT = {
  _id: string;
  sourceKey: string;
  hasImg: boolean;
  name: string;
  sciName: string;
  order: number;
  source: ImgSource;
  sourceId: string;
  author: string;
  license: License;
  licenseVer?: string;
  active: boolean;
  crop: Crop;
  iNatObsId?: string;
  iNatFileExt?: string;
  iNatUserId?: string;
  downloadedAt?: Date;
  familyCode: string;
  taxonVersions: string[];
  flip: boolean;
};

export type SpeciesInput = {
  source: ImgSource;
  sourceId: string;
  author: string;
  crop: Crop;
  license: License;
  licenseVer?: string;
  iNatObsId?: string;
  iNatFileExt?: string;
  iNatUserId?: string;
  flip?: boolean;
};
