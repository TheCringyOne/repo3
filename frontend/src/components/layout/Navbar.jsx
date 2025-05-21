// frontend/src/components/layout/Navbar.jsx
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../../lib/axios";
import { Link } from "react-router-dom"; // Vuelve a usar Link normal
import { Bell, Home, LogOut, User, Users, Settings, Briefcase, Megaphone, Bookmark } from "lucide-react";

const Navbar = () => {
    const { data: authUser } = useQuery({ queryKey: ["authUser"] });
    const queryClient = useQueryClient();

    const { data: notifications } = useQuery({
        queryKey: ["notifications"],
        queryFn: async () => axiosInstance.get("/notifications"),
        enabled: !!authUser,
    });

    const { data: connectionRequests } = useQuery({
        queryKey: ["connectionRequests"],
        queryFn: async () => axiosInstance.get("/connections/requests"),
        enabled: !!authUser,
    });

    const { mutate: logout } = useMutation({
        mutationFn: () => axiosInstance.post("/auth/logout"),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["authUser"] });
        },
    });

    const unreadNotificationCount = notifications?.data.filter((notif) => !notif.read).length;
    const unreadConnectionRequestsCount = connectionRequests?.data?.length;

    return (
        <nav className='shadow-md sticky top-0 z-10' style={{ backgroundColor: '#1b386a' }}>
            <div className='maindigox-w-7xl mx-auto px-4'>
                <div className='flex justify-between items-center py-3'>
                    <div className='flex items-center space-x-4'>
                        <Link to='/inicio'>
                            <img className='h-8 rounded' src='/small-logo.png' alt='LinkedIn' />
                        </Link>
                    </div>
                    <div className='flex items-center gap-2 md:gap-6'>
                        {authUser ? (
                            <>
                                <Link to="/inicio" className='text-zinc-50 flex flex-col items-center'>
                                    <Home size={20} />
                                    <span className='text-xs hidden md:block'>Inicio</span>
                                </Link>
                                
                                <Link to='/proyectos' className='text-zinc-50 flex flex-col items-center'>
                                    <Briefcase size={20} />
                                    <span className='text-xs hidden md:block'>Proyectos</span>
                                </Link>

                                <Link to='/contactos' className='text-zinc-50 flex flex-col items-center relative'>
                                    <Users size={20} />
                                    <span className='text-xs hidden md:block'>Contactos</span>
                                    {unreadConnectionRequestsCount > 0 && (
                                        <span
                                            className='absolute -top-1 -right-1 md:right-4 bg-blue-500 text-white text-xs 
                                            rounded-full size-3 md:size-4 flex items-center justify-center'
                                        >
                                            {unreadConnectionRequestsCount}
                                        </span>
                                    )}
                                </Link>

                                <Link to='/notificaciones' className='text-zinc-50 flex flex-col items-center relative'>
                                    <Bell size={20} />
                                    <span className='text-xs hidden md:block'>Notificaciones</span>
                                    {unreadNotificationCount > 0 && (
                                        <span
                                            className='absolute -top-1 -right-1 md:right-4 bg-blue-500 text-white text-xs 
                                            rounded-full size-3 md:size-4 flex items-center justify-center'
                                        >
                                            {unreadNotificationCount}
                                        </span>
                                    )}
                                </Link>

                                {/* Announcements Tab - Only visible to students and admins */}
                                {(authUser.role === 'egresado' || authUser.role === 'administrador') && (
                                    <Link to='/anuncios' className='text-zinc-50 flex flex-col items-center'>
                                        <Megaphone size={20} />
                                        <span className='text-xs hidden md:block'>Anuncios</span>
                                    </Link>
                                )}
                                
                                {/* Job Board Tab - Only visible to students and admins */}
                                {(authUser.role === 'egresado' || authUser.role === 'administrador') && (
                                    <Link to='/trabajos' className='text-zinc-50 flex flex-col items-center'>
                                        <Bookmark size={20} />
                                        <span className='text-xs hidden md:block'>Bolsa de Trabajos</span>
                                    </Link>
                                )}

                                <Link
                                    to={`/perfil/${authUser.username}`}
                                    className='text-zinc-50 flex flex-col items-center'
                                >
                                    <User size={20} />
                                    <span className='text-xs hidden md:block'>Acerca de mi</span>
                                </Link>
                                
                                {authUser.role === 'administrador' && (
                                    <Link to='/administrador' className='text-zinc-50 flex flex-col items-center'>
                                        <Settings size={20} />
                                        <span className='text-xs hidden md:block'>Admin</span>
                                    </Link>
                                )}
                                
                                <button
                                    className='flex items-center space-x-1 text-sm text-gray-400 hover:text-zinc-200'
                                    onClick={() => logout()}
                                >
                                    <LogOut size={20} />
                                    <span className='hidden md:inline'>cerrar sesión</span>
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to='/iniciar-sesion' className='btn btn-primary'>
                                    Iniciar sesión
                                </Link>
                                <Link to='/registrarse' className='btn btn-primary'>
                                    Registrarse
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;