import { PrismaClient } from '@prisma/client'

class PrismaGlobal {
    private readonly _prisma: PrismaClient;
    private static _instance: PrismaGlobal;

    private constructor() {
        this._prisma = new PrismaClient({
            log: ['query'],
        });
    }

    static getInstance() {
        if (this._instance) {
            return this._instance;
        }

        this._instance = new PrismaGlobal();
        return this._instance;
    }

    public get prisma() {
        return this._prisma;
    }
}


export default PrismaGlobal