import mongoose from "mongoose";
import { SpeciesT } from "lib/types";
const { Schema, model, models } = mongoose;

const NomenclatureSchema = new Schema(
  {
    name: String,
    sciName: String,
    familyCode: String,
    order: Number,
    isExtinct: Boolean,
  },
  { _id: false }
);

const SpeciesSchema = new Schema({
  _id: {
    type: String,
    required: true,
  },
  sourceKey: String,
  taxonVersions: [String],
  latestNomenclature: NomenclatureSchema,
  nomenclature: {
    type: Map,
    of: NomenclatureSchema,
    default: {},
  },
  source: String,
  sourceId: String,
  iNatObsId: String,
  iNatUserId: String,
  iNatFileExt: String,
  author: String,
  license: String,
  licenseVer: String,
  crop: {
    percent: {
      x: Number,
      y: Number,
      width: Number,
      height: Number,
    },
    pixel: {
      x: Number,
      y: Number,
      width: Number,
      height: Number,
    },
  },
  active: {
    type: Boolean,
    default: true,
  },
  downloadedAt: Date,
  flip: Boolean,
  isProcessed: Boolean,
  isUploaded: Boolean,
});

const Species = models.Species || model("Species", SpeciesSchema);

export default Species as mongoose.Model<SpeciesT>;
