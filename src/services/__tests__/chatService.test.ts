import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  generateUUID,
  validateMessageContent,
  formatMessageTime,
  filterMessagesForUser,
  subscribeToTradeChat,
  type TradeChatMessage,
} from "../chatService.ts";

describe("chatService - Lógica y Dominio de Chat de Trueques", () => {
  it("generateUUID - genera un identificador válido compatible con el formato RFC4122 v4", () => {
    const uuid = generateUUID();
    assert.match(
      uuid,
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );
  });

  it("validateMessageContent - rechaza mensajes vacíos o de puros espacios", () => {
    const emptyResult = validateMessageContent("   ");
    assert.strictEqual(emptyResult.valid, false);
    assert.strictEqual(emptyResult.error, "El mensaje no puede estar vacío");

    const validResult = validateMessageContent("Hola, ¿sigue disponible el trueque?");
    assert.strictEqual(validResult.valid, true);
  });

  it("validateMessageContent - rechaza mensajes que excedan los 2000 caracteres", () => {
    const longMessage = "a".repeat(2001);
    const result = validateMessageContent(longMessage);
    assert.strictEqual(result.valid, false);
    assert.strictEqual(result.error, "El mensaje excede el límite de 2000 caracteres");
  });

  it("formatMessageTime - formatea correctamente cadenas ISO a HH:mm", () => {
    const formatted = formatMessageTime("2026-11-22T14:30:00.000Z");
    assert.match(formatted, /^\d{2}:\d{2}$/);

    const invalid = formatMessageTime("fecha-invalida");
    assert.strictEqual(invalid, "");
  });

  it("filterMessagesForUser - aísla mensajes de la publicación y respeta privacidad", () => {
    const mockMessages: TradeChatMessage[] = [
      {
        id: "4ca14182-8271-4888-b56e-3f63ca1e9ce7",
        publicacionId: "pub-1",
        emisorId: "user-a",
        receptorId: "user-b",
        contenido: "Mensaje 1",
        leido: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: "5ca14182-8271-4888-b56e-3f63ca1e9ce8",
        publicacionId: "pub-2",
        emisorId: "user-c",
        receptorId: "user-d",
        contenido: "Mensaje de otra publicación",
        leido: false,
        createdAt: new Date().toISOString(),
      },
    ];

    const filteredPub1 = filterMessagesForUser(mockMessages, "user-a", "pub-1");
    assert.strictEqual(filteredPub1.length, 1);
    assert.strictEqual(filteredPub1[0].id, "4ca14182-8271-4888-b56e-3f63ca1e9ce7");

    const filteredAjeno = filterMessagesForUser(mockMessages, "user-impostor", "pub-1");
    assert.strictEqual(filteredAjeno.length, 0);
  });

  it("subscribeToTradeChat - inicializa y retorna callback de desuscripción seguro", () => {
    const unsub = subscribeToTradeChat("pub-test", () => {});
    assert.strictEqual(typeof unsub, "function");
    assert.doesNotThrow(() => {
      unsub();
    });
  });
});
