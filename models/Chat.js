const mongoose = require('mongoose')
const { Schema } = mongoose

const ChatSchema = new Schema({
    title: { type: String, required: true },
    members: [{ type: Schema.Types.ObjectId, ref: 'User', required: true}],
    messages: [{ type: Schema.Types.ObjectId, ref: 'Message', required: true}]
}, {
    timestamps: { createdAt: true, updatedAt: true }
})

module.exports = mongoose.model('Chat', ChatSchema)