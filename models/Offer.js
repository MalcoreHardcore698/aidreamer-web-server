const C = require('../types')
const mongoose = require('mongoose')
const { Schema } = mongoose

const OfferSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    hub: { type: Schema.Types.ObjectId, ref: 'Hub', required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    status: {
        type: String,
        enum: [C.MODERATION, C.PUBLISHED],
        required: true
    }
}, {
    timestamps: { createdAt: true, updatedAt: true }
})

module.exports = mongoose.model('Offer', OfferSchema)