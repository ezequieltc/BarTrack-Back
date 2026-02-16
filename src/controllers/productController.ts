import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const getProducts = async (req: Request, res: Response) => {
    try {
        const products = await prisma.product.findMany({
            where: { isActive: true }
        });
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching products' });
    }
};

export const createProduct = async (req: Request, res: Response) => {
    try {
        const { name, price, category } = req.body;
        const product = await prisma.product.create({
            data: { name, price: parseFloat(price), category }
        });
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: 'Error creating product' });
    }
};

export const deleteProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if (!id) {
            res.status(400).json({ error: 'ID is required' });
            return;
        }
        await prisma.product.update({
            where: { id: parseInt(id as string) },
            data: { isActive: false }
        });
        res.json({ message: 'Product deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting product' });
    }
};
