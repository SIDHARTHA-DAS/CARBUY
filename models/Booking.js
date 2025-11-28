import mongoose from "mongoose"

const {ObjectId} = mongoose.Schema.Types

const bookingSchema = new mongoose.Schema({
  car: {type:ObjectId, ref:"Car", require:true},
  user:{type:ObjectId, ref:"User", require:true},
  owner:{type:ObjectId, ref:"User", require:true},
  pickupDate:{type:Date, require:true},
  returnDate:{type:Date, require:true},
  status:{type:String,enum:["pending", "confirmed","cancelled"],default:"pending"},
  price:{type:Number, require:true}
},{timestamps:true})

const Booking =mongoose.model("Booking",bookingSchema)

export default Booking