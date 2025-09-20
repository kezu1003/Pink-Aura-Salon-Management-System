import mongoose from "mongoose";

export const PACKAGE_CATEGORIES = [
  "Hair",
  "Nails",
  "Makeup",
  "Facials",
  "Bridal",
  "Spa",
  "Other",
];

const seasonalOfferSchema = new mongoose.Schema(
  {
    enabled: { type: Boolean, default: false },
    label: { type: String, trim: true, default: "" },
    startsAt: { type: Date, default: null },
    endsAt: { type: Date, default: null },
  },
  { _id: false }
);

const packageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    description: { type: String, trim: true, default: "", maxlength: 2000 },

   
    servicesIncluded: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.every((s) => typeof s === "string"),
        message: "servicesIncluded must be an array of strings",
      },
    },

    category: { type: String, enum: PACKAGE_CATEGORIES, default: "Other", index: true },

    price: { type: Number, required: true, min: 0 },

    
    discountPrice: {
      type: Number,
      min: 0,
      validate: {
        validator: function (v) {
          if (v == null) return true;

         
          let price = this.price; 

          if (typeof this.getUpdate === "function") {
            const upd = this.getUpdate() || {};
            const set = upd.$set || upd;
            if (typeof set.price === "number") price = set.price;
          }

          if (price == null) return true; 
          return Number(v) < Number(price);
        },
        message: "discountPrice must be less than price",
      },
    },

    estimatedTimeMins: { type: Number, min: 10, max: 600, default: 60 },
    image: { type: String, default: "" },
    popularityScore: { type: Number, default: 0, min: 0 },

    seasonalOffer: { type: seasonalOfferSchema, default: () => ({}) },

    isActive: { type: Boolean, default: true, index: true },
    isArchived: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);


packageSchema.index({ name: 1, category: 1 }, { unique: true });

const Package = mongoose.model("Package", packageSchema);
export default Package;
