import { Prisma, PrismaClient } from "@prisma/client";
import { Request, Response, NextFunction } from "express";
import { assert, object, string, array, optional, number } from 'superstruct'
import { HandlerError, HandlerErrors } from "../HandlerError/handler-error";
import PrismaGlobal from "../prisma";
import { v4 as uuidv4 } from 'uuid';

export enum WorkOrderStatusList {
    APROVACAO = 1,
    ANDAMENTO = 2,
    FINALIZADO = 3,
}

/// model for getting all workOrders
const WorkOrdersGet = object({
    clientID: optional(string()),
    take: optional(number()),
    page: optional(number()),
});

/// model for workOrder get by id
const WorkOrderGetID = object({
    id: string(),
});

const ServiceModel = object({
    id: number()
});

const TaskModel = object({
    deviceID: number(),
    services: array(ServiceModel)
});

/// create model
const WorkOrderInsertModel = object({
    idClient: string(),
    obs: string(),
    tasks: array(TaskModel)
});

/// WorkOrder model for patching
const WorkOrderPatchingModel = object({
    id: string(),
    idClient: string(),
    obs: string(),
    tasks: array(TaskModel),
    workOrderStatus: object({
        id: number(),
    })
});

export async function getWorkOrdersHandler(req: Request, res: Response, next: NextFunction): Promise<any> {
    const prisma: PrismaClient = PrismaGlobal.getInstance().prisma;

    let reqBody = req.body;
    /// validate input
    try {
        assert(reqBody, WorkOrdersGet);
    } catch (error) {
        console.log("Error trying to get workOrders: ", error);

        let errorRes: HandlerError = {
            message: "Bad Request, couldn't validate data.",
            type: HandlerErrors.ValidationError
        };

        return res.status(403).json(errorRes);
    }

    /// getting records
    try {
        let workOrders = await prisma.workOrder.findMany({
            where: {
                ...(reqBody.clientID && {
                    id_Client: reqBody.clientID
                }),
            },
            ...(reqBody.take && {
                take: reqBody.take,
            }),
            ...(reqBody.page && reqBody.take && {
                skip: reqBody.take * reqBody.page,
            })
        });

        return res.status(200).json(workOrders)
    } catch (error) {
        console.log("Error trying to get workOrders: ", error);

        let errorRes: HandlerError = {
            message: "Bad Request, couldn't validate data.",
            type: HandlerErrors.ValidationError
        };

        return res.status(403).json(errorRes);
    }
}

export async function getWorkOrdersByIDHandler(req: Request, res: Response, next: NextFunction): Promise<any> {
    const prisma: PrismaClient = PrismaGlobal.getInstance().prisma;

    let reqBody = req.body;
    /// validate input
    try {
        assert(reqBody, WorkOrderGetID);
    } catch (error) {
        console.log("Error trying to get workOrder by ID: ", error);

        let errorRes: HandlerError = {
            message: "Bad Request, couldn't validate data.",
            type: HandlerErrors.ValidationError
        };

        return res.status(403).json(errorRes);
    }

    /// query database for workOrder
    try {
        /// return workOrder
        let queriedWorkOrder = await prisma.workOrder.findUnique({
            where: {
                id: reqBody.id
            },
            include: {
                Client: true,
                Task: true,
                WorkOrderStatus: true,
            }
        });

        /// if workOrder was retrieved
        if (!queriedWorkOrder) {
            let errorRes: HandlerError = {
                message: `Bad Request, couldn't find workOrder with id ${reqBody.id}.`,
                type: HandlerErrors.NotFound
            };

            return res.status(404).json(errorRes)
        }

        return res.status(200).json(queriedWorkOrder);
    } catch (error) {
        console.log("Error trying to find workOrder by ID: ", error);

        let errorRes: HandlerError = {
            message: "Server Error, couldn't find workOrder by id.",
            type: HandlerErrors.DatabaseError
        };

        return res.status(500).json(errorRes);
    }
}

export async function postWorkOrderHandler(req: Request, res: Response, next: NextFunction): Promise<any> {
    const prisma: PrismaClient = PrismaGlobal.getInstance().prisma;

    /// assert the input is valid
    let postedWorkOrder = req.body;
    try {
        assert(postedWorkOrder, WorkOrderInsertModel);
    } catch (error) {
        console.log("Error trying to insert new workOrder: ", error);

        let errorRes: HandlerError = {
            message: "Bad Request, couldn't validate data.",
            type: HandlerErrors.ValidationError
        };

        return res.status(403).json(errorRes);
    }

    try {
        /// workOrder data to be inserted into the database
        let workOrderData: Prisma.WorkOrderCreateInput = {
            id: uuidv4(),
            obs: postedWorkOrder.obs,
            Client: {
                connect: {
                    id: postedWorkOrder.idClient,
                }
            },
            WorkOrderStatus: {
                connect: {
                    id: WorkOrderStatusList.APROVACAO
                }
            }
        };

        /// insert workOrder in the database
        const workOrder = await prisma.workOrder.create({
            data: workOrderData
        });

        for (let postedTask of postedWorkOrder.tasks) {
            /// task data to be inserted into the database
            let taskData: Prisma.TaskCreateInput = {
                WorkOrder: {
                    connect: {
                        id: workOrder.id,
                    }
                },
                device: {
                    connect: {
                        id: postedTask.deviceID,
                    }
                },
            };

            /// insert task in the database
            const task = await prisma.task.create({
                data: taskData,
            });

            for (let postedService of postedTask.services) {
                /// taskService data to be inserted into the database
                let taskServiceData: Prisma.Task_ServiceCreateInput = {
                    Service: {
                        connect: {
                            id: postedService.id,
                        }
                    },
                    Task: {
                        connect: {
                            id: task.id,
                        }
                    }
                };

                /// insert taskService in the database
                const taskServices = await prisma.task_Service.create({
                    data: taskServiceData,
                });
            }
        }

        /// return newly added workOrder identifier
        return res.status(200).json({ id: workOrder.id });

    } catch (error) {
        console.log("Error trying to insert new workOrder: ", error);

        let errorRes: HandlerError = {
            message: "Server Error, couldn't insert data into the database.",
            type: HandlerErrors.DatabaseError
        };

        return res.status(500).json(errorRes);
    }
}

export async function patchWorkOrderHandler(req: Request, res: Response, next: NextFunction): Promise<any> {
    /// validate input
    const prisma: PrismaClient = PrismaGlobal.getInstance().prisma;

    let reqBody = req.body;
    /// validate input
    try {
        assert(reqBody, WorkOrderPatchingModel);
    } catch (error) {
        console.log("Error trying to get workOrder by ID: ", error);

        let errorRes: HandlerError = {
            message: "Bad Request, couldn't validate data.",
            type: HandlerErrors.ValidationError
        };

        return res.status(403).json(errorRes);
    }

    /// query database for workOrder
    try {
        let { id, ...workOrderUpdates } = reqBody;
        let transactions = []
        let workOrderData = {

        };

        /// update workOrder in the database
        let workOrderUpdate = prisma.workOrder.update({
            where: {
                id: reqBody.id
            },
            data: workOrderData
        });
        transactions.push(workOrderUpdate);

        const transaction = await prisma.$transaction(transactions);

        /// if workOrder was retrieved
        if (!transaction) {
            let errorRes: HandlerError = {
                message: `Bad Request, couldn't find workOrder with id ${reqBody.id}.`,
                type: HandlerErrors.NotFound
            };

            return res.status(404).json(errorRes)
        }

        /// return updated workOrder identifier
        return res.status(200).json({ transaction });
    } catch (error) {
        console.log("Error trying to find workOrder by ID: ", error);

        let errorRes: HandlerError = {
            message: "Server Error, couldn't find workOrder by id.",
            type: HandlerErrors.DatabaseError
        };

        return res.status(500).json(errorRes);
    }
}

export async function deleteWorkOrderHandler(req: Request, res: Response, next: NextFunction): Promise<any> {
    const prisma: PrismaClient = PrismaGlobal.getInstance().prisma;
    /// validate input

    let reqBody = req.body;
    /// validate input
    try {
        assert(reqBody, WorkOrderGetID);
    } catch (error) {
        console.log("Error trying to get workOrder by ID: ", error);

        let errorRes: HandlerError = {
            message: "Bad Request, couldn't validate data.",
            type: HandlerErrors.ValidationError
        };

        return res.status(403).json(errorRes);
    }

    /// query database for workOrder
    try {
        /// delete workOrder in the database
        let deleteWorkOrder = prisma.workOrder.delete({
            where: {
                id: reqBody.id,
            },
            include: {
                Task: {
                    include: {
                        Task_Service: true
                    }
                }
            }
        });

        const transaction = await prisma.$transaction([deleteWorkOrder])

        /// return confirmation of deletion
        return res.status(200).json({ message: "WorkOrder deleted sucessfully." });
    } catch (error) {
        console.log("Error trying to delete workOrder by ID: ", error);

        let errorRes: HandlerError = {
            message: "Server Error, couldn't find workOrder by id.",
            type: HandlerErrors.DatabaseError
        };

        return res.status(500).json(errorRes);
    }
}

