import Link from "next/link";

export const dynamic = "force-dynamic";

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-white p-8 shadow-lg shadow-slate-200">
        <h1 className="text-4xl font-semibold">Admin Dashboard</h1>
        <p className="mt-3 text-slate-600">สรุปข้อมูลยอดขาย ออเดอร์ และสถานะสินค้าทั้งหมด (อัปเดตแบบ Real-time)</p>
        
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 p-6 transition-hover hover:border-blue-500 hover:shadow-md">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">ยอดขายวันนี้</p>
            <p className="mt-4 text-3xl font-semibold text-blue-600">฿12,420</p>
          </div>
          <div className="rounded-3xl border border-slate-200 p-6 transition-hover hover:border-amber-500 hover:shadow-md">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">คำสั่งซื้อที่รอดำเนินการ</p>
            <p className="mt-4 text-3xl font-semibold text-amber-600">18</p>
          </div>
          <div className="rounded-3xl border border-slate-200 p-6 transition-hover hover:border-red-500 hover:shadow-md">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">สินค้าคงเหลือต่ำ</p>
            <p className="mt-4 text-3xl font-semibold text-red-600">4</p>
          </div>
        </div>
      </section>

      {/* Analytics Chart Placeholder (ตามเอกสาร แท็บ 4) */}
      <section className="rounded-3xl bg-white p-8 shadow-lg shadow-slate-200">
        <h2 className="text-2xl font-semibold mb-6">Sales Trend (Analytics)</h2>
        <div className="h-64 w-full bg-slate-50 rounded-2xl flex items-center justify-center border border-dashed border-slate-300">
          <p className="text-slate-400">Chart Visualization Placeholder (Recharts / Chart.js)</p>
        </div>
      </section>

      {/* Recent Orders Section */}
      <section className="rounded-3xl bg-white p-8 shadow-lg shadow-slate-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Recent Orders</h2>
          <Link href="/admin/dashboard" className="text-blue-600 font-medium hover:underline">
            View All
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="pb-4 font-medium text-slate-500">Order ID</th>
                <th className="pb-4 font-medium text-slate-500">Customer</th>
                <th className="pb-4 font-medium text-slate-500">Status</th>
                <th className="pb-4 font-medium text-slate-500">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-4">#ORD-001</td>
                <td className="py-4">John Doe</td>
                <td className="py-4"><span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs">Paid</span></td>
                <td className="py-4">฿2,580</td>
              </tr>
              <tr>
                <td className="py-4">#ORD-002</td>
                <td className="py-4">Jane Smith</td>
                <td className="py-4"><span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs">Pending</span></td>
                <td className="py-4">฿1,290</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
