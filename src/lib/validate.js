import validator from "validator";

export function sanitizeInput(input) {
  if (typeof input === "string") {
    return validator.trim(validator.escape(input));
  }
  return input;
}

export function validateProductData(body) {
  return {
    title: sanitizeInput(body.title),
    description: sanitizeInput(body.description),
    price: Number(body.price),
    category: sanitizeInput(body.category),
    size: sanitizeInput(body.size),
    image: sanitizeInput(body.image),
    quantity: Number(body.quantity ?? 1)
  };
}
