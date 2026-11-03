/**
 * Fonction serveur Vercel : POST /api/contact
 *
 * 1. Enregistre le message dans Django (visible dans l'espace admin ; Django applique aussi l'anti-spam).
 * 2. Envoie l'email à l'agence par le SMTP de g-immobusiness.com.
 *
 * L'email part d'ici et non de Django : le compte gratuit PythonAnywhere bloque les serveurs SMTP externes.
 * Les identifiants SMTP sont dans les variables d'environnement Vercel (jamais de préfixe VITE_ :
 * elles seraient visibles dans le navigateur).
 */
import nodemailer from 'nodemailer';

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'https://fusioncreate.pythonanywhere.com/api';
const BACKEND_ORIGIN = BACKEND_API_URL.replace(/\/api\/?$/, '');
const SUCCESS_MESSAGE = 'Votre message a bien été transmis. Notre équipe vous recontactera sous 24 heures.';

interface ContactPayload {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

function json(body: unknown, status = 200): Response {
  return Response.json(body, { status });
}

function readPayload(body: unknown): ContactPayload | string {
  const b = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>;
  const field = (key: string, max: number) => (typeof b[key] === 'string' ? (b[key] as string).trim().slice(0, max) : '');
  const payload = {
    name: field('name', 150),
    email: field('email', 254),
    phone: field('phone', 50),
    subject: field('subject', 200),
    message: field('message', 5000),
  };
  if (!payload.name || !payload.email || !payload.message) return 'Nom, email et message sont obligatoires.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) return 'Adresse email invalide.';
  return payload;
}

/** Enregistre le message dans Django. Renvoie l'id créé, une réponse d'erreur à transmettre, ou null si Django est injoignable. */
async function saveInBackend(payload: ContactPayload, clientIp: string): Promise<{ id?: number; error?: Response } | null> {
  try {
    const response = await fetch(`${BACKEND_API_URL}/contact/`, {
      method: 'POST',
      // IP du visiteur : l'anti-spam de Django (5 messages / heure) compte par visiteur, pas pour tout Vercel
      headers: { 'Content-Type': 'application/json', 'X-Forwarded-For': clientIp },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10_000),
    });
    if (response.status === 429) {
      return { error: json({ success: false, message: 'Trop de messages envoyés. Veuillez réessayer dans une heure.' }, 429) };
    }
    if (response.status === 400) {
      return { error: json(await response.json().catch(() => ({ message: 'Formulaire invalide.' })), 400) };
    }
    if (!response.ok) {
      console.error(`Django a répondu ${response.status} à l'enregistrement du message de contact.`);
      return null;
    }
    const created = (await response.json().catch(() => ({}))) as { id?: number };
    return { id: created.id };
  } catch (error) {
    console.error('Django injoignable pour enregistrer le message de contact :', error);
    return null;
  }
}

async function sendEmail(payload: ContactPayload, backendId?: number): Promise<void> {
  const recipients = (process.env.CONTACT_RECIPIENTS || '').split(',').map((r) => r.trim()).filter(Boolean);
  if (!process.env.SMTP_HOST || recipients.length === 0) {
    throw new Error('SMTP_HOST ou CONTACT_RECIPIENTS non configuré dans Vercel.');
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 465),
    secure: (process.env.SMTP_SECURE || 'true').toLowerCase() === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
    connectionTimeout: 10_000,
  });

  const receivedAt = new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Kinshasa', dateStyle: 'short', timeStyle: 'short' });
  const lines = [
    'Nouveau message reçu depuis le formulaire de contact du site G Business Immo.',
    '',
    `Nom : ${payload.name}`,
    `Email : ${payload.email}`,
    `Téléphone : ${payload.phone || 'Non renseigné'}`,
    `Objet : ${payload.subject || 'Sans objet'}`,
    `Reçu le : ${receivedAt} (heure de Kinshasa)`,
    '',
    'Message :',
    payload.message,
    '',
    '—',
    'Répondez directement à cet email pour écrire au client.',
  ];
  if (backendId) lines.push(`Voir dans l'administration : ${BACKEND_ORIGIN}/admin/properties/contactmessage/${backendId}/change/`);

  await transporter.sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to: recipients,
    replyTo: payload.email,
    subject: `Nouveau message du site : ${payload.subject || 'Sans objet'} — ${payload.name}`,
    text: lines.join('\n'),
  });
}

export async function POST(request: Request): Promise<Response> {
  const payload = readPayload(await request.json().catch(() => null));
  if (typeof payload === 'string') return json({ success: false, message: payload }, 400);

  const clientIp = (request.headers.get('x-forwarded-for') || '').split(',')[0].trim();
  const saved = await saveInBackend(payload, clientIp);
  if (saved?.error) return saved.error;

  try {
    await sendEmail(payload, saved?.id);
  } catch (error) {
    console.error("Échec de l'envoi de l'email de contact :", error);
    // Enregistré dans Django : l'agence le verra dans l'espace admin, le visiteur n'a pas à réessayer
    if (saved) return json({ success: true, message: SUCCESS_MESSAGE });
    return json({ success: false, message: "Votre message n'a pas pu être envoyé. Veuillez réessayer ou nous appeler." }, 502);
  }

  return json({ success: true, message: SUCCESS_MESSAGE });
}
