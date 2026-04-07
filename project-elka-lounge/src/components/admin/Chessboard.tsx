"use client";

import { useState, useTransition } from "react";
import { Building2, Gamepad2 } from "lucide-react";
import { Table, Reservation, freeTable } from "@/app/actions/admin";

const TABLE_NUMBERS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '11.5', '12'];

interface ChessboardProps {
  tables: Table[];
  reservations: Reservation[];
}

const getZoneFromNumber = (number: string): "standard" | "city" | "ps5" => {
  const cityTables = ['1', '2', '3', '4', '5', '6', '7'];
  const ps5Tables = ['10', '12'];
  if (cityTables.includes(number)) return "city";
  if (ps5Tables.includes(number)) return "ps5";
  return "standard";
};

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

export default function Chessboard({ tables, reservations }: ChessboardProps) {
  const [localReservations, setLocalReservations] = useState(reservations);
  const [modalData, setModalData] = useState<{
    tableNumber: string;
    reservation: Reservation;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  const seatedReservations = localReservations.filter((r) => r.status === "seated");
  const seatedTableIds = seatedReservations.map((r) => r.table_id).filter(Boolean);
  
  const tableMap = new Map(tables.map((t) => [t.number.toString(), t]));
  const reservationByTable = new Map(
    seatedReservations.map((r) => [r.table_id, r])
  );

  const handleFreeTable = () => {
    if (!modalData) return;

    setLocalReservations((prev) =>
      prev.map((r) =>
        r.id === modalData.reservation.id ? { ...r, status: "completed" as const, table_id: null } : r
      )
    );

    const reservationId = modalData.reservation.id;
    setModalData(null);

    startTransition(async () => {
      await freeTable(reservationId);
    });
  };

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {TABLE_NUMBERS.map((tableNumber) => {
          const dbTable = tableMap.get(tableNumber);
          const tableId = dbTable?.id || tableNumber;
          const isOccupied = seatedTableIds.includes(tableId);
          const reservation = reservationByTable.get(tableId);
          const zone = getZoneFromNumber(tableNumber);

          return (
            <button
              key={tableNumber}
              onClick={() => {
                if (isOccupied && reservation) {
                  setModalData({ tableNumber, reservation });
                }
              }}
              disabled={isPending}
              className={`
                relative w-full aspect-square bg-[#121217] rounded-3xl border 
                flex flex-col justify-between p-6 transition-all
                ${isPending ? "opacity-70" : ""}
                ${isOccupied 
                  ? "border-orange-500 hover:border-orange-400 cursor-pointer" 
                  : "border-gray-800 hover:border-neon cursor-default"
                }
              `}
            >
              <div className="absolute top-4 left-4">
                {zone === "city" && (
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-blue-400" />
                    <span className="text-xs text-blue-400 font-medium">CITY</span>
                  </div>
                )}
                {zone === "ps5" && (
                  <div className="flex items-center gap-2">
                    <Gamepad2 className="w-5 h-5 text-purple-400" />
                    <span className="text-xs text-purple-400 font-medium">PS5</span>
                  </div>
                )}
              </div>

              {zone === "city" && <CityPattern />}
              {zone === "ps5" && <ControllerPattern />}

              <div className="flex-1 flex items-center justify-center">
                <span className="text-6xl font-extrabold text-white">{tableNumber}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Стол</span>
                <div className={`w-3 h-3 rounded-full ${isOccupied ? "bg-orange-500 animate-pulse" : "bg-green-500 animate-pulse"}`} />
              </div>
            </button>
          );
        })}
      </div>

      {modalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setModalData(null)} />
          <div className="relative bg-[#121217] rounded-3xl border border-gray-800 p-6 w-full max-w-sm">
            <h3 className="text-xl font-bold text-white mb-2">
              Стол {modalData.tableNumber}
            </h3>
            <p className="text-gray-400 mb-6">
              Гость: <span className="text-white">{modalData.reservation.guest?.name || "Гость"}</span>
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleFreeTable}
                disabled={isPending}
                className="flex-1 py-4 px-6 bg-neon hover:bg-neon-hover text-black font-bold rounded-xl transition-colors disabled:opacity-50"
              >
                {isPending ? "Освобождаю..." : "Освободить стол"}
              </button>
              <button
                onClick={() => setModalData(null)}
                className="py-4 px-6 bg-gray-800 hover:bg-gray-700 text-white rounded-xl transition-colors"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
