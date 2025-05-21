// backend/middleware/admin.middleware.js
export const isAdmin = async (req, res, next) => {
    try {
        if (req.user.role !== 'administrador') {
            return res.status(403).json({ message: "Acceso denegado. Solo administradores." });
        }
        next();
    } catch (error) {
        console.log("Error in isAdmin middleware:", error.message);
        res.status(500).json({ message: "Error del servidor" });
    }
};