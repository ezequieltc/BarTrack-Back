import PDFDocument from 'pdfkit';
import { Response } from 'express';

interface InvoiceData {
    tableName: string;
    startTime: Date;
    endTime: Date;
    items: {
        name: string;
        quantity: number;
        price: number;
        total: number;
    }[];
    totalAmount: number;
}

export const generateInvoicePDF = (data: InvoiceData, res: Response) => {
    const doc = new PDFDocument();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${Date.now()}.pdf`);

    doc.pipe(res);

    // Header
    doc.fontSize(25).text('BarTrack Invoice', { align: 'center' });
    doc.moveDown();

    // Table Info
    doc.fontSize(12).text(`Table: ${data.tableName}`);
    doc.text(`Date: ${new Date().toLocaleDateString()}`);
    doc.text(`Duration: ${data.startTime.toLocaleTimeString()} - ${data.endTime.toLocaleTimeString()}`);
    doc.moveDown();

    // Items Header
    doc.text('Item', 50, 200);
    doc.text('Qty', 250, 200);
    doc.text('Price', 350, 200);
    doc.text('Total', 450, 200);
    doc.moveTo(50, 215).lineTo(550, 215).stroke();

    // Items
    let y = 230;
    data.items.forEach(item => {
        doc.text(item.name, 50, y);
        doc.text(item.quantity.toString(), 250, y);
        doc.text(`$${item.price}`, 350, y);
        doc.text(`$${item.total}`, 450, y);
        y += 20;
    });

    doc.moveTo(50, y + 10).lineTo(550, y + 10).stroke();

    // Total
    doc.fontSize(16).text(`Total: $${data.totalAmount}`, 350, y + 30);

    doc.end();
};
