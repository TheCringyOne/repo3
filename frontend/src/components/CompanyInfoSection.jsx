// frontend/src/components/CompanyInfoSection.jsx

import { useState } from "react";
import { Globe, Calendar } from "lucide-react";

// Export this form for reuse in the questionnaire modal
export const CompanyInfoForm = ({ companyInfo, setCompanyInfo, hasWebsite, setHasWebsite }) => {
    return (
        <form className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Nombre de la Empresa</label>
                <input
                    type="text"
                    value={companyInfo.companyName || ''}
                    onChange={(e) => setCompanyInfo({...companyInfo, companyName: e.target.value})}
                    className="mt-1 p-2 w-full border rounded-md"
                />
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
                ></textarea>
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
            
            <div>
                <label className="block text-sm font-medium text-gray-700">Email de Contacto</label>
                <input
                    type="email"
                    value={companyInfo.contactEmail || ''}
                    onChange={(e) => setCompanyInfo({...companyInfo, contactEmail: e.target.value})}
                    className="mt-1 p-2 w-full border rounded-md"
                />
            </div>
            
            <div>
                <label className="block text-sm font-medium text-gray-700">Teléfono de Contacto</label>
                <input
                    type="tel"
                    value={companyInfo.contactPhone || ''}
                    onChange={(e) => setCompanyInfo({...companyInfo, contactPhone: e.target.value})}
                    className="mt-1 p-2 w-full border rounded-md"
                />
            </div>
        </form>
    );
};

const CompanyInfoSection = ({ userData, isOwnProfile, onSave }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [companyInfo, setCompanyInfo] = useState(userData.companyInfo || {});
    const [hasWebsite, setHasWebsite] = useState(!!companyInfo.website);

    const handleSave = () => {
        // If they turned off the website switch, remove the website field
        const dataToSave = { ...companyInfo };
        if (!hasWebsite) {
            dataToSave.website = "";
        }
        
        console.log("CompanyInfoSection - Saving data:", dataToSave);
        onSave({ companyInfo: dataToSave });
        setIsEditing(false);
    };

    // Only render for empresario role
    if (userData.role !== 'empresario') return null;

    return (
        <div className='bg-white shadow rounded-lg p-6 mb-6'>
            <h2 className='text-xl font-semibold mb-4'>Información de la Empresa</h2>
            
            {isEditing ? (
                <>
                    <CompanyInfoForm 
                        companyInfo={companyInfo}
                        setCompanyInfo={setCompanyInfo}
                        hasWebsite={hasWebsite}
                        setHasWebsite={setHasWebsite}
                    />
                    
                    <button
                        type="button"
                        onClick={handleSave}
                        className="mt-4 bg-primary text-white py-2 px-4 rounded hover:bg-primary-dark transition duration-300"
                    >
                        Guardar Información
                    </button>
                </>
            ) : (
                <div className="space-y-4">
                    {companyInfo && companyInfo.companyName ? (
                        <>
                            <div>
                                <h3 className="font-semibold">Nombre:</h3>
                                <p>{companyInfo.companyName}</p>
                            </div>
                            
                            {companyInfo.industry && (
                                <div>
                                    <h3 className="font-semibold">Industria:</h3>
                                    <p>{companyInfo.industry}</p>
                                </div>
                            )}
                            
                            {companyInfo.foundedYear && (
                                <div>
                                    <h3 className="font-semibold">Fundada en:</h3>
                                    <p>{companyInfo.foundedYear}</p>
                                </div>
                            )}
                            
                            {companyInfo.website && (
                                <div>
                                    <h3 className="font-semibold">Sitio Web:</h3>
                                    <div className="flex items-center">
                                        <Globe size={16} className="mr-2 text-primary" />
                                        <a 
                                            href={companyInfo.website.startsWith('http') ? companyInfo.website : `https://${companyInfo.website}`} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="text-primary hover:underline"
                                        >
                                            {companyInfo.website}
                                        </a>
                                    </div>
                                </div>
                            )}
                            
                            {companyInfo.employees && (
                                <div>
                                    <h3 className="font-semibold">Tamaño:</h3>
                                    <p>{companyInfo.employees} empleados</p>
                                </div>
                            )}
                            
                            {companyInfo.description && (
                                <div>
                                    <h3 className="font-semibold">Acerca de la empresa:</h3>
                                    <p>{companyInfo.description}</p>
                                </div>
                            )}
                            
                            {companyInfo.location && (
                                <div>
                                    <h3 className="font-semibold">Ubicación:</h3>
                                    <p>{companyInfo.location}</p>
                                </div>
                            )}
                            
                            {companyInfo.contactEmail && (
                                <div>
                                    <h3 className="font-semibold">Email de contacto:</h3>
                                    <p>{companyInfo.contactEmail}</p>
                                </div>
                            )}
                            
                            {companyInfo.contactPhone && (
                                <div>
                                    <h3 className="font-semibold">Teléfono de contacto:</h3>
                                    <p>{companyInfo.contactPhone}</p>
                                </div>
                            )}
                        </>
                    ) : (
                        <p className="text-gray-500">No hay información de la empresa disponible.</p>
                    )}
                    
                    {isOwnProfile && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="mt-4 text-primary hover:text-primary-dark transition duration-300"
                        >
                            Editar información de la empresa
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default CompanyInfoSection;