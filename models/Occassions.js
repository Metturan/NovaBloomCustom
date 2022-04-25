import mongoose from 'mongoose'
const {Schema} = mongoose;

const occasionsSchema = new Schema({
  occasionsOptionsId: {}
})

mongoose.model('occasionOptions', occasionsSchema)