const C = require('../types')
const mongoose = require('mongoose')
const { Schema } = mongoose

const ConditionBlockSchema = new Schema({
    action: {
        type: String,
        enum: [
            C.ADD,
            C.EDIT,
            C.DELETE,
            C.SEND,
            C.JOIN,
            C.LEAVE
        ],
        required: true
    },
    goals: [{
        type: String,
        enum: [C.ONCE, C.QUANTITY, C.SPECIFIC],
        required: true
    }],
    target: {
        type: String,
        enum: [
            C.USER,
            C.ARTICLE,
            C.HUB,
            C.OFFER,
            C.CHAT,
            C.TOUR,
            C.PROFILE
        ],
        required: true
    },
    multiply: { type: Number },
    specific: { type: Schema.Types.ObjectId },
    union: {
        type: String,
        enum: [C.AND, C.OR, C.THEN]
    },
    link: { type: Schema.Types.ObjectId, ref: 'ConditionBlock' },
}, {
    timestamps: { createdAt: true, updatedAt: true }
})

module.exports = mongoose.model('ConditionBlock', ConditionBlockSchema)