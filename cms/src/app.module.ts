import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { DATABASE_URL } from "./config";

@Module({
  imports: [MongooseModule.forRoot(DATABASE_URL)],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
