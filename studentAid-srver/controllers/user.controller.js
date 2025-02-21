import * as statusCodes from '../constants/status.constants.js';
import User from "../models/user.js";
import ResponseError from "../utils/respErr.js";

// /api/user/
export const getOwnProfile = async (req, res, next) => {

    res.status(statusCodes.OK).json({
        user: req.user
    })
}

// /api/user/update-password
export const updatePassword = async (req, res, next) => {
    const { oldPassword, newPassword, confirmPassword } = req.body
    if (!oldPassword || !newPassword || !confirmPassword) {
        return next(
            new ResponseError(
                "Enter all required fields",
                statusCodes.BAD_REQUEST
            )
        )
    }
    const user = await User.findById(req.user._id).select('+password')

    const validOldPassword = await user.comparePasswords(oldPassword)
    if (!validOldPassword) {
        return next(
            new ResponseError(
                "Password is invalid",
                statusCodes.BAD_REQUEST
            )
        )
    }

    if (newPassword != confirmPassword) {
        return next(
            new ResponseError(
                "Passwords do not match",
                statusCodes.BAD_REQUEST
            )
        )
    }

    // return error if the old password is the same as the new password
    if (oldPassword == newPassword) {
        return next(
            new ResponseError(
                "Old password and new password cannot be the same",
                statusCodes.BAD_REQUEST
            )
        )
    }

    user.password = newPassword;
    await user.save()
    sendToken(user, statusCodes.OK, res)
}

// /api/user/update-profile
export const updateOwnProfile = async (req, res, next) => {
    const { username, email } = req.body;
    if (!username && !email) {
        return next(
            new ResponseError(
                "Enter all required fields",
                statusCodes.BAD_REQUEST
            )
        )
    }





    await User.findByIdAndUpdate(req.user._id, req.body, {
        new: true,
        runValidators: true,
    })

    res.status(statusCodes.OK).json({
        message: "User updated"
    })
}

// /api/user/delete-profile
export const deleteOwnProfile = async (req, res, next) => {
    const user = await User.findById(req.user._id)
    if (!user) {
        return next(
            new ResponseError(
                "User not found",
                statusCodes.NOT_FOUND
            )
        )
    }

    await User.findByIdAndDelete(req.user._id)
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
        return next(
            new ResponseError("You are not logged in", statusCodes.BAD_REQUEST)
        );
    }

    await Session.findOneAndDelete({ refreshToken });
    res.clearCookie("refreshToken");

    res.status(statusCodes.OK).json({
        message: "User deleted"
    })
}
