import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { axiosInstance } from '../../lib/axios';

const SignupForm = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        email: '',
        studentId: '',
        password: '',
        confirmPassword: ''
    });
    
    const [loading, setLoading] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        
        if (name === 'studentId') {
            // Auto-generate email based on student ID
            if (/^\d{8}$/.test(value)) {
                const generatedEmail = `L${value}@tuxtla.tecnm.mx`;
                setFormData({
                    ...formData,
                    studentId: value,
                    email: generatedEmail
                });
            } else if (name === 'password') {
            setFormData({
                ...formData,
                [name]: value
            });
            // Validar contraseña en tiempo real
            if (value.length > 0 && value.length < 6) {
                setPasswordError('La contraseña debe tener al menos 6 caracteres');
            } else {
                setPasswordError('');
            }
            // Si hay confirmación de contraseña, validar que coincidan
            if (formData.confirmPassword && formData.confirmPassword !== value) {
                setConfirmPasswordError('Las contraseñas no coinciden');
            } else if (formData.confirmPassword) {
                setConfirmPasswordError('');
            }
        } else if (name === 'confirmPassword') {
            setFormData({
                ...formData,
                [name]: value
            });
            // Validar que las contraseñas coincidan
            if (value !== formData.password) {
                setConfirmPasswordError('Las contraseñas no coinciden');
            } else {
                setConfirmPasswordError('');
            }
        } else {
                setFormData({
                    ...formData,
                    studentId: value,
                });
            }
        } else if (name === 'username') {
            // Limpiar espacios al inicio y final del username mientras el usuario escribe
            setFormData({
                ...formData,
                username: value.trim()
            });
        } else {
            setFormData({
                ...formData,
                [name]: value
            });
        }
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.password !== formData.confirmPassword) {
            toast.error('Las contraseñas no coinciden');
            return;
        }
        
        // Validar longitud de contraseña
        if (formData.password.length < 6) {
            toast.error('La contraseña debe tener al menos 6 caracteres');
            return;
        }
        
        // Validate student ID format
        if (!/^\d{8}$/.test(formData.studentId)) {
            toast.error('ID de estudiante inválido. Debe ser un número de 8 dígitos.');
            return;
        }
        
        // Validate institutional email format
        const expectedEmail = `L${formData.studentId}@tuxtla.tecnm.mx`;
        if (formData.email !== expectedEmail) {
            toast.error('El correo institucional debe coincidir con tu ID de estudiante');
            return;
        }
        
        // Validar que el username no tenga espacios adicionales
        if (formData.username !== formData.username.trim()) {
            toast.error('El nombre de usuario no puede tener espacios al inicio o final');
            return;
        }
        
        try {
            setLoading(true);
            
            const { confirmPassword, ...dataToSend } = formData;
            // Asegurar que el username esté limpio antes de enviar
            dataToSend.username = dataToSend.username.trim();
            
            const response = await axiosInstance.post('/auth/signup', dataToSend);
            
            toast.success(response.data.message || 'Registro exitoso');
            navigate('/iniciar-sesion');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error al registrarse');
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="label">Nombre completo</label>
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                    required
                />
            </div>
            
            <div>
                <label className="label">Nombre de usuario</label>
                <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                    placeholder="Sin espacios al inicio o final"
                    required
                />
            </div>
            
            <div>
                <label className="label">ID de Estudiante (8 dígitos)</label>
                <input
                    type="text"
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                    placeholder="Ejemplo: 23400105"
                    required
                />
            </div>
            
            <div>
                <label className="label">Correo Institucional</label>
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    className="input input-bordered w-full"
                    readOnly
                    required
                />
                <p className="text-xs text-gray-500 mt-1">
                    El correo se genera automáticamente a partir de tu ID de estudiante
                </p>
            </div>
            
            <div>
                <label className="label">Contraseña</label>
                <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`input input-bordered w-full ${passwordError ? 'border-red-500' : ''}`}
                    required
                />
                <p className="text-xs text-gray-500 mt-1">
                    Las contraseñas deben tener al menos 6 caracteres de largo
                </p>
                {passwordError && (
                    <p className="text-xs text-red-500 mt-1">
                        {passwordError}
                    </p>
                )}
            </div>
            
            <div>
                <label className="label">Confirmar Contraseña</label>
                <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`input input-bordered w-full ${confirmPasswordError ? 'border-red-500' : ''}`}
                    required
                />
                {confirmPasswordError && (
                    <p className="text-xs text-red-500 mt-1">
                        {confirmPasswordError}
                    </p>
                )}
            </div>
            
            <button 
                type="submit" 
                className="btn btn-primary w-full"
                disabled={loading || passwordError || confirmPasswordError || formData.password.length < 6}
            >
                {loading ? 'Registrando...' : 'Registrarse'}
            </button>
        </form>
    );
};

export default SignupForm;
