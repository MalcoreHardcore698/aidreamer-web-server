const mongoose = require('mongoose')
const { Schema } = mongoose

const MessageSchema = new Schema({
    chat: { type: Schema.Types.ObjectId, ref: 'Chat', required: true },
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    receiver: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true }
}, {
    timestamps: { createdAt: true, updatedAt: true }
})

module.exports = mongoose.model('Message', MessageSchema)