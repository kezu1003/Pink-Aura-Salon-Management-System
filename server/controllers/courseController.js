import Course from "../models/Course.js";

export async function getAllCourses(_,res) {
    try {
        const courses = await Course.find().sort({createdAt: -1});// -1 will sort in desc order (newest first)
        res.status(200).json(courses);
    } catch  (error){
        console.error("Error in getAllCourses controller", error);
        res.status(500).json({message: "Internal server error"});
    }
}

export async function getCourseById(req, res) {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({message:"Course not found"});
        res.status(200).json(course);
    } catch (error) {
        console.error("Error in getCourseById controller", error);
        res.status(500).json({message:"Internal server error"});
    }
}

// NEW: Search courses function
export async function searchCourses(req, res) {
    try {
        const { q } = req.query;
        
        if (!q || q.trim() === '') {
            return res.status(200).json([]);
        }

        const searchRegex = new RegExp(q, 'i'); // Case-insensitive search
        
        const courses = await Course.find({
            $or: [
                { courseName: searchRegex },
                { description: searchRegex },
                { instructorName: searchRegex },
                { location: searchRegex },
                { duration: searchRegex },
                { schedule: searchRegex }
            ]
        }).sort({createdAt: -1}); // Sort by newest first
        
        res.status(200).json(courses);
    } catch (error) {
        console.error('Error in searchCourses controller', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export async function createCourses(req,res) {
    try {
        const {courseName,description,duration,instructorName,location,schedule} = req.body;
        const course = new Course({courseName,description,duration,instructorName,location,schedule});

        const savedCourse = await course.save();
        res.status(201).json(savedCourse);
    } catch (error) {
     console.error("Error in createdCourse controller", error);
     res.status(500).json({message:"Internal server error"});   
    }
}

export async function updateCourses(req,res) {
    try {
        const {courseName,description,duration,instructorName,location,schedule}=req.body;
        const updatedCourses = await Course.findByIdAndUpdate(
            req.params.id,
            {courseName,description,duration,instructorName,location,schedule},
            {
                new:true,
            }
        );

        if(!updatedCourses) return res.status(404).json({message:"Course not found"});

        res.status(200).json(updatedCourses);
    } catch (error)
    {
        console.error("Error in updatedCourses controller", error);
        res.status(500).json({message:"Internal server error"});   
    }
    
}

export async function deleteCourses(req,res) {
    try {
        const deletedCourse = await Course.findByIdAndDelete(req.params.id);
        if (!deletedCourse) return res.status(404).json({message:"Course not found"});
        res.status(200).json({message:"Course deleted successfully!"});
    } catch (error) {
        console.error("Error in deleteCourses controller", error);
        res.status(500).json({message:"Internal server error"});
    }
}