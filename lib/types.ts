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
  name: string;
  sciName: string;
  order: number;
  isExtinct: boolean;
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
  isProcessed: boolean;
  isUploaded: boolean;
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

export type Stats = {
  total: number;
  withImg: number;
  percent: string;
  license: {
    id: string;
    label: string;
    count: number;
    percent: string;
  }[];
  source: {
    id: string;
    label: string;
    count: number;
    percent: string;
  }[];
  taxonVersions: string[];
};

export type OutputPhoto = {
  code: string;
  name: string;
  sciName: string;
  license: string;
  key: string;
  by: string;
  family: string;
};
