import { createHash, timingSafeEqual } from "node:crypto";

const hash = (value) => createHash("sha256").update(value).digest();

export const verifyPasscode = (input, expected) => {
  if (typeof input !== "string" || typeof expected !== "string" || expected.length === 0) {
    return false;
  }

  return timingSafeEqual(hash(input), hash(expected));
};
