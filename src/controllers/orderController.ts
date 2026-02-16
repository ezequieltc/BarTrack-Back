import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const addOrderToTable = async (req: Request, res: Response) => {
    try {
        const { tableId } = req.params;
        const { items } = req.body; // Array of { productId, quantity }

        const id = parseInt(tableId as string);

        // Get active session
        const table = await prisma.table.findUnique({
            where: { id: id },
            include: { currentSession: true }
        });

        if (!table || table.status !== 'OCCUPIED' || !table.currentSession) {
            res.status(400).json({ error: 'Table is not occupied' });
            return;
        }

        const sessionId = table.currentSession.id;

        // Check for existing Order in this session
        let order = await prisma.order.findFirst({
            where: { sessionId: sessionId }
        });

        if (!order) {
            order = await prisma.order.create({
                data: {
                    sessionId: sessionId
                }
            });
        }

        // Create Order Items
        const orderItemsData = [];
        let orderTotal = 0;

        for (const item of items) {
            const product = await prisma.product.findUnique({ where: { id: item.productId } });
            if (product) {
                orderItemsData.push({
                    orderId: order.id,
                    productId: item.productId,
                    quantity: item.quantity,
                    priceAtOrder: product.price
                });
                orderTotal += (product.price * item.quantity);
            }
        }

        if (orderItemsData.length > 0) {
            await prisma.orderItem.createMany({
                data: orderItemsData
            });
        }

        // Update Session Total
        await prisma.tableSession.update({
            where: { id: sessionId },
            data: {
                totalAmount: { increment: orderTotal }
            }
        });

        res.json({ message: 'Order added', orderId: order.id });
    } catch (error) {
        res.status(500).json({ error: 'Error adding order' });
    }
};

export const getOrders = async (req: Request, res: Response) => {
    try {
        const orders = await prisma.order.findMany({
            include: {
                session: {
                    include: {
                        tableHistory: true
                    }
                },
                items: {
                    include: {
                        product: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching orders' });
    }
};
