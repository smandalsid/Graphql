import { AuthGuard } from "@nestjs/passport";

export class AuthGaurdJwt extends AuthGuard('jwt') {
    
}