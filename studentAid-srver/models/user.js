import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { Schema, model } from 'mongoose'
import validator from 'validator'

const userSchema = new Schema({
    email: {
        type: String,
        required: [true, 'User must have an email'],
        unique: false,
        validate: [validator.isEmail, 'Please enter a valid email'],
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            "Please provide a valid email",
        ],
    },
    password: {
        type: String,
        required: [true, "Please enter a password"],
        minlength: [8, 'Password must be atleast 8 characters'],
        select: false
    },
    // role
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    verified: {
        type: Boolean,
        required: true,
        default: false
    }
}, { timestamps: true })

// Encrypting password om pre

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next()
    }

    this.password = await bcrypt.hash(this.password, parseInt(process.env.SALT_ROUND))
})

userSchema.methods.genJwtoken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRE
    })
}

userSchema.methods.genVerificationToken = function () {
    return jwt.sign(
        { id: this._id },
        process.env.USER_VERIFICATION_TOKEN_SECRET,
        { expiresIn: "1d" }
    );
};


userSchema.methods.genResetToken = function () {
    return jwt.sign(
        { id: this._id },
        process.env.USER_RESET_PASSWORD_TOKEN_SECRET,
        { expiresIn: "10m" }
    );
};


//compare user password

userSchema.methods.comparePasswords = async function (password) {
    return await bcrypt.compare(password, this.password)
}


userSchema.set("toJSON", {
    virtuals: true,
    transform: function (doc, ret) {
        delete ret._id;
        delete ret.__v;
    },
});


const User = model('User', userSchema)

export default User