import { PrismaClient } from "@prisma/client";
import { Request, Response, NextFunction } from "express";
import { assert, object, string, nullable, optional, size, refine, omit, number } from 'superstruct'
import { HandlerError, HandlerErrors } from "../HandlerError/handler-error";
import PrismaGlobal from "../prisma";
import { Prisma } from '@prisma/client'
import { isEmail } from "../Validations/email";
import { v4 as uuidv4 } from 'uuid';
import { isCPF } from "../Validations/cpf";
import { isCellphoneNumber, splitCellphoneNumber } from "../Validations/cellphone";
import { isTelephoneNumber, splitTelephoneNumber } from "../Validations/telephone";

/// model for getting all clients
const ClientsGet = object({
    take: optional(number()),
    page: optional(number()),
});

/// model for client get by id
const ClientGetID = object({
    id: string(),
});

/// Client model for insertion
const ClientInsertModel = object({
    firstName: string(),
    lastName: string(),
    cellphone: optional(refine(string(), 'cellphone', (v: string) => isCellphoneNumber(v))),
    telephone: optional(refine(string(), 'telephone', (v: string) => isTelephoneNumber(v))),
    email: optional(refine(string(), 'email', (v: string) => isEmail(v))),
    cpf: refine(string(), 'cpf', (v: string) => isCPF(v)),
});

/// Client model for patching
const ClientPatchingModel = object({
    id: string(),
    firstName: optional(string()),
    lastName: optional(string()),
    cellphone: optional(refine(string(), 'cellphone', (v: string) => isCellphoneNumber(v))),
    telephone: optional(refine(string(), 'telephone', (v: string) => isTelephoneNumber(v))),
    email: optional(refine(string(), 'email', (v: string) => isEmail(v))),
    cpf: optional(refine(string(), 'cpf', (v: string) => isCPF(v))),
});

export async function getClientsHandler(req: Request, res: Response, next: NextFunction): Promise<any> {
    const prisma: PrismaClient = PrismaGlobal.getInstance().prisma;

    let reqBody = req.body;
    /// validate input
    try {
        assert(reqBody, ClientsGet);
    } catch (error) {
        console.log("Error trying to get clients: ", error);

        let errorRes: HandlerError = {
            message: "Bad Request, couldn't validate data.",
            type: HandlerErrors.ValidationError
        };

        return res.status(403).json(errorRes);
    }

    /// getting records
    try {
        let clients = await prisma.client.findMany({
            ...(reqBody.take && {
                take: reqBody.take,
            }),
            ...(reqBody.page && reqBody.take && {
                skip: reqBody.take * reqBody.page,
            }),
            include: {
                Email: true,
                Phone: true
            }
        });

        return res.status(200).json(clients)
    } catch (error) {
        console.log("Error trying to get clients: ", error);

        let errorRes: HandlerError = {
            message: "Bad Request, couldn't validate data.",
            type: HandlerErrors.ValidationError
        };

        return res.status(403).json(errorRes);
    }
}

export async function getClientByIDHandler(req: Request, res: Response, next: NextFunction): Promise<any> {
    const prisma: PrismaClient = PrismaGlobal.getInstance().prisma;

    let reqBody = req.body;
    /// validate input
    try {
        assert(reqBody, ClientGetID);
    } catch (error) {
        console.log("Error trying to get client by ID: ", error);

        let errorRes: HandlerError = {
            message: "Bad Request, couldn't validate data.",
            type: HandlerErrors.ValidationError
        };

        return res.status(403).json(errorRes);
    }

    /// query database for client
    try {
        /// return client
        let queriedClient = await prisma.client.findUnique({
            where: {
                id: reqBody.id
            },
            include: {
                Email: true,
                Phone: true,
            }
        });

        /// if client was retrieved
        if (!queriedClient) {
            let errorRes: HandlerError = {
                message: `Bad Request, couldn't find client with id ${reqBody.id}.`,
                type: HandlerErrors.NotFound
            };

            return res.status(404).json(errorRes)
        }

        return res.status(200).json(queriedClient);
    } catch (error) {
        console.log("Error trying to find client by ID: ", error);

        let errorRes: HandlerError = {
            message: "Server Error, couldn't find client by id.",
            type: HandlerErrors.DatabaseError
        };

        return res.status(500).json(errorRes);
    }
}

export async function postClientHandler(req: Request, res: Response, next: NextFunction): Promise<any> {
    const prisma: PrismaClient = PrismaGlobal.getInstance().prisma;

    /// assert the input is valid
    let postedClient = req.body;
    try {
        assert(postedClient, ClientInsertModel);
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
            /// create uuid
            id: uuidv4(),
            firstName: postedClient.firstName,
            lastName: postedClient.lastName,
            /// name is the combination of first and last names
            name: `${postedClient.firstName} ${postedClient.lastName}`,
            cpf: postedClient.cpf,
            ...(postedClient.email && {
                Email: {
                    create: {
                        address: postedClient.email
                    }
                }
            }),
            ...(postedClient.cellphone && {
                Phone: {
                    create: {
                        ...splitCellphoneNumber(postedClient.cellphone),
                        PhoneType: {
                            connect: {
                                where: {
                                    id: 1
                                }
                            }
                        }
                    }
                }
            }),
            ...(postedClient.telephone && {
                Phone: {
                    create: {
                        ...splitTelephoneNumber(postedClient.telephone),
                        PhoneType: {
                            connect: {
                                id: 2
                            }
                        }
                    }
                }
            }),
        };

        /// insert client in the database
        const client = await prisma.client.create({
            data
        });

        /// return newly added client identifier
        return res.status(200).json({ id: client.id });

    } catch (error) {
        console.log("Error trying to insert new client: ", error);

        let errorRes: HandlerError = {
            message: "Server Error, couldn't insert data into the database.",
            type: HandlerErrors.DatabaseError
        };

        return res.status(500).json(errorRes);
    }
}

export async function patchClientByIDHandler(req: Request, res: Response, next: NextFunction): Promise<any> {
    /// validate input
    const prisma: PrismaClient = PrismaGlobal.getInstance().prisma;

    let reqBody = req.body;
    /// validate input
    try {
        assert(reqBody, ClientPatchingModel);
    } catch (error) {
        console.log("Error trying to get client by ID: ", error);

        let errorRes: HandlerError = {
            message: "Bad Request, couldn't validate data.",
            type: HandlerErrors.ValidationError
        };

        return res.status(403).json(errorRes);
    }

    /// query database for client
    try {
        let { id, ...userUpdates } = reqBody;
        let userData = {
            ...(userUpdates.firstName && {
                firstName: userUpdates.firstName,
            }),
            ...(userUpdates.lastName && {
                lastName: userUpdates.lastName,
            }),
            cpf: userUpdates.cpf,
        };

        let transactions = []

        /// update email if needed
        if (userUpdates.email) {
            let emailDelete = prisma.email.deleteMany({
                where: {
                    id_Client: id
                }
            });
            let emailInsert = prisma.email.create({
                data: {
                    id_Client: id,
                    address: userUpdates.email
                }
            });

            transactions.push(emailDelete, emailInsert);
        }

        /// update cellphone if needed
        if (userUpdates.cellphone) {
            let cellphoneDelete = prisma.phone.deleteMany({
                where: {
                    id_Client: id
                }
            });
            let cellphoneInsert = prisma.phone.create({
                data: {
                    id_Client: id,
                    number: userUpdates.cellphone
                }
            });
            transactions.push(cellphoneDelete, cellphoneInsert);
        }

        /// update telephone if needed
        if (userUpdates.telephone) {
            let telephoneDelete = prisma.phone.deleteMany({
                where: {
                    id_Client: id
                }
            });
            let telephoneInsert = prisma.phone.create({
                data: {
                    id_Client: id,
                    number: userUpdates.telephone
                }
            });
            transactions.push(telephoneDelete, telephoneInsert);
        }

        /// update client in the database
        let clientUpdate = prisma.client.update({
            where: {
                id: reqBody.id
            },
            data: userData
        });
        transactions.push(clientUpdate);

        const transaction = await prisma.$transaction(transactions);

        /// if client was retrieved
        if (!transaction) {
            let errorRes: HandlerError = {
                message: `Bad Request, couldn't find client with id ${reqBody.id}.`,
                type: HandlerErrors.NotFound
            };

            return res.status(404).json(errorRes)
        }

        /// return updated client identifier
        return res.status(200).json({ transaction });
    } catch (error) {
        console.log("Error trying to find client by ID: ", error);

        let errorRes: HandlerError = {
            message: "Server Error, couldn't find client by id.",
            type: HandlerErrors.DatabaseError
        };

        return res.status(500).json(errorRes);
    }
}

export async function deleteClientByIDHandler(req: Request, res: Response, next: NextFunction): Promise<any> {
    const prisma: PrismaClient = PrismaGlobal.getInstance().prisma;
    /// validate input

    let reqBody = req.body;
    /// validate input
    try {
        assert(reqBody, ClientGetID);
    } catch (error) {
        console.log("Error trying to get client by ID: ", error);

        let errorRes: HandlerError = {
            message: "Bad Request, couldn't validate data.",
            type: HandlerErrors.ValidationError
        };

        return res.status(403).json(errorRes);
    }

    /// query database for client
    try {
        /// delete phone
        let deletePhone = prisma.phone.deleteMany({
            where: {
                id_Client: reqBody.id
            }
        });

        /// delete email
        let deleteEmail = prisma.email.deleteMany({
            where: {
                id_Client: reqBody.id
            }
        });

        /// delete client in the database
        let deleteClient = prisma.client.delete({
            where: {
                id: reqBody.id
            }
        });

        const transaction = await prisma.$transaction([deletePhone, deleteEmail, deleteClient])

        /// return confirmation of deletion
        return res.status(200).json({ message: "Client deleted sucessfully." });
    } catch (error) {
        console.log("Error trying to delete client by ID: ", error);

        let errorRes: HandlerError = {
            message: "Server Error, couldn't find client by id.",
            type: HandlerErrors.DatabaseError
        };

        return res.status(500).json(errorRes);
    }
}
