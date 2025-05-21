import User from "../models/user.model.js";
import BannedUser from "../models/bannedUser.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendWelcomeEmail } from "../emails/emailHandlers.js";

export const signup = async (req, res) => {
	try {
		const { name, username, email, password, studentId } = req.body;

		if (!name || !username || !email || !password || !studentId) {
			return res.status(400).json({ message: "All fields are required" });
		}
		
		// Check if student ID is banned
		if (studentId) {
			const isBanned = await BannedUser.findOne({ studentId });
			if (isBanned) {
				return res.status(403).json({ message: "Este ID de estudiante ha sido suspendido del sistema" });
			}
		}
		
		// Validate student ID format (assuming it's 8 digits)
        if (!/^\d{8}$/.test(studentId)) {
            return res.status(400).json({ message: "ID de estudiante inválido. Debe ser un número de 8 dígitos." });
        }
        
        // Validate institutional email format
        const expectedEmail = `L${studentId}@tuxtla.tecnm.mx`;
        if (email.toLowerCase() !== expectedEmail.toLowerCase()) {
            return res.status(400).json({ 
                message: "El correo institucional debe coincidir con tu ID de estudiante (L{ID}@tuxtla.tecnm.mx)." 
            });
        }
        
        // Check if student ID already exists
        const existingStudentId = await User.findOne({ studentId });
        if (existingStudentId) {
            return res.status(400).json({ message: "Este ID de estudiante ya está registrado." });
        }
		
		// Default role is 'egresado' - role assignment will be handled by admins
		const role = 'egresado';
		
		// Check if email already exists
		const existingEmail = await User.findOne({ email });
		if (existingEmail) {
			return res.status(400).json({ message: "El correo ya esta registrado" });
		}

		// Check if username already exists
		const existingUsername = await User.findOne({ username });
		if (existingUsername) {
			return res.status(400).json({ message: "El nombre de usuario ya esta registrado" });
		}

		// Removed name check - allowing duplicate names

		if (password.length < 6) {
			return res.status(400).json({ message: "La  contraseña debre tener almenos 6 caracteres" });
		}

		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		const user = new User({
			name,
			email,
			password: hashedPassword,
			username,
			studentId, // Added studentId field
			role,
		});

		await user.save();

		const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "3d" });

		// Set cookie with more permissive settings for development
		res.cookie("jwt-linkedin", token, {
			httpOnly: true,
			maxAge: 3 * 24 * 60 * 60 * 1000,
			sameSite: "lax", // Changed from strict to lax for development
			secure: process.env.NODE_ENV === "production",
		});

		res.status(201).json({ message: "Usuario registrado correctamente" });

		const profileUrl = process.env.CLIENT_URL + "/profile/" + user.username;

		try {
			await sendWelcomeEmail(user.email, user.name, profileUrl, user.role);
		} catch (emailError) {
			console.error("Error al enviar el correo de bienvenida", emailError);
		}
	} catch (error) {
		console.log("Error in signup: ", error.message);
		res.status(500).json({ message: "Internal server error" });
	}
};

export const login = async (req, res) => {
	try {
		const { username, password } = req.body;

		// Check if user exists
		const user = await User.findOne({ username });
		if (!user) {
			return res.status(400).json({ message: "Datos incorrectos" });
		}

		// Check password
		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) {
			return res.status(400).json({ message: "Datos incorrectos" });
		}

		// Create and send token
		const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "3d" });
		//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		// Set cookie with more permissive settings for development
		res.cookie("jwt-linkedin", token, {
			httpOnly: true,
			maxAge: 3 * 24 * 60 * 60 * 1000,
			sameSite: "none", // Change from "lax" to "none"
			secure: true, // Add this when using sameSite: "none"
		});

		// Create response object with isFirstLogin for empresario users
		const responseData = { message: "Sesion iniciada correctamente" };
		
		// Add firstLogin info for empresario users
		if (user.role === 'empresario') {
			responseData.isFirstLogin = !!user.isFirstLogin;
		}

		res.json(responseData);
	} catch (error) {
		console.error("Error in login controller:", error);
		res.status(500).json({ message: "Server error" });
	}
};

export const logout = (req, res) => {
	res.clearCookie("jwt-linkedin");
	res.json({ message: "Sesion cerrada correctamente" });
};

export const getCurrentUser = async (req, res) => {
	try {
		res.json(req.user);
	} catch (error) {
		console.error("Error in getCurrentUser controller:", error);
		res.status(500).json({ message: "Server error" });
	}
};