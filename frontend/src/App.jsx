// frontend/src/App.jsx
import React, { useState, useEffect } from 'react';
import { Navigate, Route, Routes, useParams } from "react-router-dom";
import Layout from "./components/layout/Layout";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/auth/LoginPage";
import SignUpPage from "./pages/auth/SignUpPage";
import toast, { Toaster } from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "./lib/axios";
import NotificationsPage from "./pages/NotificationsPage";
import NetworkPage from "./pages/NetworkPage";
import PostPage from "./pages/PostPage";
import ProfilePage from "./pages/ProfilePage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import ProjectsPage from "./pages/ProjectsPage";
import AnnouncementsPage from "./pages/AnnouncementsPage";
import JobBoardPage from "./pages/JobBoardPage";

import QuestionnaireModal from "./components/QuestionnaireModal";

// Componentes para redireccionar rutas con parámetros
function ProfileRedirect() {
  const { username } = useParams();
  return <Navigate to={`/perfil/${username}`} replace />;
}

function PostRedirect() {
  const { postId } = useParams();
  return <Navigate to={`/publicacion/${postId}`} replace />;
}

function App() {
    const [showQuestionnaire, setShowQuestionnaire] = useState(false);
    
    const { data: authUser, isLoading } = useQuery({
        queryKey: ["authUser"],
        queryFn: async () => {
            try {
                const res = await axiosInstance.get("/auth/me");
                return res.data;
            } catch (err) {
                if (err.response && err.response.status === 401) {
                    return null;
                }
                toast.error(err.response?.data?.message || "Something went wrong");
                return null;
            }
        },
        retry: false,
        refetchOnWindowFocus: true,
    });
    
    useEffect(() => {
        if (authUser && authUser.role === 'empresario' && authUser.isFirstLogin) {
            setShowQuestionnaire(true);
        } else {
            setShowQuestionnaire(false);
        }
    }, [authUser]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <Layout>
            {showQuestionnaire && (
                <QuestionnaireModal
                    isOpen={showQuestionnaire}
                    onClose={() => setShowQuestionnaire(false)}
                    user={authUser}
                />
            )}
            
            <Routes>
                {/* Redirecciones desde rutas en inglés hacia rutas en español */}
                <Route path="/profile/:username" element={<ProfileRedirect />} />
                <Route path="/post/:postId" element={<PostRedirect />} />
                <Route path="/network" element={<Navigate to="/contactos" replace />} />
                <Route path="/projects" element={<Navigate to="/proyectos" replace />} />
                <Route path="/notifications" element={<Navigate to="/notificaciones" replace />} />
                <Route path="/announcements" element={<Navigate to="/anuncios" replace />} />
                <Route path="/jobs" element={<Navigate to="/trabajos" replace />} />
                <Route path="/admin" element={<Navigate to="/administrador" replace />} />
                <Route path="/login" element={<Navigate to="/iniciar-sesion" replace />} />
                <Route path="/signup" element={<Navigate to="/registrarse" replace />} />
                
                {/* Rutas en español */}
                <Route 
                    path="/inicio" 
                    element={authUser ? <HomePage /> : <Navigate to="/iniciar-sesion" />} 
                />
                <Route 
                    path="/" 
                    element={<Navigate to="/inicio" />} 
                />
                <Route 
                    path="/iniciar-sesion" 
                    element={!authUser ? <LoginPage /> : <Navigate to="/inicio" />} 
                />
                <Route 
                    path="/registrarse" 
                    element={!authUser ? <SignUpPage /> : <Navigate to="/inicio" />} 
                />
                <Route 
                    path="/notificaciones" 
                    element={authUser ? <NotificationsPage /> : <Navigate to="/iniciar-sesion" />} 
                />
                <Route 
                    path="/contactos" 
                    element={authUser ? <NetworkPage /> : <Navigate to="/iniciar-sesion" />} 
                />
                <Route 
                    path="/proyectos" 
                    element={authUser ? <ProjectsPage /> : <Navigate to="/iniciar-sesion" />} 
                />
                <Route 
                    path="/anuncios" 
                    element={
                        authUser ? 
                            (authUser.role === 'administrador' || authUser.role === 'egresado') ? 
                                <AnnouncementsPage /> : 
                                <Navigate to="/inicio" /> 
                        : <Navigate to="/iniciar-sesion" />
                    } 
                />
                <Route 
                    path="/trabajos" 
                    element={
                        authUser ? 
                            (authUser.role === 'administrador' || authUser.role === 'egresado') ? 
                                <JobBoardPage /> : 
                                <Navigate to="/inicio" /> 
                        : <Navigate to="/iniciar-sesion" />
                    } 
                />
                <Route 
                    path="/publicacion/:postId" 
                    element={authUser ? <PostPage /> : <Navigate to="/iniciar-sesion" />} 
                />
                <Route 
                    path="/perfil/:username" 
                    element={authUser ? <ProfilePage /> : <Navigate to="/iniciar-sesion" />} 
                />
                <Route 
                    path="/administrador" 
                    element={
                        authUser && authUser.role === 'administrador' 
                            ? <AdminDashboardPage /> 
                            : <Navigate to="/inicio" />
                    } 
                />
            </Routes>
            <Toaster 
                position="top-center"
                reverseOrder={false}
                toastOptions={{
                    duration: 3000,
                    style: {
                        background: '#363636',
                        color: '#fff',
                    },
                }}
            />
        </Layout>
    );
}

export default App;