const C = require('../types')
const mongoose = require('mongoose')
const { Schema } = mongoose

const ConditionBlockSchema = new Schema({
    action: {
        type: String,
        enum: [
            C.ADD_ARTICLE,
            C.ADD_OFFER,
            C.SEND_MESSAGE,
            C.JOIN_HUB
        ],
        required: true
    },
    goals: [{
        type: String,
        enum: [C.ONCE, C.QUANTITY, C.SPECIFIC],
        required: true
    }],
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