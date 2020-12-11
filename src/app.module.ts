import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
	ScheduleModule.forRoot(),
	ConfigModule.forRoot({
	  envFilePath: '.env',
	  isGlobal: true,
	  cache: true,
	})
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
