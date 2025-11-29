import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private resend: Resend | null = null;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;

    if (apiKey && apiKey !== 'your-resend-api-key') {
      this.resend = new Resend(apiKey);
      this.logger.log('Resend initialized successfully');
    } else {
      this.logger.warn('Resend API key not configured - emails will not be sent');
    }
  }

  async sendPasswordResetEmail(
    to: string,
    firstName: string,
    resetToken: string,
  ): Promise<void> {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
    const fromName = process.env.RESEND_FROM_NAME || 'Mundo de Niños';

    const textContent = `
Hola ${firstName},

Has solicitado restablecer tu contraseña en Mundo de Niños.

Para crear una nueva contraseña, haz clic en el siguiente enlace:
${resetUrl}

Este enlace expirará en 1 hora por seguridad.

Si no solicitaste este cambio, puedes ignorar este mensaje.

Saludos,
Equipo de Mundo de Niños
    `.trim();

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Recuperación de Contraseña</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">🌟 Mundo de Niños</h1>
  </div>

  <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
    <h2 style="color: #333; margin-top: 0;">Recuperación de Contraseña</h2>

    <p>Hola <strong>${firstName}</strong>,</p>

    <p>Has solicitado restablecer tu contraseña en Mundo de Niños.</p>

    <p>Para crear una nueva contraseña, haz clic en el siguiente botón:</p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetUrl}"
         style="background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
        Restablecer Contraseña
      </a>
    </div>

    <p style="color: #666; font-size: 14px;">
      O copia y pega este enlace en tu navegador:<br>
      <a href="${resetUrl}" style="color: #3b82f6; word-break: break-all;">${resetUrl}</a>
    </p>

    <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0; color: #856404; font-size: 14px;">
        ⚠️ Este enlace expirará en <strong>1 hora</strong> por seguridad.
      </p>
    </div>

    <p style="color: #666; font-size: 14px;">
      Si no solicitaste este cambio, puedes ignorar este mensaje de forma segura.
    </p>

    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

    <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
      Este es un correo automático, por favor no respondas a este mensaje.<br>
      © ${new Date().getFullYear()} Mundo de Niños - Sistema de Gestión de Centro Lúdico
    </p>
  </div>
</body>
</html>
    `.trim();

    try {
      if (!this.resend) {
        // En desarrollo sin Resend configurado, solo loguear
        this.logger.warn('Resend not configured. Email would be sent to:', to);
        this.logger.log('Reset URL:', resetUrl);
        return;
      }

      await this.resend.emails.send({
        from: `${fromName} <${fromEmail}>`,
        to,
        subject: 'Recuperación de Contraseña - Mundo de Niños',
        text: textContent,
        html: htmlContent,
      });

      this.logger.log(`Password reset email sent to: ${to}`);
    } catch (error) {
      this.logger.error('Error sending password reset email:', error);

      // En desarrollo, no fallar si el email no se puede enviar
      if (process.env.NODE_ENV === 'development') {
        this.logger.warn('Development mode: Email sending failed but continuing...');
        this.logger.log('Reset URL:', resetUrl);
        return;
      }

      throw new Error('Failed to send password reset email');
    }
  }

  async sendParentInvitationEmail(
    to: string,
    firstName: string,
    studentName: string,
    resetToken: string,
  ): Promise<void> {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const setupPasswordUrl = `${frontendUrl}/reset-password?token=${resetToken}`;
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
    const fromName = process.env.RESEND_FROM_NAME || 'Mundo de Niños';

    const textContent = `
Hola ${firstName},

¡Bienvenido a Mundo de Niños!

Tu hijo/a ${studentName} ha sido registrado/a en nuestro centro lúdico.

Una cuenta ha sido creada para ti con el correo: ${to}

Para completar tu registro y crear tu contraseña, haz clic en el siguiente enlace:
${setupPasswordUrl}

Este enlace expirará en 24 horas por seguridad.

Con tu cuenta podrás:
- Ver información de tus hijos
- Consultar asistencias y actividades diarias
- Comunicarte con los maestros
- Ver el calendario de eventos

Saludos,
Equipo de Mundo de Niños
    `.trim();

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invitación a Mundo de Niños</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">🌟 Mundo de Niños</h1>
  </div>

  <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
    <h2 style="color: #333; margin-top: 0;">¡Bienvenido a Mundo de Niños!</h2>

    <p>Hola <strong>${firstName}</strong>,</p>

    <p>¡Bienvenido! Tu hijo/a <strong>${studentName}</strong> ha sido registrado/a en nuestro centro lúdico.</p>

    <div style="background: #e0f2fe; border-left: 4px solid #0284c7; padding: 12px; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0; color: #0369a1; font-size: 14px;">
        📧 Se ha creado una cuenta para ti con el correo: <strong>${to}</strong>
      </p>
    </div>

    <p>Para completar tu registro y crear tu contraseña personalizada, haz clic en el siguiente botón:</p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${setupPasswordUrl}"
         style="background: #22c55e; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
        Crear Mi Contraseña
      </a>
    </div>

    <p style="color: #666; font-size: 14px;">
      O copia y pega este enlace en tu navegador:<br>
      <a href="${setupPasswordUrl}" style="color: #3b82f6; word-break: break-all;">${setupPasswordUrl}</a>
    </p>

    <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0; color: #856404; font-size: 14px;">
        ⚠️ Este enlace expirará en <strong>24 horas</strong> por seguridad.
      </p>
    </div>

    <h3 style="color: #333; margin-top: 30px;">¿Qué podrás hacer con tu cuenta?</h3>
    <ul style="color: #555; padding-left: 20px;">
      <li>Ver información y fotos de tus hijos</li>
      <li>Consultar asistencias y actividades diarias</li>
      <li>Comunicarte en tiempo real con los maestros</li>
      <li>Ver el calendario de eventos del centro</li>
      <li>Recibir notificaciones importantes</li>
    </ul>

    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

    <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
      Este es un correo automático, por favor no respondas a este mensaje.<br>
      © ${new Date().getFullYear()} Mundo de Niños - Sistema de Gestión de Centro Lúdico
    </p>
  </div>
</body>
</html>
    `.trim();

    try {
      if (!this.resend) {
        this.logger.warn('Resend not configured. Parent invitation email would be sent to:', to);
        this.logger.log('Setup password URL:', setupPasswordUrl);
        return;
      }

      await this.resend.emails.send({
        from: `${fromName} <${fromEmail}>`,
        to,
        subject: '¡Bienvenido a Mundo de Niños! - Configura tu contraseña',
        text: textContent,
        html: htmlContent,
      });

      this.logger.log(`Parent invitation email sent to: ${to}`);
    } catch (error) {
      this.logger.error('Error sending parent invitation email:', error);

      // En desarrollo, no fallar si el email no se puede enviar
      if (process.env.NODE_ENV === 'development') {
        this.logger.warn('Development mode: Email sending failed but continuing...');
        this.logger.log('Setup password URL:', setupPasswordUrl);
        return;
      }

      throw new Error('Failed to send parent invitation email');
    }
  }

  async sendWelcomeEmail(to: string, firstName: string): Promise<void> {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
    const fromName = process.env.RESEND_FROM_NAME || 'Mundo de Niños';

    const textContent = `
Hola ${firstName},

¡Bienvenido a Mundo de Niños!

Tu cuenta ha sido creada exitosamente. Ahora puedes acceder a nuestra plataforma en:
${frontendUrl}

Gracias por unirte a nuestra comunidad.

Saludos,
Equipo de Mundo de Niños
    `.trim();

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bienvenido</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">🌟 Mundo de Niños</h1>
  </div>

  <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
    <h2 style="color: #333; margin-top: 0;">¡Bienvenido!</h2>

    <p>Hola <strong>${firstName}</strong>,</p>

    <p>¡Bienvenido a Mundo de Niños! Tu cuenta ha sido creada exitosamente.</p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${frontendUrl}"
         style="background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
        Acceder a la Plataforma
      </a>
    </div>

    <p>Gracias por unirte a nuestra comunidad.</p>

    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

    <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
      Este es un correo automático, por favor no respondas a este mensaje.<br>
      © ${new Date().getFullYear()} Mundo de Niños - Sistema de Gestión de Centro Lúdico
    </p>
  </div>
</body>
</html>
    `.trim();

    try {
      if (!this.resend) {
        this.logger.warn('Resend not configured. Welcome email would be sent to:', to);
        return;
      }

      await this.resend.emails.send({
        from: `${fromName} <${fromEmail}>`,
        to,
        subject: 'Bienvenido a Mundo de Niños',
        text: textContent,
        html: htmlContent,
      });

      this.logger.log(`Welcome email sent to: ${to}`);
    } catch (error) {
      this.logger.error('Error sending welcome email:', error);
      // No fallar el registro si el email no se puede enviar
      this.logger.warn('Continuing despite email sending failure...');
    }
  }
}
