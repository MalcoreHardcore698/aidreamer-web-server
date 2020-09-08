const mongoose = require('mongoose')
const { Schema } = mongoose
 
const IconSchema = new Schema({
    name: { type: String, required: true },
    path: { type: String, required: true },
    hub: { type: Schema.Types.ObjectId, ref: 'Hub', required: true }
}, {
    timestamps: { createdAt: true, updatedAt: true }
})
 
module.exports = mongoose.model('Icon', IconSchema)