"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createIngredient(formData: FormData) {
  const name = formData.get("name") as string;
  const purchasePrice = parseInt(formData.get("purchasePrice") as string);
  const purchaseAmount = parseInt(formData.get("purchaseAmount") as string);
  const unit = formData.get("unit") as string;

  if (!name || isNaN(purchasePrice) || isNaN(purchaseAmount) || !unit) {
    throw new Error("Data tidak valid. Harap isi semua kolom dengan benar.");
  }

  await prisma.ingredient.create({
    data: {
      name,
      purchasePrice,
      purchaseAmount,
      unit,
    },
  });

  revalidatePath("/bahan");
}

export async function deleteIngredient(id: string) {
  await prisma.ingredient.delete({
    where: { id },
  });
  revalidatePath("/bahan");
}
