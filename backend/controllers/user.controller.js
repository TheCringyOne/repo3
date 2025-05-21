import User from "../models/user.model.js";
import cloudinary from "../lib/cloudinary.js";

export const getSuggestedConnections = async (req, res) => {
   try {
       const limit = parseInt(req.query.limit) || 5;
       const currentUser = await User.findById(req.user._id).select("connections");
       const suggestedUser = await User.find({
           _id: {
               $ne: req.user._id,
               $nin: currentUser.connections,
           },
       })
           .select("name username profilePicture headline")
           .limit(limit);
       res.json(suggestedUser);
   } catch (error) {
       console.error("Error in getSuggestedConnections controller:", error);
       res.status(500).json({ message: "Server error" });
   }
};

export const getSuggestedConnectionsBig = async (req, res) => {
   try {
       const limit = parseInt(req.query.limit) || 50;
       const currentUser = await User.findById(req.user._id).select("connections");
       const suggestedUser = await User.find({
           _id: {
               $ne: req.user._id,
               $nin: currentUser.connections,
           },
       })
           .select("name username profilePicture headline")
           .limit(limit);
       res.json(suggestedUser);
   } catch (error) {
       console.error("Error in getSuggestedConnections controller:", error);
       res.status(500).json({ message: "Server error" });
   }
};

export const getPublicProfile = async (req, res) => {
   try {
       const user = await User.findOne({ username: req.params.username }).select("-password");
       if (!user) {
           return res.status(404).json({ message: "User not found" });
       }
       res.json(user);
   } catch (error) {
       console.error("Error in getPublicProfile controller:", error);
       res.status(500).json({ message: "Server error" });
   }
};

export const updateProfile = async (req, res) => {
   try {
       const allowedFields = [
           "name",
           "username",
           "headline",
           "about",
           "location",
           "profilePicture",
           "bannerImg",
           "curriculumImg",
           "skills",
           "experience",
           "education",
           "companyInfo", // Added companyInfo to allowed fields
       ];
       
       const updatedData = {};
       for (const field of allowedFields) {
           if (req.body[field] !== undefined) { // Changed from req.body[field] to handle empty objects
               updatedData[field] = req.body[field];
           }
       }

       console.log("Server - Received update data:", req.body);
       console.log("Server - Processed update data:", updatedData);

       if (req.body.profilePicture) {
           const result = await cloudinary.uploader.upload(req.body.profilePicture);
           updatedData.profilePicture = result.secure_url;
       }

       if (req.body.bannerImg) {
           const result = await cloudinary.uploader.upload(req.body.bannerImg);
           updatedData.bannerImg = result.secure_url;
       }

       if (req.body.curriculumImg) {
           try {
               const base64Data = req.body.curriculumImg.split(';base64,').pop();
               
               const result = await cloudinary.uploader.upload(
                   `data:application/pdf;base64,${base64Data}`,
                   {
                       resource_type: "raw",
                       use_filename: true,
                       unique_filename: true,
                       format: "pdf",
                       public_id: `curriculum_${req.user._id}_${Date.now()}`,
                       tags: ['curriculum'],
                       access_mode: "public"
                   }
               );
               
               updatedData.curriculumImg = `${result.secure_url}?dl=1`;
               console.log('Curriculum URL:', updatedData.curriculumImg);
           } catch (error) {
               console.error('Error uploading curriculum:', error);
               throw error;
           }
       }

       const user = await User.findByIdAndUpdate(
           req.user._id, 
           { $set: updatedData }, 
           { new: true }
       ).select("-password");
       
       res.json(user);
   } catch (error) {
       console.error("Error in updateProfile controller:", error);
       res.status(500).json({ message: "Server error" });
   }
};

// Función para trabahar con los empresarios y su primer login  ↓
export const completeFirstLoginSetup = async (req, res) => {
   try {
       const userId = req.user._id;
       
       // Check if user is empresario
       if (req.user.role !== 'empresario') {
           return res.status(403).json({ message: "Esta acción solo está permitida para usuarios con rol de empresario" });
       }
       
       // Get company info from request
       const { companyInfo } = req.body;
       
       // Update user with companyInfo and set isFirstLogin to false
       const user = await User.findByIdAndUpdate(
           userId, 
           { 
               $set: { 
                   isFirstLogin: false,
                   companyInfo: companyInfo || {}
               } 
           }, 
           { new: true }
       ).select("-password");
       
       if (!user) {
           return res.status(404).json({ message: "Usuario no encontrado" });
       }
       
       res.json({
           message: "Configuración inicial completada exitosamente",
           user
       });
   } catch (error) {
       console.error("Error en completeFirstLoginSetup:", error);
       res.status(500).json({ message: "Error del servidor" });
   }
};

