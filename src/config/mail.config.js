const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "pruebaproyectoswi@gmail.com",
    pass: "jacyavbtzdcrwdtp",
  },
  tls: {
    rejectUnauthorized: false,
  },
  logger: true,
  debug: true,
});



const sendEmail = async(email, subject,html)=>{
    try{
      await transporter.sendMail({
        from: `"NEER" <pruebaproyectoswi@gmail.com>`,
        to: email, 
        subject, 
        text: "Hola, correo de prueba", 
        html, 
      });
      
    }catch(error){
    console.log('Error al enviar el corre', error)
    }

}
const getTemplate = (nombre, token)=>{
   return `
   <head>
      <link rel ="stylesheet" href="./style.css">
   </head>
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; padding: 20px;">
      <h2>Correo de prueba para ${nombre}</h2>
      <p>Para confirmar tu correo entra al siguiente enlace</p>
      <a
      href="${process.env.URL_API}/usuario/confirmarUsuario/${token}"
      >Confirmar cuenta</a>
   </div>
   `;
}

const getPasswordResetTemplate = (nombre, token) => {
  return `
  <div id="email__content">
     <h2>Hola ${nombre},</h2>
     <p>Has solicitado restablecer tu contraseña. Para hacerlo, haz clic en el siguiente enlace:</p>
     <a href="${process.env.URL_API}/reset-password?token=${token}">Restablecer contraseña</a>
     <p>Este enlace expirará en 1 hora.</p>
  </div>
  `;
}

const getReactivationEmailTemplate = (nombre, codigo) => {
  return `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; padding: 20px;">
    <h2 style="color: #2a7ae4;">Hola ${nombre},</h2>
    <p>Recibimos una solicitud para <strong>reactivar tu cuenta</strong>.</p>
    <p>Tu código de reactivación es:</p>
    <div style="text-align: center; margin: 20px 0;">
      <span style="display: inline-block; font-size: 24px; letter-spacing: 4px; background-color: #f0f0f0; padding: 10px 20px; border-radius: 6px; font-weight: bold; color: #333;">
        ${codigo}
      </span>
    </div>
    <p>Este código expira en <strong>10 minutos</strong>.</p>
    <p style="margin-top: 30px;">Si no solicitaste esta acción, puedes ignorar este correo.</p>
    <hr style="margin: 40px 0; border: none; border-top: 1px solid #eee;">
    <p style="font-size: 12px; color: #888;">NEER | Sistema de promociones</p>
  </div>
  `;
};


module.exports={
    sendEmail,
    getTemplate,
    getPasswordResetTemplate,
    getReactivationEmailTemplate
}

