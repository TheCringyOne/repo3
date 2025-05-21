// backend/server.js
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import postRoutes from "./routes/post.route.js";
import notificationRoutes from "./routes/notification.route.js";
import connectionRoutes from "./routes/connection.route.js";
import adminRoutes from "./routes/admin.route.js";
import projectRoutes from "./routes/project.route.js";
import { connectDB } from "./lib/db.js";
import { cleanupExpiredProjects } from "./jobs/projectCleanup.js";
import announcementRoutes from "./routes/announcement.route.js";
import jobPostRoutes from "./routes/jobPost.route.js";
import { fileURLToPath } from 'url';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Configurar __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares para todas las configuraciones
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());

// Configuración CORS para desarrollo
if (process.env.NODE_ENV !== "production") {
    app.use(
        cors({
            origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
            credentials: true,
        })
    );
}

// Rutas de la API
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/posts", postRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/connections", connectionRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/projects", projectRoutes);
app.use("/api/v1/announcements", announcementRoutes);
app.use("/api/v1/jobs", jobPostRoutes);

// Configuración para producción: Sirve los archivos estáticos del frontend
if (process.env.NODE_ENV === "production") {
    // Sirve archivos estáticos
    app.use(express.static(path.join(__dirname, "../frontend/dist")));
    
    // Todas las rutas que no sean API redirigen al index.html
    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname, "..", "frontend", "dist", "index.html"));
    });
} else {
    // Ruta simple para verificar que el servidor está funcionando en desarrollo
    app.get('/', (req, res) => {
        res.send('API está funcionando correctamente');
    });
}

// Configuración de tareas programadas
if (process.env.NODE_ENV === "production") {
    setInterval(async () => {
        try {
            await cleanupExpiredProjects();
            console.log("Completed expired projects cleanup job");
        } catch (error) {
            console.error("Error in expired projects cleanup job:", error);
        }
    }, 24 * 60 * 60 * 1000); // Run every 24 hours
}

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    connectDB();
});