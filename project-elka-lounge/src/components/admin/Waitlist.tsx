"use client";

import { useState, useTransition } from "react";
import { Users, Clock, Phone, Check, X } from "lucide-react";
import { Reservation, Table, seatGuest } from "@/app/actions/admin";

interface WaitlistProps {
  reservations: Reservation[];
  tables: Table[];
}

export default function Waitlist({ reservations, tables }: WaitlistProps) {
  const [localReservations, setLocalReservations] = useState(reservations);
  const [seatingReservation, setSeatingReservation] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const waitlistReservations = localReservations.filter(
    (r) => r.status === "waitlist" || r.status === "confirmed"
  );

  const seatedTableIds = localReservations
    .filter((r) => r.status === "seated")
    .map((r) => r.table_id)
    .filter(Boolean);

  const freeTables = tables.filter((t) => !seatedTableIds.includes(t.id));

  const getTimeFromDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleSeat = (reservationId: string) => {
    if (!selectedTable) return;

    setMessage(null);

    setLocalReservations((prev) =>
      prev.map((r) =>
        r.id === reservationId ? { ...r, status: "seated" as const, table_id: selectedTable } : r
      )
    );

    setSeatingReservation(null);
    setSelectedTable("");

    startTransition(async () => {
      const result = await seatGuest(reservationId, selectedTable);
      if (!result.success) {
        setMessage({ type: "error", text: result.message });
        setLocalReservations(reservations);
      } else {
        setMessage({ type: "success", text: "Гость успешно посажен!" });
      }
    });
  };

  return (
    <div className="bg-[#121217] rounded-3xl border border-gray-800 overflow-hidden">
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-neon">Лист ожидания</h3>
          <span className="px-3 py-1 bg-neon/20 text-neon rounded-full text-sm font-medium">
            {waitlistReservations.length}
          </span>
        </div>
      </div>

      {message && (
        <div className={`mx-4 mt-4 p-3 rounded-xl text-sm ${
          message.type === "success" 
            ? "bg-green-900/30 border border-green-500 text-green-400" 
            : "bg-red-900/30 border border-red-500 text-red-400"
        }`}>
          {message.text}
        </div>
      )}

      <div className="max-h-[600px] overflow-y-auto">
        {waitlistReservations.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-gray-700 mx-auto mb-4" />
            <p className="text-gray-500">Пока нет записей</p>
            <p className="text-sm text-gray-600 mt-1">Новые бронирования появятся здесь</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {waitlistReservations.map((item) => (
              <div key={item.id} className={`p-4 hover:bg-gray-800/50 transition-colors ${isPending ? "opacity-50" : ""}`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-white text-lg">
                      {item.guest?.name || "Гость"}
                    </h4>
                    <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
                      <Phone className="w-3 h-3" />
                      {item.guest?.phone || "Нет телефона"}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-neon">
                      <Clock className="w-4 h-4" />
                      <span className="font-medium">{getTimeFromDate(item.arrival_time)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
                      <Users className="w-3 h-3" />
                      {Math.floor(item.expected_duration_minutes / 60)}ч
                    </div>
                  </div>
                </div>

                {seatingReservation === item.id ? (
                  <div className="space-y-2">
                    <select
                      value={selectedTable}
                      onChange={(e) => setSelectedTable(e.target.value)}
                      className="w-full h-12 bg-[#1a1a2e] border border-gray-700 rounded-xl text-white px-4 appearance-none cursor-pointer"
                    >
                      <option value="">Выберите стол</option>
                      {freeTables.map((table) => (
                        <option key={table.id} value={table.id}>
                          Стол {table.number}
                        </option>
                      ))}
                    </select>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSeat(item.id)}
                        disabled={!selectedTable || isPending}
                        className="flex-1 py-3 px-4 bg-neon hover:bg-neon-hover text-black font-semibold rounded-xl text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <Check className="w-4 h-4" />
                        {isPending ? "Посадка..." : "Подтвердить"}
                      </button>
                      <button
                        onClick={() => {
                          setSeatingReservation(null);
                          setSelectedTable("");
                        }}
                        className="py-3 px-4 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setSeatingReservation(item.id)}
                    disabled={isPending}
                    className="w-full py-3 px-4 bg-neon hover:bg-neon-hover text-black font-semibold rounded-xl text-sm transition-colors disabled:opacity-50"
                  >
                    Посадить
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
