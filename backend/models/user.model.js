import mongoose from "mongoose";
const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        username: { type: String, required: true, unique: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        studentId: { type: String, unique: true }, // Added field for student ID
        role: {
            type: String,
            enum: ['egresado', 'empresario', 'administrador'],
            default: 'egresado'
        },
        // Esto lo usamos para checar si el empresario se estal loggeando por primera vez y enviarlo a llenar su cuestionario si es el caso 
        isFirstLogin: {
        type: Boolean,
        default: function() {
        // esta en default solo para los empresarios
        return this.role === 'empresario';
    }
},
        profilePicture: {
            type: String,
            default: "",
        },
        bannerImg: {
            type: String,
            default: "",
        },
        curriculumImg: {
            type: String,
            default: "",
        },
        headline: {
            type: String,
            default: "Egresado",
        },
        location: {
            type: String,
            default: "México",
        },
        about: {
            type: String,
            default: "",
        },
        skills: [String],
        experience: [
            {
                title: String,
                company: String,
                startDate: Date,
                endDate: Date,
                description: String,
            },
        ],
        education: [
            {
                school: String,
                fieldOfStudy: String,
                startYear: Number,
                endYear: Number,
            },
        ],
        connections: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        // New company fields (only used if role is 'empresario')
        companyInfo: {
            companyName: { type: String, default: "" },
            industry: { type: String, default: "" },
            foundedYear: { type: Number },
            website: { type: String, default: "" },
            employees: { type: String, default: "" }, // Size range like "1-10", "11-50", etc.
            description: { type: String, default: "" },
            logo: { type: String, default: "" },
            location: { type: String, default: "" },
            contactEmail: { type: String, default: "" },
            contactPhone: { type: String, default: "" }
        }
    },
    { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;