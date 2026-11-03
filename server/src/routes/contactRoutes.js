const express = require('express');
const rateLimit = require('express-rate-limit');
const nodemailer = require('nodemailer');
const Contact = require('../models/Contact');
const { getDatabaseStatus, inMemoryStore } = require('../config/db');

const router = express.Router();

/**
 * Rate Limiter: max 5 contact submissions per hour per IP
 */
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many messages sent from this IP, please try again in an hour.',
  },
});

/**
 * Strips HTML tags and excessive whitespace
 */
function sanitizeInput(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/<[^>]*>?/gm, '').trim();
}

/**
 * Optional email dispatcher using nodemailer
 */
async function sendNotificationEmail(contactData) {
  const { SMTP_HOST, SMTP_USER, SMTP_PASS, CONTACT_TO_EMAIL } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !CONTACT_TO_EMAIL) {
    // Nodemailer not configured - skip silently
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"FitNova Contact" <${SMTP_USER}>`,
      to: CONTACT_TO_EMAIL,
      subject: `[FitNova] ${contactData.topic}: ${contactData.name}`,
      text: `Name: ${contactData.name}\nEmail: ${contactData.email}\nTopic: ${contactData.topic}\n\nMessage:\n${contactData.message}`,
      html: `
        <h3>New Contact Form Submission</h3>
        <p><strong>Name:</strong> ${contactData.name}</p>
        <p><strong>Email:</strong> ${contactData.email}</p>
        <p><strong>Topic:</strong> ${contactData.topic}</p>
        <p><strong>Message:</strong></p>
        <div style="background: #f4f4f4; padding: 12px; border-radius: 6px;">
          ${contactData.message.replace(/\n/g, '<br />')}
        </div>
      `,
    });
  } catch (emailErr) {
    console.warn('Failed to send contact notification email:', emailErr.message);
  }
}

/**
 * POST /api/contact
 * Handles contact form submissions with sanitization, validation, honeypot check, and optional email
 */
router.post('/', contactLimiter, async (req, res, next) => {
  try {
    const { name, email, topic, message, honeypot } = req.body;

    // 1. Honeypot check - reject silently if bot filled hidden field
    if (honeypot && String(honeypot).trim() !== '') {
      return res.status(200).json({ success: true, message: 'Message received' });
    }

    // 2. Sanitize inputs
    const cleanName = sanitizeInput(name);
    const cleanEmail = sanitizeInput(email).toLowerCase();
    const cleanTopic = sanitizeInput(topic);
    const cleanMessage = sanitizeInput(message);

    // 3. Validate inputs
    if (!cleanName || cleanName.length < 2 || cleanName.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Name is required and must be between 2 and 100 characters.',
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail) || cleanEmail.length > 150) {
      return res.status(400).json({
        success: false,
        message: 'A valid email address is required.',
      });
    }

    const allowedTopics = ['Feedback', 'Bug report', 'Feature request', 'Other'];
    if (!cleanTopic || !allowedTopics.includes(cleanTopic)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid topic selected. Must be Feedback, Bug report, Feature request, or Other.',
      });
    }

    if (!cleanMessage || cleanMessage.length < 10 || cleanMessage.length > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Message must be between 10 and 1000 characters.',
      });
    }

    const contactPayload = {
      name: cleanName,
      email: cleanEmail,
      topic: cleanTopic,
      message: cleanMessage,
      createdAt: new Date().toISOString(),
    };

    // 4. Save to Database or in-memory fallback
    if (getDatabaseStatus()) {
      await Contact.create({
        name: cleanName,
        email: cleanEmail,
        topic: cleanTopic,
        message: cleanMessage,
      });
    } else {
      inMemoryStore.contacts.push({
        id: `contact-${Date.now()}`,
        ...contactPayload,
      });
    }

    // 5. Trigger optional email notification asynchronously
    sendNotificationEmail(contactPayload);

    return res.status(200).json({
      success: true,
      message: 'Thanks, we got your message!',
    });
  } catch (err) {
    return next(err);
  }
});

// GET /api/contact is NOT public: return 404
router.get('/', (req, res) => {
  res.status(404).json({ success: false, message: 'Resource not found' });
});

module.exports = router;
