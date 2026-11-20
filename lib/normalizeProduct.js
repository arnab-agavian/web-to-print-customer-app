import { products as productPresentation } from '@/lib/data';

const findPresentation = (product) => productPresentation.find((item) =>
  item.slug === product?.slug
  || item.name === product?.name
  || item.slug === product?.family
  || item.slug.startsWith(`${product?.family || ''}-`),
);

export function normalizeProduct(product = {}) {
  const presentation = findPresentation(product) || {};

  return {
    ...presentation,
    ...product,
    short: product.short || presentation.short || product.name || 'Product',
    accent: product.accent || presentation.accent || '#7868ff',
    shape: product.shape || presentation.shape || 'board',
    material: product.material || presentation.material || 'Standard print material',
    description: product.description || presentation.description || '',
    minQty: product.minQuantity ?? product.minQty ?? presentation.minQty ?? 1,
    minWidth: product.minWidth ?? 20,
    maxWidth: product.maxWidth ?? 1000,
    minHeight: product.minHeight ?? 20,
    maxHeight: product.maxHeight ?? 1000,
    defaultWidth: product.defaultWidth ?? 100,
    defaultHeight: product.defaultHeight ?? 100,
  };
}

export function normalizeProducts(result) {
  const products = Array.isArray(result) ? result : result?.products || result?.items || [];
  return products.filter((product) => product.active !== false).map(normalizeProduct);
}
