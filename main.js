// =============================================
// VALORANT RANDOMIZER - main.js
// API: https://valorant-api.com
// =============================================

const API_BASE = 'https://valorant-api.com/v1';

// State
let agents = [];
let weapons = [];
let currentRoleFilter = 'all';
let currentWeaponCatFilter = 'all';

// =============================================
// INIT
// =============================================
async function init() {
  showLoading(true);
  try {
    // Fetch agents in both languages: English for role names (filter keys), French for display
    const [agentsRes, weaponsRes, agentsEnRes] = await Promise.all([
      fetch(`${API_BASE}/agents?isPlayableCharacter=true&language=fr-FR`),
      fetch(`${API_BASE}/weapons?language=fr-FR`),
      fetch(`${API_BASE}/agents?isPlayableCharacter=true&language=en-US`)
    ]);
    const agentsData = await agentsRes.json();
    const weaponsData = await weaponsRes.json();
    const agentsEnData = await agentsEnRes.json();

    // Build a map of uuid -> EN role name for filter matching
    const roleEnMap = {};
    for (const a of (agentsEnData.data || [])) {
      if (a.role) roleEnMap[a.uuid] = a.role.displayName; // e.g. "Duelist"
    }

    agents = (agentsData.data || []).map(a => ({
      ...a,
      _roleNameEn: roleEnMap[a.uuid] || (a.role ? a.role.displayName : '')
    }));

    weapons = (weaponsData.data || []).filter(w => w.shopData && w.shopData.cost > 0).map(w => ({
      ...w,
      // Normalize category text: remove accents, lowercase → used for filter comparison
      _catKey: normalizeCat(w.shopData.categoryText || w.shopData.category || '')
    }));
  } catch (err) {
    showToast('Erreur de chargement de l\'API. Vérifiez votre connexion.');
    console.error(err);
  } finally {
    showLoading(false);
  }

  initParticles();
}

// Normalize category text for comparison (strip accents, lowercase)
function normalizeCat(str) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

// Category key mapping (what the chip data-cat sends → normalized match)
const CAT_MAP = {
  'Rifle':        'assault rifle',
  'SMG':          'smg',
  'Shotgun':      'shotgun',
  'Sniper Rifle': 'sniper rifle',
  'Heavy':        'heavy',
  'Sidearm':      'sidearm',
};

// =============================================
// TABS
// =============================================
window.switchTab = function(tab) {
  document.querySelectorAll('.tab').forEach(el => {
    el.classList.remove('active');
    el.setAttribute('aria-selected', 'false');
  });
  document.querySelectorAll('.section').forEach(el => el.classList.remove('active'));

  document.getElementById(`tab-${tab}`).classList.add('active');
  document.getElementById(`tab-${tab}`).setAttribute('aria-selected', 'true');
  document.getElementById(`section-${tab}`).classList.add('active');
};

// =============================================
// ROLE FILTER (AGENTS)
// =============================================
window.setRoleFilter = function(el, role) {
  document.querySelectorAll('#roleFilters .chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  currentRoleFilter = role;
};

// =============================================
// WEAPON CATEGORY FILTER
// =============================================
window.setWeaponCatFilter = function(el, cat) {
  document.querySelectorAll('#weaponCatFilters .chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  currentWeaponCatFilter = cat;
};

// =============================================
// RANDOMIZE AGENT
// =============================================
window.randomizeAgent = function() {
  if (!agents.length) { showToast('Agents non chargés. Rechargez la page.'); return; }

  let pool = agents;
  if (currentRoleFilter !== 'all') {
    // Use the English role name stored during init for reliable comparison
    pool = agents.filter(a => a._roleNameEn && a._roleNameEn.toLowerCase() === currentRoleFilter.toLowerCase());
  }

  if (!pool.length) { showToast('Aucun agent trouvé pour ce rôle.'); return; }

  const agent = pool[Math.floor(Math.random() * pool.length)];
  displayAgent(agent);
  triggerConfetti();
};

function displayAgent(agent) {
  const card = document.getElementById('agentCard');
  const placeholder = document.getElementById('agentPlaceholder');

  // Hide placeholder
  placeholder.classList.add('hidden');

  // Rebuild card with animation
  card.classList.remove('hidden');
  card.style.animation = 'none';
  void card.offsetWidth; // reflow
  card.style.animation = '';

  // Background
  const bg = document.getElementById('agentCardBg');
  bg.style.backgroundImage = `url('${agent.background || agent.bustPortrait || ''}')`;

  // Portrait
  document.getElementById('agentPortrait').src = agent.bustPortrait || agent.displayIcon;
  document.getElementById('agentPortrait').alt = agent.displayName;

  // Role
  const roleIcon = document.getElementById('agentRoleIcon');
  const roleName = document.getElementById('agentRoleName');
  if (agent.role) {
    roleIcon.src = agent.role.displayIcon;
    roleName.textContent = agent.role.displayName.toUpperCase();
  }

  // Glow color from agent
  const glowEl = document.getElementById('agentGlow');
  glowEl.style.background = `linear-gradient(to top, var(--bg-2), transparent)`;

  // Name & Description
  document.getElementById('agentName').textContent = agent.displayName.toUpperCase();
  document.getElementById('agentDescription').textContent = agent.description || '';

  // Abilities
  const abilitiesEl = document.getElementById('agentAbilities');
  abilitiesEl.innerHTML = '';
  const keyLabels = ['Q', 'E', 'X', 'C'];
  (agent.abilities || []).slice(0, 4).forEach((ability, i) => {
    if (!ability.displayName) return;
    const div = document.createElement('div');
    div.className = 'ability-item';
    div.title = ability.description || ability.displayName;
    div.innerHTML = `
      ${ability.displayIcon ? `<img src="${ability.displayIcon}" alt="${ability.displayName}" class="ability-icon" />` : ''}
      <span class="ability-key">${keyLabels[i] || '?'}</span>
      <span>${ability.displayName}</span>
    `;
    abilitiesEl.appendChild(div);
  });
}

// =============================================
// RANDOMIZE WEAPON
// =============================================
window.setBudget = function(amount) {
  document.getElementById('budgetInput').value = amount;
};

window.randomizeWeapon = function() {
  if (!weapons.length) { showToast('Armes non chargées. Rechargez la page.'); return; }

  const budget = parseInt(document.getElementById('budgetInput').value, 10);
  if (isNaN(budget) || budget < 0) { showToast('Entrez un budget valide.'); return; }

  let pool = weapons.filter(w => w.shopData.cost <= budget);

  if (currentWeaponCatFilter !== 'all') {
    // Match using normalized categoryText (e.g. 'Assault Rifle' → 'assault rifle')
    const targetKey = normalizeCat(CAT_MAP[currentWeaponCatFilter] || currentWeaponCatFilter);
    pool = pool.filter(w => w._catKey.includes(targetKey));
  }

  if (!pool.length) {
    showToast(`Aucune arme disponible pour ${budget} CR dans cette catégorie.`);
    return;
  }

  const weapon = pool[Math.floor(Math.random() * pool.length)];
  displayWeapon(weapon);
  triggerConfetti();
};

function displayWeapon(weapon) {
  const card = document.getElementById('weaponCard');
  const placeholder = document.getElementById('weaponPlaceholder');

  placeholder.classList.add('hidden');

  card.classList.remove('hidden');
  card.style.animation = 'none';
  void card.offsetWidth;
  card.style.animation = '';

  document.getElementById('weaponCategory').textContent = weapon.shopData.categoryText || weapon.shopData.category || '';
  document.getElementById('weaponName').textContent = weapon.displayName.toUpperCase();
  document.getElementById('weaponCost').textContent = weapon.shopData.cost.toLocaleString('fr-FR');
  document.getElementById('weaponImage').src = weapon.displayIcon;
  document.getElementById('weaponImage').alt = weapon.displayName;

  // Stats
  const statsEl = document.getElementById('weaponStats');
  statsEl.innerHTML = '';

  const stats = [];

  if (weapon.weaponStats) {
    const ws = weapon.weaponStats;
    if (ws.fireRate)      stats.push({ label: 'CADENCE DE TIR', value: ws.fireRate.toFixed(1) + ' tr/s', pct: Math.min(ws.fireRate / 14 * 100, 100) });
    if (ws.magazineSize)  stats.push({ label: 'CHARGEUR', value: ws.magazineSize, pct: Math.min(ws.magazineSize / 50 * 100, 100) });
    if (ws.reloadTimeSeconds) stats.push({ label: 'RECHARGEMENT', value: ws.reloadTimeSeconds.toFixed(1) + 's', pct: Math.max(0, 100 - (ws.reloadTimeSeconds / 5 * 100)) });
    if (ws.equipTimeSeconds) stats.push({ label: 'DÉGAINAGE', value: ws.equipTimeSeconds.toFixed(1) + 's', pct: Math.max(0, 100 - (ws.equipTimeSeconds / 2 * 100)) });
    if (ws.wallPenetration) stats.push({ label: 'PÉNÉTRATION', value: formatPenetration(ws.wallPenetration), pct: penetrationPct(ws.wallPenetration) });

    // Damage
    if (ws.damageRanges && ws.damageRanges.length > 0) {
      const dr = ws.damageRanges[0];
      if (dr.headDamage) stats.push({ label: 'DÉGÂTS TÊTE', value: Math.round(dr.headDamage), pct: Math.min(dr.headDamage / 250 * 100, 100) });
      if (dr.bodyDamage) stats.push({ label: 'DÉGÂTS CORPS', value: dr.bodyDamage, pct: Math.min(dr.bodyDamage / 160 * 100, 100) });
    }
  }

  stats.forEach(s => {
    const div = document.createElement('div');
    div.className = 'stat-item';
    div.innerHTML = `
      <div class="stat-label">${s.label}</div>
      <div class="stat-value">${s.value}</div>
      <div class="stat-bar-wrap"><div class="stat-bar" style="width: 0%"></div></div>
    `;
    statsEl.appendChild(div);
    // Animate bar after mount
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        div.querySelector('.stat-bar').style.width = `${s.pct}%`;
      });
    });
  });
}

function formatPenetration(p) {
  if (!p) return 'N/A';
  const key = p.toLowerCase();
  if (key.includes('low'))   return 'Faible';
  if (key.includes('medium')) return 'Moyen';
  if (key.includes('high'))  return 'Élevé';
  return p;
}

function penetrationPct(p) {
  if (!p) return 0;
  const key = p.toLowerCase();
  if (key.includes('low'))    return 33;
  if (key.includes('medium')) return 66;
  if (key.includes('high'))   return 100;
  return 0;
}

// =============================================
// LOADING
// =============================================
function showLoading(show) {
  const el = document.getElementById('loadingOverlay');
  el.classList.toggle('hidden', !show);
}

// =============================================
// TOAST
// =============================================
let toastTimer;
function showToast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.remove('hidden');
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    el.classList.remove('show');
    setTimeout(() => el.classList.add('hidden'), 300);
  }, 3000);
}

// =============================================
// PARTICLES BACKGROUND
// =============================================
function initParticles() {
  const container = document.getElementById('bgParticles');
  for (let i = 0; i < 14; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 120 + 40;
    p.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${Math.random() * 100}%;
      animation-duration: ${Math.random() * 12 + 10}s;
      animation-delay: ${Math.random() * 8}s;
    `;
    container.appendChild(p);
  }
}

// =============================================
// CONFETTI BURST (lightweight)
// =============================================
function triggerConfetti() {
  const colors = ['#FF4655', '#ece8e1', '#e2b96f', '#00b4d8'];
  const container = document.body;

  for (let i = 0; i < 18; i++) {
    const dot = document.createElement('div');
    const size = Math.random() * 6 + 3;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const x = Math.random() * window.innerWidth;
    const duration = Math.random() * 0.8 + 0.6;
    const distance = -(Math.random() * 200 + 100);

    dot.style.cssText = `
      position: fixed;
      left: ${x}px;
      bottom: 30%;
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      background: ${color};
      pointer-events: none;
      z-index: 9999;
      transform: translateY(0);
      transition: transform ${duration}s cubic-bezier(0.2, 0.8, 0.4, 1), opacity ${duration}s ease;
      opacity: 1;
    `;
    container.appendChild(dot);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        dot.style.transform = `translateY(${distance}px) translateX(${(Math.random() - 0.5) * 80}px) rotate(${Math.random() * 360}deg)`;
        dot.style.opacity = '0';
      });
    });

    setTimeout(() => dot.remove(), duration * 1000 + 100);
  }
}

// =============================================
// START
// =============================================
init();
