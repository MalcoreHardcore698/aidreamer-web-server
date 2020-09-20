const C = require('../types')
const mongoose = require('mongoose')
const { Schema } = mongoose

const UserActTaskSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    task: { type: Schema.Types.ObjectId, ref: 'ActTask', required: true },
    status:  {
        type: String,
        enum: [C.WAITING, C.COMPLETED],
        required: true
    }
}, {
    timestamps: { createdAt: true, updatedAt: true }
})

module.exports = mongoose.model('UserActTask', UserActTaskSchema)