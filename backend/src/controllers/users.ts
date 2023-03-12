import { RequestHandler } from 'express';
import createHttpError from 'http-errors';
import { UserModel, TokenModel } from '../models';
import bcrypt from "bcrypt";
import mongoose from 'mongoose';
import { assertIsDefined, env, sendEmail } from '../utils';
import { verifyEmail } from '../utils/templates';
import crypto from 'crypto';

export const getAuthenticatedUser: RequestHandler = async (req, res, next) => {

    try {
        const user = await UserModel.findById(req.session.userId).select("+email").exec();
        res.status(200).json(user);
    } catch (error) {
        next(error);
    }
}

interface SignUpBody {
    firstName?: string,
    lastName?: string,
    email?: string,
    password?: string,
}

export const signUp: RequestHandler<unknown, unknown, SignUpBody, unknown> = async (req, res, next) => {

    const {
        firstName,
        lastName,
        email
    } = req.body;

    const passwordRaw = req.body.password;

    try {
        if (!firstName || !lastName || !email || !passwordRaw) {
            throw createHttpError(400, "Parameters missing");
        }

        const existingEmail = await UserModel.findOne({email}).exec();

        if (existingEmail) {
            throw createHttpError(409, "An user with this email already exists");
        }

        const passwordHashed = await bcrypt.hash(passwordRaw, 10);

        const newUser = await UserModel.create({
            firstName,
            lastName,
            email,
            password: passwordHashed
        });

        const newToken = await TokenModel.create({
            userId: newUser._id,
            token: crypto.randomBytes(32).toString("hex"),
        });

        const verificationURL = `${env.BASE_URL}/user/verify/${newUser._id}/${newToken.token}`;

        const message = verifyEmail(verificationURL);

        await sendEmail(email, "Verify your email", message);

        req.session.userId = newUser._id;

        res.status(201).json(newUser);
    } catch (error) {
        next(error);
    }
}

interface LogInBody {
    email?: string;
    password?: string;
}

export const logIn: RequestHandler<unknown, unknown, LogInBody, unknown> = async (req, res, next) => {
    const {
        email,
        password
    } = req.body;

    try {
        if (!email || !password) {
            throw createHttpError(400, "Parameters missing");
        }

        const user = await UserModel.findOne({email}).select("+password +email").exec();

        if (!user) {
            throw createHttpError(401, "Invalid credentials");
        }

        if (!user.verified) {
            throw createHttpError(401, "User not verified");
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            throw createHttpError(401, "Invalid credentials");
        }

        req.session.userId = user._id;

        res.status(201).json(user);
    } catch (error) {
        next(error);
    }
}

export const logOut: RequestHandler = (req, res, next) => {
    req.session.destroy(error => {
        if (error) {
            next(error);
        } else {
            res.sendStatus(200);
        }
    })
}

interface UpdateUserParams {
    userId: string;
}

interface UpdateUserBody {
    firstName?: string;
    lastName?: string;
    password?: string;
    photo?: string;
}

export const updateUser: RequestHandler<UpdateUserParams, unknown, UpdateUserBody, unknown> = async (req, res, next) => {
    const userId = req.params.userId;

    const {
        firstName,
        lastName,
        photo
    } = req.body;

    const passwordRaw = req.body.password;

    const authenticatedUserId = req.session.userId;

    try {
        assertIsDefined(authenticatedUserId);

        if (!mongoose.isValidObjectId(userId)) {
            throw createHttpError(400, "Invalid User Id");
        }

        const user = await UserModel.findById(userId).exec();

        if (!user) {
            throw createHttpError(404, "User not found");
        }

        if (!user._id.equals(authenticatedUserId)) {
            throw createHttpError(401, "You cannot update this user");
        }

        if (firstName) {
            user.firstName = firstName;
        }

        if (lastName) {
            user.lastName = lastName;
        }

        if (passwordRaw) {
            const passwordHashed = await bcrypt.hash(passwordRaw, 10);
            user.password = passwordHashed;
        }

        if (photo) {
            user.photo = photo;
        }

        const updatedUser = await user.save();
        
        res.status(200).json(updatedUser);
    } catch (error) {
        next(error);
    }
}

export const verifyAccount: RequestHandler = async (req, res, next) => {
    const {
        userId,
        token
    } = req.params;

    try {
        const user = await UserModel.findById(userId);

        if (!user) {
            throw createHttpError(404, "User not found");
        }

        const Token = await TokenModel.findOne({
            userId,
            token
        });

        if (!Token) {
            throw createHttpError(404, "Token not found");
        }

        user.verified = true;
        await user.save();

        await TokenModel.deleteOne({userId, token});

        res.sendStatus(200);
    } catch (error) {
        next(error);
    }
}