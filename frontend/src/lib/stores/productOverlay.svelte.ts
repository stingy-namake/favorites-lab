import type { Product } from '$lib/types';

let selectedProduct = $state<Product | null>(null);

export function getProductOverlay() {
  function open(product: Product) { selectedProduct = product; }
  function close() { selectedProduct = null; }

  return {
    get selectedProduct() { return selectedProduct; },
    open,
    close,
  };
}
