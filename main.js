const API = 'https://valorant-api.com/v1';
const CACHE_KEY = 'protocol-data-v2';
const HISTORY_KEY = 'protocol-history-v2';
const FAVORITES_KEY = 'protocol-favorites-v2';

const state = {
  agents: [], weapons: [], role: 'all', category: 'all', budget: 3900,
  view: 'loadout', current: { agent: null, weapon: null },
  locked: { agent: false, weapon: false },
  history: readStorage(HISTORY_KEY, []), favorites: readStorage(FAVORITES_KEY, []), historyTab: 'recent'
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const els = {
  loading: $('#loadingOverlay'), status: $('#apiStatus'), randomize: $('#randomizeButton'), empty: $('#emptyState'),
  result: $('#loadoutResult'), budget: $('#budgetRange'), budgetOutput: $('#budgetOutput'), roleSelection: $('#roleSelection'),
  categorySelection: $('#categorySelection'), copy: $('#copyButton'), favorite: $('#favoriteButton'), historyList: $('#historyList'),
  historyCount: $('#historyCount'), drawer: $('#historyDrawer'), scrim: $('#drawerScrim'), toast: $('#toast')
};

function readStorage(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}

function writeStorage(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* Private mode or quota: the app remains usable. */ }
}

async function init() {
  bindEvents();
  updateHistoryUI();
  setBudget(3900);
  try {
    const [frAgents, enAgents, frWeapons] = await Promise.all([
      getJson(`${API}/agents?isPlayableCharacter=true&language=fr-FR`),
      getJson(`${API}/agents?isPlayableCharacter=true&language=en-US`),
      getJson(`${API}/weapons?language=fr-FR`)
    ]);
    const englishRoles = Object.fromEntries(enAgents.data.map(agent => [agent.uuid, agent.role?.displayName || '']));
    state.agents = frAgents.data.map(agent => compactAgent(agent, englishRoles[agent.uuid]));
    state.weapons = frWeapons.data.filter(weapon => weapon.shopData?.cost > 0).map(compactWeapon);
    writeStorage(CACHE_KEY, { agents: state.agents, weapons: state.weapons, cachedAt: Date.now() });
    setStatus('is-online', 'Données à jour');
  } catch (error) {
    const cache = readStorage(CACHE_KEY, null);
    if (cache?.agents?.length && cache?.weapons?.length) {
      state.agents = cache.agents; state.weapons = cache.weapons;
      setStatus('is-cached', 'Mode hors-ligne');
      toast('Connexion indisponible — données sauvegardées utilisées');
    } else {
      setStatus('is-error', 'Hors connexion');
      toast('Impossible de charger les données. Vérifiez votre connexion.');
    }
    console.error(error);
  } finally {
    updateCategoryAvailability();
    els.randomize.disabled = !state.agents.length || !state.weapons.length;
    setTimeout(() => els.loading.classList.add('is-hidden'), 280);
  }
}

async function getJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`API ${response.status}`);
  return response.json();
}

function compactAgent(agent, englishRole) {
  return {
    id: agent.uuid, name: agent.displayName, description: agent.description || '', image: agent.fullPortraitV2 || agent.fullPortrait || agent.bustPortrait || agent.displayIcon,
    icon: agent.displayIcon, background: agent.background || '', role: agent.role?.displayName || 'Agent', roleKey: englishRole || '', roleIcon: agent.role?.displayIcon || '',
    abilities: (agent.abilities || []).filter(a => a.displayName).slice(0, 4).map(a => ({ name: a.displayName, icon: a.displayIcon || '' }))
  };
}

function compactWeapon(weapon) {
  const rawCategory = (weapon.category || '').replace('EEquippableCategory::', '');
  const categories = { Rifle: 'Rifles', SMG: 'SMGs', Shotgun: 'Shotguns', Sniper: 'Sniper Rifles', Heavy: 'Heavy Weapons', Sidearm: 'Sidearms' };
  const stats = weapon.weaponStats || {};
  return {
    id: weapon.uuid, name: weapon.displayName, image: weapon.displayIcon, price: weapon.shopData.cost,
    category: categories[rawCategory] || weapon.shopData.category || rawCategory,
    categoryLabel: weapon.shopData.categoryText || weapon.shopData.category || rawCategory,
    stats: {
      fireRate: stats.fireRate || 0, magazine: stats.magazineSize || 0, reload: stats.reloadTimeSeconds || 0,
      penetration: formatPenetration(stats.wallPenetration), head: Math.round(stats.damageRanges?.[0]?.headDamage || 0), body: Math.round(stats.damageRanges?.[0]?.bodyDamage || 0)
    }
  };
}

function formatPenetration(value = '') {
  if (value.includes('High')) return 'Élevée';
  if (value.includes('Medium')) return 'Moyenne';
  if (value.includes('Low')) return 'Faible';
  return '—';
}

function bindEvents() {
  $('#roleFilters').addEventListener('click', event => {
    const button = event.target.closest('button'); if (!button) return;
    state.role = button.dataset.role; setActive(button, '#roleFilters button');
    els.roleSelection.textContent = button.title === 'Tous les rôles' ? 'Tous' : button.title;
  });
  $('#weaponFilters').addEventListener('click', event => {
    const button = event.target.closest('button'); if (!button || button.disabled) return;
    state.category = button.dataset.category; setActive(button, '#weaponFilters button'); els.categorySelection.textContent = button.textContent;
  });
  els.budget.addEventListener('input', () => setBudget(Number(els.budget.value)));
  $('#budgetPresets').addEventListener('click', event => { const button = event.target.closest('button'); if (button) setBudget(Number(button.dataset.budget)); });
  $('#resetFilters').addEventListener('click', resetFilters);
  els.randomize.addEventListener('click', randomize);
  $('#rerollAgent').addEventListener('click', () => randomizePart('agent'));
  $('#rerollWeapon').addEventListener('click', () => randomizePart('weapon'));
  $('#lockAgent').addEventListener('click', () => toggleLock('agent'));
  $('#lockWeapon').addEventListener('click', () => toggleLock('weapon'));
  els.copy.addEventListener('click', copyLoadout);
  els.favorite.addEventListener('click', toggleCurrentFavorite);
  $$('.nav-item').forEach(button => button.addEventListener('click', () => setView(button.dataset.view, button)));
  $('#historyTrigger').addEventListener('click', () => openDrawer(true));
  $('#closeHistory').addEventListener('click', () => openDrawer(false));
  els.scrim.addEventListener('click', () => openDrawer(false));
  $$('.drawer-tabs button').forEach(button => button.addEventListener('click', () => { state.historyTab = button.dataset.historyTab; setActive(button, '.drawer-tabs button'); renderHistory(); }));
  $('#clearHistory').addEventListener('click', () => { state.history = []; writeStorage(HISTORY_KEY, []); updateHistoryUI(); toast('Historique effacé'); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') openDrawer(false);
    if (event.code === 'Space' && !/INPUT|BUTTON|TEXTAREA|SELECT/.test(document.activeElement.tagName) && !els.randomize.disabled) { event.preventDefault(); randomize(); }
  });
}

function setActive(button, selector) { $$(selector).forEach(item => item.classList.toggle('is-active', item === button)); }

function setBudget(value) {
  state.budget = Math.max(0, Math.min(9000, value));
  els.budget.value = state.budget; els.budgetOutput.textContent = `${state.budget.toLocaleString('fr-FR')} CR`;
  els.budget.style.setProperty('--range-fill', `${state.budget / 90}%`);
  $$('#budgetPresets button').forEach(button => button.classList.toggle('is-active', Number(button.dataset.budget) === state.budget));
  updateCategoryAvailability();
}

function updateCategoryAvailability() {
  const available = new Set(state.weapons.filter(w => w.price <= state.budget).map(w => w.category));
  $$('#weaponFilters button').forEach(button => {
    button.disabled = button.dataset.category !== 'all' && !available.has(button.dataset.category);
    if (button.disabled && button.classList.contains('is-active')) {
      state.category = 'all'; setActive($('#weaponFilters [data-category="all"]'), '#weaponFilters button'); els.categorySelection.textContent = 'Toutes';
    }
  });
}

function resetFilters() {
  state.role = 'all'; state.category = 'all';
  setActive($('#roleFilters [data-role="all"]'), '#roleFilters button'); setActive($('#weaponFilters [data-category="all"]'), '#weaponFilters button');
  els.roleSelection.textContent = 'Tous'; els.categorySelection.textContent = 'Toutes'; $('#avoidRepeat').checked = true; setBudget(3900); toast('Paramètres réinitialisés');
}

function setView(view, button) {
  state.view = view; document.body.dataset.view = view; setActive(button, '.nav-item');
  const labels = { loadout: 'LANCER LE PROTOCOLE', agents: 'TIRER UN AGENT', weapons: 'TIRER UNE ARME' };
  els.randomize.querySelector('span').textContent = labels[view];
  state.current = { agent: null, weapon: null };
  state.locked = { agent: false, weapon: false };
  $$('.card-action').forEach(action => action.classList.remove('is-active'));
  els.empty.classList.remove('is-hidden'); els.result.classList.add('is-hidden');
  els.copy.disabled = true; els.favorite.disabled = true;
}

function getAgentPool() {
  let pool = state.role === 'all' ? state.agents : state.agents.filter(agent => agent.roleKey === state.role);
  if ($('#avoidRepeat').checked && pool.length > 1 && state.current.agent) pool = pool.filter(agent => agent.id !== state.current.agent.id);
  return pool;
}

function getWeaponPool() {
  let pool = state.weapons.filter(weapon => weapon.price <= state.budget && (state.category === 'all' || weapon.category === state.category));
  if ($('#avoidRepeat').checked && pool.length > 1 && state.current.weapon) pool = pool.filter(weapon => weapon.id !== state.current.weapon.id);
  return pool;
}

function pick(pool) { return pool[Math.floor(Math.random() * pool.length)] || null; }

function randomize() {
  if (state.view !== 'weapons' && !state.locked.agent) state.current.agent = pick(getAgentPool());
  if (state.view !== 'agents' && !state.locked.weapon) state.current.weapon = pick(getWeaponPool());
  if ((state.view !== 'weapons' && !state.current.agent) || (state.view !== 'agents' && !state.current.weapon)) { toast('Aucun résultat ne correspond à ces paramètres'); return; }
  animateResult(); renderCurrent(); saveResult(); burst();
}

function randomizePart(part) {
  const result = part === 'agent' ? pick(getAgentPool()) : pick(getWeaponPool());
  if (!result) { toast('Aucun résultat ne correspond à ces paramètres'); return; }
  state.current[part] = result; renderCurrent(); saveResult();
}

function animateResult() {
  els.randomize.disabled = true; els.randomize.querySelector('span').textContent = 'SÉLECTION EN COURS…';
  setTimeout(() => { els.randomize.disabled = false; const labels = { loadout: 'RELANCER LE PROTOCOLE', agents: 'RELANCER UN AGENT', weapons: 'RELANCER UNE ARME' }; els.randomize.querySelector('span').textContent = labels[state.view]; }, 420);
}

function renderCurrent() {
  els.empty.classList.add('is-hidden'); els.result.classList.remove('is-hidden');
  if (state.current.agent) renderAgent(state.current.agent);
  if (state.current.weapon) renderWeapon(state.current.weapon);
  els.copy.disabled = false; els.favorite.disabled = false; updateFavoriteButton();
  $('#agentCard').classList.toggle('is-hidden', state.view === 'weapons'); $('#weaponCard').classList.toggle('is-hidden', state.view === 'agents');
}

function renderAgent(agent) {
  $('#agentBackdrop').style.backgroundImage = `url("${agent.background || agent.image}")`;
  setImage($('#agentImage'), agent.image, agent.name); setImage($('#roleIcon'), agent.roleIcon, agent.role);
  $('#agentRole').textContent = agent.role; $('#agentName').textContent = agent.name.toUpperCase(); $('#agentDescription').textContent = agent.description;
  const list = $('#abilityList'); list.replaceChildren();
  agent.abilities.forEach((ability, index) => {
    const item = document.createElement('div'); item.className = 'ability'; item.title = ability.name;
    const image = document.createElement('img'); image.src = ability.icon; image.alt = '';
    const key = document.createElement('span'); key.textContent = ['C', 'Q', 'E', 'X'][index] || '•'; item.append(image, key); list.append(item);
  });
}

function renderWeapon(weapon) {
  setImage($('#weaponImage'), weapon.image, weapon.name); $('#weaponCategory').textContent = weapon.categoryLabel;
  $('#weaponName').textContent = weapon.name.toUpperCase(); $('#weaponPrice').textContent = `${weapon.price.toLocaleString('fr-FR')} CR`;
  const values = [
    ['Cadence', weapon.stats.fireRate ? `${weapon.stats.fireRate.toFixed(1)} /s` : '—'], ['Chargeur', weapon.stats.magazine || '—'],
    ['Rechargement', weapon.stats.reload ? `${weapon.stats.reload.toFixed(1)} s` : '—'], ['Pénétration', weapon.stats.penetration],
    ['Dégâts tête', weapon.stats.head || '—'], ['Dégâts corps', weapon.stats.body || '—']
  ];
  const grid = $('#weaponStats'); grid.replaceChildren();
  values.forEach(([label, value]) => { const item = document.createElement('div'); item.className = 'stat'; const small = document.createElement('small'); small.textContent = label; const bold = document.createElement('b'); bold.textContent = value; item.append(small, bold); grid.append(item); });
}

function setImage(element, src, alt) { element.src = src || ''; element.alt = alt || ''; }

function toggleLock(part) {
  state.locked[part] = !state.locked[part]; const button = $(`#lock${part[0].toUpperCase()}${part.slice(1)}`); button.classList.toggle('is-active', state.locked[part]);
  button.setAttribute('aria-label', `${state.locked[part] ? 'Déverrouiller' : 'Verrouiller'} ${part === 'agent' ? "l'agent" : "l'arme"}`); toast(`${part === 'agent' ? 'Agent' : 'Arme'} ${state.locked[part] ? 'verrouillé' : 'déverrouillé'}`);
}

function resultId() { return `${state.current.agent?.id || 'none'}-${state.current.weapon?.id || 'none'}`; }

function saveResult() {
  const record = {
    id: `${Date.now()}-${resultId()}`, comboId: resultId(), time: Date.now(), view: state.view,
    agent: state.current.agent ? { id: state.current.agent.id, name: state.current.agent.name, image: state.current.agent.icon, role: state.current.agent.role } : null,
    weapon: state.current.weapon ? { id: state.current.weapon.id, name: state.current.weapon.name, image: state.current.weapon.image, price: state.current.weapon.price } : null
  };
  state.history.unshift(record); state.history = state.history.slice(0, 20); writeStorage(HISTORY_KEY, state.history); updateHistoryUI();
}

async function copyLoadout() {
  const parts = []; if (state.current.agent) parts.push(`${state.current.agent.name} (${state.current.agent.role})`); if (state.current.weapon) parts.push(`${state.current.weapon.name} — ${state.current.weapon.price} CR`);
  try { await navigator.clipboard.writeText(`Mon loadout Protocol : ${parts.join(' + ')}`); toast('Loadout copié dans le presse-papiers'); } catch { toast('Copie indisponible dans ce navigateur'); }
}

function toggleCurrentFavorite() {
  const id = resultId(); const index = state.favorites.findIndex(item => item.comboId === id);
  if (index >= 0) { state.favorites.splice(index, 1); toast('Retiré des favoris'); }
  else {
    state.favorites.unshift({ comboId: id, time: Date.now(), agent: state.current.agent ? { id: state.current.agent.id, name: state.current.agent.name, image: state.current.agent.icon, role: state.current.agent.role } : null, weapon: state.current.weapon ? { id: state.current.weapon.id, name: state.current.weapon.name, image: state.current.weapon.image, price: state.current.weapon.price } : null }); toast('Ajouté aux favoris');
  }
  writeStorage(FAVORITES_KEY, state.favorites); updateFavoriteButton(); renderHistory();
}

function updateFavoriteButton() { els.favorite.classList.toggle('is-active', state.favorites.some(item => item.comboId === resultId())); }

function openDrawer(open) {
  els.drawer.classList.toggle('is-open', open); els.scrim.classList.toggle('is-open', open); els.drawer.setAttribute('aria-hidden', String(!open)); $('#historyTrigger').setAttribute('aria-expanded', String(open));
  if (open) renderHistory();
}

function updateHistoryUI() { els.historyCount.textContent = Math.min(state.history.length, 99); renderHistory(); }

function renderHistory() {
  const items = state.historyTab === 'favorites' ? state.favorites : state.history; els.historyList.replaceChildren();
  if (!items.length) { const empty = document.createElement('p'); empty.className = 'history-empty'; empty.textContent = state.historyTab === 'favorites' ? 'Aucun loadout favori pour le moment.' : 'Vos prochains tirages apparaîtront ici.'; els.historyList.append(empty); return; }
  items.forEach(record => {
    const row = document.createElement('article'); row.className = 'history-item';
    const thumb = document.createElement('img'); thumb.className = 'history-thumb'; thumb.src = record.agent?.image || record.weapon?.image || ''; thumb.alt = '';
    const copy = document.createElement('div'); const title = document.createElement('strong'); title.textContent = [record.agent?.name, record.weapon?.name].filter(Boolean).join(' + '); const meta = document.createElement('small'); meta.textContent = record.agent?.role || `${record.weapon?.price?.toLocaleString('fr-FR')} CR`; copy.append(title, meta);
    const favorite = document.createElement('button'); favorite.type = 'button'; favorite.textContent = '♥'; favorite.title = 'Favori'; favorite.classList.toggle('is-active', state.favorites.some(item => item.comboId === record.comboId)); favorite.addEventListener('click', () => toggleRecordFavorite(record)); row.append(thumb, copy, favorite); els.historyList.append(row);
  });
}

function toggleRecordFavorite(record) {
  const index = state.favorites.findIndex(item => item.comboId === record.comboId);
  if (index >= 0) state.favorites.splice(index, 1); else state.favorites.unshift({ ...record, id: undefined });
  writeStorage(FAVORITES_KEY, state.favorites); renderHistory(); updateFavoriteButton();
}

function setStatus(className, label) { els.status.className = `api-status ${className}`; els.status.querySelector('span').textContent = label; }

let toastTimer;
function toast(message) { clearTimeout(toastTimer); els.toast.textContent = message; els.toast.classList.add('is-visible'); toastTimer = setTimeout(() => els.toast.classList.remove('is-visible'), 2400); }

function burst() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  for (let i = 0; i < 10; i += 1) {
    const shard = document.createElement('i'); const angle = (Math.PI * 2 * i) / 10; shard.style.cssText = `position:fixed;z-index:150;left:68%;top:60%;width:4px;height:9px;background:${i % 2 ? '#f4f1eb' : '#ff4655'};pointer-events:none;transition:.65s cubic-bezier(.2,.8,.2,1)`; document.body.append(shard);
    requestAnimationFrame(() => { shard.style.transform = `translate(${Math.cos(angle) * 100}px,${Math.sin(angle) * 100}px) rotate(140deg)`; shard.style.opacity = '0'; }); setTimeout(() => shard.remove(), 700);
  }
}

init();
