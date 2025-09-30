import Enrollment from "../models/Enrollment.js";

export async function getAllEnrollments(_,res) {
    try {
        const enrollments = await Enrollment.find().sort({createdAt: -1});
        res.status(200).json(enrollments);
    } catch  (error){
        console.error("Error in getAllEnrollments controller", error);
        res.status(500).json({message: "Internal server error"});
    }
}

export async function getEnrollmentById(req, res) {
    try {
        const enrollment = await Enrollment.findById(req.params.id);
        if (!enrollment) return res.status(404).json({message:"Enrollment not found"});
        res.status(200).json(enrollment);
    } catch (error) {
        console.error("Error in getEnrollmentById controller", error);
        res.status(500).json({message:"Internal server error"});
    }
}

export async function searchEnrollments(req, res) {
    try {
        const { q } = req.query;
        
        if (!q || q.trim() === '') {
            return res.status(200).json([]);
        }

        const searchRegex = new RegExp(q, 'i');
        const enrollments = await Enrollment.find({
            $or: [
                { courseID: searchRegex },
                { userID: searchRegex },
                { name: searchRegex },
                { courseName: searchRegex },
                { email: searchRegex }
            ]
        }).sort({createdAt: -1});
        
        res.status(200).json(enrollments);
    } catch (error) {
        console.error('Error in searchEnrollments controller', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export async function createEnrollments(req,res) {
    try {
        const {courseID,userID,name,courseName,email} = req.body;
        
        console.log("Creating enrollment:", { courseID, userID, email });
        
        const enrollment = new Enrollment({courseID,userID,name,courseName,email});
        const savedEnrollment = await enrollment.save();
        
        console.log("Enrollment created successfully:", savedEnrollment._id);
        
        res.status(201).json({
            success: true,
            message: "Enrollment created successfully!",
            enrollment: savedEnrollment
        });
        
    } catch (error) {
        console.error("Error in createEnrollment controller", error);
        
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "You are already enrolled in this course!"
            });
        }
        
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

export async function updateEnrollments(req,res) {
    try {
        const {courseID,userID,name,courseName,email} = req.body;
        const updatedEnrollments = await Enrollment.findByIdAndUpdate(
            req.params.id,
            {courseID,userID,name,courseName,email},
            { new: true }
        );

        if(!updatedEnrollments) return res.status(404).json({message:"Enrollment not found"});
        res.status(200).json(updatedEnrollments);
    } catch (error) {
        console.error("Error in updatedEnrollments controller", error);
        res.status(500).json({message:"Internal server error"});   
    }
}

export async function deleteEnrollments(req,res) {
    try {
        const deletedEnrollment = await Enrollment.findByIdAndDelete(req.params.id);
        if (!deletedEnrollment) return res.status(404).json({message:"Enrollment not found"});
        res.status(200).json({message:"Enrollment deleted successfully!"});
    } catch (error) {
        console.error("Error in deleteEnrollments controller", error);
        res.status(500).json({message:"Internal server error"});
    }
}