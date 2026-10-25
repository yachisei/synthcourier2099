/* Settings, vibration, achievements and the first-run tutorial. */
const Settings = (() => {
    const s = { shake: true, vibrate: true, autofire: false, music: 100, lefty: false, lowfx: false, lowfxChosen: false, popups: true };
    try { Object.assign(s, JSON.parse(localStorage.getItem('sc_settings')) || {}); } catch (e) {}
    return { get shake() { return s.shake; }, get vibrate() { return s.vibrate; }, get autofire() { return s.autofire; }, get music() { return s.music; }, get lefty() { return s.lefty; }, get lowfx() { return s.lowfx; }, get lowfxChosen() { return s.lowfxChosen; }, get popups() { return s.popups; },
        set(k, v) { s[k] = v; localStorage.setItem('sc_settings', JSON.stringify(s)); } };
})();
const Haptic = { buzz(p) { if (Settings.vibrate && navigator.vibrate) { try { navigator.vibrate(p); } catch (e) {} } } };

/* Low-effects mode: removes canvas glow (the most expensive effect) on slower phones. */
(function () {
    const d = Object.getOwnPropertyDescriptor(CanvasRenderingContext2D.prototype, 'shadowBlur');
    if (d && d.set) Object.defineProperty(CanvasRenderingContext2D.prototype, 'shadowBlur', { configurable: true, get() { return d.get.call(this); }, set(v) { d.set.call(this, Settings.lowfx ? 0 : v); } });
})();

/* ------------------------- PILOT LEVELS AND RANKS -------------------------- */
const Prog = (() => {
    let xp = 0;
    const need = l => 100 + 60 * (l - 1);                       // XP needed to go from level l to l+1
    const RANKS = [[1, 'ROOKIE', '#94a3b8'], [5, 'COURIER', '#22d3ee'], [10, 'PILOT', '#4ade80'], [15, 'VETERAN', '#fbbf24'], [20, 'ACE', '#f472b6'], [30, 'LEGEND', '#c084fc']];
    function info() { let l = 1, rest = xp; while (rest >= need(l)) { rest -= need(l); l++; } return { level: l, into: rest, need: need(l) }; }
    const rank = l => RANKS.filter(r => l >= r[0]).pop();
    function render() {
        const i = info(), r = rank(i.level), a = document.getElementById('accRank'); if (!a) return;
        a.textContent = r[1] + ' \u00b7 LV ' + i.level; a.style.color = r[2];
        document.getElementById('accXp').style.width = (i.into / i.need * 100).toFixed(0) + '%';
        const av = document.getElementById('accAvatar'); if (av) av.style.borderColor = r[2];
    }
    return {
        add(n) {
            const before = info().level; xp += Math.max(0, Math.floor(n)); const after = info().level;
            for (let l = before + 1; l <= after; l++) {
                credits += l * 100; const r = rank(l); Ach.logRun('Level ' + l + ' \u2022 ' + r[1]);
                Ach.toast({ icon: 'fa-arrow-up', name: 'LEVEL ' + l + ' \u2022 ' + r[1], reward: l * 100 }); Haptic.buzz([30, 40, 30, 40, 60]);
            }
            render();
        },
        runEnd(score) { const g = 20 + Math.floor(score / 20); this.add(g); return g; },
        level: () => info().level, rank: () => rank(info().level),
        info, render, dump: () => xp, load(v) { xp = +v || 0; render(); }, reset() { xp = 0; render(); }
    };
})();

/* ------------------------------ ACHIEVEMENTS ------------------------------ */
const Ach = (() => {
    const fresh = () => ({ u: {}, s: { contracts: 0, kills: 0, shields: 0, mines: 0, wormholes: 0, fortress: 0, tutorial: 0, dailies: 0, powerups: 0, abilities: 0, types: {}, runs: 0, bestCombo: 0, bestRunContracts: 0, bestRunDist: 0, bestScore: 0 } });
    let d = fresh(), ticks = 0, runLog = [], quiet = false;
    const tc = k => (d.s.types && d.s.types[k]) || 0;
    const maxUp = () => Math.max(1, ...Object.values(upgrades).map(Number).filter(n => !isNaN(n)));
    const DEFS = [
        { id: 'first',    icon: 'fa-box',            name: 'First Delivery',      desc: 'Complete your first contract',        goal: 1,    reward: 200,  p: () => d.s.contracts },
        { id: 'c10',      icon: 'fa-boxes-stacked',  name: 'Frequent Flyer',      desc: 'Complete 10 contracts',               goal: 10,   reward: 600,  p: () => d.s.contracts },
        { id: 'c50',      icon: 'fa-truck-fast',     name: 'Veteran Courier',     desc: 'Complete 50 contracts',               goal: 50,   reward: 2500, p: () => d.s.contracts },
        { id: 'run5',     icon: 'fa-fire',           name: 'On a Roll',           desc: 'Complete 5 contracts in one run',     goal: 5,    reward: 800,  p: () => d.s.bestRunContracts },
        { id: 'combo5',   icon: 'fa-bolt',           name: 'Combo Master',        desc: 'Reach a x5 delivery combo',           goal: 5,    reward: 700,  p: () => d.s.bestCombo },
        { id: 'k10',      icon: 'fa-skull',          name: 'Pirate Hunter',       desc: 'Destroy 10 enemies',                  goal: 10,   reward: 500,  p: () => d.s.kills },
        { id: 'k50',      icon: 'fa-skull-crossbones', name: 'Void Reaper',       desc: 'Destroy 50 enemies',                  goal: 50,   reward: 2000, p: () => d.s.kills },
        { id: 'boss',     icon: 'fa-chess-rook',     name: 'Fortress Breaker',    desc: 'Destroy a pirate fortress',           goal: 1,    reward: 1500, p: () => d.s.fortress },
        { id: 'dist',     icon: 'fa-road',           name: 'Long Haul',           desc: 'Fly 150 km in a single run',          goal: 150,  reward: 800,  p: () => d.s.bestRunDist },
        { id: 's2k',      icon: 'fa-star',           name: 'Rising Star',         desc: 'Score 2,000 in a single run',         goal: 2000, reward: 600,  p: () => d.s.bestScore },
        { id: 's8k',      icon: 'fa-crown',          name: 'Legend of the Lanes', desc: 'Score 8,000 in a single run',         goal: 8000, reward: 2000, p: () => d.s.bestScore },
        { id: 'shield5',  icon: 'fa-shield-halved',  name: 'Shields Up',          desc: 'Use your shield 5 times',             goal: 5,    reward: 300,  p: () => d.s.shields },
        { id: 'mine10',   icon: 'fa-bomb',           name: 'Mine Layer',          desc: 'Deploy 10 mines',                     goal: 10,   reward: 300,  p: () => d.s.mines },
        { id: 'worm3',    icon: 'fa-hurricane',      name: 'Wormhole Hopper',     desc: 'Jump through 3 wormholes',            goal: 3,    reward: 400,  p: () => d.s.wormholes },
        { id: 'skins3',   icon: 'fa-rocket',         name: 'Collector',           desc: 'Unlock 3 ship skins',                 goal: 3,    reward: 800,  p: () => SHIP_SKINS.filter(s => s.unlocked && !s._d).length },
        { id: 'trail1',   icon: 'fa-palette',        name: 'Stylist',             desc: 'Unlock a thruster trail color',       goal: 1,    reward: 300,  p: () => TRAIL_COLORS.filter(t => t.unlocked && !t._d).length },
        { id: 'up4',      icon: 'fa-wrench',         name: 'Tuned Up',            desc: 'Upgrade any system to level 4',       goal: 4,    reward: 600,  p: () => maxUp() },
        { id: 'smug3',     icon: 'fa-user-secret',    name: 'Smuggler',            desc: 'Complete 3 smuggling contracts',      goal: 3,    reward: 600,  p: () => tc('SMUGGLE') },
        { id: 'race3',     icon: 'fa-flag-checkered', name: 'Gate Runner',         desc: 'Complete 3 checkpoint races',         goal: 3,    reward: 600,  p: () => tc('RACE') },
        { id: 'bounty3',   icon: 'fa-crosshairs',     name: 'Bounty Hunter',       desc: 'Complete 3 bounty contracts',         goal: 3,    reward: 600,  p: () => tc('BOUNTY') },
        { id: 'rescue5',   icon: 'fa-life-ring',      name: 'Rescue Ranger',       desc: 'Complete 5 rescue contracts',         goal: 5,    reward: 500,  p: () => tc('RESCUE') },
        { id: 'escort5',   icon: 'fa-shield-heart',   name: 'Escort Captain',      desc: 'Complete 5 escort contracts',         goal: 5,    reward: 500,  p: () => tc('ESCORT') },
        { id: 'rush5',     icon: 'fa-stopwatch',      name: 'Rush Hour',           desc: 'Complete 5 rush contracts',           goal: 5,    reward: 500,  p: () => tc('RUSH') },
        { id: 'fragile5',  icon: 'fa-wine-glass',     name: 'Gentle Hands',        desc: 'Complete 5 fragile contracts',        goal: 5,    reward: 500,  p: () => tc('FRAGILE') },
        { id: 'allround',  icon: 'fa-medal',          name: 'Jack of All Trades',  desc: 'Finish every contract type once',     goal: 8,    reward: 2000, p: () => ['STANDARD', 'RUSH', 'FRAGILE', 'RESCUE', 'ESCORT', 'SMUGGLE', 'RACE', 'BOUNTY'].filter(k => tc(k) > 0).length },
        { id: 'c25',       icon: 'fa-boxes-packing',  name: 'Seasoned Courier',    desc: 'Complete 25 contracts',               goal: 25,   reward: 1200, p: () => d.s.contracts },
        { id: 'c100',      icon: 'fa-trophy',         name: 'Master Courier',      desc: 'Complete 100 contracts',              goal: 100,  reward: 5000, p: () => d.s.contracts },
        { id: 'k100',      icon: 'fa-ghost',          name: 'Pirate Bane',         desc: 'Destroy 100 enemies',                 goal: 100,  reward: 3000, p: () => d.s.kills },
        { id: 's15k',      icon: 'fa-gem',            name: 'Mythic Runner',       desc: 'Score 15,000 in a single run',        goal: 15000, reward: 4000, p: () => d.s.bestScore },
        { id: 'dist300',   icon: 'fa-satellite',      name: 'Deep Space Voyager',  desc: 'Fly 300 km in a single run',          goal: 300,  reward: 2000, p: () => d.s.bestRunDist },
        { id: 'lv10',      icon: 'fa-ranking-star',   name: 'Seasoned Pilot',      desc: 'Reach pilot level 10',                goal: 10,   reward: 1000, p: () => Prog.level() },
        { id: 'lv20',      icon: 'fa-crown',          name: 'Ace Pilot',           desc: 'Reach pilot level 20',                goal: 20,   reward: 3000, p: () => Prog.level() },
        { id: 'skins10',   icon: 'fa-rocket',         name: 'Fleet Owner',         desc: 'Unlock 10 ship skins',                goal: 10,   reward: 3000, p: () => SHIP_SKINS.filter(s => s.unlocked && !s._d).length },
        { id: 'skinsAll',  icon: 'fa-warehouse',      name: 'Hangar Queen',        desc: 'Unlock every ship skin',              get goal() { return SHIP_SKINS.length - 1; }, reward: 10000, p: () => SHIP_SKINS.filter(s => s.unlocked && !s._d).length },
        { id: 'trails5',   icon: 'fa-wand-magic-sparkles', name: 'Trail Blazer',   desc: 'Unlock 5 thruster trail colors',      goal: 5,    reward: 800,  p: () => TRAIL_COLORS.filter(t => t.unlocked && !t._d).length },
        { id: 'up8',       icon: 'fa-screwdriver-wrench', name: 'Maxed Out',       desc: 'Max out one system upgrade',          get goal() { return MAX_LVL; }, reward: 2000, p: () => maxUp() },
        { id: 'rich',      icon: 'fa-sack-dollar',    name: 'Tycoon',              desc: 'Hold 50,000 credits at once',         goal: 50000, reward: 1000, p: () => credits },
        { id: 'power25',   icon: 'fa-bolt-lightning', name: 'Power Hungry',        desc: 'Collect 25 power-ups',                goal: 25,   reward: 1000, p: () => d.s.powerups },
        { id: 'ab50',      icon: 'fa-hat-wizard',     name: 'Ability Master',      desc: 'Use your ship ability 50 times',      goal: 50,   reward: 800,  p: () => d.s.abilities },
        { id: 'worm15',    icon: 'fa-hurricane',      name: 'Portal Hopper',       desc: 'Jump through 15 wormholes',           goal: 15,   reward: 700,  p: () => d.s.wormholes },
        { id: 'mine50',    icon: 'fa-bomb',           name: 'Minefield',           desc: 'Deploy 50 mines',                     goal: 50,   reward: 600,  p: () => d.s.mines },
        { id: 'shield25',  icon: 'fa-shield',         name: 'Unbreakable',         desc: 'Use your shield 25 times',            goal: 25,   reward: 600,  p: () => d.s.shields },
        { id: 'daily10',   icon: 'fa-calendar-days',  name: 'Daily Devotee',       desc: 'Complete 10 daily challenges',        goal: 10,   reward: 3000, p: () => d.s.dailies },
        { id: 'runs10',    icon: 'fa-repeat',         name: 'Regular',             desc: 'Play 10 runs',                        goal: 10,   reward: 400,  p: () => d.s.runs },
        { id: 'runs50',    icon: 'fa-infinity',       name: 'Lifer',               desc: 'Play 50 runs',                        goal: 50,   reward: 1500, p: () => d.s.runs },
        { id: 'ab15',      icon: 'fa-wand-magic-sparkles', name: 'Special Agent',   desc: 'Use your ship ability 15 times',      goal: 15,   reward: 400,  p: () => d.s.abilities },
        { id: 'power5',    icon: 'fa-bolt-lightning', name: 'Power Player',        desc: 'Collect 5 power-ups',                 goal: 5,    reward: 500,  p: () => d.s.powerups },
        { id: 'daily3',    icon: 'fa-calendar-check', name: 'Daily Driver',        desc: 'Complete 3 daily challenges',         goal: 3,    reward: 1000, p: () => d.s.dailies },
        { id: 'rookie',   icon: 'fa-graduation-cap', name: 'Rookie Courier',      desc: 'Finish the flight tutorial',          goal: 1,    reward: 300,  p: () => d.s.tutorial }
    ];
    const $ = id => document.getElementById(id);
    const count = () => { const e = $('achCount'); if (e) e.textContent = DEFS.filter(x => d.u[x.id]).length + '/' + DEFS.length; };

    // Pop-ups wait in a queue and show one at a time. During play they are small, sit under the contract card,
    // and merge into a single summary if several pile up, so they never cover the screen.
    const toastQ = []; let toastBusy = false;
    function pump() {
        const box = $('achToasts'); if (!box || toastBusy || !toastQ.length) return;
        const playing = typeof gameState !== 'undefined' && gameState === 'PLAYING';
        let def = toastQ.shift();
        if (toastQ.length >= 2) { const all = [def].concat(toastQ.splice(0)); def = { icon: 'fa-trophy', name: all.length + ' UNLOCKS', reward: all.reduce((a, d) => a + (d.reward || 0), 0), kicker: 'ACHIEVEMENTS & LEVELS' }; }
        box.classList.toggle('inplay', playing);
        const t = document.createElement('div'); t.className = 'ach-toast' + (playing ? ' compact' : '');
        t.innerHTML = `<span class="ach-medal"><i class="fa-solid ${def.icon}"></i></span><div><div class="ach-kicker">${def.kicker || 'ACHIEVEMENT UNLOCKED'}</div><div class="ach-title">${def.name}</div></div><span class="ach-rew">${def.reward ? '+' + def.reward + ' CR' : (def.note || '')}</span>`;
        box.appendChild(t); toastBusy = true;
        setTimeout(() => { t.remove(); toastBusy = false; pump(); }, playing ? 2300 : 3800);
    }
    function toast(def) {
        if (!$('achToasts') || quiet) return;
        if (typeof gameState !== 'undefined' && gameState === 'PLAYING' && !Settings.popups) return;
        toastQ.push(def); pump();
    }
    function unlock(def, fromSave) {
        d.u[def.id] = Date.now(); credits += def.reward; Prog.add(100); runLog.push(def.name + ' +' + def.reward);
        count(); toast(def); Haptic.buzz([40, 60, 40]); try { sound.playPickup(); } catch (e) {}
        if (!fromSave) saveGameData();
    }
    function check(fromSave) {
        if (gameState === 'PLAYING') {
            const s = d.s;
            s.bestRunContracts = Math.max(s.bestRunContracts, runContracts); s.bestRunDist = Math.max(s.bestRunDist, Math.floor(runDistance));
            s.bestScore = Math.max(s.bestScore, calcScore()); s.bestCombo = Math.max(s.bestCombo, combo);
        }
        DEFS.forEach(def => { if (!d.u[def.id] && def.p() >= def.goal) unlock(def, fromSave); });
        Daily.check(fromSave);
    }
    function render() {
        const done = DEFS.filter(x => d.u[x.id]).length;
        $('achCount').textContent = done + '/' + DEFS.length; $('achHead').textContent = done + ' / ' + DEFS.length + ' UNLOCKED';
        const sorted = [...DEFS].sort((a, b) => (d.u[b.id] ? 1 : 0) - (d.u[a.id] ? 1 : 0));
        $('achList').innerHTML = sorted.map(x => {
            const got = !!d.u[x.id], pr = Math.min(x.p(), x.goal);
            return `<div class="ach-item ${got ? 'got' : ''}"><span class="ach-ico"><i class="fa-solid ${got ? x.icon : 'fa-lock'}"></i></span>
                <div class="ach-body"><div class="ach-name">${x.name}</div><div class="ach-desc">${x.desc}</div>
                <div class="ach-bar"><i style="width:${(pr / x.goal * 100).toFixed(0)}%"></i></div></div>
                <div class="ach-side">${got ? '<span class="ach-done"><i class="fa-solid fa-check"></i></span>' : `<span class="ach-prog">${pr >= 1000 ? (pr / 1000).toFixed(1) + 'k' : pr}/${x.goal >= 1000 ? x.goal / 1000 + 'k' : x.goal}</span>`}<span class="ach-cr">+${x.reward} CR</span></div></div>`;
        }).join('');
    }
    return {
        ev(type, n) {
            const s = d.s;
            if (type === 'delivery') { s.contracts++; Prog.add(40); } else if (type === 'kill') { s.kills++; Prog.add(5); Daily.ev('kill'); }
            else if (type === 'fortress') { s.fortress++; s.kills++; Prog.add(150); Daily.ev('kill'); } else if (type === 'shield') s.shields++;
            else if (type === 'mine') s.mines++; else if (type === 'wormhole') s.wormholes++;
            else if (type === 'tutorial') s.tutorial = 1; else if (type === 'daily') s.dailies++; else if (type === 'powerup') { s.powerups++; Prog.add(5); } else if (type === 'ability') s.abilities++;
            else if (type.indexOf('del:') === 0) { const k = type.slice(4); s.types[k] = (s.types[k] || 0) + 1; } else if (type === 'combo') s.bestCombo = Math.max(s.bestCombo, n || 0);
            check(false);
        },
        tick() { if (++ticks % 60 === 0) check(false); },
        check, runEnd() { d.s.runs++; check(false); },
        dump() { return d; }, load(v) { d = fresh(); if (v && v.u) { d.u = v.u; Object.assign(d.s, v.s || {}); } d.s.types = d.s.types || {}; count(); },
        reset() { d = fresh(); count(); }, render, toast,
        quiet(v) { quiet = v; }, beginRun() { runLog = []; }, logRun(t) { runLog.push(t); }, runLog: () => runLog, total: () => DEFS.length,
        done: () => DEFS.filter(x => d.u[x.id]).length
    };
})();

/* ------------------------------ DAILY CHALLENGE ---------------------------- */
const Daily = (() => {
    let st = { d: '', ok: 0 }, kills = 0;
    const today = () => { const n = new Date(); return n.getFullYear() + '-' + String(n.getMonth() + 1).padStart(2, '0') + '-' + String(n.getDate()).padStart(2, '0'); };
    const POOL = [
        { f: n => `Complete ${n} contracts in one run`, v: [3, 4, 5],          p: () => runContracts },
        { f: n => `Destroy ${n} enemies in one run`,    v: [5, 8, 12],         p: () => kills },
        { f: n => `Fly ${n} km in one run`,             v: [60, 90, 120],      p: () => Math.floor(runDistance) },
        { f: n => `Score ${n} points in one run`,       v: [1500, 2500, 3500], p: () => calcScore() },
        { f: n => `Reach a x${n} delivery combo`,       v: [3, 4, 5],          p: () => combo }
    ];
    const REWARD = [500, 800, 1100];
    function info() {
        let h = 0; for (const c of today()) h = (h * 31 + c.charCodeAt(0)) >>> 0;
        const def = POOL[h % POOL.length], tier = (h >> 4) % 3;
        return { text: def.f(def.v[tier]), goal: def.v[tier], reward: REWARD[tier], prog: def.p };
    }
    const sync = () => { if (st.d !== today()) st = { d: today(), ok: 0 }; };
    function render() {
        sync(); const i = info(), t = document.getElementById('dailyText'); if (!t) return;
        t.textContent = i.text + '  (+' + i.reward + ' CR)';
        const s = document.getElementById('dailyState'); s.textContent = st.ok ? 'DONE \u2713' : 'TODAY'; s.style.color = st.ok ? '#4ade80' : '#fbbf24';
        document.getElementById('dailyStrip').classList.toggle('done', !!st.ok);
    }
    return {
        begin() { kills = 0; render(); },
        ev(type) { if (type === 'kill') kills++; },
        check(fromSave) {
            sync(); if (st.ok || gameState !== 'PLAYING') return;
            const i = info(); if (i.prog() < i.goal) return;
            st.ok = 1; credits += i.reward; Ach.toast({ icon: 'fa-calendar-day', name: 'DAILY CHALLENGE DONE', reward: i.reward });
            Haptic.buzz([40, 60, 40]); try { sound.playPickup(); } catch (e) {}
            render(); Prog.add(150); Ach.logRun('Daily challenge +' + i.reward); Ach.ev('daily'); if (!fromSave) saveGameData();
        },
        render, dump() { return st; }, load(v) { st = v && v.d ? v : { d: '', ok: 0 }; render(); }, reset() { st = { d: '', ok: 0 }; render(); }
    };
})();

/* -------------------- AUTO LOW-EFFECTS FOR SLOW DEVICES -------------------- */
const AutoPerf = (() => {
    let acc = 0, frames = 0, last = 0, slow = 0, done = false;
    // Weak phones (few CPU cores / little memory) start in low-effects mode, silently.
    const weak = (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) || (navigator.deviceMemory && navigator.deviceMemory <= 3);
    if (!Settings.lowfxChosen && !Settings.lowfx && weak && window.matchMedia('(pointer: coarse)').matches) Settings.set('lowfx', true);
    return {
        // Called every frame. If play stays under ~40 FPS for two measuring windows, switch low effects on.
        frame(now) {
            if (done || Settings.lowfx || Settings.lowfxChosen) return;
            if (typeof gameState === 'undefined' || gameState !== 'PLAYING') { last = 0; acc = 0; frames = 0; return; }
            if (last) { const dt = now - last; if (dt > 250) { acc = 0; frames = 0; } else { acc += dt; frames++; } }
            last = now;
            if (acc >= 2500) {
                const fps = frames * 1000 / acc; acc = 0; frames = 0;
                if (fps < 40) {
                    if (++slow >= 2) {
                        done = true; Settings.set('lowfx', true); document.body.classList.add('lowfx');
                        const cb = document.getElementById('setLowfx'); if (cb) cb.checked = true;
                        Ach.toast({ kicker: 'SLOW DEVICE DETECTED', icon: 'fa-gauge-high', name: 'LOW EFFECTS ON', note: 'AUTO' });
                    }
                } else slow = 0;
            }
        }
    };
})();

/* -------------------------------- TUTORIAL -------------------------------- */
const Tut = (() => {
    let done = false, step = 0, on = false, st = {}, lx = 0, ly = 0, la = 0, hold = 0;
    const touch = () => window.matchMedia('(pointer: coarse)').matches;
    const $ = id => document.getElementById(id);
    const STEPS = [
        { t: 'MOVE',    x: () => touch() ? 'Drag your ' + (Settings.lefty ? 'RIGHT' : 'LEFT') + ' thumb anywhere to steer and thrust.' : 'Hold W to thrust. A / D slide sideways and S brakes.', p: () => st.moved / 400 },
        { t: 'AIM',     x: () => touch() ? 'Touch and drag on the ' + (Settings.lefty ? 'LEFT' : 'RIGHT') + ' side of the screen to aim.' : 'Move the mouse to aim. Your ship turns toward the cursor.', p: () => st.turned / 3 },
        { t: 'FIRE',    x: () => touch() ? 'Hold the big FIRE button to shoot lasers.' : 'Click (or hold J) to fire lasers. Watch your engine heat.', p: () => st.shots / 4 },
        { t: 'BOOST',   x: () => touch() ? 'Keep thrusting with the joystick and hold BOOST.' : 'Thrust with W and hold SHIFT (or SPACE) for hyper boost.', p: () => st.boost / 40 },
        { t: 'DEFEND',  x: () => touch() ? 'Tap SHIELD, then MINE, to try both.' : 'Press E for a shield and Q to drop a mine.', p: () => ((st.shield ? 1 : 0) + (st.mine ? 1 : 0)) / 2 },
        { t: 'ABILITY', x: () => touch() ? 'Tap ABILITY (amber button) to use your ship\'s special move.' : 'Press R to use your ship\'s special ability. It recharges.', p: () => (st.ability ? 1 : 0) },
        { t: 'DELIVER', x: () => 'Follow the arrow to the pickup, grab the cargo and deliver it to earn credits.', p: () => (runContracts >= 1 ? 1 : 0) }
    ];
    function refresh() {
        const s = STEPS[step]; if (!s) return;
        $('tutStep').textContent = 'STEP ' + (step + 1) + ' / ' + STEPS.length; $('tutTitle').textContent = s.t; $('tutText').textContent = s.x();
        $('tutBar').style.width = '0%';
    }
    function finish(skipped) {
        done = true; on = false; $('tutCard').classList.add('hidden');
        if (!skipped) { Ach.ev('tutorial'); }
        saveGameData();
    }
    return {
        get done() { return done; },
        begin() {
            if (done) { $('tutCard').classList.add('hidden'); on = false; return; }
            on = true; st = { moved: 0, turned: 0, shots: 0, boost: 0 }; lx = player.x; ly = player.y; la = player.angle; hold = 0;
            $('tutCard').classList.remove('hidden'); refresh();
        },
        hide() { on = false; $('tutCard').classList.add('hidden'); },
        update() {
            if (!on) return;
            const dx = Math.hypot(player.x - lx, player.y - ly); if (dx < 60) st.moved += dx; lx = player.x; ly = player.y;
            const da = Math.atan2(Math.sin(player.angle - la), Math.cos(player.angle - la)); st.turned += Math.abs(da); la = player.angle;
            if (player.isBoosting) st.boost++;
            const pr = Math.max(0, Math.min(1, STEPS[step].p())); $('tutBar').style.width = (pr * 100).toFixed(0) + '%';
            if (pr >= 1 && ++hold > 30) {
                hold = 0; step++;
                if (step >= STEPS.length) { finish(false); return; }
                st = { moved: 0, turned: 0, shots: 0, boost: 0 }; Haptic.buzz(25); refresh();
            }
        },
        ev(type) { if (!on) return; if (type === 'fire') st.shots++; else if (type === 'shield') st.shield = 1; else if (type === 'mine') st.mine = 1; else if (type === 'ability') st.ability = 1; },
        skip() { finish(true); },
        load(v) { done = !!v; step = 0; }, dump() { return done; }, reset() { done = false; step = 0; on = false; },
        replay() { done = false; step = 0; saveGameData(); }
    };
})();

/* -------------------------------- UI wiring ------------------------------- */
(function wireFeatures() {
    const $ = id => document.getElementById(id);
    const show = (id, on) => { $(id).classList.toggle('hidden', !on); $(id).classList.toggle('flex', on); };
    $('achBtn').onclick = () => { Ach.render(); show('achMenu', true); };
    $('achClose').onclick = () => show('achMenu', false);
    $('tutSkip').onclick = () => Tut.skip();
    $('replayTutBtn').onclick = () => { Tut.replay(); $('replayTutBtn').textContent = 'TUTORIAL WILL START ON NEXT LAUNCH'; };
    const sh = $('setShake'), vb = $('setVibrate');
    sh.checked = Settings.shake; vb.checked = Settings.vibrate;
    sh.onchange = () => Settings.set('shake', sh.checked); vb.onchange = () => { Settings.set('vibrate', vb.checked); if (vb.checked) Haptic.buzz(30); };
    if (!navigator.vibrate) vb.closest('label').style.display = 'none';
    $('achCount').textContent = Ach.done() + '/' + Ach.total();
    // music volume, auto-fire, fullscreen, install, reset
    const ms = $('musicSlider'), af = $('setAutofire');
    ms.value = Settings.music; ms.oninput = () => { Settings.set('music', +ms.value); if (typeof Music !== 'undefined') Music.setVol(ms.value / 100); };
    const fs = $('fsBtn'), root = document.documentElement;
    if (!(root.requestFullscreen || root.webkitRequestFullscreen)) fs.style.display = 'none';
    fs.onclick = async () => {
        try {
            if (document.fullscreenElement || document.webkitFullscreenElement) { (document.exitFullscreen || document.webkitExitFullscreen).call(document); return; }
            await (root.requestFullscreen || root.webkitRequestFullscreen).call(root);
            if (screen.orientation && screen.orientation.lock) screen.orientation.lock('landscape').catch(() => {});
        } catch (e) {}
    };
    let installEvt = null;
    window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); installEvt = e; $('installBtn').classList.remove('hidden'); });
    $('installBtn').onclick = async () => { if (installEvt) { installEvt.prompt(); installEvt = null; $('installBtn').classList.add('hidden'); } };
    window.addEventListener('appinstalled', () => $('installBtn').classList.add('hidden'));
    $('resetBtn').onclick = () => {
        if (!confirm('Reset all progress for ' + (Auth.user || 'Guest') + '? Credits, upgrades, skins and achievements are erased. High scores stay.')) return;
        localStorage.removeItem(Auth.saveKey()); loadSaveData();
        const b = $('resetBtn'); b.textContent = 'PROGRESS RESET'; setTimeout(() => { b.textContent = 'RESET MY PROGRESS'; }, 2500);
    };
    Daily.render();

    // ---- backup code (export / import) ----
    const chk = t => { let h = 0; for (let i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) >>> 0; return h.toString(36); };
    const makeCode = () => {
        saveGameData(); const raw = localStorage.getItem(Auth.saveKey()) || '{}';
        const b = btoa(unescape(encodeURIComponent(JSON.stringify({ v: 1, n: Auth.user || 'guest', t: Date.now(), d: raw, sc: Auth.myScores(10) }))));
        return 'SC1.' + b + '.' + chk(b);
    };
    const readCode = code => {
        const p = code.trim().replace(/\s+/g, '').split('.');
        if (p.length !== 3 || p[0] !== 'SC1' || chk(p[1]) !== p[2]) throw new Error('That code is not valid, or part of it is missing.');
        const o = JSON.parse(decodeURIComponent(escape(atob(p[1])))), d = JSON.parse(o.d);
        if (typeof d.credits !== 'number') throw new Error('The code has no save data.');
        return o;
    };
    const bt = $('backupText'), bm = $('backupMsg');
    const msg = (t, ok) => { bm.textContent = t; bm.style.color = ok ? '#4ade80' : '#f472b6'; };
    $('exportBtn').onclick = () => {
        $('backupTitle').textContent = 'EXPORT SAVE'; $('backupHelp').textContent = 'Copy this code and keep it safe. Use IMPORT SAVE on any device to restore this pilot\'s progress.';
        bt.value = makeCode(); bt.readOnly = true; $('backupCopy').classList.remove('hidden'); $('backupRestore').classList.add('hidden'); msg('', true); show('backupMenu', true); bt.select();
    };
    $('importBtn').onclick = () => {
        $('backupTitle').textContent = 'IMPORT SAVE'; $('backupHelp').textContent = 'Paste a save code. This replaces the progress of the current pilot (' + (Auth.user || 'Guest') + ').';
        bt.value = ''; bt.readOnly = false; $('backupCopy').classList.add('hidden'); $('backupRestore').classList.remove('hidden'); msg('', true); show('backupMenu', true); bt.focus();
    };
    $('backupCopy').onclick = async () => {
        try { await navigator.clipboard.writeText(bt.value); } catch (e) { bt.select(); document.execCommand('copy'); }
        msg('Code copied!', true);
    };
    $('backupRestore').onclick = () => {
        try {
            const o = readCode(bt.value);
            if (!confirm('Replace the progress of ' + (Auth.user || 'Guest') + ' with this save? This cannot be undone.')) return;
            localStorage.setItem(Auth.saveKey(), o.d); loadSaveData();
            const n = Auth.importScores(o.sc); $('accBest').textContent = 'BEST ' + Auth.best();
            msg('Save restored!' + (n ? ' ' + n + ' high score' + (n > 1 ? 's' : '') + ' added.' : ''), true);
        } catch (e) { msg(e.message || 'Could not read that code.', false); }
    };
    $('backupClose').onclick = () => show('backupMenu', false);
    Prog.render();
    // in-game auto-fire toggle (HUD button / F key), left-handed and low-effects options
    const afBtn = $('autoFireBtn');
    window.setAutofire = (v, quiet) => {
        Settings.set('autofire', v); af.checked = v; afBtn.classList.toggle('on', v);
        $('autoFireLabel').textContent = v ? 'AUTO-FIRE: ON' : 'AUTO-FIRE: OFF'; Haptic.buzz(15);
        if (!quiet && typeof gameState !== 'undefined' && gameState === 'PLAYING') createFloatingText(v ? 'AUTO-FIRE ON' : 'AUTO-FIRE OFF', player.x, player.y - 34, v ? '#22d3ee' : '#94a3b8');
    };
    afBtn.onclick = () => window.setAutofire(!Settings.autofire);
    af.onchange = () => window.setAutofire(af.checked);
    window.setAutofire(Settings.autofire, true);
    const lf = $('setLefty'), lw = $('setLowfx');
    lf.checked = Settings.lefty; document.body.classList.toggle('lefty', Settings.lefty);
    lf.onchange = () => { Settings.set('lefty', lf.checked); document.body.classList.toggle('lefty', lf.checked); };
    lw.checked = Settings.lowfx; document.body.classList.toggle('lowfx', Settings.lowfx);
    lw.onchange = () => { Settings.set('lowfx', lw.checked); Settings.set('lowfxChosen', true); document.body.classList.toggle('lowfx', lw.checked); };
    const pp = $('setPopups'); pp.checked = Settings.popups; pp.onchange = () => Settings.set('popups', pp.checked);
    // settings window (from the main menu gear or the pause menu)
    $('settingsBtn').onclick = () => show('settingsMenu', true);
    $('pauseSettingsBtn').onclick = () => show('settingsMenu', true);
    $('setClose').onclick = () => show('settingsMenu', false);
    window.addEventListener('keydown', e => { if (e.code === 'Escape' && !$('settingsMenu').classList.contains('hidden')) { show('settingsMenu', false); e.stopImmediatePropagation(); e.preventDefault(); } }, true);
})();

/* ------------------------- ANIMATED HOME SCREEN BACKGROUND ------------------------- */
/* A deep-space scene built from the game's own pieces: a ringed planet, a station, a wormhole, drifting asteroids
   and now and then a courier being chased by pirates. */
const MenuFX = (() => {
    const cv = document.getElementById('menuBg'); if (!cv) return {};
    const c = cv.getContext('2d'), reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let w = 0, h = 0, u = 1, stars = [], rocks = [], run = null, nextRun = 3, last = 0, lastT = 0, shown = false, style = 'ring';
    const poly = n => Array.from({ length: n }, (_, i) => { const a = i / n * 6.283, r = 0.7 + Math.random() * 0.55; return [Math.cos(a) * r, Math.sin(a) * r]; });
    function resize() {
        w = cv.width = Math.round(innerWidth * 0.7); h = cv.height = Math.round(innerHeight * 0.7); u = Math.min(w, h) / 500;
        const low = Settings.lowfx;
        stars = Array.from({ length: low ? 70 : 150 }, () => ({ x: Math.random() * w, y: Math.random() * h, z: Math.random() < 0.6 ? 0 : Math.random() < 0.7 ? 1 : 2, tw: Math.random() * 6 }));
        rocks = Array.from({ length: low ? 5 : 9 }, () => ({ x: Math.random() * w, y: Math.random() * h, r: (7 + Math.random() * 20) * u, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4, v: 4 + Math.random() * 10, p: poly(9), d: 0.3 + Math.random() * 0.7 }));
        style = ['ring', 'hex', 'solar', 'tower'][Math.floor(Math.random() * 4)];
    }
    function nebula(x, y, r, col, a) { const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(${col},${a})`); g.addColorStop(1, `rgba(${col},0)`); c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2); }
    function ribbon(hist, t) {   // the same wavy glowing trail the ship has in game
        c.save(); c.globalCompositeOperation = 'lighter'; c.lineCap = 'round';
        for (let i = 1; i < hist.length; i++) {
            const p = i / hist.length, a = hist[i], b = hist[i - 1], wv = Math.sin(t * 6 - i * 0.5) * (1 + p * 5) * u;
            c.globalAlpha = Math.pow(1 - p, 1.4) * 0.9; c.strokeStyle = '#22d3ee'; c.lineWidth = ((1 - p) * 7 + 1) * u;
            c.beginPath(); c.moveTo(b.x, b.y + wv); c.lineTo(a.x, a.y + wv); c.stroke();
        }
        c.restore();
    }
    function ship(x, y, col, sc, flip) {
        c.save(); c.translate(x, y); c.scale(flip ? -sc : sc, sc); c.fillStyle = '#050a14'; c.strokeStyle = col; c.lineWidth = 2 / sc;
        c.beginPath(); c.moveTo(14, 0); c.lineTo(-10, -8); c.lineTo(-5, 0); c.lineTo(-10, 8); c.closePath(); c.fill(); c.stroke(); c.restore();
    }
    function draw(now) {
        const t = now / 1000, dt = Math.min(0.1, t - lastT || 0.033); lastT = t; const low = Settings.lowfx;
        // space + soft nebula clouds
        const bg = c.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, '#02030a'); bg.addColorStop(1, '#070a1c'); c.fillStyle = bg; c.fillRect(0, 0, w, h);
        nebula(w * 0.18 + Math.sin(t * 0.05) * 30 * u, h * 0.3, w * 0.5, '20,184,166', 0.11);
        nebula(w * 0.86 + Math.cos(t * 0.04) * 30 * u, h * 0.22, w * 0.45, '168,85,247', 0.12);
        nebula(w * 0.55, h * 1.0, w * 0.55, '37,99,235', 0.10);
        // far and mid stars
        for (const s of stars) {
            if (s.z === 2) continue;
            s.x -= (s.z ? 9 : 3) * dt; if (s.x < 0) { s.x = w; s.y = Math.random() * h; }
            c.globalAlpha = 0.35 + 0.55 * Math.abs(Math.sin(t * 1.2 + s.tw)); c.fillStyle = '#fff'; c.fillRect(s.x, s.y, s.z ? 1.4 : 0.9, s.z ? 1.4 : 0.9);
        }
        c.globalAlpha = 1;
        // ringed planet (bottom left)
        const pr = h * 0.46, px = w * 0.1, py = h * 1.0;
        const pg = c.createRadialGradient(px + pr * 0.35, py - pr * 0.45, pr * 0.1, px, py, pr); pg.addColorStop(0, '#26407a'); pg.addColorStop(0.55, '#0e1a3d'); pg.addColorStop(1, '#03050e');
        c.fillStyle = pg; c.beginPath(); c.arc(px, py, pr, 0, 6.283); c.fill();
        c.strokeStyle = 'rgba(103,232,249,.55)'; c.lineWidth = 2 * u; c.beginPath(); c.arc(px, py, pr, -1.35, -0.25); c.stroke();
        c.save(); c.translate(px, py); c.rotate(-0.22); c.strokeStyle = 'rgba(148,163,184,.35)'; c.lineWidth = 7 * u; c.beginPath(); c.ellipse(0, 0, pr * 1.5, pr * 0.3, 0, 3.3, 6.1); c.stroke();
        c.strokeStyle = 'rgba(103,232,249,.28)'; c.lineWidth = 2 * u; c.beginPath(); c.ellipse(0, 0, pr * 1.68, pr * 0.34, 0, 3.3, 6.1); c.stroke(); c.restore();
        // distant wormhole and station (drawn with the game's own drawing code)
        if (typeof drawPortal === 'function') drawPortal(c, { x: w * 0.3, y: h * 0.2, radius: 24 * u }, now);
        if (typeof STATION_DRAW !== 'undefined') {
            c.save(); c.translate(w * 0.83, h * 0.27); c.rotate(Math.sin(t * 0.1) * 0.05); c.lineWidth = 2.2; c.strokeStyle = '#00f3ff'; c.fillStyle = '#0b1020'; c.shadowColor = '#00f3ff'; c.shadowBlur = 10;
            c.globalAlpha = 0.9; STATION_DRAW[style](c, 30 * u, '#00f3ff', t); c.restore();
        }
        // asteroids: outlined like in the game
        for (const a of rocks) {
            a.x -= a.v * dt * a.d; a.rot += a.vr * dt; if (a.x < -a.r * 2) { a.x = w + a.r * 2; a.y = Math.random() * h; }
            c.save(); c.translate(a.x, a.y); c.rotate(a.rot); c.globalAlpha = 0.35 + a.d * 0.55; c.fillStyle = '#060c1c'; c.strokeStyle = '#38bdf8'; c.lineWidth = 1.6 * u;
            c.beginPath(); a.p.forEach((q, i) => c[i ? 'lineTo' : 'moveTo'](q[0] * a.r, q[1] * a.r)); c.closePath(); c.fill(); c.stroke(); c.restore();
        }
        c.globalAlpha = 1;
        // chase: a courier with the glowing trail, two pirates behind it firing
        if (!run && (nextRun -= dt) <= 0) { nextRun = 11 + Math.random() * 6; run = { x: -60 * u, y: h * (0.3 + Math.random() * 0.35), v: w / 9, hist: [], acc: 0, shots: [] }; }
        if (run) {
            run.x += run.v * dt; const y = run.y + Math.sin(t * 1.5) * 12 * u; run.acc += dt;
            if (run.acc > 0.03) { run.acc = 0; run.hist.unshift({ x: run.x - 10 * u, y }); if (run.hist.length > 34) run.hist.pop(); }
            ribbon(run.hist, t); ship(run.x, y, '#22d3ee', 1.25 * u, false);
            [[-120, -22], [-165, 30]].forEach(([dx, dy], i) => { const px2 = run.x + dx * u, py2 = y + (dy + Math.sin(t * 2 + i) * 6) * u; ship(px2, py2, '#f43f5e', 1.0 * u, false);
                if (Math.random() < dt * 1.6) run.shots.push({ x: px2 + 14 * u, y: py2 }); });
            run.shots = run.shots.filter(s => (s.x += w * 0.55 * dt) < w + 20);
            c.strokeStyle = '#fb7185'; c.lineWidth = 2 * u; for (const s of run.shots) { c.beginPath(); c.moveTo(s.x, s.y); c.lineTo(s.x + 14 * u, s.y); c.stroke(); }
            if (run.x > w + 260 * u) run = null;
        }
        // foreground sparkles + vignette so the menu stays readable
        for (const s of stars) { if (s.z !== 2) continue; s.x -= 18 * dt; if (s.x < 0) { s.x = w; s.y = Math.random() * h; } c.globalAlpha = 0.5 + 0.5 * Math.abs(Math.sin(t * 2 + s.tw)); c.fillStyle = '#e0f2fe'; c.fillRect(s.x, s.y, 2, 2); }
        c.globalAlpha = 1;
        const vg = c.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.3, w / 2, h / 2, Math.max(w, h) * 0.72); vg.addColorStop(0, 'rgba(2,3,10,0)'); vg.addColorStop(1, 'rgba(2,3,10,.62)'); c.fillStyle = vg; c.fillRect(0, 0, w, h);
    }
    function loop(now) {
        requestAnimationFrame(loop);
        const st = typeof gameState !== 'undefined' ? gameState : 'MENU', on = (st === 'MENU' || st === 'HANGAR') && !document.hidden;
        if (!on) { if (shown) { cv.style.display = 'none'; shown = false; } return; }
        if (!shown) { cv.style.display = 'block'; resize(); shown = true; if (reduce) draw(now); }
        if (reduce || now - last < 33) return;
        last = now; draw(now);
    }
    window.addEventListener('resize', () => { if (shown) { resize(); if (reduce) draw(performance.now()); } });
    requestAnimationFrame(loop);
    return {};
})();
