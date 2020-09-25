const C = require('../types')
const mongoose = require('mongoose')
const { Schema } = mongoose

const PostSchema = new Schema({
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type:  {
        type: String,
        enum: [C.ARTICLE, C.OFFER],
        required: true
    },
    title: { type: String, required: true },
    subtitle: { type: String},
    description: { type: String },
    content: { type: String },
    preview: { type: Schema.Types.ObjectId, ref: 'Image' },
    hub: { type: Schema.Types.ObjectId, ref: 'Hub' },
    comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
    views: { type: Number },
    status:  {
        type: String,
        enum: [C.MODERATION, C.PUBLISHED],
        required: true
    }
}, {
    timestamps: { createdAt: true, updatedAt: true }
})

module.exports = mongoose.model('Post', PostSchema)