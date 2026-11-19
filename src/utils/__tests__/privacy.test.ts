import test from "node:test";
import assert from "node:assert/strict";
import { maskNameYape, maskEmailAddress } from "../privacy.ts";

test("maskNameYape - censura con desglose de RENIEC completo", () => {
  const result = maskNameYape(
    "Ladi Jose Villanueva Colonia",
    "Ladi",
    "Jose",
    "Villanueva",
    "Colonia"
  );
  assert.strictEqual(result, "Ladi Jose Vi*** Co***");
});

test("maskNameYape - censura con un solo nombre y un apellido", () => {
  const result = maskNameYape(
    "Carlos Mendoza",
    "Carlos",
    undefined,
    "Mendoza",
    undefined
  );
  assert.strictEqual(result, "Carlos Me***");
});

test("maskNameYape - fallback con cadena de texto completa (3 palabras)", () => {
  const result = maskNameYape("Juan Carlos Quispe");
  assert.strictEqual(result, "Juan Ca*** Qu***");
});

test("maskNameYape - fallback con apellido corto (<=2 caracteres)", () => {
  const result = maskNameYape("Ana Yu");
  assert.strictEqual(result, "Ana Yu*");
});

test("maskEmailAddress - enmascara email estándar", () => {
  const result = maskEmailAddress("erickarturo@gmail.com");
  assert.ok(result.startsWith("er"));
  assert.ok(result.endsWith("o@gmail.com"));
  assert.ok(result.includes("•"));
});

test("maskEmailAddress - maneja usuario corto (<=2 caracteres)", () => {
  const result = maskEmailAddress("ab@truekly.pe");
  assert.strictEqual(result, "a*@truekly.pe");
});

test("maskEmailAddress - sanitiza emails inválidos o nulos", () => {
  assert.strictEqual(maskEmailAddress(""), "•••••••@••••.com");
  assert.strictEqual(maskEmailAddress("correoInvalido"), "•••••••@••••.com");
});
