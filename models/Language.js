const mongoose = require('mongoose')
const { Schema } = mongoose
 
const LanguageSchema = new Schema({
    code: { type: String, required: true }
}, {
    timestamps: { createdAt: true, updatedAt: true }
})
 
module.exports = mongoose.model('Language', LanguageSchema)