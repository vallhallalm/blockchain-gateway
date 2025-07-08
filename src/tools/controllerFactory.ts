import { Request, RequestHandler } from "express";
import { z, ZodTypeAny, ZodObject } from "zod";

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

function validateSchema<T extends ControllerInput>(schemas: T, req: Request) {
    const validated: any = {};

    // Check for unexpected input
    if (!schemas.body && req.body && Object.keys(req.body).length > 0) {
        throw new Error("Unexpected body input");
    }
    if (!schemas.query && req.query && Object.keys(req.query).length > 0) {
        throw new Error("Unexpected query input");
    }
    if (!schemas.params && req.params && Object.keys(req.params).length > 0) {
        throw new Error("Unexpected route params input");
    }

    if (schemas.body) {
        validated.body = schemas.body.parse(req.body);
    } else {
        validated.body = undefined;
    }

    if (schemas.query) {
        validated.query = schemas.query.parse(req.query);
    } else {
        validated.query = undefined;
    }

    if (schemas.params) {
        validated.params = schemas.params.parse(req.params);
    } else {
        validated.params = undefined;
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
        } catch (err) {
            next(err);
        }
    };
}
