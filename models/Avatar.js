const mongoose = require('mongoose')
const { Schema } = mongoose

const AvatarSchema = new Schema({
    order: { type: Number, required: true },
    name: { type: String, required: true },
    path: { type: String, required: true },
    complexity: { type: Number, required: true },
    hub: { type: Schema.Types.ObjectId, ref: 'Hub', required: true }
}, {
    timestamps: { createdAt: true, updatedAt: true }
})

module.exports = mongoose.model('Avatar', AvatarSchema)