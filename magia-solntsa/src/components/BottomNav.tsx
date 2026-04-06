"use client";

interface BottomNavProps {
  active: "home" | "services" | "booking" | "profile";
}

const items = [
  { id: "home" as const, icon: "grid_view", label: "Главная" },
  { id: "services" as const, icon: "spa", label: "Услуги" },
  { id: "booking" as const, icon: "calendar_today", label: "Запись" },
  { id: "profile" as const, icon: "person", label: "Профиль" },
];

export default function BottomNav({ active }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 w-full h-20 bg-[#fbf9f1]/70 backdrop-blur-md flex justify-around items-center px-4 pb-safe z-50 shadow-[0_-4px_30px_rgba(129,85,18,0.1)] rounded-t-[2rem]">
      {items.map((item) =>
        item.id === active ? (
          <div
            key={item.id}
            className="flex flex-col items-center justify-center bg-gradient-to-br from-amber-800 to-orange-500 text-white rounded-full w-12 h-12 mb-1 active:scale-90 duration-300"
          >
            <span
              className="material-symbols-outlined"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {item.icon}
            </span>
          </div>
        ) : (
          <div
            key={item.id}
            className="flex flex-col items-center justify-center text-amber-900/40 hover:text-amber-700 transition-opacity active:scale-90 duration-300"
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className="font-body text-[10px] font-bold uppercase tracking-tighter mt-1">
              {item.label}
            </span>
          </div>
        )
      )}
    </nav>
  );
}
