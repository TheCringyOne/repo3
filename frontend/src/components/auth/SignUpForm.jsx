import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const SignupForm = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        email: '',
        studentId: '', // New field
        password: '',
        confirmPassword: ''
    });
    
    const [loading, setLoading] = useState(false);
    
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
            } else {
                setFormData({
                    ...formData,
                    studentId: value,
                });
            }
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
        
        try {
            setLoading(true);
            
            const { confirmPassword, ...dataToSend } = formData;
            
			const response = await axios.post('http://localhost:5000/api/v1/auth/signup', dataToSend);
            
            toast.success(response.data.message || 'Registro exitoso');
            navigate('/login');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error al registrarse');
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Existing name and username fields */}
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
                    required
                />
            </div>
            
            {/* New student ID field */}
            <div>
                <label className="label">ID de Estudiante (8 dígitos)</label>
                <input
                    type="text"
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                    placeholder="Ejemplo: 20270806"
                    required
                />
            </div>
            
            {/* Auto-generated email field (read-only) */}
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
            
            {/* Password fields */}
            <div>
                <label className="label">Contraseña</label>
                <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                    required
                    minLength={6}
                />
            </div>
            
            <div>
                <label className="label">Confirmar Contraseña</label>
                <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                    required
                    minLength={6}
                />
            </div>
            
            <button 
                type="submit" 
                className="btn btn-primary w-full"
                disabled={loading}
            >
                {loading ? 'Registrando...' : 'Registrarse'}
            </button>
        </form>
    );
};

export default SignupForm;