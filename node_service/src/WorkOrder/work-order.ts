import { Prisma, PrismaClient } from "@prisma/client";
import { Request, Response, NextFunction } from "express";
import { assert, object, string, array, optional, number } from 'superstruct'
import { HandlerError, HandlerErrors } from "../HandlerError/handler-error";
import PrismaGlobal from "../prisma";
import { v4 as uuidv4 } from 'uuid';
import lodash from "lodash";

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

/// model for getting workoders of an interval
const WorkOrdersGetInterval = object({
    startDate: number(),
    endDate: number(),
    clientID: optional(string()),
    take: optional(number()),
    page: optional(number()),
});


/// model for workOrder get by id
const WorkOrderGetID = object({
    id: string(),
});

const ServiceInsertModel = object({
    id: number(),
});

const TaskInsertModel = object({
    deviceID: number(),
    description: optional(string()),
    services: array(ServiceInsertModel),
});

/// create model
const WorkOrderInsertModel = object({
    idClient: string(),
    obs: optional(string()),
    tasks: optional(array(TaskInsertModel)),
});

// const ServicePatchingModel = object({
//     id: number(),
// });

const TaskPatchingModel = object({
    id: number(),
    description: optional(string()),
    deviceID: optional(number()),
    // services: optional(array(ServicePatchingModel)),
});

/// WorkOrder model for patching
const WorkOrderPatchingModel = object({
    id: string(),
    idClient: optional(string()),
    obs: optional(string()),
    tasks: optional(array(TaskPatchingModel)),
    workOrderStatus: optional(object({
        id: number(),
    }))
});

/// WorkOrder model to get report by period
const WorkOrdersReportModel = object({
    startDate: number(),
    endDate: number(),
    clientID: optional(string()),
    take: optional(number()),
    page: optional(number()),
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
                skip: (reqBody.page - 1) * reqBody.take,
            }),
            select: {
                id: true,
                obs: true,
                Client: {
                    select: {
                        id: true,
                        name: true,
                    }
                },
                Task: {
                    select: {
                        id: true
                    }
                },
                WorkOrderStatus: {
                    select: {
                        description: true,
                    }
                },
            }
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
            select: {
                id: true,
                obs: true,
                Client: {
                    select: {
                        id: true,
                    }
                },
                Task: {
                    select: {
                        id: true
                    }
                },
                WorkOrderStatus: {
                    select: {
                        description: true,
                    }
                },
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

        if (postedWorkOrder.tasks) {
            for (let postedTask of postedWorkOrder.tasks) {
                /// task data to be inserted into the database
                let taskData: Prisma.TaskCreateInput = {
                    description: postedTask.description,
                    WorkOrder: {
                        connect: {
                            id: workOrder.id,
                        }
                    },
                    Device: {
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
        }

        await calculateWorkOrderTotalCost(workOrder.id);

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

    /// unreachable
}

/// calculate the total cost of a workOrder
async function calculateWorkOrderTotalCost(workOrderID: string): Promise<any> {
    const prisma: PrismaClient = PrismaGlobal.getInstance().prisma;

    /// get all tasks of the workOrder
    let tasks = await prisma.task.findMany({
        where: {
            WorkOrder: {
                id: workOrderID
            }
        },
        select: {
            id: true,
            description: true,
            Task_Service: {
                select: {
                    id: true,
                    Service: {
                        select: {
                            id: true,
                            estimatedMaterialCost: true,
                            estimatedTimeCost: true,
                        }
                    }
                }
            }
        }
    });

    /// calculate the total cost of the workOrder
    let totalCost = 0;
    for (let task of tasks) {
        for (let taskService of task.Task_Service) {
            totalCost += Number(taskService.Service.estimatedMaterialCost) + Number(taskService.Service.estimatedTimeCost) * 14.5;
        }
    }

    /// update the total cost of the workOrder
    await prisma.workOrder.update({
        where: {
            id: workOrderID
        },
        data: {
            totalCost: totalCost
        }
    });
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
            /// update observation if one was passed
            ...(workOrderUpdates.obs && {
                obs: workOrderUpdates.obs,
            }),
            /// update status if one was passed
            ...(workOrderUpdates.workOrderStatus && {
                WorkOrderStatus: {
                    connect: {
                        id: workOrderUpdates.workOrderStatus.id
                    }
                }
            }),
        };

        /// if tasks were passed
        if (workOrderUpdates.tasks) {
            /// for each task
            for (let task of workOrderUpdates.tasks) {
                /// update the current task
                let taskUpdate = prisma.task.update({
                    where: {
                        id: task.id,
                    },
                    data: {
                        ...(task.deviceID && {
                            device: {
                                connect: {
                                    id: task.deviceID,
                                }
                            }
                        }),
                        ...(task.description && {
                            description: task.description,
                        }),
                    }
                });

                transactions.push(taskUpdate);
            }
        }

        /// update workOrder in the database
        let workOrderUpdate = prisma.workOrder.update({
            where: {
                id
            },
            data: {
                ...workOrderData,
            },
        });
        transactions.push(workOrderUpdate);

        const transaction = await prisma.$transaction(transactions);

        /// if workOrder was retrieved
        if (!transaction[0]) {
            let errorRes: HandlerError = {
                message: `Bad Request, couldn't find workOrder with id ${reqBody.id}.`,
                type: HandlerErrors.NotFound
            };

            return res.status(404).json(errorRes)
        }

        /// return updated workOrder identifier
        return res.status(200).json({ id });
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
        /// delete workOrderTasks in the database
        let deleteWorkOrderTask_Services = prisma.task_Service.deleteMany({
            where: {
                Task: {
                    WorkOrder: {
                        id: reqBody.id,
                    }
                }
            }
        });

        /// delete workOrderTasks in the database
        let deleteWorkOrderTasks = prisma.task.deleteMany({
            where: {
                WorkOrder: {
                    id: reqBody.id,
                }
            }
        });

        /// delete workOrder in the database
        let deleteWorkOrder = prisma.workOrder.delete({
            where: {
                id: reqBody.id,
            }
        });

        const transaction = await prisma.$transaction([deleteWorkOrderTask_Services, deleteWorkOrderTasks, deleteWorkOrder])

        /// if workOrder was retrieved
        if (!transaction[1]) {
            let errorRes: HandlerError = {
                message: `Bad Request, couldn't find workOrder with id ${reqBody.id}.`,
                type: HandlerErrors.NotFound
            };

            return res.status(404).json(errorRes)
        }

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

/// get all workOrders of today
export async function getWorkWordersOfToday(req: Request, res: Response, next: NextFunction) {
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

    let { clientID, take, page } = reqBody;

    /// get all workOrders from today
    try {
        /// fetch from the database the workOrders
        const workOrders = await prisma.workOrder.findMany({
            where: {
                ...(clientID ? { idClient: clientID } : {}),
                createdAt: {
                    gte: new Date(new Date().setHours(0, 0, 0, 0)),
                    lte: new Date(new Date().setHours(23, 59, 59, 999)),
                },
            },
            take,
            ...(page && take ? { skip: (page - 1) * take } : {}),
            orderBy: {
                createdAt: "desc",
            },
        });

        return res.json({
            count: workOrders.length,
            ...workOrders,
        });
    } catch (error) {
        console.log("Error trying to get workOrders: ", error);

        let errorRes: HandlerError = {
            message: "Bad Request, couldn't validate data.",
            type: HandlerErrors.ValidationError
        };

        return res.status(403).json(errorRes);
    }
}

/// get all workOrders by Interval
export async function getWorkWordersByInterval(req: Request, res: Response, next: NextFunction) {
    const prisma: PrismaClient = PrismaGlobal.getInstance().prisma;

    let reqBody = req.body;
    /// validate input
    try {
        assert(reqBody, WorkOrdersGetInterval);
    } catch (error) {
        console.log("Error trying to get workOrders: ", error);

        let errorRes: HandlerError = {
            message: "Bad Request, couldn't validate data.",
            type: HandlerErrors.ValidationError
        };

        return res.status(403).json(errorRes);
    }

    let { clientID, startDate, endDate, take, page } = reqBody;

    /// get all workOrders from interval
    try {
        /// fetch from the database the workOrders inside the given interval
        const workOrders = await prisma.workOrder.findMany({
            where: {
                ...(clientID ? { idClient: clientID } : {}),
                createdAt: {
                    gte: new Date(startDate),
                    lte: new Date(endDate),
                },
            },
            take,
            ...(page && take ? { skip: (page - 1) * take } : {}),
            orderBy: {
                createdAt: "desc",
            },
        });

        let dayGroupedWorkOrders = lodash.groupBy(workOrders, (workOrder) => {
            return new Date(workOrder.createdAt || 0).toLocaleDateString();
        });

        let workOrdersByDay = Object.keys(dayGroupedWorkOrders).map((key) => {
            return {
                day: key,
                workOrders: dayGroupedWorkOrders[key],
                count: dayGroupedWorkOrders[key].length,
            };
        });

        return res.json(workOrdersByDay);
    } catch (error) {
        console.log("Error trying to get workOrders: ", error);

        let errorRes: HandlerError = {
            message: "Bad Request, couldn't validate data.",
            type: HandlerErrors.ValidationError
        };

        return res.status(500).json(errorRes);
    }
}

/// get workOrders report from interval
export async function getWorkOrdersReportHandler(req: Request, res: Response, next: NextFunction) {
    const prisma: PrismaClient = PrismaGlobal.getInstance().prisma;

    let reqBody = req.body;
    /// validate input
    try {
        assert(reqBody, WorkOrdersReportModel);
    } catch (error) {
        console.log("Error trying to get workOrders report: ", error);

        let errorRes: HandlerError = {
            message: "Bad Request, couldn't validate data.",
            type: HandlerErrors.ValidationError
        };

        return res.status(403).json(errorRes);
    }

    /// explode 
    let { clientID, startDate, endDate } = reqBody;

    /// get workOrders report from interval
    try {
        /// fetch from the database the workOrders inside the given interval
        const workOrders = await prisma.workOrder.findMany({
            where: {
                ...(clientID ? { idClient: clientID } : {}),
                createdAt: {
                    gte: new Date(startDate),
                    lte: new Date(endDate),
                },
            },
            orderBy: {
                createdAt: "desc",
            },
            include: {
                Task: true
            }
        });

        let workOrdersRevenue = workOrders.reduce((acc, workOrder) => {
            return acc + Number(workOrder.totalCost)
        }, 0);

        /// set the workOrder report
        return res.json({
            count: workOrders.length,
            revenue: workOrdersRevenue,
            average_revenue: workOrdersRevenue / workOrders.length,
            average_attendances: workOrders.length / (startDate - startDate) / (1000 * 60 * 60 * 24),
            average_time_to_complete: workOrders
                .filter(workOrder => workOrder.finishedAt)
                .reduce((acc, workOrder) => {
                    /// calculate time to complete a workOrder
                    let timeToComplete = (new Date(workOrder.finishedAt || 0).getTime() - new Date(workOrder.createdAt).getTime()) / (1000 * 60 * 60 * 24);
                    return acc + timeToComplete;
                }, 0) / workOrders.length,
        });
    } catch (error) {
        console.log("Error trying to get workOrders revenue: ", error);

        let errorRes: HandlerError = {
            message: "Bad Request, couldn't validate data.",
            type: HandlerErrors.ValidationError
        };

        return res.status(500).json(errorRes);
    }
}
