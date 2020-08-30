const mongoose = require('mongoose')
const { Schema } = mongoose

const CommentSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true }
}, {
    timestamps: { createdAt: true, updatedAt: true }
})

module.exports = mongoose.model('Comment', CommentSchema)