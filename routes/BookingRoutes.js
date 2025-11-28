import express from "express"
import { checkAvailabilityOfCar, chnageBookingStatus, createBooking, getOwnerBookings, getUserBookings } from "../controllers/BookingController.js"
import { protect } from "../middleware/auth.js"

const bookingRouter = express.Router()

bookingRouter.post("/check-availability",checkAvailabilityOfCar)
bookingRouter.post("/create",protect,createBooking)
bookingRouter.get("/user",protect,getUserBookings)
bookingRouter.get("/owner",protect,getOwnerBookings)
bookingRouter.post("/change-status",protect,chnageBookingStatus)

export default bookingRouter;