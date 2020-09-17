const C = require('../types')
const mongoose = require('mongoose')
const { Schema } = mongoose

const AwardSchema = new Schema({
    award: {
        type: String,
        enum: [C.GEM, C.EXP],
        required: true
    },
    quantity: { type: Number, required: true },
}, {
    timestamps: { createdAt: true, updatedAt: true }
})

module.exports = AwardSchema