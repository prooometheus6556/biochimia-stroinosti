import { getAdminData } from "@/app/actions/admin";
import { getMenu } from "@/app/actions/menu";
import AdminClient from "@/components/admin/AdminClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function AdminPage() {
  const [adminData, menuItems] = await Promise.all([
    getAdminData(),
    getMenu(),
  ]);

  const { tables, reservations, error } = adminData;

  return (
    <>
      {error && (
        <div className="bg-red-900/50 border border-red-500/30 text-red-200 p-4 rounded-2xl mb-6">
          <p className="font-medium">Ошибка загрузки:</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}
      
      <AdminClient 
        tables={tables || []} 
        reservations={reservations || []} 
        menuItems={menuItems || []} 
      />
    </>
  );
}
