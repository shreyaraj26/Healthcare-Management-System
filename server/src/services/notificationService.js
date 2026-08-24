// ============================================================
// SERVICE — Notification (Email + Queue Management)
// ============================================================
'use strict';

const nodemailer = require('nodemailer');
const NotificationJob = require('../models/NotificationJob');
const { JOB_TYPE, JOB_STATUS } = require('../models/NotificationJob');
const env = require('../config/env');
const logger = require('../utils/logger');

// ── Transporter (lazy init) ───────────────────────────────────
let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  if (!env.SMTP_HOST || !env.SMTP_USER) {
    // Console-logger fallback: pretty-print emails in development
    transporter = {
      sendMail: async (opts) => {
        logger.info('[Email:CONSOLE_MOCK] ─────────────────────────────────');
        logger.info(`  To:      ${opts.to}`);
        logger.info(`  Subject: ${opts.subject}`);
        logger.info(`  Body:    ${opts.html?.substring(0, 200)}...`);
        logger.info('[Email:CONSOLE_MOCK] ─────────────────────────────────');
        return { messageId: `mock-${Date.now()}` };
      },
    };
    logger.warn('[NotificationService] SMTP not configured — using console logger for emails.');
  } else {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    });
    logger.info('[NotificationService] SMTP transporter initialised.');
  }

  return transporter;
};

/**
 * Send an email directly (used by retry worker)
 */
const sendEmail = async ({ to, subject, html }) => {
  const mailer = getTransporter();
  const result = await mailer.sendMail({
    from: `"${env.EMAIL_FROM_NAME}" <${env.EMAIL_FROM_ADDRESS}>`,
    to,
    subject,
    html,
  });
  return result;
};

/**
 * Queue a notification job for async delivery
 */
const queueNotification = async ({
  type,
  recipientId,
  recipientEmail,
  subject,
  htmlBody,
  appointmentId = null,
  scheduledAt = new Date(),
  metadata = {},
}) => {
  const job = await NotificationJob.create({
    type,
    recipientId,
    recipientEmail,
    subject,
    htmlBody,
    appointmentId,
    scheduledAt,
    metadata,
    status: JOB_STATUS.QUEUED,
    nextRetryAt: scheduledAt,
  });
  logger.debug(`[NotificationService] Queued ${type} for ${recipientEmail} (job: ${job._id})`);
  return job;
};

// ── Email Templates ───────────────────────────────────────────

const templates = {
  appointmentConfirmed: ({ patientName, doctorName, specialization, scheduledAt, appointmentId }) => ({
    subject: `✅ Appointment Confirmed — Dr. ${doctorName}`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #14b8a6, #0891b2); padding: 32px 40px;">
          <h1 style="margin: 0; color: white; font-size: 24px;">HealthSync</h1>
          <p style="margin: 8px 0 0; color: rgba(255,255,255,0.85); font-size: 14px;">Your health, our priority</p>
        </div>
        <div style="padding: 36px 40px;">
          <h2 style="color: #10b981; margin-top: 0;">Appointment Confirmed! 🎉</h2>
          <p>Dear <strong>${patientName}</strong>,</p>
          <p>Your appointment has been successfully booked. Here are your details:</p>
          <div style="background: #1e293b; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #14b8a6;">
            <p style="margin: 8px 0;"><strong>Doctor:</strong> Dr. ${doctorName} (${specialization})</p>
            <p style="margin: 8px 0;"><strong>Date & Time:</strong> ${new Date(scheduledAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'full', timeStyle: 'short' })}</p>
            <p style="margin: 8px 0;"><strong>Reference ID:</strong> ${appointmentId}</p>
          </div>
          <p style="color: #94a3b8; font-size: 13px;">Please arrive 10 minutes early. Bring any previous medical records or reports.</p>
        </div>
        <div style="padding: 20px 40px; background: #0f172a; border-top: 1px solid #1e293b; text-align: center; color: #64748b; font-size: 12px;">
          <p>HealthSync Platform · Secure Healthcare Management</p>
        </div>
      </div>
    `,
  }),

  doctorLeaveNotice: ({ patientName, doctorName, originalDate, rescheduleToken, rescheduleLink }) => ({
    subject: `⚠️ Appointment Cancelled — Dr. ${doctorName} is on Leave`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #ef4444, #dc2626); padding: 32px 40px;">
          <h1 style="margin: 0; color: white; font-size: 24px;">HealthSync</h1>
        </div>
        <div style="padding: 36px 40px;">
          <h2 style="color: #f59e0b; margin-top: 0;">Important: Appointment Update</h2>
          <p>Dear <strong>${patientName}</strong>,</p>
          <p>We regret to inform you that your appointment with <strong>Dr. ${doctorName}</strong> on <strong>${new Date(originalDate).toLocaleDateString('en-IN')}</strong> has been cancelled due to the doctor being on scheduled leave.</p>
          <div style="background: #1e293b; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <p style="margin: 0 0 12px;"><strong>Priority Rescheduling Available</strong></p>
            <p style="margin: 0; color: #94a3b8; font-size: 14px;">You have been given priority access to reschedule with another doctor or a later date.</p>
          </div>
          <a href="${rescheduleLink}" style="display: inline-block; background: linear-gradient(135deg, #14b8a6, #0891b2); color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 8px;">
            Reschedule Now (Priority Access)
          </a>
          <p style="color: #94a3b8; font-size: 12px; margin-top: 16px;">This rescheduling link is valid for 7 days.</p>
        </div>
      </div>
    `,
  }),

  medicationReminder: ({ patientName, medicationName, dosage, instructions, time }) => ({
    subject: `💊 Medication Reminder — ${medicationName} at ${time}`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #14b8a6, #10b981); padding: 32px 40px;">
          <h1 style="margin: 0; color: white; font-size: 24px;">💊 Medication Reminder</h1>
        </div>
        <div style="padding: 36px 40px;">
          <p>Hi <strong>${patientName}</strong>,</p>
          <p>This is a reminder to take your medication:</p>
          <div style="background: #1e293b; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #10b981;">
            <p style="margin: 8px 0; font-size: 18px;"><strong>${medicationName}</strong> — ${dosage}</p>
            <p style="margin: 8px 0; color: #94a3b8;">${instructions}</p>
            <p style="margin: 8px 0;"><strong>Time:</strong> ${time}</p>
          </div>
          <p style="color: #94a3b8; font-size: 13px;">Stay consistent with your medication schedule for optimal recovery.</p>
        </div>
      </div>
    `,
  }),

  postVisitSummary: ({ patientName, doctorName, diagnosis, aiSummary, medications, warningFlags, nextCheckup, appointmentId }) => ({
    subject: `📋 Your Post-Visit Health Summary — Dr. ${doctorName}`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #0f2942 0%, #0284c7 100%); padding: 32px 40px;">
          <h1 style="margin: 0; color: white; font-size: 22px;">PulseCare Healthcare Platform</h1>
          <p style="margin: 8px 0 0; color: rgba(255,255,255,0.8); font-size: 13px;">Post-Visit Clinical Summary</p>
        </div>

        <div style="padding: 36px 40px;">
          <h2 style="color: #38bdf8; margin-top: 0;">Your Visit Summary 📋</h2>
          <p>Dear <strong>${patientName}</strong>,</p>
          <p>Your consultation with <strong>Dr. ${doctorName}</strong> is now complete. Here is a summary of your visit in simple language:</p>

          <!-- Diagnosis -->
          <div style="background: #1e293b; border-radius: 10px; padding: 18px 22px; margin: 20px 0; border-left: 4px solid #0284c7;">
            <p style="margin: 0 0 6px; font-size: 12px; color: #94a3b8; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">Diagnosis</p>
            <p style="margin: 0; font-size: 16px; font-weight: 700; color: #f0f9ff;">${diagnosis || 'Clinical evaluation completed'}</p>
          </div>

          <!-- AI Health Summary -->
          <div style="background: #1e293b; border-radius: 10px; padding: 18px 22px; margin: 20px 0; border-left: 4px solid #14b8a6;">
            <p style="margin: 0 0 8px; font-size: 12px; color: #94a3b8; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">🤖 AI Health Summary (Plain Language)</p>
            <p style="margin: 0; line-height: 1.7; color: #e2e8f0;">${aiSummary || 'Your doctor has completed the consultation and issued a prescription. Please follow the medication schedule carefully.'}</p>
          </div>

          <!-- Medication Timetable -->
          ${medications && medications.length > 0 ? `
          <div style="margin: 24px 0;">
            <p style="font-weight: 700; margin-bottom: 12px; color: #f0f9ff;">💊 Your Medication Schedule</p>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background: #1e293b;">
                  <th style="padding: 10px 14px; text-align: left; font-size: 12px; color: #94a3b8; border-bottom: 1px solid #334155;">Medicine</th>
                  <th style="padding: 10px 14px; text-align: left; font-size: 12px; color: #94a3b8; border-bottom: 1px solid #334155;">Dose</th>
                  <th style="padding: 10px 14px; text-align: left; font-size: 12px; color: #94a3b8; border-bottom: 1px solid #334155;">Frequency</th>
                  <th style="padding: 10px 14px; text-align: left; font-size: 12px; color: #94a3b8; border-bottom: 1px solid #334155;">When</th>
                </tr>
              </thead>
              <tbody>
                ${medications.map((m, i) => `
                <tr style="background: ${i % 2 === 0 ? '#0f172a' : '#1e293b'};">
                  <td style="padding: 10px 14px; font-weight: 700; color: #e2e8f0; border-bottom: 1px solid #1e293b;">${m.name}</td>
                  <td style="padding: 10px 14px; color: #94a3b8; border-bottom: 1px solid #1e293b;">${m.dosage || '—'}</td>
                  <td style="padding: 10px 14px; color: #94a3b8; border-bottom: 1px solid #1e293b;">${m.frequency || '—'}</td>
                  <td style="padding: 10px 14px; color: #10b981; font-weight: 600; border-bottom: 1px solid #1e293b;">${m.timing === 'after_food' ? 'After Meals' : m.timing === 'before_food' ? 'Before Meals' : m.timing === 'with_food' ? 'With Meals' : 'As Directed'}</td>
                </tr>`).join('')}
              </tbody>
            </table>
            <p style="font-size: 11px; color: #64748b; margin-top: 8px;">⏰ You will receive medication reminder emails at the scheduled times above.</p>
          </div>
          ` : ''}

          <!-- Warning Flags -->
          ${warningFlags && warningFlags.length > 0 ? `
          <div style="background: #422006; border: 1px solid #d97706; border-radius: 10px; padding: 16px 20px; margin: 20px 0;">
            <p style="margin: 0 0 8px; font-weight: 700; color: #fbbf24; font-size: 13px;">⚠️ Important Instructions</p>
            ${warningFlags.map(f => `<p style="margin: 4px 0; color: #fde68a; font-size: 13px;">• ${f}</p>`).join('')}
          </div>
          ` : ''}

          <!-- Next Checkup -->
          ${nextCheckup ? `
          <div style="background: #1e293b; border-radius: 8px; padding: 14px 18px; margin: 16px 0; display: inline-flex; align-items: center; gap: 10px;">
            <span style="font-size: 20px;">📅</span>
            <div>
              <p style="margin: 0; font-size: 12px; color: #94a3b8;">Follow-up / Next Checkup</p>
              <p style="margin: 2px 0 0; font-weight: 700; color: #38bdf8;">${nextCheckup}</p>
            </div>
          </div>
          ` : ''}

          <p style="color: #94a3b8; font-size: 13px; margin-top: 24px;">Reference ID: <code style="color: #64748b;">${appointmentId}</code></p>
          <p style="color: #94a3b8; font-size: 13px;">If your symptoms worsen or you have questions, contact the hospital helpline immediately.</p>
        </div>

        <div style="padding: 20px 40px; background: #0f172a; border-top: 1px solid #1e293b; text-align: center; color: #64748b; font-size: 12px;">
          <p>PulseCare Healthcare Platform · Secure Clinical Management</p>
          <p style="margin: 4px 0 0;">This is an automated clinical summary. Please do not reply to this email.</p>
        </div>
      </div>
    `,
  }),
};

module.exports = { sendEmail, queueNotification, templates, JOB_TYPE };
