/* Local pilot accounts + score board (stored in this browser's localStorage). */
const Auth = (() => {
    const U = 'sc_users', S = 'sc_session', L = 'sc_scores', BASE = 'neon_cargo_rush_v2';
    const ld = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? d; } catch (e) { return d; } };
    let user = null;
    const sess = localStorage.getItem(S);
    if (sess && sess !== 'guest' && ld(U, {})[sess]) user = sess;

    async function hash(salt, pw) {
        const data = new TextEncoder().encode(salt + ':' + pw);
        if (window.crypto && crypto.subtle) {
            const b = await crypto.subtle.digest('SHA-256', data);
            return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');
        }
        let h = 5381; for (const c of salt + pw) h = ((h << 5) + h + c.charCodeAt(0)) | 0;
        return 'f' + h;
    }
    const clean = n => (n || '').trim().toLowerCase();

    return {
        get user() { return user; },
        get hasChosen() { return !!localStorage.getItem(S); },
        saveKey() { return user ? BASE + ':u:' + user : BASE; },
        async register(name, pw) {
            name = clean(name);
            if (!/^[a-z0-9_]{3,16}$/.test(name)) return 'Username: 3-16 letters, numbers or _';
            if ((pw || '').length < 4) return 'Password must be at least 4 characters';
            const users = ld(U, {});
            if (users[name]) return 'That pilot name is already taken';
            const salt = Math.random().toString(36).slice(2);
            users[name] = { salt, hash: await hash(salt, pw) };
            localStorage.setItem(U, JSON.stringify(users));
            user = name; localStorage.setItem(S, name); return null;
        },
        async login(name, pw) {
            name = clean(name); const u = ld(U, {})[name];
            if (!u || u.hash !== await hash(u.salt, pw || '')) return 'Wrong pilot name or password';
            user = name; localStorage.setItem(S, name); return null;
        },
        guest() { user = null; localStorage.setItem(S, 'guest'); },
        logout() { user = null; localStorage.removeItem(S); },
        addScore(score, contracts, dist, lvl) {
            const all = ld(L, []), me = user || 'Guest';
            const prev = Math.max(0, ...all.filter(e => e.u === me).map(e => e.s));
            all.push({ u: me, s: score, c: contracts, d: dist, l: lvl || 1, t: Date.now() });
            all.sort((a, b) => b.s - a.s);
            localStorage.setItem(L, JSON.stringify(all.slice(0, 50)));
            return { prev, isNew: score > prev && score > 0, best: Math.max(prev, score) };
        },
        // Best run per player, highest first
        top(n = 5) {
            const seen = new Set(), out = [];
            for (const e of ld(L, [])) { if (!seen.has(e.u)) { seen.add(e.u); out.push(e); } if (out.length >= n) break; }
            return out;
        },
        position() { const me = user || 'Guest', t = this.top(100), i = t.findIndex(e => e.u === me); return { pos: i + 1, total: t.length }; },
        best() { const me = user || 'Guest'; return Math.max(0, ...ld(L, []).filter(e => e.u === me).map(e => e.s)); }
    };
})();

(function wireAuthUI() {
    const $ = id => document.getElementById(id);
    const show = (id, on) => { $(id).classList.toggle('hidden', !on); $(id).classList.toggle('flex', on); };
    let mode = 'login';

    function refreshBar() {
        $('accName').textContent = Auth.user ? Auth.user.toUpperCase() : 'GUEST';
        $('accBtn').textContent = Auth.user ? 'LOG OUT' : 'LOG IN';
        $('accBest').textContent = 'BEST ' + Auth.best();
        $('accAvatar').textContent = (Auth.user || 'G')[0].toUpperCase();
        if (typeof loadSaveData === 'function') loadSaveData();
    }
    function setMode(m) {
        mode = m; $('authErr').textContent = '';
        $('authTabLogin').classList.toggle('on', m === 'login');
        $('authTabReg').classList.toggle('on', m === 'register');
        $('authSubmit').textContent = m === 'login' ? 'LOG IN' : 'CREATE ACCOUNT';
        $('authHint').textContent = m === 'register' ? '3-16 letters, numbers or _  |  password 4+ characters' : '';
        $('authPass').autocomplete = m === 'login' ? 'current-password' : 'new-password';
    }
    function openAuth(m) { setMode(m || 'login'); $('authUser').value = $('authPass').value = ''; $('authPass').type = 'password'; show('authMenu', true); }

    $('authTabLogin').onclick = () => setMode('login');
    $('authTabReg').onclick = () => setMode('register');
    $('authEye').onclick = () => { const p = $('authPass'); p.type = p.type === 'password' ? 'text' : 'password'; };
    $('authGuest').onclick = () => { Auth.guest(); show('authMenu', false); refreshBar(); };
    $('authSubmit').onclick = async () => {
        const err = mode === 'login' ? await Auth.login($('authUser').value, $('authPass').value)
                                     : await Auth.register($('authUser').value, $('authPass').value);
        if (err) { $('authErr').textContent = err; return; }
        show('authMenu', false); refreshBar();
    };
    $('authPass').addEventListener('keydown', e => { if (e.key === 'Enter') $('authSubmit').click(); });
    $('accBtn').onclick = () => { Auth.logout(); if (typeof resetProgress === 'function') resetProgress(); openAuth('login'); };
    $('scoresBtn').onclick = () => {
        const rows = Auth.top(5);
        const MEDAL = [
            { bg: 'linear-gradient(135deg,#fde68a,#f59e0b)', fg: '#422006', score: '#fbbf24', row: 'rgba(245,158,11,.10)' },   // gold
            { bg: 'linear-gradient(135deg,#f1f5f9,#94a3b8)', fg: '#0f172a', score: '#e2e8f0', row: 'rgba(148,163,184,.10)' },  // silver
            { bg: 'linear-gradient(135deg,#fdba74,#b45309)', fg: '#431407', score: '#fb923c', row: 'rgba(180,83,9,.12)' }      // bronze
        ];
        $('lbList').innerHTML = rows.length ? rows.map((r, i) => {
            const m = MEDAL[i], me = r.u.toLowerCase() === (Auth.user || 'guest');
            const badge = m
                ? `<span class="w-7 h-7 shrink-0 rounded-full flex items-center justify-center font-orbitron text-xs font-bold" style="background:${m.bg};color:${m.fg};box-shadow:0 0 8px ${m.score}66">${i + 1}</span>`
                : `<span class="w-7 h-7 shrink-0 rounded-full flex items-center justify-center font-orbitron text-xs text-slate-400 border border-slate-700">${i + 1}</span>`;
            return `<div class="flex items-center gap-3 px-2 py-2 mb-1 rounded-lg" style="${m ? 'background:' + m.row : ''}">${badge}<span class="flex-1 truncate font-semibold ${me ? 'text-cyan-300' : 'text-slate-200'}">${r.u}</span><span class="text-[10px] font-orbitron text-slate-500">LV ${r.l || 1}</span><span class="font-orbitron font-bold" style="color:${m ? m.score : '#94a3b8'}">${r.s}</span></div>`;
        }).join('')
            : '<div class="text-slate-500 text-center py-4">No runs yet. Be the first!</div>';
        show('leaderboardMenu', true);
    };
    $('lbClose').onclick = () => show('leaderboardMenu', false);

    if (Auth.hasChosen) refreshBar(); else { refreshBar(); openAuth('login'); }
})();

if (window.matchMedia('(pointer: coarse)').matches) document.getElementById('ctrlBox').open = true;
