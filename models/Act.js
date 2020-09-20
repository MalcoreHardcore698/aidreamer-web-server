const C = require('../types')
const mongoose = require('mongoose')
const AwardSchema = require('./../schemas/AwardSchema')
const { Schema } = mongoose

const ActSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    tasks: [{ type: Schema.Types.ObjectId, ref: 'ActTask', required: true }],
    awards: [{ type: AwardSchema, required: true }],
    successor: [{ type: Schema.Types.ObjectId, ref: 'Act' }],
    isSource: { type: Boolean },
    status:  {
        type: String,
        enum: [C.MODERATION, C.PUBLISHED],
        required: true
    }
}, {
    timestamps: { createdAt: true, updatedAt: true }
})

module.exports = mongoose.model('Act', ActSchema)