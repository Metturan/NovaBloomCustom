import mongoose from 'mongoose'
const {Schema} = mongoose;

const productSchema = new Schema({
  productList: {
    productId: {},
    collectionTitle: {}
  }
})

mongoose.model('products', productSchema)