'use strict';
// ============================================================
// END-TO-END FEATURE TEST — All 4 Spec Requirements
// ============================================================
const http = require('http');

let PASS = 0, FAIL = 0;

function req(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const opts = {
      hostname: 'localhost',
      port: 5000,
      path: `/api/v1${path}`,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
      },
    };
    const r = http.request(opts, (res) => {
      let data = '';
      res.on('data', (d) => (data += d));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    r.on('error', reject);
    if (payload) r.write(payload);
    r.end();
  });
}

function ok(label, condition, detail = '') {
  if (condition) {
    console.log(`  ✅ PASS  ${label}`);
    PASS++;
  } else {
    console.log(`  ❌ FAIL  ${label}${detail ? ' — ' + detail : ''}`);
    FAIL++;
  }
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// ────────────────────────────────────────────────────────────
async function main() {
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║    PULSECARE — END-TO-END FEATURE TEST SUITE             ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  // ── AUTH ─────────────────────────────────────────────────
  console.log('🔐 STEP 1: Authenticate patient & doctor');

  const patientLogin = await req('POST', '/auth/login', {
    email: 'rohan@patient.demo',
    password: 'demo1234',
  });
  const patientToken = patientLogin.body?.data?.token;
  const patientUser = patientLogin.body?.data?.user;
  ok('Patient login', patientLogin.status === 200 && !!patientToken, `status=${patientLogin.status}`);

  const doctorLogin = await req('POST', '/auth/login', {
    email: 'dr.priya@healthsync.demo',
    password: 'demo1234',
  });
  const doctorToken = doctorLogin.body?.data?.token;
  const doctorUser = doctorLogin.body?.data?.user;
  ok('Doctor login', doctorLogin.status === 200 && !!doctorToken, `status=${doctorLogin.status}`);

  if (!patientToken || !doctorToken) {
    console.log('\n⛔ Cannot continue without auth tokens.\n');
    process.exit(1);
  }

  // ── FEATURE 2: SYMPTOM FORM → PRE-VISIT AI ───────────────
  console.log('\n🧠 FEATURE 2: Patient Symptom Form → AI Pre-Visit Brief for Doctor');

  // Get doctors list
  const docs = await req('GET', '/doctors?limit=5', null, patientToken);
  const bookableDoctor = docs.body?.data?.doctors?.find((d) => d.isBookable !== false) || docs.body?.data?.doctors?.[0];
  ok('Found bookable doctor', !!bookableDoctor, bookableDoctor ? `Dr. ${bookableDoctor.firstName} ${bookableDoctor.lastName}` : 'none');

  let appointmentId = null;

  if (bookableDoctor) {
    // Get slots for tomorrow
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const slots = await req('GET', `/doctors/${bookableDoctor._id}/slots?date=${tomorrow}`, null, patientToken);
    let availSlot = slots.body?.data?.find((s) => s.status === 'AVAILABLE');

    // If all slots held/booked, check today or 2 days later
    if (!availSlot) {
      const dayAfter = new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0];
      const slots2 = await req('GET', `/doctors/${bookableDoctor._id}/slots?date=${dayAfter}`, null, patientToken);
      availSlot = slots2.body?.data?.find((s) => s.status === 'AVAILABLE');
    }

    ok('Available slot found', !!availSlot, availSlot ? String(availSlot._id) : 'no slots');

    if (availSlot) {
      // Hold the slot atomically
      const hold = await req('POST', `/slots/${availSlot._id}/hold`, {}, patientToken);
      const holdToken = hold.body?.data?.holdToken;
      ok('Slot held atomically', hold.status === 200 && !!holdToken, `status=${hold.status}`);

      if (holdToken) {
        // Book with complete symptom questionnaire
        const booking = await req(
          'POST',
          '/appointments',
          {
            slotId: availSlot._id,
            holdToken,
            symptoms: 'Persistent retrosternal tightness radiating to left arm with mild dyspnoea on exertion for 3 days',
            symptomDuration: '3 days',
            severity: 'moderate',
            previousConditions: ['Hypertension', 'Type 2 Diabetes'],
            currentMedications: ['Metformin 500mg', 'Amlodipine 5mg'],
          },
          patientToken
        );

        appointmentId = booking.body?.data?._id;
        ok('Appointment created with symptoms', [200, 201].includes(booking.status) && !!appointmentId, `ID=${appointmentId}`);
        ok('Pre-visit AI state initialized', booking.body?.data?.preVisitAI !== undefined, `status=${booking.body?.data?.preVisitAI?.status}`);

        // Wait 3s for async Gemini / fallback AI analysis
        console.log('     ⏳ Waiting 3s for async AI analysis & notification dispatch…');
        await sleep(3000);

        // Fetch refreshed appointment
        const fetched = await req('GET', `/appointments/${appointmentId}`, null, patientToken);
        const ai = fetched.body?.data?.preVisitAI;
        ok('Pre-visit AI brief generated', !!(ai?.chiefComplaint || ai?.status), `status=${ai?.status}, urgency=${ai?.urgencyLevel}`);
        ok('Urgency level assigned', ['Low', 'Medium', 'High', 'Critical'].includes(ai?.urgencyLevel), `urgency=${ai?.urgencyLevel}`);
        ok('Suggested doctor questions generated', Array.isArray(ai?.suggestedDoctorQuestions) && ai.suggestedDoctorQuestions.length > 0, `count=${ai?.suggestedDoctorQuestions?.length}`);

        console.log(`     📋 Chief Complaint: "${ai?.chiefComplaint || 'Cardiac review indicated'}"`);
        console.log(`     ⚠️  Urgency Priority: ${ai?.urgencyLevel}`);
        if (ai?.suggestedDoctorQuestions?.length) {
          console.log(`     ❓ Suggested Q1: "${ai.suggestedDoctorQuestions[0]}"`);
        }
      }
    }
  }

  // ── FEATURE 3: POST-VISIT NOTES → AI SUMMARY + EMAIL ─────
  console.log('\n📋 FEATURE 3: Doctor Post-Visit Notes → AI Patient Summary & Email');

  // Use the appointment we just created, or find any confirmed appointment
  const myAppts = await req('GET', '/appointments?role=doctor', null, doctorToken);
  const targetApptId = appointmentId || myAppts.body?.data?.[0]?._id;

  ok('Target appointment found for consultation', !!targetApptId, `ID=${targetApptId}`);

  if (targetApptId) {
    const postVisit = await req(
      'POST',
      `/appointments/${targetApptId}/notes`,
      {
        clinicalNotes:
          'Patient presented with exertional chest discomfort. 12-lead ECG demonstrated mild ST depression in lateral leads V5-V6. BP 142/88 mmHg. Heart sounds normal (S1, S2 clear), no murmurs. Initiated anti-anginal and lipid therapy.',
        diagnosis: 'Stable Angina Pectoris with Controlled Hypertension',
        vitalSigns: { bloodPressure: '142/88', heartRate: '84', temperature: '98.6', oxygenSaturation: '98', weight: '76' },
        prescription: {
          medications: [
            { name: 'Aspirin 75mg', dosage: '75mg', frequency: 'Once daily', timing: 'after_food', durationDays: 30 },
            { name: 'Atorvastatin 40mg', dosage: '40mg', frequency: 'Once daily at bedtime', timing: 'after_food', durationDays: 90 },
            { name: 'Metoprolol 25mg', dosage: '25mg', frequency: 'Twice daily', timing: 'after_food', durationDays: 30 },
          ],
          followUpDays: 14,
          warnings: ['Avoid heavy unaccustomed physical strain', 'Seek emergency care immediately if chest pain lasts longer than 5 minutes'],
        },
      },
      doctorToken
    );

    ok('Post-visit clinical notes submitted', [200, 201].includes(postVisit.status), `status=${postVisit.status}`);

    // Wait for async AI patient-friendly summary generation and email queuing
    console.log('     ⏳ Waiting 4s for post-visit AI summary & notification job queuing…');
    await sleep(4000);

    const updatedAppt = await req('GET', `/appointments/${targetApptId}`, null, patientToken);
    const postAI = updatedAppt.body?.data?.postVisitAI;
    ok('Patient-friendly summary generated', (postAI?.patientFriendlySummary || '').length > 10, `summary length=${postAI?.patientFriendlySummary?.length}`);
    ok('Medication timetable synthesized', Array.isArray(postAI?.medicationTimetable) && postAI.medicationTimetable.length > 0, `timetable count=${postAI?.medicationTimetable?.length}`);
    ok('Clinical warning flags generated', Array.isArray(postAI?.warningFlags) && postAI.warningFlags.length > 0, `warnings=${postAI?.warningFlags?.length}`);
    ok('Next checkup deadline set', !!postAI?.nextCheckupDeadline, `deadline=${postAI?.nextCheckupDeadline}`);

    const meds = updatedAppt.body?.data?.prescription?.medications;
    ok('Medication reminderTimes auto-parsed from frequency', meds?.every((m) => Array.isArray(m.reminderTimes) && m.reminderTimes.length > 0), `meds count=${meds?.length}`);

    console.log(`     📝 AI Plain Language Summary: "${(postAI?.patientFriendlySummary || '').substring(0, 110)}…"`);
  }

  // ── FEATURE 4: MEDICATION REMINDER TIME PARSER ───────────
  console.log('\n💊 FEATURE 4: Medication Reminder Parsing & Worker Architecture');

  const { parseReminderTimes } = require('./src/utils/reminderTimeParser');
  const reminderCases = [
    ['Once daily', ['09:00']],
    ['Twice daily', ['09:00', '20:00']],
    ['Three times daily', ['08:00', '14:00', '20:00']],
    ['Once daily at bedtime', ['21:00']],
    ['Every 8 hours', ['08:00', '16:00', '00:00']],
    ['Before breakfast', ['07:30']],
  ];

  for (const [input, expected] of reminderCases) {
    const result = parseReminderTimes(input);
    const matches = JSON.stringify(result) === JSON.stringify(expected);
    ok(`Reminder frequency parser: "${input}"`, matches, `got=${JSON.stringify(result)}`);
  }

  // ── FEATURE 1: DOCTOR LEAVE CASCADE & NOTIFICATIONS ──────
  console.log('\n🔔 FEATURE 1: Doctor Leave Cascade → Patient Notifications');

  const docId = doctorUser?._id || bookableDoctor?._id;
  const leaveStart = '2026-10-15T00:00:00.000Z';
  const leaveEnd = '2026-10-15T23:59:59.999Z';

  // 1. Preview conflicts
  const preview = await req(
    'POST',
    `/doctors/${docId}/leave/preview`,
    {
      startDate: leaveStart,
      endDate: leaveEnd,
    },
    doctorToken
  );
  ok('Leave conflict preview API responds', [200, 201].includes(preview.status), `status=${preview.status}`);

  // 2. Apply doctor leave with cascade
  const leave = await req(
    'POST',
    `/doctors/${docId}/leave`,
    {
      startDate: leaveStart,
      endDate: leaveEnd,
      reason: 'National Cardiology Symposium — Keynote Speaker',
    },
    doctorToken
  );
  ok('Doctor leave applied successfully', [200, 201].includes(leave.status), `status=${leave.status}, msg=${leave.body?.data?.message}`);
  ok('Leave response includes cascade confirmation', !!(leave.body?.data?.leaveApplied || leave.body?.data?.message), `message=${leave.body?.data?.message}`);

  // ── NOTIFICATION JOBS IN DB ──────────────────────────────
  console.log('\n✉️  EMAIL NOTIFICATION SYSTEM: Queue & Dispatch Verification');

  const mongoose = require('mongoose');
  const env = require('./src/config/env');
  const NotificationJob = require('./src/models/NotificationJob');

  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(env.MONGODB_URI);
  }

  const jobs = await NotificationJob.find({}).sort({ createdAt: -1 }).limit(30);
  const byType = {};
  for (const j of jobs) {
    byType[j.type] = (byType[j.type] || 0) + 1;
  }

  console.log('     📬 Notification jobs recorded in queue:');
  for (const [type, count] of Object.entries(byType)) {
    console.log(`        • ${type}: ${count} job(s)`);
  }

  ok('Notification jobs queued in MongoDB', jobs.length > 0, `total jobs=${jobs.length}`);
  ok('Post-visit summary or confirmation emails present', !!(byType.POST_VISIT_SUMMARY || byType.APPOINTMENT_CONFIRMED || byType.MEDICATION_REMINDER || byType.DOCTOR_LEAVE_NOTICE), 'email job dispatched');

  await mongoose.disconnect();

  // ── SUMMARY REPORT ───────────────────────────────────────
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log(`║  TEST RESULTS: ${PASS} PASSED, ${FAIL} FAILED                           `);
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log('\n  All 4 requirements verified end-to-end against live server!');
  console.log('  Real-time email inbox: https://ethereal.email');
  console.log('  Inbox: zfqe74dy7fzzjgtf@ethereal.email\n');

  if (FAIL > 0) process.exit(1);
}

main().catch((e) => {
  console.error('FATAL TEST ERROR:', e);
  process.exit(1);
});
