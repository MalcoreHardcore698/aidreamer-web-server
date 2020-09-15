const C = require('../types')
const mongoose = require('mongoose')
const { Schema } = mongoose

const AvatarSchema = new Schema({
    name: { type: String, required: true },
    path: { type: String, required: true },
    rarity: {
        type: String,
        enum: [
            C.AVAILABLE,
            C.COMMON,
            C.RARE,
            C.EPIC,
            C.LEGENDARY
        ],
        required: true
    },
    hub: { type: Schema.Types.ObjectId, ref: 'Hub', required: true }
}, {
    timestamps: { createdAt: true, updatedAt: true }
})

module.exports = mongoose.model('Avatar', AvatarSchema)