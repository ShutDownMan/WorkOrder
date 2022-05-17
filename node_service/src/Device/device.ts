import { PrismaClient } from "@prisma/client";
import { Request, Response, NextFunction } from "express";
import { assert, object, string, nullable, size, refine, optional, number } from 'superstruct'
import { HandlerError, HandlerErrors } from "../HandlerError/handler-error";
import PrismaGlobal from "../prisma";

/// model for device get by id
const DeviceGetID = object({
    id: number(),
});

/// create model
const DeviceInsertModel = object({
    brand: string(),
    model: string(),
    photoURL: optional(string()),
    sku: optional(string()),
    description: optional(string()),
});

/// Device model for patching
const DevicePatchingModel = object({
    id: number(),
    brand: optional(string()),
    model: optional(string()),
    photoURL: optional(string()),
    sku: optional(string()),
    description: optional(string()),
});

export async function getDeviceByIDHandler(req: Request, res: Response, next: NextFunction): Promise<any> {
    const prisma: PrismaClient = PrismaGlobal.getInstance().prisma;

    let reqBody = req.body;
    /// validate input
    try {
        assert(reqBody, DeviceGetID);
    } catch (error) {
        console.log("Error trying to get device by ID: ", error);

        let errorRes: HandlerError = {
            message: "Bad Request, couldn't validate data.",
            type: HandlerErrors.ValidationError
        };

        return res.status(403).json(errorRes);
    }

    /// query database for device
    try {
        /// return device
        let queriedDevice = await prisma.device.findUnique({
            where: {
                id: reqBody.id
            }
        });

        /// if device was retrieved
        if (!queriedDevice) {
            let errorRes: HandlerError = {
                message: `Bad Request, couldn't find device with id ${reqBody.id}.`,
                type: HandlerErrors.NotFound
            };

            return res.status(404).json(errorRes)
        }

        return res.status(200).json(queriedDevice);
    } catch (error) {
        console.log("Error trying to find device by ID: ", error);

        let errorRes: HandlerError = {
            message: "Server Error, couldn't find device by id.",
            type: HandlerErrors.DatabaseError
        };

        return res.status(500).json(errorRes);
    }
}

export async function postDeviceHandler(req: Request, res: Response, next: NextFunction): Promise<any> {
    const prisma: PrismaClient = PrismaGlobal.getInstance().prisma;

    /// assert the input is valid
    let postedDevice = req.body;
    try {
        assert(postedDevice, DeviceInsertModel);
    } catch (error) {
        console.log("Error trying to insert new client: ", error);

        let errorRes: HandlerError = {
            message: "Bad Request, couldn't validate data.",
            type: HandlerErrors.ValidationError
        };

        return res.status(403).json(errorRes);
    }

    try {
        /// data to be inserted into the database
        let data = {
            brand: postedDevice.brand,
            model: postedDevice.model,
            photoURL: postedDevice.photoURL,
            sku: postedDevice.sku,
            description: postedDevice.description,
        };

        /// insert device in the database
        const device = await prisma.device.create({
            data
        });

        /// return newly added device identifier
        return res.status(200).json({ id: device.id });

    } catch (error) {
        console.log("Error trying to insert new device: ", error);

        let errorRes: HandlerError = {
            message: "Server Error, couldn't insert data into the database.",
            type: HandlerErrors.DatabaseError
        };

        return res.status(500).json(errorRes);
    }
}

export async function patchDeviceHandler(req: Request, res: Response, next: NextFunction): Promise<any> {
    /// validate input
    const prisma: PrismaClient = PrismaGlobal.getInstance().prisma;

    let reqBody = req.body;
    /// validate input
    try {
        assert(reqBody, DevicePatchingModel);
    } catch (error) {
        console.log("Error trying to get device by ID: ", error);

        let errorRes: HandlerError = {
            message: "Bad Request, couldn't validate data.",
            type: HandlerErrors.ValidationError
        };

        return res.status(403).json(errorRes);
    }

    /// query database for device
    try {
        let { id, ...deviceUpdates } = reqBody;
        let transactions = []
        let deviceData = {
            brand: deviceUpdates.brand,
            model: deviceUpdates.model,
            photoURL: deviceUpdates.photoURL,
            sku: deviceUpdates.sku,
            description: deviceUpdates.description,
        };

        /// update device in the database
        let deviceUpdate = prisma.device.update({
            where: {
                id: reqBody.id
            },
            data: deviceData
        });
        transactions.push(deviceUpdate);

        const transaction = await prisma.$transaction(transactions);

        /// if device was retrieved
        if (!transaction) {
            let errorRes: HandlerError = {
                message: `Bad Request, couldn't find device with id ${reqBody.id}.`,
                type: HandlerErrors.NotFound
            };

            return res.status(404).json(errorRes)
        }

        /// return updated device identifier
        return res.status(200).json({ transaction });
    } catch (error) {
        console.log("Error trying to find device by ID: ", error);

        let errorRes: HandlerError = {
            message: "Server Error, couldn't find device by id.",
            type: HandlerErrors.DatabaseError
        };

        return res.status(500).json(errorRes);
    }
}

export async function deleteDeviceHandler(req: Request, res: Response, next: NextFunction): Promise<any> {
    const prisma: PrismaClient = PrismaGlobal.getInstance().prisma;
    /// validate input

    let reqBody = req.body;
    /// validate input
    try {
        assert(reqBody, DeviceGetID);
    } catch (error) {
        console.log("Error trying to get device by ID: ", error);

        let errorRes: HandlerError = {
            message: "Bad Request, couldn't validate data.",
            type: HandlerErrors.ValidationError
        };

        return res.status(403).json(errorRes);
    }

    /// query database for device
    try {
        /// delete device in the database
        let deleteDevice = prisma.device.delete({
            where: {
                id: reqBody.id
            }
        });

        const transaction = await prisma.$transaction([deleteDevice])

        /// return confirmation of deletion
        return res.status(200).json({ message: "Device deleted sucessfully." });
    } catch (error) {
        console.log("Error trying to delete device by ID: ", error);

        let errorRes: HandlerError = {
            message: "Server Error, couldn't find device by id.",
            type: HandlerErrors.DatabaseError
        };

        return res.status(500).json(errorRes);
    }
}
