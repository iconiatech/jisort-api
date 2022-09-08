import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, NotFoundException } from '@nestjs/common';

import { User, UserDocument } from './users.schema';
import { CreateUserDto } from './dtos/create-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  /**
   * Create new user
   *
   * @param createUserDto
   * @returns Promise<User>
   */
  async signupLocal(createUserDto: CreateUserDto): Promise<User> {
    const createdUser = new this.userModel(createUserDto);
    return createdUser.save();
  }

  /**
   * Find a single user with the id if it exists.
   *
   * @param id the id of the menu
   * @returns the user with the provided id or raises a not found error
   */
  async findOne(id: string): Promise<User> {
    let user: User;

    try {
      user = await this.userModel.findById(id);
    } catch (error) {
      throw new NotFoundException('Could not find the user');
    }

    if (!user) {
      throw new NotFoundException('Could not find the user');
    }
    return user;
  }

  /**
   * Find a single user with the email if it exists.
   *
   * @param email the email of the menu
   * @returns the user with the provided email or raises a not found error
   */
  async findByEmail(email: string): Promise<User> {
    let user: User;

    try {
      user = await this.userModel.findOne({ email });
    } catch (error) {}

    return user;
  }

  /**
   * Find a single user with the email if it exists.
   *
   * @param username the username of the menu
   * @returns the user with the provided username or raises a not found error
   */
  async findByUsername(username: string): Promise<User> {
    let user: User;

    try {
      user = await this.userModel.findOne({ username });
    } catch (error) {
      throw new NotFoundException('Could not find the user');
    }

    if (!user) {
      throw new NotFoundException('Could not find the user');
    }
    return user;
  }
}
