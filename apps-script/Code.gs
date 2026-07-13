/**
 * Hoofprints 🐴 — Google Sheets backend
 *
 * This script turns a Google Sheet into the cloud storage for the
 * Hoofprints app. Setup (a grown-up does this once, ~3 minutes):
 *
 *   1. Go to sheets.new and create a blank spreadsheet.
 *      Name it something like "Hoofprints Barn".
 *   2. In the menu: Extensions → Apps Script.
 *   3. Delete whatever is in the editor and paste this whole file.
 *   4. Change SECRET below to your own secret word.
 *   5. Click Deploy → New deployment → gear icon → "Web app".
 *        - Description: Hoofprints
 *        - Execute as:  Me
 *        - Who has access: Anyone
 *      Click Deploy and approve the permissions.
 *   6. Copy the Web app URL (ends in /exec).
 *   7. In the Hoofprints app, tap ☁️ Sync, paste the URL and the
 *      secret word, and turn on auto-save. Done!
 *
 * What it stores:
 *   - "_data" (hidden tab): the app's full save file, chunked across
 *     cells. This is the source of truth — don't edit it.
 *   - "Horses 🐴", "Rides 📖", "Goals 🎯", "Wishlist 🌠": readable
 *     copies rewritten on every save, so you can browse the barn
 *     right in Google Sheets. Edits here are overwritten — they're a
 *     view, not an input.
 */

var SECRET = 'change-me'; // ← pick your own secret word (same one goes in the app)

function doGet(e) {
  if (!okSecret_(e)) return json_({ error: 'wrong secret' });
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('_data');
  if (!sh || sh.getLastRow() < 1) return json_({ empty: true });
  var rows = sh.getRange(1, 1, sh.getLastRow(), 1).getValues();
  var blob = rows.map(function (r) { return String(r[0]); }).join('');
  return ContentService.createTextOutput(blob).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  if (!okSecret_(e)) return json_({ error: 'wrong secret' });
  var data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    return json_({ error: 'not valid JSON' });
  }
  if (!data || !Array.isArray(data.horses) || !Array.isArray(data.rides)) {
    return json_({ error: 'not a Hoofprints barn file' });
  }
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  saveBlob_(ss, e.postData.contents);
  writeReadableTabs_(ss, data);
  return json_({ ok: true, savedAt: new Date().toISOString() });
}

function okSecret_(e) {
  var given = (e && e.parameter && e.parameter.secret) || '';
  return !SECRET || given === SECRET;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// The full JSON save (including photos) chunked across cells, since one
// cell holds at most 50,000 characters.
function saveBlob_(ss, txt) {
  var sh = ss.getSheetByName('_data') || ss.insertSheet('_data');
  sh.clearContents();
  var CHUNK = 45000;
  var rows = [];
  for (var i = 0; i < txt.length; i += CHUNK) rows.push([txt.slice(i, i + CHUNK)]);
  sh.getRange(1, 1, rows.length, 1).setValues(rows);
  try { sh.hideSheet(); } catch (err) {} // fails if it's the only visible sheet — fine
}

function writeReadableTabs_(ss, d) {
  var horseNames = {};
  (d.horses || []).forEach(function (h) { horseNames[h.id] = h.name; });
  var MOODS = { 1: 'Sleepy 😴', 2: 'Okay 🙂', 3: 'Good 😊', 4: 'Amazing 🤩', 5: 'MAGICAL 🦄' };
  var ACTIVITIES = { lesson: 'Lesson 🎓', trail: 'Trail ride 🌲', jumping: 'Jumping 🚧', dressage: 'Dressage 💃', bareback: 'Bareback ⭐', show: 'Horse show 🏆', ground: 'Groundwork 👟', groom: 'Grooming 🧼' };
  var WEATHERS = { sun: 'Sunny ☀️', cloud: 'Cloudy ⛅', rain: 'Rainy 🌧️', snow: 'Snowy ❄️', wind: 'Windy 🍃' };
  var CARE = { farrier: 'Farrier 🛠️', vet: 'Vet 🩺', dentist: 'Dentist 🦷', vaccine: 'Vaccine 💉', worming: 'Worming 💊', spa: 'Spa day 🛁', other: 'Other 📋' };
  var EVENTS = { lesson: 'Lesson 🎓', show: 'Show 🏆', farrier: 'Farrier 🛠️', vet: 'Vet 🩺', camp: 'Camp ⛺', party: 'Fun 🎈', other: 'Other 📌' };

  fill_(ss, 'Horses 🐴',
    ['Name', 'Breed', 'Size', 'Coat', 'Personality', 'Favorite treat', 'Notes', 'Has photo'],
    (d.horses || []).map(function (h) {
      return [h.name, h.breed, h.size, h.coat, (h.traits || []).join(', '), h.treat, h.notes, h.photo ? 'yes' : ''];
    }));

  fill_(ss, 'Rides 📖',
    ['Date', 'Horse', 'Activity', 'Minutes', 'Mood', 'Weather', 'Best moment', 'Has photo'],
    (d.rides || []).slice().sort(function (a, b) { return String(b.date).localeCompare(String(a.date)); })
      .map(function (r) {
        return [r.date, horseNames[r.horseId] || '?', ACTIVITIES[r.activity] || r.activity, r.minutes, MOODS[r.mood] || r.mood, WEATHERS[r.weather] || '', r.note, r.photo ? 'yes' : ''];
      }));

  fill_(ss, 'Goals 🎯',
    ['Goal', 'Emoji', 'Progress', 'Target', 'Done', 'Done date', 'Plan'],
    (d.goals || []).map(function (g) {
      return [g.title, g.emoji, g.count, g.target, g.done ? 'YES 🎉' : 'not yet', g.doneDate || '', g.note];
    }));

  var careRows = [];
  (d.horses || []).forEach(function (h) {
    (h.care || []).forEach(function (c) {
      careRows.push([c.date, h.name, CARE[c.type] || c.type, c.note || '']);
    });
  });
  careRows.sort(function (a, b) { return String(b[0]).localeCompare(String(a[0])); });
  fill_(ss, 'Care 🩺', ['Date', 'Horse', 'What', 'Note'], careRows);

  var REPEATS = { weekly: 'Every week 🔁', biweekly: 'Every 2 weeks 🔁', monthly: 'Every month 🔁' };
  fill_(ss, 'Calendar 🗓️',
    ['Starts', 'Time', 'What', 'Kind', 'Repeats', 'Until'],
    (d.events || []).slice().sort(function (a, b) { return String(a.date).localeCompare(String(b.date)); })
      .map(function (e) { return [e.date, e.time || '', e.title, EVENTS[e.type] || e.type, REPEATS[e.repeat] || '', e.until || '']; }));

  fill_(ss, 'Math 🥕',
    ['Date', 'Mode', 'Score', 'Out of', 'Perfect', 'Time'],
    (d.mathLog || []).slice().reverse().map(function (m) {
      var signs = { mul: '×', div: '÷', add: '+', sub: '−' };
      var mm = String(m.mode).match(/^(mul|div|add|sub)-(all|\d+)$/);
      var mode = m.mode === 'retake' ? 'Tricky ones 🔁'
        : mm ? (mm[2] === 'all' ? signs[mm[1]] + ' mixed 🎲' : signs[mm[1]] + mm[2] + ' facts')
        : m.mode === 'facts' ? 'Math facts 🥕'
        : (String(m.mode).indexOf('facts-') === 0 ? '×' + String(m.mode).slice(6) + ' facts' : String(m.mode));
      var t = Math.floor((m.seconds || 0) / 60) + 'm ' + ((m.seconds || 0) % 60) + 's';
      return [String(m.date).slice(0, 10) + ' ' + String(m.date).slice(11, 16), mode, m.score, m.total, m.score === m.total ? '⭐' : '', t];
    }));

  fill_(ss, 'Wishlist 🌠',
    ['Wish', 'Kind', 'Why', 'Came true', 'Date'],
    (d.wishes || []).map(function (w) {
      return [w.text, w.type, w.why, w.granted ? 'YES ⭐' : 'not yet', w.grantedDate || ''];
    }));
}

function fill_(ss, name, header, rows) {
  var sh = ss.getSheetByName(name) || ss.insertSheet(name);
  sh.clearContents();
  sh.getRange(1, 1, 1, header.length).setValues([header]).setFontWeight('bold');
  if (rows.length) {
    sh.getRange(2, 1, rows.length, header.length).setValues(rows.map(function (r) {
      return r.map(function (v) { return v == null ? '' : v; });
    }));
  }
}
