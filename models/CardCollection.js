import mongoose from 'mongoose'
const {Schema} = mongoose;

const cardCollectionSchema = new Schema({
  cardCollectionId: {}
})

mongoose.model('cardCollection', cardCollectionSchema)