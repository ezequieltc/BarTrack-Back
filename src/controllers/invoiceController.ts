import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const getInvoices = async (req: Request, res: Response) => {
    try {
        const sessions = await prisma.tableSession.findMany({
            where: {
                endTime: { not: null }
            },
            include: {
                tableHistory: true
            },
            orderBy: { endTime: 'desc' }
        });

        const totalSales = sessions.reduce((acc, session) => acc + session.totalAmount, 0);
        const totalOrders = sessions.length;

        res.json({
            totalSales,
            totalOrders,
            sessions // detailed history
        });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching invoices' });
    }
};
