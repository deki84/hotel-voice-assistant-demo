import { getRoomStatus, getCheckoutTime, orderRoomService } from "./mockPMS";

describe("getRoomStatus", () => {
  it("gibt den Status eines existierenden Zimmers zurück", async () => {
    const result = await getRoomStatus(204);
    expect(result).toEqual(
      expect.objectContaining({
        roomNumber: 204,
        cleaningStatus: "in_progress",
      })
    );
  });

  it("gibt einen Fehler zurück, wenn das Zimmer nicht existiert", async () => {
    const result = await getRoomStatus(999);
    expect(result).toEqual({ error: "Zimmer 999 wurde nicht gefunden." });
  });
});

describe("getCheckoutTime", () => {
  it("gibt die Check-out-Zeit für ein existierendes Zimmer zurück", async () => {
    const result = await getCheckoutTime(101);
    expect(result).toEqual({ roomNumber: 101, checkoutTime: "11:00" });
  });

  it("gibt einen Fehler zurück, wenn das Zimmer nicht existiert", async () => {
    const result = await getCheckoutTime(999);
    expect(result).toEqual({ error: "Zimmer 999 wurde nicht gefunden." });
  });
});

describe("orderRoomService", () => {
  it("bestellt ein verfügbares Menü-Item erfolgreich", async () => {
    const result = await orderRoomService(101, "Club Sandwich");
    expect(result).toEqual(
      expect.objectContaining({
        success: true,
        roomNumber: 101,
        item: "Club Sandwich",
        price: 14.0,
      })
    );
  });

  it("ist case-insensitive bei der Artikel-Suche", async () => {
    const result = await orderRoomService(101, "club sandwich");
    expect(result).toEqual(
      expect.objectContaining({ success: true, item: "Club Sandwich" })
    );
  });

  it("gibt einen Fehler mit verfügbaren Alternativen zurück, wenn der Artikel nicht existiert", async () => {
    const result = await orderRoomService(101, "Pizza");
    expect(result).toEqual(
      expect.objectContaining({
        error: expect.stringContaining("Pizza"),
        available: expect.arrayContaining(["Club Sandwich"]),
      })
    );
  });

  it("gibt einen Fehler zurück, wenn das Zimmer nicht existiert", async () => {
    const result = await orderRoomService(999, "Club Sandwich");
    expect(result).toEqual({ error: "Zimmer 999 wurde nicht gefunden." });
  });
});
