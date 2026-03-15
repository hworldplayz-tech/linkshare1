import { db } from '/jobs/firebase-jobs.js';
import { ref, onValue } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-database.js";

// ── STATE ─────────────────────────────────────────────────
let allJobs = [];
let viewMode = 'grid';
let activeFilters = { gov: '', private: '', city: '', search: '' };

// ── ELEMENTS ──────────────────────────────────────────────
const jobsContainer  = document.getElementById('jobsContainer');
const filterGov      = document.getElementById('filterGov');
const filterPrivate  = document.getElementById('filterPrivate');
const filterCity     = document.getElementById('filterCity');
const searchInput    = document.getElementById('searchInput');
const btnGrid        = document.getElementById('btnGrid');
const btnList        = document.getElementById('btnList');
const resultsCount   = document.getElementById('resultsCount');
const activeFiltersEl = document.getElementById('activeFilters');

// ── FIREBASE LISTENER ─────────────────────────────────────
onValue(ref(db, 'jobs'), (snapshot) => {
  const data = snapshot.val();
  allJobs = data
    ? Object.entries(data).map(([key, val]) => ({ ...val, id: key }))
    : [];
  allJobs.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  populateDropdowns(allJobs);
  render();
}, (error) => {
  console.error('Firebase read error:', error);
  jobsContainer.innerHTML = `
    <div class="empty-state">
      <div class="empty-icon">⚠️</div>
      <h3>Failed to load jobs</h3>
      <p>Check your connection and refresh the page.</p>
    </div>`;
});

// ── POPULATE DROPDOWNS ────────────────────────────────────
function populateDropdowns(jobs) {
  const govJobs     = jobs.filter(j => j.isGov);
  const privateJobs = jobs.filter(j => j.isPrivate);

  filterGov.innerHTML = '<option value="">🏛️ Government Jobs</option>';
  if (govJobs.length) {
    filterGov.innerHTML += '<option value="__all_gov__">— All Government Jobs —</option>';
    govJobs.forEach(j => {
      const opt = document.createElement('option');
      opt.value = j.id;
      opt.textContent = j.title || 'Untitled Job';
      if (j.city) opt.textContent += ` (${j.city})`;
      filterGov.appendChild(opt);
    });
  } else {
    filterGov.innerHTML += '<option disabled>No government jobs yet</option>';
  }

  filterPrivate.innerHTML = '<option value="">🏢 Private Jobs</option>';
  if (privateJobs.length) {
    filterPrivate.innerHTML += '<option value="__all_private__">— All Private Jobs —</option>';
    privateJobs.forEach(j => {
      const opt = document.createElement('option');
      opt.value = j.id;
      opt.textContent = j.title || 'Untitled Job';
      if (j.city) opt.textContent += ` (${j.city})`;
      filterPrivate.appendChild(opt);
    });
  } else {
    filterPrivate.innerHTML += '<option disabled>No private jobs yet</option>';
  }

  updateCityDropdown(jobs);
}

function updateCityDropdown(filteredJobs) {
  const cities  = [...new Set(filteredJobs.map(j => j.city).filter(Boolean))].sort();
  const prevVal = filterCity.value;
  filterCity.innerHTML = '<option value="">📍 All Cities</option>';
  cities.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c;
    opt.textContent = c;
    filterCity.appendChild(opt);
  });
  if (cities.includes(prevVal)) filterCity.value = prevVal;
}

// ── FILTER LOGIC ──────────────────────────────────────────
function getFilteredJobs() {
  let result = [...allJobs];
  const { gov, private: priv, city, search } = activeFilters;

  if (gov === '__all_gov__')         result = result.filter(j => j.isGov);
  else if (gov)                      result = result.filter(j => j.id === gov);

  if (priv === '__all_private__')    result = result.filter(j => j.isPrivate);
  else if (priv)                     result = result.filter(j => j.id === priv);

  if (city)   result = result.filter(j => j.city === city);
  if (search) {
    const q = search.toLowerCase();
    result = result.filter(j =>
      (j.title       || '').toLowerCase().includes(q) ||
      (j.description || '').toLowerCase().includes(q) ||
      (j.category    || '').toLowerCase().includes(q) ||
      (j.city        || '').toLowerCase().includes(q)
    );
  }
  return result;
}

// ── RENDER ────────────────────────────────────────────────
function render() {
  const filtered = getFilteredJobs();
  resultsCount.textContent = filtered.length;

  let jobsForCity = [...allJobs];
  if (activeFilters.gov === '__all_gov__')         jobsForCity = jobsForCity.filter(j => j.isGov);
  else if (activeFilters.gov)                      jobsForCity = jobsForCity.filter(j => j.id === activeFilters.gov);
  if (activeFilters.private === '__all_private__') jobsForCity = jobsForCity.filter(j => j.isPrivate);
  else if (activeFilters.private)                  jobsForCity = jobsForCity.filter(j => j.id === activeFilters.private);
  updateCityDropdown(jobsForCity);
  renderActiveFilters();

  if (filtered.length === 0) {
    jobsContainer.className = 'jobs-grid';
    jobsContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🔍</div>
        <h3>No jobs found</h3>
        <p>Try adjusting your filters or <a href="/jobs/admin/">add new jobs</a> in the admin panel.</p>
      </div>`;
    return;
  }

  if (viewMode === 'grid') {
    jobsContainer.className = 'jobs-grid';
    jobsContainer.innerHTML = filtered.map(renderCard).join('');
  } else {
    jobsContainer.className = 'jobs-list';
    jobsContainer.innerHTML = filtered.map(renderListItem).join('');
  }
}

function renderActiveFilters() {
  const chips = [];
  if (activeFilters.gov) {
    const label = activeFilters.gov === '__all_gov__' ? 'All Gov Jobs' : (allJobs.find(j => j.id === activeFilters.gov)?.title || 'Gov Job');
    chips.push(`<span class="filter-chip gov" onclick="clearFilter('gov')"><i class="fas fa-times"></i> ${label}</span>`);
  }
  if (activeFilters.private) {
    const label = activeFilters.private === '__all_private__' ? 'All Private Jobs' : (allJobs.find(j => j.id === activeFilters.private)?.title || 'Private Job');
    chips.push(`<span class="filter-chip private" onclick="clearFilter('private')"><i class="fas fa-times"></i> ${label}</span>`);
  }
  if (activeFilters.city)   chips.push(`<span class="filter-chip city" onclick="clearFilter('city')"><i class="fas fa-times"></i> ${activeFilters.city}</span>`);
  if (activeFilters.search) chips.push(`<span class="filter-chip search" onclick="clearFilter('search')"><i class="fas fa-times"></i> "${activeFilters.search}"</span>`);
  activeFiltersEl.innerHTML = chips.join('');
}

function clearFilter(key) {
  activeFilters[key] = '';
  if (key === 'gov')     filterGov.value = '';
  if (key === 'private') filterPrivate.value = '';
  if (key === 'city')    filterCity.value = '';
  if (key === 'search')  searchInput.value = '';
  render();
}
window.clearFilter = clearFilter;

// ── CARD TEMPLATES ────────────────────────────────────────
function deadlineStatus(deadline) {
  if (!deadline) return '';
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const dl    = new Date(deadline);
  const diff  = Math.floor((dl - today) / 86400000);
  if (diff < 0) return `<span class="deadline expired"><i class="fas fa-clock"></i> EXPIRED</span>`;
  if (diff <= 7) return `<span class="deadline soon"><i class="fas fa-clock"></i> ${diff === 0 ? 'Today' : diff + 'd left'}</span>`;
  return `<span class="deadline"><i class="fas fa-calendar"></i> ${dl.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>`;
}

function jobTypeTags(job) {
  let tags = '';
  if (job.isGov)     tags += `<span class="tag gov">🏛️ Govt</span>`;
  if (job.isPrivate) tags += `<span class="tag private">🏢 Private</span>`;
  if (job.category)  tags += `<span class="tag category">${escHtml(job.category)}</span>`;
  if (job.city)      tags += `<span class="tag city"><i class="fas fa-map-marker-alt"></i> ${escHtml(job.city)}</span>`;
  return tags;
}

function renderCard(job) {
  const imageHtml = job.image
    ? `<img class="job-card-image" src="${escHtml(job.image)}" alt="${escHtml(job.title)}" onerror="this.parentNode.innerHTML='<div class=\\'job-card-image-placeholder\\'>💼</div>'">`
    : `<div class="job-card-image-placeholder">💼</div>`;

  const applyBtn  = job.applyLink
    ? `<a href="${escHtml(job.applyLink)}" target="_blank" rel="noopener" class="btn-apply"><i class="fas fa-external-link-alt"></i> Apply</a>`
    : '';
  const detailBtn = `<button class="btn-detail" onclick="openModal('${escHtml(job.id)}')"><i class="fas fa-info-circle"></i> Details</button>`;

  return `
    <div class="job-card">
      ${imageHtml}
      <div class="job-card-body">
        <div class="job-card-tags">${jobTypeTags(job)}</div>
        <div class="job-card-title">${escHtml(job.title || 'Untitled Job')}</div>
        ${job.description ? `<div class="job-card-desc">${escHtml(job.description)}</div>` : ''}
      </div>
      <div class="job-card-footer">
        ${deadlineStatus(job.deadline)}
        <div class="card-btn-group">
          ${detailBtn}
          ${applyBtn}
        </div>
      </div>
    </div>`;
}

function renderListItem(job) {
  const thumbHtml = job.image
    ? `<div class="job-list-thumb"><img src="${escHtml(job.image)}" alt="${escHtml(job.title)}" onerror="this.parentNode.innerHTML='💼'"></div>`
    : `<div class="job-list-thumb">💼</div>`;

  const applyBtn  = job.applyLink
    ? `<a href="${escHtml(job.applyLink)}" target="_blank" rel="noopener" class="btn-apply btn-sm"><i class="fas fa-external-link-alt"></i> Apply</a>`
    : '';
  const detailBtn = `<button class="btn-detail btn-sm" onclick="openModal('${escHtml(job.id)}')"><i class="fas fa-info-circle"></i> Details</button>`;

  return `
    <div class="job-list-item">
      ${thumbHtml}
      <div class="job-list-info">
        <div class="job-list-title">${escHtml(job.title || 'Untitled Job')}</div>
        <div class="job-list-meta">${jobTypeTags(job)}</div>
        ${job.description ? `<div class="job-list-desc">${escHtml(job.description)}</div>` : ''}
      </div>
      <div class="job-list-actions">
        ${deadlineStatus(job.deadline)}
        <div class="card-btn-group">
          ${detailBtn}
          ${applyBtn}
        </div>
      </div>
    </div>`;
}

// ── MODAL ─────────────────────────────────────────────────
function openModal(jobId) {
  const job = allJobs.find(j => j.id === jobId);
  if (!job) return;

  const imgWrap = document.getElementById('modalImageWrap');
  if (job.image) {
    imgWrap.innerHTML = `<img src="${escHtml(job.image)}" alt="${escHtml(job.title)}" onerror="this.parentNode.style.display='none'">`;
    imgWrap.style.display = '';
  } else {
    imgWrap.style.display = 'none';
  }

  document.getElementById('modalTags').innerHTML = jobTypeTags(job);
  document.getElementById('modalTitle').textContent = job.title || 'Untitled Job';
  document.getElementById('modalDeadline').innerHTML = deadlineStatus(job.deadline);

  const descEl = document.getElementById('modalDesc');
  descEl.innerHTML = job.description
    ? escHtml(job.description).replace(/\n/g, '<br>')
    : '<span style="color:var(--text-muted);font-style:italic">No description provided.</span>';

  document.getElementById('modalApply').innerHTML = job.applyLink
    ? `<a href="${escHtml(job.applyLink)}" target="_blank" rel="noopener" class="btn-apply modal-apply-btn"><i class="fas fa-external-link-alt"></i> Apply Now</a>`
    : `<span style="color:var(--text-muted);font-size:0.9rem">No application link provided.</span>`;

  document.getElementById('jobModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}
window.openModal = openModal;

function closeModal() {
  document.getElementById('jobModal').classList.remove('open');
  document.body.style.overflow = '';
}
window.closeModal = closeModal;

function handleModalOverlayClick(e) {
  if (e.target === document.getElementById('jobModal')) closeModal();
}
window.handleModalOverlayClick = handleModalOverlayClick;

document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

// ── EVENT LISTENERS ───────────────────────────────────────
filterGov.addEventListener('change', () => {
  activeFilters.gov = filterGov.value;
  if (filterGov.value) { filterPrivate.value = ''; activeFilters.private = ''; }
  render();
});

filterPrivate.addEventListener('change', () => {
  activeFilters.private = filterPrivate.value;
  if (filterPrivate.value) { filterGov.value = ''; activeFilters.gov = ''; }
  render();
});

filterCity.addEventListener('change', () => { activeFilters.city = filterCity.value; render(); });

let searchDebounce;
searchInput.addEventListener('input', () => {
  clearTimeout(searchDebounce);
  searchDebounce = setTimeout(() => { activeFilters.search = searchInput.value.trim(); render(); }, 280);
});
searchInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') { clearTimeout(searchDebounce); activeFilters.search = searchInput.value.trim(); render(); }
});

btnGrid.addEventListener('click', () => { viewMode = 'grid'; btnGrid.classList.add('active'); btnList.classList.remove('active'); render(); });
btnList.addEventListener('click', () => { viewMode = 'list'; btnList.classList.add('active'); btnGrid.classList.remove('active'); render(); });

// ── UTILITIES ─────────────────────────────────────────────
function escHtml(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
