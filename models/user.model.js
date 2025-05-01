const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 50,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 50,
        trim: true
    },
    birthDate: {
        type: Date,
        required: true,
        validate: {
            validator: function (value) {
                const today = new Date();
                const minAge = 13;

                if (value > today) return false;

                const birthDatePlus13 = new Date(value);
                birthDatePlus13.setFullYear(birthDatePlus13.getFullYear() + minAge);

                return birthDatePlus13 <= today;
            },
            message: 'Debes tener al menos 13 años y no puedes ingresar una fecha futura.'
        }
    },
    province: {
        type: String,
        required: true,
        minlength: 4,
        maxlength: 50,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        index: true,
        minlength: 5,
        maxlength: 100,
        trim: true,
        lowercase: true,
        validate: {
            validator: function(value) {
                return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)
            },
            message: props => `${props.value} no es un correo electrónico válido.`
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 4,
        maxlength: 100,
        trim: true
    },
    role: {
        type: String,
        enum: ["admin", "user", "editor"],
        default: "user"
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    }
});

module.exports = mongoose.model("User", userSchema);