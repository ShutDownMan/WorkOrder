import { Prisma, PrismaClient } from "@prisma/client";
import { Request, Response, NextFunction } from "express";
import { assert, object, string, array, optional, number } from 'superstruct'
import { HandlerError, HandlerErrors } from "../HandlerError/handler-error";
import PrismaGlobal from "../prisma";

/// model for getting all tasks
const TasksGet = object({
    take: optional(number()),
    page: optional(number()),
    workOrderID: optional(string()),
    deviceID: optional(string()),
});

/// model for task get by id
const TaskGetID = object({
    id: number(),
});

/// create model
const ServiceInsertModel = object({
    id: number(),
});

const TaskInsertModel = object({
    workOrderID: string(),
    deviceID: number(),
    description: optional(string()),
    timeCost: optional(number()),
    materialCost: optional(number()),
    services: optional(array(ServiceInsertModel)),
});

/// Task model for patching
const ServicePatchingModel = object({
    id: number(),
});

const TaskPatchingModel = object({
    id: number(),
    workOrderID: optional(string()),
    deviceID: optional(number()),
    description: optional(string()),
    timeCost: optional(number()),
    materialCost: optional(number()),
    services: optional(array(ServicePatchingModel)),
});

export async function getTasksHandler(req: Request, res: Response, next: NextFunction): Promise<any> {
    const prisma: PrismaClient = PrismaGlobal.getInstance().prisma;

    let reqBody = req.body;
    /// validate input
    try {
        assert(reqBody, TasksGet);
    } catch (error) {
        console.log("Error trying to get tasks: ", error);

        let errorRes: HandlerError = {
            message: "Bad Request, couldn't validate data.",
            type: HandlerErrors.ValidationError
        };

        return res.status(403).json(errorRes);
    }

    /// getting records
    try {
        let tasks = await prisma.task.findMany({
            ...(reqBody.take && {
                take: reqBody.take,
            }),
            ...(reqBody.page && reqBody.take && {
                skip: reqBody.take * reqBody.page,
            })
        });

        return res.status(200).json(tasks)
    } catch (error) {
        console.log("Error trying to get tasks: ", error);

        let errorRes: HandlerError = {
            message: "Bad Request, couldn't validate data.",
            type: HandlerErrors.ValidationError
        };

        return res.status(403).json(errorRes);
    }
}

export async function getTaskByIDHandler(req: Request, res: Response, next: NextFunction): Promise<any> {
    const prisma: PrismaClient = PrismaGlobal.getInstance().prisma;

    let reqBody = req.body;
    /// validate input
    try {
        assert(reqBody, TaskGetID);
    } catch (error) {
        console.log("Error trying to get task by ID: ", error);

        let errorRes: HandlerError = {
            message: "Bad Request, couldn't validate data.",
            type: HandlerErrors.ValidationError
        };

        return res.status(403).json(errorRes);
    }

    /// query database for task
    try {
        /// return task
        let queriedTask = await prisma.task.findUnique({
            where: {
                id: reqBody.id
            }
        });

        /// if task was retrieved
        if (!queriedTask) {
            let errorRes: HandlerError = {
                message: `Bad Request, couldn't find task with id ${reqBody.id}.`,
                type: HandlerErrors.NotFound
            };

            return res.status(404).json(errorRes)
        }

        return res.status(200).json(queriedTask);
    } catch (error) {
        console.log("Error trying to find task by ID: ", error);

        let errorRes: HandlerError = {
            message: "Server Error, couldn't find task by id.",
            type: HandlerErrors.DatabaseError
        };

        return res.status(500).json(errorRes);
    }
}

export async function postTaskHandler(req: Request, res: Response, next: NextFunction): Promise<any> {
    const prisma: PrismaClient = PrismaGlobal.getInstance().prisma;

    /// assert the input is valid
    let postedTask = req.body;
    try {
        assert(postedTask, TaskInsertModel);
    } catch (error) {
        console.log("Error trying to insert new task: ", error);

        let errorRes: HandlerError = {
            message: "Bad Request, couldn't validate data.",
            type: HandlerErrors.ValidationError
        };

        return res.status(403).json(errorRes);
    }

    /// data to be inserted into the database
    let taskData: Prisma.TaskCreateInput = {
        WorkOrder: {
            connect: {
                id: postedTask.workOrderID,
            }
        },
        Device: {
            connect: {
                id: postedTask.deviceID,
            }
        },
        description: postedTask.description,
        materialCost: postedTask.materialCost,
        timeCost: postedTask.timeCost,
    };

    try {
        /// insert task in the database
        const task = await prisma.task.create({
            data: taskData
        });

        if (postedTask.services) {
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

        /// return newly added task identifier
        return res.status(200).json({ id: task.id });

    } catch (error) {
        console.log("Error trying to insert new task: ", error);

        let errorRes: HandlerError = {
            message: "Server Error, couldn't insert data into the database.",
            type: HandlerErrors.DatabaseError
        };

        return res.status(500).json(errorRes);
    }
}

export async function patchTaskHandler(req: Request, res: Response, next: NextFunction): Promise<any> {
    /// validate input
    const prisma: PrismaClient = PrismaGlobal.getInstance().prisma;

    let reqBody = req.body;
    /// validate input
    try {
        assert(reqBody, TaskPatchingModel);
    } catch (error) {
        console.log("Error trying to get task by ID: ", error);

        let errorRes: HandlerError = {
            message: "Bad Request, couldn't validate data.",
            type: HandlerErrors.ValidationError
        };

        return res.status(403).json(errorRes);
    }

    let { id, ...taskUpdates } = reqBody;
    let transactions = []
    let taskData = {

    };

    /// update task in the database
    let taskUpdate = prisma.task.update({
        where: {
            id
        },
        data: taskData
    });
    transactions.push(taskUpdate);

    /// query database for task
    try {
        const transaction = await prisma.$transaction(transactions);

        /// if task was not retrieved
        if (!transaction[0]) {
            let errorRes: HandlerError = {
                message: `Bad Request, couldn't find task with id ${reqBody.id}.`,
                type: HandlerErrors.NotFound
            };

            return res.status(403).json(errorRes)
        }

        /// return updated task identifier
        return res.status(200).json({ id });
    } catch (error) {
        console.log("Error trying to find task by ID: ", error);

        let errorRes: HandlerError = {
            message: "Server Error, couldn't find task by id.",
            type: HandlerErrors.DatabaseError
        };

        return res.status(500).json(errorRes);
    }
}

export async function deleteTaskHandler(req: Request, res: Response, next: NextFunction): Promise<any> {
    const prisma: PrismaClient = PrismaGlobal.getInstance().prisma;
    /// validate input

    let reqBody = req.body;
    /// validate input
    try {
        assert(reqBody, TaskGetID);
    } catch (error) {
        console.log("Error trying to get task by ID: ", error);

        let errorRes: HandlerError = {
            message: "Bad Request, couldn't validate data.",
            type: HandlerErrors.ValidationError
        };

        return res.status(403).json(errorRes);
    }

    /// query database for task
    try {
        /// delete workOrderTasks in the database
        let deleteTask_Services = prisma.task_Service.deleteMany({
            where: {
                Task: {
                    id: reqBody.id,
                }
            }
        });

        /// delete task in the database
        let deleteTask = prisma.task.delete({
            where: {
                id: reqBody.id
            }
        });

        const transaction = await prisma.$transaction([deleteTask_Services, deleteTask])

        /// return confirmation of deletion
        return res.status(200).json({ message: "Task deleted sucessfully." });
    } catch (error) {
        console.log("Error trying to delete task by ID: ", error);

        let errorRes: HandlerError = {
            message: "Server Error, couldn't find task by id.",
            type: HandlerErrors.DatabaseError
        };

        return res.status(500).json(errorRes);
    }
}
