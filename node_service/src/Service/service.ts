import { PrismaClient, Service } from "@prisma/client";
import { Request, Response, NextFunction } from "express";
import { assert, object, string, nullable, size, refine, optional, number } from 'superstruct'
import { HandlerError, HandlerErrors } from "../HandlerError/handler-error";
import PrismaGlobal from "../prisma";
import { faker } from '@faker-js/faker';

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

/// Service model for fetching Top N services by device
const ServiceTopNModel = object({
    take: optional(number()),
    page: optional(number()),
    deviceModel: string(),
    deviceBrand: string(),
});

/// Service model for fetching Top N services by revenue
const ServiceTopNRevenueModel = object({
    startDate: number(),
    endDate: number(),
    take: optional(number()),
    page: optional(number()),
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

/// endpoint to create a new dummy service using faker
export async function postDummyServiceHandler(req: Request, res: Response, next: NextFunction): Promise<any> {
    const prisma: PrismaClient = PrismaGlobal.getInstance().prisma;

    /// create a new dummy service using faker
    let dummyService = {
        description: faker.lorem.sentence(4),
        estimatedTimeCost: faker.datatype.number({ min: 0, max: 100 }),
        estimatedMaterialCost: faker.datatype.number({ min: 0, max: 100 }),
    };

    /// insert service in the database
    try {
        const service = await prisma.service.create({
            data: dummyService
        });

        /// return newly added service identifier
        return res.status(200).json(service);
        
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

export async function getTopNServicesByDeviceHandler(req: Request, res: Response, next: NextFunction): Promise<any> {
    const prisma: PrismaClient = PrismaGlobal.getInstance().prisma;
    /// validate input
    let reqBody = req.body;
    /// validate input
    try {
        assert(reqBody, ServiceTopNModel);
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
        let take = reqBody.take || 5;
        let page = reqBody.page || 1;
        /// get top N services by device
        let topNServices = await prisma.$queryRaw`
            SELECT
                "Task"."id_Device" as device_id,
                "Device"."model" as device_model,
                "Device"."brand" as device_brand,
                COUNT("Task"."id") as service_count,
                "Service"."description" as service_description
            FROM "Task"
            JOIN "Task_Service" ON "Task_Service"."id_Task" = "Task"."id"
            JOIN "Service" ON "Task_Service"."id_Service" = "Service"."id"
            JOIN "Device" ON "Task"."id_Device" = "Device"."id"
            WHERE "Device"."model" = ${reqBody.deviceModel} AND "Device"."brand" = ${reqBody.deviceBrand}
            GROUP BY device_id, device_model, device_brand, service_description
            ORDER BY service_count DESC
            LIMIT ${take}
            OFFSET ${(page - 1) * take}
        `;

        /// return top N services by device
        return res.status(200).json(topNServices);
    } catch (error) {
        console.log("Error trying to get top N services by device: ", error);

        let errorRes: HandlerError = {
            message: "Server Error, couldn't find top N services by device.",
            type: HandlerErrors.DatabaseError
        };

        return res.status(500).json(errorRes);
    }
}

/// get services by revenue
export async function getTopNServicesByRevenueHandler(req: Request, res: Response, next: NextFunction): Promise<any> {
    const prisma: PrismaClient = PrismaGlobal.getInstance().prisma;
    /// validate input
    let reqBody = req.body;
    /// validate input
    try {
        assert(reqBody, ServiceTopNRevenueModel);
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
        let take = reqBody.take || 5;
        let page = reqBody.page || 1;
        /// get top N services by device
        let topNServices = await prisma.$queryRaw`
            SELECT
                "Task"."id_Device" as device_id,
                "Device"."model" as device_model,
                "Device"."brand" as device_brand,
                SUM("Task"."materialCost") as service_revenue,
                "Service"."description" as service_description
            FROM "Task"
            JOIN "Task_Service" ON "Task_Service"."id_Task" = "Task"."id"
            JOIN "Service" ON "Task_Service"."id_Service" = "Service"."id"
            JOIN "Device" ON "Task"."id_Device" = "Device"."id"
            WHERE "Task"."createdAt" >= ${new Date(reqBody.startDate)} AND "Task"."createdAt" <= ${new Date(reqBody.endDate)}
            GROUP BY device_id, device_model, device_brand, service_description
            ORDER BY service_revenue DESC
            LIMIT ${take}
            OFFSET ${(page - 1) * take}
        `;

        /// return top N services by device
        return res.status(200).json(topNServices);
    } catch (error) {
        console.log("Error trying to get top N services by device: ", error);

        let errorRes: HandlerError = {
            message: "Server Error, couldn't find top N services by device.",
            type: HandlerErrors.DatabaseError
        };

        return res.status(500).json(errorRes);
    }
}

/// get random service
export async function getRandomService(): Promise<Service | HandlerError> {
    const prisma: PrismaClient = PrismaGlobal.getInstance().prisma;

    let service;
    try {
        /// get a random service
        service = await prisma.$queryRaw<Service[]>`SELECT * FROM "Service" ORDER BY RANDOM() LIMIT 1`;
    } catch (error) {
        console.log("Error trying to get random service: ", error);

        let errorRes: HandlerError = {
            message: "Server Error, couldn't get random service.",
            type: HandlerErrors.DatabaseError
        };

        return errorRes;
    }

    // try {
    //     /// assert the query was sucessful
    //     assert(service, ServicePatchingModel);
    // } catch (error) {
    //     /// error trying to fetch a random service
    //     console.log("Error trying to fetch a random service: ", error);

    //     let errorRes: HandlerError = {
    //         message: "Server Error, couldn't fetch a random service.",
    //         type: HandlerErrors.DatabaseError
    //     };

    //     return errorRes;
    // }

    /// return the random service
    return service[0];
}