import { AuthGuard } from "@nestjs/passport";

export class AuthGaurdLocal extends AuthGuard('local') {
    
}