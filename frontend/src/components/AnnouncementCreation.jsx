import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { Image, Loader } from "lucide-react";

const AnnouncementCreation = ({ user }) => {
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const queryClient = useQueryClient();

  const { mutate: createAnnouncementMutation, isPending } = useMutation({
    mutationFn: async (announcementData) => {
      const res = await axiosInstance.post("/announcements/create", announcementData, {
        headers: { "Content-Type": "application/json" },
      });
      return res.data;
    },
    onSuccess: () => {
      resetForm();
      toast.success("Anuncio creado");
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Error al crear el anuncio");
    },
  });

  const handleAnnouncementCreation = async () => {
    try {
      if (!content.trim()) {
        toast.error("El contenido es obligatorio");
        return;
      }
      
      const announcementData = { content };
      if (image) announcementData.image = await readFileAsDataURL(image);

      createAnnouncementMutation(announcementData);
    } catch (error) {
      console.error("Error in handleAnnouncementCreation:", error);
      toast.error("Error al crear el anuncio");
    }
  };

  const resetForm = () => {
    setContent("");
    setImage(null);
    setImagePreview(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
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

  // Only render for admin users
  if (user.role !== 'administrador') return null;

  return (
    <div className="bg-secondary rounded-lg shadow mb-4 p-4">
      <h2 className="text-xl font-semibold mb-4">Crear nuevo anuncio</h2>
      <div className="flex space-x-3">
        <img src={user.profilePicture || "/avatar.png"} alt={user.name} className="size-12 rounded-full" />
        <textarea
          placeholder="Escribe un anuncio importante para los estudiantes..."
          className="w-full p-3 rounded-lg bg-base-100 hover:bg-base-200 focus:bg-base-200 focus:outline-none resize-none transition-colors duration-200 min-h-[100px]"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>

      {imagePreview && (
        <div className="mt-4">
          <img src={imagePreview} alt="Vista previa del anuncio" className="w-full h-auto rounded-lg" />
        </div>
      )}

      <div className="flex justify-between items-center mt-4">
        <div className="flex space-x-4">
          <label className="flex items-center text-info hover:text-info-dark transition-colors duration-200 cursor-pointer">
            <Image size={20} className="mr-2" />
            <span>Agregar imagen</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
          </label>
        </div>

        <button
          className="bg-primary text-white rounded-lg px-4 py-2 hover:bg-primary-dark transition-colors duration-200"
          onClick={handleAnnouncementCreation}
          disabled={isPending}
        >
          {isPending ? <Loader className="size-5 animate-spin" /> : "Publicar anuncio"}
        </button>
      </div>
    </div>
  );
};

export default AnnouncementCreation;