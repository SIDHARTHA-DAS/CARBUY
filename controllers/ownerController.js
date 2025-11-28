import imageKit from "../configs/imageKit.js"
import Booking from "../models/Booking.js"
import Car from "../models/Car.js"
import User from "../models/user.js"
import fs from "fs"

// api to chnage role

export const chnageRoleToOwner = async(req, res)=>{
  try {
    const {_id} =req.user
    await User.findByIdAndUpdate(_id, {role: "owner"})
    res.json({success:true, message:"Now you can list cars"})
  } catch (error) {
    console.log(error.message)
    res.json({success:false, message:error.message})
  }
}


// api to list Car

export const addCar = async (req,res) =>{
  try {
    const {_id} = req.user;
    let car = JSON.parse(req.body.carData)
    const imageFile = req.file;

    // uploade image to imagekit
    const fileBuffer = fs.readFileSync(imageFile.path)
    const response =  await imageKit.upload({
      file: fileBuffer,
      fileName: imageFile.originalname,
      folder:"/cars"
    })

    // optimization through imagekit URL transformation

    var optimizedImageUrl = imageKit.url({
        path : response.filePath,
        transformation : [
          {width:"1280"},
          {quality:"auto"},  //auto compression 
          {format:"webp"}    // convert tp modern format
        ]
    })

    const image = optimizedImageUrl
    await Car.create({...car, owner:_id, image})

    res.json({success: true, message: "Card Added"})

  } catch (error) {
    console.log(error.message)
    res.json({success:false, message:error.message})
  }
}


// api to list owner car

export const getOwnerCars = async(req, res)=>{
  try {
    const {_id} = req.user;
    const cars = await Car.find({owner:_id})
    res.json({success: true,cars})
  } catch (error) {
    console.log(error.message)
    res.json({success:false, message:error.message})
  }
}


// api to toggle car availability

export const toggleCarAvailability = async(req,res)=>{
   try {
    const {_id} = req.user;
    const {carId} = req.body
    const car = await Car.findById(carId)

    // checking is car belong to the user
    if(car.owner.toString() !== _id.toString()){
      res.json({success:false, message:"Unauthorized"})
    }

    car.isAvaliable = !car.isAvaliable;
    await car.save()
    res.json({success: true,message: "Availability Toggled"})
  } catch (error) {
    console.log(error.message)
    res.json({success:false, message:error.message})
  }
}


// api to delte a car
export const deleteCar = async(req,res)=>{
   try {
    const {_id} = req.user;
    const {carId} = req.body
    const car = await Car.findById(carId)

    // checking is car belong to the user
    if(car.owner.toString() !== _id.toString()){
      res.json({success:false, message:"Unauthorized"})
    }

    car.owner = null
    car.isAvaliable = false;


    await car.save()

    res.json({success: true,message: "Car Removed"})
  } catch (error) {
    console.log(error.message)
    res.json({success:false, message:error.message})
  }
}


// api to get Dashboard data
export const getDashboardData= async(req, res) =>{
  try {
    const {_id, role} = req.user;
    if(role !== "owner"){
      return res.json({success:false, message:"Unauthorized" })
    }

    const cars = await Car.find({owner:_id})
    const bookings = await Booking.find({ owner: _id })
    .populate("car")
    .sort({ createdAt: -1 });


    const pendingBookings = await Booking.find({owner:_id, status:"pending"})
    const completedBooking = await Booking.find({owner:_id, status:"confirmed"})

    // calculate monthlyRevenue from booking where status is confirmed
    const monthlyRevenue = bookings.slice().filter(booking=> booking.status === "confirmed").reduce((acc, booking)=> acc + booking.price,0)

    const dashboardData = {
      totalCars: cars.length,
      totalBookings:bookings.length,
      pendingBookings:pendingBookings.length,
      completedBookings:completedBooking.length,
      recentBookings:bookings.slice(0,3),
      monthlyRevenue
    }

    res.json({success:true,dashboardData })

  } catch (error) {
    console.log(error.message)
    res.json({success:false, message:error.message})
  }
}

// api to update user image

export const upadateUserImage = async(req,res)=>{
    try {
      const {_id} = req.user;
       const imageFile = req.file;

    // uploade image to imagekit
    const fileBuffer = fs.readFileSync(imageFile.path)
    const response =  await imageKit.upload({
      file: fileBuffer,
      fileName: imageFile.originalname,
      folder:"/users"
    })

    // optimization through imagekit URL transformation

    var optimizedImageUrl = imageKit.url({
        path : response.filePath,
        transformation : [
          {width:"400"},
          {quality:"auto"},  //auto compression 
          {format:"webp"}    // convert tp modern format
        ]
    })
    const image = optimizedImageUrl;

    await User.findByIdAndUpdate(_id,{image})
    res.json({success:true, message:"Image Updated"})
    } catch (error) {
       console.log(error.message)
       res.json({success:false, message:error.message})
    }
}