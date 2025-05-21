// frontend/src/pages/ProfilePage.jsx
import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import ProfileHeader from "../components/ProfileHeader";
import AboutSection from "../components/AboutSection";
import ExperienceSection from "../components/ExperienceSection";
import EducationSection from "../components/EducationSection";
import SkillsSection from "../components/SkillsSection";
import CompanyInfoSection from "../components/CompanyInfoSection";
import toast from "react-hot-toast";

const ProfilePage = () => {
  const { username } = useParams();
  const queryClient = useQueryClient();

  const { data: authUser, isLoading } = useQuery({
    queryKey: ["authUser"],
  });

  const { data: userProfile, isLoading: isUserProfileLoading } = useQuery({
    queryKey: ["userProfile", username],
    queryFn: () => axiosInstance.get(`/users/${username}`),
  });

  const { mutate: updateProfile } = useMutation({
    mutationFn: async (updatedData) => {
      await axiosInstance.put("/users/profile", updatedData);
    },
    onSuccess: () => {
      toast.success("Perfil actualizado");
      // Invalidate both user profile and auth user to ensure data is fresh
      queryClient.invalidateQueries(["userProfile", username]);
      queryClient.invalidateQueries(["authUser"]);
    },
  });

  if (isLoading || isUserProfileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const isOwnProfile = authUser.username === userProfile?.data?.username;
  const userData = isOwnProfile ? authUser : userProfile?.data;

  const handleSave = (updatedData) => {
    console.log('ProfilePage receiving:', updatedData); // Debug log
    updateProfile(updatedData);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <ProfileHeader userData={userData} isOwnProfile={isOwnProfile} onSave={handleSave} />
      
      {/* Company Info Section only for empresarios, show message if first login */}
      {userData.role === 'empresario' && (
        <>
          {userData.isFirstLogin ? (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    Por favor complete el cuestionario inicial para configurar la información de su empresa.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <CompanyInfoSection userData={userData} isOwnProfile={isOwnProfile} onSave={handleSave} />
          )}
        </>
      )}
      
      <AboutSection userData={userData} isOwnProfile={isOwnProfile} onSave={handleSave} />
      <ExperienceSection userData={userData} isOwnProfile={isOwnProfile} onSave={handleSave} />
      <EducationSection userData={userData} isOwnProfile={isOwnProfile} onSave={handleSave} />
      <SkillsSection userData={userData} isOwnProfile={isOwnProfile} onSave={handleSave} />
    </div>
  );
};

export default ProfilePage;