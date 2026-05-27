export default function AdminCustomersPage() {
  return (
    <section className="rounded-3xl bg-white p-8 shadow-lg shadow-slate-200">
      <h1 className="text-4xl font-semibold">Customer Management</h1>
      <p className="mt-3 text-slate-600">ดูข้อมูลลูกค้าและประวัติการสั่งซื้อ</p>
      <div className="mt-8 space-y-4">
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="rounded-3xl border border-slate-200 p-5">
            <p className="text-lg font-semibold">Customer #{index + 1}</p>
            <p className="mt-2 text-slate-600">อีเมล: customer{index + 1}@example.com</p>
            <p className="mt-1 text-slate-600">คำสั่งซื้อที่ผ่านมา: {5 + index}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
