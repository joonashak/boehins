import { Injectable, Logger, OnApplicationBootstrap } from "@nestjs/common";
import { UserService } from "src/user/user.service";
import mockUsers from "./data/mockUsers";

@Injectable()
export class DevToolsService implements OnApplicationBootstrap {
  private readonly logger = new Logger(DevToolsService.name);

  constructor(private userService: UserService) {}

  async onApplicationBootstrap(): Promise<void> {
    this.logger.warn("DEVTOOLS ARE ACTIVE");
    await this.upsertMockUsers();
  }

  async upsertMockUsers(): Promise<void> {
    const users = await this.userService.findAll();
    const userNames = users.map((user) => user.username);
    let nCreatedUsers = 0;

    for (const user of mockUsers) {
      if (userNames.includes(user.username)) {
        continue;
      }

      await this.userService.create(user);
      nCreatedUsers++;
    }

    this.logger.log(
      `Inserted ${nCreatedUsers} mock user${nCreatedUsers === 1 ? "" : "s"}.`,
    );
  }
}
