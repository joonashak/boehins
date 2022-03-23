import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";
import { JwtService } from "@nestjs/jwt";
import { AuthenticationError } from "apollo-server-express";
import { JwtPayload } from "../auth.service";
import { Session } from "../session/session.model";
import { SessionService } from "../session/session.service";

@Injectable()
export class TokenAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private sessionService: SessionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const gqlContext = GqlExecutionContext.create(context);
    const request = gqlContext.getContext().req;
    const accessToken = request.accesstoken || null;

    if (!accessToken) {
      throw new AuthenticationError("Access token was not provided.");
    }

    const { sessionId } = this.verifyToken(accessToken);
    const { user } = await this.verifySession(sessionId);

    if (!user) {
      throw new AuthenticationError("Unknown authentication error.");
    }

    request.user = user;
    return true;
  }

  /**
   * Verify that `token` is a valid JWT token.
   * @param token JWT token.
   * @returns Decoded JWT payload object.
   */
  private verifyToken(token: string): JwtPayload {
    let payload: JwtPayload;

    try {
      payload = this.jwtService.verify(token);
    } catch {
      throw new AuthenticationError("Access token is invalid.");
    }

    if (!Object.keys(payload).includes("sessionId")) {
      throw new AuthenticationError(
        "Access token does not contain a session ID.",
      );
    }

    return payload;
  }

  /**
   * Verify that there is a `Session` associated with given `sessionId` and it has not expired.
   * @param sessionId ID of the session to verify.
   * @returns Session object.
   */
  private async verifySession(sessionId: string): Promise<Session> {
    const session = await this.sessionService.findOneById(sessionId);

    if (!session) {
      throw new AuthenticationError("Session was not found.");
    }

    if (session.expiresAt < new Date()) {
      throw new AuthenticationError("Session has expired.");
    }

    return session;
  }
}
