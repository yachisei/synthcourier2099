        /* ------------------------------------------------------------------
           SOUND SYNTHESIZER (Web Audio API - Procedural Audio)
           ------------------------------------------------------------------ */
        class SoundFX {
            constructor() {
                this.ctx = null;
                this.muted = false; this.vol = 0.8;
            }

            init() {
                if (!this.ctx) {
                    const AudioContext = window.AudioContext || window.webkitAudioContext;
                    this.ctx = new AudioContext(); const m = this.ctx.createGain(); m.gain.value = this.vol; m.connect(this.ctx.destination); this.master = m; Object.defineProperty(this.ctx, 'destination', { value: m });
                }
                if (this.ctx.state === 'suspended') {
                    this.ctx.resume();
                }
            }

            playLaser() {
                if (this.muted) return;
                this.init();
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(850, this.ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.15);

                gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);

                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start();
                osc.stop(this.ctx.currentTime + 0.15);
            }

            playExplosion() {
                if (this.muted) return;
                this.init();
                const bufferSize = this.ctx.sampleRate * 0.45;
                const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
                const data = buffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) {
                    data[i] = Math.random() * 2 - 1;
                }

                const noise = this.ctx.createBufferSource();
                noise.buffer = buffer;

                const filter = this.ctx.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(900, this.ctx.currentTime);
                filter.frequency.linearRampToValueAtTime(80, this.ctx.currentTime + 0.45);

                const gain = this.ctx.createGain();
                gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.45);

                noise.connect(filter);
                filter.connect(gain);
                gain.connect(this.ctx.destination);
                noise.start();
            }

            playPickup() {
                if (this.muted) return;
                this.init();
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(520, this.ctx.currentTime);
                osc.frequency.setValueAtTime(1040, this.ctx.currentTime + 0.1);

                gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.25);

                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start();
                osc.stop(this.ctx.currentTime + 0.25);
            }

            playWarning() {
                if (this.muted) return;
                this.init();
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'square';
                osc.frequency.setValueAtTime(300, this.ctx.currentTime);
                osc.frequency.setValueAtTime(150, this.ctx.currentTime + 0.1);

                gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);

                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start();
                osc.stop(this.ctx.currentTime + 0.2);
            }
        }

        const sound = new SoundFX();

        /* ------------------------------------------------------------------
           SHIP SKINS DATABASE (12 playable craft designs)
           ------------------------------------------------------------------ */
        const SHIP_SKINS = [
            { id: 'neon_vector', name: 'Neon Vector', cost: 0, unlocked: true, primaryColor: '#00f3ff', secondaryColor: '#ff007f', desc: 'Standard agile courier interceptor.' },
            { id: 'cyber_stealth', name: 'Cyber Stealth', cost: 1200, unlocked: false, primaryColor: '#a855f7', secondaryColor: '#3b82f6', desc: 'Reflective angular hull with low radar signature.' },
            { id: 'solar_flare', name: 'Solar Flare', cost: 2000, unlocked: false, primaryColor: '#f97316', secondaryColor: '#eab308', desc: 'Heat-resistant solar plating.' },
            { id: 'apex_interceptor', name: 'Apex Interceptor', cost: 3200, unlocked: false, primaryColor: '#ef4444', secondaryColor: '#f43f5e', desc: 'High velocity dual-swept wing frame.' },
            { id: 'void_runner', name: 'Void Runner', cost: 4800, unlocked: false, primaryColor: '#10b981', secondaryColor: '#06b6d4', desc: 'Dark matter thruster vectoring design.' },
            { id: 'quantum_ghost', name: 'Quantum Ghost', cost: 6000, unlocked: false, primaryColor: '#ec4899', secondaryColor: '#8b5cf6', desc: 'Phased quantum shield hull structure.' },
            { id: 'heavy_hauler', name: 'Heavy Hauler', cost: 8000, unlocked: false, primaryColor: '#eab308', secondaryColor: '#84cc16', desc: 'Reinforced heavy freight chassis.' },
            { id: 'crimson_phantom', name: 'Crimson Phantom', cost: 10000, unlocked: false, primaryColor: '#dc2626', secondaryColor: '#991b1b', desc: 'Aggressive racing craft frame.' },
            { id: 'galactic_spectre', name: 'Galactic Spectre', cost: 12000, unlocked: false, primaryColor: '#6366f1', secondaryColor: '#a855f7', desc: 'Sleek futuristic deep-space cruiser.' },
            { id: 'pulsar_drift', name: 'Pulsar Drift', cost: 16000, unlocked: false, primaryColor: '#14b8a6', secondaryColor: '#3b82f6', desc: 'High torque rotational drift vectoring.' },
            { id: 'hyperion_prime', name: 'Hyperion Prime', cost: 20000, unlocked: false, primaryColor: '#f59e0b', secondaryColor: '#ef4444', desc: 'Gold plated executive courier flagship.' },
            { id: 'omega_void', name: 'Omega Void', cost: 30000, unlocked: false, primaryColor: '#38bdf8', secondaryColor: '#f43f5e', desc: 'The ultimate cosmic courier vessel.' },
            { id: 'aurora_wing', name: 'Aurora Wing', cost: 14000, unlocked: false, primaryColor: '#34d399', secondaryColor: '#818cf8', desc: 'Shimmering spectrum exhaust.' },
            { id: 'inferno_king', name: 'Inferno King', cost: 20000, unlocked: false, primaryColor: '#fb923c', secondaryColor: '#dc2626', desc: 'Burns a roaring plume of fire.' },
            { id: 'frost_nova', name: 'Frost Nova', cost: 26000, unlocked: false, primaryColor: '#7dd3fc', secondaryColor: '#e0f2fe', desc: 'Glittering ice-crystal wake.' },
            { id: 'storm_caller', name: 'Storm Caller', cost: 34000, unlocked: false, primaryColor: '#facc15', secondaryColor: '#60a5fa', desc: 'Orbited by crackling plasma orbs.' },
            { id: 'nebula_drifter', name: 'Nebula Drifter', cost: 42000, unlocked: false, primaryColor: '#c084fc', secondaryColor: '#f472b6', desc: 'Wrapped in a drifting star halo.' },
            { id: 'eclipse_reaper', name: 'Eclipse Reaper', cost: 52000, unlocked: false, primaryColor: '#a3a3a3', secondaryColor: '#f43f5e', desc: 'Leaves a trail of void darkness.' },
            { id: 'solar_emperor', name: 'Solar Emperor', cost: 65000, unlocked: false, primaryColor: '#fde047', secondaryColor: '#fb923c', desc: 'Three suns circle the imperial hull.' },
            { id: 'cosmic_sovereign', name: 'Cosmic Sovereign', cost: 90000, unlocked: false, primaryColor: '#f0abfc', secondaryColor: '#22d3ee', desc: 'Rainbow wake, halo and orbiting stars.' },
            { id: 'dune_runner', name: 'Dune Runner', cost: 16000, unlocked: false, primaryColor: '#fcd34d', secondaryColor: '#d97706', desc: 'Desert-forged speedster built for long straights.' },
            { id: 'jade_serpent', name: 'Jade Serpent', cost: 18000, unlocked: false, primaryColor: '#4ade80', secondaryColor: '#a3e635', desc: 'Coiling emerald hull with a venom glow.' },
            { id: 'rose_comet', name: 'Rose Comet', cost: 22000, unlocked: false, primaryColor: '#fb7185', secondaryColor: '#fda4af', desc: 'Blushing comet dust follows every turn.' },
            { id: 'iron_wolf', name: 'Iron Wolf', cost: 24000, unlocked: false, primaryColor: '#94a3b8', secondaryColor: '#f97316', desc: 'Armor-plated gunship that never backs down.' },
            { id: 'arctic_fox', name: 'Arctic Fox', cost: 28000, unlocked: false, primaryColor: '#e0f2fe', secondaryColor: '#38bdf8', desc: 'Pale, quiet and nearly invisible on radar.' },
            { id: 'plasma_viper', name: 'Plasma Viper', cost: 30000, unlocked: false, primaryColor: '#e879f9', secondaryColor: '#22d3ee', desc: 'Strikes fast with a searing plasma tail.' },
            { id: 'midnight_monarch', name: 'Midnight Monarch', cost: 38000, unlocked: false, primaryColor: '#6366f1', secondaryColor: '#fbbf24', desc: 'Royal night-sky cruiser with orbiting crown lights.' },
            { id: 'abyss_lurker', name: 'Abyss Lurker', cost: 46000, unlocked: false, primaryColor: '#0ea5e9', secondaryColor: '#14b8a6', desc: 'Deep-void hunter wrapped in a dark aura.' },
            { id: 'phoenix_rising', name: 'Phoenix Rising', cost: 70000, unlocked: false, primaryColor: '#f97316', secondaryColor: '#fde047', desc: 'Reborn in flame after every crash.' },
            { id: 'titan_prime', name: 'Titan Prime', cost: 120000, unlocked: false, primaryColor: '#fafafa', secondaryColor: '#a855f7', desc: 'The final flagship: armored, radiant and unstoppable.' }
        ];

        const TRAIL_COLORS = [
            { id: 'none', hex: 'none', label: 'No Trail', cost: 0, unlocked: true },
            { id: 'cyan', hex: '#00f3ff', label: 'Neon Cyan', cost: 0, unlocked: true },
            { id: 'pink', hex: '#ff007f', label: 'Synth Pink', cost: 2000, unlocked: false },
            { id: 'amber', hex: '#f59e0b', label: 'Solar Amber', cost: 3000, unlocked: false },
            { id: 'emerald', hex: '#10b981', label: 'Emerald Plasma', cost: 4000, unlocked: false },
            { id: 'purple', hex: '#a855f7', label: 'Void Purple', cost: 5000, unlocked: false },
            { id: 'ice', hex: '#7dd3fc', label: 'Glacier Ice', cost: 7000, unlocked: false },
            { id: 'crimson', hex: '#ef4444', label: 'Blood Crimson', cost: 9000, unlocked: false },
            { id: 'gold', hex: '#fde047', label: 'Royal Gold', cost: 14000, unlocked: false },
            { id: 'rainbow', hex: 'rainbow', label: 'Prism Rainbow', cost: 30000, unlocked: false }
        ];
        const SKIN_EXTRA = {
            cyber_stealth:{fx:'ghost'}, solar_flare:{fx:'flame'}, apex_interceptor:{fx:'flame',perk:'boost'},
            void_runner:{fx:'void'}, quantum_ghost:{fx:'ghost',perk:'regen'}, heavy_hauler:{perk:'efficient'},
            crimson_phantom:{fx:'flame',perk:'boost'}, galactic_spectre:{fx:'orbit'}, pulsar_drift:{fx:'aura'},
            hyperion_prime:{fx:'sparkle',perk:'efficient'}, omega_void:{fx:'void aura',perk:'regen'},
            aurora_wing:{fx:'rainbow'}, inferno_king:{fx:'flame',perk:'boost'}, frost_nova:{fx:'sparkle',perk:'efficient'},
            storm_caller:{fx:'orbit',perk:'boost'}, nebula_drifter:{fx:'aura sparkle',perk:'regen'},
            eclipse_reaper:{fx:'void',perk:'regen'}, solar_emperor:{fx:'orbit sparkle',perk:'efficient'},
            cosmic_sovereign:{fx:'rainbow aura orbit',perk:'regen'},
            dune_runner:{fx:'flame',perk:'boost'}, jade_serpent:{fx:'aura',perk:'boost'}, rose_comet:{fx:'sparkle'}, iron_wolf:{perk:'efficient'},
            arctic_fox:{fx:'ghost sparkle',perk:'boost'}, plasma_viper:{fx:'flame'}, midnight_monarch:{fx:'orbit',perk:'regen'},
            abyss_lurker:{fx:'void aura',perk:'regen'}, phoenix_rising:{fx:'flame sparkle',perk:'regen'}, titan_prime:{fx:'rainbow orbit aura',perk:'regen'}
        };
        SHIP_SKINS.forEach(k => Object.assign(k, SKIN_EXTRA[k.id] || {}));
        const SKIN_STATS = { heavy_hauler:[1.5,0.85,1], apex_interceptor:[0.9,1.2,1.05], crimson_phantom:[0.85,1.15,1.15], void_runner:[1,1.05,1.1],
            pulsar_drift:[0.95,1,1.25], hyperion_prime:[1.2,1,1], omega_void:[1.2,1.15,1.1], cosmic_sovereign:[1.3,1.15,1.2], inferno_king:[1,1.1,1.1], storm_caller:[1.1,1.05,1.05] };
        const PERKS = { regen: 'Hull self-repair', efficient: '-30% fuel use', boost: 'Faster boost recharge' };
        Object.assign(SKIN_STATS, { dune_runner: [0.9, 1.2, 1.1], iron_wolf: [1.4, 0.9, 1.05], plasma_viper: [1, 1.15, 1.15], midnight_monarch: [1.15, 1.05, 1.1], phoenix_rising: [1.2, 1.1, 1.15], titan_prime: [1.4, 1.2, 1.2] });
        const curSkin = () => SHIP_SKINS.find(k => k.id === player.skin) || SHIP_SKINS[0];
        const trailCol = () => {
            if (player.trailColor === 'none') return '#00f3ff';
            return player.trailColor === 'rainbow' ? `hsl(${(performance.now() / 4) % 360},100%,60%)` : player.trailColor;
        };
        const UP_BASE = { weapon: 3000, shield: 1500, engine: 2000, fuel: 1200, cooling: 1800 }, MAX_LVL = 8;
        const upCost = (k, l) => Math.round(UP_BASE[k] * Math.pow(1.6, l - 1) / 50) * 50;
        const upTxt = (k, l) => l >= MAX_LVL ? 'MAX' : upCost(k, l) + ' CR';

        /* ------------------------------------------------------------------
           GAME ENGINE STATE & WORLD PARAMETERS
           ------------------------------------------------------------------ */
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        const miniCanvas = document.getElementById('minimapCanvas');
        const miniCtx = miniCanvas.getContext('2d');

        const WORLD_SIZE = 12000;
        let useNewtonianPhysics = true;

        // Player Spacecraft Mechanics
        let player = {
            x: WORLD_SIZE / 2,
            y: WORLD_SIZE / 2,
            vx: 0,
            vy: 0,
            angle: 0,
            radius: 18,
            thrustPower: 0.35,
            maxSpeed: 12,
            drag: 0.992, // Space coasting inertia friction
            hull: 100,
            maxHull: 100,
            fuel: 100,
            maxFuel: 100,
            fuelDrain: 0.02,
            boost: 100,
            maxBoost: 100,
            heat: 0,
            maxHeat: 100,
            coolingRate: 0.25,
            isBoosting: false,
            skin: 'neon_vector',
            trailColor: '#00f3ff'
        };

        // Player Upgrades Level
        let upgrades = {
            shieldLvl: 1,
            engineLvl: 1,
            fuelLvl: 1,
            coolingLvl: 1
        };

        let credits = 0;
        let totalContractsDone = 0;
        let totalDistanceTraveled = 0;
        let activeContract = null;

        // World Objects & Entities
        let stations = [];
        let asteroids = [];
        let turrets = [];
        let blackHoles = [];
        let solarFlares = [];
        let particles = [];
        let trailPts = [];   // recent tail positions for the wavy thruster trail
        let lasers = [];
        let floatingTexts = [];

        // Game Loop Controls
        let gameState = 'MENU';
        let keys = {};
        let mousePos = { x: 0, y: 0 };
        let viewZoom = 1;
        let camera = { x: 0, y: 0 };
        let screenShakeTime = 0;
let bosses=[], mines=[], nebulae=[], escort=null, eventTimer=3600, stationRep={}, diff=1;
const syncDiffUI = () => { const e = document.getElementById('diffSel'); if (e) e.value = diff; };
function useShield() { if (gameState === 'PLAYING' && shieldCd <= 0) { invuln = 180; shieldCd = 720; createFloatingText('SHIELD UP', player.x, player.y - 30, '#38bdf8'); Ach.ev('shield'); Tut.ev('shield'); Haptic.buzz(20); } }
function dropMine() { if (gameState === 'PLAYING' && mines.length < 4 && player.fuel > 3) { mines.push({ x: player.x, y: player.y, life: 1500 }); player.fuel -= 3; createFloatingText('MINE DEPLOYED', player.x, player.y - 30, '#f472b6'); Ach.ev('mine'); Tut.ev('mine'); Haptic.buzz(15); } }
let padE = false, padQ = false;
function startEscort(x, y) {
    escort = { x, y, vx: 0, vy: 0, hp: 40, angle: 0 };
    const crowd = pirates.filter(q => Math.hypot(q.x - x, q.y - y) < 1500).length, n = crowd >= 6 ? 1 : crowd >= 3 ? 2 : 3;
    for (let k = 0; k < n; k++) { const a = k * 2.1; pirates.push({ x: wclamp(x + Math.cos(a) * 700), y: wclamp(y + Math.sin(a) * 700), vx: 0, vy: 0, angle: 0, hp: 2, cd: 60, radius: 16 }); }
}
let respawnT = 720;
// Keeps the pirate population even: now and then one appears far from the player, away from other enemies and stations
function spawnFar() {
    for (let t = 0; t < 40; t++) {
        const x = 300 + Math.random() * (WORLD_SIZE - 600), y = 300 + Math.random() * (WORLD_SIZE - 600);
        if (Math.hypot(x - player.x, y - player.y) < 1800 || Math.hypot(x - WORLD_SIZE / 2, y - WORLD_SIZE / 2) < 600) continue;
        if (stations.some(s => Math.hypot(x - s.x, y - s.y) < 500) || pirates.some(q => Math.hypot(q.x - x, q.y - y) < 800)) continue;
        pirates.push({ x, y, vx: 0, vy: 0, angle: 0, hp: 2, cd: 60, radius: 16 }); return;
    }
}
const wclamp = v => Math.max(200, Math.min(WORLD_SIZE - 200, v));
function spawnPatrol(n) { for (let k = 0; k < n; k++) { const a = Math.random() * 6.283, d = 650 + Math.random() * 150; pirates.push({ x: wclamp(player.x + Math.cos(a) * d), y: wclamp(player.y + Math.sin(a) * d), vx: 0, vy: 0, angle: 0, hp: 2, cd: 40, radius: 16, s: true }); } }
function spawnBounty(n) { for (let k = 0; k < n; k++) { const a = k * (6.283 / n) + Math.random() * 0.5, d = 700 + Math.random() * 350; pirates.push({ x: wclamp(player.x + Math.cos(a) * d), y: wclamp(player.y + Math.sin(a) * d), vx: 0, vy: 0, angle: 0, hp: 4, cd: 60, radius: 20, b: true }); } }
const padSet = {};
let shieldCd=0, tpCd=0, bestContracts=0, pirates=[], crates=[], wormholes=[], musicStep=0;
let mouseDown=false, fireCd=0, invuln=0, combo=0, stranded=0, runContracts=0, runCredits=0, runDistance=0, acc=0;
const STEP=1/60;
const STARS=Array.from({length:160},()=>({x:Math.random(),y:Math.random(),z:0.1+Math.random()*0.4,s:0.5+Math.random()*1.5}));
function drawStars(){ctx.save();ctx.fillStyle='#fff';const w=canvas.width,h=canvas.height;
 STARS.forEach(t=>{const px=((t.x*w-camera.x*t.z)%w+w)%w+camera.x,py=((t.y*h-camera.y*t.z)%h+h)%h+camera.y;ctx.globalAlpha=0.3+t.z;ctx.fillRect(px,py,t.s,t.s);});ctx.restore();}

        /* ------------------------------------------------------------------
           INITIALIZATION & EVENT LISTENERS
           ------------------------------------------------------------------ */
        function resizeCanvas() {
            // Phones: render a larger world area (zoom out) so the camera shows more
            const small = window.matchMedia('(pointer: coarse)').matches || (window.innerHeight <= 520 && window.innerWidth <= 1000);
            viewZoom = small ? Math.max(0.6, Math.min(1, Math.min(window.innerWidth, window.innerHeight) / 590)) : 1;   // scales with the phone's size
            canvas.style.width = '100vw'; canvas.style.height = '100dvh';
            canvas.width = Math.round(window.innerWidth / viewZoom);
            canvas.height = Math.round(window.innerHeight / viewZoom);
            if (miniCanvas && miniCanvas.parentElement) {
                const rect = miniCanvas.parentElement.getBoundingClientRect();
                miniCanvas.width = rect.width || 192;
                miniCanvas.height = rect.height || 192;
            }
        }
        window.addEventListener('resize', resizeCanvas);

        window.addEventListener('keydown', (e) => {
            if (e.target && e.target.tagName === 'INPUT') return;
            keys[e.code] = true;

 if (e.code === 'KeyE' && !e.repeat) useShield();
 if (e.code === 'KeyQ' && !e.repeat) dropMine();
 if (e.code==='KeyM') sound.muted=!sound.muted;
 if (e.code === 'KeyF' && !e.repeat && gameState === 'PLAYING') window.setAutofire(!Settings.autofire);
 if (e.code === 'KeyR' && !e.repeat) useAbility();
 if (e.code === 'KeyP' || e.code === 'Escape') {
                if (gameState === 'PLAYING') pauseGame();
                else if (gameState === 'PAUSED') resumeGame();
            }
        });
        window.addEventListener('keyup', (e) => {
            keys[e.code] = false;
        });

        window.addEventListener('mousemove', (e) => {
            mousePos.x = e.clientX / viewZoom;
            mousePos.y = e.clientY / viewZoom;
        });
        window.addEventListener('mousedown', (e) => {
            if (e.button === 0) mouseDown = true;
        });
        window.addEventListener('mouseup', () => { mouseDown = false; });
        window.addEventListener('blur', () => { keys = {}; mouseDown = false; });
        document.addEventListener('visibilitychange', () => { if (document.hidden && gameState === 'PLAYING') pauseGame(); });

        // Save & Load Local Storage Persistence
        // Score = credits earned this run + 250 per contract + 5 per km flown
        let autoJ = false;
        // Power-ups: OVERDRIVE (free boost/no heat), SHIELD, 2X PAYOUT
        const PU = { over: { c: '#22d3ee', k: 'O', n: 'OVERDRIVE' }, shield: { c: '#60a5fa', k: 'S', n: 'SHIELD' }, dbl: { c: '#fbbf24', k: 'x2', n: '2X PAYOUT' } };
        const PU_TYPES = Object.keys(PU);
        let powerups = [], puTimer = 1200, pu = { over: 0, shield: 0, dbl: 0 }, puCache = '';
        function renderPU() {
            const html = PU_TYPES.filter(t => pu[t] > 0).map(t => `<span class="pu-chip" style="--c:${PU[t].c}"><b>${PU[t].k}</b> ${PU[t].n} ${Math.ceil(pu[t] / 60)}s</span>`).join('');
            if (html !== puCache) { puCache = html; const b = document.getElementById('puBar'); if (b) b.innerHTML = html; }
        }
        // ---- Ship abilities (R key / ABILITY button): each skin has one ----
        const ABILITY = {
            dash:   { n: 'DASH',   cd: 300,  icon: 'fa-angles-right' },
            blink:  { n: 'BLINK',  cd: 420,  icon: 'fa-wand-magic-sparkles' },
            nova:   { n: 'NOVA',   cd: 480,  icon: 'fa-burst' },
            repair: { n: 'REPAIR', cd: 1500, icon: 'fa-screwdriver-wrench' }
        };
        const ABILITY_BY_SKIN = { neon_vector: 'dash', cyber_stealth: 'blink', solar_flare: 'nova', apex_interceptor: 'dash', void_runner: 'blink', quantum_ghost: 'blink', heavy_hauler: 'repair',
            crimson_phantom: 'nova', galactic_spectre: 'blink', pulsar_drift: 'dash', hyperion_prime: 'repair', omega_void: 'nova', aurora_wing: 'dash', inferno_king: 'nova',
            frost_nova: 'repair', storm_caller: 'nova', nebula_drifter: 'blink', eclipse_reaper: 'nova', solar_emperor: 'repair', cosmic_sovereign: 'nova' };
        Object.assign(ABILITY_BY_SKIN, { dune_runner: 'dash', jade_serpent: 'dash', rose_comet: 'blink', iron_wolf: 'repair', arctic_fox: 'blink', plasma_viper: 'nova', midnight_monarch: 'nova', abyss_lurker: 'blink', phoenix_rising: 'repair', titan_prime: 'nova' });
        let abCd = 0, abCache = '';
        const abKind = () => ABILITY_BY_SKIN[curSkin().id] || 'dash';
        function useAbility() {
            if (gameState !== 'PLAYING' || abCd > 0) return;
            const k = abKind(), a = ABILITY[k], c = Math.cos(player.angle), s = Math.sin(player.angle), lim = v => Math.max(100, Math.min(WORLD_SIZE - 100, v));
            if (k === 'dash') { player.vx += c * 16; player.vy += s * 16; invuln = Math.max(invuln, 30); spawnExplosion(player.x, player.y, 10, '#22d3ee'); shake(6); }
            else if (k === 'blink') { spawnExplosion(player.x, player.y, 12, '#a855f7'); player.x = lim(player.x + c * 380); player.y = lim(player.y + s * 380); trailPts = []; invuln = Math.max(invuln, 45); spawnExplosion(player.x, player.y, 12, '#a855f7'); }
            else if (k === 'nova') { for (let i = 0; i < 20; i++) { const g = i * Math.PI * 2 / 20; lasers.push({ x: player.x + Math.cos(g) * player.radius, y: player.y + Math.sin(g) * player.radius, vx: Math.cos(g) * 16, vy: Math.sin(g) * 16, isPlayer: true, life: 70 }); } sound.playLaser(); shake(8); }
            else { player.hull = Math.min(player.maxHull, player.hull + 35); createFloatingText('+35 HULL', player.x, player.y - 30, '#4ade80'); spawnExplosion(player.x, player.y, 14, '#4ade80'); }
            abCd = a.cd; Ach.ev('ability'); Tut.ev('ability'); Haptic.buzz([25, 30, 25]); sound.playPickup();
        }
        function renderAbility() {
            const a = ABILITY[abKind()], ready = abCd <= 0, txt = ready ? 'READY' : Math.ceil(abCd / 60) + 's', key = a.n + txt;
            if (key === abCache) return; abCache = key;
            const el = document.getElementById('abilityChip'); if (el) { el.className = 'ability-chip' + (ready ? ' ready' : ''); el.innerHTML = `<i class="fa-solid ${a.icon}"></i><span>[R] ${a.n}</span><b>${txt}</b>`; }
            const tb = document.getElementById('touchAbility'); if (tb) { tb.classList.toggle('cooling', !ready); tb.textContent = ready ? a.n : txt; }
        }
        document.getElementById('abilityChip').onclick = () => useAbility();

        // Screen shake + vibration together
        function shake(f) { screenShakeTime = Math.max(screenShakeTime, f); Haptic.buzz(Math.min(90, f * 4)); }
        function calcScore() { return Math.floor(runCredits + runContracts * 250 + Math.floor(runDistance) * 5); }

        // Fresh pilot: 0 credits, no upgrades, default skin/trail, nothing unlocked
        function resetProgress() {
            [SHIP_SKINS, TRAIL_COLORS].forEach(list => list.forEach(x => { if (x._d === undefined) x._d = !!x.unlocked; x.unlocked = x._d; }));
            credits = 0; bestContracts = 0; stationRep = {}; diff = 1; syncDiffUI();
            upgrades = { shieldLvl: 1, engineLvl: 1, fuelLvl: 1, coolingLvl: 1 };
            player.skin = 'neon_vector'; player.trailColor = '#00f3ff'; applyUpgrades();
            Ach.reset(); Tut.reset(); Daily.reset(); Prog.reset();
        }

        function loadSaveData() {
            resetProgress();   // never carry anything over from the previous pilot
            const savedData = localStorage.getItem(Auth.saveKey());
            if (savedData) {
                try {
                    const parsed = JSON.parse(savedData);
                    credits = parsed.credits || 0; bestContracts = parsed.bestContracts || 0; stationRep = parsed.stationRep || {}; diff = parsed.diff || 1; syncDiffUI();
                    upgrades = parsed.upgrades || upgrades;
                    player.skin = parsed.skin || 'neon_vector';
                    player.trailColor = parsed.trailColor || '#00f3ff';
                    (parsed.unlockedTrails || []).forEach(id => { const t = TRAIL_COLORS.find(x => x.id === id); if (t) t.unlocked = true; });
                    const eq = TRAIL_COLORS.find(x => x.hex === player.trailColor); if (eq) eq.unlocked = true;

                    if (parsed.unlockedSkins) {
                        parsed.unlockedSkins.forEach(skinId => {
                            const found = SHIP_SKINS.find(s => s.id === skinId);
                            if (found) found.unlocked = true;
                        });
                    }
                    applyUpgrades();
                    Ach.load(parsed.ach); Daily.load(parsed.daily); Prog.load(parsed.prog); Tut.load(parsed.tut === undefined ? (parsed.bestContracts > 0) : parsed.tut);
                } catch(e) {
                    console.error("Save load error", e);
                }
            }
        }

        function saveGameData() {
            if (!Auth.hasChosen) return;   // nobody is logged in (login window open): don't write anywhere
            Ach.check(true);
            const dataToSave = {
                credits: credits,
                upgrades: upgrades,
                skin: player.skin,
                trailColor: player.trailColor,
                bestContracts: bestContracts, stationRep: stationRep, diff: diff,
                unlockedTrails: TRAIL_COLORS.filter(t => t.unlocked).map(t => t.id),
                unlockedSkins: SHIP_SKINS.filter(s => s.unlocked).map(s => s.id),
                ach: Ach.dump(), tut: Tut.dump(), daily: Daily.dump(), prog: Prog.dump()
            };
            localStorage.setItem(Auth.saveKey(), JSON.stringify(dataToSave));
        }

        function applyUpgrades() {
            player.maxHull = 100 + (upgrades.shieldLvl - 1) * 40;
            player.thrustPower = 0.35 + (upgrades.engineLvl - 1) * 0.08;
            player.maxFuel = 100 + (upgrades.fuelLvl - 1) * 50;
            player.coolingRate = 0.25 + (upgrades.coolingLvl - 1) * 0.15;
            const st = SKIN_STATS[curSkin().id] || [1, 1, 1]; player.maxHull = Math.round(player.maxHull * st[0]); player.maxSpeed = 12 * st[1]; player.thrustPower *= st[2];
            player.fuelDrain = 0.02 * (curSkin().perk === 'efficient' ? 0.7 : 1);
            updateShopUI();
        }

        /* ------------------------------------------------------------------
           WORLD GENERATION & HAZARDS
           ------------------------------------------------------------------ */
        const STATION_NAMES = [
            "NEON PRIME PORT", "CYBER PLATFORM Alpha", "SYNTH STATION 9", 
            "OUTPOST KRONOS", "HYPERION HUB", "AORA MINING RING",
            "NEXUS DOCK 12", "ECHO METROPOLIS", "TITAN FOUNDRY", "ORION GATE", "VEGA RELAY", "LUNAR EXCHANGE"
        ];

        function initWorld() {
            stations = [];
            asteroids = [];
            turrets = [];
            blackHoles = [];
            solarFlares = [];
            particles = [];
            trailPts = [];
            lasers = [];

            // Spawn Stations
            for (let i = 0; i < STATION_NAMES.length; i++) {
                const angle = (i / STATION_NAMES.length) * Math.PI * 2;
                const dist = WORLD_SIZE * (0.2 + Math.random() * 0.2);
                stations.push({
                    id: i,
                    name: STATION_NAMES[i],
                    x: WORLD_SIZE / 2 + Math.cos(angle) * dist,
                    y: WORLD_SIZE / 2 + Math.sin(angle) * dist,
                    radius: 50,
                    color: i % 2 === 0 ? '#00f3ff' : '#ff007f',
                    style: STATION_STYLES[i % STATION_STYLES.length]
                });
            }

            // Spawn Black Hole Gravity Hazard Wells
            for (let i = 0; i < 9; i++) {
 blackHoles.push({
                    x: 1000 + Math.random() * (WORLD_SIZE - 2000),
                    y: 1000 + Math.random() * (WORLD_SIZE - 2000),
                    radius: 40,
                    gravityRadius: 400,
                    pullStrength: 0.45
                });
            }

            // Spawn Solar Flare Radiation Hazards
            for (let i = 0; i < 12; i++) {
 solarFlares.push({
                    x: 800 + Math.random() * (WORLD_SIZE - 1600),
                    y: 800 + Math.random() * (WORLD_SIZE - 1600),
                    radius: 250
                });
            }

            // Spawn Debris Asteroids
            for (let i = 0; i < 520; i++) {
                asteroids.push({
                    x: Math.random() * WORLD_SIZE,
                    y: Math.random() * WORLD_SIZE,
                    radius: 15 + Math.random() * 40,
                    vx: (Math.random() - 0.5) * 0.9,
                    vy: (Math.random() - 0.5) * 0.9,
                    angle: Math.random() * Math.PI * 2,
                    vRot: (Math.random() - 0.5) * 0.02,
                    vertices: generateAsteroidVertices()
                });
            }

            // Spawn Defense Turrets
            for (let i = 0, tries = 0; i < 70 && tries < 3000; tries++) {   // spread out: at least 450 apart
                const tx = Math.random() * WORLD_SIZE, ty = Math.random() * WORLD_SIZE;
                if (turrets.some(q => Math.hypot(q.x - tx, q.y - ty) < 450)) continue;
                turrets.push({ x: tx, y: ty, radius: 22, fireCooldown: 0, hp: 3, range: 500 }); i++;
            }

            const safe = (o, r) => Math.hypot(o.x - WORLD_SIZE/2, o.y - WORLD_SIZE/2) > r && stations.every(st => Math.hypot(o.x - st.x, o.y - st.y) > r * 0.6 + st.radius);
            asteroids = asteroids.filter(a => safe(a, 250));
            turrets = turrets.filter(t => safe(t, 350));
            blackHoles = blackHoles.filter(b => safe(b, 700));
            stations.forEach(st => { for (let k = 0; k < 3; k++) {
                const a = stations.indexOf(st) * 1.3 + k * 2.094 + Math.random() * 0.5, d = 320 + Math.random() * 120;
                turrets.push({ x: st.x + Math.cos(a) * d, y: st.y + Math.sin(a) * d, radius: 22, fireCooldown: 0, hp: 3, range: 500 });
            } });
            pirates = []; crates = []; wormholes = []; bosses = []; mines = []; nebulae = []; escort = null; eventTimer = 3600;
            for (let k = 0; k < 4; k++) nebulae.push({ x: 1500 + Math.random() * (WORLD_SIZE - 3000), y: 1500 + Math.random() * (WORLD_SIZE - 3000), r: 900 });
            for (let k = 0; k < 170; k++) { const a = Math.random() * 6.283, d = 3300 + Math.random() * 400, o = { x: WORLD_SIZE / 2 + Math.cos(a) * d, y: WORLD_SIZE / 2 + Math.sin(a) * d };
                if (safe(o, 250)) asteroids.push({ x: o.x, y: o.y, radius: 14 + Math.random() * 30, vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.5, angle: 0, vRot: (Math.random() - 0.5) * 0.02, vertices: generateAsteroidVertices() }); }
            { const dz = { x: 1500 + Math.random() * (WORLD_SIZE - 3000), y: 1500 + Math.random() * (WORLD_SIZE - 3000) };
              let placed = 0; for (let k = 0; k < 120 && placed < 12; k++) { const a = Math.random() * 6.283, d = Math.random() * 900, t = { x: dz.x + Math.cos(a) * d, y: dz.y + Math.sin(a) * d };
                if (safe(t, 350) && turrets.every(q => Math.hypot(q.x - t.x, q.y - t.y) > 180)) { turrets.push({ x: t.x, y: t.y, radius: 22, fireCooldown: 0, hp: 3, range: 500 }); placed++; } } }
            while (bosses.length < 3) { const b = { x: 1200 + Math.random() * (WORLD_SIZE - 2400), y: 1200 + Math.random() * (WORLD_SIZE - 2400) };
                if (safe(b, 1200)) bosses.push({ x: b.x, y: b.y, hp: 40, maxHp: 40, cd: 90, radius: 70, spawnCd: 900 }); }
            const rp = () => ({ x: 300 + Math.random() * (WORLD_SIZE - 600), y: 300 + Math.random() * (WORLD_SIZE - 600) });
            for (let tries = 0; pirates.length < 28 && tries < 4000; tries++) { const p = rp();   // spread out: no two pirates within 900, none near a fortress
                if (safe(p, 600) && pirates.every(q => Math.hypot(q.x - p.x, q.y - p.y) > 900) && bosses.every(b => Math.hypot(b.x - p.x, b.y - p.y) > 1100)) pirates.push({ x: p.x, y: p.y, vx: 0, vy: 0, angle: 0, hp: 2, cd: 60, radius: 16 }); }
            while (crates.length < 70) { const p = rp(); crates.push({ x: p.x, y: p.y, type: Math.random() < 0.5 ? 'fuel' : 'repair' }); }
            for (let k = 0; k < 2; k++) { const a = rp(), b = rp(); a.radius = b.radius = 60; a.to = b; b.to = a; wormholes.push(a, b); }
            // Reset player status
            player.x = WORLD_SIZE / 2;
            player.y = WORLD_SIZE / 2;
            player.vx = 0;
            player.vy = 0;
            player.hull = player.maxHull;
            player.fuel = player.maxFuel;
            player.boost = player.maxBoost;
            player.heat = 0;

            generateNewContract();
        }

        function generateAsteroidVertices() {
            const points = [];
            const count = 7 + Math.floor(Math.random() * 5);
            for (let i = 0; i < count; i++) {
                const angle = (i / count) * Math.PI * 2;
                const dist = 0.75 + Math.random() * 0.5;
                points.push({ angle, dist });
            }
            return points;
        }

        /* ------------------------------------------------------------------
           CONTRACT & MISSION SYSTEM
           ------------------------------------------------------------------ */
        function generateNewContract() {
            pirates = pirates.filter(p => !p.b && !p.s);   // clear leftover bounty targets / patrols
            let pickupIdx = Math.floor(Math.random() * stations.length);
            let dropoffIdx;
            do {
                dropoffIdx = Math.floor(Math.random() * stations.length);
            } while (dropoffIdx === pickupIdx);

            let pickup = stations[pickupIdx];
            const dropoff = stations[dropoffIdx];
            const dist = Math.hypot(dropoff.x - pickup.x, dropoff.y - pickup.y);
            const roll = Math.random(); let type = [['STANDARD', .22], ['RUSH', .36], ['FRAGILE', .48], ['RESCUE', .60], ['ESCORT', .72], ['SMUGGLE', .82], ['RACE', .91], ['BOUNTY', 1]].find(t => roll < t[1])[0];
            if (!Tut.done) type = 'STANDARD';   // the tutorial uses a simple delivery
            escort = null;
            if (type === 'RESCUE') { const a = Math.random() * 6.283; pickup = { id: -1, name: 'STRANDED PILOT', x: Math.max(200, Math.min(WORLD_SIZE - 200, pickup.x + Math.cos(a) * 1100)), y: Math.max(200, Math.min(WORLD_SIZE - 200, pickup.y + Math.sin(a) * 1100)), radius: 20, color: '#fbbf24' }; }
            let gates = null;
            if (type === 'RACE') {   // 4 checkpoint gates between pickup and drop-off
                const ang = Math.atan2(dropoff.y - pickup.y, dropoff.x - pickup.x) + Math.PI / 2;
                gates = [0.18, 0.4, 0.62, 0.82].map((f, i) => { const o = (Math.random() - 0.5) * 900; return { id: -2, name: `GATE ${i + 1}/4`, x: wclamp(pickup.x + (dropoff.x - pickup.x) * f + Math.cos(ang) * o), y: wclamp(pickup.y + (dropoff.y - pickup.y) * f + Math.sin(ang) * o) }; });
                pickup = gates[0];
            }
            const reward = Math.floor((dist * 0.45 + 250) * ({ RUSH: 2, FRAGILE: 1.6, RESCUE: 1.8, ESCORT: 2.2, SMUGGLE: 2.6, RACE: 2.1, BOUNTY: 2.4 }[type] || 1));

            activeContract = {
                pickupStation: pickup,
                dropoffStation: dropoff,
                hasCargo: false,
                reward: reward, type: type,
 timeRemaining: (Math.floor(dist / 110) + 35) * ({ RUSH: 0.6, ESCORT: 1.4, SMUGGLE: 1.25, RACE: 1.35, BOUNTY: 1.9 }[type] || 1),
                gates, gateIdx: 0
            };
            activeContract.total = activeContract.timeRemaining;

            updateContractUI();
        }

        function updateContractUI() {
            if (!activeContract) return;
            const titleEl = document.getElementById('contractTitle');
            const rewardEl = document.getElementById('contractReward');
            const timerEl = document.getElementById('contractTimer');

            if (!activeContract.hasCargo) {
                titleEl.textContent = `${activeContract.type !== 'STANDARD' ? '[' + activeContract.type + '] ' : ''}PICKUP @ ${activeContract.pickupStation.name}`;
                titleEl.className = "text-base md:text-lg font-orbitron font-bold text-cyan-400 glow-cyan my-0.5";
            } else {
                titleEl.textContent = (activeContract.type === 'BOUNTY' && pirates.some(p => p.b)) ? `[BOUNTY] DESTROY ${pirates.filter(p => p.b).length} TARGETS` : `${activeContract.type !== 'STANDARD' ? '[' + activeContract.type + '] ' : ''}DELIVER @ ${activeContract.dropoffStation.name}`;
                titleEl.className = "text-base md:text-lg font-orbitron font-bold text-pink-400 glow-pink my-0.5";
            }

            rewardEl.innerHTML = `<i class="fa-solid fa-coins mr-1"></i>+${activeContract.reward} CR`;
            timerEl.innerHTML = `<i class="fa-solid fa-clock mr-1"></i>${Math.ceil(activeContract.timeRemaining)}s`;
        }

        /* ------------------------------------------------------------------
           WEAPONS & COMBAT
           ------------------------------------------------------------------ */
        function fireLaser() {
            if (player.fuel <= 0 || player.heat >= 95) return;
            sound.playLaser(); Tut.ev('fire');
            player.heat = Math.min(player.maxHeat, player.heat + 4);

            const speed = 18;
            lasers.push({
                x: player.x + Math.cos(player.angle) * player.radius,
                y: player.y + Math.sin(player.angle) * player.radius,
                vx: Math.cos(player.angle) * speed + player.vx * 0.5,
                vy: Math.sin(player.angle) * speed + player.vy * 0.5,
                isPlayer: true,
                life: 65
            });
            for (const o of [[], [-0.12, 0.12], [-0.12, 0.12, -0.25, 0.25]][Math.min(2, (upgrades.weaponLvl || 1) - 1)]) {
                const a = player.angle + o;
                lasers.push({ x: player.x + Math.cos(a) * player.radius, y: player.y + Math.sin(a) * player.radius,
                    vx: Math.cos(a) * speed + player.vx * 0.5, vy: Math.sin(a) * speed + player.vy * 0.5, isPlayer: true, life: 65 });
            }
        }

        function spawnExplosion(x, y, count = 22, color = '#ff007f') {
            if (Settings.lowfx) count = Math.ceil(count / 2);
            sound.playExplosion();
            for (let i = 0; i < count; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = 1 + Math.random() * 7;
                particles.push({
                    x: x,
                    y: y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    life: 1.0,
                    decay: 0.02 + Math.random() * 0.03,
                    size: 2 + Math.random() * 4,
                    color: color
                });
            }
        }

        function createFloatingText(text, x, y, color = '#00f3ff') {
            floatingTexts.push({
                text: text,
                x: x,
                y: y,
                vy: -1.2,
                life: 1.0,
                color: color
            });
        }

        /* ------------------------------------------------------------------
           PHYSICS & GAME UPDATE LOOP
           ------------------------------------------------------------------ */
        let lastTime = performance.now();

        function updateGame(dt) {
            if (gameState !== 'PLAYING') return;
            fireCd--; invuln--; shieldCd--; tpCd--;
            Ach.tick(); Tut.update(); if (abCd > 0) abCd--;
            if (--respawnT <= 0) { respawnT = 720; if (pirates.filter(q => !q.b && !q.s).length < 22) spawnFar(); }
            if (Settings.autofire) { keys['KeyJ'] = true; autoJ = true; } else if (autoJ) { keys['KeyJ'] = false; autoJ = false; }
            const gp = navigator.getGamepads && navigator.getGamepads()[0];
            if (gp) {
                const gx = gp.axes[0] || 0, gy = gp.axes[1] || 0, mv = Math.hypot(gx, gy) > 0.3;
                if (mv) { mousePos.x = canvas.width / 2 + gx * 300; mousePos.y = canvas.height / 2 + gy * 300; }
                const st = (k, v) => { if (v) { keys[k] = true; padSet[k] = true; } else if (padSet[k]) { keys[k] = false; padSet[k] = false; } };
                st('KeyW', mv); st('KeyJ', !!(gp.buttons[7] && gp.buttons[7].pressed)); st('Space', !!(gp.buttons[0] && gp.buttons[0].pressed)); const be = !!(gp.buttons[1] && gp.buttons[1].pressed), bq = !!(gp.buttons[2] && gp.buttons[2].pressed); if (be && !padE) useShield(); if (bq && !padQ) dropMine(); padE = be; padQ = bq;
            }



            if (curSkin().perk === 'regen' && player.hull < player.maxHull) player.hull = Math.min(player.maxHull, player.hull + 0.012);
            if ((mouseDown || keys['KeyJ']) && fireCd <= 0) { fireLaser(); fireCd = (upgrades.weaponLvl || 1) >= 3 ? 7 : 9; }

            // Player Aim Rotation
            const worldMouseX = mousePos.x + camera.x;
            const worldMouseY = mousePos.y + camera.y;
            player.angle = Math.atan2(worldMouseY - player.y, worldMouseX - player.x);

            // Engine Heat Dissipation
            player.heat = Math.max(0, player.heat - player.coolingRate);

            // Flight Thrusters Input Mechanics
            let thrustX = 0;
            let thrustY = 0;

            if (keys['KeyW'] || keys['ArrowUp']) {
                thrustX += Math.cos(player.angle);
                thrustY += Math.sin(player.angle);
            }
            if (keys['KeyS'] || keys['ArrowDown']) {
                thrustX -= Math.cos(player.angle) * 0.5;
                thrustY -= Math.sin(player.angle) * 0.5;
            }
            if (keys['KeyA']) {
                thrustX += Math.cos(player.angle - Math.PI / 2) * 0.4;
                thrustY += Math.sin(player.angle - Math.PI / 2) * 0.4;
            }
            if (keys['KeyD']) {
                thrustX += Math.cos(player.angle + Math.PI / 2) * 0.4;
                thrustY += Math.sin(player.angle + Math.PI / 2) * 0.4;
            }

            const isApplyingThrust = (thrustX !== 0 || thrustY !== 0);

            if (isApplyingThrust && player.fuel > 0) {
                let currentThrust = player.thrustPower; if (player.heat >= 95) currentThrust *= 0.5;

                // Hyper Boost Handling
                if ((keys['ShiftLeft'] || keys['Space']) && player.boost > 5 && player.heat < 95) {
                    currentThrust *= 2.2;
                    player.boost -= 0.9;
                    player.heat = Math.min(player.maxHeat, player.heat + 0.6);
                    player.isBoosting = true;

                    // Boost Thruster Trail Effect
                    particles.push({
                        x: player.x - Math.cos(player.angle) * player.radius,
                        y: player.y - Math.sin(player.angle) * player.radius,
                        vx: -Math.cos(player.angle) * 6 + (Math.random() - 0.5) * 2,
                        vy: -Math.sin(player.angle) * 6 + (Math.random() - 0.5) * 2,
                        life: 0.6,
                        decay: 0.08,
                        size: 5 + Math.random() * 4,
                        color: trailCol()
                    });
                } else {
                    player.isBoosting = false;
                }

                player.vx += thrustX * currentThrust;
                player.vy += thrustY * currentThrust;

                player.fuel = Math.max(0, player.fuel - player.fuelDrain);
                player.heat = Math.min(player.maxHeat, player.heat + 0.12);

                // Main Thruster Plume Particles
                particles.push({
                    x: player.x - Math.cos(player.angle) * player.radius,
                    y: player.y - Math.sin(player.angle) * player.radius,
                    vx: -Math.cos(player.angle) * 3 + (Math.random() - 0.5),
                    vy: -Math.sin(player.angle) * 3 + (Math.random() - 0.5),
                    life: 0.4,
                    decay: 0.06,
                    size: 3,
                    color: trailCol()
                });
            } else {
                player.isBoosting = false;
            }

            // Boost Recharge
            if (!player.isBoosting && player.boost < player.maxBoost) {
                player.boost = Math.min(player.maxBoost, player.boost + 0.35 * (curSkin().perk === 'boost' ? 1.6 : 1));
            }

            // Black Hole Gravity Physics
            blackHoles.forEach(bh => {
                const dist = Math.hypot(bh.x - player.x, bh.y - player.y);
                if (dist < bh.gravityRadius) {
                    const pull = (1 - dist / bh.gravityRadius) * bh.pullStrength;
                    const angle = Math.atan2(bh.y - player.y, bh.x - player.x);
                    player.vx += Math.cos(angle) * pull;
                    player.vy += Math.sin(angle) * pull;

                    if (dist < bh.radius) {
                        player.hull -= 1.5;
                        sound.playWarning();
                        shake(5);
                    }
                }
            });

            // Solar Flare Hazard Damage
            solarFlares.forEach(sf => {
                const dist = Math.hypot(sf.x - player.x, sf.y - player.y);
                if (dist < sf.radius) {
                    player.heat = Math.min(player.maxHeat, player.heat + 0.5);
                    if (player.heat >= 80) {
                        player.hull -= 0.3;
                        createFloatingText("OVERHEATING!", player.x, player.y - 30, '#ef4444');
                    }
                }
            });

            { const fx = curSkin().fx || '';
              if (fx && Math.hypot(player.vx, player.vy) > 1.5) {
                const c = Math.cos(player.angle), sn = Math.sin(player.angle), r = () => Math.random() - 0.5;
                const bx = player.x - c * player.radius, by = player.y - sn * player.radius;
                const P = (o) => particles.push(Object.assign({ x: bx + r() * 8, y: by + r() * 8, vx: -c * 2 + r() * 1.5, vy: -sn * 2 + r() * 1.5, life: 0.8, decay: 0.04, size: 3, color: '#fff' }, o));
                if (fx.includes('rainbow')) P({ color: `hsl(${(performance.now() / 5) % 360},100%,60%)`, size: 4, decay: 0.05 });
                if (fx.includes('flame')) P({ color: ['#f97316', '#ef4444', '#facc15'][Math.floor(Math.random() * 3)], size: 4 + Math.random() * 3, decay: 0.06 });
                if (fx.includes('sparkle') && Math.random() < 0.6) P({ color: '#ffffff', size: 1.5 + Math.random() * 2, vx: r() * 3, vy: r() * 3, decay: 0.03 });
                if (fx.includes('ghost')) P({ color: curSkin().primaryColor, size: player.radius * 0.7, vx: 0, vy: 0, life: 0.35, decay: 0.07 });
                if (fx.includes('void')) P({ color: '#7c3aed', size: 6, vx: r(), vy: r(), life: 0.9, decay: 0.035 });
              } }
            // Newtonian vs Arcade Drag Coasting
            if (useNewtonianPhysics) {
                player.vx *= player.drag;
                player.vy *= player.drag;
            } else {
                player.vx *= 0.95;
                player.vy *= 0.95;
            }

            // Speed Cap
            const speed = Math.hypot(player.vx, player.vy);
            if (speed > player.maxSpeed) {
                player.vx = (player.vx / speed) * player.maxSpeed;
                player.vy = (player.vy / speed) * player.maxSpeed;
            }

            player.x += player.vx;
            player.y += player.vy;

            // Record the ship's tail path; the trail shrinks back when the ship slows down
            {
                const tx = player.x - Math.cos(player.angle) * player.radius * 0.8, ty = player.y - Math.sin(player.angle) * player.radius * 0.8, last = trailPts[0];
                if (!last || Math.hypot(tx - last.x, ty - last.y) > 3.2) {
                    trailPts.unshift({ x: tx, y: ty, a: (Math.abs(player.vx) + Math.abs(player.vy) > 0.2) ? Math.atan2(player.vy, player.vx) : player.angle });
                    if (trailPts.length > 44) trailPts.pop();
                } else if (trailPts.length) trailPts.pop();
            }

            runDistance += speed * 0.01;

            // World Boundary Clamp
            player.x = Math.max(50, Math.min(WORLD_SIZE - 50, player.x));
            player.y = Math.max(50, Math.min(WORLD_SIZE - 50, player.y));

            // Smooth Camera Follow
            camera.x = player.x - canvas.width / 2;
            camera.y = player.y - canvas.height / 2;

            if (activeContract && activeContract.type === 'FRAGILE' && activeContract.hasCargo && player.hull < activeContract.minHull) {
                createFloatingText('CARGO DAMAGED!', player.x, player.y - 30, '#ff0055'); combo = 0; generateNewContract();
            }
            if (activeContract && activeContract.type === 'RESCUE' && !activeContract.hasCargo && Math.hypot(player.x - activeContract.pickupStation.x, player.y - activeContract.pickupStation.y) < 50) {
                activeContract.hasCargo = true; sound.playPickup(); createFloatingText('PILOT RESCUED!', player.x, player.y - 30, '#fbbf24'); updateContractUI();
            }
            if (activeContract && activeContract.type === 'RACE' && !activeContract.hasCargo && Math.hypot(player.x - activeContract.pickupStation.x, player.y - activeContract.pickupStation.y) < 75) {
                const c = activeContract; c.gateIdx++; sound.playPickup(); Haptic.buzz(20);
                if (c.gateIdx < c.gates.length) { c.pickupStation = c.gates[c.gateIdx]; createFloatingText(c.gates[c.gateIdx - 1].name + ' CLEARED', player.x, player.y - 30, '#a3e635'); }
                else { c.hasCargo = true; createFloatingText('ALL GATES CLEARED!', player.x, player.y - 30, '#fbbf24'); }
                updateContractUI();
            }
            if (activeContract && activeContract.type === 'SMUGGLE' && activeContract.hasCargo && !activeContract.reinf && activeContract.timeRemaining < activeContract.total * 0.5) {
                activeContract.reinf = true; spawnPatrol(2); createFloatingText('PATROL REINFORCEMENTS!', player.x, player.y - 40, '#60a5fa');
            }
            // Mission Contract Timer
            if (activeContract) {
                activeContract.timeRemaining -= dt;
                updateContractUI();

                if (activeContract.timeRemaining <= 0) {
                    createFloatingText("CONTRACT EXPIRED!", player.x, player.y - 30, '#ff0055'); combo = 0;
                    generateNewContract();
                }
            }

            // Station Service & Delivery Check
            stations.forEach(station => {
                const dist = Math.hypot(player.x - station.x, player.y - station.y);
                if (dist < station.radius + player.radius) {
                    // Refuel & Repairs
                    if (player.fuel < player.maxFuel || player.hull < player.maxHull) {
                        player.fuel = Math.min(player.maxFuel, player.fuel + 0.6);
                        player.hull = Math.min(player.maxHull, player.hull + 0.4);
                    }

                    // Cargo Interactions
                    if (activeContract) {
                        if (!activeContract.hasCargo && station.id === activeContract.pickupStation.id) {
                            activeContract.hasCargo = true; activeContract.minHull = player.hull - 30; if (activeContract.type === 'ESCORT') startEscort(station.x, station.y); if (activeContract.type === 'SMUGGLE') { spawnPatrol(3); createFloatingText('PATROLS INBOUND!', station.x, station.y - 70, '#60a5fa'); } if (activeContract.type === 'BOUNTY') { spawnBounty(4); createFloatingText('4 TARGETS MARKED', station.x, station.y - 70, '#fbbf24'); }
                            sound.playPickup();
                            createFloatingText("CARGO LOADED!", station.x, station.y - 40, '#00f3ff');
                        } else if (activeContract.hasCargo && station.id === activeContract.dropoffStation.id && (activeContract.type !== 'BOUNTY' || !pirates.some(p => p.b)) && (!escort || Math.hypot(escort.x - station.x, escort.y - station.y) < 350)) {
                            sound.playPickup();
                            combo = Math.min(combo + 1, 5);
                            const payout = (pu.dbl > 0 ? 2 : 1) * Math.floor((activeContract.reward + Math.floor(activeContract.timeRemaining * 2)) * (1 + (combo - 1) * 0.1) * (1 + Math.min(5, stationRep[station.id] || 0) * 0.05));
                            credits += payout; runCredits += payout; runContracts++; stationRep[station.id] = (stationRep[station.id] || 0) + 1; escort = null; Ach.ev('combo', combo); Ach.ev('delivery'); Ach.ev('del:' + activeContract.type); Tut.ev('delivery'); shake(4); Haptic.buzz([30, 40, 30]);
                            createFloatingText(`DELIVERY COMPLETE! +${payout} CR${combo > 1 ? ' (x' + combo + ' COMBO)' : ''}`, station.x, station.y - 40, '#ffb800');
                            saveGameData();
                            generateNewContract();
                        }
                    }
                }
            });

            // Projectile Updates
            for (let i = lasers.length - 1; i >= 0; i--) {
                const l = lasers[i];
                l.x += l.vx;
                l.y += l.vy;
                l.life--;

                if (l.life <= 0) {
                    lasers.splice(i, 1);
                    continue;
                }

                // Laser vs Asteroid
                for (let j = asteroids.length - 1; j >= 0; j--) {
                    const ast = asteroids[j];
                    if (Math.hypot(l.x - ast.x, l.y - ast.y) < ast.radius) {
                        spawnExplosion(ast.x, ast.y, 12, '#00f3ff');
                        if (l.isPlayer) {
                            const bounty = Math.ceil(ast.radius / 4);
                            credits += bounty; runCredits += bounty;
                            createFloatingText('+' + bounty, ast.x, ast.y, '#ffb800');
                            if (ast.radius > 28) for (const k of [-1, 1]) asteroids.push({
                                x: ast.x, y: ast.y, radius: ast.radius * 0.5,
                                vx: ast.vx + k * (0.4 + Math.random() * 0.6), vy: ast.vy - k * (0.4 + Math.random() * 0.6),
                                angle: 0, vRot: (Math.random() - 0.5) * 0.04, vertices: generateAsteroidVertices() });
                        }
                        asteroids.splice(j, 1);
                        lasers.splice(i, 1);
                        break;
                    }
                }
            }

            for (let i = lasers.length - 1; i >= 0; i--) {
                const l = lasers[i]; if (!l.isPlayer) continue;
                for (let j = turrets.length - 1; j >= 0; j--) {
                    const t = turrets[j];
                    if (Math.hypot(l.x - t.x, l.y - t.y) < t.radius) {
                        lasers.splice(i, 1); t.hp--; spawnExplosion(l.x, l.y, 6, '#ef4444');
                        if (t.hp <= 0) {
                            spawnExplosion(t.x, t.y, 26, '#ef4444'); credits += 40; runCredits += 40; Ach.ev('kill');
                            createFloatingText('TURRET DESTROYED +40', t.x, t.y - 30, '#ffb800'); turrets.splice(j, 1);
                        }
                        break;
                    }
                }
            }
            // Crowd control: only the 5 nearest regular enemies attack at once; the rest hover just out of range and take over as others fall
            const engagedSet = new Set();
            pirates.filter(q => !q.b && !q.s).map(q => [Math.hypot(player.x - q.x, player.y - q.y), q]).filter(e => e[0] < 900).sort((a, b) => a[0] - b[0]).slice(0, 5).forEach(e => engagedSet.add(e[1]));
            pirates.forEach(p => {
                const d = Math.hypot(player.x - p.x, player.y - p.y);
                if (d < 900) {
                    const a = Math.atan2(player.y - p.y, player.x - p.x); p.angle = a;
                    if (p.b || p.s || engagedSet.has(p)) {
                        const sp = d > 260 ? 0.22 : -0.05; p.vx += Math.cos(a) * sp; p.vy += Math.sin(a) * sp;
                        if (--p.cd <= 0 && d < 600) { p.cd = Math.max(50, 110 - runContracts * 4) / diff; lasers.push({ x: p.x, y: p.y, vx: Math.cos(a) * 9, vy: Math.sin(a) * 9, isPlayer: false, life: 70 }); }
                    } else { const sp = d > 560 ? 0.12 : -0.08; p.vx += Math.cos(a) * sp; p.vy += Math.sin(a) * sp; }
                }
                for (const q of pirates) {   // keep enemies from stacking on top of each other
                    if (q === p) continue; const dx = p.x - q.x, dy = p.y - q.y, dd = Math.hypot(dx, dy);
                    if (dd > 0 && dd < 90) { p.vx += dx / dd * 0.18; p.vy += dy / dd * 0.18; }
                }
                p.vx *= 0.97; p.vy *= 0.97;
                const sv = Math.hypot(p.vx, p.vy); if (sv > 5) { p.vx *= 5 / sv; p.vy *= 5 / sv; }
                p.x += p.vx; p.y += p.vy;
                if (d < p.radius + player.radius && invuln <= 0) { player.hull -= 8; invuln = 45; shake(10); spawnExplosion(player.x, player.y, 8, '#f43f5e'); }
            });
            for (let i = lasers.length - 1; i >= 0; i--) {
                const l = lasers[i]; if (!l.isPlayer) continue;
                for (let j = pirates.length - 1; j >= 0; j--) {
                    const p = pirates[j];
                    if (Math.hypot(l.x - p.x, l.y - p.y) < p.radius + 4) {
                        lasers.splice(i, 1); p.hp--; spawnExplosion(l.x, l.y, 5, '#f43f5e');
                        if (p.hp <= 0) { spawnExplosion(p.x, p.y, 24, '#f43f5e'); credits += 60; runCredits += 60; Ach.ev('kill'); createFloatingText('PIRATE DOWN +60', p.x, p.y - 25, '#ffb800'); pirates.splice(j, 1); }
                        break;
                    }
                }
            }
            for (let i = crates.length - 1; i >= 0; i--) {
                const c = crates[i];
                if (Math.hypot(player.x - c.x, player.y - c.y) < 30) {
                    if (c.type === 'fuel') player.fuel = Math.min(player.maxFuel, player.fuel + 45); else player.hull = Math.min(player.maxHull, player.hull + 35);
                    sound.playPickup(); createFloatingText(c.type === 'fuel' ? '+FUEL' : '+REPAIR', c.x, c.y - 20, c.type === 'fuel' ? '#fbbf24' : '#34d399'); crates.splice(i, 1);
                }
            }
            // ---- Power-ups: spawn near the player, collect for a short boost ----
            if (--puTimer <= 0 && powerups.length < 2) {
                const a = Math.random() * 6.283, d = 450 + Math.random() * 450;
                powerups.push({ x: Math.max(250, Math.min(WORLD_SIZE - 250, player.x + Math.cos(a) * d)), y: Math.max(250, Math.min(WORLD_SIZE - 250, player.y + Math.sin(a) * d)), type: PU_TYPES[(Math.random() * 3) | 0], life: 1800 });
                puTimer = 1500 + Math.random() * 900;
            }
            for (let i = powerups.length - 1; i >= 0; i--) {
                const p = powerups[i];
                if (--p.life <= 0) { powerups.splice(i, 1); continue; }
                if (Math.hypot(player.x - p.x, player.y - p.y) < 36) {
                    pu[p.type] = p.type === 'over' ? 600 : p.type === 'shield' ? 360 : 900;
                    if (p.type === 'shield') invuln = Math.max(invuln, 360);
                    sound.playPickup(); Haptic.buzz([20, 30, 20]); createFloatingText(PU[p.type].n + '!', p.x, p.y - 24, PU[p.type].c); Ach.ev('powerup'); powerups.splice(i, 1);
                }
            }
            if (pu.over > 0) { pu.over--; player.fuel = player.maxFuel; player.heat = 0; player.boost = player.maxBoost; }
            if (pu.shield > 0) pu.shield--;
            if (pu.dbl > 0) pu.dbl--;
            wormholes.forEach(w => {
                if (tpCd <= 0 && Math.hypot(player.x - w.x, player.y - w.y) < w.radius) {
                    const sv = Math.hypot(player.vx, player.vy) || 1;
                    player.x = w.to.x + player.vx / sv * 90; player.y = w.to.y + player.vy / sv * 90; tpCd = 120;
                    spawnExplosion(w.x, w.y, 16, '#22d3ee'); spawnExplosion(w.to.x, w.to.y, 16, '#e879f9'); createFloatingText('WORMHOLE JUMP', player.x, player.y - 30, '#22d3ee'); Ach.ev('wormhole');
                }
            });
            bosses.forEach(b => {
                const d = Math.hypot(player.x - b.x, player.y - b.y);
                if (d < 900) {
                    if (--b.cd <= 0 && d < 800) { b.cd = 75 / diff; const a0 = Math.atan2(player.y - b.y, player.x - b.x); for (const o of [-0.2, 0, 0.2]) lasers.push({ x: b.x, y: b.y, vx: Math.cos(a0 + o) * 7.5, vy: Math.sin(a0 + o) * 7.5, isPlayer: false, life: 110 }); }
                    if (--b.spawnCd <= 0 && pirates.length < 45 && pirates.filter(q => Math.hypot(q.x - b.x, q.y - b.y) < 450).length < 3) { b.spawnCd = 900; pirates.push({ x: b.x + 100, y: b.y, vx: 0, vy: 0, angle: 0, hp: 2, cd: 60, radius: 16 }); }
                }
            });
            for (let i = lasers.length - 1; i >= 0; i--) {
                const l = lasers[i];
                if (l.isPlayer) for (let j = bosses.length - 1; j >= 0; j--) {
                    const b = bosses[j];
                    if (Math.hypot(l.x - b.x, l.y - b.y) < b.radius) {
                        lasers.splice(i, 1); b.hp--; spawnExplosion(l.x, l.y, 4, '#f59e0b');
                        if (b.hp <= 0) { spawnExplosion(b.x, b.y, 70, '#f59e0b'); credits += 1500; runCredits += 1500; Ach.ev('fortress'); shake(20); createFloatingText('FORTRESS DESTROYED +1500 CR', b.x, b.y - 60, '#ffb800'); bosses.splice(j, 1); }
                        break;
                    }
                } else if (escort && Math.hypot(l.x - escort.x, l.y - escort.y) < 18) { escort.hp -= 6; lasers.splice(i, 1); spawnExplosion(escort.x, escort.y, 5, '#fbbf24'); }
            }
            for (let i = mines.length - 1; i >= 0; i--) {
                const m = mines[i]; let hit = false;
                if (--m.life <= 0) { mines.splice(i, 1); continue; }
                for (let j = pirates.length - 1; j >= 0; j--) if (Math.hypot(pirates[j].x - m.x, pirates[j].y - m.y) < 55) {
                    spawnExplosion(pirates[j].x, pirates[j].y, 24, '#f472b6'); credits += 60; runCredits += 60; Ach.ev('kill'); createFloatingText('MINE KILL +60', m.x, m.y - 25, '#ffb800'); pirates.splice(j, 1); hit = true;
                }
                if (hit) mines.splice(i, 1);
            }
            if (escort) {
                const dx = player.x - escort.x, dy = player.y - escort.y, d = Math.hypot(dx, dy) || 1;
                if (d > 140) { escort.vx += dx / d * 0.18; escort.vy += dy / d * 0.18; }
                escort.vx *= 0.96; escort.vy *= 0.96; const sv = Math.hypot(escort.vx, escort.vy); if (sv > 4.5) { escort.vx *= 4.5 / sv; escort.vy *= 4.5 / sv; }
                escort.x += escort.vx; escort.y += escort.vy; escort.angle = Math.atan2(escort.vy, escort.vx);
                if (escort.hp <= 0) { spawnExplosion(escort.x, escort.y, 30, '#fbbf24'); createFloatingText('ESCORT LOST!', player.x, player.y - 30, '#ff0055'); escort = null; combo = 0; generateNewContract(); }
            }
            asteroids = asteroids.filter(a => !a.storm || --a.ttl > 0);
            if (--eventTimer <= 0) {
                eventTimer = 3600 + Math.random() * 2400;
                if (Math.random() < 0.5) {
                    createFloatingText('METEOR STORM!', player.x, player.y - 50, '#f97316'); sound.playWarning();
                    for (let k = 0; k < 30; k++) { const a = Math.random() * 6.283, v = 2 + Math.random() * 2;
                        asteroids.push({ x: player.x + Math.cos(a) * 800, y: player.y + Math.sin(a) * 800, radius: 12 + Math.random() * 14, vx: -Math.cos(a) * v + (Math.random() - 0.5), vy: -Math.sin(a) * v + (Math.random() - 0.5), angle: 0, vRot: 0.05, vertices: generateAsteroidVertices(), storm: true, ttl: 1500 }); }
                } else {
                    createFloatingText('PIRATE AMBUSH!', player.x, player.y - 50, '#f43f5e'); sound.playWarning();
                    const crowd = pirates.filter(q => Math.hypot(q.x - player.x, q.y - player.y) < 1500).length, n = Math.max(2, 5 - Math.floor(crowd / 2));   // fewer ambushers when enemies are already close
                    for (let k = 0; k < n; k++) { const a = k * (6.283 / n) + Math.random() * 0.4; pirates.push({ x: wclamp(player.x + Math.cos(a) * 750), y: wclamp(player.y + Math.sin(a) * 750), vx: 0, vy: 0, angle: 0, hp: 2, cd: 60, radius: 16 }); }
                }
            }
            // Asteroid Physics & Collision Damage
            asteroids.forEach(ast => {
                ast.x += ast.vx;
                ast.y += ast.vy;
                ast.angle += ast.vRot;

                if (ast.x < 0 || ast.x > WORLD_SIZE) ast.vx *= -1;
                if (ast.y < 0 || ast.y > WORLD_SIZE) ast.vy *= -1;

                const dist = Math.hypot(player.x - ast.x, player.y - ast.y);
                if (dist < player.radius + ast.radius) {
                    const nx = (player.x - ast.x) / (dist || 1), ny = (player.y - ast.y) / (dist || 1);
                    player.x = ast.x + nx * (player.radius + ast.radius + 1);
                    player.y = ast.y + ny * (player.radius + ast.radius + 1);
                    const vn = player.vx * nx + player.vy * ny;
                    if (vn < 0) { player.vx -= 1.8 * vn * nx; player.vy -= 1.8 * vn * ny; }
                    if (invuln <= 0) {
                        player.hull -= Math.floor(Math.abs(vn) * 2.5) + 4;
                        invuln = 45; shake(18);
                        spawnExplosion((player.x + ast.x)/2, (player.y + ast.y)/2, 14, '#ff007f');
                    }
                }
            });

            // Turrets AI
            turrets.forEach(turret => {
                const dist = Math.hypot(player.x - turret.x, player.y - turret.y);
                if (dist < turret.range) {
                    turret.fireCooldown--;
                    if (turret.fireCooldown <= 0) {
                        turret.fireCooldown = Math.max(40, 85 - runContracts * 4) / diff;
                        const angle = Math.atan2(player.y - turret.y, player.x - turret.x);
                        lasers.push({
                            x: turret.x,
                            y: turret.y,
                            vx: Math.cos(angle) * 8,
                            vy: Math.sin(angle) * 8,
                            isPlayer: false,
                            life: 75
                        });
                    }
                }
            });

            // Turret Lasers vs Player
            for (let i = lasers.length - 1; i >= 0; i--) {
                const l = lasers[i];
                if (!l.isPlayer) {
                    if (Math.hypot(l.x - player.x, l.y - player.y) < player.radius) {
                        if (invuln <= 0) player.hull -= 14;
                        shake(12);
                        spawnExplosion(player.x, player.y, 10, '#ff0055');
                        lasers.splice(i, 1);
                    }
                }
            }

            // Particles Decay
            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];
                p.x += p.vx;
                p.y += p.vy;
                p.life -= p.decay;
                if (p.life <= 0) particles.splice(i, 1);
            }

            // Floating Text Update
            for (let i = floatingTexts.length - 1; i >= 0; i--) {
                const ft = floatingTexts[i];
                ft.y += ft.vy;
                ft.life -= 0.02;
                if (ft.life <= 0) floatingTexts.splice(i, 1);
            }

            // Death Check
            if (player.hull <= 0) gameOver("CRITICAL HULL COLLAPSE");
            else if (player.fuel <= 0 && Math.hypot(player.vx, player.vy) < 0.5) {
                if ((stranded += dt) > 3) gameOver("STRANDED WITHOUT FUEL");
            } else stranded = 0;

            updateHUD();
        }

        /* ------------------------------------------------------------------
           CANVAS RENDER ENGINE
           ------------------------------------------------------------------ */
        // ---- Stations: six structure styles with glow, service ring, beacon, docking lights and a name plate ----
        const STATION_STYLES = ['ring', 'hex', 'solar', 'outpost', 'tower', 'ring', 'hex', 'city', 'tower', 'ring', 'solar', 'city'];
        const STATION_DRAW = {
            ring(c, R, col, t) {
                c.save(); c.rotate(t * 0.25);
                c.beginPath(); c.arc(0, 0, R, 0, 6.283); c.stroke();
                c.lineWidth = 6; c.globalAlpha = 0.55; c.setLineDash([R * 0.9, R * 0.35]); c.beginPath(); c.arc(0, 0, R - 9, 0, 6.283); c.stroke(); c.setLineDash([]); c.globalAlpha = 1; c.lineWidth = 2.5;
                for (let k = 0; k < 4; k++) { const a = k * 1.5708; c.beginPath(); c.moveTo(Math.cos(a) * R * 0.3, Math.sin(a) * R * 0.3); c.lineTo(Math.cos(a) * (R - 3), Math.sin(a) * (R - 3)); c.stroke(); }
                c.restore();
                c.beginPath(); c.arc(0, 0, R * 0.34, 0, 6.283); c.fill(); c.stroke();
                c.fillStyle = col; c.beginPath(); c.arc(0, 0, R * 0.12 + Math.sin(t * 3) * 1.2, 0, 6.283); c.fill();
            },
            tower(c, R, col, t) {
                c.beginPath(); c.ellipse(0, R * 0.4, R * 0.85, R * 0.3, 0, 0, 6.283); c.fill(); c.stroke();
                c.beginPath(); c.moveTo(-R * 0.2, R * 0.4); c.lineTo(-R * 0.1, -R * 0.9); c.lineTo(R * 0.1, -R * 0.9); c.lineTo(R * 0.2, R * 0.4); c.closePath(); c.fill(); c.stroke();
                for (const y of [-0.15, -0.5]) { c.beginPath(); c.moveTo(-R * 0.45, R * y); c.lineTo(R * 0.45, R * y); c.stroke(); }
                c.beginPath(); c.moveTo(0, -R * 0.9); c.lineTo(0, -R * 1.35); c.stroke();
                c.fillStyle = Math.sin(t * 4) > 0 ? '#ffffff' : col; c.beginPath(); c.arc(0, -R * 1.35, 3.5, 0, 6.283); c.fill();
                c.fillStyle = col; c.globalAlpha = 0.7; for (let k = 0; k < 4; k++) c.fillRect(-2, -R * 0.75 + k * R * 0.28, 4, 5); c.globalAlpha = 1;
            },
            solar(c, R, col, t) {
                for (const s of [-1, 1]) {
                    c.save(); c.translate(s * R * 0.95, 0); c.beginPath(); c.rect(-R * 0.5, -R * 0.38, R, R * 0.76); c.fill(); c.stroke();
                    c.lineWidth = 1; c.globalAlpha = 0.5; for (let k = 1; k < 4; k++) { c.beginPath(); c.moveTo(-R * 0.5 + k * R * 0.25, -R * 0.38); c.lineTo(-R * 0.5 + k * R * 0.25, R * 0.38); c.stroke(); }
                    c.beginPath(); c.moveTo(-R * 0.5, 0); c.lineTo(R * 0.5, 0); c.stroke(); c.restore();
                }
                c.lineWidth = 2.5; c.globalAlpha = 1; c.beginPath(); c.moveTo(-R * 0.5, 0); c.lineTo(R * 0.5, 0); c.stroke();
                c.beginPath(); c.arc(0, 0, R * 0.5, 0, 6.283); c.fill(); c.stroke();
                c.beginPath(); c.arc(0, 0, R * 0.28, 0, 6.283); c.stroke(); c.fillStyle = col; c.beginPath(); c.arc(0, 0, R * 0.09 + Math.sin(t * 3) * 1, 0, 6.283); c.fill();
            },
            hex(c, R, col, t) {
                const hx = (x, y, r) => { c.beginPath(); for (let k = 0; k < 6; k++) { const a = k * 1.0472 + 0.5236, px = x + Math.cos(a) * r, py = y + Math.sin(a) * r; k ? c.lineTo(px, py) : c.moveTo(px, py); } c.closePath(); c.fill(); c.stroke(); };
                const r = R * 0.36; hx(0, 0, r * 1.05); for (let k = 0; k < 6; k++) { const a = k * 1.0472; hx(Math.cos(a) * r * 1.85, Math.sin(a) * r * 1.85, r * 0.82); }
                c.fillStyle = col; for (let k = 0; k < 6; k++) { const a = k * 1.0472; c.globalAlpha = 0.4 + 0.4 * Math.sin(t * 2 + k); c.beginPath(); c.arc(Math.cos(a) * r * 1.85, Math.sin(a) * r * 1.85, 3, 0, 6.283); c.fill(); }
                c.globalAlpha = 1; c.beginPath(); c.arc(0, 0, 4 + Math.sin(t * 3), 0, 6.283); c.fill();
            },
            city(c, R, col, t) {
                const dome = () => { c.beginPath(); c.arc(0, R * 0.25, R * 0.85, Math.PI, 0); c.lineTo(R * 0.85, R * 0.25); c.closePath(); };
                c.beginPath(); c.moveTo(-R * 1.05, R * 0.25); c.lineTo(R * 1.05, R * 0.25); c.lineTo(R * 0.8, R * 0.5); c.lineTo(-R * 0.8, R * 0.5); c.closePath(); c.fill(); c.stroke();
                dome(); c.fill(); c.stroke();
                c.save(); dome(); c.clip(); c.fillStyle = col; c.globalAlpha = 0.55;
                [0.3, 0.55, 0.4, 0.7, 0.35, 0.5].forEach((h, i) => c.fillRect(-R * 0.7 + i * R * 0.26, R * 0.25 - h * R, R * 0.17, h * R));
                c.globalAlpha = 0.9; c.fillStyle = '#ffffff'; for (let k = 0; k < 8; k++) if (Math.sin(t * 1.5 + k * 2.3) > 0.3) c.fillRect(-R * 0.65 + k * R * 0.19, R * 0.05 - (k % 3) * R * 0.1, 2, 2);
                c.restore();
            },
            outpost(c, R, col, t) {
                c.save(); c.rotate(t * 1.6); c.fillStyle = col + '44'; c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, R * 1.25, -0.2, 0.2); c.closePath(); c.fill(); c.restore();
                c.fillStyle = '#0b1020'; c.beginPath(); c.rect(-R * 0.4, -R * 0.4, R * 0.8, R * 0.8); c.fill(); c.stroke();
                for (let k = 0; k < 4; k++) { c.save(); c.rotate(k * 1.5708); c.fillStyle = '#0b1020'; c.beginPath(); c.rect(R * 0.4, -R * 0.12, R * 0.5, R * 0.24); c.fill(); c.stroke(); c.fillStyle = col; c.beginPath(); c.arc(R * 0.95, 0, 4, 0, 6.283); c.fill(); c.restore(); }
                c.fillStyle = col; c.beginPath(); c.arc(0, 0, R * 0.14, 0, 6.283); c.fill();
            }
        };
        const offScreen = (o, m) => o.x < camera.x - m || o.x > camera.x + canvas.width + m || o.y < camera.y - m || o.y > camera.y + canvas.height + m;
        function drawStation(c, st, now, role) {
            const R = st.radius, col = st.color, t = now / 1000;
            c.save(); c.translate(st.x, st.y);
            const g = c.createRadialGradient(0, 0, R * 0.4, 0, 0, R * 2.3); g.addColorStop(0, col + '55'); g.addColorStop(1, col + '00');
            c.fillStyle = g; c.beginPath(); c.arc(0, 0, R * 2.3, 0, 6.283); c.fill();
            c.save(); c.rotate(t * 0.15); c.setLineDash([10, 14]); c.strokeStyle = col + '66'; c.lineWidth = 1.5; c.beginPath(); c.arc(0, 0, R + 38, 0, 6.283); c.stroke(); c.restore();
            const pu = (t % 2.4) / 2.4; c.strokeStyle = col; c.globalAlpha = (1 - pu) * 0.5; c.lineWidth = 2; c.beginPath(); c.arc(0, 0, R + pu * 70, 0, 6.283); c.stroke(); c.globalAlpha = 1;
            c.lineWidth = 2.5; c.strokeStyle = col; c.shadowColor = col; c.shadowBlur = 14; c.fillStyle = '#0b1020';
            (STATION_DRAW[st.style] || STATION_DRAW.ring)(c, R, col, t);
            c.shadowBlur = 0;
            for (let k = 0; k < 6; k++) { const a = k * 1.047 + t * 0.2, on = Math.sin(t * 3 + k * 1.7) > 0; c.fillStyle = on ? '#ffffff' : col + '55'; c.beginPath(); c.arc(Math.cos(a) * (R + 12), Math.sin(a) * (R + 12), 2.2, 0, 6.283); c.fill(); }
            if (role) {   // current objective: pulsing rings + tag
                const rc = role === 'pickup' ? '#00f3ff' : '#ff007f', p2 = (t % 1.2) / 1.2;
                c.strokeStyle = rc; c.shadowColor = rc; c.shadowBlur = 16; c.lineWidth = 3; c.beginPath(); c.arc(0, 0, R + 18 + p2 * 16, 0, 6.283); c.globalAlpha = 1 - p2 * 0.7; c.stroke(); c.globalAlpha = 1;
                c.beginPath(); c.arc(0, 0, R + 18, 0, 6.283); c.stroke(); c.shadowBlur = 0;
                const tag = role === 'pickup' ? 'PICKUP' : 'DROP-OFF', ty = -(R + 60);
                c.font = 'bold 11px Orbitron'; const tw = c.measureText(tag).width + 16;
                c.fillStyle = rc; c.beginPath(); c.roundRect ? c.roundRect(-tw / 2, ty - 11, tw, 20, 10) : c.rect(-tw / 2, ty - 11, tw, 20); c.fill();
                c.fillStyle = '#030308'; c.textAlign = 'center'; c.fillText(tag, 0, ty + 4);
            }
            const stars = Math.min(5, stationRep[st.id] || 0), y = R + 40;
            c.font = 'bold 12px Orbitron'; const w = c.measureText(st.name).width + 20;
            c.fillStyle = 'rgba(5,8,20,.8)'; c.strokeStyle = col + '99'; c.lineWidth = 1; c.beginPath(); c.roundRect ? c.roundRect(-w / 2, y - 13, w, 22, 6) : c.rect(-w / 2, y - 13, w, 22); c.fill(); c.stroke();
            c.fillStyle = '#ffffff'; c.textAlign = 'center'; c.fillText(st.name, 0, y + 3);
            if (stars) { c.font = 'bold 11px Orbitron'; c.fillStyle = '#fbbf24'; c.fillText('\u2605'.repeat(stars), 0, y + 22); }
            c.restore();
        }

        // ---- Wormhole portal: swirling spiral vortex with a void core ----
        function drawPortal(c, w, now) {
            const R = w.radius, t = now / 1000, low = Settings.lowfx;
            c.save(); c.translate(w.x, w.y);
            const g = c.createRadialGradient(0, 0, R * 0.3, 0, 0, R * 2.4);
            g.addColorStop(0, 'rgba(168,85,247,.45)'); g.addColorStop(0.5, 'rgba(34,211,238,.16)'); g.addColorStop(1, 'rgba(34,211,238,0)');
            c.fillStyle = g; c.beginPath(); c.arc(0, 0, R * 2.4, 0, 6.283); c.fill();
            const arms = low ? 2 : 4; c.lineCap = 'round';
            for (let a = 0; a < arms; a++) {
                const col = a % 2 ? '232,121,249' : '34,211,238', base = t * 1.6 + a * (6.283 / arms);
                for (let i = 0; i < 22; i++) {
                    const p = i / 22, p2 = (i + 1) / 22, r0 = R * (1.15 - p * 1.05), r1 = R * (1.15 - p2 * 1.05), a0 = base + p * 5.2, a1 = base + p2 * 5.2;
                    c.strokeStyle = `rgba(${col},${0.15 + p * 0.7})`; c.lineWidth = 1.5 + p * 3;
                    c.beginPath(); c.moveTo(Math.cos(a0) * r0, Math.sin(a0) * r0); c.lineTo(Math.cos(a1) * r1, Math.sin(a1) * r1); c.stroke();
                }
            }
            c.strokeStyle = 'rgba(165,243,252,.9)'; c.lineWidth = 2.5; c.shadowColor = '#22d3ee'; c.shadowBlur = 18;
            c.beginPath(); c.arc(0, 0, R, 0, 6.283); c.stroke(); c.shadowBlur = 0;
            c.setLineDash([6, 10]); c.lineDashOffset = -t * 40; c.strokeStyle = 'rgba(232,121,249,.8)'; c.lineWidth = 2;
            c.beginPath(); c.arc(0, 0, R + 9, 0, 6.283); c.stroke(); c.setLineDash([]);
            const core = c.createRadialGradient(0, 0, 0, 0, 0, R * 0.55);
            core.addColorStop(0, '#ffffff'); core.addColorStop(0.12, '#c4b5fd'); core.addColorStop(0.35, '#1e0b3a'); core.addColorStop(1, 'rgba(3,0,12,0)');
            c.fillStyle = core; c.beginPath(); c.arc(0, 0, R * (0.55 + Math.sin(t * 3) * 0.03), 0, 6.283); c.fill();
            if (!low) for (let k = 0; k < 6; k++) { const o = t * 2.2 + k * 1.047, rr = R * (0.85 + 0.1 * Math.sin(t * 3 + k)); c.fillStyle = k % 2 ? '#e879f9' : '#67e8f9'; c.beginPath(); c.arc(Math.cos(o) * rr, Math.sin(o) * rr, 2.4, 0, 6.283); c.fill(); }
            c.restore();
        }

        function renderGame() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            ctx.save();
            if (screenShakeTime > 0) {
                screenShakeTime--;
                if (Settings.shake) { const a = Math.min(16, 4 + screenShakeTime * 0.6); ctx.translate((Math.random() - 0.5) * a, (Math.random() - 0.5) * a); }
            }

            ctx.translate(-camera.x, -camera.y);

            // Draw Background Synthwave Grid
            drawSpaceGrid();

            // Draw Solar Flare Radiation Hazards
            solarFlares.forEach(sf => {
                ctx.save();
                const grad = ctx.createRadialGradient(sf.x, sf.y, 10, sf.x, sf.y, sf.radius);
                grad.addColorStop(0, 'rgba(249, 115, 22, 0.4)');
                grad.addColorStop(0.7, 'rgba(234, 179, 8, 0.15)');
                grad.addColorStop(1, 'rgba(234, 179, 8, 0)');
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(sf.x, sf.y, sf.radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            });

            // Draw Black Holes
            blackHoles.forEach(bh => {
                ctx.save();
                // Gravity Lens Distortion Ring
                ctx.strokeStyle = 'rgba(168, 85, 247, 0.4)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(bh.x, bh.y, bh.gravityRadius, 0, Math.PI * 2);
                ctx.stroke();

                // Core Vacuum Event Horizon
                ctx.fillStyle = '#000000';
                ctx.shadowColor = '#a855f7';
                ctx.shadowBlur = 25;
                ctx.beginPath();
                ctx.arc(bh.x, bh.y, bh.radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            });

            nebulae.forEach(n => { if (n.x + n.r < camera.x || n.x - n.r > camera.x + canvas.width || n.y + n.r < camera.y || n.y - n.r > camera.y + canvas.height) return;
                const g = ctx.createRadialGradient(n.x, n.y, 50, n.x, n.y, n.r); g.addColorStop(0, 'rgba(168,85,247,0.28)'); g.addColorStop(1, 'rgba(168,85,247,0)');
                ctx.fillStyle = g; ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, 6.283); ctx.fill(); });
            // Draw Delivery Stations
            stations.forEach(station => {
                if (offScreen(station, 220)) return;
                const ac = activeContract; let role = null;
                if (ac && gameState === 'PLAYING') { if (!ac.hasCargo && ac.pickupStation.id === station.id) role = 'pickup'; else if (ac.hasCargo && ac.dropoffStation.id === station.id) role = 'drop'; }
                drawStation(ctx, station, performance.now(), role);
            });

            // Mission guide line (animated dashed path to objective)
            if (activeContract && gameState === 'PLAYING') {
                const tg = activeContract.hasCargo ? activeContract.dropoffStation : activeContract.pickupStation;
                const gc = activeContract.hasCargo ? '#ff007f' : '#00f3ff';
                ctx.save();
                ctx.strokeStyle = gc; ctx.shadowColor = gc; ctx.shadowBlur = 10;
                ctx.globalAlpha = 0.55; ctx.lineWidth = 2;
                ctx.setLineDash([16, 12]); ctx.lineDashOffset = -performance.now() / 30;
                ctx.beginPath(); ctx.moveTo(player.x, player.y); ctx.lineTo(tg.x, tg.y); ctx.stroke();
                ctx.setLineDash([]); ctx.globalAlpha = 0.5 + 0.3 * Math.sin(performance.now() / 200);
                ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(tg.x, tg.y, tg.radius + 14, 0, Math.PI * 2); ctx.stroke();
                ctx.restore();
            }
            // Draw Debris Asteroids
            asteroids.forEach(ast => {
 if (ast.x < camera.x - 100 || ast.x > camera.x + canvas.width + 100 || ast.y < camera.y - 100 || ast.y > camera.y + canvas.height + 100) return;
 ctx.save();
                ctx.translate(ast.x, ast.y);
                ctx.rotate(ast.angle);

                ctx.strokeStyle = '#38bdf8';
                ctx.shadowColor = '#0284c7';
                ctx.shadowBlur = 8;
                ctx.lineWidth = 2;
                ctx.fillStyle = '#090d16';

                ctx.beginPath();
                ast.vertices.forEach((pt, idx) => {
                    const rx = Math.cos(pt.angle) * ast.radius * pt.dist;
                    const ry = Math.sin(pt.angle) * ast.radius * pt.dist;
                    if (idx === 0) ctx.moveTo(rx, ry);
                    else ctx.lineTo(rx, ry);
                });
                ctx.closePath();
                ctx.fill();
                ctx.stroke();

                ctx.restore();
            });

            // Draw Turrets
            turrets.forEach(turret => {
 if (turret.x < camera.x - 60 || turret.x > camera.x + canvas.width + 60 || turret.y < camera.y - 60 || turret.y > camera.y + canvas.height + 60) return;
 ctx.save();
                ctx.translate(turret.x, turret.y);
                ctx.fillStyle = '#ef4444';
                ctx.shadowColor = '#dc2626';
                ctx.shadowBlur = 12;
                ctx.beginPath();
                ctx.arc(0, 0, turret.radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            });

            const off = (o, m) => o.x < camera.x - m || o.x > camera.x + canvas.width + m || o.y < camera.y - m || o.y > camera.y + canvas.height + m;
            crates.forEach(c => { if (off(c, 30)) return; const col = c.type === 'fuel' ? '#fbbf24' : '#34d399';
                ctx.save(); ctx.shadowBlur = 12; ctx.shadowColor = col; ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 2;
                ctx.strokeRect(c.x - 8, c.y - 8, 16, 16); ctx.font = 'bold 10px Orbitron'; ctx.textAlign = 'center'; ctx.fillText(c.type === 'fuel' ? 'F' : '+', c.x, c.y + 4); ctx.restore(); });
            powerups.forEach(p => {
                if (off(p, 40) || (p.life < 300 && Math.floor(p.life / 10) % 2)) return;
                const col = PU[p.type].c, t = performance.now() / 300;
                ctx.save(); ctx.translate(p.x, p.y); ctx.shadowColor = col; ctx.shadowBlur = 18; ctx.strokeStyle = col; ctx.fillStyle = col + '33'; ctx.lineWidth = 2.5;
                ctx.rotate(t * 0.4); ctx.beginPath(); for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3, r = 19 + Math.sin(t + k) * 1.5; ctx[k ? 'lineTo' : 'moveTo'](Math.cos(a) * r, Math.sin(a) * r); } ctx.closePath(); ctx.fill(); ctx.stroke();
                ctx.rotate(-t * 0.4); ctx.fillStyle = col; ctx.font = 'bold 13px Orbitron'; ctx.textAlign = 'center'; ctx.fillText(PU[p.type].k, 0, 5); ctx.restore();
            });
            wormholes.forEach(w => { if (!off(w, w.radius * 2.6)) drawPortal(ctx, w, performance.now()); });
            if (activeContract && activeContract.type === 'RACE' && !activeContract.hasCargo) activeContract.gates.forEach((g, i) => {
                if (i < activeContract.gateIdx || off(g, 100)) return;
                const cur = i === activeContract.gateIdx, tt = performance.now() / 300;
                ctx.save(); ctx.translate(g.x, g.y); ctx.strokeStyle = cur ? '#a3e635' : 'rgba(163,230,53,.35)'; ctx.shadowColor = '#a3e635'; ctx.shadowBlur = cur ? 22 : 8; ctx.lineWidth = cur ? 4 : 2;
                ctx.beginPath(); ctx.arc(0, 0, 55 + (cur ? Math.sin(tt) * 5 : 0), 0, 6.283); ctx.stroke();
                ctx.font = 'bold 12px Orbitron'; ctx.fillStyle = ctx.strokeStyle; ctx.textAlign = 'center'; ctx.fillText(i + 1, 0, 5); ctx.restore();
            });
            pirates.forEach(p => { if (off(p, 40)) return; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.angle); ctx.strokeStyle = '#f43f5e'; ctx.shadowColor = '#f43f5e'; ctx.shadowBlur = 12; ctx.fillStyle = '#1f0710'; ctx.lineWidth = 2.5;
                ctx.beginPath(); ctx.moveTo(18, 0); ctx.lineTo(-14, -12); ctx.lineTo(-6, 0); ctx.lineTo(-14, 12); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore(); });
            pirates.forEach(p => {
                if ((!p.b && !p.s) || off(p, 40)) return;
                const col = p.b ? '#fbbf24' : '#60a5fa';
                ctx.save(); ctx.translate(p.x, p.y); ctx.strokeStyle = col; ctx.shadowColor = col; ctx.shadowBlur = 14; ctx.lineWidth = 2;
                ctx.beginPath(); ctx.arc(0, 0, p.radius + 10 + Math.sin(performance.now() / 200) * 2, 0, 6.283); ctx.stroke();
                ctx.font = 'bold 9px Orbitron'; ctx.fillStyle = col; ctx.textAlign = 'center'; ctx.fillText(p.b ? 'TARGET' : 'PATROL', 0, -p.radius - 16); ctx.restore();
            });
            bosses.forEach(b => { if (off(b, 120)) return; ctx.save(); ctx.translate(b.x, b.y); ctx.strokeStyle = '#f59e0b'; ctx.shadowColor = '#f59e0b'; ctx.shadowBlur = 25; ctx.lineWidth = 4; ctx.fillStyle = '#1a1005';
                ctx.rotate(performance.now() / 4000); ctx.beginPath(); for (let k = 0; k < 6; k++) { const a = k * 1.047; ctx.lineTo(Math.cos(a) * b.radius, Math.sin(a) * b.radius); } ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.rotate(-performance.now() / 4000);
                ctx.fillStyle = '#ef4444'; ctx.fillRect(-45, -b.radius - 18, 90 * b.hp / b.maxHp, 6); ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.strokeRect(-45, -b.radius - 18, 90, 6);
                ctx.font = 'bold 11px Orbitron'; ctx.fillStyle = '#f59e0b'; ctx.textAlign = 'center'; ctx.fillText('FORTRESS', 0, 4); ctx.restore(); });
            mines.forEach(m => { ctx.save(); ctx.fillStyle = Math.floor(performance.now() / 300) % 2 ? '#f472b6' : '#831843'; ctx.shadowColor = '#f472b6'; ctx.shadowBlur = 10; ctx.beginPath(); ctx.arc(m.x, m.y, 7, 0, 6.283); ctx.fill(); ctx.restore(); });
            if (escort) { ctx.save(); ctx.translate(escort.x, escort.y); ctx.rotate(escort.angle); ctx.strokeStyle = '#fbbf24'; ctx.shadowColor = '#fbbf24'; ctx.shadowBlur = 12; ctx.lineWidth = 2.5; ctx.fillStyle = '#1c1405';
                ctx.beginPath(); ctx.rect(-16, -9, 32, 18); ctx.fill(); ctx.stroke(); ctx.rotate(-escort.angle); ctx.fillStyle = '#34d399'; ctx.fillRect(-18, -24, 36 * Math.max(0, escort.hp) / 40, 4); ctx.restore(); }
            if (activeContract && activeContract.type === 'RESCUE' && !activeContract.hasCargo) { const p = activeContract.pickupStation; ctx.save(); ctx.strokeStyle = '#fbbf24'; ctx.shadowColor = '#fbbf24'; ctx.shadowBlur = 15; ctx.lineWidth = 2;
                ctx.beginPath(); ctx.arc(p.x, p.y, 10 + 6 * Math.sin(performance.now() / 200), 0, 6.283); ctx.stroke(); ctx.font = 'bold 11px Orbitron'; ctx.fillStyle = '#fbbf24'; ctx.textAlign = 'center'; ctx.fillText('PILOT', p.x, p.y - 22); ctx.restore(); }
            // Draw Lasers
            lasers.forEach(l => {
                ctx.save();
                ctx.strokeStyle = l.isPlayer ? (player.trailColor === 'none' ? '#00f3ff' : trailCol()) : '#ff0055';
                ctx.shadowColor = l.isPlayer ? (player.trailColor === 'none' ? '#00f3ff' : trailCol()) : '#ff0055';
                ctx.shadowBlur = 12;
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(l.x, l.y);
                ctx.lineTo(l.x - l.vx * 2, l.y - l.vy * 2);
                ctx.stroke();
                ctx.restore();
            });

            // Draw Particles
            particles.forEach(p => {
                ctx.save();
                ctx.fillStyle = p.color;
                ctx.shadowColor = p.color;
                ctx.shadowBlur = 6;
                ctx.globalAlpha = p.life;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            });

            // Wavy glowing thruster trail (same look as the Hangar preview)
if ((gameState === 'PLAYING' || gameState === 'PAUSED') && trailPts.length > 1 && player.trailColor !== 'none') {
    const now = performance.now(), boostK = player.isBoosting ? 1.35 : 1;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
    let px = 0, py = 0;
    for (let i = 0; i < trailPts.length; i++) {
        const p = i / 44, pt = trailPts[i], wv = Math.sin(now / 160 - i * 0.32) * (2 + p * 7);
        const x = pt.x + Math.cos(pt.a + Math.PI / 2) * wv, y = pt.y + Math.sin(pt.a + Math.PI / 2) * wv;
        if (i > 0) {
            const col = player.trailColor === 'rainbow' ? `hsl(${(now / 5 + i * 7) % 360},100%,60%)` : player.trailColor;
            ctx.globalAlpha = Math.pow(1 - p, 1.4) * 0.9; ctx.strokeStyle = col; ctx.shadowColor = col; ctx.shadowBlur = i % 3 ? 0 : 8;
            ctx.lineWidth = ((1 - p) * 11 + 1.2) * boostK;
            ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(x, y); ctx.stroke();
        }
        px = x; py = y;
    }
    ctx.restore();
}

            // Draw Player Craft Vector Art
            if (gameState === 'PLAYING' || gameState === 'PAUSED') {
 ctx.save();
 ctx.translate(player.x, player.y);
                ctx.rotate(player.angle);

                if (invuln > 45) { ctx.save(); ctx.strokeStyle = '#38bdf8'; ctx.shadowColor = '#38bdf8'; ctx.shadowBlur = 20; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, player.radius + 8, 0, 7); ctx.stroke(); ctx.restore(); }
                else if (invuln > 0 && Math.floor(invuln / 4) % 2) ctx.globalAlpha = 0.35;
                const currentSkin = SHIP_SKINS.find(s => s.id === player.skin) || SHIP_SKINS[0];

                ctx.strokeStyle = currentSkin.primaryColor;
                ctx.fillStyle = '#030712';
                ctx.shadowColor = currentSkin.primaryColor;
                ctx.shadowBlur = player.isBoosting ? 22 : 12;
                ctx.lineWidth = 2.5;

                // High Precision Vector Craft Silhouette
                ctx.beginPath();
                ctx.moveTo(player.radius + 4, 0); 
                ctx.lineTo(-player.radius, -player.radius * 0.75); 
                ctx.lineTo(-player.radius * 0.4, 0); 
                ctx.lineTo(-player.radius, player.radius * 0.75); 
                ctx.closePath();
                ctx.fill();
                ctx.stroke();

                // Cockpit Core
                ctx.fillStyle = currentSkin.secondaryColor;
                ctx.beginPath();
                ctx.arc(player.radius * 0.25, 0, 4, 0, Math.PI * 2);
                ctx.fill();
                { const fx = currentSkin.fx || '', t = performance.now();
                  ctx.save(); ctx.globalAlpha = 0.85;
                  if (fx.includes('aura')) { ctx.strokeStyle = currentSkin.secondaryColor; ctx.shadowColor = currentSkin.secondaryColor; ctx.shadowBlur = 16; ctx.lineWidth = 2; ctx.setLineDash([6, 8]); ctx.lineDashOffset = -t / 40; ctx.beginPath(); ctx.arc(0, 0, player.radius + 12, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]); }
                  if (fx.includes('orbit')) for (let k = 0; k < 3; k++) { const o = t / 250 + k * 2.094; ctx.fillStyle = currentSkin.secondaryColor; ctx.shadowColor = currentSkin.secondaryColor; ctx.shadowBlur = 12; ctx.beginPath(); ctx.arc(Math.cos(o) * (player.radius + 16), Math.sin(o) * (player.radius + 16), 3.5, 0, Math.PI * 2); ctx.fill(); }
                  ctx.restore(); }

                ctx.restore();
            }

            // Draw Floating Combat Text
            floatingTexts.forEach(ft => {
                ctx.save();
                ctx.font = 'bold 14px Orbitron';
                ctx.fillStyle = ft.color;
                ctx.shadowColor = ft.color;
                ctx.shadowBlur = 8;
                ctx.globalAlpha = ft.life;
                ctx.fillText(ft.text, ft.x, ft.y);
                ctx.restore();
            });

            ctx.restore();

            // Render Radar Minimap Overlay
            renderMinimap();
        }

        function drawSpaceGrid() {
            drawStars(); const gridSize = 140;
            const startX = Math.floor(camera.x / gridSize) * gridSize;
            const startY = Math.floor(camera.y / gridSize) * gridSize;

            ctx.save();
            ctx.strokeStyle = 'rgba(0, 243, 255, 0.06)';
            ctx.lineWidth = 1;

            for (let x = startX; x < startX + canvas.width + gridSize; x += gridSize) {
                ctx.beginPath();
                ctx.moveTo(x, camera.y);
                ctx.lineTo(x, camera.y + canvas.height);
                ctx.stroke();
            }

            for (let y = startY; y < startY + canvas.height + gridSize; y += gridSize) {
                ctx.beginPath();
                ctx.moveTo(camera.x, y);
                ctx.lineTo(camera.x + canvas.width, y);
                ctx.stroke();
            }
            ctx.restore();
        }

        /* ------------------------------------------------------------------
           EXPANDED DYNAMIC MINIMAP RADAR
           ------------------------------------------------------------------ */
        function renderMinimap() {
            if (!miniCanvas || !miniCtx) return;

            const w = miniCanvas.width;
            const h = miniCanvas.height;
            const center = w / 2;
            const scale = (w - 20) / WORLD_SIZE;

            miniCtx.clearRect(0, 0, w, h);
            if (nebulae.some(n => Math.hypot(player.x - n.x, player.y - n.y) < n.r)) { miniCtx.fillStyle = '#a855f7'; miniCtx.font = 'bold 11px Orbitron'; miniCtx.textAlign = 'center'; miniCtx.fillText('SIGNAL LOST', center, center); return; }

            // Background Grid Ring
            miniCtx.strokeStyle = 'rgba(0, 243, 255, 0.2)';
            miniCtx.lineWidth = 1;
            miniCtx.beginPath();
            miniCtx.arc(center, center, center - 4, 0, Math.PI * 2);
            miniCtx.stroke();

            // Draw Solar Flares on Radar
            solarFlares.forEach(sf => {
                miniCtx.fillStyle = 'rgba(249, 115, 22, 0.3)';
                miniCtx.beginPath();
                miniCtx.arc(sf.x * scale, sf.y * scale, Math.max(3, sf.radius * scale), 0, Math.PI * 2);
                miniCtx.fill();
            });

            // Draw Black Holes on Radar
            blackHoles.forEach(bh => {
                miniCtx.fillStyle = '#a855f7';
                miniCtx.beginPath();
                miniCtx.arc(bh.x * scale, bh.y * scale, 3.5, 0, Math.PI * 2);
                miniCtx.fill();
            });

            // Draw Stations
            stations.forEach(st => {
                miniCtx.fillStyle = st.color;
                miniCtx.beginPath();
                miniCtx.arc(st.x * scale, st.y * scale, 4, 0, Math.PI * 2);
                miniCtx.fill();
            });

            // Delivery Target Marker Pulse
            if (activeContract) {
                const target = activeContract.hasCargo ? activeContract.dropoffStation : activeContract.pickupStation;
                miniCtx.strokeStyle = activeContract.hasCargo ? '#ff007f' : '#00f3ff';
                miniCtx.lineWidth = 2;
                miniCtx.beginPath();
                miniCtx.arc(target.x * scale, target.y * scale, 7, 0, Math.PI * 2);
                miniCtx.stroke();
            }

            if (activeContract) {
                const tg = activeContract.hasCargo ? activeContract.dropoffStation : activeContract.pickupStation;
                miniCtx.save(); miniCtx.setLineDash([4, 4]); miniCtx.strokeStyle = activeContract.hasCargo ? '#ff007f' : '#00f3ff';
                miniCtx.beginPath(); miniCtx.moveTo(player.x * scale, player.y * scale); miniCtx.lineTo(tg.x * scale, tg.y * scale); miniCtx.stroke(); miniCtx.restore();
            }
            wormholes.forEach(w => { miniCtx.strokeStyle = '#22d3ee'; miniCtx.beginPath(); miniCtx.arc(w.x * scale, w.y * scale, 4, 0, 7); miniCtx.stroke(); });
            bosses.forEach(b => { miniCtx.fillStyle = '#ef4444'; miniCtx.fillRect(b.x * scale - 3, b.y * scale - 3, 6, 6); });
            // Draw Player Position Pointer & Heading
            const px = player.x * scale;
            const py = player.y * scale;

            miniCtx.fillStyle = '#ffffff';
            miniCtx.beginPath();
            miniCtx.arc(px, py, 3.5, 0, Math.PI * 2);
            miniCtx.fill();

            miniCtx.strokeStyle = '#00f3ff';
            miniCtx.lineWidth = 1.5;
            miniCtx.beginPath();
            miniCtx.moveTo(px, py);
            miniCtx.lineTo(px + Math.cos(player.angle) * 8, py + Math.sin(player.angle) * 8);
            miniCtx.stroke();
        }

        /* ------------------------------------------------------------------
           HUD UPDATES
           ------------------------------------------------------------------ */
        function updateHUD() {
            renderPU(); renderAbility();
            // Hull & Shield Gauge
            const hullPct = Math.max(0, (player.hull / player.maxHull) * 100);
            document.getElementById('hudHullBar').style.width = `${hullPct}%`;
            document.getElementById('hudHullText').textContent = `${Math.ceil(player.hull)} / ${player.maxHull}`;

            // Fuel Gauge
            const fuelPct = Math.max(0, (player.fuel / player.maxFuel) * 100);
            document.getElementById('hudFuelBar').style.width = `${fuelPct}%`;
            document.getElementById('hudFuelText').textContent = `${Math.ceil(fuelPct)}%`;

            // Boost Tank Gauge
            const boostPct = Math.max(0, (player.boost / player.maxBoost) * 100);
            document.getElementById('hudBoostBar').style.width = `${boostPct}%`;
            document.getElementById('hudBoostText').textContent = `${Math.ceil(boostPct)}%`;

            // Engine Heat Gauge
            const heatPct = Math.max(0, (player.heat / player.maxHeat) * 100);
            document.getElementById('hudHeatBar').style.width = `${heatPct}%`;
            document.getElementById('hudHeatText').textContent = `${Math.ceil(heatPct)}%`;

            // Credits
            document.getElementById('hudCredits').textContent = `${credits} CR`;
            document.getElementById('hudScore').textContent = calcScore();

            // Dynamic Compass
            if (activeContract) {
                const target = activeContract.hasCargo ? activeContract.dropoffStation : activeContract.pickupStation;
                const angleToTarget = Math.atan2(target.y - player.y, target.x - player.x);
                const distToTarget = Math.floor(Math.hypot(target.x - player.x, target.y - player.y));

                const navArrow = document.getElementById('navArrow');
                navArrow.style.transform = `rotate(${angleToTarget * (180 / Math.PI)}deg)`;
                document.getElementById('navDistance').textContent = `${distToTarget} m · SHIELD ${shieldCd <= 0 ? 'READY' : Math.ceil(shieldCd / 60) + 's'}`;
            }
        }

        /* ------------------------------------------------------------------
           GAME STATE MANAGEMENT
           ------------------------------------------------------------------ */
        function startGame() {
            loadSaveData();
            initWorld();
            sound.init(); runContracts = runCredits = runDistance = 0; combo = 0; stranded = 0; invuln = 0; acc = 0; lastTime = performance.now();
            gameState = 'PLAYING';

            document.getElementById('mainMenu').classList.add('hidden');
            document.getElementById('hangarMenu').classList.add('hidden');
            document.getElementById('pauseMenu').classList.add('hidden');
            document.getElementById('gameOverMenu').classList.add('hidden');
            document.getElementById('hud').classList.remove('hidden');

            resizeCanvas();
            Tut.begin(); Daily.begin(); Ach.beginRun(); powerups = []; puTimer = 1200; pu = { over: 0, shield: 0, dbl: 0 }; abCd = 120;
        }

        function pauseGame() {
            gameState = 'PAUSED';
            document.getElementById('pauseMenu').classList.remove('hidden');
            document.getElementById('pauseMenu').classList.add('flex');
        }

        function resumeGame() {
            gameState = 'PLAYING';
            document.getElementById('pauseMenu').classList.add('hidden');
            document.getElementById('pauseMenu').classList.remove('flex');
        }

        function gameOver(reason) {
            gameState = 'GAMEOVER'; saveGameData();
            sound.playExplosion();

            document.getElementById('gameOverTitle').textContent = reason;
            const nb = runContracts > bestContracts; if (nb) bestContracts = runContracts; saveGameData();
            // Score = credits earned + 250 per contract + 5 per km flown
            Ach.quiet(true); Ach.runEnd(); Haptic.buzz(250); Tut.hide();
            const score = calcScore();
            const pre = Prog.info(), xpGain = Prog.runEnd(score), post = Prog.info(); Ach.quiet(false);
            const sc = Auth.addScore(score, runContracts, Math.floor(runDistance), Prog.level());
            const ab = document.getElementById('accBest'); if (ab) ab.textContent = 'BEST ' + sc.best;
            const $ = id => document.getElementById(id), pos = Auth.position(), rk = Prog.rank(), leveled = post.level > pre.level;
            lastRun = { score, rank: rk[1], lv: post.level };
            $('endContracts').textContent = runContracts;
            $('endCredits').textContent = `+${runCredits} CR`;
            $('endDistance').textContent = `${Math.floor(runDistance)} km`;
            // animated score
            const sEl = $('goScore'), t0 = performance.now(); (function tick(t) { const k = Math.min(1, (t - t0) / 1100); sEl.textContent = Math.round(score * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(tick); })(t0);
            const badge = $('goBadge'); badge.className = 'go-badge' + (sc.isNew ? ' new' : '');
            badge.textContent = sc.isNew ? '\u2605 NEW HIGH SCORE \u2605' : 'HIGH SCORE ' + sc.best;
            $('gameOverSub').textContent = (pos.total > 1 ? `#${pos.pos} of ${pos.total} pilots on this device \u00b7 ` : '') + (nb ? `New record: ${bestContracts} contracts` : `Best run: ${bestContracts} contracts`);
            // XP bar fills from where it was to where it is now
            $('goRank').textContent = rk[1] + ' \u00b7 LV ' + post.level + (leveled ? '  \u2191 LEVEL UP!' : ''); $('goRank').style.color = rk[2];
            $('goXpGain').textContent = '+' + xpGain + ' XP';
            const bar = $('goXpBar'); bar.style.transition = 'none'; bar.style.width = (pre.into / pre.need * 100) + '%'; void bar.offsetWidth; bar.style.transition = 'width 1s ease-out';
            bar.style.width = (leveled ? 100 : post.into / post.need * 100) + '%';
            if (leveled) setTimeout(() => { bar.style.transition = 'none'; bar.style.width = '0%'; void bar.offsetWidth; bar.style.transition = 'width .6s ease-out'; bar.style.width = (post.into / post.need * 100) + '%'; }, 1100);
            const log = Ach.runLog(); $('goUnlocks').innerHTML = log.length ? '<div class="go-unl-title">UNLOCKED THIS RUN</div>' + log.slice(0, 4).map(t => `<span>${t}</span>`).join('') + (log.length > 4 ? `<span>+${log.length - 4} more</span>` : '') : '';

            document.getElementById('hud').classList.add('hidden');
            document.getElementById('gameOverMenu').classList.remove('hidden');
            document.getElementById('gameOverMenu').classList.add('flex');
        }

        /* ------------------------------------------------------------------
           HANGAR & SHIP SKINS SHOPPING UI
           ------------------------------------------------------------------ */
        function openHangar() {
            gameState = 'HANGAR';
            renderSkinsGrid();
            renderTrailsGrid();
            updateShopUI();
            document.getElementById('mainMenu').classList.add('hidden');
            document.getElementById('hangarMenu').classList.remove('hidden');
            document.getElementById('hangarMenu').classList.add('flex');
        }

        function closeHangar() {
            gameState = 'MENU';
            document.getElementById('hangarMenu').classList.add('hidden');
            document.getElementById('hangarMenu').classList.remove('flex');
            document.getElementById('mainMenu').classList.remove('hidden');
        }

        // ---- Live ship previews for the hangar cards ----
        let skinPreviews = [], lastPreview = 0;
        function drawSkinPreview(cv, skin, t) {
            const c = cv.getContext('2d'), w = cv.width, h = cv.height, fx = skin.fx || '', locked = !skin.unlocked;
            c.clearRect(0, 0, w, h);
            const bg = c.createRadialGradient(w / 2, h * 0.55, 6, w / 2, h * 0.55, w * 0.65);
            bg.addColorStop(0, skin.primaryColor + '40'); bg.addColorStop(1, '#050816');
            c.fillStyle = bg; c.fillRect(0, 0, w, h);
            c.strokeStyle = skin.primaryColor + '22'; c.lineWidth = 1;
            for (let y = h * 0.72, d = 8; y < h; y += d, d += 5) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); }
            for (let x = -w; x <= w * 2; x += 36) { c.beginPath(); c.moveTo(w / 2 + (x - w / 2) * 0.25, h * 0.72); c.lineTo(x, h); c.stroke(); }
            c.save(); c.translate(w / 2, h * 0.5 + Math.sin(t / 500) * 3); c.rotate(-0.55); c.scale(1.55, 1.55);
            const r = 20;
            if (fx.includes('ghost')) c.globalAlpha = 0.6 + 0.3 * Math.sin(t / 350);
            // engine flame
            const fl = 14 + Math.random() * 6, fc = fx.includes('flame') ? '#f97316' : (player.trailColor || '#00f3ff');
            c.fillStyle = fc; c.shadowColor = fc; c.shadowBlur = 12; c.beginPath(); c.moveTo(-r * 0.45, 0); c.lineTo(-r * 0.45 - fl, -3); c.lineTo(-r * 0.45 - fl * 0.6, 0); c.lineTo(-r * 0.45 - fl, 3); c.closePath(); c.fill();
            if (fx.includes('void')) { c.strokeStyle = 'rgba(168,85,247,.55)'; c.lineWidth = 3; c.shadowColor = '#a855f7'; c.beginPath(); c.arc(0, 0, r + 8 + Math.sin(t / 300) * 2, 0, 7); c.stroke(); }
            if (fx.includes('aura')) { c.save(); c.rotate(t / 900); c.strokeStyle = skin.secondaryColor; c.shadowColor = skin.secondaryColor; c.lineWidth = 1.5; c.setLineDash([5, 6]); c.beginPath(); c.arc(0, 0, r + 12, 0, 7); c.stroke(); c.restore(); }
            c.strokeStyle = fx.includes('rainbow') ? `hsl(${(t / 8) % 360},100%,60%)` : skin.primaryColor;
            c.fillStyle = '#030712'; c.shadowColor = c.strokeStyle; c.shadowBlur = 14; c.lineWidth = 2.5; c.setLineDash([]);
            c.beginPath(); c.moveTo(r + 4, 0); c.lineTo(-r, -r * 0.75); c.lineTo(-r * 0.4, 0); c.lineTo(-r, r * 0.75); c.closePath(); c.fill(); c.stroke();
            c.fillStyle = skin.secondaryColor; c.shadowColor = skin.secondaryColor; c.beginPath(); c.arc(r * 0.25, 0, 3.5, 0, 7); c.fill();
            if (fx.includes('orbit')) for (let k = 0; k < 3; k++) { const o = t / 450 + k * 2.094; c.beginPath(); c.arc(Math.cos(o) * (r + 14), Math.sin(o) * (r + 14), 2.5, 0, 7); c.fill(); }
            c.restore();
            if (fx.includes('sparkle')) for (let k = 0; k < 6; k++) { const a = (t / 700 + k * 1.7) % 2; if (a < 1) { const x = (k * 53 + 20) % w, y = (k * 37 + 10) % (h * 0.7), s = 3 * Math.sin(a * Math.PI); c.fillStyle = '#fff'; c.fillRect(x - s, y - 0.5, s * 2, 1); c.fillRect(x - 0.5, y - s, 1, s * 2); } }
            if (locked) { c.fillStyle = 'rgba(3,7,18,.5)'; c.fillRect(0, 0, w, h); }
        }
        function skinPreviewLoop(t) {
            requestAnimationFrame(skinPreviewLoop);
            if (t - lastPreview < 33 || gameState !== 'HANGAR') return;
            lastPreview = t;
            trailPreviews.forEach(p => { const r = p.cv.getBoundingClientRect(); if (r.width && r.bottom > 0 && r.top < innerHeight) drawTrailPreview(p.cv, t, p.hex, p.locked); });
            skinPreviews.forEach(p => { const r = p.cv.getBoundingClientRect(); if (r.bottom > 0 && r.top < innerHeight && r.width) drawSkinPreview(p.cv, p.skin, t); });
        }

        function renderSkinsGrid() {
            applyUpgrades();
            const skinsPanel = document.getElementById('skinsPanel');
            skinsPanel.innerHTML = '';
            skinPreviews = [];

            SHIP_SKINS.forEach(skin => {
                const isSelected = player.skin === skin.id;
                const card = document.createElement('div');
                card.className = `bg-slate-950 p-3 rounded-xl border flex flex-col gap-2 transition-all ${isSelected ? 'border-cyan-400 box-glow-cyan' : 'border-slate-800 hover:border-slate-600'}`;
                const st = SKIN_STATS[skin.id], fxName = (skin.fx || '').split(' ').filter(Boolean).join(' + ').toUpperCase();
                const pill = (txt, cls) => `<span class="px-1.5 py-0.5 rounded text-[10px] font-orbitron ${cls}">${txt}</span>`;
                card.innerHTML = `
                    <div class="relative rounded-lg overflow-hidden border border-slate-800">
                        <canvas width="220" height="120" class="skin-preview w-full block"></canvas>
                        <span class="absolute top-1.5 right-1.5 text-[10px] font-orbitron px-2 py-0.5 rounded ${skin.unlocked ? 'bg-cyan-950/90 text-cyan-300 border border-cyan-500/40' : 'bg-slate-900/90 text-amber-300 border border-amber-500/40'}">${skin.unlocked ? 'UNLOCKED' : skin.cost + ' CR'}</span>
                        ${skin.unlocked ? '' : '<i class="fa-solid fa-lock absolute top-2 left-2 text-slate-300/80 text-xs"></i>'}
                    </div>
                    <div class="font-orbitron font-bold text-sm" style="color:${skin.primaryColor}">${skin.name}</div>
                    <p class="text-[11px] text-slate-400 leading-snug">${skin.desc}</p>
                    <div class="flex flex-wrap gap-1 min-h-[22px]">
                        ${pill('ABILITY: ' + ABILITY[ABILITY_BY_SKIN[skin.id] || 'dash'].n, 'bg-pink-950 text-pink-300')}
                        ${st ? pill('HULL ×' + st[0], 'bg-cyan-950 text-cyan-300') + pill('SPEED ×' + st[1], 'bg-cyan-950 text-cyan-300') + pill('THRUST ×' + st[2], 'bg-cyan-950 text-cyan-300') : ''}
                        ${fxName ? pill(fxName + ' FX', 'bg-purple-950 text-purple-300') : ''}
                        ${skin.perk ? pill(PERKS[skin.perk], 'bg-amber-950 text-amber-300') : ''}
                    </div>
                    <button class="skin-btn w-full py-2 mt-auto font-orbitron text-xs rounded-lg transition-all ${isSelected ? 'bg-cyan-600 text-slate-950 font-bold' : skin.unlocked ? 'bg-slate-800 hover:bg-slate-700 text-slate-200' : (credits >= skin.cost ? 'bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold' : 'bg-slate-900 text-slate-500 border border-slate-800')}">
                        ${isSelected ? 'EQUIPPED' : skin.unlocked ? 'EQUIP SKIN' : 'UNLOCK SKIN'}
                    </button>
                `;
                skinPreviews.push({ cv: card.querySelector('canvas'), skin });

                card.querySelector('.skin-btn').addEventListener('click', () => {
                    if (skin.unlocked) {
                        player.skin = skin.id;
                        saveGameData();
                        renderSkinsGrid();
                    } else if (credits >= skin.cost) {
                        credits -= skin.cost;
                        skin.unlocked = true;
                        player.skin = skin.id;
                        saveGameData();
                        updateShopUI();
                        renderSkinsGrid();
                    }
                });

                skinsPanel.appendChild(card);
            });
        }

        let trailPreviews = [];
        function drawTrailPreview(cv, t, hex, locked) {
    const c = cv.getContext('2d'), w = cv.width, h = cv.height, sk = curSkin();
    const bg = c.createLinearGradient(0, 0, w, 0); bg.addColorStop(0, '#050816'); bg.addColorStop(1, '#0c1233');
    c.fillStyle = bg; c.fillRect(0, 0, w, h);
    c.fillStyle = 'rgba(255,255,255,.35)'; 
    for (let k = 0; k < 14; k++) c.fillRect((k * 61 - t / 14 * (1 + k % 3)) % w + (k * 61 - t / 14 * (1 + k % 3) < 0 ? w : 0), (k * 29) % h, 1.2, 1.2);

    // Draw thruster trail line if not disabled
    if (hex !== 'none') {
        c.save(); c.globalCompositeOperation = 'lighter';
        for (let i = 0; i < 46; i++) {
            const p = i / 46, x = w * 0.64 - i * (w * 0.0125), y = h / 2 + Math.sin(t / 160 - i * 0.32) * (2 + p * 7);
            const col = hex === 'rainbow' ? `hsl(${(t / 5 + i * 7) % 360},100%,60%)` : hex;
            c.globalAlpha = Math.pow(1 - p, 1.4) * 0.9; c.fillStyle = col; c.shadowColor = col; c.shadowBlur = 8;
            c.beginPath(); c.arc(x, y, (1 - p) * 5.5 + 0.6, 0, 7); c.fill();
        }
        c.restore();
    } else {
        // Larger, brighter OFF indicator text
        c.font = '900 18px Orbitron';
        c.fillStyle = '#94a3b8';
        c.shadowColor = '#64748b';
        c.shadowBlur = 6;
        c.textAlign = 'center';
        c.fillText('OFF', w * 0.3, h / 2 + 6);
        c.shadowBlur = 0; // Reset blur for ship render
    }

    // Ship vector preview
    c.save(); c.translate(w * 0.72, h / 2 + Math.sin(t / 500) * 1.5); const r = 14;
    c.strokeStyle = sk.primaryColor; c.shadowColor = sk.primaryColor; c.shadowBlur = 10; c.lineWidth = 2; c.fillStyle = '#030712';
    c.beginPath(); c.moveTo(r + 4, 0); c.lineTo(-r, -r * 0.75); c.lineTo(-r * 0.4, 0); c.lineTo(-r, r * 0.75); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = sk.secondaryColor; c.beginPath(); c.arc(r * 0.25, 0, 2.6, 0, 7); c.fill(); c.restore();
    if (locked) { c.fillStyle = 'rgba(3,7,18,.5)'; c.fillRect(0, 0, w, h); }
}

        function renderTrailsGrid() {
    const grid = document.getElementById('trailColorsGrid');
    grid.innerHTML = ''; trailPreviews = [];
    TRAIL_COLORS.forEach(t => {
        const sel = player.trailColor === t.hex;
        const btn = document.createElement('button');
        btn.className = `trail-card relative rounded-xl border overflow-hidden text-left transition-all bg-slate-950 ${sel ? 'border-cyan-400 box-glow-cyan' : 'border-slate-800 hover:border-slate-600'}`;
        
        const sw = t.hex === 'none' 
            ? 'background:#1e293b;border:1px solid #475569;' 
            : (t.hex === 'rainbow' ? 'background:linear-gradient(90deg,#f00,#ff0,#0f0,#0ff,#00f,#f0f)' : `background-color:${t.hex};box-shadow:0 0 8px ${t.hex}`);
        
        const status = sel ? '<span class="text-cyan-300">EQUIPPED</span>' : t.unlocked ? '<span class="text-cyan-400/80">UNLOCKED</span>' : `<span class="text-amber-400"><i class="fa-solid fa-lock mr-1"></i>${t.cost} CR</span>`;
        
        btn.innerHTML = `<canvas class="trail-preview w-full block" width="220" height="72"></canvas>
            <div class="flex items-center gap-2 p-2.5"><span class="w-3.5 h-3.5 rounded-full shrink-0 flex items-center justify-center text-[8px] text-slate-400" style="${sw}">${t.hex === 'none' ? '✕' : ''}</span>
            <span class="flex-1 font-orbitron text-xs text-slate-200 truncate">${t.label}</span><span class="text-[10px] font-orbitron whitespace-nowrap">${status}</span></div>`;
        
        trailPreviews.push({ cv: btn.querySelector('canvas'), hex: t.hex, locked: !t.unlocked });
        btn.addEventListener('click', () => {
            if (t.unlocked) player.trailColor = t.hex;
            else if (credits >= t.cost) { credits -= t.cost; t.unlocked = true; player.trailColor = t.hex; updateShopUI(); }
            else return;
            saveGameData(); renderTrailsGrid();
        });
        grid.appendChild(btn);
    });
}

        function updateShopUI() {
            const lw = document.getElementById('lvlWeapon');
            if (lw) { const l = upgrades.weaponLvl || 1; lw.textContent = 'LVL ' + l; document.getElementById('costWeapon').textContent = l >= 3 ? 'MAX' : upCost('weapon', l) + ' CR'; }
            document.getElementById('shopCreditsText').textContent = `${credits} CR`;

            document.getElementById('lvlShield').textContent = `LVL ${upgrades.shieldLvl}`;
            document.getElementById('costShield').textContent = upTxt('shield', upgrades.shieldLvl);

            document.getElementById('lvlEngine').textContent = `LVL ${upgrades.engineLvl}`;
            document.getElementById('costEngine').textContent = upTxt('engine', upgrades.engineLvl);

            document.getElementById('lvlFuel').textContent = `LVL ${upgrades.fuelLvl}`;
            document.getElementById('costFuel').textContent = upTxt('fuel', upgrades.fuelLvl);

            document.getElementById('lvlCooling').textContent = `LVL ${upgrades.coolingLvl}`;
            document.getElementById('costCooling').textContent = upTxt('cooling', upgrades.coolingLvl);
            decorateUpgrades();
        }

        // ---- Upgrade cards (built here so they share one design) ----
        const UPG = [
            { k: 'Shield', key: 'shieldLvl', base: 'shield', icon: 'fa-shield-halved', ac: '#22d3ee', name: 'REINFORCED SHIELD HULL', desc: 'More structural integrity against high-velocity impacts.', stat: l => 'HULL ' + (100 + (l - 1) * 40) },
            { k: 'Engine', key: 'engineLvl', base: 'engine', icon: 'fa-gauge-high', ac: '#38bdf8', name: 'VECTOR THRUSTER POWER', desc: 'More main acceleration thrust and directional torque.', stat: l => 'THRUST ' + (0.35 + (l - 1) * 0.08).toFixed(2) },
            { k: 'Fuel', key: 'fuelLvl', base: 'fuel', icon: 'fa-gas-pump', ac: '#fbbf24', name: 'FUEL CELLS', desc: 'Bigger reactor fuel capacity for long courier trips.', stat: l => 'FUEL ' + (100 + (l - 1) * 50) },
            { k: 'Cooling', key: 'coolingLvl', base: 'cooling', icon: 'fa-snowflake', ac: '#f87171', name: 'CRYOGENIC RADIATORS', desc: 'Slower engine heat build-up and faster cooling.', stat: l => 'COOLING ' + (0.25 + (l - 1) * 0.15).toFixed(2) },
            { k: 'Weapon', key: 'weaponLvl', base: 'weapon', max: 3, icon: 'fa-burst', ac: '#f472b6', name: 'SPREAD LASERS', desc: 'Adds side beams to your lasers; max level also fires faster.', stat: l => ['SINGLE BEAM', 'SIDE BEAMS', 'SIDE BEAMS + RAPID FIRE'][l - 1] }
        ];
        (function buildUpgrades() {
            const panel = document.getElementById('upgradesPanel'); panel.innerHTML = '';
            UPG.forEach(u => {
                const card = document.createElement('div'); card.className = 'upg-card'; card.style.setProperty('--ac', u.ac);
                card.innerHTML = `
                    <div class="upg-head"><span class="upg-icon"><i class="fa-solid ${u.icon}"></i></span>
                        <div class="upg-title"><div class="upg-name">${u.name}</div><div class="upg-desc">${u.desc}</div></div>
                        <span id="lvl${u.k}" class="upg-lvl">LVL 1</span></div>
                    <div id="pips${u.k}" class="upg-pips"></div>
                    <div id="stat${u.k}" class="upg-stat"></div>
                    <button id="buy${u.k}Btn" class="upg-btn"><span id="upLbl${u.k}">UPGRADE</span><span id="cost${u.k}" class="font-bold">0 CR</span></button>`;
                panel.appendChild(card);
            });
        })();
        function decorateUpgrades() {
            UPG.forEach(u => {
                const el = id => document.getElementById(id + u.k); if (!el('pips')) return;
                const lvl = upgrades[u.key] || 1, max = u.max || MAX_LVL, maxed = lvl >= max, cost = maxed ? 0 : upCost(u.base, lvl);
                el('lvl').textContent = `LVL ${lvl}/${max}`;
                el('pips').innerHTML = Array.from({ length: max }, (_, n) => `<i class="${n < lvl ? 'on' : ''}"></i>`).join('');
                el('stat').innerHTML = `${u.stat(lvl)}` + (maxed ? ' <b>MAX</b>' : ` <span>&rarr;</span> <b>${u.stat(lvl + 1)}</b>`);
                el('cost').textContent = maxed ? '' : cost + ' CR'; el('upLbl').textContent = maxed ? 'MAXED OUT' : 'UPGRADE';
                const b = document.getElementById('buy' + u.k + 'Btn'); b.disabled = maxed; b.className = 'upg-btn' + (maxed ? ' maxed' : credits >= cost ? ' can' : '');
            });
        }

        // Upgrade Buttons
        document.getElementById('buyShieldBtn').addEventListener('click', () => {
            if (upgrades.shieldLvl >= MAX_LVL) return;
            const cost = upCost('shield', upgrades.shieldLvl);
            if (credits >= cost) {
                credits -= cost;
                upgrades.shieldLvl++;
                applyUpgrades();
                saveGameData();
            }
        });

        document.getElementById('buyEngineBtn').addEventListener('click', () => {
            if (upgrades.engineLvl >= MAX_LVL) return;
            const cost = upCost('engine', upgrades.engineLvl);
            if (credits >= cost) {
                credits -= cost;
                upgrades.engineLvl++;
                applyUpgrades();
                saveGameData();
            }
        });

        document.getElementById('buyFuelBtn').addEventListener('click', () => {
            if (upgrades.fuelLvl >= MAX_LVL) return;
            const cost = upCost('fuel', upgrades.fuelLvl);
            if (credits >= cost) {
                credits -= cost;
                upgrades.fuelLvl++;
                applyUpgrades();
                saveGameData();
            }
        });

        document.getElementById('buyCoolingBtn').addEventListener('click', () => {
            if (upgrades.coolingLvl >= MAX_LVL) return;
            const cost = upCost('cooling', upgrades.coolingLvl);
            if (credits >= cost) {
                credits -= cost;
                upgrades.coolingLvl++;
                applyUpgrades();
                saveGameData();
            }
        });

        document.getElementById('buyWeaponBtn').addEventListener('click', () => {
            const l = upgrades.weaponLvl || 1; if (l >= 3) return;
            const c = upCost('weapon', l);
            if (credits >= c) { credits -= c; upgrades.weaponLvl = l + 1; updateShopUI(); saveGameData(); }
        });
        // Hangar Tab Navigation
        document.getElementById('tabSkins').addEventListener('click', (e) => {
            document.getElementById('skinsPanel').classList.remove('hidden');
            document.getElementById('upgradesPanel').classList.add('hidden');
            document.getElementById('trailsPanel').classList.add('hidden');

            e.target.className = "pb-2 font-orbitron text-sm font-bold text-cyan-400 border-b-2 border-cyan-400";
            document.getElementById('tabUpgrades').className = "pb-2 font-orbitron text-sm font-bold text-slate-400 hover:text-cyan-400";
            document.getElementById('tabTrails').className = "pb-2 font-orbitron text-sm font-bold text-slate-400 hover:text-cyan-400";
        });

        document.getElementById('tabUpgrades').addEventListener('click', (e) => {
            document.getElementById('skinsPanel').classList.add('hidden');
            document.getElementById('upgradesPanel').classList.remove('hidden');
            document.getElementById('trailsPanel').classList.add('hidden');

            e.target.className = "pb-2 font-orbitron text-sm font-bold text-cyan-400 border-b-2 border-cyan-400";
            document.getElementById('tabSkins').className = "pb-2 font-orbitron text-sm font-bold text-slate-400 hover:text-cyan-400";
            document.getElementById('tabTrails').className = "pb-2 font-orbitron text-sm font-bold text-slate-400 hover:text-cyan-400";
        });

        document.getElementById('tabTrails').addEventListener('click', (e) => {
            document.getElementById('skinsPanel').classList.add('hidden');
            document.getElementById('upgradesPanel').classList.add('hidden');
            document.getElementById('trailsPanel').classList.remove('hidden');

            e.target.className = "pb-2 font-orbitron text-sm font-bold text-cyan-400 border-b-2 border-cyan-400";
            document.getElementById('tabSkins').className = "pb-2 font-orbitron text-sm font-bold text-slate-400 hover:text-cyan-400";
            document.getElementById('tabUpgrades').className = "pb-2 font-orbitron text-sm font-bold text-slate-400 hover:text-cyan-400";
        });

        // Touch controls: left thumb = floating joystick (steer + thrust), right side = aim + fire, buttons = abilities
        const hold = (id, code) => { const b = document.getElementById(id);
            const on = e => { e.preventDefault(); keys[code] = true; }, off = e => { e.preventDefault(); keys[code] = false; };
            b.addEventListener('touchstart', on, { passive: false });
            b.addEventListener('touchend', off, { passive: false });
            b.addEventListener('touchcancel', off, { passive: false }); };
        hold('touchBoost', 'Space'); hold('touchShoot', 'KeyJ');
        const tap = (id, fn) => document.getElementById(id).addEventListener('touchstart', e => { e.preventDefault(); fn(); }, { passive: false });
        tap('touchShield', () => useShield()); tap('touchMine', () => dropMine()); tap('touchAbility', () => useAbility());

        const joyBase = document.getElementById('joyBase'), joyKnob = document.getElementById('joyKnob');
        let joyId = null, joyOrigin = null, aimId = null, joyVec = null, aimPt = null;
        const applyTouchAim = () => {
            if (aimPt) { mousePos.x = aimPt.x / viewZoom; mousePos.y = aimPt.y / viewZoom; }
            else if (joyVec) { mousePos.x = canvas.width / 2 + joyVec.x * 300; mousePos.y = canvas.height / 2 + joyVec.y * 300; }
            keys['KeyW'] = !!joyVec;
        };
        const touchStartC = e => { e.preventDefault();
            for (const t of e.changedTouches) {
                if ((Settings.lefty ? t.clientX > window.innerWidth * 0.55 : t.clientX < window.innerWidth * 0.45) && joyId === null) {
                    joyId = t.identifier; joyOrigin = { x: t.clientX, y: t.clientY }; joyVec = { x: 0, y: 0 };
                    joyBase.style.cssText = 'display:block;left:' + t.clientX + 'px;top:' + t.clientY + 'px';
                    joyKnob.style.cssText = 'display:block;left:' + t.clientX + 'px;top:' + t.clientY + 'px';
                } else if ((Settings.lefty ? t.clientX <= window.innerWidth * 0.55 : t.clientX >= window.innerWidth * 0.45) && aimId === null) {
                    aimId = t.identifier; aimPt = { x: t.clientX, y: t.clientY }; keys['KeyJ'] = true;
                }
            } applyTouchAim(); };
        const touchMoveC = e => { e.preventDefault();
            for (const t of e.changedTouches) {
                if (t.identifier === joyId) {
                    let dx = t.clientX - joyOrigin.x, dy = t.clientY - joyOrigin.y; const d = Math.hypot(dx, dy), max = 55;
                    if (d > max) { dx = dx / d * max; dy = dy / d * max; }
                    joyKnob.style.left = (joyOrigin.x + dx) + 'px'; joyKnob.style.top = (joyOrigin.y + dy) + 'px';
                    joyVec = d > 10 ? { x: dx / max, y: dy / max } : null;
                } else if (t.identifier === aimId) { aimPt = { x: t.clientX, y: t.clientY }; }
            } applyTouchAim(); };
        const touchEndC = e => { e.preventDefault();
            for (const t of e.changedTouches) {
                if (t.identifier === joyId) { joyId = null; joyVec = null; joyBase.style.display = joyKnob.style.display = 'none'; }
                else if (t.identifier === aimId) { aimId = null; aimPt = null; keys['KeyJ'] = false; }
            } applyTouchAim(); };
        canvas.addEventListener('touchstart', touchStartC, { passive: false });
        canvas.addEventListener('touchmove', touchMoveC, { passive: false });
        canvas.addEventListener('touchend', touchEndC, { passive: false });
        canvas.addEventListener('touchcancel', touchEndC, { passive: false });

        // ------------------------------------------------------------------
        // SYNTHWAVE SOUNDTRACK: 108 BPM, A minor (Am - F - C - G), 8-bar loop.
        // Drums + rolling bass + arpeggio + pads; a lead melody joins in bars 5-8.
        // ------------------------------------------------------------------
        const Music = (() => {
            const BPM = 108, STEP = 60 / BPM / 4, BARS = 8;
            const ROOT = [55, 43.65, 65.41, 49.0];
            const CHORD = [[220, 261.63, 329.63, 440], [174.61, 220, 261.63, 349.23], [261.63, 329.63, 392, 523.25], [196, 246.94, 293.66, 392]];
            const ARP = [0, 1, 2, 3, 2, 1, 2, 3];
            // [step in bar, length in steps, Hz] for bars 5-8
            const LEAD = [[[0, 6, 659.25], [6, 2, 587.33], [8, 4, 523.25], [12, 4, 440]],
                          [[0, 4, 523.25], [4, 4, 440], [8, 4, 523.25], [12, 4, 698.46]],
                          [[0, 6, 783.99], [6, 2, 659.25], [8, 4, 587.33], [12, 4, 659.25]],
                          [[0, 4, 587.33], [4, 4, 493.88], [8, 4, 587.33], [12, 4, 392]]];
            let a = null, bus = null, send = null, noise = null, next = 0, step = 0, mvol = Settings.music / 100;

            function setup() {
                a = sound.ctx; bus = a.createGain(); bus.gain.value = 0.9 * mvol; bus.connect(a.destination);
                send = a.createGain(); const d = a.createDelay(1), fb = a.createGain(), lp = a.createBiquadFilter(), wet = a.createGain();
                d.delayTime.value = STEP * 3; fb.gain.value = 0.32; lp.type = 'lowpass'; lp.frequency.value = 2400; wet.gain.value = 0.3;
                send.connect(d); d.connect(lp); lp.connect(fb); fb.connect(d); lp.connect(wet); wet.connect(bus);
                noise = a.createBuffer(1, a.sampleRate, a.sampleRate);
                const nd = noise.getChannelData(0); for (let k = 0; k < nd.length; k++) nd[k] = Math.random() * 2 - 1;
            }
            function tone(type, f, t, len, vol, cutoff, delaySend, attack = 0.005, detune = 0) {
                const o = a.createOscillator(), g = a.createGain(), lp = a.createBiquadFilter();
                o.type = type; o.frequency.value = f; o.detune.value = detune; lp.type = 'lowpass'; lp.frequency.value = cutoff;
                g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + attack);
                g.gain.exponentialRampToValueAtTime(0.0001, t + len);
                o.connect(lp); lp.connect(g); g.connect(bus); if (delaySend) g.connect(send);
                o.start(t); o.stop(t + len + 0.02);
            }
            function hit(t, len, vol, type, freq) {
                const n = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain();
                n.buffer = noise; f.type = type; f.frequency.value = freq;
                g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + len);
                n.connect(f); f.connect(g); g.connect(bus); n.start(t); n.stop(t + len + 0.02);
            }
            function kick(t) {
                const o = a.createOscillator(), g = a.createGain();
                o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.12);
                g.gain.setValueAtTime(0.5, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.26);
                o.connect(g); g.connect(bus); o.start(t); o.stop(t + 0.28);
            }
            function play(st, t, hot) {
                const bar = Math.floor(st / 16) % BARS, s = st % 16, ch = bar % 4;
                if (s % 4 === 0) kick(t);
                if (s === 4 || s === 12) { hit(t, 0.16, 0.16, 'bandpass', 1800); tone('triangle', 190, t, 0.1, 0.1, 1500); }
                if (hot || s % 2 === 0) hit(t, s % 4 === 2 ? 0.1 : 0.03, s % 4 === 2 ? 0.05 : 0.03, 'highpass', 7500);
                // rolling bass (8th-note pulse with octave jumps)
                if (s % 2 === 0) tone('sawtooth', ROOT[ch] * (s % 8 === 6 ? 2 : 1), t, STEP * 1.8, 0.1, 520);
                // arpeggio
                tone('square', CHORD[ch][ARP[s % 8]], t, STEP * 1.5, hot ? 0.035 : 0.024, 1800, true);
                // pad on each downbeat
                if (s === 0) CHORD[ch].slice(0, 3).forEach((f, k) => tone('sawtooth', f / 2, t, STEP * 15, 0.014, 900, false, 0.5, k * 6 - 6));
                // lead melody in the second half of the loop
                if (bar >= 4) LEAD[bar - 4].forEach(([ls, ll, f]) => { if (ls === s) { tone('square', f, t, STEP * ll * 0.9, 0.028, 3200, true, 0.01, -7); tone('square', f, t, STEP * ll * 0.9, 0.02, 3200, true, 0.01, 7); } });
            }
            return {
                setVol(v) { mvol = v; if (bus) bus.gain.value = 0.9 * v; },
                tick() {
                    if (!sound.ctx) return;
                    if (!a) setup();
                    const now = a.currentTime;
                    if (gameState !== 'PLAYING' || sound.muted) {
                        if (gameState !== 'PAUSED') step = 0;   // new run starts at bar 1
                        next = now + 0.05; return;
                    }
                    if (next < now) next = now + 0.05;
                    const hot = !!(keys['Space'] || keys['ShiftLeft'] || keys['ShiftRight']);
                    while (next < now + 0.15) { play(step, next, hot); next += STEP; step = (step + 1) % (BARS * 16); }
                }
            };
        })();
        setInterval(() => Music.tick(), 25);

        document.getElementById('volSlider').addEventListener('input', e => { sound.vol = e.target.value / 100; if (sound.master) sound.master.gain.value = sound.vol; });
        document.getElementById('diffSel').addEventListener('change', e => { diff = parseFloat(e.target.value); saveGameData(); });
        // UI Event Listeners
        document.getElementById('startGameBtn').addEventListener('click', startGame);
        document.getElementById('openHangarBtn').addEventListener('click', openHangar);
        document.getElementById('closeHangarBtn').addEventListener('click', closeHangar);
        document.getElementById('pauseBtn').addEventListener('click', pauseGame);
        document.getElementById('resumeBtn').addEventListener('click', resumeGame);
        document.getElementById('quitBtn').addEventListener('click', () => {
            gameState = 'MENU'; Tut.hide();
            document.getElementById('pauseMenu').classList.add('hidden');
            document.getElementById('hud').classList.add('hidden');
            document.getElementById('mainMenu').classList.remove('hidden');
        });
        document.getElementById('restartBtn').addEventListener('click', startGame);
        let lastRun = { score: 0, rank: 'ROOKIE', lv: 1 };
        document.getElementById('goMenuBtn').addEventListener('click', () => {
            gameState = 'MENU';
            document.getElementById('gameOverMenu').classList.add('hidden'); document.getElementById('gameOverMenu').classList.remove('flex');
            document.getElementById('mainMenu').classList.remove('hidden');
        });
        document.getElementById('goShareBtn').addEventListener('click', async () => {
            const text = `I scored ${lastRun.score} in Synthwave Courier : 2099 - ${lastRun.rank} LV ${lastRun.lv}. Can you beat it?`, btn = document.getElementById('goShareBtn');
            try {
                if (navigator.share) await navigator.share({ title: 'Synthwave Courier : 2099', text, url: location.protocol.indexOf('http') === 0 ? location.href : undefined });
                else { await navigator.clipboard.writeText(text); btn.textContent = 'COPIED!'; setTimeout(() => { btn.innerHTML = '<i class="fa-solid fa-share-nodes mr-1"></i>SHARE SCORE'; }, 1800); }
            } catch (e) {}
        });

        document.getElementById('togglePhysicsBtn').addEventListener('click', () => {
            useNewtonianPhysics = !useNewtonianPhysics;
            document.getElementById('physicsModeLabel').textContent = `ZERO-G: ${useNewtonianPhysics ? 'ON' : 'OFF'}`;
        });

        /* ------------------------------------------------------------------
           MAIN GAME LOOP
           ------------------------------------------------------------------ */
        function gameLoop(now) {
            AutoPerf.frame(now);
            const dt = Math.min(0.1, (now - lastTime) / 1000);
            lastTime = now;
            acc += dt;
            while (acc >= STEP) { updateGame(STEP); acc -= STEP; }
            renderGame();

            requestAnimationFrame(gameLoop);
        }

        window.onload = function() {
            loadSaveData();
            resizeCanvas();
            requestAnimationFrame(gameLoop);
            requestAnimationFrame(skinPreviewLoop);
        };
