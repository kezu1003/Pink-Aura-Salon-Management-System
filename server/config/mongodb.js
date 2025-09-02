import mongoose from "mongoose";

const connectDB = async ()=>{

    mongoose.connection.on('connected',()=>console.log("Database Connected"));

    await mongoose.connect(`${process.env.MONGODB_URL}/Pink-Aura-Salon-Management-System`)
};



export default connectDB;