// frontend/src/components/CustomLink.jsx
import { Link, useNavigate } from 'react-router-dom';
import { getPublicPath } from '../utils/routeConfig';

const CustomLink = ({ to, children, ...props }) => {
  const navigate = useNavigate();
  
  // Convertir la ruta interna a la versión en español para mostrarla al usuario
  const publicPath = getPublicPath(to);
  
  const handleClick = (e) => {
    e.preventDefault();
    navigate(publicPath);
    
    // Si hay un manejador de clic original, llamarlo
    if (props.onClick) {
      props.onClick(e);
    }
  };
  
  return (
    <Link 
      to={publicPath} 
      {...props} 
      onClick={handleClick}
    >
      {children}
    </Link>
  );
};

export default CustomLink;