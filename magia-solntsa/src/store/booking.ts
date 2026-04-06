export interface BookingState {
  step: number;
  service: string | null;
  servicePrice: string | null;
  serviceDuration: string | null;
  time: string | null;
  booth: string | null;
  name: string;
  phone: string;
}

export const SERVICES = [
  {
    id: "tan-15",
    title: "Загар 15 минут",
    description: "Базовый сеанс для поддержания ровного золотистого тона.",
    price: "800₽",
    duration: "15 мин",
    icon: "wb_sunny",
  },
  {
    id: "tan-20",
    title: "Загар 20 минут",
    description: "Оптимальный сеанс для глубокого и стойкого бронзового загара.",
    price: "1200₽",
    duration: "20 мин",
    icon: "light_mode",
  },
  {
    id: "tan-premium",
    title: "Загар Premium",
    description: "Люкс-сеанс с коллагеновой терапией и максимальной мощностью.",
    price: "2500₽",
    duration: "25 мин",
    icon: "auto_awesome",
  },
  {
    id: "subscription",
    title: "Абонемент",
    description: "Безлимитные посещения на месяц по лучшей цене.",
    price: "7500₽",
    duration: "Безлимит",
    icon: "card_membership",
  },
];

export const TIME_SLOTS = ["12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

export const BOOTHS = [
  { id: "booth-1", name: "Кабинка 1", status: "free" as const, type: "Вертикальный солярий" },
  { id: "booth-2", name: "Кабинка 2", status: "busy" as const, type: "Вертикальный солярий" },
  { id: "booth-3", name: "Кабинка 3", status: "soon" as const, type: "Турбо-солярий" },
  { id: "booth-premium", name: "Premium", status: "free" as const, type: "Люкс гибрид" },
];

export type BoothStatus = "free" | "busy" | "soon";
