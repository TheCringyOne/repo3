// frontend/src/pages/ProjectsPage.jsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import Sidebar from "../components/Sidebar";
import ProjectCreation from "../components/ProjectCreation";
import { Briefcase, Plus, Loader, ThumbsUp, MessageSquare, UserPlus, Users, X } from "lucide-react";
import toast from 'react-hot-toast';
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

const ProjectsPage = () => {
    const queryClient = useQueryClient();
    
    const { data: authUser } = useQuery({ 
        queryKey: ["authUser"],
        suspense: false,
    });

    const [showProjectForm, setShowProjectForm] = useState(false);
    const [filters, setFilters] = useState({
        status: "active",
        view: "all"
    });

    const { data: projects = [], isLoading, error } = useQuery({
        queryKey: ["projects", filters],
        queryFn: async () => {
            try {
                const params = new URLSearchParams();
                if (filters.status) params.append('status', filters.status);
                if (filters.view === 'created') params.append('created', 'true');
                if (filters.view === 'interested') params.append('interested', 'true');
                
                const res = await axiosInstance.get(`/projects?${params}`);
                
                // Convert to plain JavaScript objects to avoid mongoose object rendering issues
                return JSON.parse(JSON.stringify(res.data));
            } catch (err) {
                console.error('Error fetching projects:', err);
                throw new Error(err.response?.data?.message || 'Error al cargar los proyectos');
            }
        },
        enabled: !!authUser,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    // Like project mutation
    const { mutate: likeProject } = useMutation({
        mutationFn: async (projectId) => {
            const res = await axiosInstance.post(`/projects/${projectId}/like`);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["projects", filters]);
            toast.success("Acción realizada correctamente");
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Error al realizar la acción");
        }
    });

    // Show interest mutation
  // In the toggleInterest mutation, change the success message to use Spanish
const { mutate: toggleInterest } = useMutation({
    mutationFn: async (projectId) => {
        const res = await axiosInstance.post(`/projects/${projectId}/interest`);
        return res.data;
    },
    onSuccess: (data) => {
        queryClient.invalidateQueries(["projects", filters]);
        // Custom Spanish message instead of using the response message
        const message = data.message.includes("removed") ? 
            "Interés removido" : "Interés añadido";
        toast.success(message);
    },
    onError: (error) => {
        toast.error(error.response?.data?.message || "Error al mostrar interés");
    }
});
    
    // ProjectPost component with like, comment, and show interest functionality
    const ProjectPost = ({ project, isOwner }) => {
        const [showCommentForm, setShowCommentForm] = useState(false);
        const [commentText, setCommentText] = useState('');
        const [showInterestedUsers, setShowInterestedUsers] = useState(false);
        
        const isLiked = project.likes?.includes(authUser._id);
        const isInterested = project.interestedUsers?.some(u => u.user._id === authUser._id);
        
        const handleLike = () => {
            likeProject(project._id);
        };
        
        const handleToggleInterest = () => {
            toggleInterest(project._id);
        };
        
        const { mutate: addComment } = useMutation({
            mutationFn: async () => {
                const res = await axiosInstance.post(`/projects/${project._id}/comment`, {
                    content: commentText
                });
                return res.data;
            },
            onSuccess: () => {
                queryClient.invalidateQueries(["projects", filters]);
                setCommentText('');
                setShowCommentForm(false);
                toast.success("Comentario añadido");
            },
            onError: (error) => {
                toast.error(error.response?.data?.message || "Error al añadir comentario");
            }
        });
        
        const handleSubmitComment = (e) => {
            e.preventDefault();
            if (commentText.trim()) {
                addComment();
            }
        };
        
        return (
            <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                {/* Header */}
                <div className="flex justify-between mb-4">
                    <div className="flex items-center">
                        <Link to={`/profile/${project.author.username}`}>
                            <img 
                                src={project.author.profilePicture || "/avatar.png"} 
                                alt={project.author.name}
                                className="w-10 h-10 rounded-full mr-3"
                            />
                        </Link>
                        <div>
                            <h3 className="font-semibold text-lg">{project.title}</h3>
                            <div className="flex items-center text-sm text-gray-600">
                                <Link to={`/profile/${project.author.username}`} className="hover:underline">
                                    {project.author.name}
                                </Link>
                                <span className="mx-1">•</span>
                                <span>{formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col items-end">
                        {isOwner && (
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mb-2">
                                Tu proyecto
                            </span>
                        )}
                        <span className={`text-xs px-2 py-1 rounded-full ${
                            project.status === 'active' ? 'bg-green-100 text-green-800' :
                            project.status === 'completed' ? 'bg-purple-100 text-purple-800' :
                            'bg-gray-100 text-gray-800'
                        }`}>
                            {project.status === 'active' ? 'Activo' : 
                             project.status === 'completed' ? 'Completado' : 'Expirado'}
                        </span>
                    </div>
                </div>
                
                {/* Content */}
                <p className="mb-4">{project.content}</p>
                {project.image && <img src={project.image} alt="Project image" className="w-full rounded-lg mb-4" />}
                
                {/* Requirements and Goals */}
                {(project.projectRequirements || project.projectGoals) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {project.projectRequirements && (
                            <div className="bg-gray-50 p-3 rounded">
                                <h4 className="font-semibold mb-2">Requisitos:</h4>
                                <p className="text-sm">{project.projectRequirements}</p>
                            </div>
                        )}
                        {project.projectGoals && (
                            <div className="bg-gray-50 p-3 rounded">
                                <h4 className="font-semibold mb-2">Metas:</h4>
                                <p className="text-sm">{project.projectGoals}</p>
                            </div>
                        )}
                    </div>
                )}
                
                {/* Actions */}
                <div className="flex items-center justify-between p-2 border-t border-b my-3">
                    <button 
                        onClick={handleLike}
                        className={`flex items-center gap-1 px-3 py-1 rounded-full transition-colors
                            ${isLiked ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:bg-gray-100'}`}
                    >
                        <ThumbsUp size={18} className={isLiked ? 'fill-blue-600' : ''} />
                        <span>{project.likes?.length || 0}</span>
                    </button>
                    
                    <button 
                        onClick={() => setShowCommentForm(!showCommentForm)}
                        className="flex items-center gap-1 px-3 py-1 rounded-full text-gray-500 hover:bg-gray-100 transition-colors"
                    >
                        <MessageSquare size={18} />
                        <span>{project.comments?.length || 0} Comentarios</span>
                    </button>
                    
                    <button 
                        onClick={handleToggleInterest}
                        className={`flex items-center gap-1 px-3 py-1 rounded-full transition-colors
                            ${isInterested ? 'text-green-600 bg-green-50' : 'text-gray-500 hover:bg-gray-100'}`}
                        disabled={project.status === 'expired'}
                    >
                        <UserPlus size={18} className={isInterested ? 'fill-green-600' : ''} />
                        <span>{isInterested ? 'Interesado' : 'Mostrar interés'}</span>
                    </button>
                </div>
                
                {/* Interest count and list */}
                {project.interestedUsers?.length > 0 && (
                    <div className="mt-2 mb-4">
                        <button 
                            onClick={() => setShowInterestedUsers(!showInterestedUsers)}
                            className="flex items-center text-sm text-gray-600 hover:text-gray-900"
                        >
                            <Users size={16} className="mr-1" />
                            <span>
                                {project.interestedUsers.length} 
                                {project.interestedUsers.length === 1 ? ' persona interesada' : ' personas interesadas'}
                            </span>
                        </button>
                        
                        {/* Interested Users Modal */}
                        {showInterestedUsers && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                <div className="bg-white rounded-lg p-6 w-full max-w-md">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-semibold">Personas interesadas</h3>
                                        <button 
                                            onClick={() => setShowInterestedUsers(false)}
                                            className="text-gray-500 hover:text-gray-700"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>
                                    
                                    <div className="max-h-80 overflow-y-auto">
                                        {project.interestedUsers.map((interest) => (
                                            <div key={interest.user._id} className="flex items-center p-3 hover:bg-gray-50 rounded">
                                                <Link 
                                                    to={`/profile/${interest.user.username}`}
                                                    className="flex items-center flex-grow"
                                                >
                                                    <img 
                                                        src={interest.user.profilePicture || "/avatar.png"} 
                                                        alt={interest.user.name} 
                                                        className="w-10 h-10 rounded-full mr-3"
                                                    />
                                                    <div>
                                                        <p className="font-medium">{interest.user.name}</p>
                                                        <p className="text-xs text-gray-500">{interest.user.headline}</p>
                                                    </div>
                                                </Link>
                                                <span className="text-xs text-gray-500">
                                                    {formatDistanceToNow(new Date(interest.createdAt), { addSuffix: true })}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
                
                {/* Comment form */}
                {showCommentForm && (
                    <form onSubmit={handleSubmitComment} className="mt-4">
                        <textarea
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="Escribe un comentario..."
                            className="w-full p-3 border rounded-lg mb-2"
                            rows="2"
                            disabled={project.status === 'expired'}
                        />
                        <button 
                            type="submit" 
                            className="bg-primary text-white px-4 py-2 rounded-lg disabled:opacity-50"
                            disabled={!commentText.trim() || project.status === 'expired'}
                        >
                            Comentar
                        </button>
                    </form>
                )}
                
                {/* Comments section */}
                {showCommentForm && project.comments?.length > 0 && (
                    <div className="mt-4 border-t pt-4">
                        <h4 className="font-semibold mb-2">Comentarios</h4>
                        <div className="space-y-3 max-h-60 overflow-y-auto">
                            {project.comments.map((comment) => (
                                <div key={comment._id} className="flex items-start gap-2 p-2 bg-gray-50 rounded">
                                    <Link to={`/profile/${comment.user.username}`}>
                                        <img 
                                            src={comment.user.profilePicture || "/avatar.png"}
                                            alt={comment.user.name}
                                            className="w-8 h-8 rounded-full"
                                        />
                                    </Link>
                                    <div>
                                        <div className="flex items-baseline gap-2">
                                            <Link to={`/profile/${comment.user.username}`} className="font-semibold text-sm hover:underline">
                                                {comment.user.name}
                                            </Link>
                                            <span className="text-xs text-gray-500">
                                                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                            </span>
                                        </div>
                                        <p className="text-sm">{comment.content}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    if (error) {
        return (
            <div className='grid grid-cols-1 lg:grid-cols-4 gap-6'>
                <div className='hidden lg:block lg:col-span-1'>
                    <Sidebar user={authUser} />
                </div>
                <div className='col-span-1 lg:col-span-3'>
                    <div className='bg-white rounded-lg shadow p-6'>
                        <div className='text-center text-red-600'>
                            <p>Error al cargar los proyectos: {error.message}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className='grid grid-cols-1 lg:grid-cols-4 gap-6'>
            <div className='hidden lg:block lg:col-span-1'>
                <Sidebar user={authUser} />
            </div>

            <div className='col-span-1 lg:col-span-3'>
                <div className='bg-white rounded-lg shadow p-6 mb-6'>
                    <div className='flex justify-between items-center mb-6'>
                        <h1 className='text-2xl font-bold'>Proyectos</h1>
                        <button 
                            onClick={() => setShowProjectForm(!showProjectForm)}
                            className='bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2'
                        >
                            <Plus size={20} />
                            {showProjectForm ? "Cerrar" : "Crear Proyecto"}
                        </button>
                    </div>

                    {showProjectForm && (
                        <div className='mb-6'>
                            <ProjectCreation 
                                user={authUser} 
                                onComplete={() => {
                                    setShowProjectForm(false);
                                    toast.success('Proyecto creado exitosamente');
                                }}
                            />
                        </div>
                    )}

                    <div className='flex flex-wrap gap-2 mb-6'>
                        <div className='flex items-center border rounded-lg overflow-hidden'>
                            <button 
                                className={`px-4 py-2 ${filters.view === 'all' ? 'bg-primary text-white' : 'bg-gray-100'}`}
                                onClick={() => setFilters({...filters, view: 'all'})}
                            >
                                Todos
                            </button>
                            <button 
                                className={`px-4 py-2 ${filters.view === 'created' ? 'bg-primary text-white' : 'bg-gray-100'}`}
                                onClick={() => setFilters({...filters, view: 'created'})}
                            >
                                Mis Proyectos
                            </button>
                            <button 
                                className={`px-4 py-2 ${filters.view === 'interested' ? 'bg-primary text-white' : 'bg-gray-100'}`}
                                onClick={() => setFilters({...filters, view: 'interested'})}
                            >
                                Interesado
                            </button>
                        </div>

                        <div className='flex items-center border rounded-lg overflow-hidden ml-auto'>
                            <button 
                                className={`px-4 py-2 ${filters.status === 'active' ? 'bg-primary text-white' : 'bg-gray-100'}`}
                                onClick={() => setFilters({...filters, status: 'active'})}
                            >
                                Activos
                            </button>
                            <button 
                                className={`px-4 py-2 ${filters.status === 'completed' ? 'bg-primary text-white' : 'bg-gray-100'}`}
                                onClick={() => setFilters({...filters, status: 'completed'})}
                            >
                                Completados
                            </button>
                            <button 
                                className={`px-4 py-2 ${filters.status === 'expired' ? 'bg-primary text-white' : 'bg-gray-100'}`}
                                onClick={() => setFilters({...filters, status: 'expired'})}
                            >
                                Expirados
                            </button>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="flex items-center justify-center py-10">
                            <Loader className="w-10 h-10 animate-spin text-primary" />
                        </div>
                    ) : projects && projects.length > 0 ? (
                        <div className='space-y-6'>
                            {projects.map((project) => (
                                <ProjectPost 
                                    key={project._id} 
                                    project={project} 
                                    isOwner={project.author._id === authUser._id}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className='text-center py-10 bg-gray-50 rounded-lg'>
                            <Briefcase size={64} className='mx-auto text-gray-400 mb-4' />
                            <h2 className='text-xl font-semibold mb-2'>No hay proyectos disponibles</h2>
                            <p className='text-gray-600 mb-6'>
                                {filters.view === 'created' 
                                    ? 'No has creado ningún proyecto todavía.' 
                                    : filters.view === 'interested'
                                    ? 'No has mostrado interés en ningún proyecto.'
                                    : 'No hay proyectos que coincidan con tus filtros.'}
                            </p>
                            {filters.view === 'created' && (
                                <button
                                    onClick={() => setShowProjectForm(true)}
                                    className='bg-primary text-white px-4 py-2 rounded-lg'
                                >
                                    Crear tu primer proyecto
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProjectsPage;