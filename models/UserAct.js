const C = require('../types')
const mongoose = require('mongoose')
const { Schema } = mongoose

const UserActSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    act: { type: Schema.Types.ObjectId, ref: 'Act', required: true },
    tasks: [{ type: Schema.Types.ObjectId, ref: 'UserActTask', required: true }],
    status:  {
        type: String,
        enum: [C.WAITING, C.COMPLETED],
        required: true
    }
}, {
    timestamps: { createdAt: true, updatedAt: true }
})

module.exports = mongoose.model('UserAct', UserActSchema)