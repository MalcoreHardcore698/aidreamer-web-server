const mongoose = require('mongoose')
const { Schema } = mongoose
 
const FlagSchema = new Schema({
    name: { type: String, required: true },
    path: { type: String, required: true }
}, {
    timestamps: { createdAt: true, updatedAt: true }
})
 
module.exports = mongoose.model('Flag', FlagSchema)