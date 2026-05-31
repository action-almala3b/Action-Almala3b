// ============================================================
// game.js — منطق اللعبة بـ Supabase بدل Socket.IO
// ضع SUPABASE_URL و SUPABASE_KEY الخاصين بك
// ============================================================

const SUPABASE_URL = 'https://vhhfqgcttdhmectwbhnh.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoaGZxZ2N0dGRobWVjdHdiaG5oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyMzAzODIsImV4cCI6MjA5NTgwNjM4Mn0.2OHAv7g9v3VCyafBvYZB41IEbakyYOdVL3Xu1YJStRw';

// دعم supabase-js CDN — createClient موجودة على window.supabase.createClient
function _initSupabase() {
  if (window.supabase && typeof window.supabase.createClient === 'function')
    return window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, { realtime: { params: { eventsPerSecond: 10 } } });
  if (window.Supabase && typeof window.Supabase.createClient === 'function')
    return window.Supabase.createClient(SUPABASE_URL, SUPABASE_KEY, { realtime: { params: { eventsPerSecond: 10 } } });
  if (typeof window.createClient === 'function')
    return window.createClient(SUPABASE_URL, SUPABASE_KEY, { realtime: { params: { eventsPerSecond: 10 } } });
  alert('خطأ: مكتبة Supabase مش محملة! تأكد من الـ CDN في الـ HTML');
  return null;
}
const supabase = _initSupabase();

// helper: يقرأ اسم اللاعب من أي id ممكن في الـ HTML
function getPlayerNameInput() {
  const el = document.getElementById('name-input')
           || document.getElementById('playerName')
           || document.getElementById('player-name');
  return el ? el.value.trim() : '';
}

// ID عشوائي لكل لاعب بدل socket.id
const mySocketId = Math.random().toString(36).substr(2, 9) + Date.now().toString(36);

let roomChannel = null;

// ============================================================
// CARD LOGIC — منقولة من server.js كما هي
// ============================================================
function buildDeck() {
  const deck = [];
  let id = 1;
  const imgCounters = {};
  function nextImg(key, total) {
    imgCounters[key] = (imgCounters[key] || 0);
    const idx = imgCounters[key] % total;
    imgCounters[key]++;
    return idx;
  }
  for (let i = 0; i < 30; i++) {
    deck.push({ id: id++, type: 'player', zone: 'GK', number: 1, star: false, captain: false, imgIdx: nextImg('GK_1', 3) });
  }
  for(let i=0;i<10;i++) deck.push({id:id++,type:'player',zone:'DEF',number:2,star:false,captain:false,player:'كافو/لام',imgIdx:nextImg('DEF_2',2)});
  for(let i=0;i<5;i++) deck.push({id:id++,type:'player',zone:'DEF',number:2,star:true,captain:false,player:'كافو/لام',imgIdx:nextImg('DEF_2',2)});
  for(let i=0;i<3;i++) deck.push({id:id++,type:'player',zone:'DEF',number:2,star:true,captain:true,player:'كافو/لام',imgIdx:nextImg('DEF_2',2)});
  for(let i=0;i<10;i++) deck.push({id:id++,type:'player',zone:'DEF',number:3,star:false,captain:false,player:'مالديني/كارلوس',imgIdx:nextImg('DEF_3',2)});
  for(let i=0;i<5;i++) deck.push({id:id++,type:'player',zone:'DEF',number:3,star:true,captain:false,player:'مالديني/كارلوس',imgIdx:nextImg('DEF_3',2)});
  for(let i=0;i<3;i++) deck.push({id:id++,type:'player',zone:'DEF',number:3,star:true,captain:true,player:'مالديني/كارلوس',imgIdx:nextImg('DEF_3',2)});
  for(let i=0;i<9;i++) deck.push({id:id++,type:'player',zone:'DEF',number:4,star:false,captain:false,player:'بيكنباور/راموس',imgIdx:nextImg('DEF_4',2)});
  for(let i=0;i<5;i++) deck.push({id:id++,type:'player',zone:'DEF',number:4,star:true,captain:false,player:'بيكنباور/راموس',imgIdx:nextImg('DEF_4',2)});
  for(let i=0;i<3;i++) deck.push({id:id++,type:'player',zone:'DEF',number:4,star:true,captain:true,player:'بيكنباور/راموس',imgIdx:nextImg('DEF_4',2)});
  for(let i=0;i<9;i++) deck.push({id:id++,type:'player',zone:'DEF',number:5,star:false,captain:false,player:'بويول/كانافارو',imgIdx:nextImg('DEF_5',2)});
  for(let i=0;i<5;i++) deck.push({id:id++,type:'player',zone:'DEF',number:5,star:true,captain:false,player:'بويول/كانافارو',imgIdx:nextImg('DEF_5',2)});
  for(let i=0;i<3;i++) deck.push({id:id++,type:'player',zone:'DEF',number:5,star:true,captain:true,player:'بويول/كانافارو',imgIdx:nextImg('DEF_5',2)});
  for(let i=0;i<9;i++) deck.push({id:id++,type:'player',zone:'MID',number:6,star:false,captain:false,player:'تشافي/بوغبا',imgIdx:nextImg('MID_6',2)});
  for(let i=0;i<5;i++) deck.push({id:id++,type:'player',zone:'MID',number:6,star:true,captain:false,player:'تشافي/بوغبا',imgIdx:nextImg('MID_6',2)});
  for(let i=0;i<3;i++) deck.push({id:id++,type:'player',zone:'MID',number:6,star:true,captain:true,player:'تشافي/بوغبا',imgIdx:nextImg('MID_6',2)});
  for(let i=0;i<9;i++) deck.push({id:id++,type:'player',zone:'MID',number:7,star:false,captain:false,player:'بيكهام/دي برويين',imgIdx:nextImg('MID_7',2)});
  for(let i=0;i<5;i++) deck.push({id:id++,type:'player',zone:'MID',number:7,star:true,captain:false,player:'بيكهام/دي برويين',imgIdx:nextImg('MID_7',2)});
  for(let i=0;i<3;i++) deck.push({id:id++,type:'player',zone:'MID',number:7,star:true,captain:true,player:'بيكهام/دي برويين',imgIdx:nextImg('MID_7',2)});
  for(let i=0;i<9;i++) deck.push({id:id++,type:'player',zone:'MID',number:8,star:false,captain:false,player:'إنييستا/كروس',imgIdx:nextImg('MID_8',2)});
  for(let i=0;i<4;i++) deck.push({id:id++,type:'player',zone:'MID',number:8,star:true,captain:false,player:'إنييستا/كروس',imgIdx:nextImg('MID_8',2)});
  for(let i=0;i<3;i++) deck.push({id:id++,type:'player',zone:'MID',number:8,star:true,captain:true,player:'إنييستا/كروس',imgIdx:nextImg('MID_8',2)});
  for(let i=0;i<5;i++) deck.push({id:id++,type:'player',zone:'ATK',number:9,star:false,captain:false,player:'رونالدو/رونالدو البرازيلي',imgIdx:nextImg('ATK_9',2)});
  for(let i=0;i<3;i++) deck.push({id:id++,type:'player',zone:'ATK',number:9,star:true,captain:false,player:'رونالدو/رونالدو البرازيلي',imgIdx:nextImg('ATK_9',2)});
  for(let i=0;i<2;i++) deck.push({id:id++,type:'player',zone:'ATK',number:9,star:true,captain:true,player:'رونالدو/رونالدو البرازيلي',imgIdx:nextImg('ATK_9',2)});
  for(let i=0;i<5;i++) deck.push({id:id++,type:'player',zone:'ATK',number:10,star:false,captain:false,player:'ميسي/بيليه',imgIdx:nextImg('ATK_10',2)});
  for(let i=0;i<3;i++) deck.push({id:id++,type:'player',zone:'ATK',number:10,star:true,captain:false,player:'ميسي/بيليه',imgIdx:nextImg('ATK_10',2)});
  for(let i=0;i<2;i++) deck.push({id:id++,type:'player',zone:'ATK',number:10,star:true,captain:true,player:'ميسي/بيليه',imgIdx:nextImg('ATK_10',2)});
  for(let i=0;i<5;i++) deck.push({id:id++,type:'player',zone:'ATK',number:11,star:false,captain:false,player:'نيمار/صلاح',imgIdx:nextImg('ATK_11',2)});
  for(let i=0;i<3;i++) deck.push({id:id++,type:'player',zone:'ATK',number:11,star:true,captain:false,player:'نيمار/صلاح',imgIdx:nextImg('ATK_11',2)});
  for(let i=0;i<2;i++) deck.push({id:id++,type:'player',zone:'ATK',number:11,star:true,captain:true,player:'نيمار/صلاح',imgIdx:nextImg('ATK_11',2)});
  for (let i = 0; i < 10; i++) deck.push({ id: id++, type: 'player', zone: 'JOKER', number: null, star: true, captain: true, joker: true, imgIdx: 0 });
  const specials = [
    { name: 'Red Card', count: 8 },
    { name: 'Yellow Card', count: 15 },
    { name: 'Offside', count: 8 },
    { name: 'Swap', count: 10 },
    { name: 'Contract', count: 10 },
    { name: 'Loan', count: 10 },
    { name: 'Cancel Order', count: 10 },
    { name: 'Trash Player', count: 20 }
  ];
  specials.forEach(({ name, count }) => {
    for (let i = 0; i < count; i++) deck.push({ id: id++, type: 'special', name });
  });
  return shuffle(deck);
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const FORMATIONS = [
  { DEF: 4, MID: 3, ATK: 3 },
  { DEF: 4, MID: 4, ATK: 2 },
  { DEF: 5, MID: 3, ATK: 2 }
];

function checkWin(player) {
  const field = player.field;
  const validFormation = FORMATIONS.some(f =>
    field.GK.length >= 1 &&
    field.DEF.length === f.DEF &&
    field.MID.length === f.MID &&
    field.ATK.length === f.ATK
  );
  if (!validFormation) return false;
  const hasCaptain = Object.values(field).flat().some(c => c.captain);
  if (!hasCaptain) return false;
  const starDEF = field.DEF.some(c => c.star);
  const starMID = field.MID.some(c => c.star);
  const starATK = field.ATK.some(c => c.star);
  if (starDEF && starMID && starATK) return true;
  const hasJoker = (zone) => field[zone].some(c => c.joker);
  const defNums = field.DEF.map(c => c.number).filter(Boolean).sort((a,b)=>a-b);
  const midNums = field.MID.map(c => c.number).filter(Boolean).sort((a,b)=>a-b);
  const atkNums = field.ATK.map(c => c.number).filter(Boolean).sort((a,b)=>a-b);
  const consecWithJoker = (nums, joker, sets) => sets.some(s => {
    const missing = s.filter(n => !nums.includes(n));
    if (missing.length === 0) return true;
    if (joker && missing.length === 1) return true;
    return false;
  });
  if (consecWithJoker(defNums, hasJoker('DEF'), [[2,3,4],[3,4,5]])) return true;
  if (consecWithJoker(midNums, hasJoker('MID'), [[6,7,8]])) return true;
  if (consecWithJoker(atkNums, hasJoker('ATK'), [[9,10,11]])) return true;
  return false;
}

function applySpecialClient(players, card, fromIdx, targetPlayerIdx, targetCardId, targetZone, myCardId, burnedPile) {
  const attacker = players[fromIdx];
  const defender = players[targetPlayerIdx];
  switch (card.name) {
    case 'Red Card': {
      if (!defender) break;
      for (const zone of Object.keys(defender.field)) {
        const idx = defender.field[zone].findIndex(c => c.id === targetCardId);
        if (idx !== -1) {
          const [burned] = defender.field[zone].splice(idx, 1);
          burnedPile.push({ ...burned, burnedBy: 'red', burnedFrom: defender.name });
          break;
        }
      }
      break;
    }
    case 'Yellow Card': {
      if (!defender) break;
      defender.yellows[targetCardId] = (defender.yellows[targetCardId] || 0) + 1;
      if (defender.yellows[targetCardId] >= 2) {
        delete defender.yellows[targetCardId];
        for (const zone of Object.keys(defender.field)) {
          const idx = defender.field[zone].findIndex(c => c.id === targetCardId);
          if (idx !== -1) {
            const [burned] = defender.field[zone].splice(idx, 1);
            burnedPile.push({ ...burned, burnedBy: 'yellow2', burnedFrom: defender.name });
            break;
          }
        }
      }
      break;
    }
    case 'Offside': {
      if (defender) defender.skipped = true;
      break;
    }
    case 'Swap': {
      if (!defender) break;
      let myCard = null, myZone = null, myIdx = -1;
      let theirCard = null, theirZone = null, theirIdx = -1;
      for (const z of Object.keys(attacker.field)) {
        const i = attacker.field[z].findIndex(c => c.id === myCardId);
        if (i !== -1) { myCard = attacker.field[z][i]; myZone = z; myIdx = i; break; }
      }
      for (const z of Object.keys(defender.field)) {
        const i = defender.field[z].findIndex(c => c.id === targetCardId);
        if (i !== -1) { theirCard = defender.field[z][i]; theirZone = z; theirIdx = i; break; }
      }
      if (myCard && theirCard) {
        const myCardTargetZone = theirCard.zone === 'JOKER' ? myZone : theirCard.zone;
        const theirCardTargetZone = myCard.zone === 'JOKER' ? theirZone : myCard.zone;
        attacker.field[myZone].splice(myIdx, 1);
        defender.field[theirZone].splice(theirIdx, 1);
        attacker.field[myCardTargetZone] = attacker.field[myCardTargetZone] || [];
        attacker.field[myCardTargetZone].push(theirCard);
        defender.field[theirCardTargetZone] = defender.field[theirCardTargetZone] || [];
        defender.field[theirCardTargetZone].push(myCard);
        const myYellow = attacker.yellows[myCardId];
        const theirYellow = defender.yellows[targetCardId];
        delete attacker.yellows[myCardId];
        delete defender.yellows[targetCardId];
        if (myYellow) defender.yellows[myCard.id] = myYellow;
        if (theirYellow) attacker.yellows[theirCard.id] = theirYellow;
      }
      break;
    }
    case 'Contract': {
      if (!defender) break;
      for (const zone of Object.keys(defender.field)) {
        const idx = defender.field[zone].findIndex(c => c.id === targetCardId);
        if (idx !== -1) {
          const [stolen] = defender.field[zone].splice(idx, 1);
          const z = stolen.zone === 'JOKER' ? (targetZone || 'ATK') : stolen.zone;
          attacker.field[z] = attacker.field[z] || [];
          attacker.field[z].push(stolen);
          if (defender.yellows[stolen.id]) {
            attacker.yellows[stolen.id] = defender.yellows[stolen.id];
            delete defender.yellows[stolen.id];
          }
          break;
        }
      }
      break;
    }
    case 'Loan': {
      if (!defender) break;
      for (const zone of Object.keys(defender.field)) {
        const idx = defender.field[zone].findIndex(c => c.id === targetCardId);
        if (idx !== -1) {
          const [loaned] = defender.field[zone].splice(idx, 1);
          const z = loaned.zone === 'JOKER' ? targetZone : loaned.zone;
          attacker.field[z] = attacker.field[z] || [];
          attacker.field[z].push(loaned);
          attacker.loanedCards.push({ card: loaned, turns: 2, ownerSocketId: defender.socketId });
          break;
        }
      }
      break;
    }
    case 'Trash Player': {
      for (const zone of Object.keys(attacker.field)) {
        const idx = attacker.field[zone].findIndex(c => c.id === targetCardId);
        if (idx !== -1) {
          const [trashed] = attacker.field[zone].splice(idx, 1);
          burnedPile.push({ ...trashed, burnedBy: 'trash', burnedFrom: attacker.name });
          break;
        }
      }
      break;
    }
  }
}

// ============================================================
// SUPABASE FUNCTIONS — بديل Socket.IO
// ============================================================

async function createRoom() {
  const name = getPlayerNameInput();
  if (!name) return showToast(t('enterName'), true);
  myName = name;
  isRoomOwner = true;

  // كود 6 أرقام عشوائي
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  roomCode = code;

  const player = {
    socketId: mySocketId, name: myName,
    hand: [], field: { GK: [], DEF: [], MID: [], ATK: [] },
    yellows: {}, loanedCards: [], skipped: false,
    _placedThisTurn: 0, _drawnThisTurn: 0
  };

  const { error } = await supabase.from('rooms').insert({
    code,
    state: 'waiting',
    players: [player],
    deck: [],
    turn: 0,
    first_turn: true,
    pending_special: null,
    discard_pile: [],
    burned_pile: []
  });

  if (error) return showToast('❌ خطأ في إنشاء الغرفة: ' + error.message, true);

  // اعرض الكود للـ host
  const displayEl = document.getElementById('displayCode') || document.getElementById('room-code');
  if (displayEl) displayEl.textContent = code;

  subscribeToRoom(code);
  showScreen('waiting');
}

async function joinRoom() {
  const name = getPlayerNameInput();
  const codeEl = document.getElementById('joinCode') || document.getElementById('join-code') || document.getElementById('room-code-input');
  const code = codeEl ? codeEl.value.trim() : '';

  if (!name) return showToast(t('enterName') || 'اكتب اسمك الأول', true);
  if (!code) return showToast('اكتب كود الغرفة', true);

  myName = name;
  roomCode = code;

  // تحقق إن الغرفة موجودة
  const { data: room, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('code', code)
    .maybeSingle();           // ← maybeSingle بدل single عشان ميكسرش لو مفيش نتيجة

  if (error)  return showToast('❌ خطأ في الاتصال: ' + error.message, true);
  if (!room)  return showToast('❌ الغرفة مش موجودة، تأكد من الكود', true);
  if (room.state !== 'waiting') return showToast('⛔ اللعبة بدأت فعلاً', true);
  if (room.players.length >= 4) return showToast('⛔ الغرفة ممتلئة (4/4)', true);

  // تأكد إن اللاعب مش مسجّل قبل كده (reload مثلاً)
  const alreadyIn = room.players.some(p => p.socketId === mySocketId);
  if (!alreadyIn) {
    const player = {
      socketId: mySocketId, name: myName,
      hand: [], field: { GK: [], DEF: [], MID: [], ATK: [] },
      yellows: {}, loanedCards: [], skipped: false,
      _placedThisTurn: 0, _drawnThisTurn: 0
    };
    const newPlayers = [...room.players, player];
    const { error: updateErr } = await supabase
      .from('rooms')
      .update({ players: newPlayers })
      .eq('code', code);
    if (updateErr) return showToast('❌ خطأ في الانضمام: ' + updateErr.message, true);
  }

  subscribeToRoom(code);
  showScreen('waiting');
}

async function startGame() {
  const { data: room } = await supabase.from('rooms').select('*').eq('code', roomCode).single();
  if (!room) return;
  if (room.players[0].socketId !== mySocketId) return showToast('صاحب الغرفة بس يقدر يبدأ!', true);
  if (room.players.length < 2) return showToast('محتاج لاعبين على الأقل!', true);
  const deck = buildDeck();
  const players = room.players.map(p => ({ ...p, hand: deck.splice(0, 5), _placedThisTurn: 0, _drawnThisTurn: 0 }));
  await supabase.from('rooms').update({ state: 'playing', deck, players, turn: 0, first_turn: true }).eq('code', roomCode);
}

function subscribeToRoom(code) {
  // إلغاء الاشتراك القديم لو موجود
  if (roomChannel) {
    supabase.removeChannel(roomChannel);
    roomChannel = null;
  }

  roomChannel = supabase
    .channel('room-' + code, { config: { broadcast: { self: false } } })

    // ✅ Realtime: أي UPDATE على صف الغرفة
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'rooms',
      filter: `code=eq.${code}`
    }, (payload) => {
      handleRoomUpdate(payload.new);
    })

    // ✅ Realtime: لو غرفة جديدة اتعملت (للتأكد)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'rooms',
      filter: `code=eq.${code}`
    }, (payload) => {
      handleRoomUpdate(payload.new);
    })

    // 💬 الشات
    .on('broadcast', { event: 'chat' }, ({ payload }) => {
      if (payload.name !== myName) addChatMsg(payload.name, payload.text, false, false);
    })

    // ⚡ كارت خاص معلّق (Cancel Order)
    .on('broadcast', { event: 'special_pending' }, ({ payload }) => {
      handleSpecialPending(payload);
    })

    // ❌ إلغاء الكارت الخاص
    .on('broadcast', { event: 'special_cancelled' }, ({ payload }) => {
      showToast(t('specialCancelled', payload.by));
    })

    // 🚫 تخطي الدور (Offside)
    .on('broadcast', { event: 'turn_skipped' }, ({ payload }) => {
      if (payload.socketId === mySocketId) {
        showToast('🚫 دورك اتخطى! لاعب استخدم عليك كارت تسلل', true);
      }
    })

    .subscribe((status, err) => {
      if (status === 'SUBSCRIBED') {
        console.log('✅ Realtime متصل على الغرفة:', code);
      } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        console.error('❌ Realtime connection error:', status, err);
        // إعادة المحاولة بعد 3 ثواني
        setTimeout(() => subscribeToRoom(code), 3000);
      } else if (status === 'CLOSED') {
        console.warn('⚠️ Realtime channel closed');
      }
    });
}

function handleRoomUpdate(room) {
  const me = room.players.find(p => p.socketId === mySocketId);
  if (!me) return;
  myIndex = room.players.findIndex(p => p.socketId === mySocketId);
  myHand = me.hand;
  myField = me.field;
  myYellows = me.yellows;
  opponents = room.players.filter((_, i) => i !== myIndex).map(p => ({
    name: p.name, handCount: p.hand.length, field: p.field, yellows: p.yellows, skipped: p.skipped
  }));
  deckCount = room.deck.length;
  firstTurn = room.first_turn;
  numPlayers = room.players.length;
  const prevTurn = currentTurn;
  currentTurn = room.turn % room.players.length;
  const wasMyTurn = isMyTurn;
  isMyTurn = (currentTurn === myIndex);
  if (isMyTurn && (!wasMyTurn || prevTurn !== currentTurn)) {
    placedThisTurn = 0; drawnThisTurn = 0; turnEnded = false;
    fxSweep();
    addChatMsg('', '⚡ ' + (currentLang === 'ar' ? 'دورك!' : 'Your turn!'), false, true);
  }
  if (room.discard_pile) discardTop = room.discard_pile[room.discard_pile.length - 1];
  if (room.burned_pile) gameBurnedPile = room.burned_pile;

  // waiting state
  if (room.state === 'waiting') {
    const names = room.players.map(p => p.name);
    const list = document.getElementById('playersList');
    if (list) list.innerHTML = names.map((p, i) =>
      i === 0 ? `<div class="player-chip">${t('host', p)}</div>`
              : `<div class="player-chip">${t('player', p)}</div>`
    ).join('');
    const startBtn = document.getElementById('startGameBtn');
    if (startBtn) startBtn.style.display = isRoomOwner && names.length >= 2 ? 'block' : 'none';
    const waitMsg = document.getElementById('waitingMsg');
    if (waitMsg) waitMsg.textContent = names.length >= 2 ? t('waitingMsgReady') : t('waitingMsg');
    const chatToggle = document.getElementById('chat-toggle');
    if (chatToggle) chatToggle.style.display = 'none';
  }

  // playing state
  if (room.state === 'playing') {
    const gameEl = document.getElementById('game');
    if (!gameEl.classList.contains('active')) {
      hideBannerAd();
      showScreen('game');
      const chatToggle = document.getElementById('chat-toggle');
      if (chatToggle) chatToggle.style.display = 'flex';
    }
    renderGame();
    // فحص الفوز
    const winner = room.players.find(p => checkWin(p));
    if (winner) {
      supabase.from('rooms').update({ state: 'finished' }).eq('code', roomCode);
      showWinScreen(winner, room.burned_pile);
    }
  }

  // reset state
  if (room.state === 'reset') {
    document.getElementById('win-screen').classList.remove('show');
    const names = room.players.map(p => p.name);
    const list = document.getElementById('playersList');
    if (list) list.innerHTML = names.map((p, i) =>
      i === 0 ? `<div class="player-chip">${t('host', p)}</div>`
              : `<div class="player-chip">${t('player', p)}</div>`
    ).join('');
    showScreen('waiting');
    const startBtn = document.getElementById('startGameBtn');
    if (startBtn) startBtn.style.display = isRoomOwner && names.length >= 2 ? 'block' : 'none';
  }
}

function showWinScreen(winner, burnedPile) {
  const w = winner.name === myName;
  document.getElementById('winTitle').textContent = w ? t('youWin') : t('playerWins', winner.name);
  document.getElementById('winSub').textContent = w ? t('wellDone') : t('tryAgain');
  // تشكيلة الفايز
  const fEl = document.getElementById('winFormation');
  const zonesEl = document.getElementById('winZones');
  const fTitle = document.getElementById('winFormationTitle');
  if (winner.field) {
    fEl.style.display = 'block';
    fTitle.textContent = currentLang === 'ar' ? `تشكيلة ${winner.name}` : `${winner.name}'s Formation`;
    zonesEl.innerHTML = '';
    ['GK','DEF','MID','ATK'].forEach(zone => {
      const cards = winner.field[zone] || [];
      if (!cards.length) return;
      const zDiv = document.createElement('div'); zDiv.className = 'win-zone';
      const lbl = document.createElement('div'); lbl.className = 'win-zone-lbl'; lbl.textContent = t(zone);
      const cardsDiv = document.createElement('div'); cardsDiv.className = 'win-zone-cards';
      cards.forEach(card => {
        const c = document.createElement('div');
        c.style.cssText = 'width:46px;height:64px;border-radius:6px;position:relative;overflow:hidden;flex-shrink:0;border:1.5px solid rgba(255,255,255,0.15);background:' + getCardBg(card) + ';';
        if (card.captain) c.style.borderColor = 'rgba(255,215,0,0.7)';
        const imgSrc = getPlayerImage(card);
        if (imgSrc) { const im = document.createElement('img'); im.src = imgSrc; im.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center top;'; c.appendChild(im); }
        cardsDiv.appendChild(c);
      });
      zDiv.appendChild(lbl); zDiv.appendChild(cardsDiv); zonesEl.appendChild(zDiv);
    });
  }
  // كروت محروقة
  const bEl = document.getElementById('winBurned');
  const bCards = document.getElementById('winBurnedCards');
  if (burnedPile && burnedPile.length > 0) {
    bEl.style.display = 'block';
    bCards.innerHTML = '';
    burnedPile.forEach(card => {
      const c = document.createElement('div');
      c.style.cssText = 'width:40px;height:56px;border-radius:6px;position:relative;overflow:hidden;flex-shrink:0;border:1.5px solid rgba(255,59,59,0.5);background:' + getCardBg(card) + ';opacity:0.85;';
      bCards.appendChild(c);
    });
  }
  document.getElementById('win-screen').classList.add('show');
  fxConfetti();
}

async function drawCard() {
  if (!isMyTurn) return;
  if (drawnThisTurn >= 2) return showToast(t('maxDrawReached'), true);
  const { data: room } = await supabase.from('rooms').select('*').eq('code', roomCode).single();
  if (!room || room.deck.length === 0) return showToast('البنك خلص!', true);
  const players = JSON.parse(JSON.stringify(room.players));
  const deck = [...room.deck];
  players[myIndex].hand.push(deck.shift());
  await supabase.from('rooms').update({ players, deck }).eq('code', roomCode);
  drawnThisTurn++;
  updateDrawCount();
}

async function endTurn() {
  if (!isMyTurn) return;
  const { data: room } = await supabase.from('rooms').select('*').eq('code', roomCode).single();
  const players = JSON.parse(JSON.stringify(room.players));
  const player = players[myIndex];
  player._placedThisTurn = 0; player._drawnThisTurn = 0;
  // إرجاع كروت الإعارة
  const toReturn = player.loanedCards.filter(l => { l.turns--; return l.turns <= 0; });
  player.loanedCards = player.loanedCards.filter(l => l.turns > 0);
  toReturn.forEach(l => {
    for (const z of Object.keys(player.field)) {
      const idx = player.field[z].findIndex(c => c.id === l.card.id);
      if (idx !== -1) {
        player.field[z].splice(idx, 1);
        const owner = players.find(p => p.socketId === l.ownerSocketId);
        if (owner) { const oz = l.card.zone === 'JOKER' ? 'ATK' : l.card.zone; owner.field[oz].push(l.card); }
        break;
      }
    }
  });
  // حرق الزيادة
  const burnedPile = [...(room.burned_pile || [])];
  while (player.hand.length > 7) {
    const idx = Math.floor(Math.random() * player.hand.length);
    const burned = player.hand.splice(idx, 1)[0];
    burnedPile.push({ ...burned, burnedBy: 'overflow', burnedFrom: player.name });
  }
  // Next turn
  let newTurn = room.turn + 1;
  const nextIdx = newTurn % players.length;
  if (players[nextIdx] && players[nextIdx].skipped) {
    players[nextIdx].skipped = false;
    await roomChannel.send({ type: 'broadcast', event: 'turn_skipped', payload: { socketId: players[nextIdx].socketId } });
    newTurn++;
  }
  await supabase.from('rooms').update({ players, turn: newTurn, first_turn: false, burned_pile: burnedPile }).eq('code', roomCode);
  turnEnded = true;
  const btn = document.getElementById('endTurnBtn') || document.getElementById('endTurnBtn2');
  if (btn) btn.disabled = true;
}

async function placeCard(cardId, zone) {
  const { data: room } = await supabase.from('rooms').select('*').eq('code', roomCode).single();
  const players = JSON.parse(JSON.stringify(room.players));
  const player = players[myIndex];
  const cardIdx = player.hand.findIndex(c => c.id === cardId);
  if (cardIdx === -1) return;
  const card = player.hand[cardIdx];
  const ZONE_LIMITS = { GK: 1, DEF: 5, MID: 4, ATK: 3 };
  const targetZone = card.zone === 'JOKER' ? zone : card.zone;
  const fieldCount = Object.values(player.field).reduce((s, z) => s + z.length, 0);
  if (fieldCount >= 11) return showToast(t('fieldFull'), true);
  if (player.field[targetZone].length >= ZONE_LIMITS[targetZone]) return showToast(t('maxLimitInZone', t(targetZone), ZONE_LIMITS[targetZone]), true);
  player.hand.splice(cardIdx, 1);
  player.field[targetZone].push(card);
  await supabase.from('rooms').update({ players }).eq('code', roomCode);
}

async function moveJoker(cardId, newZone) {
  const { data: room } = await supabase.from('rooms').select('*').eq('code', roomCode).single();
  const players = JSON.parse(JSON.stringify(room.players));
  const player = players[myIndex];
  for (const zone of Object.keys(player.field)) {
    const idx = player.field[zone].findIndex(c => c.id === cardId && c.joker);
    if (idx !== -1) {
      const [joker] = player.field[zone].splice(idx, 1);
      player.field[newZone].push(joker);
      break;
    }
  }
  await supabase.from('rooms').update({ players }).eq('code', roomCode);
}

async function playSpecial({ cardId, targetPlayerIdx, targetCardId, targetZone, myCardId }) {
  const { data: room } = await supabase.from('rooms').select('*').eq('code', roomCode).single();
  const players = JSON.parse(JSON.stringify(room.players));
  const attacker = players[myIndex];
  const cardIdx = attacker.hand.findIndex(c => c.id === cardId);
  if (cardIdx === -1) return;
  const card = attacker.hand[cardIdx];
  const defender = players[targetPlayerIdx];
  // فحص Cancel Order
  const isSelf = targetPlayerIdx === myIndex;
  const defenderHasCancel = !isSelf && defender && defender.hand.some(c => c.name === 'Cancel Order');
  if (defenderHasCancel) {
    // ابعت broadcast للـ defender
    await roomChannel.send({
      type: 'broadcast', event: 'special_pending',
      payload: {
        card, fromIdx: myIndex, targetPlayerIdx, targetCardId, targetZone, myCardId,
        fromPlayer: attacker.name, targetPlayer: defender.name,
        targetSocketId: defender.socketId
      }
    });
    // استنى 7 ثواني وبعدين نفّذ
    setTimeout(async () => {
      if (window._specialCancelled) { window._specialCancelled = false; return; }
      await executeSpecial({ cardId, targetPlayerIdx, targetCardId, targetZone, myCardId });
    }, 7000);
    return;
  }
  await executeSpecial({ cardId, targetPlayerIdx, targetCardId, targetZone, myCardId });
}

async function executeSpecial({ cardId, targetPlayerIdx, targetCardId, targetZone, myCardId }) {
  const { data: room } = await supabase.from('rooms').select('*').eq('code', roomCode).single();
  if (!room || room.state !== 'playing') return;
  const players = JSON.parse(JSON.stringify(room.players));
  const attacker = players[myIndex];
  const cardIdx = attacker.hand.findIndex(c => c.id === cardId);
  if (cardIdx === -1) return;
  const card = attacker.hand.splice(cardIdx, 1)[0];
  const discardPile = [...(room.discard_pile || []), card];
  const burnedPile = [...(room.burned_pile || [])];
  applySpecialClient(players, card, myIndex, targetPlayerIdx, targetCardId, targetZone, myCardId, burnedPile);
  await supabase.from('rooms').update({ players, discard_pile: discardPile, burned_pile: burnedPile }).eq('code', roomCode);
}

function handleSpecialPending(payload) {
  if (payload.targetSocketId !== mySocketId) {
    // بانر للبقية
    const b = document.getElementById('pendingBanner');
    b.textContent = `⚡ ${payload.fromPlayer} لعب ${payload.card.name} على ${payload.targetPlayer}`;
    b.classList.add('show');
    setTimeout(() => b.classList.remove('show'), 2000);
    return;
  }
  // أنا الـ target — فتح Cancel popup
  const cancelCard = myHand.find(c => c.name === 'Cancel Order');
  if (cancelCard) {
    window._specialCancelled = false;
    showCancelPopup(payload.card.name, payload.fromPlayer, cancelCard.id, payload);
  }
}

async function cancelOrder(cancelCardId, pendingPayload) {
  window._specialCancelled = true;
  const { data: room } = await supabase.from('rooms').select('*').eq('code', roomCode).single();
  const players = JSON.parse(JSON.stringify(room.players));
  // احذف Cancel Order من إيدي
  const me = players[myIndex];
  const cIdx = me.hand.findIndex(c => c.id === cancelCardId);
  if (cIdx !== -1) me.hand.splice(cIdx, 1);
  // احذف الكارت الخاص من إيد المهاجم
  const attacker = players[pendingPayload.fromIdx];
  if (attacker) {
    const aIdx = attacker.hand.findIndex(c => c.id === pendingPayload.card.id);
    if (aIdx !== -1) attacker.hand.splice(aIdx, 1);
  }
  await supabase.from('rooms').update({ players }).eq('code', roomCode);
  await roomChannel.send({ type: 'broadcast', event: 'special_cancelled', payload: { by: myName } });
  document.getElementById('cancel-modal').classList.remove('show');
}

async function playAgainWithAd() {
  showVastAd(async () => {
    document.getElementById('win-screen').classList.remove('show');
    const { data: room } = await supabase.from('rooms').select('*').eq('code', roomCode).single();
    const players = room.players.map(p => ({
      ...p, hand: [], field: { GK: [], DEF: [], MID: [], ATK: [] },
      yellows: {}, loanedCards: [], skipped: false, _placedThisTurn: 0, _drawnThisTurn: 0
    }));
    await supabase.from('rooms').update({
      state: 'reset', deck: [], turn: 0, first_turn: true,
      pending_special: null, discard_pile: [], burned_pile: [], players
    }).eq('code', roomCode);
    // بعد ثانية حوّل لـ waiting
    setTimeout(async () => {
      await supabase.from('rooms').update({ state: 'waiting' }).eq('code', roomCode);
    }, 500);
  });
}

async function sendChatMsg() {
  const inp = document.getElementById('chat-input');
  if (!inp) return;
  const text = inp.value.trim();
  if (!text) return;
  inp.value = '';
  await roomChannel.send({ type: 'broadcast', event: 'chat', payload: { text, name: myName } });
  addChatMsg(myName, text, true, false);
}

function copyCode() {
  navigator.clipboard.writeText(roomCode);
  showToast(t('codeCopied'));
}

// ============================================================
// Aliases — للتوافق مع أي HTML بيستخدم أسماء تانية
// ============================================================
function createRoomWithAd() { createRoom(); }
function joinRoomWithAd()   { joinRoom(); }

// تصدير الدوال للـ HTML لو استخدمت onclick="..."
window.createRoom      = createRoom;
window._doCreateRoom   = createRoom;
window._doJoinRoom     = joinRoom;
window.joinRoom        = joinRoom;
window.createRoomWithAd = createRoomWithAd;
window.joinRoomWithAd   = joinRoomWithAd;
window.startGame       = startGame;
window.drawCard        = drawCard;
window.endTurn         = endTurn;
window.placeCard       = placeCard;
window.moveJoker       = moveJoker;
window.playSpecial     = playSpecial;
window.cancelOrder     = cancelOrder;
window.playAgainWithAd = playAgainWithAd;
window.sendChatMsg     = sendChatMsg;
window.copyCode        = copyCode;

// ============================================================
// RENDERING FUNCTIONS — مطلوبة للعرض
// ============================================================

function getCardBg(card) {
  if (!card) return '#1a1a2e';
  if (card.joker) return 'linear-gradient(135deg,#8e44ad,#6c3483)';
  if (card.type === 'special') return 'linear-gradient(135deg,#2c3e50,#1a252f)';
  const map = { GK:'linear-gradient(135deg,#f5a623,#e08800)', DEF:'linear-gradient(135deg,#4a90d9,#2874b5)', MID:'linear-gradient(135deg,#27ae60,#1e8449)', ATK:'linear-gradient(135deg,#e74c3c,#c0392b)' };
  return map[card.zone] || '#1a1a2e';
}

function updateDrawCount() {
  const el = document.getElementById('drawCount') || document.getElementById('drawCount2');
  if (el) el.textContent = t('drawCount', drawnThisTurn);
  const deckEl = document.getElementById('deckCount') || document.getElementById('deckCount2');
  if (deckEl) deckEl.textContent = deckCount;
  const deckPile = document.getElementById('deckPile');
  if (deckPile) { if (drawnThisTurn >= 2) deckPile.classList.add('drawn2'); else deckPile.classList.remove('drawn2'); }
  const endBtn = document.getElementById('endTurnBtn') || document.getElementById('endTurnBtn2');
  if (endBtn) endBtn.disabled = !isMyTurn || turnEnded;
}

function makeFormCard(card, clickable, zone, oppData) {
  const el = document.createElement('div');
  el.className = 'form-card';
  el.style.background = getCardBg(card);
  if (card.captain) el.classList.add('captain-card');
  const imgSrc = getPlayerImage(card);
  if (imgSrc) { const im = document.createElement('img'); im.src = imgSrc; im.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center top;display:block;'; im.loading='lazy'; el.appendChild(im); }
  if (!card.joker && card.number) { const n = document.createElement('span'); n.style.cssText = 'position:absolute;top:2px;left:3px;font-family:Orbitron,sans-serif;font-size:11px;font-weight:900;color:#fff;text-shadow:0 0 5px #000,1px 1px 0 #000;z-index:5;line-height:1;'; n.textContent = card.number; el.appendChild(n); }
  if (card.star || card.joker) { const s = document.createElement('span'); s.style.cssText = 'position:absolute;top:'+(card.joker?'2px':'14px')+';left:2px;font-size:6px;color:#ffd700;z-index:5;'; s.textContent='⭐'; el.appendChild(s); }
  if (card.type==='special') { const n=document.createElement('span'); n.style.cssText='position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:6px;color:#fff;text-align:center;padding:2px;z-index:5;font-family:Tajawal,sans-serif;font-weight:700;line-height:1.2;'; n.textContent=currentLang==='ar'?t(card.name||''):(card.name||'?'); el.appendChild(n); }
  const yellows = oppData ? oppData.yellows : myYellows;
  if (yellows && yellows[card.id]) { const y=document.createElement('div'); y.className='yellow-mark'; el.appendChild(y); }
  if (oppData && isMyTurn) {
    el.style.cursor='pointer';
    el.onclick=(e)=>{ e.stopPropagation(); if(!selectedCard||selectedCard.type!=='special'){showToast(t('selectSpecialFirst'),true);return;} handleOppCardClick(card,oppData); };
  } else if (clickable && isMyTurn) {
    el.onclick=()=>{ if(selectedCard&&selectedCard.type!=='special'){ const tz=selectedCard.zone==='JOKER'?zone:selectedCard.zone; if(tz===zone){placeCard(selectedCard.id,zone);selectedCard=null;} else showToast(t('mustPlaceCorrect',t(selectedCard.zone)),true); } };
  }
  return el;
}

function renderMyFormation() {
  ['GK','DEF','MID','ATK'].forEach(zone=>{
    const row=document.getElementById('my-row-'+zone); if(!row)return;
    row.innerHTML='';
    (myField[zone]||[]).forEach(card=>row.appendChild(makeFormCard(card,true,zone,null)));
    if(isMyTurn){ const fc=Object.values(myField).reduce((s,z)=>s+z.length,0); if(fc<11){const d=document.createElement('div');d.className='form-drop';d.textContent='+';d.onclick=()=>{if(selectedCard&&selectedCard.type!=='special'){const tz=selectedCard.zone==='JOKER'?zone:selectedCard.zone;if(tz===zone){placeCard(selectedCard.id,zone);selectedCard=null;}else showToast(t('mustPlaceCorrect',t(selectedCard.zone)),true);}};row.appendChild(d);} }
  });
}

function renderGame() {
  const twoP=document.getElementById('two-player-layout');
  const actionBar=document.getElementById('action-bar-2p');
  const mySecOld=document.getElementById('my-section-old');
  const midOld=document.getElementById('middle-zone-old');
  if(numPlayers===2){
    if(twoP)twoP.style.display='flex'; if(actionBar)actionBar.style.display='flex';
    if(mySecOld)mySecOld.style.display='none'; if(midOld)midOld.style.display='none';
  } else {
    if(twoP)twoP.style.display='none'; if(actionBar)actionBar.style.display='none';
    if(mySecOld)mySecOld.style.display='block'; if(midOld)midOld.style.display='block';
  }
  const badge=document.getElementById('turnIndicator');
  if(badge){ if(isMyTurn){badge.textContent=t('yourTurn');badge.classList.add('my-turn-pulse');document.getElementById('pitch-bg')?.classList.add('my-turn-glow');}else{const opp=opponents[0]; badge.textContent=(currentLang==='ar'?'دور ':'Turn: ')+(opp?opp.name:'...');badge.classList.remove('my-turn-pulse');document.getElementById('pitch-bg')?.classList.remove('my-turn-glow');} }
  const nameBar=document.getElementById('myNameBar'); if(nameBar)nameBar.textContent='👤 '+myName;
  const topName=document.getElementById('topName'); if(topName)topName.textContent='👤 '+myName;
  renderMyFormation(); renderOppFormation(); renderMyHand(); renderBurnedZone(); updateDrawCount();
  const endBtn=document.getElementById('endTurnBtn')||document.getElementById('endTurnBtn2');
  if(endBtn)endBtn.disabled=!isMyTurn||turnEnded;
}

function trackSpecialPlayed(card) {
  if(!card)return;
  playSpecial({ cardId:card.id, targetPlayerIdx:window._targetOppIdx, targetCardId:window._targetCardId, targetZone:window._targetZone, myCardId:window._mySwapCardId });
  window._targetOppIdx=undefined; window._targetCardId=null; window._targetZone=null; window._mySwapCardId=null;
}

function showCancelPopup(cardName, fromPlayer, cancelCardId, pendingPayload) {
  const modal=document.getElementById('cancel-modal'); if(!modal)return;
  const msgEl=document.getElementById('cancel-msg'); if(msgEl)msgEl.textContent=`${fromPlayer} ${currentLang==='ar'?'لعب':'played'} ${cardName} ${currentLang==='ar'?'عليك!':'on you!'}`;
  modal.classList.add('show');
  const bar=document.getElementById('cancel-timer-bar'); if(bar){bar.style.width='100%';setTimeout(()=>bar.style.width='0%',50);}
  const autoTimer=setTimeout(()=>modal.classList.remove('show'),7500);
  const yesBtn=document.getElementById('cancelYesBtn'); if(yesBtn)yesBtn.onclick=()=>{clearTimeout(autoTimer);cancelOrder(cancelCardId,pendingPayload);};
  const noBtn=document.getElementById('cancelNoBtn'); if(noBtn)noBtn.onclick=()=>{clearTimeout(autoTimer);modal.classList.remove('show');};
}

function handleOppCardClick(card, oppData) {
  if(!selectedCard||selectedCard.type!=='special')return;
  const oppIdx=opponents.indexOf(oppData);
  const realIdx=oppIdx>=myIndex?oppIdx+1:oppIdx;
  window._targetOppIdx=realIdx; window._targetCardId=card.id; window._targetZone=card.zone==='JOKER'?'ATK':card.zone;
  const sc=selectedCard;
  if(sc.name==='Swap'){
    if(!mySwapCard)return showToast(t('selectYourCardFirst'),true);
    window._mySwapCardId=mySwapCard.id;
    playSpecial({cardId:sc.id,targetPlayerIdx:realIdx,targetCardId:card.id,targetZone:window._targetZone,myCardId:mySwapCard.id});
    mySwapCard=null; selectedCard=null;
  } else if(sc.name==='Loan'){
    const myFieldCount=Object.values(myField).reduce((s,z)=>s+z.length,0);
    const tz=card.zone==='JOKER'?'ATK':card.zone;
    const ZONE_LIMITS={GK:1,DEF:5,MID:4,ATK:3};
    if(myFieldCount>=11)return showToast(currentLang==='ar'?'الملعب ممتلئ!':'Field is full!',true);
    if(myField[tz]&&myField[tz].length>=ZONE_LIMITS[tz])return showToast(currentLang==='ar'?'المركز ممتلئ!':'Zone full!',true);
    playSpecial({cardId:sc.id,targetPlayerIdx:realIdx,targetCardId:card.id,targetZone:tz,myCardId:null});
    selectedCard=null;
  } else {
    playSpecial({cardId:sc.id,targetPlayerIdx:realIdx,targetCardId:card.id,targetZone:window._targetZone,myCardId:null});
    selectedCard=null;
  }
  renderMyHand();
}
