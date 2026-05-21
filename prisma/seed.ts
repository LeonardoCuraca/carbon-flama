import { PrismaClient, Role, TableStatus } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // 1. Crear usuarios por defecto
  const hashedPassword = await bcrypt.hash("admin123", 10);
  
  await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      password: hashedPassword,
      name: "Administrador",
      role: Role.ADMIN,
    },
  });

  await prisma.user.upsert({
    where: { username: "mozo1" },
    update: {},
    create: {
      username: "mozo1",
      password: hashedPassword,
      name: "Juan Mozo",
      role: Role.MOZO,
    },
  });

  // 2. Crear Mesas
  const zones = ["Salón A", "Salón B", "Terraza"];
  for (let i = 1; i <= 15; i++) {
    await prisma.table.upsert({
      where: { id: i },
      update: {},
      create: {
        id: i,
        zone: zones[Math.floor((i - 1) / 5)],
        status: TableStatus.DISPONIBLE,
      },
    });
  }

  // 3. Crear Categorías y Productos con personalización
  console.log("Limpiando base de datos (pedidos, facturas, productos)...");
  await prisma.invoice.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.productOption.deleteMany({});
  await prisma.productOptionGroup.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});

  const categories = [
    {
      name: "Brasas",
      products: [
        {
          name: "1/4 Pollo a la Brasa",
          price: 25.0,
          description: "Con papas y ensalada",
          optionGroups: {
            create: [
              {
                name: "Acompañamiento",
                type: "SINGLE",
                required: true,
                options: {
                  create: [
                    { name: "Papas Fritas", price: 0 },
                    { name: "Ensalada", price: 0 },
                    { name: "Ambas papas y ensalada", price: 0 }
                  ]
                }
              },
              {
                name: "Salsas",
                type: "MULTIPLE",
                required: false,
                options: {
                  create: [
                    { name: "Mayonesa", price: 0 },
                    { name: "Ketchup", price: 0 },
                    { name: "Mostaza", price: 0 },
                    { name: "Ají de la casa", price: 0 },
                    { name: "Chimichurri", price: 0 }
                  ]
                }
              },
              {
                name: "Extras",
                type: "MULTIPLE",
                required: false,
                options: {
                  create: [
                    { name: "Porción extra de papas", price: 10.0 },
                    { name: "Huevo frito", price: 3.0 },
                    { name: "Queso fundido", price: 4.0 }
                  ]
                }
              }
            ]
          }
        },
        {
          name: "1/2 Pollo a la Brasa",
          price: 45.0,
          description: "Con papas y ensalada",
          optionGroups: {
            create: [
              {
                name: "Acompañamiento",
                type: "SINGLE",
                required: true,
                options: {
                  create: [
                    { name: "Papas Fritas", price: 0 },
                    { name: "Ensalada", price: 0 },
                    { name: "Ambas", price: 0 }
                  ]
                }
              },
              {
                name: "Salsas",
                type: "MULTIPLE",
                required: false,
                options: {
                  create: [
                    { name: "Mayonesa", price: 0 },
                    { name: "Ketchup", price: 0 },
                    { name: "Mostaza", price: 0 },
                    { name: "Ají de la casa", price: 0 }
                  ]
                }
              }
            ]
          }
        },
        {
          name: "Pollo Entero",
          price: 85.0,
          description: "Con papas y ensalada familiar",
          optionGroups: {
            create: [
              {
                name: "Acompañamiento",
                type: "SINGLE",
                required: true,
                options: {
                  create: [
                    { name: "Papas Fritas", price: 0 },
                    { name: "Ensalada", price: 0 },
                    { name: "Ambas", price: 0 }
                  ]
                }
              },
              {
                name: "Salsas",
                type: "MULTIPLE",
                required: false,
                options: {
                  create: [
                    { name: "Mayonesa", price: 0 },
                    { name: "Ketchup", price: 0 },
                    { name: "Mostaza", price: 0 },
                    { name: "Ají de la casa", price: 0 }
                  ]
                }
              }
            ]
          }
        }
      ]
    },
    {
      name: "Parrillas",
      products: [
        {
          name: "Anticuchos",
          price: 28.0,
          description: "2 palos con papa dorada",
          optionGroups: {
            create: [
              {
                name: "Acompañamiento",
                type: "SINGLE",
                required: true,
                options: {
                  create: [
                    { name: "Papa Dorada", price: 0 },
                    { name: "Choclo", price: 0 }
                  ]
                }
              },
              {
                name: "Salsas",
                type: "MULTIPLE",
                required: false,
                options: {
                  create: [
                    { name: "Ají Carretillero", price: 0 },
                    { name: "Chimichurri", price: 0 }
                  ]
                }
              }
            ]
          }
        },
        {
          name: "Lomo Fino",
          price: 55.0,
          description: "300g de lomo a la parrilla",
          optionGroups: {
            create: [
              {
                name: "Término de la carne",
                type: "SINGLE",
                required: true,
                options: {
                  create: [
                    { name: "Término Medio", price: 0 },
                    { name: "Tres Cuartos", price: 0 },
                    { name: "Bien Cocido", price: 0 }
                  ]
                }
              }
            ]
          }
        },
        {
          name: "Parrilla Familiar",
          price: 120.0,
          description: "Mixto de carnes y embutidos"
        }
      ]
    },
    {
      name: "Bebidas",
      products: [
        { name: "Inca Kola 1.5L", price: 12.0 },
        { name: "Chicha Morada Jarra", price: 18.0 },
        { name: "Limonada Jarra", price: 15.0 }
      ]
    }
  ];

  for (const cat of categories) {
    await prisma.category.create({
      data: {
        name: cat.name,
        products: {
          create: cat.products,
        },
      },
    });
  }
  console.log("Seeding completed successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
