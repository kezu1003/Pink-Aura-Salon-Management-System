import Event from "../models/Event.js";

export async function getAllEvents(_,res) {
    try {
        const events = await Event.find().sort({createdAt: -1});// -1 will sort in desc order (newest first)
        res.status(200).json(events);
    } catch  (error){
        console.error("Error in getAllEvents controller", error);
        res.status(500).json({message: "Internal server error"});
    }
}

export async function getEventById(req, res) {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({message:"Event not found"});
        res.status(200).json(event);
    } catch (error) {
        console.error("Error in getEventById controller", error);
        res.status(500).json({message:"Internal server error"});
    }
}

// NEW: Search events function
export async function searchEvents(req, res) {
    try {
        const { q } = req.query;
        
        if (!q || q.trim() === '') {
            return res.status(200).json([]);
        }

        const searchRegex = new RegExp(q, 'i'); // Case-insensitive search
        
        const events = await Event.find({
            $or: [
                { title: searchRegex },
                { content: searchRegex },
                { venue: searchRegex }
            ]
        }).sort({createdAt: -1}); // Sort by newest first
        
        res.status(200).json(events);
    } catch (error) {
        console.error('Error in searchEvents controller', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export async function createEvents(req,res) {
    try {
        const {title,content,venue} = req.body;
        const event = new Event({title,content,venue});

        const savedEvent = await event.save();
        res.status(201).json(savedEvent);
    } catch (error) {
     console.error("Error in createdEvent controller", error);
     res.status(500).json({message:"Internal server error"});   
    }
}

export async function updateEvents(req,res) {
    try {
        const {title,content,venue}=req.body;
        const updatedEvent = await Event.findByIdAndUpdate(
            req.params.id,
            {title,content,venue},
            {
                new:true,
            }
        );

        if(!updatedEvent) return res.status(404).json({message:"Event not found"});

        res.status(200).json(updatedEvent);
    } catch (error)
    {
        console.error("Error in updatedEvent controller", error);
        res.status(500).json({message:"Internal server error"});   
    }
    
}

export async function deleteEvents(req,res) {
    try {
        const deletedEvent = await Event.findByIdAndDelete(req.params.id);
        if (!deletedEvent) return res.status(404).json({message:"Event not found"});
        res.status(200).json({message:"Event deleted successfully!"});
    } catch (error) {
        console.error("Error in deleteEvents controller", error);
        res.status(500).json({message:"Internal server error"});
    }
}