import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding...');
    // Create Products
    const products = [
        //CERVEZAS
        { name: 'Caña', price: 3.50, category: 'Bebidas' },
        { name: 'Doble', price: 5.00, category: 'Bebidas' },
        { name: 'Tercio (botellín)', price: 4.50, category: 'Bebidas' },

        // VINOS Y VERMUT
        { name: 'Copa vino tinto', price: 4.00, category: 'Bebidas' },
        { name: 'Copa vino blanco', price: 4.00, category: 'Bebidas' },
        { name: 'Vermut', price: 4.50, category: 'Bebidas' },

        // COPAS
        { name: 'Gin Tonic', price: 10.00, category: 'Bebidas' },
        { name: 'Mojito', price: 11.00, category: 'Bebidas' },
        { name: 'Cuba Libre', price: 10.00, category: 'Bebidas' },

        // SIN ALCOHOL
        { name: 'Refresco', price: 3.50, category: 'Bebidas' },
        { name: 'Agua', price: 2.50, category: 'Bebidas' },
        { name: 'Café', price: 1.80, category: 'Bebidas' },

        // TAPAS
        { name: 'Patatas bravas', price: 6.50, category: 'Comidas' },
        { name: 'Croquetas (6u)', price: 8.50, category: 'Comidas' },
        { name: 'Tortilla española', price: 5.50, category: 'Comidas' },
        { name: 'Ensaladilla rusa', price: 6.00, category: 'Comidas' },

        // RACIONES / PLATOS
        { name: 'Calamares a la romana', price: 12.00, category: 'Comidas' },
        { name: 'Hamburguesa completa', price: 14.00, category: 'Comidas' },
        { name: 'Nachos con guacamole', price: 9.50, category: 'Comidas' },

        // BOCADILLOS
        { name: 'Bocadillo de calamares', price: 8.00, category: 'Comidas' },
        { name: 'Bocadillo de jamón', price: 7.50, category: 'Comidas' },

        // POSTRES
        { name: 'Tarta de queso', price: 5.50, category: 'Postres' },
        { name: 'Brownie con helado', price: 6.00, category: 'Postres' },
    ];

    for (const p of products) {
        await prisma.product.create({ data: p });
    }

    // Create Tables
    for (let i = 1; i <= 10; i++) {
        await prisma.table.create({
            data: { number: i }
        });
    }

    console.log('Seed completed!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
