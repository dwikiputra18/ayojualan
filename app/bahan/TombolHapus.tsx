"use client";

import { useTransition } from "react";
import { deleteIngredient } from "@/app/actions/ingredient";

export default function TombolHapus({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (confirm("Hapus bahan ini?")) {
      startTransition(() => {
        deleteIngredient(id);
      });
    }
  }

  return (
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
  );
}
