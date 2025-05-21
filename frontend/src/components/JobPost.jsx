import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { Loader, Calendar, MapPin, Briefcase, Building, Trash2, DollarSign, Mail, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const JobPost = ({ jobPost }) => {
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });
  const isAdmin = authUser?.role === 'administrador';
  const isAuthor = authUser?._id === jobPost.author._id;
  
  const queryClient = useQueryClient();

  const { mutate: deleteJobPost, isPending: isDeletingJob } = useMutation({
    mutationFn: async () => {
      await axiosInstance.delete(`/jobs/${jobPost._id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      toast.success("Oferta de trabajo eliminada");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Error al eliminar la oferta de trabajo");
    },
  });

  const handleDeleteJobPost = () => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar esta oferta de trabajo?")) return;
    deleteJobPost();
  };

  // Format deadline date
  const formatDeadline = (deadline) => {
    if (!deadline) return "No especificada";
    
    const deadlineDate = new Date(deadline);
    return deadlineDate.toLocaleDateString("es-ES", {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get badge color for job status
  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  // Get badge color for job type
  const getJobTypeBadgeClass = (jobType) => {
    switch(jobType) {
      case 'full-time':
        return 'bg-blue-100 text-blue-800';
      case 'part-time':
        return 'bg-purple-100 text-purple-800';
      case 'contract':
        return 'bg-yellow-100 text-yellow-800';
      case 'internship':
        return 'bg-green-100 text-green-800';
      case 'temporary':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get job type label in Spanish
  const getJobTypeLabel = (jobType) => {
    switch(jobType) {
      case 'full-time': return 'Tiempo completo';
      case 'part-time': return 'Medio tiempo';
      case 'contract': return 'Contrato';
      case 'internship': return 'Pasantía';
      case 'temporary': return 'Temporal';
      default: return jobType;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow mb-4 overflow-hidden">
      <div className="border-l-4 border-primary">
        <div className="p-6">
          {/* Header with author info and actions */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Link to={`/profile/${jobPost?.author?.username}`}>
                <img
                  src={jobPost.author.profilePicture || "/avatar.png"}
                  alt={jobPost.author.name}
                  className="size-10 rounded-full mr-3"
                />
              </Link>

              <div>
                <Link to={`/profile/${jobPost?.author?.username}`}>
                  <h3 className="font-semibold">{jobPost.author.name}</h3>
                </Link>
                <p className="text-xs text-info">{jobPost.author.headline}</p>
                <p className="text-xs text-info">
                  {formatDistanceToNow(new Date(jobPost.createdAt), { addSuffix: true })}
                </p>
              </div>
            </div>
            
            {/* Delete button if admin and author */}
            {isAdmin && isAuthor && (
              <button onClick={handleDeleteJobPost} className="text-red-500 hover:text-red-700">
                {isDeletingJob ? <Loader size={18} className="animate-spin" /> : <Trash2 size={18} />}
              </button>
            )}
          </div>
          
          {/* Job status badge and type badge */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(jobPost.status)}`}>
              {jobPost.status === 'active' ? 'Activa' : 
               jobPost.status === 'closed' ? 'Cerrada' : 'Expirada'}
            </span>
            
            <span className={`px-2 py-1 text-xs rounded-full ${getJobTypeBadgeClass(jobPost.jobType)}`}>
              {getJobTypeLabel(jobPost.jobType)}
            </span>
          </div>

          {/* Job title */}
          <h2 className="text-xl font-bold mb-3">{jobPost.title}</h2>
          
          {/* Company and location info */}
          <div className="flex flex-wrap gap-x-8 gap-y-2 mb-4">
            <div className="flex items-center text-gray-600">
              <Building size={16} className="mr-2" />
              <span>{jobPost.company}</span>
            </div>
            
            <div className="flex items-center text-gray-600">
              <MapPin size={16} className="mr-2" />
              <span>{jobPost.location}</span>
            </div>
            
            {jobPost.salary && (
              <div className="flex items-center text-gray-600">
                <DollarSign size={16} className="mr-2" />
                <span>{jobPost.salary}</span>
              </div>
            )}
            
            {jobPost.applicationDeadline && (
              <div className="flex items-center text-gray-600">
                <Calendar size={16} className="mr-2" />
                <span>Fecha límite: {formatDeadline(jobPost.applicationDeadline)}</span>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Descripción</h3>
            <p className="whitespace-pre-line">{jobPost.description}</p>
          </div>
          
          {/* Requirements if available */}
          {jobPost.requirements && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Requisitos</h3>
              <p className="whitespace-pre-line">{jobPost.requirements}</p>
            </div>
          )}
          
          {/* Contact information */}
          {jobPost.contactEmail && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">Información de contacto</h3>
              <div className="flex items-center">
                <Mail size={16} className="mr-2 text-primary" />
                <a href={`mailto:${jobPost.contactEmail}`} className="text-primary hover:underline">
                  {jobPost.contactEmail}
                </a>
              </div>
            </div>
          )}
          
          {/* Application deadline notice */}
          {jobPost.applicationDeadline && (
            <div className="mt-4 flex items-center text-sm text-gray-500">
              <Clock size={14} className="mr-1" />
              <span>
                {new Date(jobPost.applicationDeadline) > new Date() 
                  ? `Postulaciones abiertas hasta el ${formatDeadline(jobPost.applicationDeadline)}`
                  : `Fecha límite de postulación pasada (${formatDeadline(jobPost.applicationDeadline)})`
                }
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobPost;