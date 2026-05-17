import { prisma } from "@/lib/prisma";
import FormTambahBahan from "./FormTambahBahan";
import BahanCard from "./BahanCard";

export const dynamic = "force-dynamic";

export default async function BahanBaku() {
  const ingredients = await prisma.ingredient.findMany({
    orderBy: { createdAt: "desc" }
  });

  return (
    <div>
      <h1 className="page-title">Master Bahan Baku</h1>
      
      <div className="form-group" style={{ position: "relative" }}>
        <input 
          type="text" 
          className="form-control" 
          placeholder="Cari bahan (contoh: Gula, Kopi...)" 
          style={{ paddingLeft: "2.5rem" }}
        />
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="var(--text-secondary)" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          style={{ position: "absolute", left: "0.75rem", top: "0.75rem", width: "20px", height: "20px" }}
        >
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "5rem" }}>
        {ingredients.length === 0 ? (
          <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-secondary)" }}>
            Belum ada data bahan baku. Silakan tambah baru.
          </div>
        ) : (
          ingredients.map((item) => (
            <BahanCard key={item.id} item={item} />
          ))
        )}
      </div>

      <FormTambahBahan />
    </div>
  );
}
