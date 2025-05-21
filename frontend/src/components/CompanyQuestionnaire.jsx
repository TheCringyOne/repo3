// frontend/src/components/CompanyQuestionnaire.jsx
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '../lib/axios';
import { CompanyInfoForm } from './CompanyInfoSection';
import toast from 'react-hot-toast';
import { ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';

// This component handles the multi-step questionnaire logic and can be used
// either directly or within another component like QuestionnaireModal
const CompanyQuestionnaire = ({ 
  initialData = {}, 
  onComplete, 
  onCancel,
  showSkip = true,
  containerClassName = "" 
}) => {
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [companyInfo, setCompanyInfo] = useState(initialData || {});
  const [hasWebsite, setHasWebsite] = useState(!!initialData?.website);
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
    onSuccess: (response) => {
      toast.success('¡Información de la empresa guardada exitosamente!');
      
      // Update user data in the cache
      queryClient.invalidateQueries(['authUser']);
      
      // Reset state and call completion handler
      setIsSubmitting(false);
      if (onComplete) {
        onComplete(response.data);
      }
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

  return (
    <div className={containerClassName}>
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
          
          {/* Reuse the company info form for the rest of the fields */}
          <CompanyInfoForm 
            companyInfo={companyInfo}
            setCompanyInfo={setCompanyInfo}
            hasWebsite={hasWebsite}
            setHasWebsite={setHasWebsite}
          />
        </div>
      )}
      
      {/* Action buttons */}
      <div className="mt-6 pt-4 border-t flex justify-between items-center">
        {step === 1 ? (
          <button
            onClick={showSkip ? handleSkip : onCancel}
            className="text-gray-500 hover:text-gray-700"
            disabled={isSubmitting}
          >
            {showSkip ? "Omitir por ahora" : "Cancelar"}
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
  );
};

export default CompanyQuestionnaire;