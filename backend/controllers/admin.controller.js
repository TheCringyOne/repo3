// backend/controllers/admin.controller.js
import BannedUser from "../models/bannedUser.model.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { sendWelcomeEmail } from "../emails/emailHandlers.js";

export const createUser = async (req, res) => {
    try {
        const { name, username, email, password, role, studentId } = req.body;
        
        // Validate inputs
        if (!name || !username || !email || !password || !role) {
            return res.status(400).json({ message: "Todos los campos son requeridos" });
        }
        
        // For 'egresado' role, validate student ID and email format
        if (role === 'egresado') {
            if (!studentId) {
                return res.status(400).json({ message: "ID de estudiante es requerido para egresados" });
            }
            
            // Validate student ID format
            if (!/^\d{8}$/.test(studentId)) {
                return res.status(400).json({ message: "ID de estudiante inválido. Debe ser un número de 8 dígitos." });
            }
            
            // Validate institutional email format
            const expectedEmail = `L${studentId}@tuxtla.tecnm.mx`;
            if (email.toLowerCase() !== expectedEmail.toLowerCase()) {
                return res.status(400).json({ 
                    message: "El correo institucional debe coincidir con el ID de estudiante (L{ID}@tuxtla.tecnm.mx)." 
                });
            }
            
            // Check if student ID already exists
            const existingStudentId = await User.findOne({ studentId });
            if (existingStudentId) {
                return res.status(400).json({ message: "Este ID de estudiante ya está registrado." });
            }
        }
        
        // Check if role is valid
        if (!['egresado', 'empresario', 'administrador'].includes(role)) {
            return res.status(400).json({ message: "Rol inválido" });
        }
        
        // Check if email exists
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ message: "El correo ya está registrado" });
        }
        
        // Check if username exists
        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
            return res.status(400).json({ message: "El nombre de usuario ya está registrado" });
        }
        
        // Name check has been removed to allow duplicate names
        
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // Create user
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            username,
            role,
            studentId: role === 'egresado' ? studentId : undefined,
            // Set isFirstLogin to true only for empresario users
            isFirstLogin: role === 'empresario' ? true : undefined
        });
        
        await newUser.save();
        
        // Send welcome email
        const profileUrl = process.env.CLIENT_URL + "/profile/" + newUser.username;
        try {
            await sendWelcomeEmail(newUser.email, newUser.name, profileUrl, newUser.role);
        } catch (emailError) {
            console.error("Error al enviar el correo de bienvenida", emailError);
        }
        
        res.status(201).json({ message: "Usuario creado exitosamente", user: {
            _id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            username: newUser.username,
            role: newUser.role,
            studentId: newUser.studentId,
            isFirstLogin: newUser.isFirstLogin
        }});
        
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ message: "Error del servidor" });
    }
};





// Add this function to your existing admin.controller.js
export const banUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;
    
    // Find the user to be banned
    const userToBan = await User.findById(userId);
    
    if (!userToBan) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    
    // Create entry in banned collection
    if (userToBan.role === 'egresado' && userToBan.studentId) {
      const bannedUser = new BannedUser({
        studentId: userToBan.studentId,
        email: userToBan.email,
        reason: reason || "No se proporcionó razón",
        bannedBy: req.user._id
      });
      
      await bannedUser.save();
    }
    
    // Delete the user
    await User.findByIdAndDelete(userId);
    
    res.json({ message: "Usuario baneado exitosamente" });
  } catch (error) {
    console.error("Error banning user:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};

// Function to get all banned users
export const getBannedUsers = async (req, res) => {
  try {
    const bannedUsers = await BannedUser.find().populate("bannedBy", "name username");
    res.json(bannedUsers);
  } catch (error) {
    console.error("Error getting banned users:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};

// Function to unban a user
export const unbanUser = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const bannedUser = await BannedUser.findOneAndDelete({ studentId });
    
    if (!bannedUser) {
      return res.status(404).json({ message: "Usuario baneado no encontrado" });
    }
    
    res.json({ message: "Usuario desbaneado exitosamente" });
  } catch (error) {
    console.error("Error unbanning user:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password");
        res.json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Error del servidor" });
    }
};

export const updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        const userId = req.params.id;
        
        if (!['egresado', 'empresario', 'administrador'].includes(role)) {
            return res.status(400).json({ message: "Rol inválido" });
        }
        
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { role },
            { new: true }
        ).select("-password");
        
        if (!updatedUser) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }
        
        res.json(updatedUser);
    } catch (error) {
        console.error("Error updating user role:", error);
        res.status(500).json({ message: "Error del servidor" });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;
        
        const deletedUser = await User.findByIdAndDelete(userId);
        
        if (!deletedUser) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }
        
        res.json({ message: "Usuario eliminado exitosamente" });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ message: "Error del servidor" });
    }
};

export const resetUserPassword = async (req, res) => {
    try {
        const userId = req.params.id;
        const { newPassword } = req.body;
        
        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ 
                message: "La nueva contraseña debe tener al menos 6 caracteres" 
            });
        }
        
        // Find the user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }
        
        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        
        // Update user's password
        user.password = hashedPassword;
        await user.save();
        
        res.status(200).json({ message: "Contraseña restablecida exitosamente" });
    } catch (error) {
        console.error("Error resetting user password:", error);
        res.status(500).json({ message: "Error del servidor" });
    }
};