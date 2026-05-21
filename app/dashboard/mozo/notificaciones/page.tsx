import prisma from "@/lib/prisma";
import MozoNotificacionesClient from "@/components/modules/salon/MozoNotificacionesClient";

export default async function NotificacionesPage() {
  const readyItems = await prisma.orderItem.findMany({
    where: {
      status: "LISTO"
    },
    include: {
      product: true,
      order: {
        include: {
          waiter: {
            select: { name: true }
          }
        }
      }
    },
    orderBy: {
      order: { createdAt: "asc" }
    }
  });

  return <MozoNotificacionesClient initialItems={readyItems} />;
}
