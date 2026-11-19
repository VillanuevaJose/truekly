import test from "node:test";
import assert from "node:assert/strict";
import {
  mapRowToProduct,
  buildRowPayload,
  type PublicationRow,
} from "../publicationService.ts";
import type { Product } from "../../data/mockProducts.ts";

test("mapRowToProduct - mapea fila de Supabase a modelo Product del dominio", () => {
  const row: PublicationRow = {
    id: "pub-123",
    user_id: "usr-456",
    title: "Cámara Vintage Canon AE-1",
    category: "tecnologia",
    condition: "como-nuevo",
    wants_in_return: "Guitarra acústica o pedales",
    description: "En excelente estado mecánico y óptico.",
    zone: "Chimbote Centro",
    safe_point_recommended: "Plaza de Armas",
    image: "https://example.com/cam1.jpg",
    gallery: ["https://example.com/cam1.jpg", "https://example.com/cam2.jpg"],
    owner_name: "@fotografo",
    owner_avatar: null,
    owner_verified: true,
  };

  const product = mapRowToProduct(row);

  assert.strictEqual(product.id, "pub-123");
  assert.strictEqual(product.userId, "usr-456");
  assert.strictEqual(product.title, "Cámara Vintage Canon AE-1");
  assert.strictEqual(product.category, "tecnologia");
  assert.strictEqual(product.condition, "como-nuevo");
  assert.strictEqual(product.wantsInReturn, "Guitarra acústica o pedales");
  assert.strictEqual(product.safePointRecommended, "Plaza de Armas");
  assert.strictEqual(product.gallery?.length, 2);
  assert.strictEqual(product.owner.name, "@fotografo");
  assert.strictEqual(product.owner.verified, true);
  assert.ok(product.owner.avatar.includes("unsplash"));
});

test("mapRowToProduct - asigna fallback seguro de safePoint y gallery si vienen vacíos", () => {
  const row: PublicationRow = {
    id: "pub-999",
    user_id: null,
    title: "Libro Clean Code",
    category: "libros",
    condition: "bueno",
    wants_in_return: "Libro de Rust",
    description: "Leído una vez",
    zone: "Nuevo Chimbote",
    safe_point_recommended: null,
    image: "https://example.com/libro.jpg",
    gallery: [],
    owner_name: "Lector Anon",
    owner_avatar: null,
    owner_verified: false,
  };

  const product = mapRowToProduct(row);

  assert.strictEqual(product.safePointRecommended, "Punto acordado por chat");
  assert.deepStrictEqual(product.gallery, ["https://example.com/libro.jpg"]);
  assert.strictEqual(product.userId, undefined);
});

test("buildRowPayload - serializa Product para inserción atómica en base de datos", () => {
  const product: Product = {
    id: "usr-pub-99",
    title: "Bicicleta Trek R29",
    image: "https://example.com/bici.jpg",
    gallery: ["https://example.com/bici.jpg"],
    category: "Deportes",
    condition: "Buen estado",
    wantsInReturn: "Laptop i5 o similar",
    zone: "Chimbote",
    rating: 5,
    exchangesCount: 2,
    owner: {
      name: "@ciclista",
      avatar: "https://example.com/avatar.jpg",
      verified: true,
    },
    description: "Mantenimiento al día.",
    safePointRecommended: "Megaplaza Chimbote",
  };

  const payload = buildRowPayload(product, "auth-user-001");

  assert.strictEqual(payload.id, "usr-pub-99");
  assert.strictEqual(payload.user_id, "auth-user-001");
  assert.strictEqual(payload.title, "Bicicleta Trek R29");
  assert.strictEqual(payload.wants_in_return, "Laptop i5 o similar");
  assert.strictEqual(payload.safe_point_recommended, "Megaplaza Chimbote");
  assert.strictEqual(payload.owner_verified, true);
});
