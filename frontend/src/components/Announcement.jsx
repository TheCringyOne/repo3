import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { Loader, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const Announcement = ({ announcement }) => {
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });
  const isAdmin = authUser?.role === 'administrador';
  
  const queryClient = useQueryClient();

  const { mutate: deleteAnnouncement, isPending: isDeletingAnnouncement } = useMutation({
    mutationFn: async () => {
      await axiosInstance.delete(`/announcements/${announcement._id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      toast.success("Anuncio eliminado");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Error al eliminar el anuncio");
    },
  });

  const handleDeleteAnnouncement = () => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar este anuncio?")) return;
    deleteAnnouncement();
  };

  return (
    <div className="bg-white border-l-4 border-primary rounded-lg shadow mb-4">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Link to={`/profile/${announcement?.author?.username}`}>
              <img
                src={announcement.author.profilePicture || "/avatar.png"}
                alt={announcement.author.name}
                className="size-10 rounded-full mr-3"
              />
            </Link>

            <div>
              <Link to={`/profile/${announcement?.author?.username}`}>
                <h3 className="font-semibold">{announcement.author.name}</h3>
              </Link>
              <p className="text-xs text-info">{announcement.author.headline}</p>
              <p className="text-xs text-info">
                {formatDistanceToNow(new Date(announcement.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
          {isAdmin && (
            <button onClick={handleDeleteAnnouncement} className="text-red-500 hover:text-red-700">
              {isDeletingAnnouncement ? <Loader size={18} className="animate-spin" /> : <Trash2 size={18} />}
            </button>
          )}
        </div>
        <p className="mb-4">{announcement.content}</p>
        {announcement.image && <img src={announcement.image} alt="Contenido del anuncio" className="rounded-lg w-full mb-4" />}
      </div>
    </div>
  );
};

export default Announcement;