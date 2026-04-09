"use client";

import { useState } from "react";
import { Building2, Gamepad2 } from "lucide-react";
import { Table, Reservation } from "@/app/actions/admin";
import TableManagementModal from "./TableManagementModal";
import { DISPLAY_TO_DB_NUMBER } from "@/lib/tableDisplay";

interface ChessboardProps {
  tables: Table[];
  reservations: Reservation[];
  onSeatGuest?: (reservationId: string, tableId: string) => void;
  onReservationCreated?: () => void;
}

const TABLE_NUMBERS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "11.5", "12"];

const getZoneFromNumber = (number: string): "standard" | "city" | "ps5" => {
  const cityTables = ["1", "2", "3", "4", "5", "6", "7", "11.5"];
  const ps5Tables = ["10", "12"];
  if (cityTables.includes(number)) return "city";
  if (ps5Tables.includes(number)) return "ps5";
  return "standard";
};

function isBlockReservation(reservation: Reservation): boolean {
  const name = reservation.guest?.name ?? "";
  return name.toUpperCase().startsWith("БЛОК:");
}

const CityPattern = () => (
  <svg className="absolute inset-0 w-full h-full opacity-5" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="20" y="80" width="30" height="120" fill="currentColor" />
    <rect x="55" y="60" width="25" height="140" fill="currentColor" />
    <rect x="85" y="100" width="35" height="100" fill="currentColor" />
    <rect x="125" y="70" width="20" height="130" fill="currentColor" />
    <rect x="150" y="90" width="30" height="110" fill="currentColor" />
    <polygon points="85,100 102.5,60 120,100" fill="currentColor" />
  </svg>
);

const ControllerPattern = () => (
  <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 45C20 35 30 25 50 25C70 25 80 35 80 45V55C80 65 70 75 50 75C30 75 20 65 20 55V45Z" stroke="currentColor" strokeWidth="4" fill="none" />
    <circle cx="35" cy="50" r="8" stroke="currentColor" strokeWidth="3" fill="none" />
    <circle cx="65" cy="50" r="8" stroke="currentColor" strokeWidth="3" fill="none" />
  </svg>
);

export default function Chessboard({
  tables,
  reservations,
  onReservationCreated,
}: ChessboardProps) {
  const [managingTableId, setManagingTableId] = useState<string | null>(null);

  const activeReservations = reservations.filter(
    (r) => r.status === "waitlist" || r.status === "confirmed" || r.status === "seated"
  );

  const tableByNumber = new Map(tables.map((t) => [String(t.number), t]));
  for (const [displayName, dbNumber] of Object.entries(DISPLAY_TO_DB_NUMBER)) {
    const table = tables.find((t) => t.number === dbNumber);
    if (table) tableByNumber.set(displayName, table);
  }
  const seatedByTableId = new Map(
    reservations
      .filter((r) => r.status === "seated" && r.table_id)
      .map((r) => [String(r.table_id), r])
  );

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {TABLE_NUMBERS.map((tableNumber) => {
          const dbTable = tableByNumber.get(tableNumber);
          const reservation = dbTable 
            ? activeReservations.find(r => r.table_id === dbTable.id)
            : null;
          const seatedReservation = dbTable ? seatedByTableId.get(String(dbTable.id)) : null;
          const isOccupied = !!seatedReservation;
          const isBlocked = !!reservation && isBlockReservation(reservation);
          const zone = getZoneFromNumber(tableNumber);

          return (
            <button
              key={tableNumber}
              onClick={() => {
                if (dbTable) {
                  setManagingTableId(dbTable.id);
                }
              }}
              className={`
                relative w-full aspect-square rounded-3xl border 
                flex flex-col justify-between p-6 transition-all duration-200
                ${isOccupied
                  ? isBlocked
                    ? "bg-[#2C2C2E] border-orange-400/60 hover:border-orange-400 cursor-pointer hover:scale-[1.02]"
                    : "bg-[#2C2C2E] border-orange-500/50 hover:border-orange-400 cursor-pointer hover:scale-[1.02]"
                  : "bg-[#2C2C2E]/50 border-[#3A3A3C] hover:border-[#9ffb00]/30 cursor-pointer hover:scale-[1.02]"
                }
              `}
            >
              {zone === "city" && (
                <div className="absolute top-4 left-4">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-blue-400" />
                    <span className="text-xs text-blue-400 font-medium">CITY</span>
                  </div>
                </div>
              )}
              {zone === "ps5" && (
                <div className="absolute top-4 left-4">
                  <div className="flex items-center gap-2">
                    <Gamepad2 className="w-5 h-5 text-purple-400" />
                    <span className="text-xs text-purple-400 font-medium">PS5</span>
                  </div>
                </div>
              )}

              {zone === "city" && <CityPattern />}
              {zone === "ps5" && <ControllerPattern />}

              <div className="flex-1 flex items-center justify-center">
                <span className="text-6xl font-extrabold text-white">{tableNumber}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-[#98989D]">Стол</span>
                <div className={`w-3 h-3 rounded-full ${
                  isOccupied
                    ? isBlocked
                      ? "bg-orange-400"
                      : "bg-orange-500"
                    : "bg-green-500"
                }`} />
              </div>
            </button>
          );
        })}
      </div>

      <TableManagementModal
        isOpen={!!managingTableId}
        onClose={() => setManagingTableId(null)}
        onSuccess={() => {
          setManagingTableId(null);
          if (onReservationCreated) onReservationCreated();
        }}
        tables={tables}
        reservations={reservations}
        initialTableId={managingTableId ?? ""}
      />
    </>
  );
}
