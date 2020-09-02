const C = require('../types')
const mongoose = require('mongoose')
const { Schema } = mongoose

const UserChatSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    chatId: { type: Schema.Types.ObjectId, ref: 'Chat', required: true },
    status: {
        type: String,
        enum: [C.OPEN_CHAT, C.CLOSE_CHAT],
        required: true
    }
}, {
    timestamps: { createdAt: true, updatedAt: true }
})

module.exports = mongoose.model('UserChat', UserChatSchema)