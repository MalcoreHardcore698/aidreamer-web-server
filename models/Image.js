const mongoose = require('mongoose')
const { Schema } = mongoose
 
const ImageSchema = new Schema({
    name: { type: String, required: true },
    path: { type: String, required: true }
}, {
    timestamps: { createdAt: true, updatedAt: true }
})
 
module.exports = mongoose.model('Image', ImageSchema)