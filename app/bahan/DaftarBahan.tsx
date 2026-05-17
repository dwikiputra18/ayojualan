"use client";

import { useState, useTransition } from "react";
import { updateIngredient, deleteIngredient } from "@/app/actions/ingredient";

type Ingredient = {
  id: string;
  name: string;
  purchasePrice: number;
  purchaseAmount: number;
  unit: string;
};

export default function DaftarBahan({ ingredients }: { ingredients: Ingredient[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");

  // Edit form state
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editUnit, setEditUnit] = useState("");

  function openEdit(item: Ingredient) {
    setEditingId(item.id);
    setEditName(item.name);
    setEditPrice(String(item.purchasePrice));
    setEditAmount(String(item.purchaseAmount));
    setEditUnit(item.unit);
  }

  function closeEdit() {
    setEditingId(null);
  }

  async function handleUpdate() {
    if (!editingId) return;
    const formData = new FormData();
    formData.append("name", editName);
    formData.append("purchasePrice", editPrice);
    formData.append("purchaseAmount", editAmount);
    formData.append("unit", editUnit);

    startTransition(async () => {
      try {
        await updateIngredient(editingId, formData);
        setEditingId(null);
      } catch (err: any) {
        alert("Gagal memperbarui: " + (err.message || "Unknown error"));
      }
    });
  }

  function handleDelete(id: string) {
    if (confirm("Hapus bahan ini?")) {
      startTransition(() => {
        deleteIngredient(id);
      });
    }
  }

  const filtered = ingredients.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="form-group" style={{ position: "relative" }}>
        <input
          type="text"
          className="form-control"
          placeholder="Cari bahan (contoh: Gula, Kopi...)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
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
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "5rem" }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-secondary)" }}>
            {ingredients.length === 0
              ? "Belum ada data bahan baku. Silakan tambah baru."
              : "Tidak ada bahan yang cocok."}
          </div>
        ) : (
          filtered.map((item) => {
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
                    <button
                      onClick={() => openEdit(item)}
                      style={{
                        background: "none", border: "none",
                        color: "var(--accent-color)",
                        cursor: "pointer", padding: "0.25rem",
                        fontSize: "0.875rem"
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={isPending}
                      style={{
                        background: "none", border: "none",
                        color: isPending ? "var(--text-secondary)" : "#ef4444",
                        cursor: "pointer", padding: "0.25rem",
                        fontSize: "0.875rem"
                      }}
                    >
                      {isPending ? "..." : "Hapus"}
                    </button>
                  </div>
                </div>
                <div style={{ marginTop: "1rem", paddingTop: "0.75rem", borderTop: "1px dashed var(--border-color)", display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>Harga per {item.unit}:</span>
                  <span style={{ fontWeight: "600", color: "var(--accent-color)" }}>Rp {hargaPerSatuan.toLocaleString("id-ID")}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Edit Bahan */}
      {editingId && (
        <div
          style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)", zIndex: 100,
            display: "flex", alignItems: "flex-end", justifyContent: "center"
          }}
          onClick={(e) => { if (e.target === e.currentTarget) closeEdit(); }}
        >
          <div style={{
            backgroundColor: "var(--bg-color)",
            width: "100%", maxWidth: "480px",
            maxHeight: "85vh", overflowY: "auto",
            borderTopLeftRadius: "20px", borderTopRightRadius: "20px",
            padding: "1.5rem",
            boxShadow: "0 -4px 20px rgba(0,0,0,0.15)",
            animation: "slideUp 0.3s ease-out"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 className="section-title" style={{ marginBottom: 0 }}>Edit Bahan</h2>
              <button
                onClick={closeEdit}
                style={{ background: "none", border: "none", fontSize: "1.5rem", color: "var(--text-secondary)", cursor: "pointer" }}
              >&times;</button>
            </div>

            <div className="form-group">
              <label className="form-label">Nama Bahan</label>
              <input
                type="text"
                className="form-control"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Harga Beli Total (Rp)</label>
              <input
                type="number"
                className="form-control"
                value={editPrice}
                onChange={(e) => setEditPrice(e.target.value)}
                required
              />
            </div>

            <div style={{ display: "flex", gap: "1rem" }}>
              <div className="form-group" style={{ flex: 2 }}>
                <label className="form-label">Jumlah Beli</label>
                <input
                  type="number"
                  className="form-control"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Satuan</label>
                <select
                  className="form-control"
                  value={editUnit}
                  onChange={(e) => setEditUnit(e.target.value)}
                  required
                  style={{ appearance: "none" }}
                >
                  <option value="gr">Gram</option>
                  <option value="ml">Mililiter</option>
                  <option value="pcs">Pcs</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleUpdate}
              className="btn btn-primary"
              style={{ marginTop: "1rem" }}
              disabled={isPending}
            >
              {isPending ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
