import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://midnphgicryyoeubulro.supabase.co";
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pZG5waGdpY3J5eW9ldWJvcnMiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTc0NTE1MzMwMSwiZXhwIjoyMDYwNzI5MzAxfQ.Po_3SJ5aAKOQ6CjTBL5uugkn3c-snIUvLnzOAQU3EQM";
const supabase = createClient(supabaseUrl, supabaseKey);

// Pagination setup
let offset = 0;
const limit = 12;

async function loadLeaderboard() {
  const { data, error } = await supabase
    .from('coins')
    .select('name,symbol,owner,minted,mintType')
    .order('minted', { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) {
    console.error('Error loading leaderboard:', error);
    return;
  }
  const tbody = document.querySelector('#leaderboard tbody');
  if (offset === 0) {
    tbody.innerHTML = '';
  }
  data.forEach((row, idx) => {
    const tr = document.createElement('tr');
    const rank = offset + idx + 1;
    tr.innerHTML = `<td>${rank}</td><td>${row.name}</td><td>${row.symbol}</td><td><span class="badge ${row.mintType}">${row.mintType === 'insignia' ? 'Insignia' : 'Signet'}</span></td><td>${row.owner || ''}</td><td>${row.minted}</td>`;
    tbody.appendChild(tr);
  });
  // Update offset and Load More button
  offset += data.length;
  const loadBtn = document.getElementById('load-more');
  if (loadBtn) {
    if (data.length < limit) loadBtn.style.display = 'none';
    else loadBtn.style.display = 'block';
  }
}

window.addEventListener('DOMContentLoaded', () => {
  // Dynamic label for display type
  const labelEl = document.getElementById('insignia-label');
  if (labelEl) {
    labelEl.textContent = window.innerWidth <= 700 ? 'Signets' : 'Insignias';
  }
  loadLeaderboard();
  // Attach Load More handler
  const loadBtn = document.getElementById('load-more');
  if (loadBtn) loadBtn.addEventListener('click', loadLeaderboard);
});
