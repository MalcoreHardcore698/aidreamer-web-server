const mongoose = require('mongoose')
const { Schema } = mongoose

const UserSchema = new Schema({
    name: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    role: {
        type: String,
        enum: ['ADMINISTRATOR', 'MODERATOR', 'USER'],
        required: true
    },
    avatar: { type: Schema.Types.ObjectId, ref: 'Avatar' },
    availableAvatars: [{ type: Schema.Types.ObjectId, ref: 'Avatar' }],
    level: { type: Number },
    experience: { type: Number },
    balance: { type: Number },
    offers: [{ type: Schema.Types.ObjectId, ref: 'Offer' }],
    achievements: [{ type: Schema.Types.ObjectId, ref: 'Achievement' }],
    preferences: [{ type: Schema.Types.ObjectId, ref: 'Hub' }],
    payment: [{ type: Schema.Types.ObjectId, ref: 'Payment' }],
    transactions: [{ type: Schema.Types.ObjectId, ref: 'Transaction' }],
    isVerifiedEmail: { type: Boolean },
    isVerifiedPhone: { type: Boolean },
    isNotified: { type: Boolean }
}, {
    timestamps: { createdAt: true, updatedAt: true }
})

module.exports = mongoose.model('User', UserSchema)