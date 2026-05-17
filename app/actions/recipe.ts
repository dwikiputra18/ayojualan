"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createRecipe(formData: FormData) {
  const name = formData.get("name") as string;
  if (!name) throw new Error("Nama resep diperlukan");

  await prisma.recipe.create({
    data: {
      name,
      margin: 50, // default
    },
  });

  revalidatePath("/resep");
  revalidatePath("/");
}

export async function deleteRecipe(id: string) {
  await prisma.recipe.delete({
    where: { id },
  });
  revalidatePath("/resep");
  revalidatePath("/");
}

export async function updateRecipeName(id: string, name: string) {
  if (!name.trim()) throw new Error("Nama resep tidak boleh kosong");
  await prisma.recipe.update({
    where: { id },
    data: { name: name.trim() },
  });
  revalidatePath("/resep");
  revalidatePath("/");
}

export async function updateRecipeMargin(id: string, margin: number) {
  await prisma.recipe.update({
    where: { id },
    data: { margin },
  });
  revalidatePath("/resep");
}

export async function updateRecipeIngredientAmount(id: string, amount: number) {
  if (isNaN(amount) || amount <= 0) throw new Error("Jumlah tidak valid");
  await prisma.recipeIngredient.update({
    where: { id },
    data: { amount },
  });
  revalidatePath("/resep");
  revalidatePath("/");
}

export async function addIngredientToRecipe(formData: FormData) {
  const recipeId = formData.get("recipeId") as string;
  const ingredientId = formData.get("ingredientId") as string;
  const amount = parseInt(formData.get("amount") as string);

  if (!recipeId || !ingredientId || isNaN(amount)) {
    throw new Error("Data tidak valid");
  }

  // Cek apakah sudah ada
  const existing = await prisma.recipeIngredient.findUnique({
    where: {
      recipeId_ingredientId: { recipeId, ingredientId }
    }
  });

  if (existing) {
    await prisma.recipeIngredient.update({
      where: { id: existing.id },
      data: { amount: existing.amount + amount }
    });
  } else {
    await prisma.recipeIngredient.create({
      data: {
        recipeId,
        ingredientId,
        amount,
      }
    });
  }

  revalidatePath("/resep");
  revalidatePath("/");
}

export async function removeIngredientFromRecipe(id: string) {
  await prisma.recipeIngredient.delete({
    where: { id },
  });
  revalidatePath("/resep");
  revalidatePath("/");
}
