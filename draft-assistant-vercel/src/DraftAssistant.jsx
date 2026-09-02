import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Settings, RotateCcw, Search, TrendingUp, TrendingDown, Users, ClipboardList, Trophy, ChevronDown, ChevronUp, X, Shuffle, ArrowLeftRight, FastForward, Star } from "lucide-react";

/* ---------------------------------------------------------
   PLAYER POOL — 2026 half-PPR-adjacent consensus ADP
   (adp = overall average draft position, sd = std deviation
   across mock drafts; higher sd = wider outcome range/"upside")
--------------------------------------------------------- */
const RAW_PLAYERS = [
["Jahmyr Gibbs","RB","DET",6,1.5,0.7],["Bijan Robinson","RB","ATL",11,2.3,0.7],
["Puka Nacua","WR","LAR",11,2.8,0.9],["Ja'Marr Chase","WR","CIN",6,3.9,1.0],
["Jaxon Smith-Njigba","WR","SEA",11,5.5,1.2],["Christian McCaffrey","RB","SF",8,6.5,1.6],
["Amon-Ra St. Brown","WR","DET",6,6.5,1.3],["Jonathan Taylor","RB","IND",13,7.4,1.7],
["De'Von Achane","RB","MIA",6,10.1,1.9],["CeeDee Lamb","WR","DAL",14,10.2,1.8],
["Justin Jefferson","WR","MIN",6,11.7,2.2],["James Cook III","RB","BUF",7,11.7,2.7],
["Drake London","WR","ATL",11,12.9,2.0],["Chase Brown","RB","CIN",6,13.1,2.5],
["Rashee Rice","WR","KC",5,16.4,2.5],["Derrick Henry","RB","BAL",13,16.4,2.4],
["A.J. Brown","WR","NE",11,16.9,2.7],["Saquon Barkley","RB","PHI",10,18.7,3.4],
["Chris Olave","WR","NO",8,19.3,2.9],["George Pickens","WR","DAL",14,19.7,3.0],
["Ashton Jeanty","RB","LV",13,20.5,3.7],["Nico Collins","WR","HOU",8,21.3,3.0],
["Kenneth Walker III","RB","KC",5,21.4,3.9],["Omarion Hampton","RB","LAC",7,22.5,4.2],
["Zay Flowers","WR","BAL",13,25.6,3.6],["Malik Nabers","WR","NYG",8,26.6,3.6],
["Garrett Wilson","WR","NYJ",13,27.1,3.4],["Jeremiyah Love","RB","ARI",14,27.6,3.5],
["Trey McBride","TE","ARI",14,29.1,4.5],["DeVonta Smith","WR","PHI",10,29.4,3.4],
["Tetairoa McMillan","WR","CAR",5,31.4,3.4],["Kyren Williams","RB","LAR",11,31.7,4.0],
["Breece Hall","RB","NYJ",13,32.7,4.0],["Josh Allen","QB","BUF",7,33.3,8.3],
["Brock Bowers","TE","LV",13,34.6,7.2],["Emeka Egbuka","WR","TB",10,35.5,4.1],
["Tee Higgins","WR","CIN",6,35.7,4.6],["Javonte Williams","RB","DAL",14,36.3,5.0],
["Travis Etienne Jr.","RB","NO",8,37.9,5.1],["Ladd McConkey","WR","LAC",7,37.9,4.5],
["Cam Skattebo","RB","NYG",8,40.6,5.3],["Davante Adams","WR","LAR",11,41.8,4.9],
["Josh Jacobs","RB","GB",11,43.2,22.5],["Jaylen Waddle","WR","DEN",10,44.4,5.0],
["D'Andre Swift","RB","CHI",10,44.7,4.7],["Jameson Williams","WR","DET",6,45.3,4.5],
["Bucky Irving","RB","TB",10,46.3,5.6],["DJ Moore","WR","BUF",7,47.6,6.2],
["Terry McLaurin","WR","WAS",7,48.5,5.1],["Quinshon Judkins","RB","CLE",11,50.9,5.4],
["Drake Maye","QB","NE",11,51.6,8.8],["Bhayshul Tuten","RB","JAX",7,54.1,5.7],
["Luther Burden III","WR","CHI",10,54.2,6.4],["Rome Odunze","WR","CHI",10,54.4,5.8],
["Mike Evans","WR","SF",8,54.7,6.1],["Colston Loveland","TE","CHI",10,55.2,9.5],
["Joe Burrow","QB","CIN",6,56.0,8.4],["David Montgomery","RB","HOU",8,56.4,6.5],
["Lamar Jackson","QB","BAL",13,57.2,8.4],["Christian Watson","WR","GB",11,58.1,6.6],
["Courtland Sutton","WR","DEN",10,61.1,6.7],["Rhamondre Stevenson","RB","NE",11,62.1,6.5],
["Jaylen Warren","RB","PIT",9,62.8,5.3],["Parker Washington","WR","JAX",7,63.2,7.8],
["Marvin Harrison Jr.","WR","ARI",14,63.6,7.2],["TreVeyon Henderson","RB","NE",11,64.5,6.1],
["Dak Prescott","QB","DAL",14,65.2,7.9],["Tyler Warren","TE","IND",13,65.4,8.4],
["DK Metcalf","WR","PIT",9,66.6,7.4],["Tony Pollard","RB","TEN",9,69.3,6.3],
["Alec Pierce","WR","IND",13,69.7,6.9],["Brian Thomas Jr.","WR","JAX",7,72.6,7.3],
["Jayden Daniels","QB","WAS",7,73.6,11.6],["Jadarian Price","RB","SEA",11,73.6,10.6],
["Michael Wilson","WR","ARI",14,74.7,7.8],["Rico Dowdle","RB","PIT",9,74.8,8.1],
["Harold Fannin Jr.","TE","CLE",11,75.0,9.8],["Matthew Stafford","QB","LAR",11,75.5,12.8],
["Michael Pittman Jr.","WR","PIT",9,76.4,7.4],["Jalen Hurts","QB","PHI",10,78.7,11.5],
["Chris Godwin Jr.","WR","TB",10,78.9,8.1],["Carnell Tate","WR","TEN",9,79.6,8.3],
["Kyle Pitts Sr.","TE","ATL",11,80.2,10.7],["Seattle Defense","DEF","SEA",11,81.2,8.6],
["Chuba Hubbard","RB","CAR",5,83.4,9.6],["Wan'Dale Robinson","WR","TEN",9,86.5,8.3],
["Brock Purdy","QB","SF",8,86.5,11.8],["Jakobi Meyers","WR","JAX",7,87.0,7.0],
["Denver Defense","DEF","DEN",10,87.2,7.6],["Caleb Williams","QB","CHI",10,88.3,12.5],
["J.K. Dobbins","RB","DEN",10,88.3,10.8],["Josh Downs","WR","IND",13,90.2,9.1],
["Kenny Gainwell","RB","TB",10,91.4,10.9],["Trevor Lawrence","QB","JAX",7,92.4,12.0],
["Jayden Reed","WR","GB",11,92.9,8.7],["Stefon Diggs","WR","WAS",7,92.9,9.1],
["George Kittle","TE","SF",8,93.4,17.1],["Jonathon Brooks","RB","CAR",5,93.6,12.7],
["Quentin Johnston","WR","LAC",7,95.4,9.9],["RJ Harvey","RB","DEN",10,95.4,12.0],
["Jordan Addison","WR","MIN",6,96.9,8.9],["Houston Defense","DEF","HOU",8,97.6,9.6],
["Tucker Kraft","TE","GB",11,101.4,18.9],["Jared Goff","QB","DET",6,102.1,12.9],
["Khalil Shakir","WR","BUF",7,102.4,8.0],["Patrick Mahomes","QB","KC",5,103.7,13.1],
["Justin Herbert","QB","LAC",7,104.7,13.5],["Xavier Worthy","WR","KC",5,105.2,8.7],
["LA Rams Defense","DEF","LAR",11,106.0,12.3],["Aaron Jones Sr.","RB","MIN",6,106.0,11.8],
["Travis Kelce","TE","KC",5,107.1,21.4],["Matthew Golden","WR","GB",11,107.6,9.9],
["Romeo Doubs","WR","NE",11,108.6,9.2],["Deebo Samuel Sr.","WR","SF",8,110.8,8.0],
["Kyle Monangai","RB","CHI",10,111.1,13.0],["Dallas Goedert","TE","PHI",10,111.9,21.2],
["Sam LaPorta","TE","DET",6,112.0,19.9],["Bo Nix","QB","DEN",10,112.3,13.0],
["Minnesota Defense","DEF","MIN",6,112.7,9.9],["Jordan Mason","RB","MIN",6,114.5,16.3],
["Jacory Croskey-Merritt","RB","WAS",7,114.9,13.5],["Rachaad White","RB","WAS",7,116.5,14.9],
["KC Concepcion","WR","CLE",11,118.7,10.4],["Jaxson Dart","QB","NYG",8,119.0,11.6],
["Jalen Coker","WR","CAR",5,121.3,8.6],["Blake Corum","RB","LAR",11,122.6,16.0],
["De'Zhaun Stribling","WR","SF",8,126.6,17.6],["Makai Lemon","WR","PHI",10,126.6,14.3],
["Rashid Shaheed","WR","SEA",11,128.2,11.1],["Brandon Aubrey","K","DAL",14,128.6,22.3],
["Detroit Defense","DEF","DET",6,129.3,11.9],["Jerry Jeudy","WR","CLE",11,129.5,10.1],
["Baker Mayfield","QB","TB",10,129.9,10.1],["Tyjae Spears","RB","TEN",9,130.1,13.8],
["New England Defense","DEF","NE",11,130.1,15.2],["MarShawn Lloyd","RB","GB",11,130.5,30.2],
["Tre Tucker","WR","LV",13,131.0,9.4],["Mark Andrews","TE","BAL",13,131.5,14.4],
["Jake Ferguson","TE","DAL",14,133.2,16.6],["Keenan Allen","WR","IND",13,133.8,11.0],
["Philadelphia Defense","DEF","PHI",10,133.9,17.9],["Kyler Murray","QB","MIN",6,134.1,11.6],
["Zach Charbonnet","RB","SEA",11,134.6,18.5],["Denzel Boston","WR","CLE",11,135.7,12.7],
["Ka'imi Fairbairn","K","HOU",8,136.0,18.5],["Tyler Shough","QB","NO",8,136.3,9.1],
["Isaiah Likely","TE","NYG",8,136.7,18.3],["Jalen McMillan","WR","TB",10,136.7,11.3],
["Jason Myers","K","SEA",11,136.8,17.9],["Pittsburgh Defense","DEF","PIT",9,137.9,13.3],
["Woody Marks","RB","HOU",8,140.3,16.2],["LA Chargers Defense","DEF","LAC",7,142.4,13.7],
["Jordan Love","QB","GB",11,142.5,12.4],["Cameron Dicker","K","LAC",7,144.1,20.6],
["Jauan Jennings","WR","MIN",6,144.8,14.9],["Sam Darnold","QB","SEA",11,146.0,11.2],
["Dalton Kincaid","TE","BUF",7,147.1,19.6],["Mike Washington Jr.","RB","LV",13,148.5,24.3],
["Harrison Mevis","K","LAR",11,148.7,17.7],["Jake Bates","K","DET",6,148.8,18.2],
["Malik Washington","WR","MIA",6,149.7,13.9],["Chris Boswell","K","PIT",9,150.9,16.0],
["Jonah Coleman","RB","DEN",10,151.7,22.5],["Calvin Ridley","WR","TEN",9,152.5,12.4],
["Chase McLaughlin","K","TB",10,152.6,19.3],["Juwan Johnson","TE","NO",8,152.7,16.4],
["Cam Little","K","JAX",7,153.2,17.0],["Jacksonville Defense","DEF","JAX",7,153.9,16.2],
["Alvin Kamara","RB","NO",8,154.1,16.7],["Braelon Allen","RB","NYJ",13,155.2,23.6],
["Tyler Allgeier","RB","ARI",14,155.3,20.9],["Najee Harris","RB","NYG",8,155.6,29.1],
["Tyler Loop","K","BAL",13,156.2,17.7],["Tyrone Tracy Jr.","RB","NYG",8,156.3,17.6],
["Isiah Pacheco","RB","DET",6,156.4,17.9],["Rashod Bateman","WR","BAL",13,156.5,12.4],
["Brian Robinson","RB","ATL",11,157.0,23.5],["Jordyn Tyson","WR","NO",8,157.2,15.1],
["Cooper Kupp","WR","SEA",11,157.4,14.9],["Keaton Mitchell","RB","LAC",7,158.3,19.9],
["Green Bay Defense","DEF","GB",11,158.4,19.4],["Tank Bigsby","RB","PHI",10,159.0,23.5],
["C.J. Stroud","QB","HOU",8,159.2,10.1],["Atlanta Defense","DEF","ATL",11,159.7,12.0],
["Hunter Henry","TE","NE",11,159.8,19.0],["Kayshon Boutte","WR","HOU",8,160.3,15.6],
["Kenyon Sadiq","TE","NYJ",13,160.4,22.5],["Malik Willis","QB","MIA",6,160.4,13.5],
["Dylan Sampson","RB","CLE",11,160.6,15.4],["James Conner","RB","ARI",14,160.7,35.2],
["Wil Lutz","K","DEN",10,161.0,16.6],["Cleveland Defense","DEF","CLE",11,161.8,15.0],
["Dalton Schultz","TE","HOU",8,161.9,20.5],["Dallas Defense","DEF","DAL",14,161.9,25.7],
["Buffalo Defense","DEF","BUF",7,162.0,14.5],["Tank Dell","WR","HOU",8,162.1,16.9],
["Harrison Butker","K","KC",5,162.2,18.8],["Travis Hunter","WR","JAX",7,163.6,15.2],
["Terrance Ferguson","TE","LAR",11,164.0,16.7],["T.J. Hockenson","TE","MIN",6,167.9,24.8],
];

/* ---------------------------------------------------------
   ANALYST UPSIDE NOTES — curated from 2026 preseason coverage
   (breakout calls, "do draft"/undervalued lists, situational
   changes). These are qualitative signals for "worth reaching",
   distinct from the sd-based statistical volatility tag.
--------------------------------------------------------- */
const UPSIDE_NOTES = {
  "Jordan Love": { tag: "Analyst pick", note: "One prominent analyst ranks him well above consensus and often takes him a full round early, betting he beats his ADP." },
  "Jared Goff": { tag: "Undervalued", note: "Finished as a top-10 fantasy QB in each of the last four seasons, yet is going as the 16th QB off the board." },
  "Kyler Murray": { tag: "Undervalued", note: "New home in Minnesota; seen as a strong value for managers willing to wait on QB." },
  "Derrick Henry": { tag: "Undervalued", note: "Repeatedly named on 'undervalued' lists heading into 2026 despite his round-2 ADP; volume expected to hold up in a run-heavy scheme." },
  "Patrick Mahomes": { tag: "Undervalued", note: "Still going in the double-digit rounds despite expectations of a bounce-back, high-volume passing season." },
  "Baker Mayfield": { tag: "Undervalued", note: "Graded as a legitimate fantasy difference-maker, ranked above other QBs going around the same time." },
  "Tyler Shough": { tag: "Late-round flier", note: "Named as one of the top late-round QB dart-throws for 2026." },
  "Malik Willis": { tag: "Breakout watch", note: "Newly installed as Miami's starter; his rushing ability gives him a real fantasy floor if the offense holds up." },
  "Jadarian Price": { tag: "Value", note: "Seen as a bargain next to a similarly-situated rookie back who is going about five rounds earlier." },
  "Omarion Hampton": { tag: "Analyst pick", note: "A model with a strong recent track record on breakouts ranks him ahead of two backs who currently go before him." },
  "Carnell Tate": { tag: "Breakout watch", note: "Named among 2026 breakout candidates poised to follow a similar path to last year's hits." },
  "Jaxson Dart": { tag: "Breakout watch", note: "Named among 2026 breakout candidates as he takes over a starting role." },
  "Emeka Egbuka": { tag: "Breakout watch", note: "Named among 2026 breakout candidates for a expanded role in year two." },
  "Travis Hunter": { tag: "Late-round flier", note: "Flagged as a second-year, Day 1-drafted receiver — a profile that often outproduces its late ADP." },
};

/* ---------------------------------------------------------
   EXPERT FLAGS — IMPORTANT LIMITATION: FantasyPros' expert-vs-
   consensus comparison tool (which shows numeric rank diffs) is
   JavaScript-rendered and could not be reliably read by this
   tool, so no fabricated numeric "diff" values are used here.
   The entries below come only from verified prose in FantasyPros'
   own retrospective article on 2025's most accurate draft ranker
   (Seth Miller), describing which players he rated well above
   consensus — confirmed as a real, correct call for that season.
   This is a track-record signal, not a live 2026 board pull;
   treat it as "this ranker's type of player," not gospel.
--------------------------------------------------------- */
/* ---------------------------------------------------------
   EXPERT FLAGS — two tiers, kept visually distinct in the UI:
   🚩 "like" flags come from FantasyPros' confirmed top
   multi-year/2025 accuracy leaderboard (Seth Miller, Sean
   Koerner, Jared Smola) — verified from their own bylined
   articles, not from unreadable JS-rendered comparison tools.
   ⚠️ "risk" flags come from Eric Karabell's ESPN "Do Not Draft"
   column (confirmed bylined, Aug 6 2026) — a well-known, widely
   read analyst, but NOT on the accuracy leaderboard, so these
   are labeled separately and should carry less weight than the
   🚩 tags when the two disagree.
--------------------------------------------------------- */
const EXPERT_FLAGS = {
  "George Pickens": [{ expert: "Seth Miller", type: "like", note: "2025's #1 most accurate draft ranker rated him well above consensus — and it paid off." }],
  "Courtland Sutton": [{ expert: "Seth Miller", type: "like", note: "2025's #1 most accurate draft ranker rated him well above consensus — and it paid off." }],
  "Jaylen Waddle": [{ expert: "Seth Miller", type: "like", note: "2025's #1 most accurate draft ranker rated him well above consensus — and it paid off." }],
  "Justin Herbert": [{ expert: "Seth Miller", type: "like", note: "2025's #2-ranked QB accuracy expert rated him well above consensus — and it paid off." }],
  "Trevor Lawrence": [{ expert: "Sean Koerner", type: "like", note: "Rates him right alongside Jalen Hurts on pure value, despite Lawrence typically going about 30 picks later — a buy-before-the-market-catches-on signal from a top multi-year accurate ranker." }],
  "Jordan Mason": [{ expert: "Jared Smola", type: "like", note: "Draft Sharks' #9-accuracy-ranked analyst names him a 2026 sleeper — new scheme fit and a bigger role ahead of a declining Aaron Jones." }],
  "De'Zhaun Stribling": [{ expert: "Jared Smola", type: "like", note: "Draft Sharks' #9-accuracy-ranked analyst names him a 2026 sleeper, arguing the 49ers' rookie-WR profile is being underrated after the draft." }],
  "Malik Nabers": [{ expert: "Eric Karabell (ESPN, not on accuracy leaderboard)", type: "risk", note: "Flagged for a lingering knee injury (follow-up procedure this spring) and reports he may open the season on a snap limit — his ADP hasn't dropped to reflect that risk." }],
  "Christian McCaffrey": [{ expert: "Eric Karabell (ESPN, not on accuracy leaderboard)", type: "risk", note: "After a 900+ snap, 400+ touch workload in 2025, flagged as a regression risk — no RB with a 400-carry season (incl. playoffs) since 2000 finished top-10 at the position the next year." }],
  "Kyren Williams": [{ expert: "Eric Karabell (ESPN, not on accuracy leaderboard)", type: "risk", note: "Flagged as a shaky 'safe RB2' bet with backup Blake Corum averaging 5.1 YPC and pushing for more work behind him." }],
  "Bucky Irving": [{ expert: "Eric Karabell (ESPN, not on accuracy leaderboard)", type: "risk", note: "Flagged after a rough, injury-slowed second season (1 rushing TD in 10 games) and new competition from free-agent addition Kenny Gainwell." }],
  "Jaxson Dart": [{ expert: "Eric Karabell (ESPN, not on accuracy leaderboard)", type: "risk", note: "Part of a Giants trio (with Skattebo and Nabers) flagged for availability risk — the three were barely on the field together in 2025." }],
  "Cam Skattebo": [{ expert: "Eric Karabell (ESPN, not on accuracy leaderboard)", type: "risk", note: "Part of a Giants trio (with Dart and Nabers) flagged for availability risk — the three were barely on the field together in 2025." }],
};

const PLAYERS = RAW_PLAYERS.map((p, i) => ({
  id: "p" + i, name: p[0], pos: p[1], team: p[2], bye: p[3], adp: p[4], sd: p[5],
  upside: UPSIDE_NOTES[p[0]] || null,
  expertFlags: EXPERT_FLAGS[p[0]] || null,
}));

const norm = (s) => (s || "").toLowerCase().replace(/[^a-z0-9]/g, "");
const PLAYER_BY_NORM = new Map(PLAYERS.map((p) => [norm(p.name), p]));

const POS_COLORS = {
  QB: "#C9A227", RB: "#5B8C5A", WR: "#4A7FB5", TE: "#B25A3A", K: "#8D9488", DEF: "#8D6BA8",
};

const DEFAULT_CAPS = { QB: 2, RB: 4, WR: 4, TE: 2, K: 2, DEF: 2 };
const DEFAULT_STARTERS = { QB: 1, RB: 2, WR: 2, TE: 1 }; // + 1 FLEX (RB/WR/TE)

function totalRosterSize(caps) {
  return Object.values(caps).reduce((a, b) => a + b, 0);
}

function getTeamForPick(pick, numTeams) {
  const round = Math.ceil(pick / numTeams);
  const posInRound = pick - (round - 1) * numTeams - 1;
  const teamIndex = round % 2 === 1 ? posInRound : numTeams - 1 - posInRound;
  return { round, teamIndex };
}

function parseHistory(text) {
  // Lines like: "Team Name: Player One, Player Two, Player Three"
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const records = [];
  for (const line of lines) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const team = line.slice(0, idx).trim();
    if (!team) continue;
    const picks = line.slice(idx + 1).split(",").map((s) => s.trim()).filter(Boolean);
    if (picks.length) records.push({ team, picks });
  }
  // Build profile: for each team, for each round-index, tally position frequency
  const profiles = {};
  for (const rec of records) {
    if (!profiles[rec.team]) profiles[rec.team] = { rounds: [], earlyPosCount: {} };
    const prof = profiles[rec.team];
    rec.picks.forEach((name, i) => {
      const match = PLAYER_BY_NORM.get(norm(name));
      const pos = match ? match.pos : null;
      if (!prof.rounds[i]) prof.rounds[i] = {};
      if (pos) {
        prof.rounds[i][pos] = (prof.rounds[i][pos] || 0) + 1;
        if (i < 3) prof.earlyPosCount[pos] = (prof.earlyPosCount[pos] || 0) + 1;
      }
    });
  }
  return { profiles, recordCount: records.length };
}

function predictPositionForRound(profile, roundIdx) {
  if (!profile || !profile.rounds[roundIdx]) return null;
  const counts = profile.rounds[roundIdx];
  let best = null, bestN = 0;
  for (const [pos, n] of Object.entries(counts)) {
    if (n > bestN) { best = pos; bestN = n; }
  }
  return best;
}

// pure helper: build per-team roster counts + player list from a picks map
function computeRosterByTeam(picksObj, numTeamsVal, capsVal) {
  const map = Array.from({ length: numTeamsVal }, () => ({ QB: 0, RB: 0, WR: 0, TE: 0, K: 0, DEF: 0, players: [] }));
  for (const [pickStr, playerId] of Object.entries(picksObj)) {
    const pk = parseInt(pickStr, 10);
    const { teamIndex } = getTeamForPick(pk, numTeamsVal);
    const player = PLAYERS.find((p) => p.id === playerId);
    if (player && map[teamIndex]) {
      map[teamIndex][player.pos] = (map[teamIndex][player.pos] || 0) + 1;
      map[teamIndex].players.push({ pick: pk, ...player });
    }
  }
  return map;
}

// simple ADP-based trade value: earlier ADP = much higher value, diminishing returns
function tradeValue(p) {
  if (!p) return 0;
  return Math.round(1000 / (p.adp + 5));
}

// tags that don't depend on where we are in the draft — safe to compute for any list
function staticTags(p, myFlags) {
  const tags = [];
  if (myFlags.includes(p.id)) tags.push({ label: "⭐ My priority", color: "#E8B84A" });
  if (p.sd > 12) tags.push({ label: "Upside", color: "#C9A227" });
  if (p.sd < 3 && p.adp < 60) tags.push({ label: "Safe", color: "#4A7FB5" });
  if (p.upside) tags.push({ label: p.upside.tag, color: "#8D6BA8" });
  if (p.expertFlags) {
    p.expertFlags.forEach((f) => {
      tags.push({
        label: f.type === "risk" ? `⚠️ ${f.expert.split(" (")[0]}` : `🚩 ${f.expert}`,
        color: f.type === "risk" ? "#C1443C" : "#3FA796",
      });
    });
  }
  return tags;
}

// ranking sort score: "adp" is pure consensus order; "floor" pulls low-volatility
// (safer) players up within their range; "ceiling" pulls high-volatility (boom/bust)
// players up within their range. sd is weighted so it nudges order without ignoring ADP.
function sortScore(p, mode) {
  if (mode === "floor") return p.adp + p.sd * 1.5;
  if (mode === "ceiling") return p.adp - p.sd * 1.5;
  return p.adp;
}

// deterministic projection (no randomness) of what a team would take next —
// used for forward-looking "what will be gone by my next pick" estimates
function projectPickForTeam(teamIdx, picksObj, profiles, teamNamesArr, numTeamsVal, capsVal, roundNum) {
  const draftedSet = new Set(Object.values(picksObj));
  let pool = PLAYERS.filter((p) => !draftedSet.has(p.id));
  const roster = computeRosterByTeam(picksObj, numTeamsVal, capsVal)[teamIdx];
  pool = pool.filter((p) => (roster?.[p.pos] || 0) < (capsVal[p.pos] || 0));
  if (!pool.length) return null;
  const profile = profiles[teamNamesArr[teamIdx]];
  const predPos = predictPositionForRound(profile, roundNum - 1);
  let candidates = predPos ? pool.filter((p) => p.pos === predPos) : pool;
  if (!candidates.length) candidates = pool;
  candidates = [...candidates].sort((a, b) => a.adp - b.adp);
  return candidates[0] || null;
}

// choose a pick for an AI-controlled team: prefers their historical round-tendency
// position when known, falls back to best-ADP-available; picks randomly among the
// top 3 candidates so repeated mock drafts don't play out identically every time
function pickBestForTeam(teamIdx, picksObj, profiles, teamNamesArr, numTeamsVal, capsVal, roundNum) {
  const draftedSet = new Set(Object.values(picksObj));
  let pool = PLAYERS.filter((p) => !draftedSet.has(p.id));
  const roster = computeRosterByTeam(picksObj, numTeamsVal, capsVal)[teamIdx];
  pool = pool.filter((p) => (roster?.[p.pos] || 0) < (capsVal[p.pos] || 0));
  if (!pool.length) return null;
  const profile = profiles[teamNamesArr[teamIdx]];
  const predPos = predictPositionForRound(profile, roundNum - 1);
  let candidates = predPos ? pool.filter((p) => p.pos === predPos) : pool;
  if (!candidates.length) candidates = pool;
  candidates = [...candidates].sort((a, b) => a.adp - b.adp);
  const top = candidates.slice(0, 3);
  return top[Math.floor(Math.random() * top.length)] || candidates[0];
}

const DEFAULT_DRAFT_ORDER = ["Adam", "Leo", "Randy", "Luca", "Angelo", "Tim", "Ramil", "Jason", "Sam", "Joe"];
const DEFAULT_MY_INDEX = DEFAULT_DRAFT_ORDER.indexOf("Luca");
const DEFAULT_HISTORY = `Luca: Ja'Marr Chase, Kyren Williams, Kenneth Walker III, Davante Adams, George Pickens, RJ Harvey, Calvin Ridley, Baker Mayfield, Tucker Kraft, Kaleb Johnson, Drake Maye, Zaire Franklin, Dallas Goedert, Chiefs, Tyler Bass, Chargers
Jason: Bijan Robinson, Drake London, Josh Allen, Mike Evans, Omarion Hampton, DeVonta Smith, Jaylen Waddle, Mark Andrews, Aaron Jones Sr., Eagles, Travis Etienne Jr., C.J. Stroud, Jake Bates, Bobby Okereke, Harrison Butker, T.J. Watt
Leo: CeeDee Lamb, Jonathan Taylor, Brock Bowers, DK Metcalf, James Cook III, Jameson Williams, Emeka Egbuka, Dak Prescott, Jordan Mason, Zach Charbonnet, Brandon Aubrey, Lions, Foyesade Oluokun, Cardinals, Dalton Kincaid, Geno Smith
Tim: Saquon Barkley, Bucky Irving, George Kittle, Joe Burrow, Tyreek Hill, Courtland Sutton, Tony Pollard, Brock Purdy, Jauan Jennings, Braelon Allen, Ravens, Matthew Golden, Jake Moody, Roquan Smith, Bills, Zach Ertz
Ramil: Jahmyr Gibbs, Chase Brown, Travis Hunter, Jaxon Smith-Njigba, Bo Nix, Tetairoa McMillan, DJ Moore, Nick Chubb, Tyler Warren, Broncos, Cam Skattebo, J.J. McCarthy, Tre' Harris, Kyle Pitts Sr., Evan McPherson, T.J. Edwards
Sam: Justin Jefferson, Brian Thomas Jr., De'Von Achane, Jalen Hurts, Alvin Kamara, James Conner, D'Andre Swift, Chris Olave, Rome Odunze, David Njoku, Steelers, Cameron Dicker, Zack Baun, Jake Ferguson, Caleb Williams, Chase McLaughlin
Adam: Christian McCaffrey, Ashton Jeanty, A.J. Brown, Ladd McConkey, Garrett Wilson, Breece Hall, Isiah Pacheco, Jerry Jeudy, Travis Kelce, Kyler Murray, Evan Engram, Texans, Micah Parsons, Wil Lutz, Jordan Love, Rams
Joe: Malik Nabers, Puka Nacua, Jayden Daniels, Marvin Harrison Jr., TreVeyon Henderson, Sam LaPorta, Jaylen Warren, Patrick Mahomes, Colston Loveland, Deebo Samuel Sr., Brian Robinson, Quinshon Judkins, Fred Warner, 49ers, Ka'imi Fairbairn, Kaden Elliss
Angelo: Nico Collins, Josh Jacobs, Tee Higgins, Terry McLaurin, David Montgomery, Zay Flowers, T.J. Hockenson, Jared Goff, Justin Herbert, Najee Harris, Packers, Austin Ekeler, Budda Baker, Jonnu Smith, Chris Boswell, Seahawks
Randy: Derrick Henry, Amon-Ra St. Brown, Lamar Jackson, Trey McBride, Chuba Hubbard, Xavier Worthy, Ricky Pearsall, Tyrone Tracy Jr., Stefon Diggs, J.K. Dobbins, Justin Fields, Vikings, Robert Spillane, Jamien Sherwood, Cam Little, Hunter Henry
Luca: Amon-Ra St. Brown, Derrick Henry, Deebo Samuel Sr., Kenneth Walker III, Rachaad White, Kyler Murray, Kyle Pitts Sr., Diontae Johnson, Jordan Love, Jaxon Smith-Njigba, Jerome Ford, Zaire Franklin, Saints, Dallas Goedert, Jason Sanders, Colts
Tim: Christian McCaffrey, De'Von Achane, Cooper Kupp, Lamar Jackson, Jaylen Waddle, George Kittle, Stefon Diggs, Brian Robinson, Keenan Allen, Blake Corum, Chiefs, Harrison Butker, Alex Singleton, Dalton Schultz, Geno Smith, Dustin Hopkins
Sam: CeeDee Lamb, Travis Etienne Jr., Davante Adams, Sam LaPorta, James Cook III, Aaron Jones Sr., Dak Prescott, Christian Kirk, Tony Pollard, Jayden Reed, Jets, Foyesade Oluokun, Brandon Aubrey, Matthew Stafford, Pat Freiermuth, Vikings
Adam: Breece Hall, Drake London, Josh Allen, Michael Pittman Jr., DeVonta Smith, Najee Harris, Jake Ferguson, Chris Godwin Jr., Zack Moss, Browns, Jared Goff, Justin Tucker, Gus Edwards, Quincy Williams, Texans, Tyler Conklin
Jason: Justin Jefferson, Garrett Wilson, Mike Evans, Joe Mixon, Joe Burrow, James Conner, George Pickens, Evan Engram, 49ers, Devin Singletary, Caleb Williams, Tyjae Spears, Jake Moody, Bobby Okereke, Dolphins, Greg Zuerlein
Randy: A.J. Brown, Jahmyr Gibbs, Brandon Aiyuk, Jalen Hurts, Alvin Kamara, Amari Cooper, Tank Dell, Zamir White, David Njoku, Jaylen Warren, Justin Herbert, Bills, T.J. Edwards, Jake Elliott, Cole Kmet, Lions
Ramil: Bijan Robinson, Saquon Barkley, Nico Collins, DJ Moore, Anthony Richardson Sr., Dalton Kincaid, Tee Higgins, Raheem Mostert, Brock Bowers, Ravens, Xavier Worthy, Chase Brown, Evan McPherson, Kirk Cousins, Jeffery Simmons, Bears
Joe: Jonathan Taylor, Marvin Harrison Jr., Travis Kelce, DK Metcalf, Malik Nabers, C.J. Stroud, Terry McLaurin, Rhamondre Stevenson, Brock Purdy, Austin Ekeler, Trey Benson, Eagles, Taysom Hill, Roquan Smith, Tyler Bass, Fred Warner
Angelo: Ja'Marr Chase, Puka Nacua, Josh Jacobs, Patrick Mahomes, David Montgomery, Mark Andrews, Zay Flowers, D'Andre Swift, Rome Odunze, Trevor Lawrence, Steelers, T.J. Hockenson, Younghoe Koo, C.J. Mosley, Nick Chubb, Noah Fant
Leo: Tyreek Hill, Kyren Williams, Isiah Pacheco, Chris Olave, Trey McBride, Rashee Rice, Calvin Ridley, Javonte Williams, Jayden Daniels, Cowboys, Tua Tagovailoa, Brian Thomas Jr., Chuba Hubbard, Ka'imi Fairbairn, Logan Wilson, Bengals`;

export default function DraftAssistant() {
  const [loaded, setLoaded] = useState(false);
  const [numTeams, setNumTeams] = useState(10);
  const [teamNames, setTeamNames] = useState(DEFAULT_DRAFT_ORDER);
  const [myTeamIndex, setMyTeamIndex] = useState(DEFAULT_MY_INDEX);
  const [caps, setCaps] = useState(DEFAULT_CAPS);
  const [picks, setPicks] = useState({}); // overallPick -> playerId
  const [historyText, setHistoryText] = useState(DEFAULT_HISTORY);
  const [tab, setTab] = useState("board");
  const [search, setSearch] = useState("");
  const [posFilter, setPosFilter] = useState("ALL");
  const [sortMode, setSortMode] = useState("adp"); // "adp" | "floor" | "ceiling"
  const [flaggedOnly, setFlaggedOnly] = useState(false);
  const [myFlagsOnly, setMyFlagsOnly] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [mockPicks, setMockPicks] = useState({}); // practice-mode picks, separate from the live board
  const [myFlags, setMyFlags] = useState([]); // player ids the user has manually starred as priority targets
  const [tradeTeamA, setTradeTeamA] = useState(0);
  const [tradeTeamB, setTradeTeamB] = useState(1);
  const [tradeSelA, setTradeSelA] = useState([]);
  const [tradeSelB, setTradeSelB] = useState([]);

  const rounds = totalRosterSize(caps);

  // load persisted state
  useEffect(() => {
    (async () => {
      try {
        const res = await window.storage.get("ff-draft-state");
        if (res && res.value) {
          const s = JSON.parse(res.value);
          if (s.numTeams) setNumTeams(s.numTeams);
          if (s.teamNames) setTeamNames(s.teamNames);
          if (typeof s.myTeamIndex === "number") setMyTeamIndex(s.myTeamIndex);
          if (s.caps) setCaps(s.caps);
          if (s.picks) setPicks(s.picks);
          if (s.historyText) setHistoryText(s.historyText);
          if (s.mockPicks) setMockPicks(s.mockPicks);
          if (s.myFlags) setMyFlags(s.myFlags);
        }
      } catch (e) {
        // no saved state yet
      }
      setLoaded(true);
    })();
  }, []);

  const persist = useCallback(async (patch) => {
    try {
      const state = { numTeams, teamNames, myTeamIndex, caps, picks, historyText, mockPicks, myFlags, ...patch };
      await window.storage.set("ff-draft-state", JSON.stringify(state));
      setSaveError(false);
    } catch (e) {
      setSaveError(true);
    }
  }, [numTeams, teamNames, myTeamIndex, caps, picks, historyText, mockPicks, myFlags]);

  useEffect(() => { if (loaded) persist({}); }, [numTeams, teamNames, myTeamIndex, caps, picks, historyText, mockPicks, myFlags, loaded]);

  function toggleMyFlag(playerId) {
    setMyFlags((prev) => (prev.includes(playerId) ? prev.filter((id) => id !== playerId) : [...prev, playerId]));
  }

  const draftedIds = useMemo(() => new Set(Object.values(picks)), [picks]);
  const available = useMemo(
    () => PLAYERS.filter((p) => !draftedIds.has(p.id)).sort((a, b) => sortScore(a, sortMode) - sortScore(b, sortMode)),
    [draftedIds, sortMode]
  );

  const totalPicks = numTeams * rounds;
  let currentPick = 1;
  while (currentPick <= totalPicks && picks[currentPick]) currentPick++;
  const draftDone = currentPick > totalPicks;
  const { round: currentRound, teamIndex: currentTeamIdx } = draftDone
    ? { round: rounds, teamIndex: myTeamIndex }
    : getTeamForPick(currentPick, numTeams);
  const isMyPick = currentTeamIdx === myTeamIndex;

  const { profiles } = useMemo(() => parseHistory(historyText), [historyText]);

  const rosterByTeam = useMemo(() => computeRosterByTeam(picks, numTeams, caps), [picks, numTeams, caps]);

  function isPositionFull(teamIdx, pos) {
    return (rosterByTeam[teamIdx]?.[pos] || 0) >= (caps[pos] || 0);
  }

  function draftPlayer(playerId, atPick) {
    const p = atPick || currentPick;
    if (p > totalPicks) return;
    setPicks((prev) => ({ ...prev, [p]: playerId }));
  }

  function undoPick(pickNum) {
    setPicks((prev) => {
      const next = { ...prev };
      delete next[pickNum];
      return next;
    });
  }

  function resetDraft() {
    if (window.confirm ? window.confirm("Clear all picks?") : true) {
      setPicks({});
    }
  }

  // prediction for the team currently on the clock (when it's not "my" pick)
  const predictedPos = useMemo(() => {
    if (draftDone) return null;
    const teamName = teamNames[currentTeamIdx];
    const profile = profiles[teamName];
    return predictPositionForRound(profile, currentRound - 1);
  }, [draftDone, currentTeamIdx, currentRound, profiles, teamNames]);

  const predictedPicks = useMemo(() => {
    if (draftDone) return [];
    let pool = available.filter((p) => !isPositionFull(currentTeamIdx, p.pos));
    if (predictedPos) {
      const byPos = pool.filter((p) => p.pos === predictedPos);
      if (byPos.length) pool = byPos;
    }
    return pool.slice(0, 3);
  }, [available, predictedPos, currentTeamIdx, draftDone, rosterByTeam]);

  const myNeeds = useMemo(() => {
    const r = rosterByTeam[myTeamIndex] || {};
    const needs = [];
    for (const pos of ["QB", "RB", "WR", "TE"]) {
      if ((r[pos] || 0) < (DEFAULT_STARTERS[pos] || 0)) needs.push(pos);
    }
    return needs;
  }, [rosterByTeam, myTeamIndex]);

  const recommendations = useMemo(() => {
    return available
      .filter((p) => !isPositionFull(myTeamIndex, p.pos))
      .slice(0, 40)
      .map((p) => {
        const valueGap = p.adp - currentPick; // positive = falling / value
        const tags = staticTags(p, myFlags);
        if (valueGap > 8) tags.unshift({ label: "Value", color: "#5B8C5A" });
        if (myNeeds.includes(p.pos)) tags.push({ label: "Fills need", color: "#B25A3A" });
        return { ...p, valueGap, tags };
      })
      .slice(0, 8);
  }, [available, currentPick, myTeamIndex, myNeeds, rosterByTeam, myFlags]);

  // when does the user pick again after this pick?
  const nextMyPick = useMemo(() => {
    if (draftDone) return null;
    let p = currentPick + 1;
    while (p <= totalPicks) {
      if (getTeamForPick(p, numTeams).teamIndex === myTeamIndex) return p;
      p++;
    }
    return null;
  }, [currentPick, numTeams, myTeamIndex, totalPicks, draftDone]);

  // "positional runway": projects who else will likely be taken at each position
  // before the user's next turn, so waiting has a visible cost
  const positionalRunway = useMemo(() => {
    if (!isMyPick || draftDone || !nextMyPick) return null;
    const scratch = { ...picks };
    for (let pk = currentPick + 1; pk < nextMyPick; pk++) {
      const { round, teamIndex } = getTeamForPick(pk, numTeams);
      const choice = projectPickForTeam(teamIndex, scratch, profiles, teamNames, numTeams, caps, round);
      if (choice) scratch[pk] = choice.id;
    }
    const draftedAfter = new Set(Object.values(scratch));
    return ["QB", "RB", "WR", "TE"].map((pos) => {
      const bestNow = PLAYERS.filter((p) => p.pos === pos && !draftedIds.has(p.id)).sort((a, b) => a.adp - b.adp)[0] || null;
      const bestLater = PLAYERS.filter((p) => p.pos === pos && !draftedAfter.has(p.id)).sort((a, b) => a.adp - b.adp)[0] || null;
      const dropoff = bestNow && bestLater ? tradeValue(bestNow) - tradeValue(bestLater) : null;
      return { pos, bestNow, bestLater, dropoff };
    });
  }, [isMyPick, draftDone, nextMyPick, currentPick, picks, numTeams, profiles, teamNames, caps, draftedIds]);

  const filteredPlayers = useMemo(() => {
    return available
      .filter((p) => {
        if (posFilter !== "ALL" && p.pos !== posFilter) return false;
        if (flaggedOnly && !p.expertFlags) return false;
        if (myFlagsOnly && !myFlags.includes(p.id)) return false;
        if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
      })
      .map((p) => ({ ...p, tags: staticTags(p, myFlags) }));
  }, [available, posFilter, search, flaggedOnly, myFlagsOnly, myFlags]);

  /* ---------------- MOCK DRAFT (practice mode) ---------------- */
  const mockRosterByTeam = useMemo(() => computeRosterByTeam(mockPicks, numTeams, caps), [mockPicks, numTeams, caps]);
  const mockDraftedIds = useMemo(() => new Set(Object.values(mockPicks)), [mockPicks]);
  const mockAvailable = useMemo(
    () => PLAYERS.filter((p) => !mockDraftedIds.has(p.id)).sort((a, b) => a.adp - b.adp),
    [mockDraftedIds]
  );
  const mockTotalPicks = numTeams * rounds;
  let mockCurrentPick = 1;
  while (mockCurrentPick <= mockTotalPicks && mockPicks[mockCurrentPick]) mockCurrentPick++;
  const mockDraftDone = mockCurrentPick > mockTotalPicks;
  const { round: mockRound, teamIndex: mockTeamIdx } = mockDraftDone
    ? { round: rounds, teamIndex: myTeamIndex }
    : getTeamForPick(mockCurrentPick, numTeams);
  const mockIsMyPick = mockTeamIdx === myTeamIndex;

  const mockMyNeeds = useMemo(() => {
    const r = mockRosterByTeam[myTeamIndex] || {};
    const needs = [];
    for (const pos of ["QB", "RB", "WR", "TE"]) {
      if ((r[pos] || 0) < (DEFAULT_STARTERS[pos] || 0)) needs.push(pos);
    }
    return needs;
  }, [mockRosterByTeam, myTeamIndex]);

  const mockRecommendations = useMemo(() => {
    return mockAvailable
      .filter((p) => (mockRosterByTeam[myTeamIndex]?.[p.pos] || 0) < (caps[p.pos] || 0))
      .slice(0, 40)
      .map((p) => {
        const valueGap = p.adp - mockCurrentPick;
        const tags = staticTags(p, myFlags);
        if (valueGap > 8) tags.unshift({ label: "Value", color: "#5B8C5A" });
        if (mockMyNeeds.includes(p.pos)) tags.push({ label: "Fills need", color: "#B25A3A" });
        return { ...p, tags };
      })
      .slice(0, 8);
  }, [mockAvailable, mockCurrentPick, mockRosterByTeam, mockMyNeeds, myTeamIndex, caps, myFlags]);

  function mockDraftPlayer(playerId) {
    if (mockCurrentPick > mockTotalPicks) return;
    setMockPicks((prev) => ({ ...prev, [mockCurrentPick]: playerId }));
  }

  function runFullMock() {
    const newPicks = {};
    for (let pk = 1; pk <= mockTotalPicks; pk++) {
      const { round, teamIndex } = getTeamForPick(pk, numTeams);
      const choice = pickBestForTeam(teamIndex, newPicks, profiles, teamNames, numTeams, caps, round);
      if (choice) newPicks[pk] = choice.id;
    }
    setMockPicks(newPicks);
  }

  function advanceMockToMyTurn() {
    setMockPicks((prev) => {
      const next = { ...prev };
      let pk = 1;
      while (pk <= mockTotalPicks && next[pk]) pk++;
      while (pk <= mockTotalPicks) {
        const { round, teamIndex } = getTeamForPick(pk, numTeams);
        if (teamIndex === myTeamIndex) break;
        const choice = pickBestForTeam(teamIndex, next, profiles, teamNames, numTeams, caps, round);
        if (choice) next[pk] = choice.id;
        pk++;
      }
      return next;
    });
  }

  function simulateOneMockPick() {
    setMockPicks((prev) => {
      let pk = 1;
      while (pk <= mockTotalPicks && prev[pk]) pk++;
      if (pk > mockTotalPicks) return prev;
      const { round, teamIndex } = getTeamForPick(pk, numTeams);
      const choice = pickBestForTeam(teamIndex, prev, profiles, teamNames, numTeams, caps, round);
      if (!choice) return prev;
      return { ...prev, [pk]: choice.id };
    });
  }

  function resetMock() {
    setMockPicks({});
  }

  /* ---------------- TRADE VALUE CALCULATOR ---------------- */
  const tradeRosterA = (rosterByTeam[tradeTeamA]?.players || []).slice().sort((a, b) => a.pick - b.pick);
  const tradeRosterB = (rosterByTeam[tradeTeamB]?.players || []).slice().sort((a, b) => a.pick - b.pick);
  const tradeTotalA = tradeSelA.reduce((s, id) => s + tradeValue(PLAYERS.find((p) => p.id === id)), 0);
  const tradeTotalB = tradeSelB.reduce((s, id) => s + tradeValue(PLAYERS.find((p) => p.id === id)), 0);
  const tradeDiff = tradeTotalA - tradeTotalB;
  const tradeMax = Math.max(tradeTotalA, tradeTotalB, 1);
  const tradeFair = Math.abs(tradeDiff) / tradeMax < 0.12;

  function toggleTradeSel(side, playerId) {
    const setter = side === "A" ? setTradeSelA : setTradeSelB;
    setter((prev) => (prev.includes(playerId) ? prev.filter((id) => id !== playerId) : [...prev, playerId]));
  }

  if (!loaded) {
    return <div style={{ padding: 40, color: "#8D9488", fontFamily: "sans-serif" }}>Loading draft room…</div>;
  }

  return (
    <div style={{ minHeight: "100vh", background: "#141815", color: "#EDEAE0", fontFamily: "Inter, system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;700&family=Inter:wght@400;500;600;700&display=swap');
        .draft-h1 { font-family: 'Oswald', sans-serif; letter-spacing: 0.02em; text-transform: uppercase; }
        button { cursor: pointer; font-family: inherit; }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-thumb { background: #2C3630; border-radius: 4px; }
      `}</style>

      {/* HEADER */}
      <div style={{ borderBottom: "1px solid #2C3630", padding: "14px 16px", position: "sticky", top: 0, background: "#141815", zIndex: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div className="draft-h1" style={{ fontSize: 20, color: "#C9A227" }}>Draft Room</div>
            <div style={{ fontSize: 13, color: "#8D9488", marginTop: 2 }}>
              {draftDone ? "Draft complete" : `Round ${currentRound} · Pick ${currentPick} of ${totalPicks}`}
            </div>
          </div>
          <button onClick={() => setShowSettings((s) => !s)} style={{ background: "#1E2420", border: "1px solid #2C3630", borderRadius: 8, padding: 8, color: "#EDEAE0" }}>
            <Settings size={18} />
          </button>
        </div>

        {!draftDone && (
          <div style={{ marginTop: 10, padding: "10px 12px", borderRadius: 10, background: isMyPick ? "#2A3320" : "#1E2420", border: `1px solid ${isMyPick ? "#C9A227" : "#2C3630"}` }}>
            {isMyPick ? (
              <div style={{ fontWeight: 700, color: "#C9A227" }}>🏈 You're on the clock ({teamNames[myTeamIndex]})</div>
            ) : (
              <div>
                <div style={{ fontSize: 13, color: "#8D9488" }}>On the clock: <b style={{ color: "#EDEAE0" }}>{teamNames[currentTeamIdx]}</b></div>
                {predictedPos && <div style={{ fontSize: 12, color: "#8D9488", marginTop: 2 }}>Likely position (based on history): <b style={{ color: POS_COLORS[predictedPos] }}>{predictedPos}</b></div>}
              </div>
            )}
          </div>
        )}

        <div style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap" }}>
          {[["board", "Board", ClipboardList], ["rankings", "Rankings", TrendingUp], ["league", "League Intel", Users], ["teams", "Rosters", Trophy], ["mock", "Mock Draft", Shuffle], ["trade", "Trade Calc", ArrowLeftRight]].map(([key, label, Icon]) => (
            <button key={key} onClick={() => setTab(key)}
              style={{
                flex: "1 0 30%", padding: "8px 6px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                background: tab === key ? "#2C3630" : "transparent", border: "1px solid #2C3630", color: tab === key ? "#EDEAE0" : "#8D9488",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              }}>
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>
      </div>

      {saveError && <div style={{ padding: "6px 16px", fontSize: 12, color: "#C1443C" }}>Couldn't save — your changes may not persist.</div>}

      {showSettings && (
        <div style={{ padding: 16, borderBottom: "1px solid #2C3630", background: "#1A1F1B" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div className="draft-h1" style={{ fontSize: 14, color: "#8D9488" }}>Settings</div>
            <button onClick={() => setShowSettings(false)} style={{ background: "none", border: "none", color: "#8D9488" }}><X size={16} /></button>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, color: "#8D9488" }}>Number of teams</label>
            <input type="number" min={4} max={16} value={numTeams}
              onChange={(e) => {
                const n = parseInt(e.target.value, 10) || 10;
                setNumTeams(n);
                setTeamNames((prev) => {
                  const next = [...prev];
                  while (next.length < n) next.push(`Team ${next.length + 1}`);
                  return next.slice(0, n);
                });
                if (myTeamIndex >= n) setMyTeamIndex(0);
              }}
              style={{ display: "block", width: "100%", marginTop: 4, background: "#141815", border: "1px solid #2C3630", borderRadius: 6, padding: 8, color: "#EDEAE0" }} />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, color: "#8D9488" }}>Roster caps (max per position)</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginTop: 6 }}>
              {Object.keys(DEFAULT_CAPS).map((pos) => (
                <div key={pos}>
                  <div style={{ fontSize: 11, color: POS_COLORS[pos] }}>{pos}</div>
                  <input type="number" min={0} max={10} value={caps[pos]}
                    onChange={(e) => setCaps((c) => ({ ...c, [pos]: parseInt(e.target.value, 10) || 0 }))}
                    style={{ width: "100%", background: "#141815", border: "1px solid #2C3630", borderRadius: 6, padding: 6, color: "#EDEAE0" }} />
                </div>
              ))}
            </div>
            <div style={{ fontSize: 11, color: "#8D9488", marginTop: 6 }}>Total roster size: {totalRosterSize(caps)} ({rounds} rounds)</div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, color: "#8D9488" }}>Team names (use the same names as in your pasted history so predictions can match)</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 6 }}>
              {teamNames.map((name, i) => (
                <div key={i} style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <input type="radio" checked={myTeamIndex === i} onChange={() => setMyTeamIndex(i)} title="This is my team" />
                  <input value={name} onChange={(e) => {
                    const next = [...teamNames]; next[i] = e.target.value; setTeamNames(next);
                  }} style={{ flex: 1, background: "#141815", border: "1px solid #2C3630", borderRadius: 6, padding: 6, color: "#EDEAE0", fontSize: 12 }} />
                </div>
              ))}
            </div>
            <div style={{ fontSize: 11, color: "#8D9488", marginTop: 4 }}>Radio button marks which team is yours.</div>
          </div>
          <button onClick={resetDraft} style={{ display: "flex", alignItems: "center", gap: 6, background: "#3A1F1D", border: "1px solid #B23A32", color: "#E5A9A3", borderRadius: 8, padding: "8px 12px", fontSize: 13 }}>
            <RotateCcw size={14} /> Reset all picks
          </button>
        </div>
      )}

      {/* BOARD TAB */}
      {tab === "board" && (
        <div style={{ padding: 16 }}>
          {isMyPick && !draftDone && (
            <div style={{ marginBottom: 16 }}>
              <div className="draft-h1" style={{ fontSize: 14, color: "#C9A227", marginBottom: 8 }}>Recommended for you</div>
              {myNeeds.length > 0 && <div style={{ fontSize: 12, color: "#8D9488", marginBottom: 8 }}>Open starting needs: {myNeeds.join(", ")}</div>}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {recommendations.map((p) => (
                  <PlayerRow key={p.id} p={p} onDraft={() => draftPlayer(p.id)} isFlagged={myFlags.includes(p.id)} onToggleFlag={() => toggleMyFlag(p.id)} highlight />
                ))}
              </div>
            </div>
          )}

          {isMyPick && !draftDone && positionalRunway && (
            <div style={{ marginBottom: 16 }}>
              <div className="draft-h1" style={{ fontSize: 14, color: "#8D9488", marginBottom: 4 }}>
                Positional runway{nextMyPick ? ` — until pick ${nextMyPick}` : ""}
              </div>
              <div style={{ fontSize: 11, color: "#8D9488", marginBottom: 8, lineHeight: 1.4 }}>
                Projects who's likely gone by your next turn, so you can see what waiting on a position actually costs.
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {positionalRunway.map((r) => (
                  <div key={r.pos} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 10px", borderRadius: 8, background: "#1A1F1B", border: "1px solid #2C3630" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 11, color: POS_COLORS[r.pos], border: `1px solid ${POS_COLORS[r.pos]}`, borderRadius: 4, padding: "0 4px" }}>{r.pos}</span>
                      <div>
                        <div style={{ fontSize: 12 }}>{r.bestNow ? r.bestNow.name : "none left"} <span style={{ color: "#8D9488" }}>now</span></div>
                        <div style={{ fontSize: 11, color: "#8D9488" }}>→ {r.bestLater ? r.bestLater.name : "likely gone"} by pick {nextMyPick}</div>
                      </div>
                    </div>
                    {r.bestNow && r.dropoff !== null && (
                      <span style={{ fontSize: 11, fontWeight: 700, color: r.dropoff > 15 ? "#C1443C" : r.dropoff > 5 ? "#C9A227" : "#5B8C5A", textAlign: "right", maxWidth: 90 }}>
                        {r.dropoff > 5 ? `−${r.dropoff} pts if you wait` : "safe to wait"}
                      </span>
                    )}
                    {r.bestNow && r.dropoff === null && (
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#C1443C" }}>likely gone by then</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {!isMyPick && !draftDone && predictedPicks.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div className="draft-h1" style={{ fontSize: 14, color: "#8D9488", marginBottom: 8 }}>Likely picks for {teamNames[currentTeamIdx]}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {predictedPicks.map((p) => (
                  <PlayerRow key={p.id} p={p} onDraft={() => draftPlayer(p.id)} isFlagged={myFlags.includes(p.id)} onToggleFlag={() => toggleMyFlag(p.id)} subtle />
                ))}
              </div>
            </div>
          )}

          <div className="draft-h1" style={{ fontSize: 14, color: "#8D9488", marginBottom: 8, marginTop: 8 }}>Draft log</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 320, overflowY: "auto" }}>
            {Object.keys(picks).length === 0 && <div style={{ fontSize: 12, color: "#5A6058" }}>No picks yet.</div>}
            {Array.from({ length: totalPicks }, (_, i) => i + 1)
              .filter((pk) => picks[pk])
              .sort((a, b) => b - a)
              .map((pk) => {
                const player = PLAYERS.find((p) => p.id === picks[pk]);
                const { teamIndex, round } = getTeamForPick(pk, numTeams);
                return (
                  <div key={pk} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 10px", background: "#1A1F1B", borderRadius: 6, fontSize: 12 }}>
                    <span style={{ color: "#8D9488" }}>R{round} · P{pk} · {teamNames[teamIndex]}</span>
                    <span>{player?.name} <span style={{ color: POS_COLORS[player?.pos] }}>{player?.pos}</span></span>
                    <button onClick={() => undoPick(pk)} style={{ background: "none", border: "none", color: "#B23A32", fontSize: 11 }}>undo</button>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* RANKINGS TAB */}
      {tab === "rankings" && (
        <div style={{ padding: 16 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <div style={{ flex: 1, display: "flex", alignItems: "center", background: "#1A1F1B", border: "1px solid #2C3630", borderRadius: 8, padding: "6px 10px" }}>
              <Search size={14} color="#8D9488" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search players"
                style={{ background: "none", border: "none", color: "#EDEAE0", marginLeft: 8, flex: 1, outline: "none" }} />
            </div>
          </div>
          <div style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", gap: 6 }}>
              {[["adp", "Consensus ADP"], ["floor", "Floor (safest)"], ["ceiling", "Ceiling (upside)"]].map(([key, label]) => (
                <button key={key} onClick={() => setSortMode(key)}
                  style={{ flex: 1, padding: "7px 6px", borderRadius: 6, fontSize: 11, fontWeight: 600, border: `1px solid ${sortMode === key ? "#C9A227" : "#2C3630"}`, background: sortMode === key ? "#2A3320" : "transparent", color: sortMode === key ? "#C9A227" : "#8D9488" }}>
                  {label}
                </button>
              ))}
            </div>
            <div style={{ fontSize: 11, color: "#8D9488", marginTop: 6, lineHeight: 1.4 }}>
              {sortMode === "adp" && "Sorted by where the market actually drafts each player."}
              {sortMode === "floor" && "Low-volatility players (tight agreement across mocks) bumped up within their range — safer, more predictable picks."}
              {sortMode === "ceiling" && "High-volatility players (analysts disagree a lot) bumped up within their range — bigger boom/bust, higher upside."}
            </div>
          </div>
          <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
            {["ALL", "QB", "RB", "WR", "TE", "K", "DEF"].map((pos) => (
              <button key={pos} onClick={() => setPosFilter(pos)}
                style={{ padding: "5px 10px", borderRadius: 6, fontSize: 12, border: "1px solid #2C3630", background: posFilter === pos ? "#2C3630" : "transparent", color: pos === "ALL" ? "#EDEAE0" : POS_COLORS[pos] }}>
                {pos}
              </button>
            ))}
            <button onClick={() => setFlaggedOnly((f) => !f)}
              style={{ padding: "5px 10px", borderRadius: 6, fontSize: 12, border: `1px solid ${flaggedOnly ? "#3FA796" : "#2C3630"}`, background: flaggedOnly ? "#1A3330" : "transparent", color: flaggedOnly ? "#3FA796" : "#8D9488" }}>
              🚩 Expert flags
            </button>
            <button onClick={() => setMyFlagsOnly((f) => !f)}
              style={{ padding: "5px 10px", borderRadius: 6, fontSize: 12, border: `1px solid ${myFlagsOnly ? "#E8B84A" : "#2C3630"}`, background: myFlagsOnly ? "#332C1A" : "transparent", color: myFlagsOnly ? "#E8B84A" : "#8D9488" }}>
              ⭐ My priorities
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {filteredPlayers.slice(0, 60).map((p) => (
              <PlayerRow key={p.id} p={p} onDraft={() => draftPlayer(p.id)} isFlagged={myFlags.includes(p.id)} onToggleFlag={() => toggleMyFlag(p.id)} />
            ))}
          </div>
        </div>
      )}

      {/* LEAGUE INTEL TAB */}
      {tab === "league" && (
        <div style={{ padding: 16 }}>
          <div className="draft-h1" style={{ fontSize: 14, color: "#8D9488", marginBottom: 8 }}>League draft history</div>
          <div style={{ fontSize: 12, color: "#8D9488", marginBottom: 8, lineHeight: 1.5 }}>
            Paste one line per manager per past draft, in round order:<br />
            <code style={{ color: "#C9A227" }}>Team Name: Player 1, Player 2, Player 3, ...</code><br />
            Add one line per year per team (same team name each time) so patterns can build up. Use the exact team names you set in Settings.
          </div>
          <textarea value={historyText} onChange={(e) => setHistoryText(e.target.value)}
            placeholder={"Sarah's Squad: Ja'Marr Chase, Breece Hall, Amon-Ra St. Brown, ...\nMike's Team: Christian McCaffrey, Justin Jefferson, ..."}
            style={{ width: "100%", minHeight: 160, background: "#1A1F1B", border: "1px solid #2C3630", borderRadius: 8, padding: 10, color: "#EDEAE0", fontSize: 12, fontFamily: "monospace" }} />

          <div className="draft-h1" style={{ fontSize: 14, color: "#8D9488", margin: "16px 0 8px" }}>Parsed manager tendencies</div>
          {Object.keys(profiles).length === 0 && <div style={{ fontSize: 12, color: "#5A6058" }}>Paste history above to see manager tendencies.</div>}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {Object.entries(profiles).map(([team, prof]) => (
              <div key={team} style={{ background: "#1A1F1B", border: "1px solid #2C3630", borderRadius: 8, padding: 10 }}>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>{team}</div>
                <div style={{ fontSize: 11, color: "#8D9488" }}>
                  Early-round tendency: {Object.entries(prof.earlyPosCount).sort((a, b) => b[1] - a[1]).map(([pos, n]) => `${pos} (${n})`).join(", ") || "no data"}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ROSTERS TAB */}
      {tab === "teams" && (
        <div style={{ padding: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10 }}>
            {teamNames.map((name, i) => (
              <div key={i} style={{ background: "#1A1F1B", border: `1px solid ${i === myTeamIndex ? "#C9A227" : "#2C3630"}`, borderRadius: 8, padding: 10 }}>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>{name}{i === myTeamIndex ? " (you)" : ""}</div>
                <div style={{ fontSize: 11, color: "#8D9488", marginBottom: 6 }}>
                  {Object.keys(caps).map((pos) => `${pos} ${rosterByTeam[i]?.[pos] || 0}/${caps[pos]}`).join(" · ")}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {(rosterByTeam[i]?.players || []).sort((a, b) => a.pick - b.pick).map((pl) => (
                    <span key={pl.pick} style={{ fontSize: 11, padding: "3px 8px", borderRadius: 12, background: "#141815", border: `1px solid ${POS_COLORS[pl.pos]}` }}>
                      {pl.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MOCK DRAFT TAB */}
      {tab === "mock" && (
        <div style={{ padding: 16 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
            <button onClick={runFullMock} style={{ display: "flex", alignItems: "center", gap: 6, background: "#C9A227", color: "#141815", border: "none", borderRadius: 8, padding: "8px 12px", fontSize: 12, fontWeight: 700 }}>
              <Shuffle size={14} /> Run full mock (auto-picks everyone)
            </button>
            <button onClick={resetMock} style={{ display: "flex", alignItems: "center", gap: 6, background: "#1A1F1B", border: "1px solid #2C3630", color: "#EDEAE0", borderRadius: 8, padding: "8px 12px", fontSize: 12 }}>
              <RotateCcw size={14} /> Reset mock
            </button>
          </div>
          <div style={{ fontSize: 12, color: "#8D9488", marginBottom: 14, lineHeight: 1.5 }}>
            This is a separate practice board — it never touches your real draft log. Run a full instant mock to see how the board might fall, or use "simulate to my turn" below to draft live against AI opponents that lean on your league's history (with a little randomness so it's not the same every time).
          </div>

          {!mockDraftDone ? (
            <div style={{ marginBottom: 16, padding: "10px 12px", borderRadius: 10, background: mockIsMyPick ? "#2A3320" : "#1E2420", border: `1px solid ${mockIsMyPick ? "#C9A227" : "#2C3630"}` }}>
              <div style={{ fontSize: 13, color: "#8D9488" }}>Round {mockRound} · Pick {mockCurrentPick} of {mockTotalPicks}</div>
              {mockIsMyPick ? (
                <div style={{ fontWeight: 700, color: "#C9A227", marginTop: 4 }}>🏈 Your pick — choose below</div>
              ) : (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
                  <span style={{ fontSize: 13 }}>On the clock: <b>{teamNames[mockTeamIdx]}</b></span>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={simulateOneMockPick} style={{ fontSize: 11, background: "#2C3630", border: "none", color: "#EDEAE0", borderRadius: 6, padding: "5px 8px" }}>Sim 1 pick</button>
                    <button onClick={advanceMockToMyTurn} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, background: "#2C3630", border: "none", color: "#EDEAE0", borderRadius: 6, padding: "5px 8px" }}>
                      <FastForward size={12} /> Sim to my turn
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ marginBottom: 16, padding: "10px 12px", borderRadius: 10, background: "#1E2420", border: "1px solid #2C3630", fontWeight: 700, color: "#C9A227" }}>
              Mock draft complete — check the rosters below.
            </div>
          )}

          {mockIsMyPick && !mockDraftDone && (
            <div style={{ marginBottom: 16 }}>
              <div className="draft-h1" style={{ fontSize: 14, color: "#C9A227", marginBottom: 8 }}>Recommended for you</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {mockRecommendations.map((p) => (
                  <PlayerRow key={p.id} p={p} onDraft={() => mockDraftPlayer(p.id)} isFlagged={myFlags.includes(p.id)} onToggleFlag={() => toggleMyFlag(p.id)} highlight />
                ))}
              </div>
            </div>
          )}

          <div className="draft-h1" style={{ fontSize: 14, color: "#8D9488", marginBottom: 8 }}>Mock rosters</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {teamNames.map((name, i) => (
              <div key={i} style={{ background: "#1A1F1B", border: `1px solid ${i === myTeamIndex ? "#C9A227" : "#2C3630"}`, borderRadius: 8, padding: 10 }}>
                <div style={{ fontWeight: 700, marginBottom: 6, fontSize: 12 }}>{name}{i === myTeamIndex ? " (you)" : ""}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {(mockRosterByTeam[i]?.players || []).sort((a, b) => a.pick - b.pick).map((pl) => (
                    <span key={pl.pick} style={{ fontSize: 11, padding: "3px 8px", borderRadius: 12, background: "#141815", border: `1px solid ${POS_COLORS[pl.pos]}` }}>
                      {pl.name}
                    </span>
                  ))}
                  {(mockRosterByTeam[i]?.players || []).length === 0 && <span style={{ fontSize: 11, color: "#5A6058" }}>No picks yet</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TRADE CALCULATOR TAB */}
      {tab === "trade" && (
        <div style={{ padding: 16 }}>
          <div style={{ fontSize: 12, color: "#8D9488", marginBottom: 14, lineHeight: 1.5 }}>
            Value is estimated from each player's ADP (earlier picks are worth more, with diminishing returns) — a rough guide, not gospel. Pulls from your live draft board rosters, so draft players first.
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
            {[["A", tradeTeamA, setTradeTeamA, setTradeSelA], ["B", tradeTeamB, setTradeTeamB, setTradeSelB]].map(([side, val, setter, selSetter]) => (
              <div key={side}>
                <label style={{ fontSize: 11, color: "#8D9488" }}>Team {side}</label>
                <select value={val} onChange={(e) => { setter(parseInt(e.target.value, 10)); selSetter([]); }}
                  style={{ width: "100%", marginTop: 4, background: "#1A1F1B", border: "1px solid #2C3630", borderRadius: 6, padding: 8, color: "#EDEAE0", fontSize: 12 }}>
                  {teamNames.map((n, i) => <option key={i} value={i}>{n}{i === myTeamIndex ? " (you)" : ""}</option>)}
                </select>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <div style={{ fontSize: 11, color: "#8D9488", marginBottom: 6 }}>{teamNames[tradeTeamA]} sends</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {tradeRosterA.length === 0 && <div style={{ fontSize: 11, color: "#5A6058" }}>No drafted players yet</div>}
                {tradeRosterA.map((pl) => (
                  <button key={pl.pick} onClick={() => toggleTradeSel("A", pl.id)}
                    style={{ textAlign: "left", fontSize: 11, padding: "6px 8px", borderRadius: 6, background: tradeSelA.includes(pl.id) ? "#2A3320" : "#171C18", border: `1px solid ${tradeSelA.includes(pl.id) ? "#C9A227" : "#2C3630"}`, color: "#EDEAE0" }}>
                    {pl.name} <span style={{ color: POS_COLORS[pl.pos] }}>{pl.pos}</span> <span style={{ color: "#8D9488" }}>· val {tradeValue(pl)}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: "#8D9488", marginBottom: 6 }}>{teamNames[tradeTeamB]} sends</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {tradeRosterB.length === 0 && <div style={{ fontSize: 11, color: "#5A6058" }}>No drafted players yet</div>}
                {tradeRosterB.map((pl) => (
                  <button key={pl.pick} onClick={() => toggleTradeSel("B", pl.id)}
                    style={{ textAlign: "left", fontSize: 11, padding: "6px 8px", borderRadius: 6, background: tradeSelB.includes(pl.id) ? "#2A3320" : "#171C18", border: `1px solid ${tradeSelB.includes(pl.id) ? "#C9A227" : "#2C3630"}`, color: "#EDEAE0" }}>
                    {pl.name} <span style={{ color: POS_COLORS[pl.pos] }}>{pl.pos}</span> <span style={{ color: "#8D9488" }}>· val {tradeValue(pl)}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {(tradeSelA.length > 0 || tradeSelB.length > 0) && (
            <div style={{ marginTop: 16, padding: 12, borderRadius: 10, background: "#1A1F1B", border: "1px solid #2C3630" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                <span>{teamNames[tradeTeamA]} value: <b>{tradeTotalA}</b></span>
                <span>{teamNames[tradeTeamB]} value: <b>{tradeTotalB}</b></span>
              </div>
              <div style={{ fontWeight: 700, color: tradeFair ? "#5B8C5A" : "#C9A227" }}>
                {tradeFair
                  ? "Roughly fair trade"
                  : tradeDiff > 0
                    ? `${teamNames[tradeTeamA]} gives up more value (by ~${Math.abs(Math.round((tradeDiff / tradeMax) * 100))}%) — good for ${teamNames[tradeTeamB]}`
                    : `${teamNames[tradeTeamB]} gives up more value (by ~${Math.abs(Math.round((tradeDiff / tradeMax) * 100))}%) — good for ${teamNames[tradeTeamA]}`}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PlayerRow({ p, onDraft, highlight, subtle, isFlagged, onToggleFlag }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "10px 12px", borderRadius: 8,
      background: highlight ? "#1E2420" : "#171C18",
      border: `1px solid ${highlight ? "#3B4A38" : "#2C3630"}`,
      opacity: subtle ? 0.85 : 1,
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontWeight: 600, fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</span>
          <span style={{ fontSize: 11, color: POS_COLORS[p.pos], border: `1px solid ${POS_COLORS[p.pos]}`, borderRadius: 4, padding: "0 4px" }}>{p.pos}</span>
          <span style={{ fontSize: 11, color: "#8D9488" }}>{p.team} · bye {p.bye}</span>
        </div>
        <div style={{ fontSize: 11, color: "#8D9488", marginTop: 2 }}>ADP {p.adp.toFixed(1)} · volatility {p.sd.toFixed(1)}</div>
        {p.tags && p.tags.length > 0 && (
          <div style={{ display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" }}>
            {p.tags.map((t) => (
              <span key={t.label} style={{ fontSize: 10, color: t.color, border: `1px solid ${t.color}`, borderRadius: 10, padding: "1px 6px" }}>{t.label}</span>
            ))}
          </div>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 4, marginLeft: 8 }}>
        {onToggleFlag && (
          <button onClick={onToggleFlag} title={isFlagged ? "Remove priority flag" : "Flag as a priority target"}
            style={{ background: "none", border: "none", padding: 4, color: isFlagged ? "#E8B84A" : "#5A6058", display: "flex" }}>
            <Star size={17} fill={isFlagged ? "#E8B84A" : "none"} />
          </button>
        )}
        {onDraft && (
          <button onClick={onDraft} style={{ background: "#C9A227", color: "#141815", border: "none", borderRadius: 6, padding: "6px 10px", fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" }}>
            Draft
          </button>
        )}
      </div>
    </div>
  );
}
