import { Request, Response, NextFunction } from 'express';
import * as orderService from './orderService';

export async function createOrderController(req: Request, res: Response, next: NextFunction) {
  try {
    const order = await orderService.createOrder(req.user!.id, req.body);
    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
}

export async function getMyOrdersController(req: Request, res: Response, next: NextFunction) {
  try {
    const orders = await orderService.getMyOrders(req.user!.id);
    res.json(orders);
  } catch (err) {
    next(err);
  }
}

export async function getStoreOrdersController(req: Request, res: Response, next: NextFunction) {
  try {
    const orders = await orderService.getStoreOrders(req.user!.id);
    res.json(orders);
  } catch (err) {
    next(err);
  }
}

export async function getAvailableOrdersController(_req: Request, res: Response, next: NextFunction) {
  try {
    const orders = await orderService.getAvailableOrders();
    res.json(orders);
  } catch (err) {
    next(err);
  }
}

export async function getMyDeliveriesController(req: Request, res: Response, next: NextFunction) {
  try {
    const orders = await orderService.getMyDeliveries(req.user!.id);
    res.json(orders);
  } catch (err) {
    next(err);
  }
}

export async function acceptOrderController(req: Request, res: Response, next: NextFunction) {
  try {
    const orderId = req.params.id as string;
    const order = await orderService.acceptOrder(req.user!.id, orderId);
    res.json(order);
  } catch (err) {
    next(err);
  }
}

export async function releaseOrderController(req: Request, res: Response, next: NextFunction) {
  try {
    const orderId = req.params.id as string;
    const order = await orderService.releaseOrder(req.user!.id, orderId);
    res.json(order);
  } catch (err) {
    next(err);
  }
}

export async function markDeliveredController(req: Request, res: Response, next: NextFunction) {
  try {
    const orderId = req.params.id as string;
    const order = await orderService.markDelivered(req.user!.id, orderId);
    res.json(order);
  } catch (err) {
    next(err);
  }
}