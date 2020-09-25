const C = require('../types')
const mongoose = require('mongoose')
const { Schema } = mongoose
 
const IconSchema = new Schema({
    name: { type: String, required: true },
    path: { type: String, required: true },
    type:  {
        type: String,
        enum: [C.HUB, C.FLAG, C.TASK, C.AWARD],
        required: true
    },
}, {
    timestamps: { createdAt: true, updatedAt: true }
})
 
module.exports = mongoose.model('Icon', IconSchema)