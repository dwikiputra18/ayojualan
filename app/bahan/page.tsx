import { prisma } from "@/lib/prisma";
import FormTambahBahan from "./FormTambahBahan";
import DaftarBahan from "./DaftarBahan";

export const dynamic = "force-dynamic";

export default async function BahanBaku() {
  const ingredients = await prisma.ingredient.findMany({
    orderBy: { createdAt: "desc" }
  });

  return (
    <div>
      <h1 className="page-title">Master Bahan Baku</h1>
      <DaftarBahan ingredients={ingredients} />
      <FormTambahBahan />
    </div>
  );
}
