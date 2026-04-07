"use client";

import { useState, useMemo } from "react";
import { createReservation } from "@/app/actions";
import Link from "next/link";

const TABLE_IDS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '11.5', '12'];

const getTableInfo = (id: string) => {
  if (['1', '2', '3', '4', '5', '6', '7'].includes(id)) {
    return { label: '🌆', name: `Стол ${id}`, type: 'window_view' };
  }
  if (['10', '12'].includes(id)) {
    return { label: '🎮', name: `Стол ${id}`, type: 'ps5' };
  }
  return { label: '🪑', name: `Стол ${id}`, type: 'standard' };
};

const INPUT_CLASSES = "w-full h-14 bg-[#1a1a2e] border border-gray-700 rounded-xl text-white px-4 box-border focus-within:border-neon focus-within:ring-1 focus-within:ring-neon transition-all";
const INPUT_CLASSES_SM = "w-full h-14 bg-[#1a1a2e] border border-gray-700 rounded-xl text-white px-4 text-lg outline-none appearance-none focus:border-neon focus:ring-1 focus:ring-neon transition-all box-border";

const formatPhoneDisplay = (digits: string): string => {
  if (digits.length === 0) return "";
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  if (digits.length <= 8) return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 8)}-${digits.slice(8, 10)}`;
};

export default function BookingForm() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    date: "",
    time: "",
    durationHours: 3,
    durationMinutes: 0,
    guests: 2,
    tableId: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const isFormValid = useMemo(() => {
    const phoneDigits = formData.phone.replace(/\D/g, '');
    return (
      formData.name.trim().length > 1 &&
      phoneDigits.length === 10 &&
      formData.date !== "" &&
      formData.time !== "" &&
      formData.durationHours > 0 &&
      formData.guests > 0 &&
      formData.tableId !== ""
    );
  }, [formData]);

  const expectedDuration = formData.durationHours * 60 + formData.durationMinutes;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const digits = rawValue.replace(/\D/g, '').slice(0, 10);
    const formatted = formatPhoneDisplay(digits);
    setFormData({ ...formData, phone: formatted });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    
    setIsSubmitting(true);
    setMessage(null);

    const phoneToSend = `+7 ${formData.phone}`;

    const result = await createReservation({
      name: formData.name.trim(),
      phone: phoneToSend,
      date: formData.date,
      time: formData.time,
      guests: formData.guests,
      tableId: formData.tableId,
      expected_duration_minutes: expectedDuration,
    });

    setIsSubmitting(false);
    setMessage({
      type: result.success ? "success" : "error",
      text: result.message,
    });

    if (result.success) {
      setFormData({
        name: "",
        phone: "",
        date: "",
        time: "",
        durationHours: 3,
        durationMinutes: 0,
        guests: 2,
        tableId: "",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
      <Link href="/" className="inline-flex items-center text-gray-400 hover:text-white mb-4">
        <span className="mr-2">←</span> Назад
      </Link>

      <div className="space-y-1">
        <label className="text-gray-400 text-sm">Ваше имя</label>
        <input
          type="text"
          required
          placeholder="Как к вам обращаться?"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className={INPUT_CLASSES_SM}
        />
      </div>

      <div className="space-y-1">
        <label className="text-gray-400 text-sm">Номер телефона</label>
        <div className={`${INPUT_CLASSES} flex items-center leading-none`}>
          <span className="text-gray-400 mr-2 text-lg leading-none">+7</span>
          <input
            type="tel"
            maxLength={15}
            inputMode="numeric"
            className="bg-transparent outline-none flex-1 text-lg text-white placeholder-gray-600 leading-none"
            placeholder="(999) 123-45-67"
            value={formData.phone}
            onChange={handlePhoneChange}
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-gray-400 text-sm">Дата визита</label>
        <input
          type="date"
          required
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          className={INPUT_CLASSES_SM}
        />
      </div>

      <div className="space-y-1">
        <label className="text-gray-400 text-sm">Время визита</label>
        <input
          type="time"
          required
          step="900"
          value={formData.time}
          onChange={(e) => setFormData({ ...formData, time: e.target.value })}
          className={INPUT_CLASSES_SM}
        />
      </div>

      <div className="space-y-1">
        <label className="text-gray-400 text-sm">Планируемое время пребывания</label>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <select
              value={formData.durationHours}
              onChange={(e) => setFormData({ ...formData, durationHours: parseInt(e.target.value) })}
              className={`${INPUT_CLASSES_SM} pr-8 appearance-none cursor-pointer`}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((h) => (
                <option key={h} value={h}>{h} {h === 1 ? 'час' : h < 5 ? 'часа' : 'часов'}</option>
              ))}
            </select>
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">▼</span>
          </div>
          <div className="flex-1 relative">
            <select
              value={formData.durationMinutes}
              onChange={(e) => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) })}
              className={`${INPUT_CLASSES_SM} pr-8 appearance-none cursor-pointer`}
            >
              {[0, 15, 30, 45].map((m) => (
                <option key={m} value={m}>{m.toString().padStart(2, '0')} мин</option>
              ))}
            </select>
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">▼</span>
          </div>
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-gray-400 text-sm">Количество гостей</label>
        <div className="relative">
          <select
            required
            value={formData.guests}
            onChange={(e) => setFormData({ ...formData, guests: parseInt(e.target.value) })}
            className={`${INPUT_CLASSES_SM} pr-8 appearance-none cursor-pointer w-full`}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
              <option key={n} value={n}>{n} {n === 1 ? 'гость' : n < 5 ? 'гостя' : 'гостей'}</option>
            ))}
          </select>
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">▼</span>
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-gray-400 text-sm">Выберите стол</label>
        <div className="grid grid-cols-4 gap-2">
          {TABLE_IDS.map((id) => {
            const info = getTableInfo(id);
            const isSelected = formData.tableId === id;
            const isWindow = info.type === 'window_view';
            const isPS5 = info.type === 'ps5';
            
            return (
              <button
                key={id}
                type="button"
                onClick={() => setFormData({ ...formData, tableId: id })}
                className={`
                  relative p-3 rounded-xl border-2 text-center transition-all
                  ${isSelected ? 'border-neon bg-neon/20' : 'border-gray-700 bg-gray-900 hover:border-gray-600'}
                  ${isWindow ? 'ring-2 ring-blue-500/50' : ''}
                  ${isPS5 ? 'ring-2 ring-purple-500/50' : ''}
                `}
              >
                <div className="text-2xl">{info.label}</div>
                <div className="text-xs text-gray-400">{id}</div>
                {isWindow && <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full" />}
                {isPS5 && <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full" />}
              </button>
            );
          })}
        </div>
        <div className="flex gap-4 text-xs text-gray-400">
          <span className="flex items-center"><span className="w-3 h-3 bg-blue-500 rounded-full mr-1"></span> Вид на город</span>
          <span className="flex items-center"><span className="w-3 h-3 bg-purple-500 rounded-full mr-1"></span> PS5</span>
        </div>
      </div>

      {message?.type === "error" && (
        <div className="p-4 rounded-xl text-center bg-red-900/30 border border-red-500 text-red-400">
          {message.text}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting || !isFormValid}
        className={`w-full py-5 px-6 font-bold text-lg rounded-xl transition-colors ${
          isFormValid && !isSubmitting
            ? 'bg-neon hover:bg-neon-hover text-black cursor-pointer'
            : 'bg-gray-800 text-gray-500 cursor-not-allowed'
        }`}
      >
        {isSubmitting ? "Отправка..." : "Забронировать"}
      </button>

      {message?.type === "success" && (
        <div className="p-4 rounded-xl text-center bg-green-900/30 border border-green-500 text-green-400">
          {message.text}
        </div>
      )}
    </form>
  );
}
