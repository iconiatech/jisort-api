import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { AtStrategy, RtStrategy } from './strategies';

import { User, UserSchema } from './users.schema';

import { AuthController } from './auth.controller';
import { UsersController } from './users.controller';

@Module({
  exports: [UsersService],
  controllers: [UsersController, AuthController],
  providers: [UsersService, AuthService, AtStrategy, RtStrategy],
  imports: [
    JwtModule.register({}),
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
  ],
})
export class UsersModule {}
