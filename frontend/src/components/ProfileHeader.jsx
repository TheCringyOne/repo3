// frontend/src/components/ProfileHeader.jsx
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { axiosInstance } from "../lib/axios";
import { toast } from "react-hot-toast";
import { Camera, Clock, MapPin, UserCheck, UserPlus, X, FileText } from "lucide-react";

const ProfileHeader = ({ userData, onSave, isOwnProfile }) => {
 const [isEditing, setIsEditing] = useState(false);
 const [editedData, setEditedData] = useState({});
 const queryClient = useQueryClient();

 const { data: authUser } = useQuery({ queryKey: ["authUser"] });

 const { data: connectionStatus, refetch: refetchConnectionStatus } = useQuery({
   queryKey: ["connectionStatus", userData._id],
   queryFn: () => axiosInstance.get(`/connections/status/${userData._id}`),
   enabled: !isOwnProfile,
 });

 const isConnected = userData.connections.some((connection) => connection === authUser._id);

 const { mutate: sendConnectionRequest } = useMutation({
   mutationFn: (userId) => axiosInstance.post(`/connections/request/${userId}`),
   onSuccess: () => {
     toast.success("Connection request sent");
     refetchConnectionStatus();
     queryClient.invalidateQueries(["connectionRequests"]);
   },
   onError: (error) => {
     toast.error(error.response?.data?.message || "An error occurred");
   },
 });

 const { mutate: acceptRequest } = useMutation({
   mutationFn: (requestId) => axiosInstance.put(`/connections/accept/${requestId}`),
   onSuccess: () => {
     toast.success("Connection request accepted");
     refetchConnectionStatus();
     queryClient.invalidateQueries(["connectionRequests"]);
   },
   onError: (error) => {
     toast.error(error.response?.data?.message || "An error occurred");
   },
 });

 const { mutate: rejectRequest } = useMutation({
   mutationFn: (requestId) => axiosInstance.put(`/connections/reject/${requestId}`),
   onSuccess: () => {
     toast.success("Connection request rejected");
     refetchConnectionStatus();
     queryClient.invalidateQueries(["connectionRequests"]);
   },
   onError: (error) => {
     toast.error(error.response?.data?.message || "An error occurred");
   },
 });

 const { mutate: removeConnection } = useMutation({
   mutationFn: (userId) => axiosInstance.delete(`/connections/${userId}`),
   onSuccess: () => {
     toast.success("Connection removed");
     refetchConnectionStatus();
     queryClient.invalidateQueries(["connectionRequests"]);
   },
   onError: (error) => {
     toast.error(error.response?.data?.message || "An error occurred");
   },
 });

 const getConnectionStatus = useMemo(() => {
   if (isConnected) return "connected";
   if (!isConnected) return "not_connected";
   return connectionStatus?.data?.status;
 }, [isConnected, connectionStatus]);

 const renderConnectionButton = () => {
   const baseClass = "text-white py-2 px-4 rounded-full transition duration-300 flex items-center justify-center";
   switch (getConnectionStatus) {
     case "connected":
       return (
         <div className='flex gap-2 justify-center'>
           <div className={`${baseClass} bg-green-500 hover:bg-green-600`}>
             <UserCheck size={20} className='mr-2' />
             Conectado
           </div>
           <button
             className={`${baseClass} bg-red-500 hover:bg-red-600 text-sm`}
             onClick={() => removeConnection(userData._id)}
           >
             <X size={20} className='mr-2' />
             Cancelar conexión
           </button>
         </div>
       );

     case "pending":
       return (
         <button className={`${baseClass} bg-yellow-500 hover:bg-yellow-600`}>
           <Clock size={20} className='mr-2' />
           Pendiente
         </button>
       );

     case "received":
       return (
         <div className='flex gap-2 justify-center'>
           <button
             onClick={() => acceptRequest(connectionStatus.data.requestId)}
             className={`${baseClass} bg-green-500 hover:bg-green-600`}
           >
             Aceptar
           </button>
           <button
             onClick={() => rejectRequest(connectionStatus.data.requestId)}
             className={`${baseClass} bg-red-500 hover:bg-red-600`}
           >
             Rechazar
           </button>
         </div>
       );
     default:
       return (
         <button
           onClick={() => sendConnectionRequest(userData._id)}
           className='bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded-full transition duration-300 flex items-center justify-center'
         >
           <UserPlus size={20} className='mr-2' />
           Conectar
         </button>
       );
   }
 };

 const handleFileChange = (event) => {
   const file = event.target.files[0];
   if (file) {
     const reader = new FileReader();
     reader.onloadend = () => {
       const fieldName = event.target.name;
       
       if (fieldName === 'curriculumImg' && file.type !== 'application/pdf') {
         toast.error('Por favor sube un archivo PDF');
         return;
       }
       
       setEditedData(prev => ({ ...prev, [fieldName]: reader.result }));
     };
     reader.readAsDataURL(file);
   }
 };

 const handleSave = () => {
   console.log('Saving data:', editedData);
   onSave(editedData);
   setIsEditing(false);
 };

 // Get role badge styling
 const getRoleBadgeClasses = () => {
   switch(userData.role) {
     case 'empresario':
       return 'bg-green-100 text-green-800';
     case 'administrador':
       return 'bg-purple-100 text-purple-800';
     default:
       return 'bg-blue-100 text-blue-800';
   }
 };

 // Get role display name
 const getRoleDisplayName = () => {
   switch(userData.role) {
     case 'empresario':
       return 'Empresario';
     case 'administrador':
       return 'Administrador';
     default:
       return 'Egresado';
   }
 };

 return (
   <div className="bg-white shadow rounded-lg mb-6">
     <div
       className="relative h-48 rounded-t-lg bg-cover bg-center"
       style={{
         backgroundImage: `url('${editedData.bannerImg || userData.bannerImg || "/banner.png"}')`,
       }}
     >
       {isEditing && (
         <label className="absolute top-2 right-2 bg-white p-2 rounded-full shadow cursor-pointer">
           <Camera size={20} />
           <input
             type="file"
             className="hidden"
             name="bannerImg"
             onChange={handleFileChange}
             accept="image/*"
           />
         </label>
       )}
     </div>

     <div className="p-4">
       <div className="relative -mt-20 mb-4">
         <div className="relative">
           <img
             className="w-32 h-32 rounded-full mx-auto object-cover"
             src={editedData.profilePicture || userData.profilePicture || "/avatar.png"}
             alt={userData.name}
           />
           {isEditing && (
             <label className="absolute bottom-0 right-1/2 transform translate-x-16 bg-white p-2 rounded-full shadow cursor-pointer">
               <Camera size={20} />
               <input
                 type="file"
                 className="hidden"
                 name="profilePicture"
                 onChange={handleFileChange}
                 accept="image/*"
               />
             </label>
           )}
         </div>
       </div>

       <div className="text-center mb-4">
         {isEditing ? (
           <input
             type="text"
             value={editedData.name ?? userData.name}
             onChange={(e) => setEditedData({ ...editedData, name: e.target.value })}
             className="text-2xl font-bold mb-2 text-center w-full"
           />
         ) : (
           <h1 className="text-2xl font-bold mb-2">{userData.name}</h1>
         )}

         {/* Role Badge */}
         <div className="mt-1 mb-2">
           <span className={`inline-block px-3 py-1 text-xs rounded-full ${getRoleBadgeClasses()}`}>
             {getRoleDisplayName()}
           </span>
         </div>

         {isEditing ? (
           <input
             type="text"
             value={editedData.headline ?? userData.headline}
             onChange={(e) => setEditedData({ ...editedData, headline: e.target.value })}
             className="text-gray-600 text-center w-full"
           />
         ) : (
           <p className="text-gray-600">
             {userData.role === 'empresario' && userData.companyInfo?.companyName
               ? `${userData.companyInfo.companyName} · ${userData.headline}`
               : userData.headline}
           </p>
         )}

         <div className="flex justify-center items-center mt-2">
           <MapPin size={16} className="text-gray-500 mr-1" />
           {isEditing ? (
             <input
               type="text"
               value={editedData.location ?? userData.location}
               onChange={(e) => setEditedData({ ...editedData, location: e.target.value })}
               className="text-gray-600 text-center"
             />
           ) : (
             <span className="text-gray-600">{userData.location}</span>
           )}
         </div>
       </div>

       {isOwnProfile ? (
         isEditing ? (
           <button
             className="w-full bg-primary text-white py-2 px-4 rounded-full hover:bg-primary-dark transition duration-300"
             onClick={handleSave}
           >
             Guardar cambios
           </button>
         ) : (
           <button
             onClick={() => setIsEditing(true)}
             className="w-full bg-primary text-white py-2 px-4 rounded-full hover:bg-primary-dark transition duration-300"
           >
             Editar perfil
           </button>
         )
       ) : (
         <div className="flex justify-center">{renderConnectionButton()}</div>
       )}
     </div>

     <div className="p-4 border-t">
       <h2 className="text-xl font-semibold mb-4 text-center">Curriculum</h2>
       <div className="max-w-md mx-auto">
         <div className="relative w-full h-32 rounded-lg border-2 border-gray-200 flex items-center justify-center bg-gray-50">
           {(editedData.curriculumImg || userData.curriculumImg) ? (
             <div className="text-center">
               <FileText size={32} className="mx-auto mb-2 text-gray-600" />
               <a 
                 href={editedData.curriculumImg || userData.curriculumImg}
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full inline-flex items-center gap-2 transition-colors duration-200"
               >
                 <span>Ver Curriculum</span>
                 <FileText size={16} />
               </a>
             </div>
           ) : (
             <div className="text-center text-gray-500">
               <FileText size={32} className="mx-auto mb-2" />
               <p className="text-sm">{isEditing ? "Haz clic para subir PDF" : "No hay curriculum"}</p>
             </div>
           )}
           
           {isEditing && (
             <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 opacity-0 hover:opacity-100 transition-opacity duration-300 cursor-pointer rounded-lg">
               <div className="bg-white p-2 rounded-full shadow">
                 <FileText size={20} />
               </div>
               <input
                 type="file"
                 className="hidden"
                 name="curriculumImg"
                 onChange={handleFileChange}
                 accept="application/pdf"
               />
             </label>
           )}
         </div>
         {isEditing && (
           <p className="text-center text-xs text-gray-500 mt-1">
             Solo archivos PDF
           </p>
         )}
       </div>
     </div>
   </div>
 );
};

export default ProfileHeader;