import { getRoomStatus, getCheckoutTime, orderRoomService } from "./mockPMS";

export const toolDefinitions = [
  {
    type: "function" as const,
    function: {
      name: "getRoomStatus",
      description: "Ruft den aktuellen Status eines Hotelzimmers ab, inkl. Reinigungsstatus und Minibar-Sperre.",
      parameters: {
        type: "object",
        properties: { roomNumber: { type: "number", description: "Die Zimmernummer, z.B. 204" } },
        required: ["roomNumber"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "getCheckoutTime",
      description: "Ruft die Check-out-Zeit für ein bestimmtes Zimmer ab.",
      parameters: {
        type: "object",
        properties: { roomNumber: { type: "number", description: "Die Zimmernummer, z.B. 204" } },
        required: ["roomNumber"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "orderRoomService",
      description: "Bestellt einen Artikel vom Room-Service-Menü für ein bestimmtes Zimmer.",
      parameters: {
        type: "object",
        properties: {
          roomNumber: { type: "number", description: "Die Zimmernummer, für die bestellt wird" },
          item: { type: "string", description: "Der gewünschte Artikel, z.B. 'Club Sandwich' oder 'Flasche Wasser'" },
        },
        required: ["roomNumber", "item"],
      },
    },
  },
];

export async function executeTool(name: string, args: Record<string, any>) {
  switch (name) {
    case "getRoomStatus":
      return getRoomStatus(args.roomNumber);
    case "getCheckoutTime":
      return getCheckoutTime(args.roomNumber);
    case "orderRoomService":
      return orderRoomService(args.roomNumber, args.item);
    default:
      return { error: `Unbekanntes Tool: ${name}` };
  }
}