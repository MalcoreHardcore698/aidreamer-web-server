const mongoose = require('mongoose')
const { Schema } = mongoose

const AchievementSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    area: {
        type: String,
        enum: ['HUB', 'OFFER', 'CHAT', 'TOURNAMENT', 'PROFILE'],
        required: true
    }
}, {
    timestamps: { createdAt: true, updatedAt: true }
})

module.exports = mongoose.model('Achievement', AchievementSchema)