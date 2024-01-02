import Fastify, { FastifyReply, FastifyRequest } from "fastify";
import fJwt from "@fastify/jwt";
import userRoutes from "./modules/user/user.route";
import fastifySwaggerUi from "@fastify/swagger-ui";
import fastifySwagger from "@fastify/swagger";
import { withRefResolver } from "fastify-zod";
import { userSchema } from "./modules/user/user.schema";
import { productSchemas } from "./modules/product/product.schema";
import ProductRoutes from "./modules/product/product.route";
import {version} from '../package.json'


export const server = Fastify()

declare module "fastify" {
    export interface FastifyInstance {
        authenticate: any
    }
}

declare module "@fastify/jwt" {
    interface FastifyJWT {
        user: {
            id: number;
            email: string;
            name: string;
        }
    }
}

server.register(fJwt, {
    secret: "dsjfhjgvajgddjhdgfriuewhksalshjfldfhkhfjkdnfkj"
})

server.decorate("authenticate", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        await request.jwtVerify();
    } catch (e) {
        return reply.send(e)
    }
})

server.get('/healthcheck', async function (request, response) {
    return {status: "OK"}
})

const swaggerOptions = {
  swagger: {
    info: {
      title: "My Title",
      description: "My Description.",
      version: "1.0.0",
    },
    host: "localhost",
    schemes: ["http", "https"],
    consumes: ["application/json"],
    produces: ["application/json"],
    tags: [{ name: "Default", description: "Default" }],
  },
};

const swaggerUiOptions = {
  routePrefix: "/docs",
  exposeRoute: true,
};



async function main() {

    for (const schema of [...userSchema, ...productSchemas]) {
        server.addSchema(schema)
    }

    server.register(fastifySwagger, swaggerOptions);
    server.register(fastifySwaggerUi, swaggerUiOptions);

    server.register(userRoutes, { prefix: "api/users" });
    server.register(ProductRoutes, {prefix: "api/products"})

    try {
        await server.listen({port:3000})
        console.log(`Server started at https://localhost:3000`)
    } catch (e) {
        console.error(e)
        process.exit(1)
    }
}

main()