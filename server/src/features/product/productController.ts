import { Request, Response, NextFunction } from 'express';
import * as productService from './productService';

export async function getProductsByStoreController(req: Request, res: Response, next: NextFunction) {
  try {
     const storeId = req.params.storeId as string;
    const products = await productService.getProductsByStore(storeId);
    res.json(products);
  } catch (err) {
    next(err);
  }
}

export async function createProductController(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, price } = req.body;
    const product = await productService.createProduct(req.user!.id, name, price);
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
}

export async function updateProductController(req: Request, res: Response, next: NextFunction) {
  try {
    const { name } = req.body;
    const productId = req.params.id as string;
    const product = await productService.updateProductName(req.user!.id, productId, name);
    res.json(product);
  } catch (err) {
    next(err);
  }
}