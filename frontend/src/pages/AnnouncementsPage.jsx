import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import Sidebar from "../components/Sidebar";
import AnnouncementCreation from "../components/AnnouncementCreation";
import Announcement from "../components/Announcement";
import { Megaphone, Loader } from "lucide-react";

const AnnouncementsPage = () => {
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });
  
  // Only students (egresados) and admins can access
  const canAccess = authUser?.role === 'egresado' || authUser?.role === 'administrador';

  const { data: announcements, isLoading, error } = useQuery({
    queryKey: ["announcements"],
    queryFn: async () => {
      const res = await axiosInstance.get("/announcements");
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="hidden lg:block lg:col-span-1">
        <Sidebar user={authUser} />
      </div>

      <div className="col-span-1 lg:col-span-2 order-first lg:order-none">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-2xl font-bold mb-6 flex items-center">
            <Megaphone className="mr-2" /> Anuncios
          </h1>
          
          <p className="text-gray-600 mb-6">
            Esta sección contiene anuncios y comunicaciones importantes publicados por los administradores.
          </p>
        </div>

        {/* Only admins can create announcements */}
        {authUser?.role === 'administrador' && (
          <AnnouncementCreation user={authUser} />
        )}

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader className="w-12 h-12 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="bg-red-50 p-4 rounded-lg text-red-800">
            <p>Error al cargar los anuncios: {error.message}</p>
          </div>
        ) : announcements?.length > 0 ? (
          announcements.map((announcement) => (
            <Announcement key={announcement._id} announcement={announcement} />
          ))
        ) : (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Megaphone size={64} className="mx-auto text-blue-500" />
            <h2 className="text-2xl font-bold mb-4 text-gray-800">No hay anuncios todavía</h2>
            <p className="text-gray-600 mb-6">
              {authUser?.role === 'administrador' 
                ? "Crea el primer anuncio usando el formulario de arriba." 
                : "No se han publicado anuncios todavía."}
            </p>
          </div>
        )}
      </div>

      <div className="col-span-1 lg:col-span-1 hidden lg:block">
        <div className="bg-secondary rounded-lg shadow p-4">
          <h2 className="font-semibold mb-4">¿Qué son los anuncios?</h2>
          <p className="text-sm text-gray-600">
            Los anuncios son comunicaciones oficiales publicadas por los administradores. 
            Aquí encontrarás información importante sobre eventos, actualizaciones y 
            noticias relevantes para los egresados.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementsPage;