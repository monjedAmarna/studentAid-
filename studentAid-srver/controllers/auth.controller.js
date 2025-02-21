import jwt from 'jsonwebtoken';
import nodemailer from "nodemailer";
import * as statusCodes from '../constants/status.constants.js';
import User from "../models/user.js";
import ResponseError from '../utils/respErr.js';

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
    }
});

// /api/auth/register
export const register = async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return next(
            new ResponseError(
                "Enter all required fields",
                statusCodes.BAD_REQUEST
            )
        )
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
        return next(
            new ResponseError(
                "User already exists",
                statusCodes.BAD_REQUEST
            )
        )
    }



    const user = await User.create({
        email,
        password,
    })

    const verificationToken = user.genVerificationToken();

    const url = `${process.env.CLIENT_URL}/verify/${verificationToken}`;

    const mailOpts = {
        from: process.env.EMAIL_USERNAME,
        to: email,
        subject: 'Verify Account',
        html: `Click <a href = '${url}'>here</a> to confirm your email.`
    }

    try {
        await transporter.sendMail(mailOpts);
    } catch (error) {
        return next(
            new ResponseError(
                "Email could not be sent",
                statusCodes.INTERNAL_SERVER_ERROR
            )
        )
    }



    return res.status(statusCodes.CREATED).json({
        success: true,
        message: `User registered successfully. A verification email has been sent to ${email}`,
    });
}

// /api/auth/login
export const login = async (req, res, next) => {

    const { email, password } = req.body;
    if (!email || !password) {
        return next(
            new ResponseError(
                "Enter all required fields",
                statusCodes.BAD_REQUEST
            )
        )
    }

    const user = await User.findOne({ email }).select('+password')

    if (!user) {
        return next(
            new ResponseError(
                "Invalid email or password",
                statusCodes.NOT_AUTHENTICATED
            )
        )
    }

    if (!user.verified) {
        return next(
            new ResponseError(
                "Email not verified",
                statusCodes.FORBIDDEN
            )
        )
    }

    const isPasswordValid = await user.comparePasswords(password)

    if (!isPasswordValid) {
        return next(
            new ResponseError(
                "Invalid email or password",
                statusCodes.NOT_AUTHENTICATED
            )
        )
    }

    req.user = user;

    const token = user.genJwtoken();

    return res.status(statusCodes.OK).json({
        success: true,
        message: "Logged in successfully",
        token,
    });

}

// /api/auth/resend
export const resendVerificationToken = async (req, res, next) => {
    const { email } = req.body;
    if (!email) {
        return next(
            new ResponseError(
                "Enter all required fields",
                statusCodes.BAD_REQUEST
            )
        )
    }

    const user = await User.findOne({ email });

    if (!user) {
        return next(
            new ResponseError(
                "User not found",
                statusCodes.NOT_FOUND
            )
        )
    }

    if (user.verified) {
        return next(
            new ResponseError(
                "Email already verified",
                statusCodes.BAD_REQUEST
            )
        )
    }

    const verificationToken = user.genVerificationToken();

    const url = `${process.env.CLIENT_URL.split(" ")}/verify/${verificationToken}`;

    const mailOpts = {
        from: process.env.EMAIL_USERNAME,
        to: email,
        subject: 'Verify Account',
        html: `Click <a href = '${url}'>here</a> to confirm your email.`
    }

    try {
        await transporter.sendMail(mailOpts);
    } catch (error) {
        return next(
            new ResponseError(
                "Email could not be sent",
                statusCodes.INTERNAL_SERVER_ERROR
            )
        )
    }

    return res.status(statusCodes.OK).json({
        success: true,
        message: `Verification email has been sent to ${email}`,
    });
}

// /api/auth/forgot
export const forgotPassword = async (req, res, next) => {
    const { email } = req.body;
    if (!email) {
        return next(
            new ResponseError(
                "Enter all required fields",
                statusCodes.BAD_REQUEST
            )
        )
    }

    const user = await User.findOne({ email });

    if (!user) {
        return next(
            new ResponseError(
                "User not found",
                statusCodes.NOT_FOUND
            )
        )
    }

    const resetToken = user.genResetToken();

    const url = `${process.env.CLIENT_URL.split(" ")}/reset-password/${resetToken}?email=${email}`;

    const mailOpts = {
        from: process.env.EMAIL_USERNAME,
        to: email,
        subject: 'Reset Password',
        html: `Click <a href = '${url}'>here</a> to reset your password.`
    }

    try {
        await transporter.sendMail(mailOpts);
    } catch (error) {
        return next(
            new ResponseError(
                "Email could not be sent",
                statusCodes.INTERNAL_SERVER_ERROR
            )
        )
    }

    return res.status(statusCodes.OK).json({
        success: true,
        message: `Password reset email has been sent to ${email}`,
    });
}

// /api/auth/resetpassword
export const resetPassword = async (req, res, next) => {
    const { password } = req.body;
    const { token } = req.params;

    if (!password) {
        return next(
            new ResponseError(
                "Enter all required fields",
                statusCodes.BAD_REQUEST
            )
        )
    }

    try {
        const decoded = jwt.verify(token, process.env.USER_RESET_PASSWORD_TOKEN_SECRET);

        if (!decoded) {
            return next(
                new ResponseError(
                    "Invalid token",
                    statusCodes.BAD_REQUEST
                )
            )
        }

        const user = await User.findById(decoded.id).exec();

        if (!user) {
            return next(
                new ResponseError(
                    "User not found",
                    statusCodes.NOT_FOUND
                )
            )
        }

        user.password = password;
        await user.save();

        return res.status(statusCodes.OK).json({
            success: true,
            message: "Password reset successfully"
        });
    } catch (e) {
        return next(
            new ResponseError(
                "Something went wrong",
                statusCodes.BAD_REQUEST
            )
        )
    }
}


// /api/auth/verify/:id

export const verifyUser = async (req, res, next) => {
    const { id } = req.params;
    try {
        const decoded = jwt.verify(id, process.env.USER_VERIFICATION_TOKEN_SECRET);

        if (!decoded) {
            return next(
                new ResponseError(
                    "Invalid token",
                    statusCodes.BAD_REQUEST
                )
            )
        }

        const user = await User.findById(decoded.id).exec();

        if (!user) {
            return next(
                new ResponseError(
                    "User not found",
                    statusCodes.NOT_FOUND
                )
            )
        }

        if (user.verified) {
            return next(
                new ResponseError(
                    "Email already verified",
                    statusCodes.BAD_REQUEST
                )
            )
        }

        user.verified = true;

        await user.save();

        return res.status(statusCodes.OK).json({
            success: true,
            message: "User verified successfully"
        });
    } catch (e) {
        return next(
            new ResponseError(
                "Something went wrong",
                statusCodes.BAD_REQUEST
            )
        )
    }
}
