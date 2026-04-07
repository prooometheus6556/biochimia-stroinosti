import Link from "next/link";
import { getMenu } from "@/app/actions/menu";

export const dynamic = "force-dynamic";

export default async function MenuPage() {
  const menuItems = await getMenu();

  const groupedMenu = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, typeof menuItems>);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ru-RU").format(price);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <Link 
        href="/" 
        className="inline-flex items-center text-gray-400 hover:text-white mb-6"
      >
        <span className="mr-2">←</span> На главную
      </Link>

      <h1 className="text-3xl font-bold text-neon mb-8">Меню</h1>

      {menuItems.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">Меню загружается...</p>
        </div>
      ) : (
        <div className="space-y-10">
          {Object.entries(groupedMenu).map(([category, items]) => (
            <div key={category}>
              <h2 className="text-2xl font-bold text-white mb-4">{category}</h2>
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                      item.is_available
                        ? "bg-[#121217] border-gray-800"
                        : "bg-[#121217]/50 border-gray-800 opacity-50"
                    }`}
                  >
                    <div className="flex-1">
                      <h3 className={`text-lg font-medium ${
                        item.is_available ? "text-white" : "text-gray-500 line-through"
                      }`}>
                        {item.name}
                      </h3>
                      {!item.is_available && (
                        <span className="text-xs text-red-400">Нет в наличии</span>
                      )}
                    </div>
                    <div className={`text-xl font-bold ${
                      item.is_available ? "text-neon" : "text-gray-600"
                    }`}>
                      {formatPrice(item.price)} ₽
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
