import { Injectable, Logger } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectModel } from "@nestjs/mongoose";
import { Cron } from "@nestjs/schedule";
import { hash } from "bcrypt";
import { Model } from "mongoose";
import { User } from "../../user/user.model";
import { Session, SessionDocument } from "./session.model";

@Injectable()
export class SessionService {
  private readonly logger = new Logger(SessionService.name);

  constructor(
    @InjectModel(Session.name) private sessionModel: Model<SessionDocument>,
    private readonly jwtService: JwtService,
  ) {}

  async create(token: string, user: User): Promise<Session> {
    const { exp }: any = this.jwtService.decode(token);
    const expiresAt = new Date(exp * 1000);
    const tokenHash = await hash(token, 12);
    return this.sessionModel.create({ tokenHash, expiresAt, user });
  }

  @Cron("0 3 * * * *")
  async removeExpiredSessions(): Promise<void> {
    const { deletedCount } = await this.sessionModel.remove({
      expiresAt: { $lte: new Date() },
    });

    if (deletedCount) {
      this.logger.log(
        `Removed ${deletedCount} session${
          deletedCount === 1 ? "" : "s"
        } as expired.`,
      );
    }
  }
}
