"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { updateIngredient, deleteIngredient } from "@/app/actions/ingredient";

type Ingredient = {
  id: string;
  name: string;
  purchasePrice: number;
  purchaseAmount: number;
  unit: string;
};

export default function BahanCard({ item }: { item: Ingredient }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && nameRef.current) {
      nameRef.current.focus();
    }
  }, [isEditing]);

  const hargaPerSatuan = Math.round(item.purchasePrice / item.purchaseAmount);

  function handleDelete() {
    if (confirm("Hapus bahan ini?")) {
      startTransition(() => {
        deleteIngredient(item.id);
      });
    }
  }

  async function handleSave(formData: FormData) {
    startTransition(async () => {
      try {
        await updateIngredient(item.id, formData);
        setIsEditing(false);
      } catch (err: any) {
        alert("Gagal menyimpan: " + (err.message || "Unknown error"));
      }
    });
  }

  if (isEditing) {
    return (
      <div className="card" style={{ marginBottom: 0, border: "2px solid var(--accent-color)" }}>
        <form action={handleSave}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <span style={{ fontWeight: "600", fontSize: "0.875rem", color: "var(--accent-color)" }}>Edit Bahan</span>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              style={{ background: "none", border: "none", fontSize: "1.25rem", color: "var(--text-secondary)", cursor: "pointer" }}
            >&times;</button>
          </div>

          <div className="form-group">
            <label className="form-label">Nama Bahan</label>
            <input
              ref={nameRef}
              name="name"
              type="text"
              className="form-control"
              required
              defaultValue={item.name}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Harga Beli Total (Rp)</label>
            <input
              name="purchasePrice"
              type="number"
              className="form-control"
              required
              defaultValue={item.purchasePrice}
            />
          </div>

          <div style={{ display: "flex", gap: "1rem" }}>
            <div className="form-group" style={{ flex: 2 }}>
              <label className="form-label">Jumlah Beli</label>
              <input
                name="purchaseAmount"
                type="number"
                className="form-control"
                required
                defaultValue={item.purchaseAmount}
              />
            </div>

            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Satuan</label>
              <select name="unit" className="form-control" required defaultValue={item.unit} style={{ appearance: "none" }}>
                <option value="gr">Gram</option>
                <option value="ml">Mililiter</option>
                <option value="pcs">Pcs</option>
              </select>
            </div>
          </div>

          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="btn"
              style={{ backgroundColor: "var(--color-slate-100)", color: "var(--text-secondary)", flex: 1 }}
            >
              Batal
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ flex: 1 }}
              disabled={isPending}
            >
              {isPending ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="card" style={{ marginBottom: 0 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontWeight: "600", fontSize: "1.125rem" }}>{item.name}</div>
          <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
            Beli: Rp {item.purchasePrice.toLocaleString("id-ID")} / {item.purchaseAmount} {item.unit}
          </div>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            onClick={() => setIsEditing(true)}
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
            onClick={handleDelete}
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
}
