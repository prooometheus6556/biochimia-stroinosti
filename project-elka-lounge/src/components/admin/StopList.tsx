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
    <div className="bg-graphite-card rounded-3xl border border-graphite-border overflow-hidden">
      <div className="p-6 border-b border-graphite-border flex items-center gap-3">
        <div className="w-10 h-10 bg-primary-fixed/20 rounded-xl flex items-center justify-center">
          <Menu className="w-5 h-5 text-primary-fixed" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-on-surface">Стоп-лист</h3>
          <p className="text-sm text-on-surface-variant">
            {localItems.filter((i) => !i.is_available).length} из {localItems.length} позиций недоступно
          </p>
        </div>
      </div>

      <div className="max-h-[400px] overflow-y-auto">
        {Object.entries(groupedItems).map(([category, categoryItems]) => (
          <div key={category}>
            <div className="px-4 py-2 bg-graphite-border/30 text-xs text-on-surface-variant font-medium uppercase tracking-wider">
              {category}
            </div>
            {categoryItems.map((item) => (
              <div
                key={item.id}
                className={`flex w-full items-center justify-between gap-x-4 py-3 px-4 hover:bg-gray-800/30 transition-all ${
                  !item.is_available ? "bg-red-900/10" : ""
                } ${togglingId === item.id ? "opacity-50" : ""}`}
              >
                <span className={`flex-grow text-left text-sm ${item.is_available ? "text-white" : "text-gray-500 line-through"}`}>
                  {item.name}
                </span>
                <button
                  onClick={() => handleToggle(item.id, item.is_available)}
                  disabled={togglingId === item.id}
                  className={`
                    flex-shrink-0 relative w-14 h-7 rounded-full transition-all duration-200 
                    ${item.is_available ? "bg-neon" : "bg-gray-600"}
                    ${togglingId === item.id ? "opacity-70" : ""}
                  `}
                >
                  <span
                    className={`
                      absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200
                      ${item.is_available ? "translate-x-7" : "translate-x-0"}
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
