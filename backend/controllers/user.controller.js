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
        const { username } = req.params;
        
        // Verificar que el username no esté vacío
        if (!username || username.trim() === '') {
            return res.status(400).json({ message: "Username is required" });
        }
        
        // Limpiar el username de espacios y buscar tanto con espacios como sin espacios
        const cleanUsername = username.trim();
        
        // Buscar el usuario por username, probando diferentes variaciones
        let user = await User.findOne({ 
            username: { $regex: new RegExp(`^${cleanUsername}$`, 'i') }
        }).select("-password");
        
        // Si no se encuentra, intentar con espacios al final
        if (!user) {
            user = await User.findOne({ 
                username: { $regex: new RegExp(`^${cleanUsername}\\s*$`, 'i') }
            }).select("-password");
        }
        
        // Si aún no se encuentra, intentar buscar por coincidencia parcial
        if (!user) {
            user = await User.findOne({ 
                username: { $regex: new RegExp(cleanUsername, 'i') }
            }).select("-password");
        }
        
        if (!user) {
            console.log(`User not found with username: "${username}"`);
            return res.status(404).json({ message: "User not found" });
        }
        
        // Verificar que el usuario tenga todos los campos necesarios
        const userResponse = {
            _id: user._id,
            name: user.name || '',
            username: user.username || '',
            email: user.email || '',
            role: user.role || 'egresado',
            profilePicture: user.profilePicture || '',
            bannerImg: user.bannerImg || '',
            curriculumImg: user.curriculumImg || '',
            headline: user.headline || 'Egresado',
            location: user.location || 'México',
            about: user.about || '',
            skills: user.skills || [],
            experience: user.experience || [],
            education: user.education || [],
            connections: user.connections || [],
            companyInfo: user.companyInfo || {},
            studentId: user.studentId,
            isFirstLogin: user.isFirstLogin,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };
        
        res.json(userResponse);
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
           "companyInfo",
       ];
       
       const updatedData = {};
       for (const field of allowedFields) {
           if (req.body[field] !== undefined) {
               // Limpiar espacios del username si se está actualizando
               if (field === 'username' && req.body[field]) {
                   updatedData[field] = req.body[field].trim();
               } else {
                   updatedData[field] = req.body[field];
               }
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

export const completeFirstLoginSetup = async (req, res) => {
   try {
       const userId = req.user._id;
       
       if (req.user.role !== 'empresario') {
           return res.status(403).json({ message: "Esta acción solo está permitida para usuarios con rol de empresario" });
       }
       
       const { companyInfo } = req.body;
       
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
