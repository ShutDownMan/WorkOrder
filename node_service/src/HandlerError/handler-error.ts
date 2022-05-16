
export enum HandlerErrors {
    UnsupportedOperation = 0,
    DatabaseError = 1,
    NotFound = 2,
    ValidationError = 3,
}

export interface HandlerError {
    type: HandlerErrors,
    message: string
}