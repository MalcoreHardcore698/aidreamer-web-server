const mongoose = require('mongoose')
const { Schema } = mongoose

const NewsSchema = new Schema({
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    body: { type: String, required: true },
    image: { type: Schema.Types.ObjectId, ref: 'Image' },
    hub: { type: Schema.Types.ObjectId, ref: 'Hub', required: true },
    comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
    views: { type: Number },
    status:  {
        type: String,
        enum: ['MODERATION', 'PUBLISHED'],
        required: true
    }
}, {
    timestamps: { createdAt: true, updatedAt: true }
})

module.exports = mongoose.model('News', NewsSchema)