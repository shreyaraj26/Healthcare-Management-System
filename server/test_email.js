const nodemailer = require('nodemailer');

const transport = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  secure: false,
  auth: { user: 'zfqe74dy7fzzjgtf@ethereal.email', pass: 'hYjRbuHk2zsGv8w8y5' }
});

transport.sendMail({
  from: '"PulseCare Healthcare" <zfqe74dy7fzzjgtf@ethereal.email>',
  to: 'zfqe74dy7fzzjgtf@ethereal.email',
  subject: 'TEST: Appointment Confirmation — Dr. Rakesh Sharma',
  html: `
    <div style="font-family:Arial;padding:30px;background:#0f172a;color:#e2e8f0;border-radius:12px;max-width:600px;margin:0 auto">
      <div style="background:linear-gradient(135deg,#14b8a6,#0891b2);padding:28px 32px;border-radius:10px 10px 0 0;margin:-30px -30px 24px">
        <h1 style="margin:0;color:white;font-size:22px">PulseCare Healthcare Platform</h1>
        <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:13px">Your health, our priority</p>
      </div>
      <h2 style="color:#10b981;margin-top:0">Appointment Confirmed! 🎉</h2>
      <p>Dear <strong>Shreya Raj</strong>,</p>
      <p>Your appointment has been successfully booked. Here are your full details:</p>
      <div style="background:#1e293b;padding:20px 24px;border-radius:10px;border-left:4px solid #14b8a6;margin:20px 0">
        <p style="margin:8px 0"><strong>🩺 Doctor:</strong> Dr. Rakesh Sharma (Cardiologist)</p>
        <p style="margin:8px 0"><strong>📅 Date &amp; Time:</strong> Tuesday, 26 August 2026, 10:30 AM IST</p>
        <p style="margin:8px 0"><strong>📍 Location:</strong> PulseCare Hospital, OPD Block B, Room 214</p>
        <p style="margin:8px 0"><strong>🔖 Reference ID:</strong> APT-TEST-001</p>
        <p style="margin:8px 0"><strong>💬 Reported Symptoms:</strong> Chest tightness, shortness of breath on exertion</p>
      </div>
      <p style="background:#1e293b;padding:14px 18px;border-radius:8px;font-size:13px;color:#94a3b8">
        ⏰ <strong>Reminders:</strong> You will receive an automated reminder 24 hours and 2 hours before your appointment.
      </p>
      <p style="color:#94a3b8;font-size:13px">Please arrive 10 minutes early. Bring any previous medical records or investigation reports.</p>
      <div style="text-align:center;margin-top:28px;padding-top:20px;border-top:1px solid #1e293b;color:#64748b;font-size:12px">
        PulseCare Healthcare Platform · Secure Clinical Management
      </div>
    </div>
  `
}).then(info => {
  console.log('SUCCESS — Message ID:', info.messageId);
  console.log('VIEW EMAIL HERE:', nodemailer.getTestMessageUrl(info));
}).catch(e => {
  console.error('SMTP ERROR:', e.message);
});
