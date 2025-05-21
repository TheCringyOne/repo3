export function createWelcomeEmailTemplate(name, profileUrl, role = 'egresado') {
  let roleSpecificText = '';
  let additionalInfo = '';

  if (role === 'empresario') {
    roleSpecificText = "Como empresario, podrá conectarse con egresados, publicar ofertas de trabajo y dar a conocer su empresa.";
    additionalInfo = `
      <div style="background-color: #f3f6f8; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0077B5;">
        <p style="font-size: 16px; margin: 0; color: #0077B5;"><strong>¡Importante!</strong></p>
        <p style="margin-top: 10px;">La primera vez que inicie sesión, aparecerá un cuestionario para completar la información de su empresa. Esta información se mostrará en su perfil y ayudará a los egresados a conocer mejor su negocio.</p>
      </div>
    `;
  } else if (role === 'administrador') {
    roleSpecificText = "Como administrador, podrá gestionar usuarios y supervisar la plataforma.";
  } else {
    roleSpecificText = "Explore conexiones para su carrera profesional.";
  }
      
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bienvenidos egresados ittg</title>
  </head>
  <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(to right, #0077B5, #00A0DC); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
      <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTSzFs7zNiYDWu_iddeOkErqpLlx16wvAxmhQ&s.svg" alt="tec Logo" style="width: 150px; margin-bottom: 20px;border-radius: 10px;">
      <h1 style="color: white; margin: 0; font-size: 28px;">Bienvenido a egresados ittg</h1>
    </div>
    <div style="background-color: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
      <p style="font-size: 18px; color: #0077B5;"><strong>Hola ${name},</strong></p>
      <p>${roleSpecificText}</p>
      ${additionalInfo}
      <div style="background-color: #f3f6f8; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="font-size: 16px; margin: 0;"><strong>Puedes iniciar con:</strong></p>
        <ul style="padding-left: 20px;">
          <li>Editar tu perfil</li>
          <li>Buscar contactos que te interesen</li>
        </ul>
      </div>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${profileUrl}" style="background-color: #0077B5; color: white; padding: 14px 28px; text-decoration: none; border-radius: 30px; font-weight: bold; font-size: 16px; transition: background-color 0.3s;">Edita tu perfil</a>
      </div>
      <p>Puedes contactarnos para cualquier pregunta que necesites.</p>
      <p>Atentamente<br>Departamento de egresados</p>
    </div>
  </body>
  </html>
  `;
}

export const createConnectionAcceptedEmailTemplate = (senderName, recipientName, profileUrl) => `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Conexión exitosa</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(to right, #0077B5, #00A0DC); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
  <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTSzFs7zNiYDWu_iddeOkErqpLlx16wvAxmhQ&s.jpg" alt="logo_tec" style="width: 150px; margin-bottom: 20px;border-radius: 10px;"/>
  <h1 style="color: white; margin: 0; font-size: 28px;">Alguien se ha conectado contigo</h1>
</div>
<div style="background-color: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
  <p style="font-size: 18px; color: #0077B5;"><strong>Hola ${senderName},</strong></p>
  <p>El usuario<strong>${recipientName}</strong> acepto tu solicitud de conexión.</p>
  <div style="background-color: #f3f6f8; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <p style="font-size: 16px; margin: 0;"><strong>Que sigue</strong></p>
    <ul style="padding-left: 20px;">
      <li>Mira el perfil de ${recipientName}</li>
      <li>Checa sus posts</li>
      <li>Busca intereses comunes</li>
    </ul>
  </div>
  <div style="text-align: center; margin: 30px 0;">
    <a href="${profileUrl}" style="background-color: #0077B5; color: white; padding: 14px 28px; text-decoration: none; border-radius: 30px; font-weight: bold; font-size: 16px; transition: background-color 0.3s;">Puedes ver el perfil de ${recipientName}</a>
  </div>
  <p>Busca más contactos laborales</p>
  <p>Atentamente,<br>Departamento de egresados</p>
</div>
</body>
</html>
`;

export const createCommentNotificationEmailTemplate = (recipientName, commenterName, postUrl, commentContent) => `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Nuevo comentario en tu post</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(to right, #0077B5, #00A0DC); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
  <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTSzFs7zNiYDWu_iddeOkErqpLlx16wvAxmhQ&s.jpg" alt="Logo tec" style="width: 150px; margin-bottom: 20px;border-radius: 10px;"/>
  <h1 style="color: white; margin: 0; font-size: 28px;">Nuevo comentario en tu post</h1>
</div>
<div style="background-color: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
  <p style="font-size: 18px; color: #0077B5;"><strong>Hola ${recipientName},</strong></p>
  <p>${commenterName} Comento en tu post:</p>
  <div style="background-color: #f3f6f8; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <p style="font-style: italic; margin: 0;">"${commentContent}"</p>
  </div>
  <div style="text-align: center; margin: 30px 0;">
    <a href=${postUrl} style="background-color: #0077B5; color: white; padding: 14px 28px; text-decoration: none; border-radius: 30px; font-weight: bold; font-size: 16px; transition: background-color 0.3s;">View Comment</a>
  </div>
  <p>Mantente conectado respondiendo a sus comentarios.</p>
  <p>Atentamente.<br>Departamento de egresados</p>
</div>
</body>
</html>
`;