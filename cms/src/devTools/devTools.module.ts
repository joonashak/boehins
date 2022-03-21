import { Module, ModuleMetadata } from "@nestjs/common";
import { DEV_TOOLS_ENABLED } from "src/config";
import { UserModule } from "src/user/user.module";
import { UserService } from "src/user/user.service";

const options: ModuleMetadata = {
  imports: [UserModule],
  providers: [UserService],
};
@Module(DEV_TOOLS_ENABLED ? options : {})
export class DevToolsModule {}
