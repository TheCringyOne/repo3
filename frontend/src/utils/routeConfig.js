// frontend/src/utils/routeConfig.js
export const routeMap = {
  // Mapeo exacto de rutas internas a rutas en español
  "/": "/inicio",
  "/login": "/iniciar-sesion",
  "/signup": "/registrarse",
  "/notifications": "/notificaciones",
  "/network": "/contactos",
  "/projects": "/proyectos",
  "/announcements": "/anuncios",
  "/jobs": "/trabajos",
  "/post": "/publicacion",
  "/profile": "/perfil",
  "/admin": "/administrador"
};

// Para convertir rutas internas a rutas públicas en español
export const getPublicPath = (internalPath) => {
  // Para paths exactos
  if (routeMap[internalPath]) {
    return routeMap[internalPath];
  }
  
  // Para rutas parametrizadas
  for (const [internal, publicPath] of Object.entries(routeMap)) {
    if (internalPath.startsWith(internal + '/')) {
      return internalPath.replace(internal, publicPath);
    }
  }
  
  return internalPath;
};

// Para convertir rutas en español a rutas internas (para el enrutador)
export const getInternalPath = (publicPath) => {
  // Invierte el mapeo para la búsqueda
  const reversedMap = Object.entries(routeMap).reduce((acc, [internal, publicRoute]) => {
    acc[publicRoute] = internal;
    return acc;
  }, {});
  
  // Para paths exactos
  if (reversedMap[publicPath]) {
    return reversedMap[publicPath];
  }
  
  // Para rutas parametrizadas
  for (const [publicRoute, internal] of Object.entries(reversedMap)) {
    if (publicPath.startsWith(publicRoute + '/')) {
      return publicPath.replace(publicRoute, internal);
    }
  }
  
  return publicPath;
};