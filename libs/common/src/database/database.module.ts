import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            useFactory: (configService: ConfigService) => {
                return ({
                    type: 'postgres',
                    host: configService.getOrThrow('DATABASE_HOST'),
                    port: configService.getOrThrow('DATABASE_PORT'),
                    database: configService.getOrThrow('DATABASE_NAME'),
                    username: configService.getOrThrow('DATABASE_USERNAME'),
                    password: configService.getOrThrow('DATABASE_PASSWORD'),
                    autoLoadEntities: true,
                    synchronize: configService.getOrThrow('DATABASE_SYNCHRONIZE'),
                })
            },
            inject: [ConfigService],
        }),
    ],
})
export class DatabaseModule {
    static forFeature(entities: EntityClassOrSchema[]) {
        return TypeOrmModule.forFeature(entities);
    }
}
