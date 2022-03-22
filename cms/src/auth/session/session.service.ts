import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectModel } from "@nestjs/mongoose";
import { hash } from "bcrypt";
import { Model } from "mongoose";
import { Session, SessionDocument } from "./session.model";

@Injectable()
export class SessionService {
  constructor(
    @InjectModel(Session.name) private sessionModel: Model<SessionDocument>,
    private readonly jwtService: JwtService,
  ) {}

  async create(token: string): Promise<Session> {
    const { exp }: any = this.jwtService.decode(token);
    const expiresAt = new Date(exp * 1000);
    const tokenHash = await hash(token, 12);
    return this.sessionModel.create({ tokenHash, expiresAt });
  }
}
