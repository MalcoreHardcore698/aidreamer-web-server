const C = require('../types')
const mongoose = require('mongoose')
const { Schema } = mongoose

const HubSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    slogan: { type: String, required: true },
    icon: { type: Schema.Types.ObjectId, ref: 'Image' },
    poster: { type: Schema.Types.ObjectId, ref: 'Image' },
    color: { type: String, required: true },
    offers: { type: Schema.Types.ObjectId, ref: 'Offer' },
    countUsers: { type: Number },
    countOffers: { type: Number },
    status:  {
        type: String,
        enum: [C.MODERATION, C.PUBLISHED],
        required: true
    }
}, {
    timestamps: { createdAt: true, updatedAt: true }
})

module.exports = mongoose.model('Hub', HubSchema)