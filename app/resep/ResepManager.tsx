"use client";

import { useState, useTransition, useEffect } from "react";
import {
  createRecipe,
  deleteRecipe,
  updateRecipeName,
  updateRecipeMargin,
  addIngredientToRecipe,
  removeIngredientFromRecipe,
  updateRecipeIngredientAmount,
} from "@/app/actions/recipe";

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
  const [isEditRecipeNameOpen, setIsEditRecipeNameOpen] = useState(false);
  const [isEditIngredientOpen, setIsEditIngredientOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Local state for margin to avoid spamming the server while dragging
  const [localMargin, setLocalMargin] = useState<number | null>(null);

  // Edit recipe name state
  const [editRecipeName, setEditRecipeName] = useState("");

  // Edit ingredient amount state
  const [editingIngredient, setEditingIngredient] = useState<{
    id: string;
    name: string;
    unit: string;
    amount: number;
  } | null>(null);
  const [editAmount, setEditAmount] = useState("");

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

  function openEditRecipeName() {
    if (!selectedRecipe) return;
    setEditRecipeName(selectedRecipe.name);
    setIsEditRecipeNameOpen(true);
  }

  async function handleUpdateRecipeName() {
    if (!selectedRecipeId || !editRecipeName.trim()) return;
    startTransition(async () => {
      try {
        await updateRecipeName(selectedRecipeId, editRecipeName);
        setIsEditRecipeNameOpen(false);
      } catch (err: any) {
        alert("Gagal memperbarui nama: " + err.message);
      }
    });
  }

  function openEditIngredient(item: RecipeProps["ingredients"][0]) {
    setEditingIngredient({
      id: item.id,
      name: item.ingredient.name,
      unit: item.ingredient.unit,
      amount: item.amount,
    });
    setEditAmount(String(item.amount));
    setIsEditIngredientOpen(true);
  }

  async function handleUpdateIngredientAmount() {
    if (!editingIngredient) return;
    const newAmount = parseInt(editAmount);
    if (isNaN(newAmount) || newAmount <= 0) {
      alert("Jumlah harus lebih dari 0");
      return;
    }
    startTransition(async () => {
      try {
        await updateRecipeIngredientAmount(editingIngredient.id, newAmount);
        setIsEditIngredientOpen(false);
        setEditingIngredient(null);
      } catch (err: any) {
        alert("Gagal memperbarui jumlah: " + err.message);
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
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <h2 className="section-title" style={{ fontSize: "1rem", marginBottom: 0 }}>Bahan-bahan</h2>
              </div>
              <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                <button
                  onClick={openEditRecipeName}
                  style={{
                    background: "none", border: "none",
                    color: "var(--accent-color)",
                    fontSize: "0.75rem", cursor: "pointer",
                    display: "flex", alignItems: "center", gap: "0.25rem"
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  Rename
                </button>
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
                      <div
                        style={{ cursor: "pointer", flex: 1 }}
                        onClick={() => openEditIngredient(item)}
                        title="Klik untuk edit jumlah"
                      >
                        <div style={{ fontSize: "0.875rem", fontWeight: "500", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                          {item.ingredient.name}
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </div>
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
        <div
          style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)", zIndex: 100,
            display: "flex", alignItems: "flex-end", justifyContent: "center"
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setIsRecipeModalOpen(false); }}
        >
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

      {/* Modal Edit Nama Resep */}
      {isEditRecipeNameOpen && (
        <div
          style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)", zIndex: 100,
            display: "flex", alignItems: "flex-end", justifyContent: "center"
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setIsEditRecipeNameOpen(false); }}
        >
          <div style={{
            backgroundColor: "var(--bg-color)", width: "100%", maxWidth: "480px",
            borderTopLeftRadius: "20px", borderTopRightRadius: "20px", padding: "1.5rem",
            animation: "slideUp 0.3s ease-out"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 className="section-title" style={{ marginBottom: 0 }}>Edit Nama Resep</h2>
              <button onClick={() => setIsEditRecipeNameOpen(false)} style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer" }}>&times;</button>
            </div>
            <div className="form-group">
              <label className="form-label">Nama Resep</label>
              <input
                type="text"
                className="form-control"
                value={editRecipeName}
                onChange={(e) => setEditRecipeName(e.target.value)}
                required
              />
            </div>
            <button
              onClick={handleUpdateRecipeName}
              className="btn btn-primary"
              disabled={isPending}
            >
              {isPending ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </div>
      )}

      {/* Modal Edit Jumlah Bahan di Resep */}
      {isEditIngredientOpen && editingIngredient && (
        <div
          style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)", zIndex: 100,
            display: "flex", alignItems: "flex-end", justifyContent: "center"
          }}
          onClick={(e) => { if (e.target === e.currentTarget) { setIsEditIngredientOpen(false); setEditingIngredient(null); } }}
        >
          <div style={{
            backgroundColor: "var(--bg-color)", width: "100%", maxWidth: "480px",
            borderTopLeftRadius: "20px", borderTopRightRadius: "20px", padding: "1.5rem",
            animation: "slideUp 0.3s ease-out"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 className="section-title" style={{ marginBottom: 0 }}>Edit Jumlah Bahan</h2>
              <button
                onClick={() => { setIsEditIngredientOpen(false); setEditingIngredient(null); }}
                style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer" }}
              >&times;</button>
            </div>
            <div style={{
              padding: "0.75rem 1rem",
              backgroundColor: "var(--color-slate-100)",
              borderRadius: "8px",
              marginBottom: "1rem",
              fontSize: "0.875rem",
              color: "var(--text-secondary)"
            }}>
              Bahan: <strong style={{ color: "var(--text-primary)" }}>{editingIngredient.name}</strong>
            </div>
            <div className="form-group">
              <label className="form-label">Jumlah Pemakaian ({editingIngredient.unit})</label>
              <input
                type="number"
                className="form-control"
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
                min="1"
                required
              />
            </div>
            <button
              onClick={handleUpdateIngredientAmount}
              className="btn btn-primary"
              disabled={isPending}
            >
              {isPending ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </div>
      )}

      {/* Modal Tambah Bahan ke Resep */}
      {isIngredientModalOpen && (
        <div
          style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)", zIndex: 100,
            display: "flex", alignItems: "flex-end", justifyContent: "center"
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setIsIngredientModalOpen(false); }}
        >
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
