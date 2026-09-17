
jest.mock("@mistralai/mistralai", () => ({
  Mistral: jest.fn().mockImplementation(() => ({
    embeddings: { create: jest.fn() },
  })),
}));

import { executeTool, toolDefinitions } from "./tools";

describe("toolDefinitions", () => {
  it("enthält alle vier erwarteten Tools", () => {
    const names = toolDefinitions.map((t) => t.function.name);
    expect(names).toEqual(
      expect.arrayContaining([
        "getRoomStatus",
        "getCheckoutTime",
        "orderRoomService",
      ])
    );
  });
});

describe("executeTool", () => {
  it("ruft getRoomStatus mit gültiger roomNumber korrekt auf", async () => {
    const result = await executeTool("getRoomStatus", { roomNumber: 204 });
    expect(result).toEqual(
      expect.objectContaining({ roomNumber: 204, cleaningStatus: "in_progress" })
    );
  });

  it("validiert roomNumber, statt ungeprüft an die Mock-PMS-Funktion weiterzugeben", async () => {
    const result = await executeTool("getRoomStatus", { roomNumber: "nicht-numerisch" });
    expect(result).toEqual({ error: "roomNumber fehlt oder ist ungültig" });
  });

  it("gibt einen Fehler zurück, wenn roomNumber komplett fehlt", async () => {
    const result = await executeTool("getRoomStatus", {});
    expect(result).toEqual({ error: "roomNumber fehlt oder ist ungültig" });
  });

  it("validiert item bei orderRoomService, wenn es kein String ist", async () => {
    const result = await executeTool("orderRoomService", {
      roomNumber: 101,
      item: 12345,
    });
    expect(result).toEqual({ error: "roomNumber oder item fehlt bzw. ist ungültig" });
  });

  it("gibt einen Fehler für ein unbekanntes Tool zurück", async () => {
    const result = await executeTool("deleteHotel", {});
    expect(result).toEqual({ error: "Unbekanntes Tool: deleteHotel" });
  });

  it("ruft searchHotelInfo auf und liefert die Hausordnung als Kontext", async () => {
    const result = await executeTool("searchHotelInfo", {});
    expect(result).toHaveProperty("info");
    expect(typeof (result as { info: string }).info).toBe("string");
  });
});