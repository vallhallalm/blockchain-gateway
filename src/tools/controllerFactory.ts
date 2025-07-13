import { RequestHandler, Request } from "express";
import { z, ZodTypeAny, ZodObject, ZodError } from "zod";

type ControllerInput = {
    body?: ZodTypeAny;
    query?: ZodTypeAny;
    params?: ZodTypeAny;
};

type InferValidated<T extends ControllerInput> = {
    body: T["body"] extends ZodTypeAny ? z.infer<T["body"]> : undefined;
    query: T["query"] extends ZodTypeAny ? z.infer<T["query"]> : undefined;
    params: T["params"] extends ZodTypeAny ? z.infer<T["params"]> : undefined;
};

class ValidationError extends Error {
    statusCode: number;
    details?: any;

    constructor(message: string, statusCode = 400, details?: any) {
        super(message);
        this.name = "ValidationError";
        this.statusCode = statusCode;
        this.details = details;
    }
}

export function validateSchema<T extends ControllerInput>(schemas: T, req: Request) {
    const validated: any = {};

    // Check for unexpected input
    if (!schemas.body && req.body && Object.keys(req.body).length > 0) {
        throw new ValidationError("Unexpected body input", 400);
    }
    if (!schemas.query && req.query && Object.keys(req.query).length > 0) {
        throw new ValidationError("Unexpected query input", 400);
    }
    if (!schemas.params && req.params && Object.keys(req.params).length > 0) {
        throw new ValidationError("Unexpected route params input", 400);
    }

    try {
        validated.body = schemas.body ? schemas.body.parse(req.body) : undefined;
        validated.query = schemas.query ? schemas.query.parse(req.query) : undefined;
        validated.params = schemas.params ? schemas.params.parse(req.params) : undefined;
    } catch (err) {
        if (err instanceof ZodError) {
            throw new ValidationError("Invalid request schema", 400, err.flatten());
        }
        throw err;
    }

    return validated;
}

export function controllerFactory<T extends ControllerInput>(
    schemas: T,
    controller: (data: InferValidated<T>) => Promise<any>
): RequestHandler {
    return async (req, res, next) => {
        try {
            const validated = validateSchema(schemas, req);
            const result = await controller(validated);
            res.json(result);
        } catch (err: any) {
            console.log(err);
            if (err.name === "ValidationError" && err.statusCode) {
                res.status(err.statusCode).json({
                    message: err.message,
                    errors: err.details,
                });
                next();
            } else if (err.statusCode && err.statusCode >= 400 && err.statusCode < 500) {
                res.status(err.statusCode).json({
                    message: err.message,
                    errors: err.details,
                });
                next();
            } else {
                res.status(500).json({
                    message: "Internal server error",
                    errors: "An unexpected error occurred, if this continues, please contact support.",
                });
                next();
            }

            next(err); // Unhandled error: pass to generic error middleware
        }
    };
}
