const C = require('../types')
const mongoose = require('mongoose')
const { Schema } = mongoose

const UserSchema = new Schema({
    sessionID: { type: String, required: true },
    name: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    role: { type: Schema.Types.ObjectId, ref: 'Role', required: true },
    avatar: { type: Schema.Types.ObjectId, ref: 'Avatar' },
    availableAvatars: [{ type: Schema.Types.ObjectId, ref: 'Avatar' }],
    level: { type: Number },
    experience: { type: Number },
    balance: { type: Number },
    achievements: [{ type: Schema.Types.ObjectId, ref: 'Achievement' }],
    settings: [{
        type: String,
        enum: [
            C.VERIFIED_EMAIL,
            C.VERIFIED_PHONE,
            C.NOTIFIED_EMAIL
        ]
    }],
    preferences: [{ type: Schema.Types.ObjectId, ref: 'Hub' }]
}, {
    timestamps: { createdAt: true, updatedAt: true }
})

module.exports = mongoose.model('User', UserSchema)