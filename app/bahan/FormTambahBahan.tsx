"use client";

import { useState } from "react";
import { createIngredient } from "@/app/actions/ingredient";

export default function FormTambahBahan() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleAction(formData: FormData) {
    setLoading(true);
    try {
      await createIngredient(formData);
      setIsOpen(false);
    } catch (err: any) {
      console.error(err);
      alert("Terjadi kesalahan (" + (err.message || "Unknown") + "). Pastikan semua data diisi dengan benar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div style={{ position: "fixed", bottom: "100px", right: "20px", zIndex: 50 }}>
        <button 
          onClick={() => setIsOpen(true)}
          style={{ 
            width: "56px", 
            height: "56px", 
            borderRadius: "50%", 
            backgroundColor: "var(--accent-color)", 
            color: "white", 
            border: "none", 
            boxShadow: "0 4px 12px rgba(16, 185, 129, 0.4)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
      </div>

      {isOpen && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: "rgba(0,0,0,0.5)", zIndex: 100,
          display: "flex", alignItems: "flex-end", justifyContent: "center"
        }}>
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
              <h2 className="section-title" style={{ marginBottom: 0 }}>Tambah Bahan Baru</h2>
              <button 
                onClick={() => setIsOpen(false)}
                style={{ background: "none", border: "none", fontSize: "1.5rem", color: "var(--text-secondary)", cursor: "pointer" }}
              >&times;</button>
            </div>

            <form action={handleAction}>
              <div className="form-group">
                <label className="form-label">Nama Bahan</label>
                <input name="name" type="text" className="form-control" required placeholder="Contoh: Biji Kopi Arabika" />
              </div>
              
              <div className="form-group">
                <label className="form-label">Harga Beli Total (Rp)</label>
                <input name="purchasePrice" type="number" className="form-control" required placeholder="Contoh: 200000" />
              </div>

              <div style={{ display: "flex", gap: "1rem" }}>
                <div className="form-group" style={{ flex: 2 }}>
                  <label className="form-label">Jumlah Beli</label>
                  <input name="purchaseAmount" type="number" className="form-control" required placeholder="Contoh: 1000" />
                </div>
                
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Satuan</label>
                  <select name="unit" className="form-control" required style={{ appearance: "none" }}>
                    <option value="gr">Gram</option>
                    <option value="ml">Mililiter</option>
                    <option value="pcs">Pcs</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: "1rem" }} disabled={loading}>
                {loading ? "Menyimpan..." : "Simpan Bahan"}
              </button>
            </form>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}} />
    </>
  );
}
