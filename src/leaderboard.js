import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LEADERBOARD_FILE = path.join(__dirname, '..', 'leaderboard.json');

export function loadLeaderboard() {
  try {
    if (fs.existsSync(LEADERBOARD_FILE)) {
      const data = fs.readFileSync(LEADERBOARD_FILE, 'utf-8');
      const json = JSON.parse(data);
      if (Array.isArray(json.entries)) {
        return json.entries;
      }
    }
  } catch (err) {
    console.error('Error loading leaderboard:', err.message);
  }
  return [];
}

export function saveLeaderboard(entries) {
  try {
    // Sort descending by score, tiebreaker earlier achieved_at
    entries.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return new Date(a.achieved_at) - new Date(b.achieved_at);
    });

    // Retain top 10
    const top10 = entries.slice(0, 10);
    fs.writeFileSync(LEADERBOARD_FILE, JSON.stringify({ entries: top10 }, null, 2), 'utf-8');
    return top10;
  } catch (err) {
    console.error('Error saving leaderboard:', err.message);
    return entries;
  }
}

export function addEntry({ name, score, nights_won, seed }) {
  // Validate name: 3-12 characters, alphanumeric or Vietnamese characters or underscores
  const trimmed = (name || '').trim();
  if (trimmed.length < 3 || trimmed.length > 12) {
    throw new Error('Name must be 3-12 characters long');
  }

  const entries = loadLeaderboard();
  const newEntry = {
    name: trimmed,
    score: parseInt(score, 10) || 0,
    nights_won: Math.min(3, Math.max(0, parseInt(nights_won, 10) || 0)),
    achieved_at: new Date().toISOString(),
    seed: parseInt(seed, 10) || 42
  };

  entries.push(newEntry);
  return saveLeaderboard(entries);
}

export function exportLeaderboard(outFile) {
  const entries = loadLeaderboard();
  entries.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return new Date(a.achieved_at) - new Date(b.achieved_at);
  });
  const top10 = entries.slice(0, 10);
  const outPath = path.resolve(process.cwd(), outFile);
  fs.writeFileSync(outPath, JSON.stringify({ entries: top10 }, null, 2), 'utf-8');
  console.log(`Leaderboard exported to ${outFile} (${top10.length} entries)`);
}
