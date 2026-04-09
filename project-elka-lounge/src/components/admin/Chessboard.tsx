"use client";

import { useState } from "react";
import { Building2, Gamepad2, Clock, Users, Phone, X, Check } from "lucide-react";
import { Table, Reservation } from "@/app/actions/admin";
import TableManagementModal from "./TableManagementModal";
import { toDisplayNumber, DISPLAY_TO_DB_NUMBER } from "@/lib/tableDisplay";

interface ChessboardProps {
  tables: Table[];
  reservations: Reservation[];
  onFreeTable?: (reservationId: string) => void;
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

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Novosibirsk",
  });
};

export default function Chessboard({
  tables,
  reservations,
  onFreeTable,
  onReservationCreated,
}: ChessboardProps) {
  const [selectedTable, setSelectedTable] = useState<{
    table: Table;
    reservation: Reservation;
  } | null>(null);
  const [managingTableId, setManagingTableId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const activeReservations = reservations.filter(
    (r) => r.status === "waitlist" || r.status === "confirmed" || r.status === "seated"
  );

  const tableByNumber = new Map(tables.map((t) => [String(t.number), t]));
  for (const [displayName, dbNumber] of Object.entries(DISPLAY_TO_DB_NUMBER)) {
    const table = tables.find((t) => t.number === dbNumber);
    if (table) tableByNumber.set(displayName, table);
  }
  const reservationByTableId = new Map(
    activeReservations
      .filter((r) => r.table_id)
      .map((r) => [String(r.table_id), r])
  );

  const handleFreeTable = async () => {
    if (!selectedTable || !onFreeTable) return;
    const reservationId = selectedTable.reservation.id;
    setIsProcessing(true);
    setSelectedTable(null);
    try {
      await onFreeTable(reservationId);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {TABLE_NUMBERS.map((tableNumber) => {
          const dbTable = tableByNumber.get(tableNumber);
          const reservation = dbTable ? reservationByTableId.get(String(dbTable.id)) : null;
          const isOccupied = !!reservation;
          const isBlocked = !!reservation && isBlockReservation(reservation);
          const zone = getZoneFromNumber(tableNumber);

          return (
            <button
              key={tableNumber}
              onClick={() => {
                if (!dbTable) return;
                if (reservation) {
                  setSelectedTable({ table: dbTable, reservation });
                } else {
                  setManagingTableId(dbTable.id);
                }
              }}
              disabled={isProcessing}
              className={`
                relative w-full aspect-square rounded-3xl border 
                flex flex-col justify-between p-6 transition-all duration-200
                ${isProcessing ? "opacity-70" : ""}
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

      {selectedTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedTable(null)}
          />
          <div className="relative bg-[#1C1C1E] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <button
              onClick={() => setSelectedTable(null)}
              className="absolute top-4 right-4 text-[#98989D] hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-[#9ffb00]/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-3xl font-black text-[#9ffb00]">{toDisplayNumber(selectedTable.table.number)}</span>
              </div>
              <h3 className="text-2xl font-bold text-white">Стол {toDisplayNumber(selectedTable.table.number)}</h3>
              <div className="flex items-center justify-center gap-2 mt-2">
                {isBlockReservation(selectedTable.reservation) ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-orange-500/20 text-orange-400">
                    Блок
                  </span>
                ) : null}
                <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${
                  selectedTable.reservation.status === "seated"
                    ? "bg-orange-500/20 text-orange-400"
                    : selectedTable.reservation.status === "waitlist"
                    ? "bg-green-500/20 text-green-400"
                    : "bg-blue-500/20 text-blue-400"
                }`}>
                  {selectedTable.reservation.status === "seated" ? "За столом" :
                   selectedTable.reservation.status === "waitlist" ? "В ожидании" :
                   "Подтверждено"}
                </span>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3 p-3 bg-[#2C2C2E] rounded-xl">
                <div className="w-10 h-10 bg-[#9ffb00]/20 rounded-full flex items-center justify-center">
                  <span className="text-lg">👤</span>
                </div>
                <div>
                  <p className="text-[#98989D] text-xs">Гость</p>
                  <p className={`font-semibold ${isBlockReservation(selectedTable.reservation) ? "text-orange-400" : "text-white"}`}>
                    {selectedTable.reservation.guest?.name || "Неизвестно"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-[#2C2C2E] rounded-xl">
                <div className="w-10 h-10 bg-[#9ffb00]/20 rounded-full flex items-center justify-center">
                  <Clock className="w-5 h-5 text-[#9ffb00]" />
                </div>
                <div>
                  <p className="text-[#98989D] text-xs">Время</p>
                  <p className="text-white font-semibold">{formatTime(selectedTable.reservation.arrival_time)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-[#2C2C2E] rounded-xl">
                <div className="w-10 h-10 bg-[#9ffb00]/20 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-[#9ffb00]" />
                </div>
                <div>
                  <p className="text-[#98989D] text-xs">Длительность</p>
                  <p className="text-white font-semibold">
                    {Math.floor(selectedTable.reservation.expected_duration_minutes / 60)} ч
                  </p>
                </div>
              </div>

              {selectedTable.reservation.guest?.phone && (
                <div className="flex items-center gap-3 p-3 bg-[#2C2C2E] rounded-xl">
                  <div className="w-10 h-10 bg-[#9ffb00]/20 rounded-full flex items-center justify-center">
                    <Phone className="w-5 h-5 text-[#9ffb00]" />
                  </div>
                  <div>
                    <p className="text-[#98989D] text-xs">Телефон</p>
                    <p className="text-white font-semibold">{selectedTable.reservation.guest.phone}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleFreeTable}
                disabled={isProcessing}
                className="flex-1 py-3 px-4 bg-[#9ffb00] hover:bg-[#8bdc00] text-black font-bold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5" />
                {isProcessing ? "Освобождаю..." : "Завершить"}
              </button>
              <button
                onClick={() => setSelectedTable(null)}
                className="py-3 px-4 bg-[#3A3A3C] hover:bg-[#4A4A4C] text-white rounded-xl transition-all"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}

      <TableManagementModal
        isOpen={!!managingTableId}
        onClose={() => setManagingTableId(null)}
        onSuccess={() => {
          if (onReservationCreated) onReservationCreated();
        }}
        tables={tables}
        reservations={reservations}
        initialTableId={managingTableId ?? ""}
      />
    </>
  );
}
