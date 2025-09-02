export default function AdminOverview() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="p-4 rounded-xl border bg-pink-50">Total Appointments: —</div>
      <div className="p-4 rounded-xl border bg-pink-50">Active Staff: —</div>
      <div className="p-4 rounded-xl border bg-pink-50">New Reviews: —</div>
    </div>
  );
}
