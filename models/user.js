const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
            required: true,
            maxlength: 32
        },
        email: {
            type: String,
            trim: true,
            required: true,
        },
        hashed_password: {
            type: String,
            required: true
        },
        about: {
            type: String,
            trim: true
        },
        salt: String,
        role: {
            type: Number,
            default: 0
        },
        history: {
            type: Array,
            default: []
        }
    },
    { timestamps: true }
);

// virtual field
userSchema
    .virtual('password')
    .set(function(password) {
        this._password = password;
        this.hashed_password = this.encryptPassword(password);
    })
    .get(function() {
        return this._password;
    });

userSchema.methods = {
    authenticate: async function(plainText) {
        try {
            const result = await bcrypt.compare(plainText, this.hashed_password);
            // console.log('Password comparison result:', result);
            return result;
        } catch (err) {
            // console.error('Error comparing passwords:', err);
            return false;
        }
    },

    encryptPassword: function(password) {
        if (!password) return '';
        try {
            return bcrypt.hashSync(password, 10); // You can adjust the salt rounds as needed
        } catch (err) {
            return '';
        }
    }
};

module.exports = mongoose.model('User', userSchema);
