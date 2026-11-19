export const products = [
  {
    slug: "labels",
    name: "Labels & Stickers",
    short: "Labels",
    code: "01",
    accent: "#ff5c35",
    description:
      "Die-cut, kiss-cut and sheeted labels built for products that move.",
    material: "Premium vinyl",
    basePrice: 1.8,
    minQty: 25,
    shape: "circle",
  },
  {
    slug: "race-numbers",
    name: "Race & Event Numbers",
    short: "Race numbers",
    code: "02",
    accent: "#b9f227",
    description:
      "Variable-data race bibs with crisp numbering and sponsor lockups.",
    material: "Weatherproof stock",
    basePrice: 3.2,
    minQty: 50,
    shape: "bib",
  },
  {
    slug: "mtb-boards",
    name: "MTB Boards",
    short: "MTB boards",
    code: "03",
    accent: "#7868ff",
    description:
      "Trail-tough handlebar boards, shaped and drilled to your format.",
    material: "Polypropylene",
    basePrice: 12,
    minQty: 10,
    shape: "board",
  },
  {
    slug: "stamps",
    name: "Custom Stamps",
    short: "Stamps",
    code: "04",
    accent: "#49c5b6",
    description:
      "Self-inking marks for packaging, paperwork and maker signatures.",
    material: "Rubber + ink",
    basePrice: 28,
    minQty: 1,
    shape: "stamp",
  },
  {
    slug: "trophies",
    name: "Trophies & Awards",
    short: "Trophies",
    code: "05",
    accent: "#f6b83f",
    description: "Layered, engraved awards for podiums, teams and milestones.",
    material: "Acrylic + timber",
    basePrice: 42,
    minQty: 1,
    shape: "trophy",
  },
  {
    slug: "laser-cut",
    name: "Laser-cut Work",
    short: "Laser cut",
    code: "06",
    accent: "#4aa8ff",
    description:
      "Precision-cut signage, tags and one-off objects in custom sizes.",
    material: "Acrylic / timber",
    basePrice: 18,
    minQty: 1,
    shape: "laser",
  },
];

export const orders = [
  {
    id: "DH-2048",
    product: "MTB Boards",
    quantity: 40,
    total: 486.4,
    status: "Production",
    date: "14 Nov 2026",
    color: "#7868ff",
  },
  {
    id: "DH-2031",
    product: "Labels & Stickers",
    quantity: 250,
    total: 214.2,
    status: "Proof",
    date: "08 Nov 2026",
    color: "#ff5c35",
  },
  {
    id: "DH-1984",
    product: "Race & Event Numbers",
    quantity: 120,
    total: 354.24,
    status: "Completed",
    date: "19 Oct 2026",
    color: "#b9f227",
  },
];

export function calculatePrice(
  product,
  width,
  height,
  quantity,
  materialMultiplier = 1,
) {
  const areaFactor = Math.max(0.7, (width * height) / 10000);
  const volume =
    quantity >= 500
      ? 0.68
      : quantity >= 250
        ? 0.76
        : quantity >= 100
          ? 0.84
          : quantity >= 50
            ? 0.92
            : 1;
  const unit = product.basePrice * areaFactor * materialMultiplier * volume;
  const subtotal = unit * quantity;
  const tax = subtotal * 0.18;
  return {
    unit,
    subtotal,
    tax,
    total: subtotal + tax,
    discount: Math.round((1 - volume) * 100),
  };
}
