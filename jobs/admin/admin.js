import { db, auth } from '/jobs/firebase-jobs.js';
import { ref, push, set, update, remove, onValue, get } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-database.js";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";

// ── STATE ─────────────────────────────────────────────────
let currentJobs = [];
let listenerActive = false;

// ── FORM ELEMENTS ─────────────────────────────────────────
const form         = document.getElementById('jobForm');
const fTitle       = document.getElementById('fTitle');
const fDesc        = document.getElementById('fDesc');
const fCategory    = document.getElementById('fCategory');
const fIsGov       = document.getElementById('fIsGov');
const fIsPrivate   = document.getElementById('fIsPrivate');
const fCity        = document.getElementById('fCity');
const fDeadline    = document.getElementById('fDeadline');
const fApplyLink   = document.getElementById('fApplyLink');
const fImageUrl    = document.getElementById('fImageUrl');
const fImageFile   = document.getElementById('fImageFile');
const editIdEl     = document.getElementById('editId');
const formTitle    = document.getElementById('formTitle');
const saveBtn      = document.getElementById('saveBtn');
const cancelBtn    = document.getElementById('cancelBtn');
const imagePreview = document.getElementById('imagePreview');

// ── AUTH STATE ────────────────────────────────────────────
onAuthStateChanged(auth, (user) => {
  if (user) {
    document.getElementById('loginOverlay').classList.add('hidden');
    document.getElementById('adminUserEmail').textContent = user.email;
    if (!listenerActive) {
      listenerActive = true;
      setupJobsListener();
      purgeExpiredJobs();
    }
  } else {
    document.getElementById('loginOverlay').classList.remove('hidden');
  }
});

// ── LOGIN ─────────────────────────────────────────────────
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email    = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const errorEl  = document.getElementById('loginError');
  const btn      = document.getElementById('loginBtn');

  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in…';
  errorEl.textContent = '';

  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch {
    errorEl.textContent = 'Invalid email or password. Please try again.';
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign In';
  }
});

document.getElementById('signOutBtn').addEventListener('click', () => signOut(auth));

// ── FIREBASE JOBS LISTENER ────────────────────────────────
function setupJobsListener() {
  onValue(ref(db, 'jobs'), (snapshot) => {
    const data = snapshot.val();
    currentJobs = data
      ? Object.entries(data).map(([key, val]) => ({ ...val, id: key }))
      : [];
    currentJobs.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    renderAdminList(currentJobs);
  }, (err) => {
    showToast('Error loading jobs: ' + err.message, 'error');
  });
}

// ── AUTO-PURGE EXPIRED (>24h past deadline) ───────────────
async function purgeExpiredJobs() {
  try {
    const snapshot = await get(ref(db, 'jobs'));
    const data = snapshot.val();
    if (!data) return;
    const now   = Date.now();
    const GRACE = 24 * 60 * 60 * 1000;
    for (const [key, job] of Object.entries(data)) {
      if (job.deadline) {
        const endOfDay = new Date(job.deadline);
        endOfDay.setHours(23, 59, 59, 999);
        if ((now - endOfDay.getTime()) >= GRACE) {
          await remove(ref(db, `jobs/${key}`));
        }
      }
    }
  } catch (err) {
    console.error('Purge error:', err);
  }
}

// ── IMAGE PREVIEW ──────────────────────────────────────────
function previewImageFromUrl(url) {
  if (url && url.startsWith('http')) {
    imagePreview.src = url;
    imagePreview.classList.add('show');
    imagePreview.onerror = () => imagePreview.classList.remove('show');
  } else {
    imagePreview.classList.remove('show');
  }
}
window.previewImageFromUrl = previewImageFromUrl;

fImageFile.addEventListener('change', function() {
  const file = this.files[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) { showToast('Image must be under 5MB', 'error'); return; }
  const reader = new FileReader();
  reader.onload = e => {
    fImageUrl.value = '';
    imagePreview.src = e.target.result;
    imagePreview.classList.add('show');
    fImageFile._base64 = e.target.result;
  };
  reader.readAsDataURL(file);
});

// ── FORM SUBMIT (ADD / EDIT) ───────────────────────────────
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = editIdEl.value;

  let imageVal = '';
  if (fImageFile.files[0] && fImageFile._base64) {
    imageVal = fImageFile._base64;
  } else if (fImageUrl.value.trim()) {
    imageVal = fImageUrl.value.trim();
  } else if (id) {
    const existing = currentJobs.find(j => j.id === id);
    if (existing) imageVal = existing.image || '';
  }

  const jobData = {
    title:       fTitle.value.trim(),
    description: fDesc.value.trim(),
    category:    fCategory.value.trim(),
    isGov:       fIsGov.checked,
    isPrivate:   fIsPrivate.checked,
    city:        fCity.value.trim(),
    deadline:    fDeadline.value,
    applyLink:   fApplyLink.value.trim(),
    image:       imageVal,
    updatedAt:   Date.now(),
  };

  saveBtn.disabled = true;
  saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving…';

  try {
    if (id) {
      await update(ref(db, `jobs/${id}`), jobData);
      showToast('Job updated successfully!', 'success');
    } else {
      jobData.createdAt = Date.now();
      const newRef = push(ref(db, 'jobs'));
      await set(newRef, jobData);
      showToast('Job added successfully!', 'success');
    }
    resetForm();
  } catch (err) {
    showToast('Error: ' + err.message, 'error');
  } finally {
    saveBtn.disabled = false;
    saveBtn.innerHTML = `<i class="fas fa-save"></i> ${editIdEl.value ? 'Update' : 'Save'} Job`;
  }
});

// ── RESET FORM ────────────────────────────────────────────
function resetForm() {
  form.reset();
  editIdEl.value = '';
  if (fImageFile) { fImageFile.value = ''; fImageFile._base64 = null; }
  imagePreview.classList.remove('show');
  formTitle.innerHTML = '<i class="fas fa-plus-circle"></i> Add New Job';
  saveBtn.innerHTML   = '<i class="fas fa-save"></i> Save Job';
  cancelBtn.style.display = 'none';
}
window.resetForm = resetForm;

// ── EDIT JOB ──────────────────────────────────────────────
function editJob(id) {
  const job = currentJobs.find(j => j.id === id);
  if (!job) return;

  editIdEl.value     = id;
  fTitle.value       = job.title       || '';
  fDesc.value        = job.description || '';
  fCategory.value    = job.category    || '';
  fIsGov.checked     = !!job.isGov;
  fIsPrivate.checked = !!job.isPrivate;
  fCity.value        = job.city        || '';
  fDeadline.value    = job.deadline    || '';
  fApplyLink.value   = job.applyLink   || '';
  fImageUrl.value    = (!job.image || job.image.startsWith('data:')) ? '' : job.image;
  fImageFile._base64 = job.image && job.image.startsWith('data:') ? job.image : null;

  if (job.image) { imagePreview.src = job.image; imagePreview.classList.add('show'); }
  else           { imagePreview.classList.remove('show'); }

  formTitle.innerHTML     = '<i class="fas fa-edit"></i> Edit Job';
  saveBtn.innerHTML       = '<i class="fas fa-save"></i> Update Job';
  cancelBtn.style.display = 'block';

  document.querySelector('.form-panel').scrollIntoView({ behavior: 'smooth', block: 'start' });
}
window.editJob = editJob;

// ── DELETE JOB ────────────────────────────────────────────
async function deleteJob(id) {
  const job = currentJobs.find(j => j.id === id);
  if (!job) return;
  if (!confirm(`Delete "${job.title || 'this job'}"? This cannot be undone.`)) return;
  try {
    await remove(ref(db, `jobs/${id}`));
    showToast('Job deleted.', 'success');
  } catch (err) {
    showToast('Error deleting: ' + err.message, 'error');
  }
}
window.deleteJob = deleteJob;

// ── RENDER ADMIN LIST ─────────────────────────────────────
function renderAdminList(jobs) {
  const container = document.getElementById('adminJobsList');
  const badge     = document.getElementById('jobsBadge');
  const total     = document.getElementById('totalCount');
  badge.textContent = jobs.length;
  total.textContent = jobs.length + ' job' + (jobs.length !== 1 ? 's' : '') + ' total';

  if (jobs.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📋</div>
        <h3>No jobs yet</h3>
        <p>Add your first job using the form on the left.</p>
      </div>`;
    return;
  }

  container.innerHTML = jobs.map(job => {
    const thumb = job.image
      ? `<div class="admin-job-thumb"><img src="${escHtml(job.image)}" alt="" onerror="this.parentNode.innerHTML='💼'"></div>`
      : `<div class="admin-job-thumb">💼</div>`;

    let tags = '';
    if (job.isGov)     tags += `<span class="tag gov">🏛️ Govt</span>`;
    if (job.isPrivate) tags += `<span class="tag private">🏢 Private</span>`;
    if (job.category)  tags += `<span class="tag category">${escHtml(job.category)}</span>`;
    if (job.city)      tags += `<span class="tag city">${escHtml(job.city)}</span>`;

    const isExpired = job.deadline && new Date(job.deadline) < new Date();
    const deadlineHtml = job.deadline
      ? `<small style="color:${isExpired ? '#ef4444' : 'var(--text-muted)'};font-size:0.75rem">
           ${isExpired ? '⛔ EXPIRED – ' : '📅 '}${job.deadline}
         </small>`
      : '';

    return `
      <div class="admin-job-item">
        <div class="admin-job-item-inner">
          ${thumb}
          <div class="admin-job-info">
            <div class="admin-job-title">${escHtml(job.title || 'Untitled Job')}</div>
            <div class="admin-job-meta">${tags}${deadlineHtml}</div>
          </div>
          <div class="admin-job-actions">
            <button class="btn-edit"   onclick="editJob('${escHtml(job.id)}')"><i class="fas fa-edit"></i> Edit</button>
            <button class="btn-delete" onclick="deleteJob('${escHtml(job.id)}')"><i class="fas fa-trash"></i></button>
          </div>
        </div>
      </div>`;
  }).join('');
}

// ── TOAST ─────────────────────────────────────────────────
let toastTimer;
function showToast(msg, type = 'success') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast show ' + type;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 3000);
}

// ── UTILITIES ─────────────────────────────────────────────
function escHtml(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
