const wait = (ms = 280) => new Promise((resolve) => setTimeout(resolve, ms));

const demoProducts = [
  {
    id: "p-labels",
    slug: "labels",
    name: "Labels & Stickers",
    family: "labels",
    basePrice: 1.8,
    minQuantity: 25,
    minWidth: 20,
    maxWidth: 500,
    minHeight: 20,
    maxHeight: 500,
    defaultWidth: 100,
    defaultHeight: 100,
    material: "Premium vinyl",
  },
  {
    id: "p-race",
    slug: "race-numbers",
    name: "Race & Event Numbers",
    family: "race_numbers",
    basePrice: 3.2,
    minQuantity: 50,
    minWidth: 100,
    maxWidth: 500,
    minHeight: 100,
    maxHeight: 500,
    defaultWidth: 210,
    defaultHeight: 148,
    material: "Weatherproof stock",
  },
  {
    id: "p-mtb",
    slug: "mtb-boards",
    name: "MTB Boards",
    family: "mtb_boards",
    basePrice: 12,
    minQuantity: 10,
    minWidth: 150,
    maxWidth: 500,
    minHeight: 100,
    maxHeight: 400,
    defaultWidth: 240,
    defaultHeight: 180,
    material: "Polypropylene",
  },
  {
    id: "p-stamps",
    slug: "stamps",
    name: "Custom Stamps",
    family: "stamps",
    basePrice: 28,
    minQuantity: 1,
    minWidth: 20,
    maxWidth: 150,
    minHeight: 10,
    maxHeight: 100,
    defaultWidth: 70,
    defaultHeight: 35,
    material: "Rubber + ink",
  },
  {
    id: "p-trophies",
    slug: "trophies",
    name: "Trophies & Awards",
    family: "trophies",
    basePrice: 42,
    minQuantity: 1,
    minWidth: 80,
    maxWidth: 500,
    minHeight: 100,
    maxHeight: 700,
    defaultWidth: 150,
    defaultHeight: 240,
    material: "Acrylic + timber",
  },
  {
    id: "p-laser",
    slug: "laser-cut",
    name: "Laser-cut Work",
    family: "laser_cut",
    basePrice: 18,
    minQuantity: 1,
    minWidth: 20,
    maxWidth: 1000,
    minHeight: 20,
    maxHeight: 1000,
    defaultWidth: 200,
    defaultHeight: 200,
    material: "Acrylic / timber",
  },
];

let demoOrders = [
  {
    id: "order-2052",
    order_number: "DH-2052",
    customer_id: "demo-customer",
    customer_name: "Maya Brooks",
    product_name: "MTB Boards",
    product_slug: "mtb-boards",
    quantity: 40,
    total: 486.4,
    status: "proof",
    proof_status: "awaiting_approval",
    created_at: "2026-11-19T04:12:00Z",
  },
  {
    id: "order-2048",
    order_number: "DH-2048",
    customer_id: "demo-customer",
    customer_name: "Maya Brooks",
    product_name: "Labels & Stickers",
    product_slug: "labels",
    quantity: 250,
    total: 214.2,
    status: "production",
    proof_status: "approved",
    created_at: "2026-11-14T04:12:00Z",
  },
  {
    id: "order-1984",
    order_number: "DH-1984",
    customer_id: "demo-customer",
    customer_name: "Maya Brooks",
    product_name: "Race & Event Numbers",
    product_slug: "race-numbers",
    quantity: 120,
    total: 354.24,
    status: "completed",
    proof_status: "approved",
    created_at: "2026-10-19T04:12:00Z",
  },
];

let demoDesigns = [
  {
    id: "design-good-things",
    name: "Good Things",
    productSlug: "labels",
    productName: "Labels & Stickers",
    designText: "GOOD THINGS",
    color: "#ff5c35",
    updatedAt: "2026-11-12T10:00:00Z",
  },
  {
    id: "design-trail-27",
    name: "Trail 27",
    productSlug: "mtb-boards",
    productName: "MTB Boards",
    designText: "27",
    color: "#7868ff",
    updatedAt: "2026-11-04T10:00:00Z",
  },
];

let demoCartItems = [];

let profile = {
  id: "demo-customer",
  fullName: "Maya Brooks",
  email: "maya@example.com",
  phone: "+91 98765 43210",
  company: "Fieldwork Studio",
};
let addresses = [{
  id: "address-home",
  label: "Home",
  recipientName: "Maya Brooks",
  phone: "+91 98765 43210",
  addressLine1: "100 Feet Road, Indiranagar",
  addressLine2: "",
  city: "Bengaluru",
  state: "Karnataka",
  postalCode: "560038",
  countryCode: "INR",
  isDefault: true,
}];

const createDemoAccessToken = (
  email = profile.email,
  fullName = profile.fullName,
) => {
  const encode = (value) => {
    const bytes = new TextEncoder().encode(JSON.stringify(value));
    const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join(
      "",
    );
    return btoa(binary)
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");
  };
  return `${encode({ alg: "none", typ: "JWT" })}.${encode({ sub: profile.id, email, name: fullName, role: "customer", iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 3600 })}.demo-signature`;
};

const templates = [
  {
    id: "bold-type",
    name: "Bold Type",
    style: "type",
    preview: "MAKE IT\nMATTER",
  },
  { id: "race-day", name: "Race Day", style: "race", preview: "042" },
  {
    id: "minimal-mark",
    name: "Minimal Mark",
    style: "minimal",
    preview: "YOUR\nMARK",
  },
];

const invoices = [
  {
    id: "INV-2048",
    orderNumber: "DH-2048",
    date: "14 Nov 2026",
    amount: 486.4,
    status: "Paid",
  },
  {
    id: "INV-1984",
    orderNumber: "DH-1984",
    date: "19 Oct 2026",
    amount: 354.24,
    status: "Paid",
  },
];

const parseData = (data) => {
  if (!data) return {};
  if (typeof data === "string") {
    try {
      return JSON.parse(data);
    } catch {
      return {};
    }
  }
  return data;
};

const priceFor = ({
  productSlug,
  width,
  height,
  quantity,
  materialMultiplier = 1,
}) => {
  const product =
    demoProducts.find((item) => item.slug === productSlug) || demoProducts[0];
  const areaFactor = Math.max(0.7, (Number(width) * Number(height)) / 10000);
  const multiplier =
    quantity >= 500
      ? 0.68
      : quantity >= 250
        ? 0.76
        : quantity >= 100
          ? 0.84
          : quantity >= 50
            ? 0.92
            : 1;
  const unitPrice = Number(
    (product.basePrice * areaFactor * materialMultiplier * multiplier).toFixed(
      2,
    ),
  );
  const subtotal = Number((unitPrice * quantity).toFixed(2));
  const tax = Number((subtotal * 0.18).toFixed(2));
  return {
    unitPrice,
    subtotal,
    tax,
    total: Number((subtotal + tax).toFixed(2)),
    discountPercent: Math.round((1 - multiplier) * 100),
    currency: "INR",
  };
};

const currentDemoCart = () => {
  const subtotal = Number(demoCartItems.reduce((sum, item) => sum + item.price.subtotal, 0).toFixed(2));
  const tax = Number(demoCartItems.reduce((sum, item) => sum + item.price.tax, 0).toFixed(2));
  return {
    id: demoCartItems.length ? "demo-cart" : null,
    customerId: "demo-customer",
    items: demoCartItems,
    summary: {
      currency: "INR",
      itemCount: demoCartItems.length,
      totalQuantity: demoCartItems.reduce((sum, item) => sum + item.quantity, 0),
      subtotal,
      tax,
      total: Number((subtotal + tax).toFixed(2)),
    },
    createdAt: demoCartItems.length ? new Date().toISOString() : null,
    updatedAt: demoCartItems.length ? new Date().toISOString() : null,
  };
};

const success = (
  config,
  data,
  status = 200,
  message = "Demo request completed.",
) => ({
  data: { status, success: true, message, response: { data } },
  status,
  statusText: "OK",
  headers: { "x-demo-api": "true" },
  config,
  request: null,
});

export async function demoApiAdapter(config) {
  await wait();
  const method = (config.method || "get").toLowerCase();
  const url = String(config.url || "").split("?")[0];
  const data = parseData(config.data);

  if (url === "/auth/login" && method === "post")
    return success(config, {
      user: { id: "demo-customer", email: data.email, fullName: "Maya Brooks" },
      session: {
        accessToken: createDemoAccessToken(data.email, "Maya Brooks"),
        refreshToken: "demo-refresh-token-0000000000",
        expiresAt: Date.now() / 1000 + 3600,
      },
      requiresEmailConfirmation: false,
    });
  if (url === "/auth/signup" && method === "post")
    return success(
      config,
      {
        user: {
          id: "demo-customer",
          email: data.email,
          fullName: data.fullName,
          phone: data.phone,
          role: data.role,
        },
        session: {
          accessToken: createDemoAccessToken(data.email, data.fullName),
          refreshToken: "demo-refresh-token-0000000000",
          expiresAt: Date.now() / 1000 + 3600,
        },
        requiresEmailConfirmation: false,
      },
      201,
    );
  if (url === "/auth/refresh" && method === "post")
    return success(config, {
      user: {
        id: "demo-customer",
        email: profile.email,
        fullName: profile.fullName,
      },
      session: {
        accessToken: createDemoAccessToken(),
        refreshToken: data.refreshToken,
        expiresAt: Date.now() / 1000 + 3600,
      },
      requiresEmailConfirmation: false,
    });
  if (url === "/auth/me")
    return success(config, {
      user: {
        id: "demo-customer",
        email: profile.email,
        fullName: profile.fullName,
        role: "customer",
      },
    });
  if (url === "/auth/logout") return success(config, { loggedOut: true });
  if (url === "/products" && method === "get")
    return success(config, demoProducts);
  if (url === "/products/price" && method === "post")
    return success(config, priceFor(data));
  if (url === "/orders" && method === "get") return success(config, demoOrders);
  if (url === "/orders" && method === "post") {
    const firstItem = data.items?.[0] || {};
    const product = demoProducts.find((item) => item.slug === firstItem.productSlug) || demoProducts[0];
    const pricedItems = (data.items || []).map((item) => priceFor(item));
    const order = {
      id: `order-${Date.now()}`,
      order_number: `DH-${String(Date.now()).slice(-4)}`,
      customer_id: "demo-customer",
      customer_name: profile.fullName,
      product_name: product.name,
      product_slug: firstItem.productSlug,
      quantity: (data.items || []).reduce((sum, item) => sum + Number(item.quantity || 0), 0),
      total: Number(pricedItems.reduce((sum, item) => sum + item.total, 0).toFixed(2)),
      items: data.items,
      status: "order",
      proof_status: "not_started",
      created_at: new Date().toISOString(),
      configuration: data.configuration,
    };
    demoOrders = [order, ...demoOrders];
    return success(config, order, 201, "Order created.");
  }
  const reorderMatch = url.match(/^\/orders\/([^/]+)\/reorder$/);
  if (reorderMatch && method === "post") {
    const source =
      demoOrders.find((item) => item.id === reorderMatch[1]) || demoOrders[0];
    const order = {
      ...source,
      id: `order-${Date.now()}`,
      order_number: `DH-${String(Date.now()).slice(-4)}`,
      status: "order",
      created_at: new Date().toISOString(),
    };
    demoOrders = [order, ...demoOrders];
    return success(config, order, 201);
  }
  const orderMatch = url.match(/^\/orders\/([^/]+)$/);
  if (orderMatch && method === "get")
    return success(
      config,
      demoOrders.find((item) => item.id === orderMatch[1]) || demoOrders[0],
    );
  if (url === "/designs/templates") return success(config, templates);
  if (url === "/cart" && method === "get") return success(config, currentDemoCart());
  if (url === "/cart" && method === "delete") {
    demoCartItems = [];
    return success(config, currentDemoCart());
  }
  if (url === "/cart/items" && method === "post") {
    const product = demoProducts.find((item) => item.slug === data.productSlug) || demoProducts[0];
    const priced = priceFor(data);
    demoCartItems.push({
      id: `cart-item-${Date.now()}`,
      product: { id: product.id, slug: product.slug, name: product.name, family: product.family, active: true },
      quantity: data.quantity,
      width: data.width,
      height: data.height,
      material: data.material || product.material,
      materialMultiplier: data.materialMultiplier || 1,
      configuration: data.configuration || {},
      price: { ...priced, quantity: data.quantity, width: data.width, height: data.height },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return success(config, currentDemoCart(), 201, "Cart item added.");
  }
  const cartItemMatch = url.match(/^\/cart\/items\/([^/]+)$/);
  if (cartItemMatch && method === "put") {
    demoCartItems = demoCartItems.map((item) => {
      if (item.id !== cartItemMatch[1]) return item;
      const updated = { ...item, ...data, configuration: data.configuration || item.configuration, updatedAt: new Date().toISOString() };
      const priced = priceFor({ productSlug: item.product.slug, ...updated });
      return { ...updated, price: { ...priced, quantity: updated.quantity, width: updated.width, height: updated.height } };
    });
    return success(config, currentDemoCart());
  }
  if (cartItemMatch && method === "delete") {
    demoCartItems = demoCartItems.filter((item) => item.id !== cartItemMatch[1]);
    return success(config, currentDemoCart());
  }
  if (url === "/files/upload" && method === "post") {
    return success(config, {
      bucket: "uploads",
      path: `demo-customer/artwork/${Date.now()}-upload.png`,
      originalName: "uploaded-file.png",
      mimeType: "image/png",
      size: 1024,
      category: "artwork",
      signedUrl: "https://example.com/demo-upload.png",
      signedUrlExpiresIn: 3600,
    }, 201);
  }
  if (url === "/designs" && method === "get")
    return success(config, demoDesigns);
  const designDetailMatch = url.match(/^\/designs\/([^/]+)$/);
  if (designDetailMatch && method === "get")
    return success(config, demoDesigns.find((item) => item.id === designDetailMatch[1]));
  if (url === "/designs" && method === "post") {
    const design = {
      id: `design-${Date.now()}`,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    demoDesigns = [design, ...demoDesigns];
    return success(config, design, 201);
  }
  if (url === "/designs/validate" && method === "post") {
    const errors = [];
    if (data.method === "upload" && !data.artworkName)
      errors.push("Upload a PDF, SVG, AI or PNG file.");
    if (data.method === "online" && !String(data.designText || "").trim())
      errors.push("Add text or a logo to your design.");
    return success(config, {
      valid: errors.length === 0,
      errors,
      checks: [
        {
          label: "Artwork is inside the safe area",
          passed: errors.length === 0,
        },
        {
          label: "File format is production ready",
          passed:
            data.method === "online" ||
            /\.(pdf|svg|ai|png)$/i.test(data.artworkName || ""),
        },
        {
          label: "Text and numbers are present",
          passed: Boolean(data.designText) || data.method === "upload",
        },
      ],
    });
  }
  if (url === "/account/profile" && method === "get")
    return success(config, profile);
  if (url === "/account/profile" && method === "put") {
    profile = { ...profile, ...data };
    return success(config, profile);
  }
  if (url === "/addresses" && method === "get")
    return success(config, addresses);
  if (url === "/addresses" && method === "post") {
    const makeDefault = addresses.length === 0 || Boolean(data.isDefault);
    if (makeDefault) addresses = addresses.map((item) => ({ ...item, isDefault: false }));
    const created = { id: `address-${Date.now()}`, ...data, isDefault: makeDefault };
    addresses = [...addresses, created];
    return success(config, created, 201, "Address created.");
  }
  const defaultAddressMatch = url.match(/^\/addresses\/([^/]+)\/default$/);
  if (defaultAddressMatch && method === "put") {
    addresses = addresses.map((item) => ({ ...item, isDefault: item.id === defaultAddressMatch[1] }));
    return success(config, addresses.find((item) => item.id === defaultAddressMatch[1]));
  }
  const addressMatch = url.match(/^\/addresses\/([^/]+)$/);
  if (addressMatch && method === "get")
    return success(config, addresses.find((item) => item.id === addressMatch[1]));
  if (addressMatch && method === "put") {
    if (data.isDefault) addresses = addresses.map((item) => ({ ...item, isDefault: false }));
    addresses = addresses.map((item) => item.id === addressMatch[1] ? { ...item, ...data } : item);
    return success(config, addresses.find((item) => item.id === addressMatch[1]));
  }
  if (addressMatch && method === "delete") {
    const removed = addresses.find((item) => item.id === addressMatch[1]);
    addresses = addresses.filter((item) => item.id !== addressMatch[1]);
    if (removed?.isDefault && addresses.length) addresses[0] = { ...addresses[0], isDefault: true };
    return success(config, { id: addressMatch[1], deleted: true });
  }
  if (url === "/invoices") return success(config, invoices);
  if (url.includes("/proofs/") && url.endsWith("/approve"))
    return success(config, { approved: true, status: "approved" });
  if (url.includes("/proofs/") && url.endsWith("/change-request"))
    return success(config, {
      requested: true,
      status: "changes_requested",
      message: data.message,
    });
  if (url === "/payments" && method === "post")
    return success(config, {
      id: `pay-${Date.now()}`,
      status: "paid",
      amount: data.amount,
    });
  return success(config, { demo: true, url, method });
}
