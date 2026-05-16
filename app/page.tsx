import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const ingredientCount = await prisma.ingredient.count();
  const recipeCount = await prisma.recipe.count();

  return (
    <div>
      <h1 className="page-title">Ringkasan Bisnis</h1>
      
      <div className="card" style={{ background: "linear-gradient(135deg, var(--color-emerald-500), var(--color-emerald-600))", color: "white", border: "none" }}>
        <h2 className="section-title" style={{ color: "rgba(255,255,255,0.9)", fontSize: "0.875rem", marginBottom: "0.5rem" }}>
          Potensi Keuntungan
        </h2>
        <div style={{ fontSize: "2rem", fontWeight: "bold" }}>Rp 0</div>
        <div style={{ fontSize: "0.75rem", marginTop: "0.5rem", opacity: 0.8 }}>Berdasarkan resep yang sudah dibuat</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "1rem" }}>
        <Link href="/bahan" style={{ textDecoration: "none" }}>
          <div className="card" style={{ marginBottom: 0, textAlign: "center" }}>
            <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "var(--accent-color)" }}>{ingredientCount}</div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Bahan Baku</div>
          </div>
        </Link>
        <Link href="/resep" style={{ textDecoration: "none" }}>
          <div className="card" style={{ marginBottom: 0, textAlign: "center" }}>
            <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "var(--accent-color)" }}>{recipeCount}</div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Resep Menu</div>
          </div>
        </Link>
      </div>

      <div className="section-title" style={{ marginTop: "2.5rem" }}>Aksi Cepat</div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <Link href="/resep" className="btn btn-primary" style={{ textDecoration: "none" }}>
          + Hitung Resep Baru
        </Link>
        <Link href="/bahan" className="btn" style={{ textDecoration: "none", backgroundColor: "var(--color-slate-100)", color: "var(--text-primary)" }}>
          Kelola Bahan Baku
        </Link>
      </div>
    </div>
  );
}
