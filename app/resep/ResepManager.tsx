"use client";

import { useState, useTransition, useEffect } from "react";
import { createRecipe, deleteRecipe, updateRecipeMargin, addIngredientToRecipe, removeIngredientFromRecipe } from "@/app/actions/recipe";

type RecipeProps = {
  id: string;
  name: string;
  margin: number;
  ingredients: Array<{
    id: string;
    amount: number;
    ingredient: {
      id: string;
      name: string;
      purchasePrice: number;
      purchaseAmount: number;
      unit: string;
    };
  }>;
};

type IngredientProps = {
  id: string;
  name: string;
  unit: string;
  purchasePrice: number;
  purchaseAmount: number;
};

export default function ResepManager({
  initialRecipes,
  availableIngredients
}: {
  initialRecipes: RecipeProps[],
  availableIngredients: IngredientProps[]
}) {
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(initialRecipes[0]?.id || null);
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);
  const [isIngredientModalOpen, setIsIngredientModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  
  // Local state for margin to avoid spamming the server while dragging
  const [localMargin, setLocalMargin] = useState<number | null>(null);

  const selectedRecipe = initialRecipes.find(r => r.id === selectedRecipeId);

  // Sync local margin when recipe changes
  useEffect(() => {
    setLocalMargin(null);
  }, [selectedRecipeId]);

  const displayMargin = localMargin !== null ? localMargin : (selectedRecipe?.margin || 50);

  // Calculate HPP
  const totalCost = selectedRecipe?.ingredients.reduce((acc, curr) => {
    const costPerUnit = curr.ingredient.purchasePrice / curr.ingredient.purchaseAmount;
    return acc + (costPerUnit * curr.amount);
  }, 0) || 0;

  const sellPrice = totalCost > 0 ? Math.round(totalCost / (1 - displayMargin / 100)) : 0;
  const profit = sellPrice - totalCost;

  async function handleCreateRecipe(formData: FormData) {
    try {
      await createRecipe(formData);
      setIsRecipeModalOpen(false);
    } catch (err: any) {
      alert("Gagal membuat resep: " + err.message);
    }
  }

  async function handleAddIngredient(formData: FormData) {
    formData.append("recipeId", selectedRecipeId!);
    try {
      await addIngredientToRecipe(formData);
      setIsIngredientModalOpen(false);
    } catch (err: any) {
      alert("Gagal menambah bahan: " + err.message);
    }
  }

  function handleMarginRelease() {
    if (!selectedRecipeId || localMargin === null) return;
    startTransition(async () => {
      try {
        await updateRecipeMargin(selectedRecipeId, localMargin);
      } catch (e) {
        // Handle error silently or alert
      }
    });
  }

  return (
    <div>
      <h1 className="page-title">Kalkulator Resep</h1>

      {/* Selector Resep */}
      <div className="form-group" style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
        <select
          className="form-control"
          value={selectedRecipeId || ""}
          onChange={(e) => setSelectedRecipeId(e.target.value)}
          style={{ flex: 1 }}
        >
          {initialRecipes.length === 0 && <option value="">Belum ada resep...</option>}
          {initialRecipes.map(r => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
        <button
          className="btn btn-primary"
          style={{ width: "auto", padding: "0 1rem" }}
          onClick={() => setIsRecipeModalOpen(true)}
        >
          + Baru
        </button>
      </div>

      {selectedRecipe ? (
        <>
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h2 className="section-title" style={{ fontSize: "1rem", marginBottom: 0 }}>Bahan-bahan</h2>
              <button
                onClick={() => {
                  if (confirm("Hapus resep ini?")) {
                    startTransition(() => deleteRecipe(selectedRecipe.id));
                    setSelectedRecipeId(null);
                  }
                }}
                disabled={isPending}
                style={{ background: "none", border: "none", color: "#ef4444", fontSize: "0.75rem", cursor: "pointer" }}
              >
                Hapus Resep
              </button>
            </div>

            {selectedRecipe.ingredients.length === 0 ? (
              <div style={{ textAlign: "center", padding: "2rem 0", color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                Resep ini belum memiliki bahan.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.5rem" }}>
                {selectedRecipe.ingredients.map((item) => {
                  const costPerUnit = item.ingredient.purchasePrice / item.ingredient.purchaseAmount;
                  const itemCost = costPerUnit * item.amount;

                  return (
                    <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontSize: "0.875rem", fontWeight: "500" }}>{item.ingredient.name}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                          {item.amount} {item.ingredient.unit} × Rp {Math.round(costPerUnit)}
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <div style={{ fontWeight: "500" }}>Rp {Math.round(itemCost).toLocaleString('id-ID')}</div>
                        <button
                          onClick={() => startTransition(() => removeIngredientFromRecipe(item.id))}
                          disabled={isPending}
                          style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", padding: "0.25rem" }}
                        >&times;</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <button
              className="btn"
              style={{ backgroundColor: "var(--color-slate-100)", color: "var(--text-secondary)", marginBottom: "1rem", fontSize: "0.875rem" }}
              onClick={() => setIsIngredientModalOpen(true)}
            >
              + Tambah Bahan
            </button>

            <div style={{ borderTop: "2px solid var(--border-color)", paddingTop: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontWeight: "600" }}>Total Modal (HPP)</div>
              <div style={{ fontWeight: "bold", color: "var(--accent-color)", fontSize: "1.25rem" }}>
                Rp {Math.round(totalCost).toLocaleString('id-ID')}
              </div>
            </div>
          </div>

          <div className="card" style={{ backgroundColor: "var(--color-emerald-50)", borderColor: "var(--color-emerald-100)" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "1rem", color: "var(--color-emerald-600)" }}>
              Simulasi Harga Jual
            </h3>

            <div className="form-group">
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                <span className="form-label" style={{ marginBottom: 0, color: "var(--color-emerald-600)" }}>Target Margin Profit</span>
                <span style={{ fontWeight: "bold", color: "var(--color-emerald-600)" }}>{displayMargin}%</span>
              </div>
              <div className="slider-container">
                <input
                  type="range"
                  min="10"
                  max="90"
                  value={displayMargin}
                  onChange={(e) => setLocalMargin(Number(e.target.value))}
                  onMouseUp={handleMarginRelease}
                  onTouchEnd={handleMarginRelease}
                  className="slider"
                />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1.5rem", marginBottom: "0.5rem" }}>
              <span style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>Rekomendasi Harga Jual</span>
              <span style={{ fontWeight: "bold", fontSize: "1.5rem", color: "var(--text-secondary)" }}>
                Rp {sellPrice.toLocaleString('id-ID')}
              </span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>Potensi Keuntungan Bersih</span>
              <span style={{ fontWeight: "600", color: "var(--accent-color)" }}>
                Rp {profit.toLocaleString('id-ID')}
              </span>
            </div>
          </div>
        </>
      ) : (
        <div className="card" style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--text-secondary)" }}>
          Silakan buat resep baru terlebih dahulu.
        </div>
      )}

      {/* Modal Tambah Resep */}
      {isRecipeModalOpen && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)", zIndex: 100,
          display: "flex", alignItems: "flex-end", justifyContent: "center"
        }}>
          <div style={{
            backgroundColor: "var(--bg-color)", width: "100%", maxWidth: "480px",
            borderTopLeftRadius: "20px", borderTopRightRadius: "20px", padding: "1.5rem",
            animation: "slideUp 0.3s ease-out"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 className="section-title" style={{ marginBottom: 0 }}>Resep Baru</h2>
              <button onClick={() => setIsRecipeModalOpen(false)} style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer" }}>&times;</button>
            </div>
            <form action={handleCreateRecipe}>
              <div className="form-group">
                <label className="form-label">Nama Resep</label>
                <input name="name" type="text" className="form-control" required placeholder="Contoh: Kopi Susu Gula Aren" />
              </div>
              <button type="submit" className="btn btn-primary" disabled={isPending}>Simpan Resep</button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tambah Bahan ke Resep */}
      {isIngredientModalOpen && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)", zIndex: 100,
          display: "flex", alignItems: "flex-end", justifyContent: "center"
        }}>
          <div style={{
            backgroundColor: "var(--bg-color)", width: "100%", maxWidth: "480px",
            borderTopLeftRadius: "20px", borderTopRightRadius: "20px", padding: "1.5rem",
            maxHeight: "85vh", overflowY: "auto",
            animation: "slideUp 0.3s ease-out"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 className="section-title" style={{ marginBottom: 0 }}>Tambah Bahan</h2>
              <button onClick={() => setIsIngredientModalOpen(false)} style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer" }}>&times;</button>
            </div>

            {availableIngredients.length === 0 ? (
              <div style={{ color: "var(--text-secondary)", marginBottom: "1rem" }}>
                Belum ada bahan baku di database. Tambahkan bahan baku di menu Bahan terlebih dahulu.
              </div>
            ) : (
              <form action={handleAddIngredient}>
                <div className="form-group">
                  <label className="form-label">Pilih Bahan Baku</label>
                  <select name="ingredientId" className="form-control" required>
                    {availableIngredients.map(ing => (
                      <option key={ing.id} value={ing.id}>{ing.name} (per {ing.unit})</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Jumlah Pemakaian</label>
                  <input name="amount" type="number" className="form-control" required placeholder="Contoh: 15" />
                </div>
                <button type="submit" className="btn btn-primary" disabled={isPending}>Tambah ke Resep</button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
