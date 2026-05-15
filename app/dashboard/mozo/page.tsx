import prisma from "@/lib/prisma";
import MozoPageClient from "@/components/modules/salon/MozoPageClient";

export default async function MozoPage({
  searchParams,
}: {
  searchParams: Promise<{ zone?: string }>;
}) {
  const { zone } = await searchParams;
  
  const tables = await prisma.table.findMany({
    where: zone ? { zone } : {},
    orderBy: { id: "asc" },
  });

  return <MozoPageClient initialTables={tables} initialZone={zone} />;
}
