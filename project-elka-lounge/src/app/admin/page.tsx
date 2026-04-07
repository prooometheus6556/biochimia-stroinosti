import { getAdminData } from "@/app/actions/admin";
import { getMenu } from "@/app/actions/menu";
import Chessboard from "@/components/admin/Chessboard";
import Waitlist from "@/components/admin/Waitlist";
import StopList from "@/components/admin/StopList";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [adminData, menuItems] = await Promise.all([
    getAdminData(),
    getMenu(),
  ]);

  const { tables, reservations, error } = adminData;

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="flex-1">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-white mb-2">Шахматка столов</h2>
          <p className="text-gray-500">Нажмите на стол для управления бронированием</p>
        </div>
        
        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 p-4 rounded-xl mb-6">
            <p className="font-medium">Ошибка загрузки:</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}
        
        <Chessboard tables={tables || []} reservations={reservations || []} />
      </div>

      <div className="w-full lg:w-96 space-y-6">
        <Waitlist reservations={reservations || []} tables={tables || []} />
        <StopList items={menuItems} />
      </div>
    </div>
  );
}
