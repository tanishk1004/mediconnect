// ===== INIT =====
window.onload = function () {
  initNavScroll();
  initScrollAnimations();
  initCounters();
  loadAppointments();
  setMinDate();
};

// ===== NAVBAR =====
function initNavScroll() {
  window.addEventListener('scroll', () => {
    document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 20);
  });
}

// ===== SCROLL ANIMATIONS =====
function initScrollAnimations() {
  const els = document.querySelectorAll(
    '.pcard, .fcard, .tcard, .sstep, .icard, .hcard'
  );
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => {
          e.target.style.opacity = '1';
          e.target.style.transform = 'translateY(0)';
        }, i * 60);
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });

  els.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(28px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(el);
  });
}

// ===== COUNTERS =====
function initCounters() {
  const targets = [
    { id: 'counter1', end: 12480, suffix: '+' },
    { id: 'counter2', end: 540, suffix: '+' },
    { id: 'counter3', end: 320, suffix: '+' },
    { id: 'counter4', end: 1200, suffix: '+' },
  ];

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const t = targets.find(t => t.id === entry.target.id);
        if (t) animateCounter(entry.target, t.end, t.suffix);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  targets.forEach(t => {
    const el = document.getElementById(t.id);
    if (el) observer.observe(el);
  });
}

function animateCounter(el, end, suffix) {
  let start = 0;
  const duration = 2000;
  const step = end / (duration / 16);
  const timer = setInterval(() => {
    start += step;
    if (start >= end) { start = end; clearInterval(timer); }
    el.textContent = Math.floor(start).toLocaleString() + suffix;
  }, 16);
}

// ===== SYMPTOM CHECKER =====
function toggleSymptom(el) {
  el.classList.toggle('active');
}

function checkSymptoms() {
  const name = document.getElementById('patientName').value.trim();
  const age = document.getElementById('patientAge').value;
  const duration = document.getElementById('duration').value;
  const selected = [...document.querySelectorAll('.stag.active')].map(el => el.textContent);

  if (!name) { showToast('⚠️ Please enter your name.'); return; }
  if (selected.length === 0) { showToast('⚠️ Please select at least one symptom.'); return; }
  if (!duration) { showToast('⚠️ Please select symptom duration.'); return; }

  const result = analyzeSymptoms(selected, age, duration);
  renderResult(name, selected, result);
}

function analyzeSymptoms(symptoms, age, duration) {
  // Rule-based triage engine
  const high = ['Chest Pain', 'Shortness of Breath', 'Blurred Vision'];
  const medium = ['Fever', 'Vomiting', 'Dizziness', 'Abdominal Pain'];

  const hasHigh = symptoms.some(s => high.includes(s));
  const hasMedium = symptoms.some(s => medium.includes(s));
  const isLong = duration === 'month';
  const isElderly = parseInt(age) > 60;

  if (hasHigh || (isElderly && hasMedium)) {
    return {
      urgency: 'high',
      label: '🚨 High Urgency',
      title: 'Seek Immediate Medical Attention',
      description: 'Your symptoms suggest a potentially serious condition that requires prompt medical evaluation. Do not delay.',
      conditions: getPossibleConditions(symptoms, 'high'),
      advice: 'Visit the nearest emergency room or call emergency services immediately.',
      color: 'high'
    };
  } else if (hasMedium || isLong || symptoms.length >= 4) {
    return {
      urgency: 'medium',
      label: '⚠️ Moderate Urgency',
      title: 'Consult a Doctor Soon',
      description: 'Your symptoms indicate a condition that should be evaluated by a doctor within 24–48 hours.',
      conditions: getPossibleConditions(symptoms, 'medium'),
      advice: 'Book a telemedicine consultation today. Monitor symptoms closely.',
      color: 'medium'
    };
  } else {
    return {
      urgency: 'low',
      label: '✅ Low Urgency',
      title: 'Monitor & Rest',
      description: 'Your symptoms appear mild. Rest, stay hydrated, and monitor for any worsening.',
      conditions: getPossibleConditions(symptoms, 'low'),
      advice: 'If symptoms persist beyond 3 days or worsen, consult a doctor.',
      color: 'low'
    };
  }
}

function getPossibleConditions(symptoms, urgency) {
  const map = {
    'Fever': ['Viral Infection', 'Flu', 'Malaria', 'Typhoid'],
    'Headache': ['Tension Headache', 'Migraine', 'Hypertension'],
    'Cough': ['Common Cold', 'Bronchitis', 'Asthma', 'COVID-19'],
    'Chest Pain': ['Angina', 'Heart Attack', 'Pulmonary Embolism', 'GERD'],
    'Shortness of Breath': ['Asthma', 'Heart Failure', 'Pneumonia', 'Anxiety'],
    'Fatigue': ['Anemia', 'Diabetes', 'Thyroid Disorder', 'Depression'],
    'Nausea': ['Gastritis', 'Food Poisoning', 'Pregnancy', 'Migraine'],
    'Vomiting': ['Gastroenteritis', 'Food Poisoning', 'Appendicitis'],
    'Dizziness': ['Vertigo', 'Low Blood Pressure', 'Anemia', 'Dehydration'],
    'Abdominal Pain': ['Gastritis', 'Appendicitis', 'IBS', 'Kidney Stones'],
    'Back Pain': ['Muscle Strain', 'Herniated Disc', 'Kidney Infection'],
    'Joint Pain': ['Arthritis', 'Gout', 'Lupus', 'Viral Infection'],
    'Rash': ['Allergy', 'Eczema', 'Chickenpox', 'Contact Dermatitis'],
    'Sore Throat': ['Strep Throat', 'Tonsillitis', 'Common Cold'],
    'Runny Nose': ['Common Cold', 'Allergic Rhinitis', 'Sinusitis'],
    'Blurred Vision': ['Hypertension', 'Diabetes', 'Glaucoma', 'Migraine'],
  };

  const conditions = new Set();
  symptoms.forEach(s => {
    if (map[s]) map[s].slice(0, 2).forEach(c => conditions.add(c));
  });
  return [...conditions].slice(0, 4);
}

function renderResult(name, symptoms, result) {
  const container = document.getElementById('symptomResult');
  container.innerHTML = `
    <div class="result-card ${result.color}">
      <div class="result-urgency urgency-${result.urgency}">${result.label}</div>
      <h4>Hello ${name}, here's your assessment:</h4>
      <p><strong>Symptoms reported:</strong> ${symptoms.join(', ')}</p>
      <p style="margin-top:10px;">${result.description}</p>
      ${result.conditions.length > 0 ? `
        <p style="margin-top:12px;"><strong>Possible conditions to discuss with your doctor:</strong></p>
        <ul>${result.conditions.map(c => `<li>${c}</li>`).join('')}</ul>
      ` : ''}
      <p style="margin-top:14px; font-weight:600; color:#374151;">
        <i class="fas fa-info-circle"></i> ${result.advice}
      </p>
      <button class="btn-primary" style="margin-top:16px; width:100%; justify-content:center;" onclick="document.getElementById('appointment').scrollIntoView({behavior:'smooth'})">
        <i class="fas fa-calendar-plus"></i> Book a Doctor Now
      </button>
    </div>
    <p style="font-size:0.75rem; color:#94a3b8; margin-top:12px; text-align:center;">
      ⚠️ This is an AI-assisted triage tool, not a medical diagnosis. Always consult a qualified doctor.
    </p>
  `;
}

// ===== APPOINTMENT BOOKING =====
function setMinDate() {
  const today = new Date().toISOString().split('T')[0];
  const dateInput = document.getElementById('apptDate');
  if (dateInput) dateInput.min = today;
}

function bookAppointment() {
  const name = document.getElementById('apptName').value.trim();
  const phone = document.getElementById('apptPhone').value.trim();
  const spec = document.getElementById('apptSpec').value;
  const type = document.getElementById('apptType').value;
  const date = document.getElementById('apptDate').value;
  const time = document.getElementById('apptTime').value;
  const desc = document.getElementById('apptDesc').value.trim();

  if (!name || !phone || !spec || !type || !date || !time) {
    showToast('⚠️ Please fill all required fields.');
    return;
  }

  const appt = { name, phone, spec, type, date, time, desc, id: Date.now() };
  saveAppointment(appt);
  renderAppointment(appt);
  clearForm();
  showToast(`✅ Appointment booked for ${name}!`);

  // Scroll to list
  document.getElementById('appointmentList').scrollIntoView({ behavior: 'smooth' });
}

function renderAppointment(appt) {
  const list = document.getElementById('appointmentList');
  const noAppt = list.querySelector('.no-appt');
  if (noAppt) noAppt.remove();

  const badgeClass = appt.type === 'video' ? 'badge-video' : appt.type === 'chat' ? 'badge-chat' : 'badge-clinic';
  const typeLabel = appt.type === 'video' ? '📹 Video Call' : appt.type === 'chat' ? '💬 Chat' : '🏥 In-Clinic';

  const div = document.createElement('div');
  div.className = 'appt-item';
  div.dataset.id = appt.id;
  div.innerHTML = `
    <h4>${appt.name} — ${appt.spec}</h4>
    <p>📅 ${formatDate(appt.date)} at ${appt.time}</p>
    <p>📞 ${appt.phone}</p>
    ${appt.desc ? `<p style="margin-top:4px; font-style:italic; color:#94a3b8;">"${appt.desc}"</p>` : ''}
    <span class="appt-badge ${badgeClass}">${typeLabel}</span>
  `;
  list.appendChild(div);
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

function clearForm() {
  ['apptName', 'apptPhone', 'apptSpec', 'apptType', 'apptDate', 'apptTime', 'apptDesc']
    .forEach(id => { document.getElementById(id).value = ''; });
}

function clearAppointments() {
  if (!confirm('Clear all appointments?')) return;
  localStorage.removeItem('mediconnect_appointments');
  document.getElementById('appointmentList').innerHTML =
    '<div class="no-appt"><i class="fas fa-calendar"></i><p>No appointments yet</p></div>';
  showToast('🗑 Appointments cleared.');
}

// ===== LOCAL STORAGE =====
function saveAppointment(appt) {
  const list = JSON.parse(localStorage.getItem('mediconnect_appointments') || '[]');
  list.push(appt);
  localStorage.setItem('mediconnect_appointments', JSON.stringify(list));
}

function loadAppointments() {
  const list = JSON.parse(localStorage.getItem('mediconnect_appointments') || '[]');
  if (list.length > 0) {
    document.getElementById('appointmentList').innerHTML = '';
    list.forEach(a => renderAppointment(a));
  }
}

// ===== TOAST =====
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3200);
}
