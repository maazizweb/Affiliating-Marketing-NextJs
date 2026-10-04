export class WooCommerceError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string = "woocommerce_error",
  ) {
    super(message);
    this.name = "WooCommerceError";
  }

  get isNotFound() {
    return this.status === 404;
  }
}
