// frontend/src/components/ProjectCreation.jsx
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { Calendar, Image, Loader } from "lucide-react";

const ProjectCreation = ({ user, onComplete }) => {
    const [projectData, setProjectData] = useState({
        title: "",
        content: "",
        image: null,
        projectRequirements: "",
        projectGoals: "",
        expirationDays: "30" // Default to 30 days
    });
    const [imagePreview, setImagePreview] = useState(null);

    const queryClient = useQueryClient();

    const { mutate: createProjectMutation, isPending } = useMutation({
        mutationFn: async (data) => {
            const res = await axiosInstance.post("/projects/create", data, {
                headers: { "Content-Type": "application/json" },
            });
            return res.data;
        },
        onSuccess: () => {
            resetForm();
            toast.success("Proyecto creado exitosamente");
            queryClient.invalidateQueries({ queryKey: ["projects"] });
            if (onComplete) onComplete();
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "Error al crear el proyecto");
        },
    });

    const handleProjectCreation = async () => {
        try {
            if (!projectData.title || !projectData.content) {
                return toast.error("El título y la descripción son obligatorios");
            }

            const data = { ...projectData };
            
            if (projectData.image) {
                data.image = await readFileAsDataURL(projectData.image);
            }

            createProjectMutation(data);
        } catch (error) {
            console.error("Error in handleProjectCreation:", error);
            toast.error("Error al crear el proyecto");
        }
    };

    const resetForm = () => {
        setProjectData({
            title: "",
            content: "",
            image: null,
            projectRequirements: "",
            projectGoals: "",
            expirationDays: "30"
        });
        setImagePreview(null);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setProjectData({ ...projectData, image: file });
        
        if (file) {
            readFileAsDataURL(file).then(setImagePreview);
        } else {
            setImagePreview(null);
        }
    };

    const readFileAsDataURL = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProjectData({ ...projectData, [name]: value });
    };

    return (
        <div className="bg-white rounded-lg shadow p-6 border-2 border-primary">
            <h2 className="text-xl font-bold mb-4">Crear Nuevo Proyecto</h2>
            
            <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Título del Proyecto*</label>
                <input
                    type="text"
                    name="title"
                    value={projectData.title}
                    onChange={handleInputChange}
                    placeholder="Escribe un título llamativo para tu proyecto"
                    className="w-full p-3 border rounded-lg"
                    required
                />
            </div>
            
            <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Descripción*</label>
                <textarea
                    name="content"
                    value={projectData.content}
                    onChange={handleInputChange}
                    placeholder="Describe tu proyecto, sus objetivos y lo que buscas"
                    className="w-full p-3 border rounded-lg min-h-[120px]"
                    required
                />
            </div>
            
            <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Requisitos</label>
                <textarea
                    name="projectRequirements"
                    value={projectData.projectRequirements}
                    onChange={handleInputChange}
                    placeholder="Detalla los requisitos o habilidades necesarias para participar"
                    className="w-full p-3 border rounded-lg min-h-[80px]"
                />
            </div>
            
            <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Metas</label>
                <textarea
                    name="projectGoals"
                    value={projectData.projectGoals}
                    onChange={handleInputChange}
                    placeholder="¿Cuáles son las metas a corto y largo plazo del proyecto?"
                    className="w-full p-3 border rounded-lg min-h-[80px]"
                />
            </div>
            
            <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Tiempo de Expiración</label>
                <div className="flex items-center">
                    <Calendar size={20} className="mr-2 text-gray-500" />
                    <select
                        name="expirationDays"
                        value={projectData.expirationDays}
                        onChange={handleInputChange}
                        className="p-2 border rounded-lg"
                    >
                        <option value="7">7 días</option>
                        <option value="14">14 días</option>
                        <option value="30">30 días</option>
                        <option value="60">60 días</option>
                        <option value="90">90 días</option>
                    </select>
                </div>
            </div>

            {imagePreview && (
                <div className="mt-4 mb-4">
                    <img src={imagePreview} alt="Vista previa" className="w-full h-auto rounded-lg" />
                </div>
            )}

            <div className="flex justify-between items-center mt-6">
                <div className="flex items-center">
                    <label className="flex items-center text-primary hover:text-primary-dark transition-colors duration-200 cursor-pointer">
                        <Image size={20} className="mr-2" />
                        <span>Añadir imagen</span>
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                    </label>
                </div>

                <div className="flex space-x-3">
                    <button
                        onClick={resetForm}
                        className="px-4 py-2 border border-gray-300 rounded-lg"
                    >
                        Cancelar
                    </button>
                    <button
                        className="bg-primary text-white rounded-lg px-4 py-2 hover:bg-primary-dark transition-colors duration-200 flex items-center"
                        onClick={handleProjectCreation}
                        disabled={isPending}
                    >
                        {isPending ? (
                            <>
                                <Loader className="size-5 animate-spin mr-2" />
                                Creando...
                            </>
                        ) : (
                            "Publicar Proyecto"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProjectCreation;