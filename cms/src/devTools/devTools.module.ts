import { Module, ModuleMetadata } from "@nestjs/common";
import { DEV_TOOLS_ENABLED } from "../config";
import { UserModule } from "../user/user.module";
import { UserService } from "../user/user.service";
import { DevToolsService } from "./devTools.service";

const options: ModuleMetadata = {
  imports: [UserModule],
  providers: [UserService, DevToolsService],
};
@Module(DEV_TOOLS_ENABLED ? options : {})
export class DevToolsModule {}
