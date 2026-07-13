# Hoofprints 🐴

My horses, my rides, my adventures! A barn book for young riders — an installable app with no accounts, no ads, and no subscription.

Hoofprints is a single-file web app: everything lives in `index.html`. It works fully offline, all data stays on the device (localStorage, with Save/Load barn file buttons for backups), and you can optionally back the whole barn up to a Google Sheet.

## Features

- **My Stable** — profile cards for every horse she's ridden: photo, breed, size (pony/horse/mini/🦄 unicorn), coat color, personality chips, favorite treat, and notes
- **Horse pages** — tap any horse for its own full page: hero profile, "friends since" counter, per-horse stats, activity chart, care history, best moments, ride timeline, and a photo wall
- **Ride Journal** — log every ride: activity, minutes, mood (😴 → 🦄 MAGICAL), weather, the best moment, and a photo from the day
- **Calendar** — month view of all rides, plus a planner for what's coming up (lessons, shows, farrier visits, pony camp) with countdown chips and repeating events — weekly, every 2 weeks, or monthly, with an optional end date
- **Stats** — riding time charts for the last 8 weeks, weekly riding streaks 🔥, activity breakdown, horse leaderboard, and a mood-o-meter
- **Care log** — per-horse records of farrier, vet, dentist, vaccine, worming, and spa days
- **My Goals** — riding goals with a practice progress bar, a big "I practiced! +1" button, and a confetti party when a goal is crushed
- **Wishlist** — dream horses, gear, and adventures, with an "It came true!" button
- **Badge Wall** — 26 prize rosettes earned automatically (First Hoofprint, Trail Blazer, Goal Getter, Wish Come True…)
- **Fun Stuff** — daily horse fact, dream-horse name generator, a galloping-pony button, and **4 mini-games**: Pony Quiz Show (horse trivia), Stable Pairs (memory match), Gallop! (jump-the-fences arcade runner), and Carrot Count (math facts across +, −, × and ÷, with "fix the tricky ones" retake rounds — results and time spent log to the Google Sheet) — all with saved best scores
- **5 themes** via the 🎨 Theme button — Pony Party (playful classic), Unicorn Dream (pastel), Show Ring (classic hunter green & serif for older kids), Western Trail (desert & turquoise), and Midnight Canter (moody indigo for teens); each with light and dark variants
- Confetti when good things happen 🎉

## Try it

Open `index.html` in any browser — that's the whole install for local use.

## Host it & install it as an app 📱

Hoofprints is a PWA (installable web app). Once it's hosted, it installs on a phone or tablet with its own rosette icon, opens full-screen like a native app, and works fully offline.

**Host it free with GitHub Pages (one time):**

1. In this repo on GitHub: **Settings → Pages → Source: GitHub Actions**.
2. That's it — the included workflow (`.github/workflows/deploy-pages.yml`) deploys automatically on every push to `main`. Your app will be at `https://<username>.github.io/hoofprints/`.

**Install it on her device:**

- **iPhone/iPad**: open the URL in Safari → Share button → **Add to Home Screen**
- **Android**: open the URL in Chrome → menu → **Install app**

The app keeps working with no internet after install (rides save on the device), and ☁️ Sync backs everything up to your Google Sheet whenever she's back online.

## Cloud sync (Google Sheets)

Hoofprints works fully offline, but you can optionally back the whole barn with a **Google Sheet** — free, no server, and you can browse her horses, rides, goals, and wishlist right in the spreadsheet.

**One-time setup (a grown-up, ~3 minutes):**

1. Go to [sheets.new](https://sheets.new) and create a blank spreadsheet (name it "Hoofprints Barn").
2. In the menu: **Extensions → Apps Script**.
3. Delete the sample code and paste in all of [`apps-script/Code.gs`](apps-script/Code.gs).
4. Change `SECRET = 'change-me'` to your own secret word, then save.
5. **Deploy → New deployment → Web app**, with *Execute as: Me* and *Who has access: Anyone*. Approve the permissions.
6. Copy the Web app URL (it ends in `/exec`).
7. In Hoofprints, tap **☁️ Sync**, paste the URL and secret word, and leave auto-save on.

**What you get:**
- Every change auto-saves to the Sheet a couple of seconds later
- Open the app on a new device, enter the same URL + secret, and the barn loads automatically — or easier: on an already-connected device open ☁️ Sync → **🔗 Copy setup link** and just open that link on the new device (share it privately; it contains the URL and secret)
- The Sheet gets human-readable tabs — **Horses 🐴, Rides 📖, Goals 🎯, Care 🩺, Calendar 🗓️, Wishlist 🌠** — rewritten on every save (the hidden `_data` tab is the real save file; don't edit it)
- The secret word keeps random strangers out; treat the URL + secret like a house key

**Barn lock 🔒 (optional):** the Lock button in the app sets a per-device passcode. With it on, the app asks for the passcode every time it opens, and the ☁️ Sync settings can't be viewed or changed without it. It's a deterrent lock, not encryption — and if the passcode is forgotten, clearing the site's data in the browser removes the lock (cloud sync restores the barn).

If sync isn't set up, everything keeps working exactly as before — saved on the device, with file backup buttons in the footer.

Made with 💗 and hay.
