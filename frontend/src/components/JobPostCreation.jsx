import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { 
  Briefcase, 
  Building, 
  MapPin, 
  FileText, 
  Calendar, 
  DollarSign, 
  Mail, 
  Loader, 
  X 
} from "lucide-react";

const JobPostCreation = ({ user, onComplete }) => {
  const [jobData, setJobData] = useState({
    title: "",
    company: "",
    location: "",
    description: "",
    requirements: "",
    salary: "",
    contactEmail: "",
    applicationDeadline: "",
    jobType: "full-time"
  });
  const [showDeadline, setShowDeadline] = useState(false);

  const queryClient = useQueryClient();

  const { mutate: createJobPostMutation, isPending } = useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.post("/jobs/create", data, {
        headers: { "Content-Type": "application/json" },
      });
      return res.data;
    },
    onSuccess: () => {
      resetForm();
      toast.success("Oferta de trabajo creada exitosamente");
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      if (onComplete) onComplete();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Error al crear la oferta de trabajo");
    },
  });

  const handleJobCreation = async () => {
    try {
      if (!jobData.title || !jobData.company || !jobData.location || !jobData.description || !jobData.jobType) {
        return toast.error("Por favor complete los campos obligatorios");
      }

      // Create a copy of job data
      const dataToSubmit = { ...jobData };
      
      // If deadline checkbox is unchecked, remove the deadline field
      if (!showDeadline) {
        dataToSubmit.applicationDeadline = null;
      }

      createJobPostMutation(dataToSubmit);
    } catch (error) {
      console.error("Error in handleJobCreation:", error);
      toast.error("Error al crear la oferta de trabajo");
    }
  };

  const resetForm = () => {
    setJobData({
      title: "",
      company: "",
      location: "",
      description: "",
      requirements: "",
      salary: "",
      contactEmail: "",
      applicationDeadline: "",
      jobType: "full-time"
    });
    setShowDeadline(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setJobData({ ...jobData, [name]: value });
  };

  // Only render for admin users
  if (user.role !== 'administrador') return null;

  return (
    <div className="bg-white rounded-lg shadow p-6 border-2 border-primary mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold flex items-center">
          <Briefcase className="mr-2" /> Publicar Nueva Oferta de Trabajo
        </h2>
      </div>

      <div className="space-y-4">
        {/* Job Title */}
        <div>
          <label className="block text-sm font-medium mb-1">Título del Puesto*</label>
          <div className="relative">
            <input
              type="text"
              name="title"
              value={jobData.title}
              onChange={handleInputChange}
              placeholder="Ej: Desarrollador Full Stack"
              className="w-full p-3 pl-10 border rounded-lg"
              required
            />
            <Briefcase className="absolute left-3 top-3 text-gray-400" size={18} />
          </div>
        </div>

        {/* Company */}
        <div>
          <label className="block text-sm font-medium mb-1">Empresa*</label>
          <div className="relative">
            <input
              type="text"
              name="company"
              value={jobData.company}
              onChange={handleInputChange}
              placeholder="Ej: Tech Innovations S.A."
              className="w-full p-3 pl-10 border rounded-lg"
              required
            />
            <Building className="absolute left-3 top-3 text-gray-400" size={18} />
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium mb-1">Ubicación*</label>
          <div className="relative">
            <input
              type="text"
              name="location"
              value={jobData.location}
              onChange={handleInputChange}
              placeholder="Ej: Tuxtla Gutiérrez, Chiapas"
              className="w-full p-3 pl-10 border rounded-lg"
              required
            />
            <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
          </div>
        </div>

        {/* Job Type */}
        <div>
          <label className="block text-sm font-medium mb-1">Tipo de Empleo*</label>
          <div className="relative">
            <select
              name="jobType"
              value={jobData.jobType}
              onChange={handleInputChange}
              className="w-full p-3 pl-10 border rounded-lg appearance-none"
              required
            >
              <option value="full-time">Tiempo Completo</option>
              <option value="part-time">Medio Tiempo</option>
              <option value="contract">Contrato</option>
              <option value="internship">Pasantía</option>
              <option value="temporary">Temporal</option>
            </select>
            <Briefcase className="absolute left-3 top-3 text-gray-400" size={18} />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-1">Descripción del Puesto*</label>
          <div className="relative">
            <textarea
              name="description"
              value={jobData.description}
              onChange={handleInputChange}
              placeholder="Describe las responsabilidades y detalles del puesto..."
              className="w-full p-3 pl-10 border rounded-lg min-h-[120px]"
              required
            />
            <FileText className="absolute left-3 top-3 text-gray-400" size={18} />
          </div>
        </div>

        {/* Requirements */}
        <div>
          <label className="block text-sm font-medium mb-1">Requisitos</label>
          <div className="relative">
            <textarea
              name="requirements"
              value={jobData.requirements}
              onChange={handleInputChange}
              placeholder="Requisitos, habilidades o experiencia necesaria..."
              className="w-full p-3 pl-10 border rounded-lg min-h-[100px]"
            />
            <FileText className="absolute left-3 top-3 text-gray-400" size={18} />
          </div>
        </div>

        {/* Salary */}
        <div>
          <label className="block text-sm font-medium mb-1">Salario (opcional)</label>
          <div className="relative">
            <input
              type="text"
              name="salary"
              value={jobData.salary}
              onChange={handleInputChange}
              placeholder="Ej: $15,000 - $20,000 MXN mensual"
              className="w-full p-3 pl-10 border rounded-lg"
            />
            <DollarSign className="absolute left-3 top-3 text-gray-400" size={18} />
          </div>
        </div>

        {/* Contact Email */}
        <div>
          <label className="block text-sm font-medium mb-1">Email de Contacto</label>
          <div className="relative">
            <input
              type="email"
              name="contactEmail"
              value={jobData.contactEmail}
              onChange={handleInputChange}
              placeholder="Ej: reclutamiento@empresa.com"
              className="w-full p-3 pl-10 border rounded-lg"
            />
            <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
          </div>
        </div>

        {/* Application Deadline */}
        <div>
          <div className="flex items-center mb-2">
            <input
              type="checkbox"
              id="enableDeadline"
              checked={showDeadline}
              onChange={(e) => setShowDeadline(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="enableDeadline" className="block text-sm font-medium">
              Establecer Fecha Límite de Aplicación
            </label>
          </div>
          
          {showDeadline && (
            <div className="relative">
              <input
                type="date"
                name="applicationDeadline"
                value={jobData.applicationDeadline}
                onChange={handleInputChange}
                className="w-full p-3 pl-10 border rounded-lg"
                min={new Date().toISOString().split('T')[0]} // Set min date to today
              />
              <Calendar className="absolute left-3 top-3 text-gray-400" size={18} />
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end items-center mt-6 pt-4 border-t">
          <button
            onClick={resetForm}
            className="mr-3 flex items-center gap-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
          >
            <X size={18} />
            Cancelar
          </button>
          
          <button
            onClick={handleJobCreation}
            disabled={isPending}
            className="flex items-center gap-1 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
          >
            {isPending ? (
              <>
                <Loader className="animate-spin" size={18} />
                Publicando...
              </>
            ) : (
              <>
                <Briefcase size={18} />
                Publicar Oferta
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobPostCreation;