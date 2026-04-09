"use client";

import { useState, useEffect } from "react";
import { X, AlertTriangle, Check, Plus, Minus } from "lucide-react";
import { createAdminReservation } from "@/app/actions/admin";
import { toast } from "sonner";
import { Table } from "@/app/actions/admin";
import { toDisplayNumber } from "@/lib/tableDisplay";

interface AdminBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  tables: Table[];
  initialTableId?: string;
}

const BLOCK_SUGGESTIONS = [
  "БЛОК: Сдвиг столов",
  "БЛОК: Тех. перерыв",
  "БЛОК: Корпоратив",
];

export default function AdminBookingModal({
  isOpen,
  onClose,
  onSuccess,
  tables,
  initialTableId,
}: AdminBookingModalProps) {
  const [selectedTableIds, setSelectedTableIds] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("19:00");
  const [guests, setGuests] = useState(6);
  const [durationHours, setDurationHours] = useState(3);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBlock, setIsBlock] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const today = new Date().toISOString().split("T")[0];
      const now = new Date();
      const hours = now.getHours();
      const defaultTime =
        hours >= 12 && hours < 23 ? `${String(hours + 1).padStart(2, "0")}:00` : "19:00";

      setSelectedTableIds(initialTableId ? [initialTableId] : []);
      setDate(today);
      setTime(defaultTime);
      setName("");
      setPhone("");
      setGuests(6);
      setDurationHours(3);
      setIsBlock(false);
    }
  }, [isOpen, initialTableId]);

  const toggleTable = (tableId: string) => {
    setSelectedTableIds((prev) =>
      prev.includes(tableId)
        ? prev.filter((id) => id !== tableId)
        : [...prev, tableId]
    );
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    if (!selectedTableIds.length) {
      toast.error("Выберите хотя бы один стол", { position: "top-center" });
      return;
    }

    if (!name.trim()) {
      toast.error("Введите имя гостя", { position: "top-center" });
      return;
    }

    setIsSubmitting(true);

    const finalName = isBlock && !name.trim().toUpperCase().startsWith("БЛОК:")
      ? `БЛОК: ${name.trim()}`
      : name.trim();

    const result = await createAdminReservation({
      tableIds: selectedTableIds,
      name: finalName,
      phone: phone.replace(/\D/g, "").length === 10 ? `+7 ${phone}` : phone,
      date,
      time,
      guests,
      durationMinutes: durationHours * 60,
    });

    setIsSubmitting(false);

    if (result.success) {
      toast.success(result.message, { position: "top-center" });
      onSuccess();
      onClose();
    } else {
      toast.error(result.message, {
        position: "top-center",
        duration: 5000,
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-[#1C1C1E] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#98989D] hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-5">
          <div className="w-14 h-14 bg-[#9ffb00]/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <Plus className="w-7 h-7 text-[#9ffb00]" />
          </div>
          <h2 className="text-xl font-bold text-white">Ручное бронирование</h2>
          <p className="text-[#98989D] text-sm mt-1">
            Блокировка или бронь вручную
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex gap-2">
            <button
              onClick={() => setIsBlock(false)}
              className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all ${
                !isBlock
                  ? "bg-[#9ffb00] text-black"
                  : "bg-[#3A3A3C] text-[#98989D]"
              }`}
            >
              Гость
            </button>
            <button
              onClick={() => setIsBlock(true)}
              className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-1 ${
                isBlock
                  ? "bg-orange-500 text-white"
                  : "bg-[#3A3A3C] text-[#98989D]"
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              Блок
            </button>
          </div>

          {isBlock && (
            <div className="flex flex-wrap gap-1">
              {BLOCK_SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => setName(s)}
                  className="text-xs px-2 py-1 bg-orange-500/20 text-orange-400 rounded-lg hover:bg-orange-500/30 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[#98989D] text-xs">
              Имя гостя {!isBlock && <span className="text-red-400">*</span>}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={isBlock ? "БЛОК: Название..." : "Иван"}
              className="w-full h-11 bg-[#2C2C2E] border border-[#3A3A3C] rounded-xl text-white px-4 text-base outline-none focus:border-[#9ffb00] transition-all box-border"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[#98989D] text-xs">Телефон</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(999) 123-45-67"
              className="w-full h-11 bg-[#2C2C2E] border border-[#3A3A3C] rounded-xl text-white px-4 text-base outline-none focus:border-[#9ffb00] transition-all box-border"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[#98989D] text-xs">Дата</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full h-11 bg-[#2C2C2E] border border-[#3A3A3C] rounded-xl text-white px-4 text-sm outline-none focus:border-[#9ffb00] transition-all box-border appearance-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[#98989D] text-xs">Время</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                step="900"
                className="w-full h-11 bg-[#2C2C2E] border border-[#3A3A3C] rounded-xl text-white px-4 text-sm outline-none focus:border-[#9ffb00] transition-all box-border appearance-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[#98989D] text-xs">Гостей</label>
              <div className="flex items-center bg-[#2C2C2E] border border-[#3A3A3C] rounded-xl h-11">
                <button
                  onClick={() => setGuests((g) => Math.max(1, g - 1))}
                  className="px-3 text-[#98989D] hover:text-white transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="flex-1 text-center text-white font-medium">
                  {guests}
                </span>
                <button
                  onClick={() => setGuests((g) => Math.min(20, g + 1))}
                  className="px-3 text-[#98989D] hover:text-white transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[#98989D] text-xs">Длительность</label>
              <select
                value={durationHours}
                onChange={(e) => setDurationHours(parseInt(e.target.value))}
                className="w-full h-11 bg-[#2C2C2E] border border-[#3A3A3C] rounded-xl text-white px-4 text-sm outline-none focus:border-[#9ffb00] transition-all box-border appearance-none cursor-pointer"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((h) => (
                  <option key={h} value={h}>
                    {h} {h === 1 ? "час" : h < 5 ? "часа" : "часов"}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[#98989D] text-xs">
              Столы ({selectedTableIds.length} выбрано)
            </label>
            <div className="grid grid-cols-5 gap-2">
              {tables.map((table) => {
                const isSelected = selectedTableIds.includes(table.id);
                return (
                  <button
                    key={table.id}
                    type="button"
                    onClick={() => toggleTable(table.id)}
                    className={`
                      relative py-2 px-1 rounded-xl border-2 text-center text-sm font-bold transition-all
                      ${isSelected
                        ? "border-[#9ffb00] bg-[#9ffb00]/20 text-[#9ffb00]"
                        : "border-[#3A3A3C] bg-[#2C2C2E] text-[#98989D] hover:border-[#4A4A4C]"
                      }
                    `}
                  >
                    {toDisplayNumber(table.number)}
                    {isSelected && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#9ffb00] rounded-full flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-black" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedTableIds.length || !name.trim()}
            className={`
              flex-1 py-3 px-4 font-bold rounded-xl transition-all flex items-center justify-center gap-2
              ${!isSubmitting && selectedTableIds.length && name.trim()
                ? isBlock
                  ? "bg-orange-500 hover:bg-orange-400 text-white shadow-[0_0_20px_rgba(249,115,22,0.3)]"
                  : "bg-[#9ffb00] hover:bg-[#8bdc00] text-black shadow-[0_0_20px_rgba(159,251,0,0.3)]"
                : "bg-[#3A3A3C] text-[#636366] cursor-not-allowed"
              }
            `}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Бронируем...
              </>
            ) : (
              <>
                <Check className="w-5 h-5" />
                {isBlock ? "Заблокировать" : "Забронировать"}
              </>
            )}
          </button>
          <button
            onClick={onClose}
            className="py-3 px-4 bg-[#3A3A3C] hover:bg-[#4A4A4C] text-white rounded-xl transition-all"
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
}
