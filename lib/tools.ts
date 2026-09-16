import { getRoomStatus, getCheckoutTime, orderRoomService } from "./mockPMS";
import { getFullHouseRules } from "./faqSearch";
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

export async function executeTool(name: string, args: Record<string, unknown>) {
  switch (name) {
    case "getRoomStatus": {
      const roomNumber = Number(args.roomNumber);
      if (Number.isNaN(roomNumber)) {
        return { error: "roomNumber fehlt oder ist ungültig" };
      }
      return getRoomStatus(roomNumber);
    }

    case "getCheckoutTime": {
      const roomNumber = Number(args.roomNumber);
      if (Number.isNaN(roomNumber)) {
        return { error: "roomNumber fehlt oder ist ungültig" };
      }
      return getCheckoutTime(roomNumber);
    }

    case "orderRoomService": {
      const roomNumber = Number(args.roomNumber);
      const item = typeof args.item === "string" ? args.item : undefined;
      if (Number.isNaN(roomNumber) || !item) {
        return { error: "roomNumber oder item fehlt bzw. ist ungültig" };
      }
      return orderRoomService(roomNumber, item);
    }
case "searchHotelInfo": {
  return { info: getFullHouseRules() };
}

    default:
      return { error: `Unbekanntes Tool: ${name}` };
  }
}