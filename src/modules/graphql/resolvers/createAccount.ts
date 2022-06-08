
import { hash } from 'bcrypt';
import { FieldResolver } from "nexus";
import nodemailer from 'nodemailer';
import * as Yup from "yup";
import { getRedisClient } from '../../../lib/redis';
import { getTransport } from '../../mail/transport';
import { generateVerificationEmail } from "../../mail/verifyAccount";
import { registrationValidation } from "../../utils/registrationValidation";
const {v4: uuidv4} = require('uuid');

export const createAccount: FieldResolver<
  "Mutation",
  "createAccount"
> = async (_, { credentials }, { prisma } ) => {
  try {
    await registrationValidation.validate(credentials);

    const existingUser = await prisma.user.findFirst({
      where: {
        username: credentials.username,
        OR: {
          email: credentials.email,
        }
      }
    });

    if(existingUser !== null) {
      throw new Error("Email or username already taken!");
    }

    const hashedPass = await hash(credentials.password, 7);
    const key = uuidv4();

    const userObj = {
      username: credentials.username,
      email: credentials.email,
      hashedPass
    }
    await getRedisClient()
      .multi()
      .hmset(key, userObj)
      .expire(key, 60 * 2)
      .exec();

    const transport = await getTransport();
    
    transport.sendMail(generateVerificationEmail(credentials)).then(info => {
      console.log(`Message id: ${info.messageId}`);
      console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    });
    
    return {
      message:
        "Thanks for registering! Check your email to validate your account.",
      error: false,
    };
  } catch (err) {
    const message =
      (err as Yup.ValidationError).message || "Invalid Input";
    return {
      message,
      error: true,
    };
  }
};