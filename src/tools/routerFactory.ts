import { RequestHandler, Router } from "express";

interface RouterRouteProps {
    method: "get" | "post" | "put" | "patch" | "delete";
    path: string;
    controller: RequestHandler;
}

export function routerFactory(routes: RouterRouteProps[]) {
    const router = Router();

    for (const route of routes) {
        router[route.method](route.path, route.controller);
    }
    return router;
}
