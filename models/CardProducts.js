import mongoose from 'mongoose'
const {Schema} = mongoose;

const cardProductSchema = new Schema({
  cardList: {
    cardsId: {},
    collectionTitle: {}
  }
})

mongoose.model('cardProducts', cardProductSchema)