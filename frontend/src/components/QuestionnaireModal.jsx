// frontend/src/components/QuestionnaireModal.jsx
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';
import { Briefcase, CheckCircle, ArrowRight, ArrowLeft, Globe, Calendar } from 'lucide-react';

const QuestionnaireModal = ({ isOpen, onClose, user }) => {
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [companyInfo, setCompanyInfo] = useState(user?.companyInfo || {});
  const [hasWebsite, setHasWebsite] = useState(!!user?.companyInfo?.website);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if required fields for the current step are filled
  const canProceed = () => {
    if (step === 1) {
      return !!companyInfo.companyName;
    }
    return true;
  };

  // Mutation to save company info and mark first login as completed
  const { mutate: completeSetup } = useMutation({
    mutationFn: async () => {
      // If website toggle is off, remove website field
      const dataToSubmit = { ...companyInfo };
      if (!hasWebsite) {
        dataToSubmit.website = "";
      }
      
      return axiosInstance.put('/users/complete-first-login', {
        companyInfo: dataToSubmit
      });
    },
    onSuccess: () => {
      toast.success('¡Información de la empresa guardada exitosamente!');
      
      // Update user data in the cache
      queryClient.invalidateQueries(['authUser']);
      
      // Close modal and reset state
      setIsSubmitting(false);
      if (onClose) onClose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al guardar la información');
      setIsSubmitting(false);
    }
  });

  const handleSubmit = () => {
    setIsSubmitting(true);
    completeSetup();
  };

  const handleSkip = () => {
    if (window.confirm('¿Estás seguro de que deseas omitir el cuestionario? La información de tu empresa no estará completa.')) {
      setIsSubmitting(true);
      completeSetup();
    }
  };

  // Don't render anything if the modal isn't open
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-primary text-white px-6 py-4 flex justify-between items-center rounded-t-lg">
          <div className="flex items-center">
            <Briefcase className="mr-2" />
            <h2 className="text-xl font-bold">Configuración de Información de Empresa</h2>
          </div>
        </div>
        
        {/* Body */}
        <div className="p-6">
          {/* Progress indicator */}
          <div className="mb-6 flex justify-between items-center">
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 1 ? 'bg-primary text-white' : 'bg-gray-200'
              }`}>
                1
              </div>
              <div className={`h-1 w-12 ${step >= 2 ? 'bg-primary' : 'bg-gray-200'}`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 2 ? 'bg-primary text-white' : 'bg-gray-200'
              }`}>
                2
              </div>
            </div>
            <div>
              Paso {step} de 2
            </div>
          </div>
          
          {/* Step content */}
          {step === 1 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Información Básica de la Empresa</h3>
              <p className="text-gray-600 mb-4">
                Como usuario empresario, necesitamos algunos detalles sobre su negocio para mostrar en su perfil.
                Esta información ayudará a los egresados a conocer mejor su empresa.
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nombre de la Empresa *</label>
                  <input
                    type="text"
                    value={companyInfo.companyName || ''}
                    onChange={(e) => setCompanyInfo({...companyInfo, companyName: e.target.value})}
                    className="mt-1 p-2 w-full border rounded-md"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Campo obligatorio</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Industria</label>
                  <input
                    type="text"
                    value={companyInfo.industry || ''}
                    onChange={(e) => setCompanyInfo({...companyInfo, industry: e.target.value})}
                    className="mt-1 p-2 w-full border rounded-md"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Año de Fundación</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      min="1900"
                      max={new Date().getFullYear()}
                      value={companyInfo.foundedYear || ''}
                      onChange={(e) => setCompanyInfo({...companyInfo, foundedYear: e.target.value})}
                      className="mt-1 p-2 pl-10 w-full border rounded-md"
                      placeholder={new Date().getFullYear()}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Ubicación</label>
                  <input
                    type="text"
                    value={companyInfo.location || ''}
                    onChange={(e) => setCompanyInfo({...companyInfo, location: e.target.value})}
                    className="mt-1 p-2 w-full border rounded-md"
                  />
                </div>
              </div>
            </div>
          )}
          
          {step === 2 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Detalles Adicionales</h3>
              <p className="text-gray-600 mb-4">
                Proporcione información adicional que ayude a presentar mejor su empresa a los egresados.
              </p>
              
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">Sitio Web</label>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-500 mr-2">
                        {hasWebsite ? "Activado" : "Desactivado"}
                      </span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={hasWebsite}
                          onChange={(e) => setHasWebsite(e.target.checked)}
                          className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                  {hasWebsite && (
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Globe className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="url"
                        value={companyInfo.website || ''}
                        onChange={(e) => setCompanyInfo({...companyInfo, website: e.target.value})}
                        className="mt-1 p-2 pl-10 w-full border rounded-md"
                        placeholder="https://"
                      />
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Cantidad de Empleados</label>
                  <select
                    value={companyInfo.employees || ''}
                    onChange={(e) => setCompanyInfo({...companyInfo, employees: e.target.value})}
                    className="mt-1 p-2 w-full border rounded-md"
                  >
                    <option value="">Seleccionar</option>
                    <option value="1-10">1-10 empleados</option>
                    <option value="11-50">11-50 empleados</option>
                    <option value="51-200">51-200 empleados</option>
                    <option value="201-500">201-500 empleados</option>
                    <option value="501+">501+ empleados</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Descripción</label>
                  <textarea
                    value={companyInfo.description || ''}
                    onChange={(e) => setCompanyInfo({...companyInfo, description: e.target.value})}
                    rows="4"
                    className="mt-1 p-2 w-full border rounded-md"
                    placeholder="Describa brevemente su empresa, actividades y misión..."
                  ></textarea>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email de Contacto</label>
                  <input
                    type="email"
                    value={companyInfo.contactEmail || ''}
                    onChange={(e) => setCompanyInfo({...companyInfo, contactEmail: e.target.value})}
                    className="mt-1 p-2 w-full border rounded-md"
                    placeholder="contacto@empresa.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Teléfono de Contacto</label>
                  <input
                    type="tel"
                    value={companyInfo.contactPhone || ''}
                    onChange={(e) => setCompanyInfo({...companyInfo, contactPhone: e.target.value})}
                    className="mt-1 p-2 w-full border rounded-md"
                    placeholder="+52 (123) 456-7890"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 flex justify-between items-center rounded-b-lg">
          {step === 1 ? (
            <button
              onClick={handleSkip}
              className="text-gray-500 hover:text-gray-700"
              disabled={isSubmitting}
            >
              Omitir por ahora
            </button>
          ) : (
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center text-gray-700 hover:text-gray-900"
              disabled={isSubmitting}
            >
              <ArrowLeft size={16} className="mr-1" />
              Anterior
            </button>
          )}
          
          {step < 2 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed() || isSubmitting}
              className={`flex items-center bg-primary text-white px-4 py-2 rounded-md ${
                !canProceed() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary-dark'
              }`}
            >
              Siguiente
              <ArrowRight size={16} className="ml-1" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Guardando...
                </>
              ) : (
                <>
                  <CheckCircle size={16} className="mr-1" />
                  Completar Configuración
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionnaireModal;