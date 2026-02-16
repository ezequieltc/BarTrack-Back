import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const getTables = async (req: Request, res: Response) => {
    try {
        const tables = await prisma.table.findMany({
            include: {
                currentSession: {
                    include: {
                        orders: {
                            include: {
                                items: {
                                    include: {
                                        product: true
                                    }
                                }
                            }
                        }
                    }
                }
            },
        });
        res.json(tables);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching tables' });
    }
};

export const openTable = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const tableId = parseInt(id as string);

        // Check if authentic
        const table = await prisma.table.findUnique({ where: { id: tableId } });
        if (!table) {
            res.status(404).json({ error: 'Table not found' });
            return;
        }
        if (table.status === 'OCCUPIED') {
            res.status(400).json({ error: 'Table already occupied' });
            return;
        }

        // Create session
        const session = await prisma.tableSession.create({
            data: {
                tableId: tableId
            }
        });

        // Update table
        await prisma.table.update({
            where: { id: tableId },
            data: {
                status: 'OCCUPIED',
                currentSessionId: session.id
            }
        });

        res.json(session);
    } catch (error) {
        res.status(500).json({ error: 'Error opening table' });
    }
};

export const closeTable = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const tableId = parseInt(id as string);

        const table = await prisma.table.findUnique({
            where: { id: tableId },
            include: { currentSession: { include: { orders: { include: { items: true } } } } }
        });

        if (!table || table.status !== 'OCCUPIED' || !table.currentSession) {
            res.status(400).json({ error: 'Table not occupied' });
            return;
        }

        const session = table.currentSession;

        // Calculate total
        let finalTotal = 0;
        if (session.orders) {
            session.orders.forEach(order => {
                order.items.forEach(item => {
                    finalTotal += item.priceAtOrder * item.quantity;
                });
            });
        }

        await prisma.tableSession.update({
            where: { id: session.id },
            data: {
                endTime: new Date(),
                totalAmount: finalTotal
            }
        });

        await prisma.table.update({
            where: { id: tableId },
            data: {
                status: 'FREE',
                currentSessionId: null
            }
        });

        // Generate PDF
        const PDFDocument = require('pdfkit');
        const doc = new PDFDocument();
        const buffers: any[] = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
            const pdfData = Buffer.concat(buffers);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=invoice-table-${table.number}.pdf`);
            res.status(200).send(pdfData);
        });

        console.log('Starting PDF generation for Table', table.number);

        doc.fontSize(25).text('BarTrack Invoice', { align: 'center' });
        doc.moveDown();
        doc.fontSize(14).text(`Table: ${table.number}`);
        doc.text(`Date: ${new Date().toLocaleDateString()}`);
        doc.moveDown();

        doc.text('Items:', { underline: true });
        doc.moveDown();

        // RE-FETCH for PDF generation with full details
        const fullSession = await prisma.tableSession.findUnique({
            where: { id: session.id },
            include: {
                orders: {
                    include: {
                        items: {
                            include: {
                                product: true
                            }
                        }
                    }
                }
            }
        });

        if (fullSession && fullSession.orders) {
            fullSession.orders.forEach((order: any) => {
                order.items.forEach((item: any) => {
                    // Check if product exists
                    const productName = item.product ? item.product.name : 'Unknown Product';
                    const total = item.priceAtOrder * item.quantity;
                    doc.text(`${productName} x ${item.quantity} - $${total}`);
                });
            });
        }

        doc.moveDown();
        doc.fontSize(20).text(`Total: $${finalTotal}`, { align: 'right' });

        doc.end();

    } catch (error: any) {
        console.error('Close Table Error:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: error.message || 'Error closing table', stack: error.stack });
        }
    }
};

export const getTableDetails = async (req: Request, res: Response) => {
    console.log("HOLA")
    try {
        const id = Number(req.params.id);
        console.log('getTableDetails - ID received:', req.params.id, 'Parsed ID:', id);

        const table = await prisma.table.findUnique({
            where: { id: id },
            include: {
                currentSession: {
                    include: {
                        orders: {
                            include: {
                                items: {
                                    include: {
                                        product: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        console.log('getTableDetails - Table found:', table ? `Yes (ID: ${table.id})` : 'No');

        if (!table) {
            return res.status(404).json({ error: 'Table not found' });
        }
        res.json(table);
    } catch (error: any) {
        console.error('getTableDetails - Error:', error);
        res.status(500).json({ error: 'Error fetching table details', details: error.message });
    }
};

export const createTable = async (req: Request, res: Response) => {
    try {
        const { number } = req.body;
        console.log('Creating table with number:', number, 'Type:', typeof number);

        const tableNumber = typeof number === 'number' ? number : parseInt(number);

        if (isNaN(tableNumber)) {
            return res.status(400).json({ error: 'Invalid table number' });
        }

        const existing = await prisma.table.findUnique({ where: { number: tableNumber } });
        console.log('Existing table check:', existing);

        if (existing) {
            return res.status(400).json({ error: 'Table number already exists' });
        }

        const table = await prisma.table.create({
            data: {
                number: tableNumber,
                status: 'FREE'
            }
        });
        console.log('Table created:', table);
        res.json(table);
    } catch (error: any) {
        console.error('Error creating table:', error);
        res.status(500).json({ error: 'Error creating table', details: error.message });
    }
};

export const updateTableStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'FREE', 'OCCUPIED', 'DISABLED'

        const table = await prisma.table.update({
            where: { id: Number(id) },
            data: { status }
        });
        res.json(table);
    } catch (error) {
        res.status(500).json({ error: 'Error updating table status' });
    }
};
