/* ============ Brain vs. Phone — Happiness Lab ============ */
"use strict";

const $ = (id) => document.getElementById(id);
const MISSIONS = ["hook", "attention", "happiness", "quiz", "sorter", "challenges"];

/* ---------------- State (saved in the browser) ---------------- */
const state = load();
function load() {
  try { return JSON.parse(localStorage.getItem("bvp-state")) || {}; }
  catch { return {}; }
}
function save() { localStorage.setItem("bvp-state", JSON.stringify(state)); }
state.done = state.done || {};
state.challenges = state.challenges || {};

/* ---------------- Navigation ---------------- */
function show(name) {
  document.querySelectorAll(".panel").forEach(p => p.classList.remove("active"));
  const panel = $("panel-" + name);
  if (panel) panel.classList.add("active");
  document.querySelectorAll(".tabs button").forEach(b =>
    b.classList.toggle("active", b.dataset.nav === name));
  window.scrollTo({ top: 0 });
}
document.querySelectorAll("[data-nav]").forEach(el =>
  el.addEventListener("click", () => show(el.dataset.nav)));

function completeMission(name, nextPanel) {
  if (!state.done[name]) {
    state.done[name] = true;
    save();
    confetti(24);
  }
  renderProgress();
  if (nextPanel) show(nextPanel);
}

function renderProgress() {
  const dots = $("progressDots");
  dots.innerHTML = "";
  MISSIONS.forEach(m => {
    const s = document.createElement("span");
    if (state.done[m]) s.classList.add("done");
    dots.appendChild(s);
  });
  document.querySelectorAll(".mission-card").forEach(c =>
    c.classList.toggle("completed", !!state.done[c.dataset.mission]));
  renderCert();
}

/* ---------------- Confetti ---------------- */
function confetti(n) {
  const layer = $("confettiLayer");
  const emo = ["🎉", "✨", "🧠", "💚", "🧡", "💜", "⭐"];
  for (let i = 0; i < n; i++) {
    const b = document.createElement("div");
    b.className = "confetti-bit";
    b.textContent = emo[Math.floor(Math.random() * emo.length)];
    b.style.left = Math.random() * 100 + "vw";
    b.style.animationDuration = 1.8 + Math.random() * 1.6 + "s";
    b.style.animationDelay = Math.random() * 0.4 + "s";
    layer.appendChild(b);
    setTimeout(() => b.remove(), 4000);
  }
}

/* ================= MISSION 1: SLOT MACHINE ================= */
let pulls = 0;
const slotOutcomes = [
  { w: 35, text: "😶 Nothing yet. Refresh again?" },
  { w: 20, text: "❤️ 1 like… from your mum." },
  { w: 15, text: "❤️❤️❤️ 3 new likes!" },
  { w: 12, text: "💬 \"cool pic!\" — new comment!" },
  { w: 8,  text: "😢 Nothing. But maybe NOW?" },
  { w: 10, text: "🎉💥 JACKPOT! 12 likes + 2 comments!" },
];
$("slotBtn").addEventListener("click", () => {
  pulls++;
  let r = Math.random() * 100, pick = slotOutcomes[0];
  for (const o of slotOutcomes) { if ((r -= o.w) <= 0) { pick = o; break; } }
  if (pick.text.includes("JACKPOT")) confetti(14);
  const res = $("slotResult");
  res.textContent = "";
  void res.offsetWidth; // restart pop animation
  res.textContent = pick.text;
  $("slotCount").textContent = `You've refreshed ${pulls} time${pulls === 1 ? "" : "s"}…`;
  if (pulls >= 5) $("slotInsight").classList.remove("hidden");
});

/* ---- Trick deck ---- */
const tricks = [
  { emoji: "🌀", name: "Infinite Scroll", trick: "The feed never ends on purpose. A stopping point (like the end of a page) is a moment your brain could say \"done!\" — so they removed it.", power: "Decide WHEN you'll stop before you open the app. Set a timer. Endings are your superpower." },
  { emoji: "🔔", name: "Notifications", trick: "Each buzz is designed to yank your attention back. Even a 1-second glance can hijack the next 20 minutes.", power: "Turn off every notification that isn't a real human talking to YOU. Apps don't miss you — they miss your data." },
  { emoji: "🔥", name: "Streaks", trick: "Streaks make you feel you'll LOSE something if you skip a day. That's fear doing the app's marketing.", power: "Ask: am I opening this because I want to — or because I'm scared of a number resetting?" },
  { emoji: "❤️", name: "Likes & Hearts", trick: "Likes turn friendship into a scoreboard. Your brain treats each one like a tiny prize — and treats silence like rejection.", power: "Real friends > like counts. One actual conversation beats 100 hearts." },
  { emoji: "▶️", name: "Autoplay", trick: "The next video starts before you can decide if you WANT it. The choice is made for you — that's the whole point.", power: "Turn autoplay off in settings. Make every video a choice, not a slide you fall down." },
  { emoji: "🤳", name: "Filtered Faces", trick: "Feeds show everyone's highlight reel — best angle, best moment, filters on. Comparing your normal day to that makes anyone feel worse. Films like Childhood 2.0 show how hard this hits teens.", power: "Remember: you're comparing your behind-the-scenes to their movie trailer. It's not a fair fight — so don't fight it." },
];
$("flipGrid").innerHTML = tricks.map((t, i) => `
  <div class="flip-card" data-i="${i}">
    <div class="flip-inner">
      <div class="flip-face flip-front">
        <span class="ff-emoji">${t.emoji}</span>${t.name}
        <span class="ff-tap">tap to reveal the trick</span>
      </div>
      <div class="flip-face flip-back">
        <div><strong>🪤 The trick:</strong> ${t.trick}
        <div class="fb-power">💪 ${t.power}</div></div>
      </div>
    </div>
  </div>`).join("");
document.querySelectorAll(".flip-card").forEach(c =>
  c.addEventListener("click", () => c.classList.toggle("flipped")));

$("doneHook").addEventListener("click", () => completeMission("hook", "attention"));

/* ================= MISSION 2: TIME CALCULATOR ================= */
const timeSlider = $("timeSlider");
function renderCalc() {
  const mins = +timeSlider.value;
  const h = Math.floor(mins / 60), m = mins % 60;
  $("timeValue").textContent = `${h}h ${m}m / day`;
  $("calcWeek").textContent = Math.round(mins * 7 / 60);
  const daysYear = mins * 365 / 60 / 24;
  $("calcYear").textContent = daysYear.toFixed(1);
  const yearsLife = mins * 365 * 68 / 60 / 24 / 365; // from ~age 12 to 80
  $("calcLife").textContent = yearsLife.toFixed(1);
  let msg;
  if (mins === 0) msg = "Zero? Either you're a legend or the slider is broken. 😄 Try your real number.";
  else if (mins <= 60) msg = `With ${Math.round(mins*365/60)} hours a year, you could still learn to juggle, solo a song on guitar, AND read a book series. Not bad!`;
  else if (mins <= 180) msg = `That's about <strong>${daysYear.toFixed(0)} full days a year</strong> — awake, staring, scrolling. The same hours could make you seriously good at almost anything: football, coding, drawing, chess…`;
  else msg = `Whoa — <strong>${daysYear.toFixed(0)} full days a year</strong>. That's like spending every day of your summer holidays scrolling, without sleeping. Imagine giving even HALF of that to something you'd brag about later.`;
  $("calcInsight").innerHTML = `<h4>⏳ What that adds up to</h4><p>${msg}</p>
  <p class="power-move">💪 <strong>Remember:</strong> the app gets richer with every minute. The question is — what do YOU get?</p>`;
}
timeSlider.addEventListener("input", renderCalc);
renderCalc();
$("doneAttention").addEventListener("click", () => completeMission("attention", "happiness"));

/* ================= MISSION 3: PLATE BUILDER ================= */
/* scores: [enjoyment, satisfaction, meaning] each 0-3 */
const activities = [
  { emoji: "📱", name: "Scroll shorts for 2 hours", s: [0, 0, 0], note: "pleasure, not enjoyment — it evaporates" },
  { emoji: "⚽", name: "Play sport outside with friends", s: [3, 2, 1] },
  { emoji: "🎮", name: "Game online WITH your friends", s: [2, 1, 0] },
  { emoji: "🎸", name: "Practice something hard (music, tricks, code)", s: [1, 3, 1] },
  { emoji: "🍪", name: "Bake or build something with family", s: [3, 2, 2] },
  { emoji: "🤝", name: "Help someone who needs it", s: [1, 2, 3] },
  { emoji: "🛋️", name: "Movie night together (one screen, shared!)", s: [2, 0, 1] },
  { emoji: "🌳", name: "Walk, bike or climb something outdoors", s: [2, 1, 1] },
  { emoji: "😴", name: "Doomscroll alone at midnight", s: [0, 0, 0], note: "steals tomorrow's energy too" },
  { emoji: "📚", name: "Get lost in a book or big idea", s: [1, 1, 2] },
];
let picked = new Set();
$("activityGrid").innerHTML = activities.map((a, i) => `
  <button class="activity" data-i="${i}">
    <span class="a-emoji">${a.emoji}</span><span>${a.name}</span>
  </button>`).join("");
document.querySelectorAll(".activity").forEach(btn => btn.addEventListener("click", () => {
  const i = +btn.dataset.i;
  if (picked.has(i)) picked.delete(i);
  else {
    if (picked.size >= 4) return flashPlate("You've got 4 picks — unpick one to swap! 🔄");
    picked.add(i);
  }
  btn.classList.toggle("picked", picked.has(i));
  renderPlate();
}));
function flashPlate(msg) { $("plateInsight").innerHTML = `<p>${msg}</p>`; }
function renderPlate() {
  let e = 0, s = 0, m = 0;
  picked.forEach(i => { e += activities[i].s[0]; s += activities[i].s[1]; m += activities[i].s[2]; });
  const max = 9; // realistic top score per nutrient with 4 picks
  $("meterEnjoy").style.width = Math.min(100, e / max * 100) + "%";
  $("meterSatisfy").style.width = Math.min(100, s / max * 100) + "%";
  $("meterMeaning").style.width = Math.min(100, m / max * 100) + "%";
  if (picked.size < 4) {
    flashPlate(`Picked ${picked.size} of 4 — keep going! 👆`);
    return;
  }
  const total = e + s + m;
  const zeros = [...picked].filter(i => activities[i].s.every(v => v === 0));
  let verdict;
  if (total === 0) verdict = "🚨 All pleasure, zero nutrients! Fun for 10 minutes, empty by dinner. This is the 'junk food Saturday' — even Dr. Brooks says a LITTLE junk is fine… but this is the whole menu!";
  else if (total >= 18) verdict = "🌟 Chef's kiss! A day with friends, effort AND helping others — that's a day you'll actually remember. This is what the science calls a genuinely happy day.";
  else if (m === 0) verdict = "😊 Fun day! But notice: zero Meaning. Days like this feel good but don't stack up to much. Swap one pick for helping someone and watch what happens.";
  else if (s === 0) verdict = "🙂 Nice and easy — but no Satisfaction. Remember: no struggle, no 'I DID it!' feeling. Add one hard thing and the day levels up.";
  else verdict = "👍 Solid day — you've got some of each nutrient. Balance beats perfection!";
  if (zeros.length && total > 0) verdict += ` (Heads-up: ${zeros.length} of your picks added nothing to any meter. Not evil — just empty calories. 🍬)`;
  $("plateInsight").innerHTML = `<h4>🔬 Lab verdict</h4><p>${verdict}</p>`;
}

/* ---- Traps vs paths ---- */
const idols = [
  { emoji: "💰", name: "Money & stuff", trap: true, why: "Fun to have — but studies show after your needs are met, more stuff barely moves happiness. There's always a newer phone." },
  { emoji: "👨‍👩‍👧", name: "Family bonds", trap: false, why: "The longest happiness study ever run (85+ years!) found close relationships are the #1 predictor of a happy life." },
  { emoji: "🌟", name: "Fame & followers", trap: true, why: "Dr. Brooks calls fame 'the most poisonous' trap — and likes/followers are mini-fame for everyone. It's a thirst that grows the more you drink." },
  { emoji: "🧑‍🤝‍🧑", name: "Real friendship", trap: false, why: "Not 'useful' friends or online mutuals — friends who'd show up at 2am. They're happiness gold." },
  { emoji: "🍭", name: "Nonstop pleasure", trap: true, why: "Pleasure alone (sugar, scrolling, binging) fades in minutes and asks for more. It's the hamster wheel setting of the brain." },
  { emoji: "🔭", name: "Big questions & awe", trap: false, why: "Wondering why we're here, faith, philosophy, staring at stars — zooming OUT makes daily worries shrink." },
  { emoji: "👑", name: "Power & control", trap: true, why: "Bossing people around feels strong but leaves you alone. Nobody queues up to be near a person who needs to win everything." },
  { emoji: "🛠️", name: "Work that helps people", trap: false, why: "Earning your success and making yourself useful to others — that's where lasting satisfaction and meaning hide." },
];
$("idolZone").innerHTML = idols.map((d, i) => `
  <button class="guess-card" data-i="${i}">
    <span class="g-emoji">${d.emoji}</span><strong>${d.name}</strong>
    <span class="g-verdict">${d.trap ? "✨🪤 SHINY TRAP" : "🌳 REAL PATH"}</span>
    <span class="g-reveal">${d.why}</span>
  </button>`).join("");
document.querySelectorAll(".guess-card").forEach(c => c.addEventListener("click", () => {
  const d = idols[+c.dataset.i];
  c.classList.add("revealed", d.trap ? "trap" : "path");
}));

$("doneHappiness").addEventListener("click", () => completeMission("happiness", "quiz"));

/* ================= MISSION 4: QUIZ ================= */
const quiz = [
  { q: "Some apps are deliberately designed by teams of engineers and psychologists to be hard to put down.", fact: true,
    why: "That's the confession at the heart of The Social Dilemma — former tech executives explain that maximizing 'engagement' (your time) is the business model." },
  { q: "If an app is free, nobody is paying for it.", fact: false,
    why: "Advertisers pay — for YOUR attention and data. As The Great Hack puts it: if the product is free, your attention IS the product." },
  { q: "Dopamine is the brain chemical that makes you feel deep happiness.", fact: false,
    why: "Sneaky one! Dopamine is about WANTING and seeking more — not lasting happiness. That's why you can scroll for 2 hours wanting more and still feel meh after." },
  { q: "Not knowing what you'll get (a like? nothing?) makes you check MORE than a guaranteed reward would.", fact: true,
    why: "Variable rewards — the slot machine trick. Unpredictable prizes are the strongest known hook for a brain." },
  { q: "The joy of achieving something you worked hard for lasts forever.", fact: false,
    why: "Satisfaction fades — Dr. Brooks calls endlessly chasing it the 'striver's curse.' The fix isn't to stop trying; it's to enjoy the climb, not just the summit." },
  { q: "Real enjoyment usually needs other people and makes a memory.", fact: true,
    why: "Brooks' formula: enjoyment = pleasure + people + memory. That's why pizza with friends beats pizza alone with a screen." },
  { q: "Being bored sometimes is bad for your brain.", fact: false,
    why: "Boredom is where daydreams, ideas and big questions live! If every bored second gets filled by a phone, your imagination never gets the room to stretch." },
  { q: "Feeling sad or anxious sometimes means something is wrong with you.", fact: false,
    why: "Everyone has negative emotions — they're information, not malfunction. Happy people aren't happy 24/7; they just don't panic about a rainy day inside." },
  { q: "An 85-year study found that good relationships are the strongest predictor of a happy, healthy life.", fact: true,
    why: "The Harvard Study of Adult Development — running since 1938! Not money, not fame: relationships. Every hour with people you love is an investment." },
  { q: "The algorithm picks the next video because it's the best one for you.", fact: false,
    why: "It picks whatever keeps you watching longest — which is often whatever is most dramatic, extreme, or impossible to look away from. 'Gripping' and 'good for you' are very different things." },
];
let qi = 0, qScore = 0, qAnswered = false;
function renderQuiz() {
  if (qi >= quiz.length) return endQuiz();
  qAnswered = false;
  $("quizProgress").textContent = `Question ${qi + 1} of ${quiz.length} · Score: ${qScore}`;
  $("quizQuestion").textContent = quiz[qi].q;
  $("quizFeedback").classList.add("hidden");
  $("quizNext").classList.add("hidden");
  $("btnMyth").disabled = $("btnFact").disabled = false;
}
function answer(saidFact) {
  if (qAnswered) return;
  qAnswered = true;
  const item = quiz[qi];
  const right = saidFact === item.fact;
  if (right) { qScore++; }
  const fb = $("quizFeedback");
  fb.className = "quiz-feedback " + (right ? "correct" : "wrong");
  fb.innerHTML = `<strong>${right ? "🎉 Correct!" : "❌ Not quite —"} it's a ${item.fact ? "FACT" : "MYTH"}.</strong>${item.why}`;
  fb.classList.remove("hidden");
  $("quizNext").classList.remove("hidden");
  $("btnMyth").disabled = $("btnFact").disabled = true;
  $("quizProgress").textContent = `Question ${qi + 1} of ${quiz.length} · Score: ${qScore}`;
}
$("btnMyth").addEventListener("click", () => answer(false));
$("btnFact").addEventListener("click", () => answer(true));
$("quizNext").addEventListener("click", () => { qi++; renderQuiz(); });
function endQuiz() {
  $("quizCard").classList.add("hidden");
  const r = $("quizResult");
  let title, note;
  if (qScore >= 9) { title = "🧠👑 Brain Scientist!"; note = "You could teach this class. Seriously — go quiz your parents."; confetti(30); }
  else if (qScore >= 7) { title = "🔬 Lab Expert!"; note = "Excellent work — the tricks can't fool you anymore."; confetti(20); }
  else if (qScore >= 5) { title = "🧪 Junior Researcher"; note = "Solid! Revisit Missions 1–3 and you'll ace a retake."; }
  else { title = "🥼 New Recruit"; note = "The tricky ones got you — which means you learned the most! Try again anytime."; }
  r.innerHTML = `<div class="result-big">${qScore} / ${quiz.length}</div>
    <div class="result-title">${title}</div>
    <p class="result-note">${note}</p>
    <div style="text-align:center; margin-top:14px">
      <button class="btn btn-ghost" id="quizRetry">↻ Try again</button>
      <button class="btn btn-big" id="quizDone">Mission 4 complete → Mission 5 ⚖️</button>
    </div>`;
  r.classList.remove("hidden");
  $("quizRetry").addEventListener("click", () => {
    qi = 0; qScore = 0;
    r.classList.add("hidden");
    $("quizCard").classList.remove("hidden");
    renderQuiz();
  });
  $("quizDone").addEventListener("click", () => completeMission("quiz", "sorter"));
}
renderQuiz();

/* ================= MISSION 5: SORTER ================= */
const sorterItems = [
  { t: "Video-calling your grandparents who live far away", tool: true, why: "Screens shrinking distance between people who love each other — technology at its absolute best." },
  { t: "It's midnight. 'Just one more' short video. For the 40th time.", tool: false, why: "Autoplay + infinite scroll + tired brain = the trap at full power. Tomorrow-you pays the bill." },
  { t: "Following a YouTube tutorial to learn guitar chords", tool: true, why: "You chose it, you're building a skill, you'll be glad in an hour. Triple tool. 🎸" },
  { t: "Checking how many likes your post got — for the 9th time this hour", tool: false, why: "That's the slot machine pulling YOU. The post won't change; the checking is the hook." },
  { t: "Using a map app to plan a bike adventure with friends", tool: true, why: "Tech that launches you OUT the door and toward real people — tool, every time." },
  { t: "Scrolling a feed of impossibly perfect people and feeling worse about yourself", tool: false, why: "Childhood 2.0 shows exactly this: comparing your real life to highlight reels quietly drains confidence. Unfollow accounts that make you feel small." },
  { t: "Making a movie / animation / game WITH your friends", tool: true, why: "Creating beats consuming. You're using the screen as a workshop, not a couch." },
  { t: "Keeping a streak alive with someone you don't even talk to anymore", tool: false, why: "That's not friendship — that's two people serving a number. The app wins, nobody else does." },
  { t: "Looking up 'why is the sky blue' because you actually wondered", tool: true, why: "Curiosity → answer → smarter you. The whole internet's best use in one move." },
  { t: "Phone on the table during dinner, 'just in case'", tool: false, why: "Studies show a visible phone — even face down, even off — makes conversation shallower. It whispers 'I might be more interesting than you.' Banish it at meals!" },
];
let si = 0, sScore = 0, sAnswered = false;
function renderSorter() {
  if (si >= sorterItems.length) return endSorter();
  sAnswered = false;
  $("sorterProgress").textContent = `Situation ${si + 1} of ${sorterItems.length} · Score: ${sScore}`;
  $("sorterItem").textContent = sorterItems[si].t;
  $("sorterFeedback").classList.add("hidden");
  $("sorterNext").classList.add("hidden");
  $("btnTool").disabled = $("btnTrap").disabled = false;
}
function answerSorter(saidTool) {
  if (sAnswered) return;
  sAnswered = true;
  const item = sorterItems[si];
  const right = saidTool === item.tool;
  if (right) sScore++;
  const fb = $("sorterFeedback");
  fb.className = "quiz-feedback " + (right ? "correct" : "wrong");
  fb.innerHTML = `<strong>${right ? "🎉 Nailed it!" : "🤔 Hmm —"} that one's a ${item.tool ? "🛠️ TOOL" : "🪤 TRAP"}.</strong>${item.why}`;
  fb.classList.remove("hidden");
  $("sorterNext").classList.remove("hidden");
  $("btnTool").disabled = $("btnTrap").disabled = true;
  $("sorterProgress").textContent = `Situation ${si + 1} of ${sorterItems.length} · Score: ${sScore}`;
}
$("btnTool").addEventListener("click", () => answerSorter(true));
$("btnTrap").addEventListener("click", () => answerSorter(false));
$("sorterNext").addEventListener("click", () => { si++; renderSorter(); });
function endSorter() {
  document.querySelector(".sorter-card").classList.add("hidden");
  const r = $("sorterResult");
  const perfect = sScore === sorterItems.length;
  if (sScore >= 8) confetti(20);
  r.innerHTML = `<div class="result-big">${sScore} / ${sorterItems.length}</div>
    <div class="result-title">${perfect ? "⚖️👑 Master of the Compass!" : sScore >= 8 ? "🧭 Sharp Sorter!" : "🧭 Getting there!"}</div>
    <p class="result-note">The skill you just practiced — asking "am I using it, or is it using me?" — is the single most useful tech habit on Earth. Use it daily!</p>
    <div style="text-align:center; margin-top:14px">
      <button class="btn btn-ghost" id="sorterRetry">↻ Sort again</button>
      <button class="btn btn-big" id="sorterDone">Mission 5 complete → Mission 6 🔥</button>
    </div>`;
  r.classList.remove("hidden");
  $("sorterRetry").addEventListener("click", () => {
    si = 0; sScore = 0;
    r.classList.add("hidden");
    document.querySelector(".sorter-card").classList.remove("hidden");
    renderSorter();
  });
  $("sorterDone").addEventListener("click", () => completeMission("sorter", "challenges"));
}
renderSorter();

/* ================= MISSION 6: CHALLENGES ================= */
const challenges = [
  { id: "dinner", emoji: "🍽️", name: "Phone-free dinner", desc: "One whole meal, all phones in another room — grown-ups included. Talk about the best and worst part of everyone's day." },
  { id: "gratitude", emoji: "🙏", name: "The 3-good-things trick", desc: "Before bed, say (or write) 3 things that went well today. Proven to lift mood in about a week. Weirdly powerful." },
  { id: "outside", emoji: "🌳", name: "One hour outside", desc: "Move your body outdoors — sport, walk, climb, anything. Nature + movement is the oldest happiness medicine there is." },
  { id: "irl", emoji: "🧑‍🤝‍🧑", name: "Turn online into in-person", desc: "Message a friend… to arrange actually meeting up. Use the phone as a bridge, not an island." },
  { id: "morning", emoji: "🌅", name: "Own your first hour", desc: "One morning, don't touch your phone for the first hour after waking. Notice who's in charge — you or it." },
  { id: "hard", emoji: "🧗", name: "Do one hard thing", desc: "Practice something at the edge of your ability for 30 minutes. Feel the 'I DID it' — that's Satisfaction, the second happiness nutrient." },
  { id: "help", emoji: "💝", name: "Secret mission: help someone", desc: "Do something kind and don't get caught. Helping others is the fastest known happiness boost — and secrecy makes it a game." },
];
function renderChallenges() {
  $("challengeList").innerHTML = challenges.map(c => `
    <label class="challenge ${state.challenges[c.id] ? "done" : ""}">
      <input type="checkbox" data-id="${c.id}" ${state.challenges[c.id] ? "checked" : ""}>
      <div class="ch-body"><strong>${c.emoji} ${c.name}</strong><span>${c.desc}</span></div>
    </label>`).join("");
  const done = challenges.filter(c => state.challenges[c.id]).length;
  $("challengeMeter").style.width = (done / challenges.length * 100) + "%";
  $("challengeStatus").textContent = done === challenges.length
    ? "🏆 ALL 7 DONE! You're officially running happiness experiments like a pro!"
    : `${done} of ${challenges.length} experiments done`;
  document.querySelectorAll("#challengeList input").forEach(cb =>
    cb.addEventListener("change", () => {
      state.challenges[cb.dataset.id] = cb.checked;
      save();
      if (cb.checked) confetti(8);
      renderChallenges();
    }));
}
renderChallenges();
$("doneChallenges").addEventListener("click", () => completeMission("challenges", "home"));

/* ================= MOVIES ================= */
const movies = [
  { emoji: "🎰", title: "The Social Dilemma", year: 2020, grad: "linear-gradient(150deg,#1a1b2e,#c92a2a)", age: "Great for 12+ · fine for 10+ with a parent",
    why: "The people who BUILT social media explain how it's designed to maximize engagement — notifications, algorithms, infinite scroll. Many parents say it's the first time their teens understood why it's so hard to put the phone down.",
    talk: ["Which trick from the film have you caught happening to YOU?", "If you designed an app, would you use these tricks? Where's the line?", "The insiders don't let their own kids use these apps much. What does that tell us?"] },
  { emoji: "🧒", title: "Childhood 2.0", year: 2020, grad: "linear-gradient(150deg,#0b3d91,#364fc7)", age: "13+ · covers heavy topics (bullying, anxiety)",
    why: "Real teenagers share their experiences with anxiety, cyberbullying and social media pressure. Sometimes another teenager's story lands harder than any parent's warning.",
    talk: ["Did any teen's story sound like someone you know?", "What would you do if a friend was being targeted online?", "What's one thing adults just don't get about growing up online?"] },
  { emoji: "🍼", title: "Screened Out", year: 2016, grad: "linear-gradient(150deg,#0c8599,#15aabf)", age: "Good for the whole family, 10+",
    why: "Explains dopamine, screen addiction, and how technology affects developing brains — with science, not fear. Understanding the habit is the first step to changing it.",
    talk: ["After watching: what IS dopamine, in your own words?", "Which family habit would be easiest to change first?", "Do the adults in our house have screen habits too? 👀"] },
  { emoji: "👨‍👩‍👧‍👦", title: "Screenagers", year: 2016, grad: "linear-gradient(150deg,#e8590c,#fab005)", age: "Made FOR families, 10+",
    why: "A doctor-filmmaker follows real families navigating screen time. Nobody is the villain — it shows how honest conversations work better than constant arguments.",
    talk: ["What rule from the film would actually work in OUR house?", "What do the kids in the film wish their parents did differently?", "Can we write our family pledge right after this one?"] },
  { emoji: "🕵️", title: "The Great Hack", year: 2019, grad: "linear-gradient(150deg,#212529,#5f3dc4)", age: "Best for 13+ · involves politics & data",
    why: "How data from millions of Facebook users was collected and used by Cambridge Analytica. The big lesson: if a platform is free, your attention may be part of the product.",
    talk: ["What does 'your data' actually mean — what do apps know about you?", "Is it fair to trade personal data for a free app? Would you pay instead?", "How could someone use YOUR data to change what you think?"] },
  { emoji: "💬", title: "Liberated", year: 2017, grad: "linear-gradient(150deg,#a61e4d,#e64980)", age: "Parents watch FIRST · mature themes, 16+",
    why: "Explores how social media and online culture shape teens' views of relationships, identity and intimacy. Its goal isn't to shock — it's to start conversations many families avoid.",
    talk: ["(For older teens) How does online culture say you 'should' look and act?", "Where do those ideas actually come from — and who profits from them?", "What's the difference between how people act online and who they really are?"] },
];
$("movieGrid").innerHTML = movies.map(m => `
  <div class="card movie-card">
    <div class="movie-poster" style="background:${m.grad}">
      <span class="mp-emoji">${m.emoji}</span>${m.title}
    </div>
    <div class="movie-meta">${m.year} · Documentary</div>
    <span class="age-note">👪 ${m.age}</span>
    <p>${m.why}</p>
    <details>
      <summary>💬 Talk about it after</summary>
      <ul>${m.talk.map(t => `<li>${t}</li>`).join("")}</ul>
    </details>
  </div>`).join("");

/* ================= PLEDGE ================= */
const kidPledges = [
  "No phone at family meals — it stays in another room",
  "Screens off 1 hour before sleep (my brain needs the wind-down)",
  "When I catch a trick (streak, autoplay, refresh-itis), I'll name it out loud",
  "I'll turn off notifications that aren't real people talking to me",
  "If something online makes me feel bad or scared, I'll tell a grown-up — no secrets, no trouble",
  "I'll do one screen-free thing I love every day",
];
const adultPledges = [
  "No phone at family meals — mine goes in the other room too",
  "No scrolling while my kid is talking to me — eyes up, phone down",
  "I'll ask about your online world with curiosity, not interrogation 🕵️❌",
  "If you tell me something scary happened online, I'll stay calm and help — not explode or just confiscate",
  "We'll watch one documentary together and I'll actually discuss it",
  "I'll admit when I'm hooked too — same rules, same team",
];
function pledgeHTML(list, prefix) {
  return list.map((p, i) => `
    <label class="pledge-item"><input type="checkbox" id="${prefix}${i}" checked><span>${p}</span></label>`).join("");
}
$("kidPledges").innerHTML = pledgeHTML(kidPledges, "kp");
$("adultPledges").innerHTML = pledgeHTML(adultPledges, "ap");
$("makePledge").addEventListener("click", () => {
  const kids = $("kidNames").value.trim() || "The Kids";
  const adults = $("adultNames").value.trim() || "The Grown-ups";
  const kSel = kidPledges.filter((_, i) => $("kp" + i).checked);
  const aSel = adultPledges.filter((_, i) => $("ap" + i).checked);
  if (!kSel.length && !aSel.length) return;
  $("pledgeText").innerHTML = `
    <h4>🧒 ${escapeHTML(kids)} promise:</h4><ul>${kSel.map(p => `<li>${p}</li>`).join("")}</ul>
    <h4>🧑‍🦱 ${escapeHTML(adults)} promise:</h4><ul>${aSel.map(p => `<li>${p}</li>`).join("")}</ul>
    <p class="pledge-sign">Signed: ${escapeHTML(kids)} ✍️ &nbsp;&amp;&nbsp; ${escapeHTML(adults)} ✍️</p>
    <p>We're on the same team: humans first, screens second. 🧠❤️</p>`;
  $("pledgeDate").textContent = "Pledged on " + new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
  $("pledgeOut").classList.remove("hidden");
  $("pledgeOut").scrollIntoView({ behavior: "smooth" });
  confetti(24);
});
function escapeHTML(s) {
  return s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

/* ================= CERTIFICATE ================= */
function renderCert() {
  const allDone = MISSIONS.every(m => state.done[m]);
  if (allDone) {
    $("certStatus").textContent = "🎉 All 6 missions complete! Claim your certificate:";
    $("certUnlock").classList.remove("hidden");
  } else {
    const left = MISSIONS.filter(m => !state.done[m]).length;
    $("certStatus").textContent = `Complete all 6 missions to unlock your certificate — ${left} to go!`;
  }
}
$("certBtn").addEventListener("click", () => {
  const name = $("certName").value.trim();
  if (!name) return;
  $("certNameOut").textContent = name;
  $("certDate").textContent = "Awarded on " + new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
  $("certificate").classList.remove("hidden");
  confetti(40);
});

/* ---------------- Init ---------------- */
renderProgress();
show("home");
