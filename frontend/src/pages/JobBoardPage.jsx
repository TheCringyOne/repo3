import { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import Sidebar from "../components/Sidebar";
import JobPostCreation from "../components/JobPostCreation";
import JobPost from "../components/JobPost";
import { Briefcase, Loader, Search, Filter, Plus, Minus } from "lucide-react";

const JobBoardPage = () => {
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });
  
  // Only students (egresados) and admins can access
  const canAccess = authUser?.role === 'egresado' || authUser?.role === 'administrador';
  const isAdmin = authUser?.role === 'administrador';

  const [showJobForm, setShowJobForm] = useState(false);
  const [filters, setFilters] = useState({
    status: "active",
    jobType: "all"
  });
  const [searchTerm, setSearchTerm] = useState('');

  const { data: jobPosts, isLoading, error } = useQuery({
    queryKey: ["jobs", filters],
    queryFn: async () => {
      let queryParams = new URLSearchParams();
      if (filters.status !== "all") {
        queryParams.append("status", filters.status);
      }
      const res = await axiosInstance.get(`/jobs?${queryParams}`);
      return res.data;
    },
    enabled: canAccess,
  });

  if (!canAccess) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Acceso restringido</h2>
          <p className="text-gray-600">No tienes acceso a esta sección.</p>
        </div>
      </div>
    );
  }

  // Filter job posts based on search term and job type
  const filteredJobs = jobPosts
    ? jobPosts.filter(job => {
        const matchesSearch = !searchTerm || 
          job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.description.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesType = filters.jobType === "all" || job.jobType === filters.jobType;
        
        return matchesSearch && matchesType;
      })
    : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="hidden lg:block lg:col-span-1">
        <Sidebar user={authUser} />
      </div>

      <div className="col-span-1 lg:col-span-3">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold flex items-center">
              <Briefcase className="mr-2" /> Bolsa de Trabajos
            </h1>
            
            {isAdmin && (
              <button 
                onClick={() => setShowJobForm(!showJobForm)}
                className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                {showJobForm ? <Minus size={20} /> : <Plus size={20} />}
                {showJobForm ? "Cerrar" : "Nueva Oferta"}
              </button>
            )}
          </div>

          <p className="text-gray-600 mb-6">
            Explora oportunidades laborales disponibles para egresados del ITTG.
          </p>

          {isAdmin && showJobForm && (
            <JobPostCreation 
              user={authUser} 
              onComplete={() => setShowJobForm(false)} 
            />
          )}

          <div className="flex flex-wrap gap-4 mb-6">
            {/* Search Bar */}
            <div className="flex-grow relative">
              <input
                type="text"
                placeholder="Buscar ofertas de trabajo..."
                className="w-full p-3 pl-10 pr-4 border rounded-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                <Filter size={18} className="mr-1 text-gray-500" />
                <span className="text-gray-500 mr-2">Filtros:</span>
              </div>
              
              {/* Status Filter */}
              <select
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                className="p-2 border rounded-lg"
              >
                <option value="active">Activas</option>
                <option value="closed">Cerradas</option>
                <option value="expired">Expiradas</option>
                <option value="all">Todas</option>
              </select>
              
              {/* Job Type Filter */}
              <select
                value={filters.jobType}
                onChange={(e) => setFilters({...filters, jobType: e.target.value})}
                className="p-2 border rounded-lg"
              >
                <option value="all">Todos los tipos</option>
                <option value="full-time">Tiempo Completo</option>
                <option value="part-time">Medio Tiempo</option>
                <option value="contract">Contrato</option>
                <option value="internship">Pasantía</option>
                <option value="temporary">Temporal</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader className="w-12 h-12 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="bg-red-50 p-4 rounded-lg text-red-800">
              <p>Error al cargar las ofertas de trabajo: {error.message}</p>
            </div>
          ) : filteredJobs.length > 0 ? (
            <div className="space-y-6">
              {filteredJobs.map((jobPost) => (
                <JobPost key={jobPost._id} jobPost={jobPost} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <Briefcase size={64} className="mx-auto text-blue-500" />
              <h2 className="text-2xl font-bold mb-4 text-gray-800">No hay ofertas de trabajo disponibles</h2>
              <p className="text-gray-600 mb-6">
                {searchTerm 
                  ? "No se encontraron resultados para tu búsqueda. Intenta con otros términos."
                  : isAdmin 
                    ? "Agrega la primera oferta de trabajo usando el botón 'Nueva Oferta'."
                    : "No hay ofertas de trabajo publicadas actualmente."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobBoardPage;