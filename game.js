// ============================================================
// game.js — Supabase Realtime (بديل Socket.IO)
// ============================================================

const SUPABASE_URL = 'https://vhhfqgcttdhmectwbhnh.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoaGZxZ2N0dGRobWVjdHdiaG5oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyMzAzODIsImV4cCI6MjA5NTgwNjM4Mn0.2OHAv7g9v3VCyafBvYZB41IEbakyYOdVL3Xu1YJStRw';
const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const mySocketId = Math.random().toString(36).substr(2,9) + Date.now().toString(36);
let roomChannel = null;

// ============================================================
// HELPERS
// ============================================================
function getCardBg(card) {
  if (!card) return '#1a2a4a';
  if (card.joker) return 'linear-gradient(135deg,#8e44ad,#6c3483)';
  if (card.type === 'special') return 'linear-gradient(135deg,#2c3e50,#1a252f)';
  const m = { GK:'linear-gradient(135deg,#f5a623,#e08800)', DEF:'linear-gradient(135deg,#4a90d9,#2874b5)', MID:'linear-gradient(135deg,#27ae60,#1e8449)', ATK:'linear-gradient(135deg,#e74c3c,#c0392b)' };
  return m[card.zone] || '#1a2a4a';
}

// ============================================================
// DECK
// ============================================================
function buildDeck() {
  const deck = []; let id = 1;
  const imgC = {};
  function ni(k,t){ imgC[k]=(imgC[k]||0); const i=imgC[k]%t; imgC[k]++; return i; }

  for(let i=0;i<30;i++) deck.push({id:id++,type:'player',zone:'GK',number:1,star:false,captain:false,imgIdx:ni('GK_1',3)});
  for(let i=0;i<10;i++) deck.push({id:id++,type:'player',zone:'DEF',number:2,star:false,captain:false,imgIdx:ni('DEF_2',2)});
  for(let i=0;i<5;i++)  deck.push({id:id++,type:'player',zone:'DEF',number:2,star:true,captain:false,imgIdx:ni('DEF_2',2)});
  for(let i=0;i<3;i++)  deck.push({id:id++,type:'player',zone:'DEF',number:2,star:true,captain:true,imgIdx:ni('DEF_2',2)});
  for(let i=0;i<10;i++) deck.push({id:id++,type:'player',zone:'DEF',number:3,star:false,captain:false,imgIdx:ni('DEF_3',2)});
  for(let i=0;i<5;i++)  deck.push({id:id++,type:'player',zone:'DEF',number:3,star:true,captain:false,imgIdx:ni('DEF_3',2)});
  for(let i=0;i<3;i++)  deck.push({id:id++,type:'player',zone:'DEF',number:3,star:true,captain:true,imgIdx:ni('DEF_3',2)});
  for(let i=0;i<9;i++)  deck.push({id:id++,type:'player',zone:'DEF',number:4,star:false,captain:false,imgIdx:ni('DEF_4',2)});
  for(let i=0;i<5;i++)  deck.push({id:id++,type:'player',zone:'DEF',number:4,star:true,captain:false,imgIdx:ni('DEF_4',2)});
  for(let i=0;i<3;i++)  deck.push({id:id++,type:'player',zone:'DEF',number:4,star:true,captain:true,imgIdx:ni('DEF_4',2)});
  for(let i=0;i<9;i++)  deck.push({id:id++,type:'player',zone:'DEF',number:5,star:false,captain:false,imgIdx:ni('DEF_5',2)});
  for(let i=0;i<5;i++)  deck.push({id:id++,type:'player',zone:'DEF',number:5,star:true,captain:false,imgIdx:ni('DEF_5',2)});
  for(let i=0;i<3;i++)  deck.push({id:id++,type:'player',zone:'DEF',number:5,star:true,captain:true,imgIdx:ni('DEF_5',2)});
  for(let i=0;i<9;i++)  deck.push({id:id++,type:'player',zone:'MID',number:6,star:false,captain:false,imgIdx:ni('MID_6',2)});
  for(let i=0;i<5;i++)  deck.push({id:id++,type:'player',zone:'MID',number:6,star:true,captain:false,imgIdx:ni('MID_6',2)});
  for(let i=0;i<3;i++)  deck.push({id:id++,type:'player',zone:'MID',number:6,star:true,captain:true,imgIdx:ni('MID_6',2)});
  for(let i=0;i<9;i++)  deck.push({id:id++,type:'player',zone:'MID',number:7,star:false,captain:false,imgIdx:ni('MID_7',2)});
  for(let i=0;i<5;i++)  deck.push({id:id++,type:'player',zone:'MID',number:7,star:true,captain:false,imgIdx:ni('MID_7',2)});
  for(let i=0;i<3;i++)  deck.push({id:id++,type:'player',zone:'MID',number:7,star:true,captain:true,imgIdx:ni('MID_7',2)});
  for(let i=0;i<9;i++)  deck.push({id:id++,type:'player',zone:'MID',number:8,star:false,captain:false,imgIdx:ni('MID_8',2)});
  for(let i=0;i<4;i++)  deck.push({id:id++,type:'player',zone:'MID',number:8,star:true,captain:false,imgIdx:ni('MID_8',2)});
  for(let i=0;i<3;i++)  deck.push({id:id++,type:'player',zone:'MID',number:8,star:true,captain:true,imgIdx:ni('MID_8',2)});
  for(let i=0;i<5;i++)  deck.push({id:id++,type:'player',zone:'ATK',number:9,star:false,captain:false,imgIdx:ni('ATK_9',2)});
  for(let i=0;i<3;i++)  deck.push({id:id++,type:'player',zone:'ATK',number:9,star:true,captain:false,imgIdx:ni('ATK_9',2)});
  for(let i=0;i<2;i++)  deck.push({id:id++,type:'player',zone:'ATK',number:9,star:true,captain:true,imgIdx:ni('ATK_9',2)});
  for(let i=0;i<5;i++)  deck.push({id:id++,type:'player',zone:'ATK',number:10,star:false,captain:false,imgIdx:ni('ATK_10',2)});
  for(let i=0;i<3;i++)  deck.push({id:id++,type:'player',zone:'ATK',number:10,star:true,captain:false,imgIdx:ni('ATK_10',2)});
  for(let i=0;i<2;i++)  deck.push({id:id++,type:'player',zone:'ATK',number:10,star:true,captain:true,imgIdx:ni('ATK_10',2)});
  for(let i=0;i<5;i++)  deck.push({id:id++,type:'player',zone:'ATK',number:11,star:false,captain:false,imgIdx:ni('ATK_11',2)});
  for(let i=0;i<3;i++)  deck.push({id:id++,type:'player',zone:'ATK',number:11,star:true,captain:false,imgIdx:ni('ATK_11',2)});
  for(let i=0;i<2;i++)  deck.push({id:id++,type:'player',zone:'ATK',number:11,star:true,captain:true,imgIdx:ni('ATK_11',2)});
  for(let i=0;i<10;i++) deck.push({id:id++,type:'player',zone:'JOKER',number:null,star:true,captain:true,joker:true,imgIdx:0});
  [['Red Card',8],['Yellow Card',15],['Offside',8],['Swap',10],['Contract',10],['Loan',10],['Cancel Order',10],['Trash Player',20]]
    .forEach(([name,count])=>{ for(let i=0;i<count;i++) deck.push({id:id++,type:'special',name}); });
  return shuffle(deck);
}

function shuffle(a){ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }

// ============================================================
// WIN CHECK
// ============================================================
function checkWin(field) {
  const FORMATIONS=[{DEF:4,MID:3,ATK:3},{DEF:4,MID:4,ATK:2},{DEF:5,MID:3,ATK:2}];
  const ok=FORMATIONS.some(f=>field.GK.length>=1&&field.DEF.length===f.DEF&&field.MID.length===f.MID&&field.ATK.length===f.ATK);
  if(!ok) return false;
  if(!Object.values(field).flat().some(c=>c.captain)) return false;
  const hasJ=z=>field[z].some(c=>c.joker);
  const nums=z=>field[z].map(c=>c.number).filter(Boolean).sort((a,b)=>a-b);
  const chk=(ns,j,sets)=>sets.some(s=>{ const m=s.filter(n=>!ns.includes(n)); return m.length===0||(j&&m.length===1); });
  const sd=field.DEF.some(c=>c.star), sm=field.MID.some(c=>c.star), sa=field.ATK.some(c=>c.star);
  if(sd&&sm&&sa) return true;
  if(chk(nums('DEF'),hasJ('DEF'),[[2,3,4],[3,4,5]])) return true;
  if(chk(nums('MID'),hasJ('MID'),[[6,7,8]])) return true;
  if(chk(nums('ATK'),hasJ('ATK'),[[9,10,11]])) return true;
  return false;
}

// ============================================================
// APPLY SPECIAL (client-side mirror of server)
// ============================================================
function applySpecial(players, card, fromIdx, targetPlayerIdx, targetCardId, targetZone, myCardId, burnedPile) {
  const att=players[fromIdx], def=players[targetPlayerIdx];
  switch(card.name) {
    case 'Red Card': {
      if(!def) break;
      for(const z of Object.keys(def.field)){ const i=def.field[z].findIndex(c=>c.id===targetCardId); if(i!==-1){ const [b]=def.field[z].splice(i,1); burnedPile.push({...b,burnedBy:'red',burnedFrom:def.name}); break; } }
      break;
    }
    case 'Yellow Card': {
      if(!def) break;
      def.yellows[targetCardId]=(def.yellows[targetCardId]||0)+1;
      if(def.yellows[targetCardId]>=2){ delete def.yellows[targetCardId]; for(const z of Object.keys(def.field)){ const i=def.field[z].findIndex(c=>c.id===targetCardId); if(i!==-1){ const [b]=def.field[z].splice(i,1); burnedPile.push({...b,burnedBy:'yellow2',burnedFrom:def.name}); break; } } }
      break;
    }
    case 'Offside': { if(def) def.skipped=true; break; }
    case 'Swap': {
      if(!def) break;
      let mc=null,mz=null,mi=-1,tc=null,tz2=null,ti=-1;
      for(const z of Object.keys(att.field)){ const i=att.field[z].findIndex(c=>c.id===myCardId); if(i!==-1){mc=att.field[z][i];mz=z;mi=i;break;} }
      for(const z of Object.keys(def.field)){ const i=def.field[z].findIndex(c=>c.id===targetCardId); if(i!==-1){tc=def.field[z][i];tz2=z;ti=i;break;} }
      if(mc&&tc){
        const mtz=tc.zone==='JOKER'?mz:tc.zone, ttz=mc.zone==='JOKER'?tz2:mc.zone;
        att.field[mz].splice(mi,1); def.field[tz2].splice(ti,1);
        (att.field[mtz]=att.field[mtz]||[]).push(tc);
        (def.field[ttz]=def.field[ttz]||[]).push(mc);
        const my=att.yellows[myCardId],ty=def.yellows[targetCardId];
        delete att.yellows[myCardId]; delete def.yellows[targetCardId];
        if(my) def.yellows[mc.id]=my; if(ty) att.yellows[tc.id]=ty;
      }
      break;
    }
    case 'Contract': {
      if(!def) break;
      for(const z of Object.keys(def.field)){ const i=def.field[z].findIndex(c=>c.id===targetCardId); if(i!==-1){ const [s]=def.field[z].splice(i,1); const tz3=s.zone==='JOKER'?(targetZone||'ATK'):s.zone; (att.field[tz3]=att.field[tz3]||[]).push(s); if(def.yellows[s.id]){att.yellows[s.id]=def.yellows[s.id];delete def.yellows[s.id];} break; } }
      break;
    }
    case 'Loan': {
      if(!def) break;
      for(const z of Object.keys(def.field)){ const i=def.field[z].findIndex(c=>c.id===targetCardId); if(i!==-1){ const [l]=def.field[z].splice(i,1); const lz=l.zone==='JOKER'?targetZone:l.zone; (att.field[lz]=att.field[lz]||[]).push(l); att.loanedCards.push({card:l,turns:2,ownerSocketId:def.socketId}); break; } }
      break;
    }
    case 'Trash Player': {
      for(const z of Object.keys(att.field)){ const i=att.field[z].findIndex(c=>c.id===targetCardId); if(i!==-1){ const [tr]=att.field[z].splice(i,1); burnedPile.push({...tr,burnedBy:'trash',burnedFrom:att.name}); break; } }
      break;
    }
  }
}

// ============================================================
// SUPABASE ROOM FUNCTIONS
// ============================================================
async function createRoom() {
  const name = document.getElementById('playerName').value.trim();
  if (!name) return showToast(t('enterName'), true);
  myName = name; isRoomOwner = true;
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  roomCode = code;
  const player = { socketId:mySocketId, name, hand:[], field:{GK:[],DEF:[],MID:[],ATK:[]}, yellows:{}, loanedCards:[], skipped:false, _placedThisTurn:0, _drawnThisTurn:0 };
  const { error } = await sb.from('rooms').insert({ code, state:'waiting', players:[player], deck:[], turn:0, first_turn:true, discard_pile:[], burned_pile:[] });
  if (error) return showToast('خطأ: ' + error.message, true);
  document.getElementById('displayCode').textContent = code;
  subscribeRoom(code);
  showScreen('waiting');
}

async function joinRoom() {
  const name = document.getElementById('playerName').value.trim();
  const code = document.getElementById('joinCode').value.trim();
  if (!name || !code) return showToast(t('enterNameAndCode'), true);
  myName = name; isRoomOwner = false; roomCode = code;
  const { data:room, error } = await sb.from('rooms').select('*').eq('code', code).single();
  if (error || !room) return showToast('الغرفة مش موجودة', true);
  if (room.state !== 'waiting') return showToast('اللعبة بدأت فعلاً', true);
  if (room.players.length >= 4) return showToast('الغرفة ممتلئة', true);
  const player = { socketId:mySocketId, name, hand:[], field:{GK:[],DEF:[],MID:[],ATK:[]}, yellows:{}, loanedCards:[], skipped:false, _placedThisTurn:0, _drawnThisTurn:0 };
  await sb.from('rooms').update({ players:[...room.players, player] }).eq('code', code);
  subscribeRoom(code);
  showScreen('waiting');
}

async function startGame() {
  const { data:room } = await sb.from('rooms').select('*').eq('code', roomCode).single();
  if (!room) return;
  if (room.players[0].socketId !== mySocketId) return showToast('صاحب الغرفة بس اللي يبدأ!', true);
  if (room.players.length < 2) return showToast('محتاج لاعبين على الأقل!', true);
  const deck = buildDeck();
  const players = room.players.map(p => ({ ...p, hand:deck.splice(0,5), _placedThisTurn:0, _drawnThisTurn:0 }));
  await sb.from('rooms').update({ state:'playing', deck, players, turn:0, first_turn:true }).eq('code', roomCode);
}

async function drawCard() {
  if (!isMyTurn) return;
  if (drawnThisTurn >= 2) return showToast(t('maxDrawReached'), true);
  const { data:room } = await sb.from('rooms').select('*').eq('code', roomCode).single();
  if (!room || room.deck.length === 0) return showToast('البنك خلص!', true);
  const players = JSON.parse(JSON.stringify(room.players));
  const deck = [...room.deck];
  players[myIndex].hand.push(deck.shift());
  players[myIndex]._drawnThisTurn = (players[myIndex]._drawnThisTurn || 0) + 1;
  await sb.from('rooms').update({ players, deck }).eq('code', roomCode);
  drawnThisTurn++;
  updateDrawCount();
}

async function endTurn() {
  if (!isMyTurn) return;
  const { data:room } = await sb.from('rooms').select('*').eq('code', roomCode).single();
  if (!room) return;
  const players = JSON.parse(JSON.stringify(room.players));
  const player = players[myIndex];
  player._placedThisTurn = 0; player._drawnThisTurn = 0;

  // إرجاع كروت الإعارة
  player.loanedCards.forEach(l => l.turns--);
  const toReturn = player.loanedCards.filter(l => l.turns <= 0);
  player.loanedCards = player.loanedCards.filter(l => l.turns > 0);
  toReturn.forEach(l => {
    for (const z of Object.keys(player.field)) {
      const i = player.field[z].findIndex(c => c.id === l.card.id);
      if (i !== -1) {
        player.field[z].splice(i, 1);
        const owner = players.find(p => p.socketId === l.ownerSocketId);
        if (owner) { const oz = l.card.zone === 'JOKER' ? 'ATK' : l.card.zone; owner.field[oz].push(l.card); }
        break;
      }
    }
  });

  // حرق الزيادة عن 7
  const burnedPile = [...(room.burned_pile || [])];
  while (player.hand.length > 7) {
    const i = Math.floor(Math.random() * player.hand.length);
    const b = player.hand.splice(i, 1)[0];
    burnedPile.push({ ...b, burnedBy:'overflow', burnedFrom:player.name });
  }

  // Next turn + Offside skip
  let newTurn = room.turn + 1;
  const nextIdx = newTurn % players.length;
  if (players[nextIdx] && players[nextIdx].skipped) {
    players[nextIdx].skipped = false;
    // إبلاغ اللاعب المتخطى عبر broadcast
    await roomChannel.send({ type:'broadcast', event:'turn_skipped', payload:{ socketId: players[nextIdx].socketId } });
    newTurn++;
  }

  await sb.from('rooms').update({ players, turn:newTurn, first_turn:false, burned_pile:burnedPile }).eq('code', roomCode);
  turnEnded = true;
  const btn = document.getElementById('endTurnBtn') || document.getElementById('endTurnBtn2');
  if (btn) btn.disabled = true;
}

async function placeCard(cardId, zone) {
  if (!isMyTurn) return;
  const { data:room } = await sb.from('rooms').select('*').eq('code', roomCode).single();
  if (!room) return;
  const players = JSON.parse(JSON.stringify(room.players));
  const player = players[myIndex];
  const ci = player.hand.findIndex(c => c.id === cardId);
  if (ci === -1) return;
  const card = player.hand[ci];
  if (card.type !== 'player') return;
  const fieldCount = Object.values(player.field).reduce((s,z)=>s+z.length,0);
  if (fieldCount >= 11) return showToast(t('fieldFull'), true);
  const ZONE_LIMITS = { GK:1, DEF:5, MID:4, ATK:3 };
  const tz = card.zone === 'JOKER' ? zone : card.zone;
  if (player.field[tz].length >= ZONE_LIMITS[tz]) return showToast(t('maxLimitInZone', t(tz), ZONE_LIMITS[tz]), true);
  player._placedThisTurn = (player._placedThisTurn || 0) + 1;
  if (player._placedThisTurn > 2) { player._placedThisTurn--; return showToast('ممكن تلعب 2 كروت بس في الدور!', true); }
  player.hand.splice(ci, 1);
  player.field[tz].push(card);
  await sb.from('rooms').update({ players }).eq('code', roomCode);
}

async function moveJoker(cardId, newZone) {
  const { data:room } = await sb.from('rooms').select('*').eq('code', roomCode).single();
  const players = JSON.parse(JSON.stringify(room.players));
  const player = players[myIndex];
  for (const z of Object.keys(player.field)) {
    const i = player.field[z].findIndex(c => c.id === cardId && c.joker);
    if (i !== -1) { const [j]=player.field[z].splice(i,1); player.field[newZone].push(j); break; }
  }
  await sb.from('rooms').update({ players }).eq('code', roomCode);
}

async function playSpecial({ cardId, targetPlayerIdx, targetCardId, targetZone, myCardId }) {
  if (!isMyTurn) return;
  const { data:room } = await sb.from('rooms').select('*').eq('code', roomCode).single();
  if (!room) return;
  const players = JSON.parse(JSON.stringify(room.players));
  const player = players[myIndex];
  const ci = player.hand.findIndex(c => c.id === cardId);
  if (ci === -1) return;
  const card = player.hand[ci];

  // فحص Contract/Loan
  const target = players[targetPlayerIdx];
  if (card.name === 'Contract' || card.name === 'Loan') {
    const fc = Object.values(player.field).reduce((s,z)=>s+z.length,0);
    if (fc >= 11) return showToast('الملعب ممتلئ!', true);
    let fz = targetZone;
    if (!fz && target) { for(const z of Object.keys(target.field)){ const f=target.field[z].find(c=>c.id===targetCardId); if(f){fz=f.zone==='JOKER'?'ATK':f.zone;break;} } }
    const ML={GK:1,DEF:5,MID:4,ATK:3};
    if (fz && (player.field[fz]||[]).length >= ML[fz]) return showToast(`المركز ممتلئ (${fz})!`, true);
  }

  player._placedThisTurn = (player._placedThisTurn || 0) + 1;
  if (player._placedThisTurn > 2) { player._placedThisTurn--; return showToast('ممكن تلعب 2 كروت بس!', true); }

  const isSelf = targetPlayerIdx === myIndex;
  const defHasCancel = !isSelf && target && target.hand.some(c => c.name === 'Cancel Order');

  if (defHasCancel) {
    // أبلغ الـ target عبر broadcast وانتظر 7 ثواني
    await roomChannel.send({ type:'broadcast', event:'special_pending', payload:{ card, fromIdx:myIndex, targetPlayerIdx, targetCardId, targetZone, myCardId, fromPlayer:player.name, targetPlayer:target.name, targetSocketId:target.socketId, cardIdx:ci } });
    window._pendingSpecial = { cardId, targetPlayerIdx, targetCardId, targetZone, myCardId, cancelled:false };
    setTimeout(async () => {
      if (window._pendingSpecial && window._pendingSpecial.cancelled) { window._pendingSpecial=null; return; }
      window._pendingSpecial = null;
      await executeSpecial({ cardId, targetPlayerIdx, targetCardId, targetZone, myCardId });
    }, 7000);
    return;
  }

  await executeSpecial({ cardId, targetPlayerIdx, targetCardId, targetZone, myCardId });
}

async function executeSpecial({ cardId, targetPlayerIdx, targetCardId, targetZone, myCardId }) {
  const { data:room } = await sb.from('rooms').select('*').eq('code', roomCode).single();
  if (!room || room.state !== 'playing') return;
  const players = JSON.parse(JSON.stringify(room.players));
  const player = players[myIndex];
  const ci = player.hand.findIndex(c => c.id === cardId);
  if (ci === -1) return;
  const card = player.hand.splice(ci, 1)[0];
  const discardPile = [...(room.discard_pile||[]), card];
  const burnedPile = [...(room.burned_pile||[])];
  applySpecial(players, card, myIndex, targetPlayerIdx, targetCardId, targetZone, myCardId, burnedPile);
  await sb.from('rooms').update({ players, discard_pile:discardPile, burned_pile:burnedPile }).eq('code', roomCode);
}

async function cancelOrder(cancelCardId, pendingPayload) {
  window._pendingSpecial && (window._pendingSpecial.cancelled = true);
  const { data:room } = await sb.from('rooms').select('*').eq('code', roomCode).single();
  const players = JSON.parse(JSON.stringify(room.players));
  // احذف Cancel Order من إيدي
  const me = players[myIndex];
  const ci = me.hand.findIndex(c => c.id === cancelCardId);
  if (ci !== -1) me.hand.splice(ci, 1);
  // احذف الكارت الخاص من إيد المهاجم
  const att = players[pendingPayload.fromIdx];
  if (att) { const ai = att.hand.findIndex(c => c.id === pendingPayload.card.id); if (ai !== -1) att.hand.splice(ai, 1); }
  await sb.from('rooms').update({ players }).eq('code', roomCode);
  await roomChannel.send({ type:'broadcast', event:'special_cancelled', payload:{ by:myName } });
  document.getElementById('cancel-modal').classList.remove('show');
}

async function resetRoom() {
  const { data:room } = await sb.from('rooms').select('*').eq('code', roomCode).single();
  if (!room) return;
  if (room.players[0].socketId !== mySocketId) return showToast('صاحب الغرفة بس اللي يعيد اللعبة!', true);
  const players = room.players.map(p => ({ ...p, hand:[], field:{GK:[],DEF:[],MID:[],ATK:[]}, yellows:{}, loanedCards:[], skipped:false, _placedThisTurn:0, _drawnThisTurn:0 }));
  await sb.from('rooms').update({ state:'waiting', deck:[], turn:0, first_turn:true, discard_pile:[], burned_pile:[], players }).eq('code', roomCode);
}

// ============================================================
// SUBSCRIBE
// ============================================================
function subscribeRoom(code) {
  if (roomChannel) sb.removeChannel(roomChannel);
  roomChannel = sb.channel('room-' + code)
    .on('postgres_changes', { event:'UPDATE', schema:'public', table:'rooms', filter:`code=eq.${code}` }, p => handleUpdate(p.new))
    .on('broadcast', { event:'chat' }, ({ payload }) => { if (payload.socketId !== mySocketId) addChatMsg(payload.name, payload.text, false, false); })
    .on('broadcast', { event:'special_pending' }, ({ payload }) => handleSpecialPending(payload))
    .on('broadcast', { event:'special_cancelled' }, ({ payload }) => { showToast(t('specialCancelled', payload.by)); if(window._pendingSpecial) window._pendingSpecial.cancelled=true; })
    .on('broadcast', { event:'turn_skipped' }, ({ payload }) => { if (payload.socketId === mySocketId) showToast('🚫 دورك اتخطى! تسلل!', true); })
    .subscribe();
}

// ============================================================
// HANDLE UPDATE
// ============================================================
function handleUpdate(room) {
  const me = room.players.find(p => p.socketId === mySocketId);
  if (!me) return;
  myIndex = room.players.findIndex(p => p.socketId === mySocketId);
  myHand = me.hand;
  myField = me.field;
  myYellows = me.yellows;
  numPlayers = room.players.length;
  deckCount = room.deck.length;
  firstTurn = room.first_turn;
  gameBurnedPile = room.burned_pile || [];
  discardTop = (room.discard_pile || []).slice(-1)[0] || null;

  opponents = room.players
    .filter((_,i) => i !== myIndex)
    .map(p => ({ name:p.name, handCount:p.hand.length, field:p.field, yellows:p.yellows, skipped:p.skipped, socketId:p.socketId }));

  const prevTurn = currentTurn;
  currentTurn = room.turn % room.players.length;
  const wasMyTurn = isMyTurn;
  isMyTurn = currentTurn === myIndex;

  if (isMyTurn && (!wasMyTurn || prevTurn !== currentTurn)) {
    placedThisTurn = 0; drawnThisTurn = 0; turnEnded = false;
    fxSweep();
    addChatMsg('', '⚡ ' + (currentLang==='ar'?'دورك!':'Your turn!'), false, true);
  }

  // Waiting
  if (room.state === 'waiting') {
    const list = document.getElementById('playersList');
    if (list) list.innerHTML = room.players.map((p,i) =>
      `<div class="player-chip">${i===0?t('host',p.name):t('player',p.name)}</div>`
    ).join('');
    const sb2 = document.getElementById('startGameBtn');
    if (sb2) sb2.style.display = isRoomOwner && room.players.length >= 2 ? 'block' : 'none';
    const wm = document.getElementById('waitingMsg');
    if (wm) wm.textContent = room.players.length >= 2 ? t('waitingMsgReady') : t('waitingMsg');
    const ct = document.getElementById('chat-toggle');
    if (ct) ct.style.display = 'none';
    showScreen('waiting');
  }

  // Playing
  if (room.state === 'playing') {
    const gameEl = document.getElementById('game');
    if (!gameEl.classList.contains('active')) {
      hideBannerAd();
      showScreen('game');
      const ct = document.getElementById('chat-toggle');
      if (ct) ct.style.display = 'flex';
    }
    renderGame();
    // فحص الفوز
    room.players.forEach(p => {
      if (checkWin(p.field)) {
        showWinScreen(p, room.burned_pile);
        if (room.state !== 'finished') {
          sb.from('rooms').update({ state:'finished' }).eq('code', roomCode);
        }
      }
    });
  }
}

// ============================================================
// SPECIAL PENDING HANDLER
// ============================================================
function handleSpecialPending(payload) {
  if (payload.targetSocketId !== mySocketId) {
    // بانر للبقية
    const b = document.getElementById('pendingBanner');
    if (b) { b.textContent = `⚡ ${payload.fromPlayer} لعب ${payload.card.name} على ${payload.targetPlayer}`; b.classList.add('show'); setTimeout(()=>b.classList.remove('show'),5000); }
    return;
  }
  // أنا الـ target
  const cancelCard = myHand.find(c => c.name === 'Cancel Order');
  if (cancelCard) {
    window._pendingSpecial = { cancelled: false };
    showCancelPopup(payload.card.name, payload.fromPlayer, cancelCard.id, payload);
  }
}

// ============================================================
// CHAT
// ============================================================
async function sendChatMsg() {
  const inp = document.getElementById('chat-input');
  if (!inp) return;
  const text = inp.value.trim();
  if (!text) return;
  inp.value = '';
  await roomChannel.send({ type:'broadcast', event:'chat', payload:{ text, name:myName, socketId:mySocketId } });
  addChatMsg(myName, text, true, false);
}

// ============================================================
// PLAY AGAIN
// ============================================================
function playAgainWithAd() {
  resetRoom();
}

function copyCode() {
  navigator.clipboard.writeText(roomCode);
  showToast(t('codeCopied'));
}
