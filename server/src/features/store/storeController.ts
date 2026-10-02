import { Request, Response, NextFunction } from 'express';
import * as storeService from './storeService';

export async function getOpenStoresController(_req: Request, res: Response, next: NextFunction) {
  try {
    const stores = await storeService.getOpenStores();
    res.json(stores);
  } catch (err) {
    next(err);
  }
}

export async function getMyStoreController(req: Request, res: Response, next: NextFunction) {
  try {
    const store = await storeService.getMyStore(req.user!.id);
    res.json(store);
  } catch (err) {
    next(err);
  }
}

export async function toggleMyStoreController(req: Request, res: Response, next: NextFunction) {
  try {
    const store = await storeService.toggleMyStore(req.user!.id);
    res.json(store);
  } catch (err) {
    next(err);
  }
}