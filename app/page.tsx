import Link from "next/link";

export default function Dashboard() {
  return (
    <div>
      <h1 className="page-title">Ringkasan</h1>
      
      <div className="card" style={{ background: "var(--accent-color)", color: "white" }}>
        <h2 className="section-title" style={{ color: "white" }}>Potensi Keuntungan Bulan Ini</h2>
        <div style={{ fontSize: "2rem", fontWeight: "bold" }}>Rp 0</div>
      </div>

      <div className="section-title" style={{ marginTop: "2rem" }}>Menu Paling Untung</div>
      
      <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-secondary)" }}>
        Belum ada data resep.
      </div>

      <div style={{ marginTop: "2rem" }}>
        <Link href="/resep" className="btn btn-primary" style={{ textDecoration: "none" }}>+ Buat Resep Baru</Link>
      </div>
    </div>
  );
}
