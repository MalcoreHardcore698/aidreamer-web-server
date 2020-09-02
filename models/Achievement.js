const C = require('../types')
const mongoose = require('mongoose')
const { Schema } = mongoose

const AchievementSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    area: {
        type: String,
        enum: [C.HUB, C.OFFER, C.CHAT, C.TOURNAMENT, C.PROFILE],
        required: true
    }
}, {
    timestamps: { createdAt: true, updatedAt: true }
})

module.exports = mongoose.model('Achievement', AchievementSchema)