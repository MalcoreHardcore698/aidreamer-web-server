const C = require('../types')
const mongoose = require('mongoose')
const { Schema } = mongoose

const MessageSchema = new Schema({
    chat: { type: Schema.Types.ObjectId, ref: 'Chat', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    type: {
        type: String,
        enum: [C.READED, C.UNREADED],
        required: true
    }
}, {
    timestamps: { createdAt: true, updatedAt: true }
})

module.exports = mongoose.model('Message', MessageSchema)