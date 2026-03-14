const STORAGE_KEY = 'jobpulse_jobs';

// ── STORAGE HELPERS ───────────────────────────────────────
function getJobs() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
  catch(e) { return []; }
}

function saveJobs(jobs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
}

function genId() {
  return 'job_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
}

// ── FORM ELEMENTS ─────────────────────────────────────────
const form       = document.getElementById('jobForm');
const fTitle     = document.getElementById('fTitle');
const fDesc      = document.getElementById('fDesc');
const fCategory  = document.getElementById('fCategory');
const fIsGov     = document.getElementById('fIsGov');
const fIsPrivate = document.getElementById('fIsPrivate');
const fCity      = document.getElementById('fCity');
const fDeadline  = document.getElementById('fDeadline');
const fApplyLink = document.getElementById('fApplyLink');
const fImageUrl  = document.getElementById('fImageUrl');
const fImageFile = document.getElementById('fImageFile');
const editIdEl   = document.getElementById('editId');
const formTitle  = document.getElementById('formTitle');
const saveBtn    = document.getElementById('saveBtn');
const cancelBtn  = document.getElementById('cancelBtn');
const imagePreview = document.getElementById('imagePreview');

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

fImageFile.addEventListener('change', function() {
  const file = this.files[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) { showToast('Image must be under 5MB', 'error'); return; }
  const reader = new FileReader();
  reader.onload = e => {
    const b64 = e.target.result;
    fImageUrl.value = '';
    imagePreview.src = b64;
    imagePreview.classList.add('show');
    // Store base64 as data URI for later use
    fImageFile._base64 = b64;
  };
  reader.readAsDataURL(file);
});

// ── FORM SUBMIT ───────────────────────────────────────────
form.addEventListener('submit', function(e) {
  e.preventDefault();

  const jobs = getJobs();
  const id = editIdEl.value;

  // Resolve image: file upload wins over URL
  let imageVal = '';
  if (fImageFile.files[0] && fImageFile._base64) {
    imageVal = fImageFile._base64;
  } else if (fImageUrl.value.trim()) {
    imageVal = fImageUrl.value.trim();
  } else if (id) {
    // keep existing image on edit
    const existing = jobs.find(j => j.id === id);
    if (existing) imageVal = existing.image || '';
  }

  const jobData = {
    title:     fTitle.value.trim(),
    description: fDesc.value.trim(),
    category:  fCategory.value.trim(),
    isGov:     fIsGov.checked,
    isPrivate: fIsPrivate.checked,
    city:      fCity.value.trim(),
    deadline:  fDeadline.value,
    applyLink: fApplyLink.value.trim(),
    image:     imageVal,
  };

  if (id) {
    // Update existing
    const idx = jobs.findIndex(j => j.id === id);
    if (idx !== -1) {
      jobs[idx] = { ...jobs[idx], ...jobData };
      saveJobs(jobs);
      showToast('Job updated successfully!', 'success');
    }
  } else {
    // Create new
    const newJob = { id: genId(), createdAt: Date.now(), ...jobData };
    jobs.unshift(newJob);
    saveJobs(jobs);
    showToast('Job added successfully!', 'success');
  }

  resetForm();
  renderAdminList();
});

// ── RESET FORM ────────────────────────────────────────────
function resetForm() {
  form.reset();
  editIdEl.value = '';
  fImageFile._base64 = null;
  imagePreview.classList.remove('show');
  formTitle.innerHTML = '<i class="fas fa-plus-circle"></i> Add New Job';
  saveBtn.innerHTML = '<i class="fas fa-save"></i> Save Job';
  cancelBtn.style.display = 'none';
}

// ── EDIT JOB ──────────────────────────────────────────────
function editJob(id) {
  const jobs = getJobs();
  const job = jobs.find(j => j.id === id);
  if (!job) return;

  editIdEl.value = id;
  fTitle.value     = job.title || '';
  fDesc.value      = job.description || '';
  fCategory.value  = job.category || '';
  fIsGov.checked   = !!job.isGov;
  fIsPrivate.checked = !!job.isPrivate;
  fCity.value      = job.city || '';
  fDeadline.value  = job.deadline || '';
  fApplyLink.value = job.applyLink || '';
  fImageUrl.value  = (!job.image || job.image.startsWith('data:')) ? '' : job.image;
  fImageFile._base64 = job.image && job.image.startsWith('data:') ? job.image : null;

  if (job.image) {
    imagePreview.src = job.image;
    imagePreview.classList.add('show');
  } else {
    imagePreview.classList.remove('show');
  }

  formTitle.innerHTML = '<i class="fas fa-edit"></i> Edit Job';
  saveBtn.innerHTML = '<i class="fas fa-save"></i> Update Job';
  cancelBtn.style.display = 'block';

  // Scroll to form on mobile
  document.querySelector('.form-panel').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ── DELETE JOB ────────────────────────────────────────────
function deleteJob(id) {
  const jobs = getJobs();
  const job = jobs.find(j => j.id === id);
  if (!job) return;
  const label = job.title ? `"${job.title}"` : 'this job';
  if (!confirm(`Delete ${label}? This cannot be undone.`)) return;
  const updated = jobs.filter(j => j.id !== id);
  saveJobs(updated);
  renderAdminList();
  showToast('Job deleted.', 'success');
}

// ── RENDER ADMIN LIST ─────────────────────────────────────
function renderAdminList() {
  const jobs = getJobs();
  const container = document.getElementById('adminJobsList');
  const badge = document.getElementById('jobsBadge');
  const total = document.getElementById('totalCount');
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
    if (job.isGov) tags += `<span class="tag gov">🏛️ Govt</span>`;
    if (job.isPrivate) tags += `<span class="tag private">🏢 Private</span>`;
    if (job.category) tags += `<span class="tag category">${escHtml(job.category)}</span>`;
    if (job.city) tags += `<span class="tag city">${escHtml(job.city)}</span>`;

    const deadline = job.deadline ? `<small style="color:var(--text-muted);font-size:0.75rem">📅 ${job.deadline}</small>` : '';

    return `
      <div class="admin-job-item">
        <div class="admin-job-item-inner">
          ${thumb}
          <div class="admin-job-info">
            <div class="admin-job-title">${escHtml(job.title || 'Untitled Job')}</div>
            <div class="admin-job-meta">${tags}${deadline}</div>
          </div>
          <div class="admin-job-actions">
            <button class="btn-edit" onclick="editJob('${escHtml(job.id)}')"><i class="fas fa-edit"></i> Edit</button>
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

// ── INIT ──────────────────────────────────────────────────
renderAdminList();
