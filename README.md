# SYNTHWAVE COURIER : 2099

A neon, zero-gravity space courier game that runs entirely in the browser. Take delivery and rescue contracts, drift through asteroid fields, dodge black holes and solar flares, fight pirates, and spend your credits in the Ship Hangar. Plays on desktop (keyboard and mouse) and on phones (touch controls), and can be installed as an offline app.

No build step, no server and no dependencies to install. It is plain HTML, CSS and JavaScript.

---

## Quick start

**Play online**

Play the game directly via GitHub: [Play Synthwave Courier on GitHub](https://yachisei.github.io/synthcourier2099)**.

An internet connection is needed on the first load, because Tailwind CSS, Font Awesome and Google Fonts are loaded from CDNs. HTTPS is required for the install and offline features.

---

## Controls

| Action | Keyboard / mouse | Touch |
| --- | --- | --- |
| Thrust | `W` (or `Up`) | Drag the left side of the screen (floating joystick) |
| Retro thrusters | `S` (or `Down`) | Joystick |
| Slide sideways | `A` / `D` | Joystick |
| Aim | Mouse | Touch and drag the right side of the screen |
| Fire lasers | Click or `J` (hold) | FIRE button, or hold the right side |
| Hyper boost | `Shift` or `Space` (while thrusting) | BOOST button |
| Shield | `E` | SHIELD button |
| Drop a mine | `Q` | MINE button |
| Ship ability | `R` | ABILITY button |
| Toggle auto-fire | `F` | AUTO-FIRE button at the top right |
| Pause | `P` or `Esc` | `[ESC]` button |
| Mute | `M` | Pause menu |

A gamepad is also supported. Landscape orientation is recommended on phones.

---

## Features

**Gameplay**
- Zero-gravity drift physics (can be switched to arcade physics with the ZERO-G button)
- Eight contract types, each with its own rules and payout:
  - **Standard**, **Rush** (short timer), **Fragile** (cargo breaks if your hull drops too far), **Rescue** (pick up a stranded pilot) and **Escort** (protect a ship from pirates)
  - **Smuggle**: illegal cargo that brings police patrols after you, with reinforcements halfway through
  - **Race**: fly through four checkpoint gates in order, then deliver
  - **Bounty**: destroy four marked pirate targets before you can deliver
- Hazards and enemies: asteroids, black holes, solar flares, pirates, turrets, a pirate fortress and mines
- Wormhole portals: paired swirling vortexes that fling you across the map
- Twelve stations in six structure styles (ring, hex cluster, solar array, outpost, tower and domed city), each with a glow, beacon pulse and docking lights. The station for your current pickup or drop-off is highlighted with a PICKUP or DROP-OFF tag.
- Balanced enemy placement: pirates and turrets are spread across the map, only the 5 nearest regular enemies attack at once, and enemies avoid stacking on each other. Ambushes and escort spawns shrink when enemies are already nearby, and the pirate population slowly refills away from the player.
- Combo bonuses for chained deliveries
- Power-ups that appear in space: **Overdrive** (free boost, no heat), **Shield** and **2x Payout**
- Ship abilities, one per skin: **Dash**, **Blink**, **Nova** (360-degree laser ring) and **Repair**
- Difficulty setting, radar minimap and waypoint arrow

**Progression**
- **Score** per run: credits earned + 250 per contract + 5 per km flown
- **Pilot levels and ranks**: Rookie, Courier (level 5), Pilot (10), Veteran (15), Ace (20), Legend (30). XP comes from deliveries, kills, power-ups, achievements, daily challenges and finishing runs. Each level-up pays credits.
- **49 achievements** that pay credits, from first delivery to hangar-queen level collecting
- **Daily challenge**: one new goal every day with a credit reward
- **Ship Hangar**: 30 ship skins (with live animated previews), 5 upgrade tracks (shield hull, thrusters, fuel, cooling, spread lasers) and 9 thruster trail colors plus "No trail"
- **First-run tutorial** (can be replayed from the Controls section of the main menu)

**Accounts and scores**
- Local pilot accounts with registration and login (passwords are salted and hashed)
- Guest mode
- Separate progress for every pilot, shared high-score board (top 5 players with gold, silver and bronze medals)
- Mission report on Game Over with score, XP, unlocks, a Share button and a Main Menu button
- **Export / import save** as a copy-and-paste backup code

**Phones and accessibility**
- Touch controls with a left-handed layout option
- Camera zoom that adapts to screen size, and layouts for landscape, portrait, notches and very wide or very small phones
- A **Settings** window (gear button on the main menu, or SETTINGS in the Pause menu) with volume, music, difficulty, auto-fire, achievement pop-ups, left-handed layout, vibration, screen shake, low effects and fullscreen
- Achievement pop-ups are queued and compact during play: one small banner at a time under the contract card, merged into one summary if several unlock together, and they can be switched off in Settings
- **Automatic low-effects mode**: weak phones (4 or fewer CPU cores, or 3 GB of memory or less) start with it on, and any device that stays under about 40 FPS while playing is switched over automatically. Turning the switch on or off yourself stops the automatic behavior.
- Installable as an offline app (PWA)

**Home screen**
- A deep-space scene made from the game's own pieces: a ringed planet, a distant station, a swirling wormhole, drifting outlined asteroids and, every so often, a courier with its wavy trail being chased by two pirates firing lasers. Stars drift and twinkle, and soft nebula clouds move slowly behind everything.
- An angular, chamfered-corner menu panel (the pause, login, settings, achievements and mission-report windows share the same frame), a flat Launch button, and a title that glitches briefly every few seconds. Animations pause when you start playing and are reduced in low-effects mode or when the device asks for reduced motion.

**Audio**
- A synthwave soundtrack (108 BPM, A minor) and all sound effects are generated in code with the Web Audio API. There are no audio files.

---

## Project structure
