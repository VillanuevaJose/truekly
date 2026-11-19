import test from "node:test";
import assert from "node:assert/strict";
import {
  computeHandshakeStatus,
  type TradeProposal,
} from "../tradeService.ts";

test("computeHandshakeStatus - estado inicial pendiente de confirmación", () => {
  const proposal: TradeProposal = {
    id: "trade-1",
    proponenteId: "user-a",
    receptorId: "user-b",
    publicacionOfertadaId: "pub-1",
    publicacionSolicitadaId: "pub-2",
    tituloOfertado: "Audífonos Sony",
    tituloSolicitado: "Teclado Mecánico",
    imagenOfertada: "https://example.com/a.jpg",
    imagenSolicitada: "https://example.com/b.jpg",
    puntoEncuentro: "Plaza de Armas",
    confirmadoProponente: false,
    confirmadoReceptor: false,
    estado: "pendiente",
    createdAt: new Date().toISOString(),
  };

  const statusForA = computeHandshakeStatus(proposal, "user-a");
  assert.strictEqual(statusForA.canConfirm, true);
  assert.strictEqual(statusForA.isCompleted, false);
  assert.strictEqual(statusForA.badgeVariant, "pending");

  const statusForB = computeHandshakeStatus(proposal, "user-b");
  assert.strictEqual(statusForB.canConfirm, true);
  assert.strictEqual(statusForB.isCompleted, false);
});

test("computeHandshakeStatus - confirmación unilateral pasa a esperar contraparte", () => {
  const proposal: TradeProposal = {
    id: "trade-2",
    proponenteId: "user-a",
    receptorId: "user-b",
    publicacionOfertadaId: "pub-1",
    publicacionSolicitadaId: "pub-2",
    tituloOfertado: "Audífonos Sony",
    tituloSolicitado: "Teclado Mecánico",
    imagenOfertada: "https://example.com/a.jpg",
    imagenSolicitada: "https://example.com/b.jpg",
    puntoEncuentro: "Plaza de Armas",
    confirmadoProponente: true,
    confirmadoReceptor: false,
    estado: "confirmado_parcial",
    createdAt: new Date().toISOString(),
  };

  // User A ya confirmó, debe esperar
  const statusForA = computeHandshakeStatus(proposal, "user-a");
  assert.strictEqual(statusForA.canConfirm, false);
  assert.strictEqual(statusForA.badgeVariant, "waiting");

  // User B aún no confirma, debe ver botón de confirmación
  const statusForB = computeHandshakeStatus(proposal, "user-b");
  assert.strictEqual(statusForB.canConfirm, true);
  assert.strictEqual(statusForB.badgeVariant, "pending");
});

test("computeHandshakeStatus - doble confirmación mutua cierra como completada", () => {
  const proposal: TradeProposal = {
    id: "trade-3",
    proponenteId: "user-a",
    receptorId: "user-b",
    publicacionOfertadaId: "pub-1",
    publicacionSolicitadaId: "pub-2",
    tituloOfertado: "Audífonos Sony",
    tituloSolicitado: "Teclado Mecánico",
    imagenOfertada: "https://example.com/a.jpg",
    imagenSolicitada: "https://example.com/b.jpg",
    puntoEncuentro: "Plaza de Armas",
    confirmadoProponente: true,
    confirmadoReceptor: true,
    estado: "completada",
    createdAt: new Date().toISOString(),
  };

  const status = computeHandshakeStatus(proposal, "user-a");
  assert.strictEqual(status.canConfirm, false);
  assert.strictEqual(status.isCompleted, true);
  assert.strictEqual(status.badgeVariant, "completed");
  assert.strictEqual(status.badgeLabel, "Trueque completado");
});

test("computeHandshakeStatus - propuesta cancelada bloquea confirmación", () => {
  const proposal: TradeProposal = {
    id: "trade-4",
    proponenteId: "user-a",
    receptorId: "user-b",
    publicacionOfertadaId: "pub-1",
    publicacionSolicitadaId: "pub-2",
    tituloOfertado: "Audífonos Sony",
    tituloSolicitado: "Teclado Mecánico",
    imagenOfertada: "https://example.com/a.jpg",
    imagenSolicitada: "https://example.com/b.jpg",
    puntoEncuentro: "Plaza de Armas",
    confirmadoProponente: false,
    confirmadoReceptor: false,
    estado: "cancelada",
    createdAt: new Date().toISOString(),
  };

  const status = computeHandshakeStatus(proposal, "user-a");
  assert.strictEqual(status.canConfirm, false);
  assert.strictEqual(status.badgeVariant, "cancelled");
});
