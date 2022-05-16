import { Request, Response, NextFunction } from "express";
import { assert, object, string, nullable, size, refine } from 'superstruct'
import { HandlerError } from "../HandlerError/handler-error";

/// create model
const DeviceInsertModel = object({
    brand: string(),
    model: string(),
    photoURL: nullable(string()),
    SKU: nullable(string()),
    descricao: nullable(string()),
});

export async function getDeviceByIDHandler(req: Request, res: Response, next: NextFunction): Promise<any> {
    /// validate input

    /// query database for device

    /// return device

    // TODO: handle errors
}

export async function postDeviceHandler(req: Request, res: Response, next: NextFunction): Promise<any> {
    /// validate input

    /// insert device in the database

    /// return newly added device identifier

    // TODO: handle errors
}

export async function patchDeviceHandler(req: Request, res: Response, next: NextFunction): Promise<any> {
    /// validate input

    /// update device in the database

    /// return updated device identifier

    // TODO: handle errors
}

export async function deleteDeviceHandler(req: Request, res: Response, next: NextFunction): Promise<any> {
    /// validate input

    /// delete device in the database

    /// return confirmation of deletion

    // TODO: handle errors
}
