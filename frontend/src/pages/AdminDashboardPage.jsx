import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';
import { Loader, Trash2, UserPlus, Edit, Search, AlertCircle, Key as KeyIcon } from 'lucide-react';

const AdminDashboardPage = () => {
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    studentId: '', // Added the studentId field
    role: 'egresado',
  });
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('users'); // 'users' or 'banned'
  
  const queryClient = useQueryClient();
  
  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const res = await axiosInstance.get('/admin/users');
      return res.data;
    },
  });
  
  const { data: bannedUsers, isLoading: isLoadingBanned } = useQuery({
    queryKey: ['admin-banned-users'],
    queryFn: async () => {
      const res = await axiosInstance.get('/admin/banned-users');
      return res.data;
    },
    enabled: activeTab === 'banned', // Only fetch when the tab is active
  });
  
  const { mutate: createUser, isPending: isCreatingUser } = useMutation({
    mutationFn: async (userData) => {
      return axiosInstance.post('/admin/users', userData);
    },
    onSuccess: () => {
      toast.success('Usuario creado exitosamente');
      setIsAddingUser(false);
      setNewUser({
        name: '',
        username: '',
        email: '',
        password: '',
        studentId: '', // Reset studentId field
        role: 'egresado',
      });
      queryClient.invalidateQueries(['admin-users']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al crear usuario');
    },
  });
  
  const { mutate: deleteUser } = useMutation({
    mutationFn: async (userId) => {
      return axiosInstance.delete(`/admin/users/${userId}`);
    },
    onSuccess: () => {
      toast.success('Usuario eliminado exitosamente');
      queryClient.invalidateQueries(['admin-users']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al eliminar usuario');
    },
  });
  
  const { mutate: updateUserRole } = useMutation({
    mutationFn: async ({ userId, role }) => {
      return axiosInstance.put(`/admin/users/${userId}/role`, { role });
    },
    onSuccess: () => {
      toast.success('Rol actualizado exitosamente');
      queryClient.invalidateQueries(['admin-users']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al actualizar rol');
    },
  });
  
  const { mutate: banUser } = useMutation({
    mutationFn: async ({ userId, reason }) => {
      return axiosInstance.post(`/admin/users/${userId}/ban`, { reason });
    },
    onSuccess: () => {
      toast.success('Usuario baneado exitosamente');
      queryClient.invalidateQueries(['admin-users']);
      queryClient.invalidateQueries(['admin-banned-users']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al banear usuario');
    },
  });
  
  const { mutate: unbanUser } = useMutation({
    mutationFn: async (studentId) => {
      return axiosInstance.delete(`/admin/banned-users/${studentId}`);
    },
    onSuccess: () => {
      toast.success('Usuario desbaneado exitosamente');
      queryClient.invalidateQueries(['admin-banned-users']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al desbanear usuario');
    },
  });
  
  const { mutate: resetPassword } = useMutation({
    mutationFn: async ({ userId, newPassword }) => {
      return axiosInstance.post(`/admin/users/${userId}/reset-password`, { newPassword });
    },
    onSuccess: () => {
      toast.success('Contraseña restablecida exitosamente');
      queryClient.invalidateQueries(['admin-users']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al restablecer la contraseña');
    },
  });
  
  const handleCreateUser = (e) => {
    e.preventDefault();
    createUser(newUser);
  };
  
  const handleDeleteUser = (userId) => {
    if (window.confirm('¿Estás seguro de eliminar este usuario?')) {
      deleteUser(userId);
    }
  };
  
  const handleRoleChange = (userId, role) => {
    updateUserRole({ userId, role });
  };
  
  const handleBanUser = (userId, name) => {
    const reason = prompt(`Ingrese la razón para banear a ${name}:`);
    
    if (reason !== null) { // If user didn't cancel the prompt
      if (window.confirm(`¿Estás seguro de banear a ${name}? Esta acción no se puede deshacer y el usuario no podrá crear una nueva cuenta con el mismo ID.`)) {
        banUser({ userId, reason });
      }
    }
  };
  
  // Replace the existing handleResetPassword function with this version:

const handleResetPassword = (userId, name) => {
  // Ask admin to enter a new password
  const newPassword = prompt(`Ingrese la nueva contraseña para ${name}:\n\n(Debe tener al menos 6 caracteres)`);
  
  // Validate the password
  if (newPassword) {
    if (newPassword.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    if (window.confirm(`¿Estás seguro de restablecer la contraseña de ${name} a "${newPassword}"?`)) {
      resetPassword({ userId, newPassword });
      
      // Optionally show a confirmation alert with the password in case admin needs to note it
      toast.success(`Contraseña para ${name} actualizada exitosamente`);
    }
  }
};
  
  // Handle studentId change with automatic email generation for egresados
  const handleStudentIdChange = (e) => {
    const studentId = e.target.value;
    setNewUser({
      ...newUser, 
      studentId: studentId,
      // Auto-generate institutional email if it's a valid 8-digit ID and role is egresado
      email: newUser.role === 'egresado' && /^\d{8}$/.test(studentId) 
        ? `L${studentId}@tuxtla.tecnm.mx`
        : newUser.email
    });
  };
  
  // Handle role change and manage studentId/email accordingly
  const handleRoleInputChange = (e) => {
    const role = e.target.value;
    setNewUser({
      ...newUser,
      role: role,
      // If changing to egresado and we have a valid studentId, update the email
      email: role === 'egresado' && /^\d{8}$/.test(newUser.studentId)
        ? `L${newUser.studentId}@tuxtla.tecnm.mx`
        : newUser.email
    });
  };
  
  // Fixed filter function with proper null checks
  const filteredUsers = users?.filter(user => 
    (user && user.name && user.name.toLowerCase().includes(search.toLowerCase())) ||
    (user && user.email && user.email.toLowerCase().includes(search.toLowerCase())) ||
    (user && user.username && user.username.toLowerCase().includes(search.toLowerCase()))
  );
  
  const getRoleBadge = (role) => {
    switch(role) {
      case 'empresario':
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
            Empresario
          </span>
        );
      case 'administrador':
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
            Administrador
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
            Egresado
          </span>
        );
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h1 className="text-2xl font-bold mb-6">Panel de Administración</h1>
      
      <div className="mb-6">
        <div className="flex border-b">
          <button
            className={`py-2 px-4 ${activeTab === 'users' 
              ? 'border-b-2 border-primary font-semibold' 
              : 'text-gray-500'}`}
            onClick={() => setActiveTab('users')}
          >
            Usuarios
          </button>
          <button
            className={`py-2 px-4 ${activeTab === 'banned' 
              ? 'border-b-2 border-primary font-semibold' 
              : 'text-gray-500'}`}
            onClick={() => setActiveTab('banned')}
          >
            Usuarios Baneados
          </button>
        </div>
      </div>
      
      {activeTab === 'users' && (
        <>
          <div className="mb-6 flex justify-between items-center">
            <div className="relative w-64">
              <input
                type="text"
                placeholder="Buscar usuarios..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            </div>
            
            <button 
              onClick={() => setIsAddingUser(true)}
              className="bg-primary text-white px-4 py-2 rounded-lg flex items-center"
            >
              <UserPlus size={18} className="mr-2" />
              Crear Usuario
            </button>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader className="animate-spin" size={32} />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-2 text-left">Nombre</th>
                    <th className="border p-2 text-left">Usuario</th>
                    <th className="border p-2 text-left">Correo</th>
                    <th className="border p-2 text-left">Rol</th>
                    <th className="border p-2 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers?.map(user => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="border p-2">
                        <div className="flex items-center">
                          <span>{user.name}</span>
                        </div>
                      </td>
                      <td className="border p-2">{user.username}</td>
                      <td className="border p-2">{user.email}</td>
                      <td className="border p-2">
                        <div className="flex items-center space-x-2">
                          {getRoleBadge(user.role)}
                          <select
                            value={user.role}
                            onChange={(e) => handleRoleChange(user._id, e.target.value)}
                            className="ml-2 p-1 border rounded"
                          >
                            <option value="egresado">Egresado</option>
                            <option value="empresario">Empresario</option>
                            <option value="administrador">Administrador</option>
                          </select>
                        </div>
                      </td>
                      <td className="border p-2 text-center">
                        <div className="flex justify-center space-x-2">
                          <button 
                            onClick={() => handleDeleteUser(user._id)}
                            className="text-red-500 hover:bg-red-100 p-1 rounded"
                            title="Eliminar Usuario"
                          >
                            <Trash2 size={18} />
                          </button>
                          
                          {/* Only show ban button for egresados */}
                          {user.role === 'egresado' && (
                            <button 
                              onClick={() => handleBanUser(user._id, user.name)}
                              className="text-orange-500 hover:bg-orange-100 p-1 rounded"
                              title="Banear Usuario"
                            >
                              <AlertCircle size={18} />
                            </button>
                          )}
                          
                          {/* Reset Password button */}
                          <button 
                            onClick={() => handleResetPassword(user._id, user.name)}
                            className="text-blue-500 hover:bg-blue-100 p-1 rounded"
                            title="Restablecer Contraseña"
                          >
                            <KeyIcon size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  
                  {filteredUsers?.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center py-4">
                        No se encontraron usuarios
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
      
      {activeTab === 'banned' && (
        <div className="overflow-x-auto">
          {isLoadingBanned ? (
            <div className="flex justify-center py-8">
              <Loader className="animate-spin" size={32} />
            </div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2 text-left">ID Estudiante</th>
                  <th className="border p-2 text-left">Correo</th>
                  <th className="border p-2 text-left">Razón</th>
                  <th className="border p-2 text-left">Baneado Por</th>
                  <th className="border p-2 text-left">Fecha</th>
                  <th className="border p-2 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {bannedUsers?.map(banned => (
                  <tr key={banned._id} className="hover:bg-gray-50">
                    <td className="border p-2">{banned.studentId}</td>
                    <td className="border p-2">{banned.email}</td>
                    <td className="border p-2">{banned.reason}</td>
                    <td className="border p-2">{banned.bannedBy?.name || 'N/A'}</td>
                    <td className="border p-2">
                      {new Date(banned.bannedAt).toLocaleString()}
                    </td>
                    <td className="border p-2 text-center">
                      <button 
                        onClick={() => {
                          if (window.confirm('¿Estás seguro de desbanear a este usuario?')) {
                            unbanUser(banned.studentId);
                          }
                        }}
                        className="text-blue-500 hover:bg-blue-100 p-1 rounded"
                      >
                        Desbanear
                      </button>
                    </td>
                  </tr>
                ))}
                
                {(!bannedUsers || bannedUsers.length === 0) && (
                  <tr>
                    <td colSpan="6" className="text-center py-4">
                      No hay usuarios baneados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      )}
      
      {isAddingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Crear Nuevo Usuario</h2>
            <form onSubmit={handleCreateUser}>
              <div className="mb-4">
                <label className="block mb-1">Nombre completo</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block mb-1">Nombre de usuario</label>
                <input
                  type="text"
                  value={newUser.username}
                  onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block mb-1">Rol</label>
                <select
                  value={newUser.role}
                  onChange={handleRoleInputChange}
                  className="w-full p-2 border rounded"
                >
                  <option value="egresado">Egresado</option>
                  <option value="empresario">Empresario</option>
                  <option value="administrador">Administrador</option>
                </select>
              </div>
              
              {/* Student ID field - only displayed for 'egresado' role */}
              {newUser.role === 'egresado' && (
                <div className="mb-4">
                  <label className="block mb-1">ID de Estudiante (8 dígitos)</label>
                  <input
                    type="text"
                    value={newUser.studentId}
                    onChange={handleStudentIdChange}
                    className="w-full p-2 border rounded"
                    placeholder="Ejemplo: 20270806"
                    required={newUser.role === 'egresado'}
                  />
                </div>
              )}
              
              <div className="mb-4">
                <label className="block mb-1">Correo electrónico</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  className="w-full p-2 border rounded"
                  readOnly={newUser.role === 'egresado' && /^\d{8}$/.test(newUser.studentId)}
                  required
                />
                {newUser.role === 'egresado' && /^\d{8}$/.test(newUser.studentId) && (
                  <p className="text-xs text-gray-500 mt-1">
                    El correo se genera automáticamente a partir del ID de estudiante
                  </p>
                )}
              </div>
              
              <div className="mb-4">
                <label className="block mb-1">Contraseña</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingUser(false)}
                  className="px-4 py-2 border rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-primary text-white px-4 py-2 rounded-lg flex items-center"
                  disabled={isCreatingUser}
                >
                  {isCreatingUser ? <Loader className="animate-spin mr-2" size={18} /> : <UserPlus size={18} className="mr-2" />}
                  Crear Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;