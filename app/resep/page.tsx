import { prisma } from "@/lib/prisma";
import ResepManager from "./ResepManager";

export const dynamic = "force-dynamic";

export default async function Page() {
  const recipes = await prisma.recipe.findMany({
    include: {
      ingredients: {
        include: {
          ingredient: true,
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  const availableIngredients = await prisma.ingredient.findMany({
    orderBy: { name: "asc" }
  });

  return <ResepManager initialRecipes={recipes} availableIngredients={availableIngredients} />;
}
