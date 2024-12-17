import { ExecutionContext } from "@nestjs/common";
import { AuthGaurdJwt } from "./auth-gaurd.jwt";
import { GqlExecutionContext } from "@nestjs/graphql";

export class AuthGaurdJwtGql extends AuthGaurdJwt {
    getRequest(context: ExecutionContext) {
        const ctx = GqlExecutionContext.create(context);
        return ctx.getContext().req;
    }
}