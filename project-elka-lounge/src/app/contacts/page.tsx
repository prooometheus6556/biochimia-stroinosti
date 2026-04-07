import Link from "next/link";
import { MapPin, Clock, Phone } from "lucide-react";

export default function ContactsPage() {
  return (
    <div className="min-h-screen bg-background p-6">
      <Link 
        href="/" 
        className="inline-flex items-center text-gray-400 hover:text-white mb-6"
      >
        <span className="mr-2">←</span> На главную
      </Link>

      <h1 className="text-3xl font-bold text-neon mb-8">Контакты и локация</h1>

      <div className="space-y-4 mb-8">
        <div className="flex items-start gap-4 p-5 bg-[#121217] rounded-2xl border border-gray-800">
          <div className="w-12 h-12 bg-neon/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <MapPin className="w-6 h-6 text-neon" />
          </div>
          <div>
            <h3 className="text-white font-semibold mb-1">Адрес</h3>
            <p className="text-gray-400">Нячанг, Вьетнам</p>
            <p className="text-gray-500 text-sm mt-1">Ёлка-лаунж на крыше</p>
          </div>
        </div>

        <div className="flex items-start gap-4 p-5 bg-[#121217] rounded-2xl border border-gray-800">
          <div className="w-12 h-12 bg-neon/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <Clock className="w-6 h-6 text-neon" />
          </div>
          <div>
            <h3 className="text-white font-semibold mb-1">Режим работы</h3>
            <p className="text-gray-400">Ежедневно с 18:00 до 02:00</p>
          </div>
        </div>

        <div className="flex items-start gap-4 p-5 bg-[#121217] rounded-2xl border border-gray-800">
          <div className="w-12 h-12 bg-neon/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <Phone className="w-6 h-6 text-neon" />
          </div>
          <div>
            <h3 className="text-white font-semibold mb-1">Телефон</h3>
            <p className="text-neon font-medium text-lg">+7 (999) 999-99-99</p>
            <p className="text-gray-500 text-sm mt-1">Звоните для бронирования</p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-bold text-white">Как нас найти</h2>
        <div className="w-full h-64 bg-[#121217] rounded-2xl border border-gray-800 flex items-center justify-center">
          <div className="text-center">
            <MapPin className="w-12 h-12 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500">Здесь будет интерактивная карта</p>
          </div>
        </div>
      </div>
    </div>
  );
}
