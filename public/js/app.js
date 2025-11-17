// App Bingo Asteria PRO — app.js
const state = {
  maxNum: 100,
  numbers: [],
  drawn: [],
  players: [],
  autoTimer: null,
  soundOn: true,
  targetWinners: 3
};

const el = {
  ball: document.getElementById('ball'),
  drawBtn: document.getElementById('drawBtn'),
  autoBtn: document.getElementById('autoBtn'),
  resetBtn: document.getElementById('resetBtn'),
  historyList: document.getElementById('historyList'),
  countDrawn: document.getElementById('countDrawn'),
  rangeSelect: document.getElementById('rangeSelect'),
  customMax: document.getElementById('customMax'),
  voiceSelect: document.getElementById('voiceSelect'),
  voiceRate: document.getElementById('voiceRate'),
  soundToggle: document.getElementById('soundToggle'),
  winnersCount: document.getElementById('winnersCount'),
  playersList: document.getElementById('playersList'),
  addPlayerBtn: document.getElementById('addPlayer'),
  playerName: document.getElementById('playerName'),
  playerNums: document.getElementById('playerNums'),
  winnersBox: document.getElementById('winnersBox'),
  rangeSelect: document.getElementById('rangeSelect'),
  copyYape: document.getElementById('copyYape')
};

// init
function buildNumbers(n){
  state.maxNum = n;
  state.numbers = [];
  for(let i=1;i<=n;i++) state.numbers.push(i);
  state.drawn = [];
  renderTablero(n);
  renderHistory();
}

function renderTablero(n){
  const board = document.getElementById('tablero');
  board.innerHTML = '';
  // columns: adjust
  let cols = n <= 50 ? 5 : (n <= 100 ? 10 : (n <= 500 ? 20 : 25));
  board.style.gridTemplateColumns = `repeat(${Math.min(cols, 25)}, 1fr)`;
  for(let i=1;i<=n;i++){
    const d = document.createElement('div');
    d.id = 'c'+i; d.className = 'num'; d.textContent = i;
    board.appendChild(d);
  }
}

function speak(text){
  if(!state.soundOn || !window.speechSynthesis) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'es-PE';
  u.rate = parseFloat(el.voiceRate.value || 1.0);
  const voices = window.speechSynthesis.getVoices();
  // pick voice based on selection
  let match;
  if(el.voiceSelect.value === 'female') match = voices.find(v=>/female|woman|mujer|Sofia|Lucia/i.test(v.name));
  if(el.voiceSelect.value === 'male') match = voices.find(v=>/male|man|hombre|Juan|Pedro/i.test(v.name));
  if(el.voiceSelect.value === 'robot') { u.pitch = 0.5; }
  if(match) u.voice = match;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

function drawOnce(){
  if(state.numbers.length === 0) return null;
  const idx = Math.floor(Math.random()*state.numbers.length);
  const num = state.numbers[idx];
  state.numbers.splice(idx,1);
  state.drawn.push(num);
  // UI
  el.ball.textContent = num;
  el.ball.classList.add('play'); setTimeout(()=>el.ball.classList.remove('play'),700);
  const cell = document.getElementById('c'+num); if(cell) cell.classList.add('drawn');
  renderHistory();
  updatePlayers(num);
  checkWinners();
  speak('Número ' + num);
  return num;
}

function renderHistory(){
  el.historyList.innerHTML = '';
  state.drawn.slice().reverse().forEach(n=>{
    const it = document.createElement('div'); it.className='history-item'; it.textContent = n; el.historyList.appendChild(it);
  });
  el.countDrawn.textContent = state.drawn.length;
}

// players
function addPlayer(name, nums){
  const arr = nums.split(',').map(s=>parseInt(s.trim(),10)).filter(x=>!isNaN(x) && x>=1 && x<=state.maxNum);
  const set = new Set(arr);
  const p = {id:'p'+Date.now(), name:name||'Jugador', nums:set, matched:new Set(), stars:0, winner:false};
  state.players.push(p); renderPlayers();
}

function renderPlayers(){
  el.playersList.innerHTML = '';
  state.players.forEach(p=>{
    const row = document.createElement('div'); row.className='player-row';
    const left = document.createElement('div'); left.innerHTML = `<div style="font-weight:700">${p.name}</div><div style="font-size:13px;color:rgba(255,255,255,0.7)">N: ${[...p.nums].slice(0,7).join(', ')}${p.nums.size>7?' ...':''}</div>`;
    const right = document.createElement('div');
    const stars = document.createElement('div'); stars.className='stars';
    for(let i=1;i<=5;i++){ const s=document.createElement('div'); s.className='star' + (i<=p.stars?' on':''); stars.appendChild(s); }
    right.appendChild(stars);
    row.appendChild(left); row.appendChild(right);
    el.playersList.appendChild(row);
  });
}

function updatePlayers(num){
  state.players.forEach(p=>{
    if(p.nums.has(num) && !p.matched.has(num)){
      p.matched.add(num);
      p.stars = Math.min(5,p.matched.size);
      if(p.stars >= 5) p.winner = true;
    }
  });
  renderPlayers();
}

function checkWinners(){
  const winners = state.players.filter(p=>p.winner);
  el.winnersBox.innerHTML = '';
  winners.forEach((w,i)=>{
    const elw=document.createElement('div'); elw.className='card'; elw.style.marginBottom='8px'; elw.innerHTML = `<strong>Ganador ${i+1}:</strong> ${w.name} — <span style="color:var(--gold)">${[...w.matched].slice(0,5).join(', ')}</span>`; el.winnersBox.appendChild(elw);
  });
  if(winners.length >= parseInt(el.winnersCount.value,10)){
    stopAuto(); el.drawBtn.disabled=true; alert('Se alcanzaron los ganadores configurados. Sorteo detenido.');
  }
}

// auto
function startAuto(){
  if(state.autoTimer) return;
  state.autoTimer = setInterval(()=>{ if(state.numbers.length===0) stopAuto(); else drawOnce(); }, 3000);
  el.autoBtn.textContent='DETENER';
}
function stopAuto(){ if(state.autoTimer){ clearInterval(state.autoTimer); state.autoTimer=null; el.autoBtn.textContent='AUTO'; } }

// events
el.drawBtn.addEventListener('click', ()=> drawOnce());
el.resetBtn.addEventListener('click', ()=>{ if(confirm('Reiniciar juego?')) buildNumbers(state.maxNum); });
el.autoBtn.addEventListener('click', ()=> state.autoTimer?stopAuto():startAuto());
el.soundToggle.addEventListener('change', (e)=> state.soundOn = e.target.checked);
el.copyYape && el.copyYape.addEventListener && el.copyYape.addEventListener('click', ()=>{ navigator.clipboard.writeText('+51905888379'); alert('Número copiado'); });

el.addPlayerBtn.addEventListener('click', ()=>{ addPlayer(el.playerName.value.trim(), el.playerNums.value.trim()); el.playerName.value=''; el.playerNums.value=''; });

el.rangeSelect.addEventListener('change',(e)=>{ if(e.target.value==='custom'){ el.customMax.style.display='inline-block'; } else { buildNumbers(parseInt(e.target.value,10)); } });
el.customMax.addEventListener('change',(e)=>{ let v = parseInt(e.target.value,10); if(!v||v<10) v=100; if(v>1000) v=1000; buildNumbers(v); });

// disable right click on logo and image protect
window.addEventListener('contextmenu', function(e){ if(e.target && e.target.tagName==='IMG') e.preventDefault(); });

// init
buildNumbers(100);

// expose draw for console
window.drawOnce = drawOnce;
