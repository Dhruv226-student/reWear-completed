const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const { toJSON, paginate } = require('./plugins');
const { SOCIAL_TYPES, FILES_FOLDER } = require('../helper/constant.helper');

const userSchema = new mongoose.Schema(
    {
        first_name: {
            type: String,
            trim: true,
            required: true,
            maxlength: 20,
        },
        last_name: {
            type: String,
            trim: true,
            required: true,
            maxlength: 20,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            validate(value) {
                if (!validator.isEmail(value)) {
                    throw new Error('Invalid email');
                }
            },
        },
        password: {
            type: String,
            trim: true,
            minlength: 8,
            validate(value) {
                if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
                    throw new Error('Password must contain at least one letter and one number');
                }
            },
            private: true, // used by the toJSON plugin
        },
        role: {
            type: mongoose.Types.ObjectId,
            ref: 'Role',
        },
        address: {
            type: String,
            trim: true,
            maxlength: 50,
        },
        image: {
            type: String,
            default: null,
        },
        is_email_verified: {
            type: Boolean,
            default: false,
        },
        social_id: {
            type: String,
            trim: true,
        },
        social_type: {
            type: String,
            enum: Object.values(SOCIAL_TYPES),
        },
        is_block: {
            type: Boolean,
            default: false,
        },
        is_active: {
            type: Boolean,
            default: true,
        },
        deleted_at: {
            type: Date,
            default: null,
        },
        points:{
            type: Number,
            default: 20,
        }
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

// add plugin that converts mongoose to json
userSchema.plugin(toJSON);
userSchema.plugin(paginate);

/**
 * Check if email is taken
 * @param {string} email - The user's email
 * @param {ObjectId} [excludeUserId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
userSchema.statics.isEmailTaken = async function (email, excludeUserId) {
    const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
    return !!user;
};

/**
 * Check if password matches the user's password.
 * @param {string} password
 * @returns {Promise<boolean>}
 */
userSchema.methods.isPasswordMatch = async function (password) {
    const user = this;
    return bcrypt.compare(password, user.password);
};

userSchema.pre('save', async function (next) {
    const user = this;
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }
    next();
});

userSchema.post('findOne', async (data, next) => {
    if (data) {
        if (data?.image) {
            data.image = `${process.env.BASE_URL}/${FILES_FOLDER.userImages}/${String(data._id)}/${
                data.image
            }`;
        } else if (data?.image === null) {
            data.image = `${process.env.BASE_URL}/${FILES_FOLDER.default}/user_image.jpg`;
        }
    }

    next();
});

/**
 * @typedef User
 */
const User = mongoose.model('User', userSchema);

module.exports = User;
