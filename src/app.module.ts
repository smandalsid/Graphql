import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Event } from './events/event.entity';
import { EventsModule } from './events/events.module';
import { AppJapanService } from './app.japan.service';
import { AppDummy } from './app.dummy';
import { ConfigModule } from '@nestjs/config';
import ormConfig from './config/orm.config';
import ormConfigProd from './config/orm.config.prod';
import { SchoolModule } from './school/school.module';
import { AuthModule } from './auth/auth.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			load: [ormConfig],
			expandVariables: true,
			envFilePath: `${process.env.NODE_ENV}.env`
		}),
		TypeOrmModule.forRootAsync({
			useFactory: process.env.NODE_ENV !== 'production' ? ormConfig : ormConfigProd
	}),
	GraphQLModule.forRoot<ApolloDriverConfig>({
		driver: ApolloDriver,
		autoSchemaFile: true,
		debug: true,
		playground: true,
		
	}),
	EventsModule,
	SchoolModule,
	AuthModule
],
	controllers: [AppController],
	providers: [{
		provide: AppService,
		useClass: AppJapanService
	}, {
		provide: 'APP_NAME',
		useValue: 'Nest Events Backend'
	}, {
		provide: 'MESSAGE',
		inject: [AppDummy],
		useFactory: (app) => app.dummy()
	}, AppDummy],
})
export class AppModule { }