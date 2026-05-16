import { prisma } from "@/lib/prisma";
import { deleteIngredient } from "@/app/actions/ingredient";
import FormTambahBahan from "./FormTambahBahan";
import TombolHapus from "./TombolHapus";

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
          ingredients.map((item) => {
            const hargaPerSatuan = Math.round(item.purchasePrice / item.purchaseAmount);
            
            return (
              <div key={item.id} className="card" style={{ marginBottom: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontWeight: "600", fontSize: "1.125rem" }}>{item.name}</div>
                    <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
                      Beli: Rp {item.purchasePrice.toLocaleString("id-ID")} / {item.purchaseAmount} {item.unit}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <TombolHapus id={item.id} />
                  </div>
                </div>
                <div style={{ marginTop: "1rem", paddingTop: "0.75rem", borderTop: "1px dashed var(--border-color)", display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>Harga per {item.unit}:</span>
                  <span style={{ fontWeight: "600", color: "var(--accent-color)" }}>Rp {hargaPerSatuan}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      <FormTambahBahan />
    </div>
  );
}
