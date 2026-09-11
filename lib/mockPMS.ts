export interface Room {
  roomNumber: number;
  guestName: string;
  cleaningStatus: "clean" | "dirty" | "in_progress";
  checkoutTime: string;
  minibarLocked: boolean;
}

const rooms: Room[] = [
  { roomNumber: 101, guestName: "Familie Meier", cleaningStatus: "clean", checkoutTime: "11:00", minibarLocked: false },
  { roomNumber: 204, guestName: "Dejan Jankovic", cleaningStatus: "in_progress", checkoutTime: "12:00", minibarLocked: true },
  { roomNumber: 310, guestName: "Frau Schmidt", cleaningStatus: "dirty", checkoutTime: "10:00", minibarLocked: false },
];

const roomServiceMenu = [
  { item: "Frühstück Kontinental", price: 18.5 },
  { item: "Club Sandwich", price: 14.0 },
  { item: "Flasche Wasser", price: 4.5 },
];

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getRoomStatus(roomNumber: number) {
  await delay(200);
  const room = rooms.find((r) => r.roomNumber === roomNumber);
  if (!room) return { error: `Zimmer ${roomNumber} wurde nicht gefunden.` };
  return room;
}

export async function getCheckoutTime(roomNumber: number) {
  await delay(150);
  const room = rooms.find((r) => r.roomNumber === roomNumber);
  if (!room) return { error: `Zimmer ${roomNumber} wurde nicht gefunden.` };
  return { roomNumber, checkoutTime: room.checkoutTime };
}

export async function orderRoomService(roomNumber: number, item: string) {
  await delay(300);
  const room = rooms.find((r) => r.roomNumber === roomNumber);
  if (!room) return { error: `Zimmer ${roomNumber} wurde nicht gefunden.` };

  const menuItem = roomServiceMenu.find((m) => m.item.toLowerCase() === item.toLowerCase());
  if (!menuItem) {
    return { error: `"${item}" ist nicht auf der Room-Service-Karte verfügbar.`, available: roomServiceMenu.map((m) => m.item) };
  }

  return { success: true, roomNumber, item: menuItem.item, price: menuItem.price, estimatedDelivery: "25 Minuten" };
}