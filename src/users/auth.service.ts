import * as bcrypt from 'bcrypt';
import {
  Injectable,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';

import { ComparePasswords, Tokens } from './types';
import { CreateUserDto, SignInUserDto } from './dtos';

import { UsersService } from './users.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  async hashPassword(password: string) {
    return await bcrypt.hash(password, 10);
  }

  async getTokens(email: string): Promise<Tokens> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: email,
        },
        {
          secret: 'at-secret', // needs to be changed to a compex secret key in prod (.env)
          expiresIn: 60 * 15,
        },
      ),
      this.jwtService.signAsync(
        {
          sub: email,
        },
        {
          secret: 'rt-secret', // needs to be changed to a compex secret key in prod (.env)
          expiresIn: 60 * 60 * 24 * 7,
        },
      ),
    ]);

    return { accessToken, refreshToken };
  }

  async verifyPassword(data: ComparePasswords) {
    const { plainPassword, hashedPassword } = data;

    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  async signupLocal(createUserDto: CreateUserDto): Promise<Tokens> {
    const user = await this.usersService.findByEmail(createUserDto.email);

    if (user) throw new ConflictException('Email already in use');

    const hashedPassword = await this.hashPassword(createUserDto.password);
    createUserDto.password = hashedPassword;

    const newUser = await this.usersService.signupLocal(createUserDto);

    return await this.getTokens(newUser.email);
  }

  async signinLocal(authUser: SignInUserDto): Promise<Tokens> {
    const user = await this.usersService.findByEmail(authUser.email);

    if (!user) throw new ForbiddenException('Incorrect login credentials!');

    const passwordMatches = await this.verifyPassword({
      plainPassword: authUser.password,
      hashedPassword: user.password,
    });

    if (!passwordMatches)
      throw new ForbiddenException('Incorrect login credentials!');

    return await this.getTokens(user.email);
  }

  async refreshToken() {
    return;
  }

  async whoami(email: string) {
    return this.usersService.findByEmail(email);
  }

  async logOut(email: string) {
    console.log(email);
    return;
  }
}
