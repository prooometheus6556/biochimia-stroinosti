"use client";

import { useState, useTransition } from "react";
import { Menu } from "lucide-react";
import { MenuItem, toggleMenuItemAvailability } from "@/app/actions/menu";

interface StopListProps {
  items: MenuItem[];
}

export default function StopList({ items }: StopListProps) {
  const [localItems, setLocalItems] = useState(items);
  const [, startTransition] = useTransition();
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const handleToggle = (itemId: string, currentStatus: boolean) => {
    setTogglingId(itemId);
    
    setLocalItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, is_available: !currentStatus } : item
      )
    );

    startTransition(async () => {
      await toggleMenuItemAvailability(itemId, currentStatus);
      setTogglingId(null);
    });
  };

  const groupedItems = localItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, typeof localItems>);

  return (
    <div className="bg-[#121217] rounded-3xl border border-gray-800 overflow-hidden">
      <div className="p-6 border-b border-gray-800 flex items-center gap-3">
        <div className="w-10 h-10 bg-neon/20 rounded-xl flex items-center justify-center">
          <Menu className="w-5 h-5 text-neon" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Стоп-лист</h3>
          <p className="text-sm text-gray-500">
            {localItems.filter((i) => !i.is_available).length} из {localItems.length} позиций недоступно
          </p>
        </div>
      </div>

      <div className="max-h-[400px] overflow-y-auto">
        {Object.entries(groupedItems).map(([category, categoryItems]) => (
          <div key={category}>
            <div className="px-4 py-2 bg-gray-900/50 text-xs text-gray-500 font-medium uppercase">
              {category}
            </div>
            {categoryItems.map((item) => (
              <div
                key={item.id}
                className={`flex items-center justify-between px-4 py-3 hover:bg-gray-800/30 transition-all ${
                  !item.is_available ? "bg-red-900/10" : ""
                } ${togglingId === item.id ? "opacity-50" : ""}`}
              >
                <div className="flex-1 min-w-0">
                  <span className={`text-sm ${item.is_available ? "text-white" : "text-gray-500 line-through"}`}>
                    {item.name}
                  </span>
                </div>
                <button
                  onClick={() => handleToggle(item.id, item.is_available)}
                  disabled={togglingId === item.id}
                  className={`
                    relative w-12 h-7 rounded-full transition-all duration-200 
                    ${item.is_available ? "bg-neon" : "bg-gray-600"}
                    ${togglingId === item.id ? "opacity-70" : ""}
                  `}
                >
                  <span
                    className={`
                      absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200
                      ${item.is_available ? "translate-x-6" : "translate-x-1"}
                    `}
                  />
                </button>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
