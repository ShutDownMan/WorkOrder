import { PrismaClient } from "@prisma/client";
import { Request, Response, NextFunction } from "express";
import { assert, object, string, nullable, size, refine, optional, number } from 'superstruct'
import { HandlerError, HandlerErrors } from "../HandlerError/handler-error";
import PrismaGlobal from "../prisma";

/// model for getting all services
const ServicesGet = object({
    take: optional(number()),
    page: optional(number()),
});

/// model for service get by id
const ServiceGetID = object({
    id: number(),
});

/// create model
const ServiceInsertModel = object({
    description: string(),
    estimatedTimeCost: optional(number()),
    estimatedMaterialCost: optional(number()),
});

/// Service model for patching
const ServicePatchingModel = object({
    id: number(),
    description: optional(string()),
    estimatedTimeCost: optional(number()),
    estimatedMaterialCost: optional(number()),
});

export async function getServicesHandler(req: Request, res: Response, next: NextFunction): Promise<any> {
    const prisma: PrismaClient = PrismaGlobal.getInstance().prisma;

    let reqBody = req.body;
    /// validate input
    try {
        assert(reqBody, ServicesGet);
    } catch (error) {
        console.log("Error trying to get services: ", error);

        let errorRes: HandlerError = {
            message: "Bad Request, couldn't validate data.",
            type: HandlerErrors.ValidationError
        };

        return res.status(403).json(errorRes);
    }

    /// getting records
    try {
        let services = await prisma.service.findMany({
            ...(reqBody.take && {
                take: reqBody.take,
            }),
            ...(reqBody.page && reqBody.take && {
                skip: reqBody.take * reqBody.page,
            })
        });

        return res.status(200).json(services)
    } catch (error) {
        console.log("Error trying to get services: ", error);

        let errorRes: HandlerError = {
            message: "Bad Request, couldn't validate data.",
            type: HandlerErrors.ValidationError
        };

        return res.status(403).json(errorRes);
    }
}

export async function getServiceByIDHandler(req: Request, res: Response, next: NextFunction): Promise<any> {
    const prisma: PrismaClient = PrismaGlobal.getInstance().prisma;

    let reqBody = req.body;
    /// validate input
    try {
        assert(reqBody, ServiceGetID);
    } catch (error) {
        console.log("Error trying to get service by ID: ", error);

        let errorRes: HandlerError = {
            message: "Bad Request, couldn't validate data.",
            type: HandlerErrors.ValidationError
        };

        return res.status(403).json(errorRes);
    }

    /// query database for service
    try {
        /// return service
        let queriedService = await prisma.service.findUnique({
            where: {
                id: reqBody.id
            }
        });

        /// if service was retrieved
        if (!queriedService) {
            let errorRes: HandlerError = {
                message: `Bad Request, couldn't find service with id ${reqBody.id}.`,
                type: HandlerErrors.NotFound
            };

            return res.status(404).json(errorRes)
        }

        return res.status(200).json(queriedService);
    } catch (error) {
        console.log("Error trying to find service by ID: ", error);

        let errorRes: HandlerError = {
            message: "Server Error, couldn't find service by id.",
            type: HandlerErrors.DatabaseError
        };

        return res.status(500).json(errorRes);
    }
}

export async function postServiceHandler(req: Request, res: Response, next: NextFunction): Promise<any> {
    const prisma: PrismaClient = PrismaGlobal.getInstance().prisma;

    /// assert the input is valid
    let postedService = req.body;
    try {
        assert(postedService, ServiceInsertModel);
    } catch (error) {
        console.log("Error trying to insert new service: ", error);

        let errorRes: HandlerError = {
            message: "Bad Request, couldn't validate data.",
            type: HandlerErrors.ValidationError
        };

        return res.status(403).json(errorRes);
    }

    try {
        /// data to be inserted into the database
        let data = {
            description: postedService.description,
            estimatedTimeCost: postedService.estimatedTimeCost,
            estimatedMaterialCost: postedService.estimatedMaterialCost,
        };

        /// insert service in the database
        const service = await prisma.service.create({
            data
        });

        /// return newly added service identifier
        return res.status(200).json({ id: service.id });

    } catch (error) {
        console.log("Error trying to insert new service: ", error);

        let errorRes: HandlerError = {
            message: "Server Error, couldn't insert data into the database.",
            type: HandlerErrors.DatabaseError
        };

        return res.status(500).json(errorRes);
    }
}

export async function patchServiceHandler(req: Request, res: Response, next: NextFunction): Promise<any> {
    /// validate input
    const prisma: PrismaClient = PrismaGlobal.getInstance().prisma;

    let reqBody = req.body;
    /// validate input
    try {
        assert(reqBody, ServicePatchingModel);
    } catch (error) {
        console.log("Error trying to get service by ID: ", error);

        let errorRes: HandlerError = {
            message: "Bad Request, couldn't validate data.",
            type: HandlerErrors.ValidationError
        };

        return res.status(403).json(errorRes);
    }

    let { id, ...serviceUpdates } = reqBody;
    let transactions = []
    let serviceData = {
        description: serviceUpdates.description,
        estimatedTimeCost: serviceUpdates.estimatedTimeCost,
        estimatedMaterialCost: serviceUpdates.estimatedMaterialCost,
    };

    /// update service in the database
    let serviceUpdate = prisma.service.update({
        where: {
            id
        },
        data: serviceData
    });
    transactions.push(serviceUpdate);

    /// query database for service
    try {
        const transaction = await prisma.$transaction(transactions);

        /// if service was not retrieved
        if (!transaction[0]) {
            let errorRes: HandlerError = {
                message: `Bad Request, couldn't find service with id ${reqBody.id}.`,
                type: HandlerErrors.NotFound
            };

            return res.status(403).json(errorRes)
        }

        /// return updated service identifier
        return res.status(200).json({ id });
    } catch (error) {
        console.log("Error trying to find service by ID: ", error);

        let errorRes: HandlerError = {
            message: "Server Error, couldn't find service by id.",
            type: HandlerErrors.DatabaseError
        };

        return res.status(500).json(errorRes);
    }
}

export async function deleteServiceHandler(req: Request, res: Response, next: NextFunction): Promise<any> {
    const prisma: PrismaClient = PrismaGlobal.getInstance().prisma;
    /// validate input

    let reqBody = req.body;
    /// validate input
    try {
        assert(reqBody, ServiceGetID);
    } catch (error) {
        console.log("Error trying to get service by ID: ", error);

        let errorRes: HandlerError = {
            message: "Bad Request, couldn't validate data.",
            type: HandlerErrors.ValidationError
        };

        return res.status(403).json(errorRes);
    }

    /// query database for service
    try {
        /// delete service in the database
        let deleteService = prisma.service.delete({
            where: {
                id: reqBody.id
            }
        });

        const transaction = await prisma.$transaction([deleteService])

        /// return confirmation of deletion
        return res.status(200).json({ message: "Service deleted sucessfully." });
    } catch (error) {
        console.log("Error trying to delete service by ID: ", error);

        let errorRes: HandlerError = {
            message: "Server Error, couldn't find service by id.",
            type: HandlerErrors.DatabaseError
        };

        return res.status(500).json(errorRes);
    }
}