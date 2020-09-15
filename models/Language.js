const mongoose = require('mongoose')
const { Schema } = mongoose
 
const LanguageSchema = new Schema({
    code: { type: String, required: true },
    title: { type: String, required: true },
    flag: { type: Schema.Types.ObjectId, ref: 'Flag' }
}, {
    timestamps: { createdAt: true, updatedAt: true }
})
 
module.exports = mongoose.model('Language', LanguageSchema)