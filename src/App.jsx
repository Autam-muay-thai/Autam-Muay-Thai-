import { useState, useEffect, useRef } from “react”;

// ── DESIGN SYSTEM ─────────────────────────────────────────────
const D = {
red:      “#ff1a1a”,
redDark:  “#cc0000”,
redDeep:  “#8b0000”,
redGlow:  “rgba(255,26,26,0.4)”,
redMid:   “rgba(255,26,26,0.15)”,
redSoft:  “rgba(255,26,26,0.06)”,
redBorder:“rgba(255,26,26,0.25)”,

bg:       “#050505”,
bgCard:   “rgba(255,255,255,0.025)”,
bgHover:  “rgba(255,255,255,0.05)”,
border:   “rgba(255,255,255,0.06)”,
borderHi: “rgba(255,26,26,0.3)”,

textPrimary:   “#ffffff”,
textSecondary: “#999999”,
textMuted:     “#555555”,

gold:   “#d4a017”,
goldSoft:“rgba(212,160,23,0.15)”,
green:  “#00e676”,
greenSoft:“rgba(0,230,118,0.12)”,
purple: “#9c27b0”,

shadowRed: “0 0 32px rgba(255,26,26,0.35)”,
shadowCard: “0 4px 24px rgba(0,0,0,0.6)”,

r:  8,
rm: 12,
rl: 16,
rxl:20,

heading: “‘Bebas Neue’, cursive”,
body:    “Georgia, serif”,

pad: “16px”,
};

const GLOBAL_STYLES = `
@import url(‘https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap’);

- { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
  ::-webkit-scrollbar { width: 0; background: transparent; }
  input, textarea, select { outline: none; }
  @keyframes fadeUp   { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn   { from{opacity:0} to{opacity:1} }
  @keyframes scaleIn  { from{opacity:0;transform:scale(0.94)} to{opacity:1;transform:scale(1)} }
  @keyframes slideDown{ from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes pulse    { 0%,100%{opacity:1} 50%{opacity:0.5} }
  @keyframes glow     { 0%,100%{filter:drop-shadow(0 0 8px rgba(255,26,26,0.5))} 50%{filter:drop-shadow(0 0 20px rgba(255,26,26,0.9))} }
  @keyframes spin     { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  @keyframes badgeIn  { from{opacity:0;transform:translateY(-24px) scale(0.9)} to{opacity:1;transform:translateY(0) scale(1)} }
  @keyframes blink    { 0%,100%{opacity:1} 50%{opacity:0.3} }
  @keyframes shimmer  { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
  @keyframes dot      { 0%,80%,100%{opacity:0.2;transform:scale(0.8)} 40%{opacity:1;transform:scale(1)} }
  @keyframes celebrate{ 0%{transform:scale(1)} 30%{transform:scale(1.06)} 100%{transform:scale(1)} }
  @keyframes popIn    { from{transform:scale(0.7);opacity:0} to{transform:scale(1);opacity:1} }
  @keyframes flashFade{ from{opacity:1} to{opacity:0} }
  @keyframes splashRing{from{transform:scale(0.6);opacity:0} to{transform:scale(1);opacity:1}}
  @keyframes splashBar { from{width:0%} to{width:100%} }
  @keyframes rotateSlow{from{transform:rotate(0deg)} to{transform:rotate(360deg)}}
  @keyframes splashGlow{0%,100%{filter:drop-shadow(0 0 12px rgba(255,26,26,0.4))} 50%{filter:drop-shadow(0 0 32px rgba(255,26,26,1))}}
  `;

function Btn({ children, onClick, variant=“primary”, disabled, style={}, …props }) {
const base = { border:“none”, borderRadius:D.rm, padding:“13px 16px”, cursor:disabled?“not-allowed”:“pointer”, fontFamily:D.heading, letterSpacing:2, fontSize:14, width:“100%”, display:“flex”, alignItems:“center”, justifyContent:“center”, gap:8, transition:“all 0.2s”, …style };
const variants = {
primary:  { background: disabled ? `rgba(255,26,26,0.2)` : `linear-gradient(135deg,${D.red},${D.redDark})`, color:”#fff”, boxShadow: disabled ? “none” : D.shadowRed },
secondary:{ background:“rgba(255,255,255,0.05)”, color:D.textSecondary, border:`1px solid ${D.border}` },
gold:     { background:`linear-gradient(135deg,${D.gold},#b8860b)`, color:”#000”, boxShadow:“0 0 24px rgba(212,160,23,0.4)” },
ghost:    { background:“none”, color:D.textMuted, border:`1px solid ${D.border}` },
danger:   { background:“rgba(255,26,26,0.08)”, color:D.red, border:`1px solid ${D.redBorder}` },
};
return <button onClick={disabled?undefined:onClick} style={{…base,…variants[variant]}} {…props}>{children}</button>;
}

function Card({ children, style={}, accent, onClick }) {
return (
<div onClick={onClick} style={{ background:D.bgCard, border:`1px solid ${accent?D.borderHi:D.border}`, borderRadius:D.rl, padding:14, …style }}>
{children}
</div>
);
}

function SLabel({ children, color, style={} }) {
return <div style={{ fontSize:10, letterSpacing:3, fontFamily:D.heading, color:color||D.red, marginBottom:10, …style }}>{children}</div>;
}

// ── SUPABASE CONFIG (actif sur Vercel) ───────────────────────
const SUPABASE_URL = “https://pnvyamjadclyzhrcnkbr.supabase.co”;
const SUPABASE_KEY = “eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBudnlhbWphZGNseXpocmNua2JyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxMzUxNzksImV4cCI6MjA5MjcxMTE3OX0.28whGQthFcQYDZfNZLwbdp0vZX7vcZQYl7Vsh5wLRQU”;

// Force auth locale partout sauf sur le vrai domaine Vercel
const IS_PRODUCTION = typeof window !== “undefined” &&
(window.location.hostname === “autammuaythai.com” ||
window.location.hostname === “www.autammuaythai.com” ||
window.location.hostname.endsWith(”.vercel.app”));

// ── AUTH (local persistant en preview, Supabase en production) ─
const supaAuth = {
signUp: async ({ email, password, name }) => {
if (IS_PRODUCTION) {
// Vrai Supabase en production
try {
const r = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
method: “POST”,
headers: { “apikey”: SUPABASE_KEY, “Content-Type”: “application/json” },
body: JSON.stringify({ email, password }),
});
const data = await r.json();
if (data.error) return { error: data.error.message || “Erreur inscription” };
const userId = data.user?.id;
const token = data.access_token;
await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
method: “POST”,
headers: { “apikey”: SUPABASE_KEY, “Authorization”: `Bearer ${token}`, “Content-Type”: “application/json”, “Prefer”: “return=minimal” },
body: JSON.stringify({ id: userId, email, name, created_at: new Date().toISOString() }),
});
const user = { id: userId, email, name, createdAt: Date.now(), token };
localStorage.setItem(“amt_session”, JSON.stringify(user));
return { user, error: null };
} catch { return { error: “Connexion impossible.” }; }
} else {
// Auth locale persistante pour la prévisualisation
const users = JSON.parse(localStorage.getItem(“amt_users”) || “{}”);
if (users[email]) return { error: “Cet email est déjà utilisé.” };
const user = { id: Date.now().toString(), email, name, password, createdAt: Date.now() };
users[email] = user;
localStorage.setItem(“amt_users”, JSON.stringify(users));
localStorage.setItem(“amt_session”, JSON.stringify(user));
return { user, error: null };
}
},

signIn: async ({ email, password }) => {
if (IS_PRODUCTION) {
try {
const r = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
method: “POST”,
headers: { “apikey”: SUPABASE_KEY, “Content-Type”: “application/json” },
body: JSON.stringify({ email, password }),
});
const data = await r.json();
if (data.error_description) return { error: “Email ou mot de passe incorrect.” };
const userId = data.user?.id;
const token = data.access_token;
const pr = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}&select=*`, {
headers: { “apikey”: SUPABASE_KEY, “Authorization”: `Bearer ${token}` },
});
const profiles = await pr.json();
const profile = profiles[0];
const user = { id: userId, email, name: profile?.name || email.split(”@”)[0], createdAt: profile?.created_at ? new Date(profile.created_at).getTime() : Date.now(), token };
localStorage.setItem(“amt_session”, JSON.stringify(user));
return { user, error: null };
} catch { return { error: “Connexion impossible.” }; }
} else {
// Auth locale persistante
const users = JSON.parse(localStorage.getItem(“amt_users”) || “{}”);
const user = users[email];
if (!user) return { error: “Aucun compte trouvé. Inscris-toi d’abord.” };
if (user.password !== password) return { error: “Mot de passe incorrect.” };
localStorage.setItem(“amt_session”, JSON.stringify(user));
return { user, error: null };
}
},

signOut: () => {
localStorage.removeItem(“amt_session”);
localStorage.removeItem(“amt_token”);
},

getSession: () => {
try {
const s = localStorage.getItem(“amt_session”);
return s ? JSON.parse(s) : null;
} catch { return null; }
},

getTrialDaysLeft: (user) => {
if (!user?.createdAt) return 7;
const days = Math.floor((Date.now() - user.createdAt) / (1000 * 60 * 60 * 24));
return Math.max(0, 7 - days);
},
};

// ── AUTH SCREEN ───────────────────────────────────────────────

// ── DATA STORAGE (must be defined early) ────────────────────
const ALL_BADGES = [
// Séances
{ id:“s1”, icon:“🥊”, name:“Premier Pas”, desc:“Complète ta 1ère séance”, category:“Séances”, condition: s => s.sessions >= 1 },
{ id:“s5”, icon:“💪”, name:“Guerrier”, desc:“5 séances complétées”, category:“Séances”, condition: s => s.sessions >= 5 },
{ id:“s10”, icon:“🔥”, name:“Combattant”, desc:“10 séances complétées”, category:“Séances”, condition: s => s.sessions >= 10 },
{ id:“s25”, icon:“⚡”, name:“Champion”, desc:“25 séances complétées”, category:“Séances”, condition: s => s.sessions >= 25 },
{ id:“s50”, icon:“🏆”, name:“Légende”, desc:“50 séances complétées”, category:“Séances”, condition: s => s.sessions >= 50 },
// Streak
{ id:“st3”, icon:“🌟”, name:“3 Jours de feu”, desc:“3 jours de streak”, category:“Streak”, condition: s => s.streak >= 3 },
{ id:“st7”, icon:“🔥”, name:“Semaine parfaite”, desc:“7 jours de streak”, category:“Streak”, condition: s => s.streak >= 7 },
{ id:“st14”, icon:“💫”, name:“Deux semaines”, desc:“14 jours de streak”, category:“Streak”, condition: s => s.streak >= 14 },
{ id:“st30”, icon:“👑”, name:“Mois de gloire”, desc:“30 jours de streak”, category:“Streak”, condition: s => s.streak >= 30 },
// Coach IA
{ id:“ai1”, icon:“🤖”, name:“Premier Élève”, desc:“1ère analyse Coach IA”, category:“Coach IA”, condition: s => s.analyses >= 1 },
{ id:“ai5”, icon:“🎯”, name:“Apprenti”, desc:“5 analyses Coach IA”, category:“Coach IA”, condition: s => s.analyses >= 5 },
{ id:“ai10”, icon:“🧠”, name:“Technicien”, desc:“10 analyses Coach IA”, category:“Coach IA”, condition: s => s.analyses >= 10 },
{ id:“ai25”, icon:“🎓”, name:“Expert”, desc:“25 analyses Coach IA”, category:“Coach IA”, condition: s => s.analyses >= 25 },
// Techniques
{ id:“t1”, icon:“👊”, name:“Première Frappe”, desc:“1ère technique consultée”, category:“Techniques”, condition: s => s.techniques >= 1 },
{ id:“t3”, icon:“🦵”, name:“En mouvement”, desc:“3 techniques maîtrisées”, category:“Techniques”, condition: s => s.techniques >= 3 },
{ id:“t6”, icon:“💥”, name:“Arsenal complet”, desc:“Toutes les techniques vues”, category:“Techniques”, condition: s => s.techniques >= 6 },
];

const badgeStorage = {
getStats: () => {
try { return JSON.parse(localStorage.getItem(“amt_badge_stats”) || ‘{“sessions”:0,“streak”:0,“analyses”:0,“techniques”:0}’); }
catch { return {sessions:0,streak:0,analyses:0,techniques:0}; }
},
setStats: (s) => localStorage.setItem(“amt_badge_stats”, JSON.stringify(s)),
getUnlocked: () => {
try { return JSON.parse(localStorage.getItem(“amt_badges_unlocked”) || “[]”); }
catch { return []; }
},
unlock: (id) => {
const u = badgeStorage.getUnlocked();
if(!u.includes(id)) { u.push(id); localStorage.setItem(“amt_badges_unlocked”, JSON.stringify(u)); return true; }
return false;
},
checkAndUnlock: (stats) => {
const newBadges = [];
ALL_BADGES.forEach(b => {
if(b.condition(stats) && badgeStorage.unlock(b.id)) newBadges.push(b);
});
return newBadges;
},
};

const progression = {
getStats: () => {
try {
return JSON.parse(localStorage.getItem(“amt_prog_stats”) || JSON.stringify({
sessions: 0, totalMinutes: 0, totalCalories: 0,
streak: 0, lastSessionDate: null,
weeklySessionss: [0,0,0,0,0,0,0],
history: [],
}));
} catch { return {sessions:0,totalMinutes:0,totalCalories:0,streak:0,lastSessionDate:null,weeklySessionss:[0,0,0,0,0,0,0],history:[]}; }
},
saveStats: (s) => localStorage.setItem(“amt_prog_stats”, JSON.stringify(s)),
addSession: (minutes, type=“Entraînement”) => {
const s = progression.getStats();
const today = new Date().toDateString();
const cal = Math.round(minutes * 8.5);
if(s.lastSessionDate === today) {
// Already trained today
} else if(s.lastSessionDate === new Date(Date.now()-864e5).toDateString()) {
s.streak += 1;
} else {
s.streak = 1;
}
s.sessions += 1;
s.totalMinutes += minutes;
s.totalCalories += cal;
s.lastSessionDate = today;
const day = new Date().getDay();
if(!s.weeklySessionss) s.weeklySessionss = [0,0,0,0,0,0,0];
s.weeklySessionss[day] = (s.weeklySessionss[day]||0) + 1;
if(!s.history) s.history = [];
s.history.unshift({date: new Date().toLocaleDateString(“fr-FR”), minutes, cal, type, id: Date.now()});
if(s.history.length > 50) s.history = s.history.slice(0,50);
progression.saveStats(s);
badgeStorage.setStats({sessions:s.sessions, streak:s.streak, analyses:badgeStorage.getStats().analyses, techniques:badgeStorage.getStats().techniques});
return {s, cal, newBadges: badgeStorage.checkAndUnlock({sessions:s.sessions, streak:s.streak, analyses:badgeStorage.getStats().analyses, techniques:badgeStorage.getStats().techniques})};
},
};

function AuthScreen({ onAuth, onShowLegal }) {
const [mode, setMode] = useState(“login”);
const [email, setEmail] = useState(””);
const [password, setPassword] = useState(””);
const [name, setName] = useState(””);
const [acceptedCGU, setAcceptedCGU] = useState(false);
const [error, setError] = useState(””);
const [success, setSuccess] = useState(””);
const [loading, setLoading] = useState(false);

const S = {
input: {
width: “100%”, background: “rgba(255,255,255,0.07)”,
border: “1px solid rgba(255,255,255,0.12)”, borderRadius: 12,
color: “#fff”, fontSize: 14, padding: “13px 16px”,
boxSizing: “border-box”, fontFamily: “Georgia, serif”,
outline: “none”,
},
label: { fontSize: 11, color: “#888”, letterSpacing: 1, marginBottom: 6, display: “block” },
};

const handleSubmit = async () => {
setError(””); setSuccess(””);
if (!email || !password) { setError(“Remplis tous les champs.”); return; }
if (password.length < 6) { setError(“Mot de passe : 6 caractères minimum.”); return; }
setLoading(true);

```
if (mode === "register") {
  if (!name.trim()) { setError("Entre ton prénom et nom."); setLoading(false); return; }
  if (!acceptedCGU) { setError("Tu dois accepter les CGU et la politique de confidentialité pour continuer."); setLoading(false); return; }
  const { user, error } = await supaAuth.signUp({ email, password, name });
  if (error) { setError(error); setLoading(false); return; }
  onAuth(user);
} else {
  const { user, error } = await supaAuth.signIn({ email, password });
  if (error) { setError(error); setLoading(false); return; }
  onAuth(user);
}
setLoading(false);
```

};

return (
<div style={{ height: “100%”, display: “flex”, flexDirection: “column”, background: “#0a0a0a” }}>
{/* Header */}
<div style={{background: “linear-gradient(135deg, #0a0a0a, #1a0000)”, padding: “40px 24px 32px”, textAlign: “center”, borderBottom: “1px solid rgba(239,68,68,0.15)”,}}>
<div style={{ fontSize: 52, marginBottom: 10, filter: “drop-shadow(0 0 12px rgba(239,68,68,0.5))” }}>🥊</div>
<div style={{ fontSize: 36, fontFamily: “‘Bebas Neue’, cursive”, color: “#fff”, letterSpacing: 3 }}>AUTAM</div>
<div style={{ fontSize: 18, fontFamily: “‘Bebas Neue’, cursive”, color: “#ef4444”, letterSpacing: 4 }}>MUAY THAI</div>
<div style={{ fontSize: 11, color: “#666”, marginTop: 6, fontStyle: “italic” }}>Forge ton corps · Affûte ton esprit</div>
</div>

```
  {/* Form */}
  <div style={{ flex: 1, overflowY: "auto", padding: "24px 20px" }}>
    {/* Tab switcher */}
    <div style={{ display: "flex", background: "rgba(255,255,255,0.05)", borderRadius: 12, padding: 4, marginBottom: 24 }}>
      {["login", "register"].map(m => (
        <button key={m} onClick={() => { setMode(m); setError(""); setSuccess(""); }} style={{flex: 1, background: mode === m ? "#ef4444" : "transparent", border: "none", color: mode === m ? "#fff" : "#888", borderRadius: 10, padding: "10px", cursor: "pointer", fontFamily: "'Bebas Neue', cursive", letterSpacing: 2, fontSize: 14, transition: "all 0.2s",}}>
          {m === "login" ? "CONNEXION" : "INSCRIPTION"}
        </button>
      ))}
    </div>

    {/* Trial badge sur inscription */}
    {mode === "register" && (
      <div style={{background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 12, padding: "10px 14px", marginBottom: 20, display: "flex", alignItems: "center", gap: 10,}}>
        <span style={{ fontSize: 20 }}>🎁</span>
        <div>
          <div style={{ fontSize: 13, fontFamily: "'Bebas Neue', cursive", color: "#f59e0b", letterSpacing: 1 }}>
            7 JOURS PREMIUM OFFERTS
          </div>
          <div style={{ fontSize: 10, color: "#888" }}>Sans carte bancaire · Annulable à tout moment</div>
        </div>
      </div>
    )}

    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {mode === "register" && (
        <div>
          <span style={S.label}>PRÉNOM ET NOM</span>
          <input placeholder="Ex: Mathis Pozner" value={name} onChange={e => setName(e.target.value)}
            style={S.input} />
        </div>
      )}
      <div>
        <span style={S.label}>EMAIL</span>
        <input type="email" placeholder="ton@email.com" value={email} onChange={e => setEmail(e.target.value)}
          style={S.input} autoCapitalize="none" />
      </div>
      <div>
        <span style={S.label}>MOT DE PASSE</span>
        <input type="password" placeholder="6 caractères minimum" value={password} onChange={e => setPassword(e.target.value)}
          style={S.input} />
      </div>
    </div>

    {/* CGU checkbox — inscription seulement */}
    {mode === "register" && (
      <div onClick={() => setAcceptedCGU(a => !a)} style={{display: "flex", alignItems: "flex-start", gap: 12, marginTop: 16, cursor: "pointer", background: acceptedCGU ? "rgba(34,197,94,0.08)" : "rgba(255,255,255,0.03)", border: `1px solid ${acceptedCGU ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.1)"}`, borderRadius: 12, padding: "12px 14px", transition: "all 0.2s",}}>
        <div style={{width: 22, height: 22, borderRadius: 6, flexShrink: 0, background: acceptedCGU ? "#22c55e" : "rgba(255,255,255,0.08)", border: `2px solid ${acceptedCGU ? "#22c55e" : "rgba(255,255,255,0.2)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, transition: "all 0.2s",}}>{acceptedCGU ? "✓" : ""}</div>
        <div style={{ fontSize: 11, color: "#aaa", lineHeight: 1.6 }}>
          J'ai lu et j'accepte les{" "}
          <span onClick={e => { e.stopPropagation(); onShowLegal("terms"); }} style={{ color: "#ef4444", textDecoration: "underline", cursor: "pointer" }}>
            Conditions Générales d'Utilisation
          </span>{" "}et la{" "}
          <span onClick={e => { e.stopPropagation(); onShowLegal("privacy"); }} style={{ color: "#ef4444", textDecoration: "underline", cursor: "pointer" }}>
            Politique de Confidentialité
          </span>{" "}d'Autam Muay Thai.
        </div>
      </div>
    )}

    {/* Error / Success */}
    {error && (
      <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, padding: "10px 14px", marginTop: 16, fontSize: 12, color: "#ef4444" }}>
        ⚠ {error}
      </div>
    )}
    {success && (
      <div style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 10, padding: "10px 14px", marginTop: 16, fontSize: 12, color: "#22c55e" }}>
        {success}
      </div>
    )}

    {/* Submit */}
    <button onClick={handleSubmit} disabled={loading} style={{width: "100%", border: "none", borderRadius: 14, padding: "15px", background: loading ? "rgba(239,68,68,0.5)" : "#ef4444", color: "#fff", fontFamily: "'Bebas Neue', cursive", letterSpacing: 2, fontSize: 16, cursor: loading ? "not-allowed" : "pointer", boxShadow: loading ? "none" : "0 0 24px rgba(239,68,68,0.4)", marginTop: 24, transition: "all 0.2s",}}>
      {loading ? "⏳ CHARGEMENT..." : mode === "login" ? "🥊 SE CONNECTER" : "🎁 CRÉER MON COMPTE"}
    </button>

    {/* Google */}
    <div style={{ position: "relative", margin: "20px 0", textAlign: "center" }}>
      <div style={{ height: 1, background: "rgba(255,255,255,0.08)" }} />
      <span style={{ position: "absolute", top: -8, left: "50%", transform: "translateX(-50%)", background: "#0a0a0a", padding: "0 12px", fontSize: 11, color: "#555" }}>OU</span>
    </div>

    <button onClick={() => setError("Connexion Google disponible dans la version mobile de l'app.")} style={{width: "100%", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 14, padding: "13px", background: "rgba(255,255,255,0.05)", color: "#ccc", fontFamily: "'Bebas Neue', cursive", letterSpacing: 2, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10,}}>
      <span style={{ fontSize: 18 }}>G</span> CONTINUER AVEC GOOGLE
    </button>

    <div style={{ textAlign: "center", marginTop: 16, fontSize: 10, color: "#444", lineHeight: 1.6 }}>
      En créant un compte tu acceptes nos CGU<br/>et notre politique de confidentialité
    </div>
  </div>
</div>
```

);
}

const combos = [
{ id: 1, name: “Combo Débutant”, level: “Débutant”, strikes: [“Jab”, “Cross”, “Low Kick”], color: “#22c55e” },
{ id: 2, name: “Combo Chasseur”, level: “Intermédiaire”, strikes: [“Jab”, “Cross”, “Crochet”, “Genou”], color: “#f59e0b” },
{ id: 3, name: “Combo Guerrier”, level: “Avancé”, strikes: [“Jab”, “Cross”, “Coude”, “Genou”, “Roundhouse”], color: “#ef4444” },
];

const techniques = [
{ id: 1, name: “Teep”, category: “Coup de pied”, emoji: “🦵”, desc: “Coup de pied de face, utilisé pour garder la distance.” },
{ id: 2, name: “Roundhouse Kick”, category: “Coup de pied”, emoji: “🦵”, desc: “Coup de pied circulaire, l’arme signature du Muay Thai.” },
{ id: 3, name: “Coude Horizontal”, category: “Coude”, emoji: “💥”, desc: “Frappe de l’avant-bras vers l’intérieur à hauteur de tête.” },
{ id: 4, name: “Genou Sauté”, category: “Genou”, emoji: “🔥”, desc: “Genou explosif en saut pour passer par-dessus la garde.” },
{ id: 5, name: “Clinch”, category: “Corps à corps”, emoji: “🤼”, desc: “Position de lutte rapprochée pour frapper avec les genoux.” },
{ id: 6, name: “Jab-Cross”, category: “Poing”, emoji: “👊”, desc: “Combinaison de base : direct du poing avant puis arrière.” },
];

const programs = [
{ id: 1, name: “Fondamentaux”, weeks: 4, level: “Débutant”, sessions: 3, color: “#22c55e”, icon: “🌱” },
{ id: 2, name: “Combat Conditioning”, weeks: 6, level: “Intermédiaire”, sessions: 4, color: “#f59e0b”, icon: “⚡” },
{ id: 3, name: “Guerrier Élite”, weeks: 8, level: “Avancé”, sessions: 5, color: “#ef4444”, icon: “🔥” },
{ id: 4, name: “Mon Programme”, weeks: “∞”, level: “Personnalisé”, sessions: “?”, color: “#a855f7”, icon: “✨” },
];

// ── COACH IA SCREEN ────────────────────────────────────────────
const DEFAULT_COMBOS = [
{
id: “c1”, name: “Jab / Cross / Right Middle Kick”,
steps: [“Jab (poing avant)”, “Cross (poing arrière)”, “Right Middle Kick (kick droit à mi-hauteur)”],
cues: [“Garde haute pendant toute la séquence”, “Pivot du pied arrière sur le cross”, “Rotation complète des hanches sur le kick”, “Retour rapide en garde après le kick”],
refVideoUrl: null,
},
{
id: “c2”, name: “Jab / Cross / Low Kick”,
steps: [“Jab (poing avant)”, “Cross (poing arrière)”, “Low Kick (kick bas sur la cuisse)”],
cues: [“Enchaîner rapidement jab-cross”, “Frapper avec le tibia, pas le pied”, “Garde haute protège lors du kick”],
refVideoUrl: null,
},
{
id: “c3”, name: “Jab / Cross / Crochet / Genou”,
steps: [“Jab”, “Cross”, “Crochet gauche”, “Genou droit”],
cues: [“Rotation du buste sur le crochet”, “Saisir la nuque sur le genou (clinch)”, “Genou monté haut et puissamment”],
refVideoUrl: null,
},
];

function CoachIAScreen({ isPremium, dailyAnalyses, setDailyAnalyses, goPaywall }) {
const [tab, setTab] = useState(“analyse”); // analyse | combos | historique
const [mode, setMode] = useState(“menu”);  // menu | video | live
const [customCombos, setCustomCombos] = useState(DEFAULT_COMBOS);
const [selectedComboId, setSelectedComboId] = useState(“c1”);
const [videoFile, setVideoFile] = useState(null);
const [videoPreview, setVideoPreview] = useState(null);
const [coachNotes, setCoachNotes] = useState(””);
const [analyzing, setAnalyzing] = useState(false);
const [analysis, setAnalysis] = useState(null);
const [history, setHistory] = useState([]);
const [liveActive, setLiveActive] = useState(false);
const [liveAnalysis, setLiveAnalysis] = useState(null);
const [liveAnalyzing, setLiveAnalyzing] = useState(false);
const [showDetailHistory, setShowDetailHistory] = useState(null);

const [showCreateCombo, setShowCreateCombo] = useState(false);
const [newComboName, setNewComboName] = useState(””);
const [newComboSteps, setNewComboSteps] = useState(””);
const [newComboCues, setNewComboCues] = useState(””);
const [refVideoFile, setRefVideoFile] = useState(null);
const [refVideoPreview, setRefVideoPreview] = useState(null);
const [editingComboId, setEditingComboId] = useState(null);

const fileInputRef = useRef(null);
const refVideoInputRef = useRef(null);
const videoRef = useRef(null);
const streamRef = useRef(null);
const canvasRef = useRef(null);

const selectedCombo = customCombos.find(c => c.id === selectedComboId) || customCombos[0];

// ── Helpers ──
const toBase64 = (file) => new Promise((res, rej) => {
const r = new FileReader();
r.onload = () => res(r.result.split(”,”)[1]);
r.onerror = rej;
r.readAsDataURL(file);
});

const extractFrame = (file) => new Promise((resolve) => {
const vid = document.createElement(“video”);
vid.src = URL.createObjectURL(file);
vid.onloadeddata = () => {
const canvas = document.createElement(“canvas”);
canvas.width = vid.videoWidth || 640;
canvas.height = vid.videoHeight || 480;
canvas.getContext(“2d”).drawImage(vid, 0, 0);
resolve(canvas.toDataURL(“image/jpeg”).split(”,”)[1]);
};
vid.load();
});

// ── Créer / modifier combo ──
const saveCombo = () => {
if (!newComboName.trim()) return;
const steps = newComboSteps.split(”\n”).map(s => s.trim()).filter(Boolean);
const cues = newComboCues.split(”\n”).map(s => s.trim()).filter(Boolean);
if (editingComboId) {
setCustomCombos(prev => prev.map(c => c.id === editingComboId
? { …c, name: newComboName, steps, cues, refVideoUrl: refVideoPreview || c.refVideoUrl }
: c));
} else {
const newId = “c” + Date.now();
setCustomCombos(prev => […prev, { id: newId, name: newComboName, steps, cues, refVideoUrl: refVideoPreview || null }]);
setSelectedComboId(newId);
}
setShowCreateCombo(false);
setEditingComboId(null);
setNewComboName(””); setNewComboSteps(””); setNewComboCues(””);
setRefVideoFile(null); setRefVideoPreview(null);
};

const startEdit = (combo) => {
setEditingComboId(combo.id);
setNewComboName(combo.name);
setNewComboSteps(combo.steps.join(”\n”));
setNewComboCues(combo.cues.join(”\n”));
setRefVideoPreview(combo.refVideoUrl || null);
setShowCreateCombo(true);
};

const deleteCombo = (id) => {
setCustomCombos(prev => prev.filter(c => c.id !== id));
if (selectedComboId === id) setSelectedComboId(customCombos[0]?.id);
};

// ── Analyse vidéo ──
const analyzeVideo = async () => {
if (!videoFile) return;
if (!isPremium && dailyAnalyses >= 1) {
goPaywall(); return;
}
setAnalyzing(true); setAnalysis(null);
try {
let imageData, mediaType = “image/jpeg”;
if (videoFile.type.startsWith(“video/”)) {
imageData = await extractFrame(videoFile);
} else {
imageData = await toBase64(videoFile);
mediaType = videoFile.type;
}
const refNote = selectedCombo.refVideoUrl ? “Le coach a fourni une vidéo de référence pour ce combo.” : “”;
const response = await fetch(“https://api.anthropic.com/v1/messages”, {
method: “POST”,
headers: { “Content-Type”: “application/json” },
body: JSON.stringify({
model: “claude-sonnet-4-20250514”,
max_tokens: 1000,
system: `Tu es un coach expert en Muay Thai. Analyse la technique visible et donne des corrections précises et bienveillantes. Réponds UNIQUEMENT en JSON valide: {"score":<0-100>,"resume":"<phrase>","points_positifs":["<p1>"],"corrections":[{"element":"<mouvement>","probleme":"<pb>","correction":"<fix>"}],"conseil_global":"<conseil>"}`,
messages: [{
role: “user”, content: [
{ type: “image”, source: { type: “base64”, media_type: mediaType, data: imageData } },
{ type: “text”, text: `Combo: ${selectedCombo.name}\nSéquence: ${selectedCombo.steps.join(" → ")}\nPoints clés: ${selectedCombo.cues.join(", ")}\n${refNote}\n${coachNotes ? "Notes coach: " + coachNotes : ""}\nJSON uniquement.` }
]
}]
})
});
const data = await response.json();
const text = data.content?.map(c => c.text || “”).join(””) || “”;
const parsed = JSON.parse(text.replace(/`json|`/g, “”).trim());
setAnalysis(parsed);
setDailyAnalyses(n => n + 1);
setHistory(prev => [{
id: Date.now(), date: new Date().toLocaleDateString(“fr-FR”),
comboName: selectedCombo.name, score: parsed.score,
resume: parsed.resume, corrections: parsed.corrections,
points_positifs: parsed.points_positifs, conseil_global: parsed.conseil_global,
imagePreview: videoPreview,
}, …prev]);
} catch {
setAnalysis({ error: “Erreur d’analyse. Essaie avec une image nette.” });
}
setAnalyzing(false);
};

// ── Live ──
const startLive = async () => {
try {
const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: “user” }, audio: false });
streamRef.current = stream;
if (videoRef.current) videoRef.current.srcObject = stream;
setLiveActive(true);
} catch { alert(“Impossible d’accéder à la caméra.”); }
};
const stopLive = () => {
streamRef.current?.getTracks().forEach(t => t.stop());
setLiveActive(false); setLiveAnalysis(null);
};
const captureAndAnalyzeLive = async () => {
if (!videoRef.current || liveAnalyzing) return;
setLiveAnalyzing(true);
try {
const canvas = canvasRef.current;
canvas.width = videoRef.current.videoWidth || 320;
canvas.height = videoRef.current.videoHeight || 240;
canvas.getContext(“2d”).drawImage(videoRef.current, 0, 0);
const imageData = canvas.toDataURL(“image/jpeg”, 0.7).split(”,”)[1];
const response = await fetch(“https://api.anthropic.com/v1/messages”, {
method: “POST”, headers: { “Content-Type”: “application/json” },
body: JSON.stringify({
model: “claude-sonnet-4-20250514”, max_tokens: 400,
system: `Coach Muay Thai temps réel. JSON uniquement: {"posture":"bon/corriger","correction_principale":"<texte court>","conseil":"<texte court>"}`,
messages: [{ role: “user”, content: [
{ type: “image”, source: { type: “base64”, media_type: “image/jpeg”, data: imageData } },
{ type: “text”, text: `Combo: ${selectedCombo.name}. Correction instantanée en JSON uniquement.` }
]}]
})
});
const data = await response.json();
const text = data.content?.map(c => c.text || “”).join(””) || “”;
setLiveAnalysis(JSON.parse(text.replace(/`json|`/g, “”).trim()));
} catch {}
setLiveAnalyzing(false);
};

// ── Styles communs ──
const S = {
card: { background: “rgba(255,255,255,0.03)”, border: “1px solid rgba(255,255,255,0.07)”, borderRadius: 14, padding: 14 },
label: { fontSize: 11, letterSpacing: 3, fontFamily: “‘Bebas Neue’, cursive”, marginBottom: 10 },
input: { width: “100%”, background: “rgba(255,255,255,0.05)”, border: “1px solid rgba(255,255,255,0.1)”, borderRadius: 10, color: “#ccc”, fontSize: 12, padding: “10px 12px”, boxSizing: “border-box”, fontFamily: “Georgia, serif” },
btn: (color) => ({ width: “100%”, background: color, border: “none”, color: “#fff”, borderRadius: 12, padding: “13px”, cursor: “pointer”, fontFamily: “‘Bebas Neue’, cursive”, letterSpacing: 2, fontSize: 14, transition: “all 0.2s” }),
back: { background: “rgba(255,255,255,0.06)”, border: “1px solid rgba(255,255,255,0.1)”, color: “#fff”, borderRadius: “50%”, width: 36, height: 36, fontSize: 16, cursor: “pointer” },
};

if (tab === “combos”) return (
<div style={{ padding: “20px 16px 80px”, height: “100%”, overflowY: “auto”, position: “relative” }}>
{!isPremium && <PremiumLock feature="Crée tes propres combos, ajoute des vidéos de référence et personnalise chaque technique." onGoPaywall={goPaywall} />}
<div style={{ display: “flex”, justifyContent: “space-between”, alignItems: “center”, marginBottom: 20 }}>
<div>
<div style={{ …S.label, color: “#a855f7”, marginBottom: 2 }}>MES COMBOS</div>
<div style={{ fontSize: 22, fontFamily: “‘Bebas Neue’, cursive”, color: “#fff” }}>Bibliothèque</div>
</div>
<button onClick={() => { setShowCreateCombo(true); setEditingComboId(null); setNewComboName(””); setNewComboSteps(””); setNewComboCues(””); setRefVideoPreview(null); }} style={{background: “#a855f7”, border: “none”, color: “#fff”, borderRadius: 12, padding: “8px 14px”, cursor: “pointer”, fontFamily: “‘Bebas Neue’, cursive”, letterSpacing: 1, fontSize: 13,}}>+ CRÉER</button>
</div>

```
  {/* Formulaire création/édition */}
  {showCreateCombo && (
    <div style={{ ...S.card, border: "1px solid rgba(168,85,247,0.4)", marginBottom: 16 }}>
      <div style={{ ...S.label, color: "#a855f7" }}>{editingComboId ? "MODIFIER LE COMBO" : "NOUVEAU COMBO"}</div>
      <input placeholder="Nom du combo (ex: Jab / Cross / Teep)" value={newComboName} onChange={e => setNewComboName(e.target.value)}
        style={{ ...S.input, marginBottom: 10 }} />
      <div style={{ fontSize: 10, color: "#666", marginBottom: 4 }}>Frappes (une par ligne)</div>
      <textarea placeholder={"Jab\nCross\nRight Middle Kick"} value={newComboSteps} onChange={e => setNewComboSteps(e.target.value)}
        style={{ ...S.input, resize: "none", height: 80, marginBottom: 10 }} />
      <div style={{ fontSize: 10, color: "#666", marginBottom: 4 }}>Points clés à vérifier (un par ligne)</div>
      <textarea placeholder={"Garde haute\nRotation des hanches\nRetour en garde rapide"} value={newComboCues} onChange={e => setNewComboCues(e.target.value)}
        style={{ ...S.input, resize: "none", height: 80, marginBottom: 12 }} />

      {/* Vidéo de référence du coach */}
      <div style={{ fontSize: 10, color: "#f59e0b", marginBottom: 6, fontFamily: "'Bebas Neue', cursive", letterSpacing: 1 }}>📹 VIDÉO DE RÉFÉRENCE (coach)</div>
      <div onClick={() => refVideoInputRef.current?.click()} style={{border: `2px dashed ${refVideoPreview ? "rgba(245,158,11,0.5)" : "rgba(255,255,255,0.1)"}`, borderRadius: 12, padding: 12, textAlign: "center", cursor: "pointer", background: refVideoPreview ? "rgba(245,158,11,0.05)" : "rgba(255,255,255,0.02)", marginBottom: 12,}}>
        <input ref={refVideoInputRef} type="file" accept="video/*,image/*" style={{ display: "none" }} onChange={e => {
          const f = e.target.files[0]; if (!f) return;
          setRefVideoFile(f); setRefVideoPreview(URL.createObjectURL(f));
        }} />
        {refVideoPreview ? (
          refVideoFile?.type?.startsWith("video") || !refVideoFile ?
            <video src={refVideoPreview} controls style={{ width: "100%", borderRadius: 8, maxHeight: 120 }} /> :
            <img src={refVideoPreview} alt="ref" style={{ width: "100%", borderRadius: 8, maxHeight: 120, objectFit: "cover" }} />
        ) : (
          <div style={{ fontSize: 12, color: "#888" }}>📁 Ajouter ta vidéo de référence</div>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <button onClick={() => setShowCreateCombo(false)} style={{ ...S.btn("rgba(255,255,255,0.08)") }}>ANNULER</button>
        <button onClick={saveCombo} style={{ ...S.btn("#a855f7") }}>ENREGISTRER</button>
      </div>
    </div>
  )}

  {/* Liste des combos */}
  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
    {customCombos.map(c => (
      <div key={c.id} style={{ ...S.card, border: selectedComboId === c.id ? "1px solid rgba(168,85,247,0.4)" : undefined }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontFamily: "'Bebas Neue', cursive", color: "#fff", letterSpacing: 1 }}>{c.name}</div>
            <div style={{ fontSize: 10, color: "#666", marginTop: 3 }}>{c.steps.join(" → ")}</div>
          </div>
          <div style={{ display: "flex", gap: 6, marginLeft: 8 }}>
            <button onClick={() => startEdit(c)} style={{ background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)", color: "#f59e0b", borderRadius: 8, padding: "4px 8px", cursor: "pointer", fontSize: 12 }}>✏️</button>
            {c.id.startsWith("c") && !["c1","c2","c3"].includes(c.id) && (
              <button onClick={() => deleteCombo(c.id)} style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", borderRadius: 8, padding: "4px 8px", cursor: "pointer", fontSize: 12 }}>🗑</button>
            )}
          </div>
        </div>
        {c.refVideoUrl && (
          <div style={{ fontSize: 10, color: "#f59e0b", marginBottom: 8 }}>📹 Vidéo de référence ajoutée</div>
        )}
        <button onClick={() => { setSelectedComboId(c.id); setTab("analyse"); }} style={{...S.btn(selectedComboId === c.id ? "#a855f7" : "rgba(168,85,247,0.15)"), fontSize: 12, padding: "8px",}}>
          {selectedComboId === c.id ? "✓ SÉLECTIONNÉ" : "SÉLECTIONNER"}
        </button>
      </div>
    ))}
  </div>
</div>
```

);

if (tab === “historique”) {
if (showDetailHistory) {
const h = showDetailHistory;
return (
<div style={{ padding: “20px 16px 80px”, height: “100%”, overflowY: “auto” }}>
<div style={{ display: “flex”, alignItems: “center”, gap: 10, marginBottom: 20 }}>
<button onClick={() => setShowDetailHistory(null)} style={S.back}>←</button>
<div style={{ fontSize: 16, fontFamily: “‘Bebas Neue’, cursive”, color: “#fff” }}>DÉTAIL ANALYSE</div>
</div>
<div style={{ fontSize: 11, color: “#888”, marginBottom: 16 }}>{h.date} · {h.comboName}</div>
<div style={{ …S.card, textAlign: “center”, marginBottom: 12, background: “rgba(168,85,247,0.1)”, border: “1px solid rgba(168,85,247,0.3)” }}>
<div style={{ fontSize: 48, fontFamily: “‘Bebas Neue’, cursive”, color: h.score >= 70 ? “#22c55e” : h.score >= 40 ? “#f59e0b” : “#ef4444” }}>{h.score}<span style={{ fontSize: 20 }}>/100</span></div>
<div style={{ fontSize: 12, color: “#ccc”, fontStyle: “italic”, marginTop: 4 }}>{h.resume}</div>
</div>
{h.points_positifs?.length > 0 && (
<div style={{ …S.card, background: “rgba(34,197,94,0.07)”, border: “1px solid rgba(34,197,94,0.2)”, marginBottom: 10 }}>
<div style={{ …S.label, color: “#22c55e” }}>✅ POINTS POSITIFS</div>
{h.points_positifs.map((p, i) => <div key={i} style={{ fontSize: 12, color: “#aaa”, marginBottom: 4 }}>• {p}</div>)}
</div>
)}
{h.corrections?.length > 0 && (
<div style={{ …S.card, background: “rgba(239,68,68,0.07)”, border: “1px solid rgba(239,68,68,0.2)”, marginBottom: 10 }}>
<div style={{ …S.label, color: “#ef4444” }}>🔧 CORRECTIONS</div>
{h.corrections.map((c, i) => (
<div key={i} style={{ marginBottom: 10 }}>
<div style={{ fontSize: 12, color: “#ef4444”, fontFamily: “‘Bebas Neue’, cursive” }}>{c.element}</div>
<div style={{ fontSize: 11, color: “#888” }}>⚠ {c.probleme}</div>
<div style={{ fontSize: 11, color: “#ccc” }}>→ {c.correction}</div>
</div>
))}
</div>
)}
{h.conseil_global && (
<div style={{ …S.card, background: “rgba(168,85,247,0.07)”, border: “1px solid rgba(168,85,247,0.2)” }}>
<div style={{ …S.label, color: “#a855f7” }}>💡 CONSEIL</div>
<div style={{ fontSize: 12, color: “#ccc”, fontStyle: “italic” }}>{h.conseil_global}</div>
</div>
)}
</div>
);
}

```
return (
  <div style={{ padding: "20px 16px 80px", height: "100%", overflowY: "auto", position: "relative" }}>
    {!isPremium && <PremiumLock feature="L'historique complet et les graphiques de progression sont réservés aux membres Premium." onGoPaywall={goPaywall} />}
    <div style={{ ...S.label, color: "#22c55e", marginBottom: 2 }}>HISTORIQUE</div>
    <div style={{ fontSize: 22, fontFamily: "'Bebas Neue', cursive", color: "#fff", marginBottom: 20 }}>Progression</div>

    {history.length === 0 ? (
      <div style={{ ...S.card, textAlign: "center", padding: 32 }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>📊</div>
        <div style={{ fontSize: 13, color: "#666" }}>Aucune analyse pour l'instant.</div>
        <div style={{ fontSize: 11, color: "#555", marginTop: 6 }}>Lance une analyse dans l'onglet Coach IA !</div>
      </div>
    ) : (
      <>
        {/* Graphique d'évolution des scores */}
        {history.length > 1 && (
          <div style={{ ...S.card, marginBottom: 16 }}>
            <div style={{ ...S.label, color: "#a855f7" }}>ÉVOLUTION DU SCORE</div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 70 }}>
              {[...history].reverse().map((h, i) => (
                <div key={h.id} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div style={{width: "100%", borderRadius: 4, height: `${(h.score / 100) * 58}px`, background: i === history.length - 1 ? "#a855f7" : "rgba(168,85,247,0.3)",}} />
                  <span style={{ fontSize: 8, color: "#555" }}>{h.score}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Liste analyses */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {history.map(h => (
            <div key={h.id} onClick={() => setShowDetailHistory(h)} style={{ ...S.card, cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{width: 52, height: 52, borderRadius: 12, flexShrink: 0, background: h.score >= 70 ? "rgba(34,197,94,0.15)" : h.score >= 40 ? "rgba(245,158,11,0.15)" : "rgba(239,68,68,0.15)", border: `1px solid ${h.score >= 70 ? "rgba(34,197,94,0.3)" : h.score >= 40 ? "rgba(245,158,11,0.3)" : "rgba(239,68,68,0.3)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Bebas Neue', cursive", fontSize: 18, color: h.score >= 70 ? "#22c55e" : h.score >= 40 ? "#f59e0b" : "#ef4444",}}>{h.score}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontFamily: "'Bebas Neue', cursive", color: "#fff", letterSpacing: 1 }}>{h.comboName}</div>
                <div style={{ fontSize: 11, color: "#666", marginTop: 2 }}>{h.date}</div>
                <div style={{ fontSize: 11, color: "#888", marginTop: 2, fontStyle: "italic" }}>{h.resume?.substring(0, 50)}...</div>
              </div>
              <span style={{ color: "#555", fontSize: 14 }}>›</span>
            </div>
          ))}
        </div>
      </>
    )}
  </div>
);
```

}

if (mode === “live”) return (
<div style={{ padding: “0 0 80px”, height: “100%”, overflowY: “auto”, position: “relative” }}>
{!isPremium && <PremiumLock feature=“Le mode analyse en direct est réservé aux membres Premium.” onGoPaywall={() => { stopLive(); goPaywall(); }} />}
<canvas ref={canvasRef} style={{ display: “none” }} />
<div style={{ position: “relative”, width: “100%”, height: 260, background: “#000”, overflow: “hidden” }}>
<video ref={videoRef} autoPlay playsInline muted style={{ width: “100%”, height: “100%”, objectFit: “cover”, transform: “scaleX(-1)” }} />
{liveActive && (
<div style={{ position: “absolute”, top: 12, left: 12, background: “rgba(239,68,68,0.9)”, borderRadius: 20, padding: “4px 12px”, display: “flex”, alignItems: “center”, gap: 6 }}>
<div style={{ width: 6, height: 6, borderRadius: “50%”, background: “#fff” }} />
<span style={{ fontSize: 11, color: “#fff”, fontFamily: “‘Bebas Neue’, cursive”, letterSpacing: 1 }}>LIVE</span>
</div>
)}
<button onClick={() => { stopLive(); setMode(“menu”); }} style={{ position: “absolute”, top: 12, right: 12, …S.back }}>←</button>
</div>
<div style={{ padding: “14px 16px 0” }}>
<div style={{ fontSize: 11, color: “#a855f7”, fontFamily: “‘Bebas Neue’, cursive”, letterSpacing: 1, marginBottom: 10 }}>🥊 {selectedCombo.name}</div>
{selectedCombo.refVideoUrl && (
<div style={{ marginBottom: 10 }}>
<div style={{ fontSize: 10, color: “#f59e0b”, marginBottom: 6 }}>📹 Référence coach :</div>
<video src={selectedCombo.refVideoUrl} controls style={{ width: “100%”, borderRadius: 10, maxHeight: 100 }} />
</div>
)}
<button onClick={captureAndAnalyzeLive} disabled={!liveActive || liveAnalyzing} style={{ …S.btn(liveActive && !liveAnalyzing ? “#ef4444” : “rgba(239,68,68,0.2)”), marginBottom: 12 }}>
{liveAnalyzing ? “⏳ ANALYSE…” : “📸 CAPTURER ET ANALYSER”}
</button>
{liveAnalysis && (
<div style={{ …S.card, background: liveAnalysis.posture === “bon” ? “rgba(34,197,94,0.1)” : “rgba(239,68,68,0.1)”, border: `1px solid ${liveAnalysis.posture === "bon" ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}` }}>
<div style={{ fontSize: 11, color: liveAnalysis.posture === “bon” ? “#22c55e” : “#ef4444”, fontFamily: “‘Bebas Neue’, cursive”, letterSpacing: 1, marginBottom: 6 }}>
{liveAnalysis.posture === “bon” ? “✅ POSTURE OK” : “⚠ À CORRIGER”}
</div>
<div style={{ fontSize: 13, color: “#fff”, marginBottom: 6 }}>🔧 {liveAnalysis.correction_principale}</div>
<div style={{ fontSize: 12, color: “#aaa”, fontStyle: “italic” }}>💡 {liveAnalysis.conseil}</div>
</div>
)}
<div style={{ …S.card, marginTop: 12 }}>
<div style={{ …S.label, color: “#666” }}>POINTS CLÉS</div>
{selectedCombo.cues.map((c, i) => <div key={i} style={{ fontSize: 11, color: “#888”, marginBottom: 4 }}>• {c}</div>)}
</div>
</div>
</div>
);

if (mode === “video”) return (
<div style={{ padding: “20px 16px 80px”, height: “100%”, overflowY: “auto” }}>
<div style={{ display: “flex”, alignItems: “center”, gap: 10, marginBottom: 16 }}>
<button onClick={() => { setMode(“menu”); setAnalysis(null); setVideoFile(null); setVideoPreview(null); }} style={S.back}>←</button>
<div style={{ fontSize: 18, fontFamily: “‘Bebas Neue’, cursive”, color: “#fff” }}>ANALYSE VIDÉO</div>
</div>

```
  {/* Référence coach */}
  {selectedCombo.refVideoUrl && (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 10, color: "#f59e0b", fontFamily: "'Bebas Neue', cursive", letterSpacing: 1, marginBottom: 6 }}>📹 RÉFÉRENCE DU COACH</div>
      <video src={selectedCombo.refVideoUrl} controls style={{ width: "100%", borderRadius: 12, maxHeight: 140, background: "#000" }} />
    </div>
  )}

  <div style={{ background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.3)", borderRadius: 10, padding: "8px 14px", marginBottom: 14, display: "inline-block" }}>
    <span style={{ fontSize: 12, color: "#a855f7", fontFamily: "'Bebas Neue', cursive", letterSpacing: 1 }}>🥊 {selectedCombo.name}</span>
  </div>

  <div onClick={() => fileInputRef.current?.click()} style={{border: `2px dashed ${videoFile ? "rgba(168,85,247,0.5)" : "rgba(255,255,255,0.1)"}`, borderRadius: 16, padding: 20, textAlign: "center", cursor: "pointer", background: videoFile ? "rgba(168,85,247,0.05)" : "rgba(255,255,255,0.02)", marginBottom: 12,}}>
    <input ref={fileInputRef} type="file" accept="video/*,image/*" onChange={e => { const f = e.target.files[0]; if (!f) return; setVideoFile(f); setVideoPreview(URL.createObjectURL(f)); setAnalysis(null); }} style={{ display: "none" }} />
    {videoPreview ? (
      videoFile?.type?.startsWith("video") ?
        <video src={videoPreview} controls style={{ width: "100%", borderRadius: 10, maxHeight: 160 }} /> :
        <img src={videoPreview} alt="preview" style={{ width: "100%", borderRadius: 10, maxHeight: 160, objectFit: "cover" }} />
    ) : (
      <>
        <div style={{ fontSize: 36, marginBottom: 8 }}>📁</div>
        <div style={{ fontSize: 13, color: "#aaa", fontFamily: "'Bebas Neue', cursive", letterSpacing: 1 }}>APPUIE POUR CHOISIR</div>
        <div style={{ fontSize: 11, color: "#555", marginTop: 4 }}>Vidéo ou photo de ton combo</div>
      </>
    )}
  </div>

  <textarea placeholder="Notes pour le coach (optionnel)..." value={coachNotes} onChange={e => setCoachNotes(e.target.value)}
    style={{ ...S.input, resize: "none", height: 60, marginBottom: 12 }} />

  <button onClick={analyzeVideo} disabled={!videoFile || analyzing} style={{ ...S.btn(videoFile && !analyzing ? "#a855f7" : "rgba(168,85,247,0.2)"), boxShadow: videoFile && !analyzing ? "0 0 20px rgba(168,85,247,0.4)" : "none", marginBottom: 16 }}>
    {analyzing ? "⏳ ANALYSE EN COURS..." : "🤖 ANALYSER AVEC L'IA"}
  </button>

  {analysis && !analysis.error && (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ ...S.card, background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.3)", textAlign: "center" }}>
        <div style={{ ...S.label, color: "#a855f7" }}>SCORE TECHNIQUE</div>
        <div style={{ fontSize: 52, fontFamily: "'Bebas Neue', cursive", color: analysis.score >= 70 ? "#22c55e" : analysis.score >= 40 ? "#f59e0b" : "#ef4444" }}>
          {analysis.score}<span style={{ fontSize: 20 }}>/100</span>
        </div>
        <div style={{ fontSize: 12, color: "#ccc", marginTop: 4, fontStyle: "italic" }}>{analysis.resume}</div>
      </div>
      {analysis.points_positifs?.length > 0 && (
        <div style={{ ...S.card, background: "rgba(34,197,94,0.07)", border: "1px solid rgba(34,197,94,0.2)" }}>
          <div style={{ ...S.label, color: "#22c55e" }}>✅ POINTS POSITIFS</div>
          {analysis.points_positifs.map((p, i) => <div key={i} style={{ fontSize: 12, color: "#aaa", marginBottom: 5 }}>• {p}</div>)}
        </div>
      )}
      {analysis.corrections?.length > 0 && (
        <div style={{ ...S.card, background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)" }}>
          <div style={{ ...S.label, color: "#ef4444" }}>🔧 CORRECTIONS</div>
          {analysis.corrections.map((c, i) => (
            <div key={i} style={{ marginBottom: 12, paddingBottom: 10, borderBottom: i < analysis.corrections.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
              <div style={{ fontSize: 13, color: "#ef4444", fontFamily: "'Bebas Neue', cursive", letterSpacing: 1 }}>{c.element}</div>
              <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>⚠ {c.probleme}</div>
              <div style={{ fontSize: 12, color: "#ccc", marginTop: 2 }}>→ {c.correction}</div>
            </div>
          ))}
        </div>
      )}
      {analysis.conseil_global && (
        <div style={{ ...S.card, background: "rgba(168,85,247,0.07)", border: "1px solid rgba(168,85,247,0.2)" }}>
          <div style={{ ...S.label, color: "#a855f7" }}>💡 CONSEIL DU COACH</div>
          <div style={{ fontSize: 12, color: "#ccc", fontStyle: "italic", lineHeight: 1.6 }}>{analysis.conseil_global}</div>
        </div>
      )}
      <div style={{ fontSize: 10, color: "#555", textAlign: "center" }}>✓ Analyse sauvegardée dans l'historique</div>
    </div>
  )}
  {analysis?.error && <div style={{ ...S.card, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", fontSize: 12 }}>⚠ {analysis.error}</div>}
</div>
```

);

return (
<div style={{ padding: “20px 16px 80px”, height: “100%”, overflowY: “auto” }}>
<style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>

```
  {/* Header tabs */}
  <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
    {[
      { id: "analyse", label: "🤖 Coach IA" },
      { id: "combos", label: "🥊 Combos" },
      { id: "historique", label: "📊 Historique" },
    ].map(t => (
      <button key={t.id} onClick={() => setTab(t.id)} style={{flex: 1, background: tab === t.id ? "#a855f7" : "rgba(255,255,255,0.05)", border: "none", color: tab === t.id ? "#fff" : "#888", borderRadius: 20, padding: "8px 4px", cursor: "pointer", fontFamily: "'Bebas Neue', cursive", letterSpacing: 1, fontSize: 11, transition: "all 0.2s",}}>{t.label}</button>
    ))}
  </div>

  <div style={{ fontSize: 26, fontFamily: "'Bebas Neue', cursive", color: "#fff", letterSpacing: 1, marginBottom: 4 }}>
    Analyse ta <span style={{ color: "#a855f7" }}>technique</span>
  </div>
  <div style={{ fontSize: 12, color: "#888", marginBottom: !isPremium ? 12 : 20, fontStyle: "italic" }}>
    L'IA corrige tes mouvements comme un vrai coach
  </div>

  {/* Compteur analyses gratuit */}
  {!isPremium && (
    <div onClick={goPaywall} style={{background: dailyAnalyses >= 1 ? "rgba(239,68,38,0.1)" : "rgba(245,158,11,0.08)", border: `1px solid ${dailyAnalyses >= 1 ? "rgba(239,68,68,0.4)" : "rgba(245,158,11,0.25)"}`, borderRadius: 12, padding: "10px 14px", marginBottom: 20, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center",}}>
      <div>
        <div style={{ fontSize: 12, color: dailyAnalyses >= 1 ? "#ef4444" : "#f59e0b", fontFamily: "'Bebas Neue', cursive", letterSpacing: 1 }}>
          {dailyAnalyses >= 1 ? "🔒 LIMITE ATTEINTE" : "🎁 VERSION GRATUITE"}
        </div>
        <div style={{ fontSize: 10, color: "#666", marginTop: 2 }}>
          {dailyAnalyses >= 1 ? "Passe Premium pour analyser sans limite" : `${1 - dailyAnalyses} analyse restante aujourd'hui`}
        </div>
      </div>
      <span style={{ fontSize: 11, color: "#f59e0b", fontFamily: "'Bebas Neue', cursive", letterSpacing: 1 }}>⭐ PREMIUM →</span>
    </div>
  )}

  {/* Sélection combo */}
  <div style={{ ...S.label, color: "#a855f7" }}>COMBO SÉLECTIONNÉ</div>
  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
    {customCombos.map(c => (
      <button key={c.id} onClick={() => setSelectedComboId(c.id)} style={{background: selectedComboId === c.id ? "rgba(168,85,247,0.15)" : "rgba(255,255,255,0.03)", border: `1px solid ${selectedComboId === c.id ? "rgba(168,85,247,0.5)" : "rgba(255,255,255,0.08)"}`, borderRadius: 12, padding: "12px 14px", cursor: "pointer", textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center",}}>
        <div>
          <div style={{ fontSize: 13, fontFamily: "'Bebas Neue', cursive", color: selectedComboId === c.id ? "#a855f7" : "#ccc", letterSpacing: 1 }}>{c.name}</div>
          <div style={{ fontSize: 10, color: "#555", marginTop: 2 }}>{c.steps.join(" → ")}</div>
        </div>
        {c.refVideoUrl && <span style={{ fontSize: 14 }}>📹</span>}
      </button>
    ))}
    <button onClick={() => setTab("combos")} style={{ ...S.btn("rgba(168,85,247,0.1)"), border: "1px dashed rgba(168,85,247,0.3)", color: "#a855f7", fontSize: 12, padding: "10px" }}>
      + CRÉER UN NOUVEAU COMBO
    </button>
  </div>

  {/* Modes */}
  <div style={{ ...S.label, color: "#a855f7" }}>CHOISIR UN MODE</div>
  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
    <button onClick={() => setMode("video")} style={{background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.3)", borderRadius: 16, padding: "18px 12px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 8,}}>
      <span style={{ fontSize: 30 }}>🎬</span>
      <span style={{ fontSize: 13, fontFamily: "'Bebas Neue', cursive", color: "#a855f7", letterSpacing: 1 }}>VIDÉO / PHOTO</span>
      <span style={{ fontSize: 10, color: "#666", lineHeight: 1.4, textAlign: "center" }}>Analyse complète avec score</span>
    </button>
    <button onClick={() => { setMode("live"); startLive(); }} style={{background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 16, padding: "18px 12px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 8,}}>
      <span style={{ fontSize: 30 }}>📹</span>
      <span style={{ fontSize: 13, fontFamily: "'Bebas Neue', cursive", color: "#ef4444", letterSpacing: 1 }}>EN DIRECT</span>
      <span style={{ fontSize: 10, color: "#666", lineHeight: 1.4, textAlign: "center" }}>Corrections instantanées</span>
    </button>
  </div>

  {/* Stats rapides historique */}
  {history.length > 0 && (
    <div style={{ marginTop: 20 }}>
      <div style={{ ...S.label, color: "#22c55e" }}>DERNIÈRE ANALYSE</div>
      <div onClick={() => { setTab("historique"); setShowDetailHistory(history[0]); }} style={{ ...S.card, cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{width: 48, height: 48, borderRadius: 12, flexShrink: 0, background: history[0].score >= 70 ? "rgba(34,197,94,0.15)" : "rgba(245,158,11,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Bebas Neue', cursive", fontSize: 18, color: history[0].score >= 70 ? "#22c55e" : "#f59e0b",}}>{history[0].score}</div>
        <div>
          <div style={{ fontSize: 12, fontFamily: "'Bebas Neue', cursive", color: "#fff" }}>{history[0].comboName}</div>
          <div style={{ fontSize: 10, color: "#666" }}>{history[0].date} · Voir le détail →</div>
        </div>
      </div>
    </div>
  )}
</div>
```

);
}
// ───────────────────────────────────────────────────────────────

function NavBar({ active, setScreen }) {
const icons = [
{ id:“home”,       icon:“⊞”,  label:“Accueil” },
{ id:“programs”,   icon:“📋”, label:“Programmes” },
{ id:“techniques”, icon:“🥊”, label:“Techniques” },
{ id:“timer”,      icon:“⏱”,  label:“Timer” },
{ id:“coach”,      icon:“🤖”, label:“Coach IA” },
{ id:“profile”,    icon:“👤”, label:“Profil” },
];
return (
<div style={{position:“absolute”, bottom:0, left:0, right:0, background:“rgba(3,3,3,0.98)”, borderTop:`1px solid ${D.borderHi}`, display:“flex”, justifyContent:“space-around”, padding:“10px 0 22px”, backdropFilter:“blur(20px)”, zIndex:100, boxShadow:`0 -8px 32px rgba(0,0,0,0.8)`,}}>
{icons.map(i => {
const isActive = active === i.id;
return (
<button key={i.id} onClick={() => setScreen(i.id)} style={{background:“none”, border:“none”, cursor:“pointer”, display:“flex”, flexDirection:“column”, alignItems:“center”, gap:4, transition:“all 0.2s”, transform: isActive ? “translateY(-3px)” : “none”, position:“relative”,}}>
{isActive && (
<div style={{position:“absolute”, top:-10, width:32, height:2, background:`linear-gradient(90deg,transparent,${D.red},transparent)`, borderRadius:2,}}/>
)}
<div style={{width:36, height:36, borderRadius:10, display:“flex”, alignItems:“center”, justifyContent:“center”, background: isActive ? D.redMid : “transparent”, border: isActive ? `1px solid ${D.redBorder}` : “1px solid transparent”, transition:“all 0.2s”, boxShadow: isActive ? `0 0 12px rgba(255,26,26,0.3)` : “none”,}}>
<span style={{ fontSize:18 }}>{i.icon}</span>
</div>
<span style={{fontSize:9, fontFamily:D.heading, letterSpacing:1, color: isActive ? D.red : D.textMuted, transition:“all 0.2s”,}}>{i.label}</span>
</button>
);
})}
</div>
);
}

// ── DAILY QUOTES ──────────────────────────────────────────────
const QUOTES = [
{ text: “La douleur est temporaire. La gloire est éternelle.”, author: “Muay Thai” },
{ text: “Chaque round te rapproche de ta meilleure version.”, author: “Autam” },
{ text: “L’entraînement d’aujourd’hui est la victoire de demain.”, author: “Muay Thai” },
{ text: “Ce n’est pas la taille du guerrier qui compte, mais sa volonté.”, author: “Sagesse Thaï” },
{ text: “Discipline. Détermination. Dépassement.”, author: “Autam Muay Thai” },
{ text: “Le champion s’entraîne quand personne ne regarde.”, author: “Muay Thai” },
{ text: “Forge ton corps. Affûte ton esprit.”, author: “Autam Muay Thai” },
];

const getDailyQuote = () => QUOTES[new Date().getDay() % QUOTES.length];
const getDayStreak = () => parseInt(localStorage.getItem(“amt_streak”) || “0”);
const getTotalSessions = () => parseInt(localStorage.getItem(“amt_sessions”) || “0”);
const getWeeklySessions = () => {
try { return JSON.parse(localStorage.getItem(“amt_weekly”) || “[0,0,0,0,0,0,0]”); }
catch { return [0, 0, 0, 0, 0, 0, 0]; }
};

const AI_WORKOUTS = [
{ title: “Cardio Fondamental”, rounds: 5, duration: 3, rest: 1, level: “Débutant”, tags: [“Jab”, “Cross”, “Kick”], color: “#22c55e” },
{ title: “Puissance & Vitesse”, rounds: 6, duration: 3, rest: 60, level: “Intermédiaire”, tags: [“Combo”, “Genou”, “Coude”], color: “#f59e0b” },
{ title: “Guerrier Elite”, rounds: 8, duration: 3, rest: 45, level: “Avancé”, tags: [“Full body”, “Cardio”, “Force”], color: “#ef4444” },
{ title: “Récupération Active”, rounds: 4, duration: 2, rest: 90, level: “Tous niveaux”, tags: [“Technique”, “Souplesse”], color: “#a855f7” },
];

function HomeScreen({ setScreen, isPremium, user, trialDaysLeft }) {
const [visible, setVisible] = useState(false);
const [quoteVisible, setQuoteVisible] = useState(false);
const quote = getDailyQuote();
const streak = getDayStreak();
const totalSessions = getTotalSessions();
const weekly = getWeeklySessions();
const today = new Date().getDay();
const userName = user?.name?.split(” “)[0] || user?.email?.split(”@”)[0] || “Warrior”;
const aiWorkout = AI_WORKOUTS[new Date().getDay() % AI_WORKOUTS.length];

useEffect(() => {
setTimeout(() => setVisible(true), 80);
setTimeout(() => setQuoteVisible(true), 400);
}, []);

const dayLabels = [“D”, “L”, “M”, “M”, “J”, “V”, “S”];

return (
<div style={{ padding: “0 0 90px”, overflowY: “auto”, height: “100%”, background: “#0a0a0a” }}>
<style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } } @keyframes pulse2 { 0%,100%{transform:scale(1)} 50%{transform:scale(1.04)} } @keyframes shimmer { 0%{opacity:0.6} 50%{opacity:1} 100%{opacity:0.6} }`}</style>

```
  {/* ── HERO ── */}
  <div style={{position: "relative", height: 220, background: "#0a0a0a", overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "0 20px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)",}}>
    {/* Background line art */}
    <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.04 }} viewBox="0 0 375 220">
      <circle cx="320" cy="40" r="120" fill="none" stroke="#ef4444" strokeWidth="60"/>
      <circle cx="320" cy="40" r="80" fill="none" stroke="#fff" strokeWidth="1"/>
    </svg>

    {/* Greeting */}
    <div style={{opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(12px)", transition: "all 0.5s ease",}}>
      <div style={{ fontSize: 12, color: "#555", letterSpacing: 2, fontFamily: "'Bebas Neue', cursive", marginBottom: 4 }}>
        {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" }).toUpperCase()}
      </div>
      <div style={{ fontSize: 28, fontFamily: "'Bebas Neue', cursive", color: "#fff", letterSpacing: 1, lineHeight: 1.1 }}>
        BON RETOUR,<br />
        <span style={{ color: "#ef4444" }}>{userName.toUpperCase()}</span>
      </div>
    </div>

    {/* Streak badge */}
    {streak > 0 && (
      <div style={{position: "absolute", top: 16, right: 16, background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 20, padding: "6px 12px", display: "flex", alignItems: "center", gap: 6, animation: "shimmer 2s infinite",}}>
        <span style={{ fontSize: 14 }}>🔥</span>
        <span style={{ fontSize: 13, fontFamily: "'Bebas Neue', cursive", color: "#f59e0b", letterSpacing: 1 }}>
          {streak} JOURS
        </span>
      </div>
    )}

    {isPremium && trialDaysLeft > 0 && (
      <div style={{position: "absolute", top: streak > 0 ? 56 : 16, right: 16, background: "rgba(168,85,247,0.12)", border: "1px solid rgba(168,85,247,0.3)", borderRadius: 20, padding: "4px 10px",}}>
        <span style={{ fontSize: 10, fontFamily: "'Bebas Neue', cursive", color: "#a855f7", letterSpacing: 1 }}>
          🎁 {trialDaysLeft}J ESSAI
        </span>
      </div>
    )}
  </div>

  {/* ── CITATION DU JOUR ── */}
  <div style={{margin: "16px 16px 0", opacity: quoteVisible ? 1 : 0, transform: quoteVisible ? "none" : "translateY(10px)", transition: "all 0.6s ease 0.2s",}}>
    <div style={{background: "rgba(255,255,255,0.02)", borderLeft: "3px solid #ef4444", borderRadius: "0 12px 12px 0", padding: "12px 16px",}}>
      <div style={{ fontSize: 13, color: "#ddd", fontStyle: "italic", lineHeight: 1.5, marginBottom: 4 }}>
        "{quote.text}"
      </div>
      <div style={{ fontSize: 10, color: "#555", letterSpacing: 2, fontFamily: "'Bebas Neue', cursive" }}>
        — {quote.author}
      </div>
    </div>
  </div>

  {/* ── ACTIVITÉ SEMAINE ── */}
  <div style={{ padding: "20px 16px 0" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
      <div style={{ fontSize: 11, color: "#ef4444", letterSpacing: 3, fontFamily: "'Bebas Neue', cursive" }}>
        CETTE SEMAINE
      </div>
      <div style={{ fontSize: 11, color: "#666" }}>{totalSessions} séances au total</div>
    </div>
    <div style={{background: "rgba(255,255,255,0.02)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.05)", padding: "14px 16px",}}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 50, marginBottom: 8 }}>
        {dayLabels.map((d, i) => {
          const isToday = i === today;
          const val = weekly[i] || 0;
          const h = Math.max(4, (val / Math.max(...weekly, 1)) * 42);
          return (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{width: "100%", borderRadius: 4, height: `${h}px`, background: isToday ? "#ef4444" : val > 0 ? "rgba(220,38,38,0.4)" : "rgba(255,255,255,0.06)", transition: "all 0.3s", boxShadow: isToday ? "0 0 8px rgba(239,68,68,0.5)" : "none",}} />
              <span style={{ fontSize: 9, color: isToday ? "#ef4444" : "#555", fontFamily: "'Bebas Neue', cursive" }}>{d}</span>
            </div>
          );
        })}
      </div>
      {/* Stats rapides */}
      <div style={{ display: "flex", gap: 12, borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 12 }}>
        {[
          { icon: "🔥", label: `${streak} jours streak` },
          { icon: "⏱", label: `${totalSessions * 45}min total` },
          { icon: "🥊", label: `${totalSessions} séances` },
        ].map(s => (
          <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ fontSize: 11 }}>{s.icon}</span>
            <span style={{ fontSize: 10, color: "#666" }}>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  </div>

  {/* ── ENTRAÎNEMENT RECOMMANDÉ PAR L'IA ── */}
  <div style={{ padding: "20px 16px 0" }}>
    <div style={{ fontSize: 11, color: "#ef4444", letterSpacing: 3, fontFamily: "'Bebas Neue', cursive", marginBottom: 12 }}>
      RECOMMANDÉ PAR L'IA AUJOURD'HUI
    </div>
    <div style={{background: `linear-gradient(135deg, ${aiWorkout.color}18, ${aiWorkout.color}08)`, border: `1px solid ${aiWorkout.color}30`, borderRadius: 18, padding: 16, animation: "pulse2 4s infinite",}}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 20, fontFamily: "'Bebas Neue', cursive", color: "#fff", letterSpacing: 1 }}>
            {aiWorkout.title}
          </div>
          <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>
            {aiWorkout.rounds} rounds · {aiWorkout.duration} min · {aiWorkout.rest}s repos
          </div>
        </div>
        <span style={{fontSize: 10, color: aiWorkout.color, border: `1px solid ${aiWorkout.color}50`, borderRadius: 20, padding: "3px 10px", fontFamily: "'Bebas Neue', cursive", letterSpacing: 1,}}>{aiWorkout.level}</span>
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
        {aiWorkout.tags.map(t => (
          <span key={t} style={{fontSize: 10, color: "#aaa", background: "rgba(255,255,255,0.06)", borderRadius: 20, padding: "3px 8px",}}>{t}</span>
        ))}
      </div>
      <button onClick={() => setScreen("timer")} style={{width: "100%", border: "none", borderRadius: 12, padding: "12px", background: aiWorkout.color, color: "#000", fontFamily: "'Bebas Neue', cursive", letterSpacing: 2, fontSize: 14, cursor: "pointer", boxShadow: `0 0 20px ${aiWorkout.color}40`,}}>▶ DÉMARRER</button>
    </div>
  </div>

  {/* ── ACCÈS RAPIDE ── */}
  <div style={{ padding: "20px 16px 0" }}>
    <div style={{ fontSize: 11, color: "#ef4444", letterSpacing: 3, fontFamily: "'Bebas Neue', cursive", marginBottom: 12 }}>
      ACCÈS RAPIDE
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
      {[
        { icon: "💬", label: "Chat Coach", screen: "chat", accent: "#ef4444", sub: "Pose tes questions" },
        { icon: "⚡", label: "Défi du Jour", screen: "defi", accent: "#f59e0b", sub: "Généré par l'IA" },
        { icon: "🤖", label: "Coach IA", screen: "coach", accent: "#a855f7", sub: "Analyse ta technique" },
        { icon: "⏱", label: "Timer", screen: "timer", accent: "#22c55e", sub: "Chrono de rounds" },
      ].map((a, i) => (
        <button key={a.label} onClick={() => setScreen(a.screen)} style={{background: "rgba(255,255,255,0.02)", border: `1px solid rgba(255,255,255,0.06)`, borderRadius: 14, padding: "14px 12px", cursor: "pointer", textAlign: "left", display: "flex", flexDirection: "column", gap: 6, animation: `fadeUp 0.4s ease ${0.1 + i * 0.05}s both`,}}>
          <span style={{ fontSize: 22 }}>{a.icon}</span>
          <div>
            <div style={{ fontSize: 13, color: "#fff", fontFamily: "'Bebas Neue', cursive", letterSpacing: 1 }}>{a.label}</div>
            <div style={{ fontSize: 10, color: "#555", marginTop: 2 }}>{a.sub}</div>
          </div>
          <div style={{ width: 20, height: 2, background: a.accent, borderRadius: 2 }} />
        </button>
      ))}
    </div>
  </div>

  {/* ── MOTIVATION FINALE ── */}
  <div style={{ padding: "20px 16px 0" }}>
    <div style={{background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.04)", borderRadius: 16, padding: 16, display: "flex", alignItems: "center", gap: 14,}}>
      <div style={{width: 44, height: 44, borderRadius: 12, flexShrink: 0, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,}}>🏆</div>
      <div>
        <div style={{ fontSize: 13, fontFamily: "'Bebas Neue', cursive", color: "#fff", letterSpacing: 1 }}>
          CONTINUE COMME ÇA
        </div>
        <div style={{ fontSize: 11, color: "#555", marginTop: 2, lineHeight: 1.5 }}>
          Chaque séance compte. Tu construis quelque chose de grand.
        </div>
      </div>
    </div>
  </div>

</div>
```

);
}

// ── Audio helpers ──────────────────────────────────────────────
function createBeep(ctx, freq, duration, gain = 0.4) {
const osc = ctx.createOscillator();
const vol = ctx.createGain();
osc.connect(vol);
vol.connect(ctx.destination);
osc.type = “square”;
osc.frequency.setValueAtTime(freq, ctx.currentTime);
vol.gain.setValueAtTime(gain, ctx.currentTime);
vol.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
osc.start(ctx.currentTime);
osc.stop(ctx.currentTime + duration);
}

function playWarningBeep(ctx) {
[0, 0.22, 0.44].forEach(delay => {
const osc = ctx.createOscillator();
const vol = ctx.createGain();
osc.connect(vol); vol.connect(ctx.destination);
osc.type = “square”; osc.frequency.value = 880;
vol.gain.setValueAtTime(0.35, ctx.currentTime + delay);
vol.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.18);
osc.start(ctx.currentTime + delay);
osc.stop(ctx.currentTime + delay + 0.18);
});
}

function playEndGong(ctx) {
const osc1 = ctx.createOscillator();
const osc2 = ctx.createOscillator();
const vol = ctx.createGain();
osc1.connect(vol); osc2.connect(vol); vol.connect(ctx.destination);
osc1.type = “sine”; osc1.frequency.setValueAtTime(120, ctx.currentTime);
osc1.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 1.2);
osc2.type = “sine”; osc2.frequency.setValueAtTime(180, ctx.currentTime);
osc2.frequency.exponentialRampToValueAtTime(90, ctx.currentTime + 1.2);
vol.gain.setValueAtTime(0.8, ctx.currentTime);
vol.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.8);
osc1.start(ctx.currentTime); osc1.stop(ctx.currentTime + 1.8);
osc2.start(ctx.currentTime); osc2.stop(ctx.currentTime + 1.8);
}

function playRestEnd(ctx) {
[523, 659, 784].forEach((freq, i) => {
const osc = ctx.createOscillator();
const vol = ctx.createGain();
osc.connect(vol); vol.connect(ctx.destination);
osc.type = “sine”; osc.frequency.value = freq;
vol.gain.setValueAtTime(0.5, ctx.currentTime + i * 0.15);
vol.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.15 + 0.4);
osc.start(ctx.currentTime + i * 0.15);
osc.stop(ctx.currentTime + i * 0.15 + 0.4);
});
}
// ───────────────────────────────────────────────────────────────

function TimerScreen({ onSessionComplete }) {
const [rounds, setRounds] = useState(5);
const [roundTime, setRoundTime] = useState(180);
const [restTime, setRestTime] = useState(60);
const [running, setRunning] = useState(false);
const [phase, setPhase] = useState(“round”);
const [currentRound, setCurrentRound] = useState(1);
const [timeLeft, setTimeLeft] = useState(180);
const [flash, setFlash] = useState(false);
const [sessionModal, setSessionModal] = useState(false);
const [sessionMinutes, setSessionMinutes] = useState(0);
const intervalRef = useRef(null);
const audioCtxRef = useRef(null);
const warningPlayedRef = useRef(false);

const getAudioCtx = () => {
if (!audioCtxRef.current) {
audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
}
if (audioCtxRef.current.state === “suspended”) {
audioCtxRef.current.resume();
}
return audioCtxRef.current;
};

useEffect(() => {
setTimeLeft(roundTime);
warningPlayedRef.current = false;
}, [roundTime]);

useEffect(() => {
if (running) {
intervalRef.current = setInterval(() => {
setTimeLeft(t => {
const next = t - 1;

```
      if (next === 10 && !warningPlayedRef.current) {
        warningPlayedRef.current = true;
        playWarningBeep(getAudioCtx());
      }

      if (next <= 0) {
        warningPlayedRef.current = false;
        setFlash(true);
        setTimeout(() => setFlash(false), 600);

        if (phase === "round") {
          if (currentRound >= rounds) {
            playEndGong(getAudioCtx());
            setRunning(false);
            setCurrentRound(1);
            setPhase("round");
            setTimeLeft(roundTime);
            const mins = Math.round((rounds * roundTime) / 60);
            setSessionMinutes(mins);
            setTimeout(() => setSessionModal(true), 800);
            return 0;
          }
          playEndGong(getAudioCtx());
          setPhase("repos");
          return restTime;
        } else {
          playRestEnd(getAudioCtx());
          setPhase("round");
          setCurrentRound(r => r + 1);
          return roundTime;
        }
      }
      return next;
    });
  }, 1000);
}
return () => clearInterval(intervalRef.current);
```

}, [running, phase, currentRound, rounds, roundTime, restTime]);

const reset = () => {
setRunning(false);
clearInterval(intervalRef.current);
setCurrentRound(1);
setPhase(“round”);
setTimeLeft(roundTime);
warningPlayedRef.current = false;
};

const handleStartStop = () => {
getAudioCtx(); // unlock audio on tap
setRunning(r => !r);
};

const fmt = s => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
const progress = phase === “round” ? timeLeft / roundTime : timeLeft / restTime;
const circumference = 2 * Math.PI * 90;
const isWarning = timeLeft <= 10 && timeLeft > 0 && running;

return (
<div style={{ padding: “20px 16px 80px”, height: “100%”, overflowY: “auto”, position: “relative” }}>
{sessionModal && (
<SessionCompleteModal
minutes={sessionMinutes}
onClose={() => setSessionModal(false)}
onBadge={onSessionComplete || (() => {})}
/>
)}
{/* Flash overlay on end */}
{flash && (
<div style={{position: “absolute”, inset: 0, zIndex: 50, pointerEvents: “none”, background: phase === “round” ? “rgba(220,38,38,0.35)” : “rgba(34,197,94,0.35)”, animation: “flashFade 0.6s ease forwards”,}} />
)}
<style>{`@keyframes flashFade { from { opacity:1 } to { opacity:0 } } @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>

```
  <div style={{ fontSize: 11, color: "#ef4444", letterSpacing: 3, fontFamily: "'Bebas Neue', cursive", marginBottom: 20 }}>
    TIMER DE ROUND
  </div>

  {/* Phase badge */}
  <div style={{ textAlign: "center", marginBottom: 10 }}>
    <span style={{fontSize: 13, letterSpacing: 3, fontFamily: "'Bebas Neue', cursive", color: phase === "round" ? "#ef4444" : "#22c55e", background: phase === "round" ? "rgba(220,38,38,0.1)" : "rgba(34,197,94,0.1)", border: `1px solid ${phase === "round" ? "rgba(220,38,38,0.3)" : "rgba(34,197,94,0.3)"}`, borderRadius: 20, padding: "4px 16px",}}>
      {phase === "round" ? `ROUND ${currentRound} / ${rounds}` : "⏸ REPOS"}
    </span>
  </div>

  {/* 10s warning label */}
  {isWarning && (
    <div style={{textAlign: "center", marginBottom: 6, fontSize: 12, color: "#f59e0b", letterSpacing: 2, fontFamily: "'Bebas Neue', cursive", animation: "pulse 0.5s infinite",}}>
      ⚠ 10 SECONDES !
    </div>
  )}

  {/* Circle timer */}
  <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
    <div style={{ position: "relative", width: 220, height: 220 }}>
      <svg width="220" height="220" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="110" cy="110" r="90" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
        <circle cx="110" cy="110" r="90" fill="none"
          stroke={isWarning ? "#f59e0b" : phase === "round" ? "#ef4444" : "#22c55e"}
          strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - progress)}
          style={{ transition: "stroke-dashoffset 0.5s ease, stroke 0.3s" }}
        />
      </svg>
      <div style={{position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",}}>
        <div style={{fontSize: 52, fontFamily: "'Bebas Neue', cursive", color: isWarning ? "#f59e0b" : "#fff", letterSpacing: 2, lineHeight: 1, transition: "color 0.3s",}}>{fmt(timeLeft)}</div>
        <div style={{ fontSize: 11, color: "#666", marginTop: 4 }}>
          {phase === "round" ? "en cours" : "repos"}
        </div>
      </div>
    </div>
  </div>

  {/* Controls */}
  <div style={{ display: "flex", justifyContent: "center", gap: 16, marginBottom: 28 }}>
    <button onClick={reset} style={{background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", borderRadius: "50%", width: 52, height: 52, fontSize: 18, cursor: "pointer",}}>↩</button>
    <button onClick={handleStartStop} style={{background: running ? "rgba(220,38,38,0.8)" : "#ef4444", border: "none", color: "#fff", borderRadius: "50%", width: 72, height: 72, fontSize: 24, cursor: "pointer", boxShadow: "0 0 30px rgba(220,38,38,0.4)", transition: "all 0.2s",}}>{running ? "⏸" : "▶"}</button>
    <button onClick={() => { reset(); }} style={{background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", borderRadius: "50%", width: 52, height: 52, fontSize: 18, cursor: "pointer",}}>⏭</button>
  </div>

  {/* Settings */}
  <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 16 }}>
    <div style={{ fontSize: 11, color: "#666", letterSpacing: 2, fontFamily: "'Bebas Neue', cursive", marginBottom: 14 }}>PARAMÈTRES</div>
    {[
      { label: "Rounds", value: rounds, set: setRounds, min: 1, max: 12, step: 1, fmt: v => v },
      { label: "Durée du round", value: roundTime, set: v => { setRoundTime(v); if (!running) setTimeLeft(v); }, min: 60, max: 300, step: 30, fmt: v => `${v / 60} min` },
      { label: "Temps de repos", value: restTime, set: setRestTime, min: 15, max: 120, step: 15, fmt: v => `${v}s` },
    ].map(s => (
      <div key={s.label} style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: 12, color: "#aaa" }}>{s.label}</span>
          <span style={{ fontSize: 12, color: "#ef4444", fontFamily: "'Bebas Neue', cursive", letterSpacing: 1 }}>{s.fmt(s.value)}</span>
        </div>
        <input type="range" min={s.min} max={s.max} step={s.step} value={s.value}
          onChange={e => s.set(Number(e.target.value))}
          disabled={running}
          style={{ width: "100%", accentColor: "#ef4444" }}
        />
      </div>
    ))}
  </div>
</div>
```

);
}

// ── RICH CONTENT DATA ─────────────────────────────────────────
const RICH_TECHNIQUES = [
{ id:1, name:“Jab”, thai:“หมัดตรงซ้าย”, category:“Poing”, emoji:“👊”, level:“Débutant”, color:”#22c55e”,
desc:“Le jab est le coup de base du Muay Thai. Rapide et direct, il sert à mesurer la distance, perturber l’adversaire et ouvrir des combinaisons.”,
steps:[“Position en garde — pied gauche devant, mains hautes”,“Projeter le poing gauche en ligne droite vers la cible”,“Rotation légère de l’épaule et du tronc”,“Retour immédiat en garde — ne pas s’exposer”],
keys:[“Garde haute de l’autre main”,“Pivot léger sur le talon avant”,“Frappe avec les 2 premières phalanges”,“Expiration sur l’impact”],
errors:[“Baisser la garde de protection”,“Telegraphier le coup en abaissant l’épaule”,“Ne pas revenir en garde rapidement”] },

{ id:2, name:“Cross (Droit)”, thai:“หมัดตรงขวา”, category:“Poing”, emoji:“👊”, level:“Débutant”, color:”#22c55e”,
desc:“Le cross est le coup de poing puissant du poing arrière. C’est l’arme principale pour knockouter un adversaire.”,
steps:[“Partir de la garde — pied droit derrière”,“Pivoter sur la pointe du pied droit”,“Rotation complète des hanches et des épaules”,“Projeter le poing droit en ligne droite”],
keys:[“Rotation totale des hanches = puissance maximale”,“Pivot sur la pointe du pied arrière obligatoire”,“Menton dans l’épaule pour se protéger”,“Expirer fort sur l’impact”],
errors:[“Pas assez de rotation des hanches”,“Lever le talon arrière trop tôt”,“Oublier la garde gauche pendant le cross”] },

{ id:3, name:“Crochet”, thai:“หมัดเหวี่ยง”, category:“Poing”, emoji:“👊”, level:“Intermédiaire”, color:”#f59e0b”,
desc:“Le crochet frappe sur le côté de la mâchoire ou du corps. Très efficace pour passer la garde adverse.”,
steps:[“Coude à 90° — bras parallèle au sol”,“Rotation explosive du tronc et des hanches”,“Frappe circulaire vers la cible”,“Retour rapide en garde”],
keys:[“Coude horizontal — pas en diagonale”,“Poids sur le pied avant pour plus de puissance”,“Regarder la cible tout au long du mouvement”,“Courte distance = plus de dégâts”],
errors:[“Coude trop haut ou trop bas”,“Mouvement trop large et prévisible”,“Oublier de protéger le menton”] },

{ id:4, name:“Teep (Coup de pied frontal)”, thai:“ถีบ”, category:“Coup de pied”, emoji:“🦵”, level:“Débutant”, color:”#22c55e”,
desc:“Le Teep est le jab des pieds en Muay Thai. Il sert à contrôler la distance, stopper les attaques et pousser l’adversaire.”,
steps:[“Lever le genou haut vers la cible”,“Étendre la jambe rapidement et puissamment”,“Frapper avec la plante du pied”,“Retour rapide du pied au sol”],
keys:[“Lever le genou avant d’étendre — génère de la puissance”,“Frapper avec la plante complète du pied”,“Hanches vers l’avant pour maximiser la portée”,“Bras en arrière pour l’équilibre”],
errors:[“Frapper avec le bout du pied”,“Pas assez de montée de genou”,“Perdre l’équilibre — rester sur le pied d’appui”] },

{ id:5, name:“Roundhouse Kick”, thai:“เตะตัด”, category:“Coup de pied”, emoji:“🦵”, level:“Intermédiaire”, color:”#f59e0b”,
desc:“L’arme signature du Muay Thai. Circulaire et dévastateur, ce kick cible les cuisses, le corps ou la tête.”,
steps:[“Pivot sur le pied avant — talon vers la cible”,“Rotation explosive des hanches”,“Fouetter la jambe en arc de cercle”,“Frapper avec le tibia — pas le pied”,“Retour en garde ou poser le pied”],
keys:[“Tibia = arme, pas le pied”,“Rotation complète des hanches obligatoire”,“Pivot sur le talon du pied d’appui”,“Bras opposé protège la tête”,“Viser la cuisse = low kick, corps = mid kick, tête = high kick”],
errors:[“Frapper avec le pied au lieu du tibia”,“Pas assez de rotation des hanches”,“Pied d’appui trop rigide — pas de pivot”] },

{ id:6, name:“Coude Horizontal”, thai:“ศอกตัด”, category:“Coude”, emoji:“💥”, level:“Intermédiaire”, color:”#f59e0b”,
desc:“Le coude horizontal est une frappe dévastatrice à courte distance. Très efficace pour couper et knockouter.”,
steps:[“Position rapprochée de l’adversaire”,“Lever le coude à hauteur de tête”,“Fouetter horizontalement vers la cible”,“Rotation du corps pour amplifier la puissance”],
keys:[“Distance courte = coude efficace”,“Viser la tempe, l’arcade ou la mâchoire”,“Rotation du tronc = puissance maximale”,“Regarder la cible avant la frappe”],
errors:[“Trop loin de l’adversaire”,“Coude trop bas — frappe avec l’avant-bras”,“Pas de rotation du corps”] },

{ id:7, name:“Coude Montant”, thai:“ศอกงัด”, category:“Coude”, emoji:“💥”, level:“Avancé”, color:”#ef4444”,
desc:“Le coude montant frappe de bas en haut, idéal pour l’uppercut version Muay Thai. Très efficace sous le menton.”,
steps:[“Partir du bas — coude pointé vers le bas”,“Mouvement ascendant explosif”,“Viser le menton ou le nez”,“Corps entier dans le mouvement”],
keys:[“Genoux légèrement fléchis pour charger”,“Explosion des jambes vers le haut”,“Vise précisément le menton”,“Distance très courte nécessaire”],
errors:[“Ne pas utiliser les jambes”,“Distance trop grande”,“Angle incorrect — pas assez montant”] },

{ id:8, name:“Genou Droit”, thai:“เข่าตรง”, category:“Genou”, emoji:“🔥”, level:“Intermédiaire”, color:”#f59e0b”,
desc:“Le genou droit est une arme redoutable en clinch. Monté puissamment, il peut knockouter ou endommager les côtes.”,
steps:[“Saisir la nuque ou les épaules adverse (clinch)”,“Tirer la tête de l’adversaire vers le bas”,“Monter le genou explosiment vers le corps ou la tête”,“Corps droit — ne pas se pencher”],
keys:[“Clinch solide pour contrôler l’adversaire”,“Tirer la tête vers le genou ET monter le genou”,“Garder le corps droit pour la puissance”,“Alterner les deux genoux”],
errors:[“Clinch trop faible — adversaire s’échappe”,“Se pencher en arrière — perd de la puissance”,“Frapper avec la cuisse au lieu du genou”] },

{ id:9, name:“Genou Sauté”, thai:“เข่าลอย”, category:“Genou”, emoji:“🔥”, level:“Avancé”, color:”#ef4444”,
desc:“Le genou sauté est spectaculaire et dévastateur. Il permet de passer par-dessus la garde adverse.”,
steps:[“Élan et saut explosif sur un pied”,“Monter le genou en hauteur maximale”,“Viser le plexus, les côtes ou la tête”,“Atterrir en équilibre en garde”],
keys:[“Vitesse d’approche = puissance du genou”,“Viser haut pour dépasser la garde”,“Genoux = l’une des frappes les plus puissantes”,“Surprise = efficacité maximale”],
errors:[“Pas assez d’élan”,“Atterrir sans équilibre”,“Trop prévisible — combiner avec des feintes”] },

{ id:10, name:“Parade Haute”, thai:“การป้องกัน”, category:“Défense”, emoji:“🛡️”, level:“Débutant”, color:”#22c55e”,
desc:“La parade haute protège la tête des coups de poing et de certains kicks hauts.”,
steps:[“Coudes serrés contre les tempes”,“Avant-bras parallèles devant le visage”,“Absorber le coup sur les bras — pas sur les mains”,“Contre-attaque immédiate après”],
keys:[“Coudes serrés = protection maximale”,“Ne pas fermer les yeux — voir venir le coup”,“Garder les mains vers le haut”,“Préparer le contre pendant la défense”],
errors:[“Coudes trop écartés”,“Fermer les yeux”,“Rester passif — toujours contre-attaquer”] },

{ id:11, name:“Esquive Extérieure”, thai:“การหลบ”, category:“Défense”, emoji:“🛡️”, level:“Intermédiaire”, color:”#f59e0b”,
desc:“L’esquive extérieure permet d’éviter un coup tout en se plaçant pour contre-attaquer.”,
steps:[“Détecter le coup entrant”,“Pivoter sur le pied avant vers l’extérieur”,“Corps en dehors de la ligne d’attaque”,“Contre-attaque immédiate — tu es en position idéale”],
keys:[“Mouvement des pieds = clé de l’esquive”,“Garder les yeux sur l’adversaire”,“Petit mouvement suffit — économie d’énergie”,“Contre-attaque = partie intégrante de l’esquive”],
errors:[“Mouvement trop grand — perd l’équilibre”,“Fermer les yeux”,“Oublier le contre-attaque”] },

{ id:12, name:“Clinch (Corps à Corps)”, thai:“การจับคอ”, category:“Clinch”, emoji:“🤼”, level:“Avancé”, color:”#ef4444”,
desc:“Le clinch est une spécialité du Muay Thai. C’est la maîtrise du corps à corps pour frapper aux genoux et aux coudes.”,
steps:[“Saisir la nuque avec les deux mains”,“Croiser les poignets derrière la tête adverse”,“Contrôler la tête — diriger l’adversaire”,“Frapper avec genoux et coudes”],
keys:[“Mains derrière la nuque — pas sur les épaules”,“Contrôle de la tête = contrôle du corps”,“Tirer la tête vers le bas pour les genoux”,“Rester collé — ne pas s’éloigner”],
errors:[“Saisir les épaules — moins de contrôle”,“Bras pas croisés — adversaire s’échappe”,“Rester statique — bouger et dominer”] },
];

const RICH_PROGRAMS = [
{
id:“p1”, name:“Fondamentaux du Muay Thai”, weeks:4, level:“Débutant”, sessions:3, color:”#22c55e”, icon:“🌱”,
desc:“Programme idéal pour les débutants. Tu vas apprendre les bases du Muay Thai et construire ta condition physique.”,
objectif:“Maîtriser la garde, le jab, le cross et le teep. Développer l’endurance de base.”,
weekly: [
{ week:1, title:“Semaine 1 — La Garde et les Bases”, sessions:[
{ day:“Lundi”, title:“Découverte”, duration:45, exercises:[“Échauffement 10min”,“Garde et déplacements 10min”,“Jab x50 (lent)”,“Cross x50 (lent)”,“Shadowboxing 3x2min”,“Retour au calme”] },
{ day:“Mercredi”, title:“Technique”, duration:45, exercises:[“Échauffement 10min”,“Révision Jab-Cross”,“Teep x30 chaque jambe”,“Combinaison Jab-Cross x30”,“Gainage 3x30s”,“Étirements”] },
{ day:“Vendredi”, title:“Cardio”, duration:45, exercises:[“Corde à sauter 5min”,“Jab-Cross sur 3 rounds de 2min”,“Teep 2x20”,“Squats 3x20”,“Shadowboxing libre 5min”] },
]},
{ week:2, title:“Semaine 2 — Introduction aux Kicks”, sessions:[
{ day:“Lundi”, title:“Low Kick”, duration:50, exercises:[“Échauffement”,“Révision Jab-Cross”,“Low Kick technique x40”,“Combo Jab-Cross-Low Kick x20”,“Cardio 3 rounds 2min”] },
{ day:“Mercredi”, title:“Mid Kick”, duration:50, exercises:[“Échauffement”,“Révision technique”,“Mid Kick x30 chaque jambe”,“Combo Jab-Cross-Mid Kick”,“Gainage et étirements”] },
{ day:“Vendredi”, title:“Consolidation”, duration:55, exercises:[“5 rounds shadowboxing”,“Focus: Jab, Cross, Teep, Low Kick”,“Conditionnement physique”,“Étirements complets”] },
]},
],
nutrition:“Protéines 1.8g/kg, glucides complexes avant l’entraînement, hydratation minimum 2.5L/jour.”,
recuperation:“Étirements 15min après chaque séance, glace sur les zones douloureuses, sommeil 8h minimum.”,
},
{
id:“p2”, name:“Combat Conditioning”, weeks:6, level:“Intermédiaire”, sessions:4, color:”#f59e0b”, icon:“⚡”,
desc:“Programme pour développer ta puissance, ta vitesse et ton endurance de combat.”,
objectif:“Maîtriser les combinaisons avancées, développer la puissance des frappes et l’endurance de combat.”,
weekly:[
{ week:1, title:“Semaine 1 — Puissance”, sessions:[
{ day:“Lundi”, title:“Poings et vitesse”, duration:60, exercises:[“Échauffement intense 15min”,“Jab-Cross-Crochet 5x3min”,“Vitesse de combinaison”,“Sac de frappe 4 rounds”,“Gainage avancé”] },
{ day:“Mardi”, title:“Kicks et tibia”, duration:60, exercises:[“Conditionnement tibia”,“Roundhouse Kick x50”,“Mid et High Kick technique”,“Combinaisons avec kicks”,“Étirements approfondis”] },
{ day:“Jeudi”, title:“Coudes et genoux”, duration:60, exercises:[“Coude horizontal technique”,“Genou droit en clinch”,“Combinaisons corps à corps”,“Cardio intensif 5 rounds”,“Récupération active”] },
{ day:“Samedi”, title:“Sparring technique”, duration:60, exercises:[“Échauffement complet”,“Sparring léger 6 rounds”,“Focus défenses et esquives”,“Retour au calme 15min”] },
]},
],
nutrition:“Protéines 2g/kg, repas pré-entraînement 2h avant, créatine optionnelle, hydratation sportive.”,
recuperation:“Massage 2x/semaine, bain froid après séances intenses, sommeil 8-9h, repos actif les jours off.”,
},
{
id:“p3”, name:“Guerrier Élite”, weeks:8, level:“Avancé”, sessions:5, color:”#ef4444”, icon:“🔥”,
desc:“Programme de préparation combat niveau élite. Intensité maximale, technique parfaite.”,
objectif:“Atteindre un niveau de compétition. Maîtriser toutes les armes du Muay Thai.”,
weekly:[
{ week:1, title:“Semaine 1 — Fondation Elite”, sessions:[
{ day:“Lundi”, title:“Puissance explosive”, duration:90, exercises:[“Conditionnement 20min”,“Sac lourd 8 rounds 3min”,“Combinaisons explosives”,“Pad work 4 rounds”,“Gainage avancé 20min”] },
{ day:“Mardi”, title:“Technique et vitesse”, duration:75, exercises:[“Shadowboxing technique 6 rounds”,“Vitesse de main 15min”,“Kicks techniques 5 rounds”,“Défenses et esquives 20min”] },
{ day:“Mercredi”, title:“Clinch et corps à corps”, duration:75, exercises:[“Clinch drilling 30min”,“Genoux en clinch 5 rounds”,“Coudes et sorties de clinch”,“Conditionnement spécifique”] },
{ day:“Vendredi”, title:“Sparring complet”, duration:90, exercises:[“Échauffement complet”,“Sparring 8 rounds 3min”,“Analyse et corrections”,“Récupération 20min”] },
{ day:“Samedi”, title:“Cardio et récup”, duration:60, exercises:[“Jogging 30min”,“Étirements approfondis”,“Récupération active”,“Préparation mentale”] },
]},
],
nutrition:“Plan nutritionnel strict, timing des repas précis, supplémentation, hydratation optimisée.”,
recuperation:“Récupération = partie de l’entraînement. Cryothérapie, massages quotidiens, sommeil 9h, méditation.”,
},
];

const GLOSSAIRE = [
{ thai:“มวยไทย”, roman:“Muay Thai”, fr:“Boxe Thaïlandaise”, desc:“L’art des 8 membres — poings, pieds, coudes, genoux” },
{ thai:“วาย”, roman:“Wai Kru”, fr:“Salut au maître”, desc:“Rituel d’avant combat pour honorer les maîtres et esprits” },
{ thai:“ครู”, roman:“Kru”, fr:“Professeur”, desc:“Titre donné au coach ou maître en Muay Thai” },
{ thai:“ยก”, roman:“Yok”, fr:“Round”, desc:“Période de combat (généralement 3 minutes)” },
{ thai:“หมัด”, roman:“Mud”, fr:“Poing”, desc:“Coup de poing en général” },
{ thai:“เตะ”, roman:“Tae”, fr:“Coup de pied”, desc:“Kick en général” },
{ thai:“ศอก”, roman:“Sok”, fr:“Coude”, desc:“Frappe de coude” },
{ thai:“เข่า”, roman:“Khao”, fr:“Genou”, desc:“Frappe de genou” },
{ thai:“ถีบ”, roman:“Teep”, fr:“Coup de pied frontal”, desc:“Coup de pied de face, le jab des pieds” },
{ thai:“เตะตัด”, roman:“Tae Tad”, fr:“Roundhouse Kick”, desc:“Coup de pied circulaire — arme signature” },
{ thai:“จับคอ”, roman:“Chap Kho”, fr:“Clinch”, desc:“Corps à corps, spécialité du Muay Thai” },
{ thai:“หมัดตรง”, roman:“Mud Trong”, fr:“Direct”, desc:“Coup de poing direct (jab ou cross)” },
{ thai:“หมัดเหวี่ยง”, roman:“Mud Wiang”, fr:“Crochet”, desc:“Coup de poing circulaire” },
{ thai:“ป้องกัน”, roman:“Pong Kan”, fr:“Défense / Parade”, desc:“Protection contre les frappes” },
{ thai:“ค่าย”, roman:“Khai”, fr:“Camp d’entraînement”, desc:“Gym ou école de Muay Thai” },
{ thai:“นักมวย”, roman:“Nak Muay”, fr:“Boxeur”, desc:“Pratiquant de Muay Thai” },
];

const NUTRITION_TIPS = [
{ icon:“🥩”, title:“Protéines”, color:”#ef4444”, tips:[
“1.8 à 2.2g de protéines par kg de poids corporel”,
“Répartis sur 4-5 repas dans la journée”,
“Sources : poulet, thon, œufs, légumineuses”,
“Whey protéine optionnelle après l’entraînement”,
]},
{ icon:“🍚”, title:“Glucides”, color:”#f59e0b”, tips:[
“Carburant principal pour l’entraînement intense”,
“Repas riche en glucides 2-3h avant la séance”,
“Riz, patate douce, avoine, quinoa”,
“Réduire après 18h si pas d’entraînement le soir”,
]},
{ icon:“🥑”, title:“Lipides”, color:”#22c55e”, tips:[
“Ne pas les éliminer — essentiels pour les hormones”,
“Sources saines : avocat, noix, huile d’olive”,
“20-30% des calories totales”,
“Oméga-3 anti-inflammatoires recommandés”,
]},
{ icon:“💧”, title:“Hydratation”, color:”#a855f7”, tips:[
“2.5 à 3.5L d’eau par jour minimum”,
“Peser avant/après l’entraînement : 1kg perdu = 1L à boire”,
“Boissons isotoniques pour séances > 90min”,
“Urine claire = bonne hydratation”,
]},
{ icon:“⏰”, title:“Timing des Repas”, color:”#06b6d4”, tips:[
“2-3h avant : repas complet (glucides + protéines)”,
“30-60min avant : snack léger si besoin”,
“Immédiatement après : protéines + glucides rapides”,
“2h après : repas complet de récupération”,
]},
{ icon:“😴”, title:“Récupération”, color:”#8b5cf6”, tips:[
“Sommeil 8-9h — la croissance musculaire se fait la nuit”,
“Étirements 15-20min après chaque séance”,
“Bain froid ou glace sur zones douloureuses”,
“Jour de repos actif : marche, yoga, natation légère”,
]},
];

function TechniquesScreen({ isPremium, goPaywall, initialTab }) {
const [tab, setTab] = useState(initialTab || “techniques”);
const [selected, setSelected] = useState(null);
const [catFilter, setCatFilter] = useState(“Tous”);
const [progFilter, setProgFilter] = useState(null);
const [selectedProg, setSelectedProg] = useState(null);
const [glossSearch, setGlossSearch] = useState(””);

const categories = [“Tous”, “Poing”, “Coup de pied”, “Coude”, “Genou”, “Défense”, “Clinch”];
const filtered = catFilter === “Tous” ? RICH_TECHNIQUES : RICH_TECHNIQUES.filter(t => t.category === catFilter);
const levelColors = { “Débutant”:”#22c55e”,“Intermédiaire”:”#f59e0b”,“Avancé”:”#ef4444” };

const tabs = [
{ id:“techniques”, label:“🥊 Techniques” },
{ id:“programs”,   label:“📋 Programmes” },
{ id:“nutrition”,  label:“🥗 Nutrition” },
{ id:“glossaire”,  label:“🇹🇭 Glossaire” },
];

return (
<div style={{ padding:“0 0 80px”, height:“100%”, overflowY:“auto”, background:D.bg }}>
{/* Header */}
<div style={{ padding:“20px 16px 0”, background:D.bg }}>
<SLabel>CONTENU & APPRENTISSAGE</SLabel>
</div>

```
  {/* Tabs */}
  <div style={{ display:"flex", gap:6, padding:"0 16px 16px", overflowX:"auto" }}>
    {tabs.map(t => (
      <button key={t.id} onClick={() => setTab(t.id)} style={{background: tab===t.id ? D.red : D.bgCard, border: `1px solid ${tab===t.id ? D.red : D.border}`, color: tab===t.id ? "#fff" : D.textMuted, borderRadius:20, padding:"7px 14px", cursor:"pointer", fontFamily:D.heading, letterSpacing:1, fontSize:11, flexShrink:0, boxShadow: tab===t.id ? D.shadowRed : "none", transition:"all 0.2s",}}>{t.label}</button>
    ))}
  </div>

  {/* ── TECHNIQUES ── */}
  {tab==="techniques" && (
    <div style={{ padding:"0 16px" }}>
      {/* Filtre catégorie */}
      <div style={{ display:"flex", gap:6, marginBottom:16, overflowX:"auto", paddingBottom:4 }}>
        {categories.map(c => (
          <button key={c} onClick={() => setCatFilter(c)} style={{background: catFilter===c ? D.redMid : "transparent", border: `1px solid ${catFilter===c ? D.borderHi : D.border}`, color: catFilter===c ? D.red : D.textMuted, borderRadius:20, padding:"5px 12px", cursor:"pointer", fontFamily:D.heading, letterSpacing:1, fontSize:10, flexShrink:0,}}>{c}</button>
        ))}
      </div>

      {selected ? (
        <div style={{ animation:"scaleIn 0.3s ease" }}>
          <button onClick={() => setSelected(null)} style={{ background:D.bgCard, border:`1px solid ${D.border}`, color:D.textPrimary, borderRadius:D.rm, padding:"8px 14px", cursor:"pointer", fontFamily:D.heading, letterSpacing:1, fontSize:12, marginBottom:14, display:"flex", alignItems:"center", gap:6 }}>
            ← RETOUR
          </button>
          <div style={{ background:`${selected.color}10`, border:`1px solid ${selected.color}30`, borderRadius:20, padding:18, marginBottom:12 }}>
            <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:12 }}>
              <span style={{ fontSize:44 }}>{selected.emoji}</span>
              <div>
                <div style={{ fontSize:24, fontFamily:D.heading, color:D.textPrimary, letterSpacing:2 }}>{selected.name}</div>
                <div style={{ fontSize:11, color:D.textMuted, fontStyle:"italic" }}>{selected.thai}</div>
                <span style={{ fontSize:10, color:selected.color, border:`1px solid ${selected.color}50`, borderRadius:20, padding:"2px 10px", fontFamily:D.heading, letterSpacing:1, marginTop:4, display:"inline-block" }}>{selected.level}</span>
              </div>
            </div>
            <p style={{ fontSize:13, color:D.textSecondary, lineHeight:1.7, margin:0 }}>{selected.desc}</p>
          </div>

          {/* Étapes */}
          <div style={{ background:D.bgCard, border:`1px solid ${D.border}`, borderRadius:D.rl, padding:14, marginBottom:10 }}>
            <SLabel color={selected.color}>📋 ÉTAPES D'EXÉCUTION</SLabel>
            {selected.steps.map((s,i) => (
              <div key={i} style={{ display:"flex", gap:12, marginBottom:10, alignItems:"flex-start" }}>
                <div style={{ width:24, height:24, borderRadius:"50%", background:`${selected.color}20`, border:`1px solid ${selected.color}50`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontFamily:D.heading, color:selected.color, flexShrink:0 }}>{i+1}</div>
                <div style={{ fontSize:13, color:D.textSecondary, lineHeight:1.6, paddingTop:3 }}>{s}</div>
              </div>
            ))}
          </div>

          {/* Points clés */}
          <div style={{ background:D.greenSoft, border:"1px solid rgba(0,230,118,0.2)", borderRadius:D.rl, padding:14, marginBottom:10 }}>
            <SLabel color={D.green}>✅ POINTS CLÉS</SLabel>
            {selected.keys.map((k,i) => (
              <div key={i} style={{ display:"flex", gap:8, marginBottom:6 }}>
                <span style={{ color:D.green, fontSize:12, flexShrink:0 }}>→</span>
                <span style={{ fontSize:12, color:D.textSecondary, lineHeight:1.5 }}>{k}</span>
              </div>
            ))}
          </div>

          {/* Erreurs courantes */}
          <div style={{ background:"rgba(255,26,26,0.06)", border:`1px solid ${D.redBorder}`, borderRadius:D.rl, padding:14, marginBottom:10 }}>
            <SLabel>⚠️ ERREURS À ÉVITER</SLabel>
            {selected.errors.map((e,i) => (
              <div key={i} style={{ display:"flex", gap:8, marginBottom:6 }}>
                <span style={{ color:D.red, fontSize:12, flexShrink:0 }}>✗</span>
                <span style={{ fontSize:12, color:D.textSecondary, lineHeight:1.5 }}>{e}</span>
              </div>
            ))}
          </div>

          <div style={{ background:D.bgCard, border:`1px solid ${D.border}`, borderRadius:D.rl, padding:12, textAlign:"center" }}>
            <div style={{ fontSize:12, color:D.red }}>🎥 Vidéo de démonstration disponible avec Premium</div>
          </div>
        </div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {filtered.map(t => (
            <div key={t.id} onClick={() => setSelected(t)} style={{ background:D.bgCard, border:`1px solid ${D.border}`, borderRadius:D.rl, padding:14, cursor:"pointer", display:"flex", alignItems:"center", gap:12, transition:"all 0.2s" }}>
              <span style={{ fontSize:28 }}>{t.emoji}</span>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14, fontFamily:D.heading, color:D.textPrimary, letterSpacing:1 }}>{t.name}</div>
                <div style={{ fontSize:10, color:t.color, marginTop:2 }}>{t.category}</div>
                <div style={{ fontSize:10, color:D.textMuted, marginTop:1, fontStyle:"italic" }}>{t.thai}</div>
              </div>
              <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:4 }}>
                <span style={{ fontSize:9, color:t.color, border:`1px solid ${t.color}40`, borderRadius:20, padding:"2px 8px", fontFamily:D.heading }}>{t.level}</span>
                <span style={{ color:D.textMuted, fontSize:14 }}>›</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )}

  {/* ── PROGRAMMES ── */}
  {tab==="programs" && (
    <div style={{ padding:"0 16px" }}>
      {selectedProg ? (
        <div style={{ animation:"scaleIn 0.3s ease" }}>
          <button onClick={() => setSelectedProg(null)} style={{ background:D.bgCard, border:`1px solid ${D.border}`, color:D.textPrimary, borderRadius:D.rm, padding:"8px 14px", cursor:"pointer", fontFamily:D.heading, letterSpacing:1, fontSize:12, marginBottom:14, display:"flex", alignItems:"center", gap:6 }}>
            ← RETOUR
          </button>
          <div style={{ background:`${selectedProg.color}10`, border:`1px solid ${selectedProg.color}30`, borderRadius:20, padding:18, marginBottom:14 }}>
            <div style={{ fontSize:32, marginBottom:8 }}>{selectedProg.icon}</div>
            <div style={{ fontSize:24, fontFamily:D.heading, color:D.textPrimary, letterSpacing:2, marginBottom:4 }}>{selectedProg.name}</div>
            <div style={{ fontSize:12, color:D.textSecondary, marginBottom:10, lineHeight:1.6 }}>{selectedProg.desc}</div>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {[
                { label:`${selectedProg.weeks} semaines`, icon:"📅" },
                { label:`${selectedProg.sessions}x/semaine`, icon:"💪" },
                { label:selectedProg.level, icon:"⚡" },
              ].map(s => (
                <span key={s.label} style={{ fontSize:11, color:selectedProg.color, background:`${selectedProg.color}15`, border:`1px solid ${selectedProg.color}30`, borderRadius:20, padding:"4px 10px" }}>
                  {s.icon} {s.label}
                </span>
              ))}
            </div>
          </div>

          <div style={{ background:D.bgCard, border:`1px solid ${D.border}`, borderRadius:D.rl, padding:14, marginBottom:10 }}>
            <SLabel color={selectedProg.color}>🎯 OBJECTIF</SLabel>
            <p style={{ fontSize:13, color:D.textSecondary, lineHeight:1.6, margin:0 }}>{selectedProg.objectif}</p>
          </div>

          {selectedProg.weekly?.map((w,wi) => (
            <div key={wi} style={{ background:D.bgCard, border:`1px solid ${D.border}`, borderRadius:D.rl, padding:14, marginBottom:10 }}>
              <SLabel color={selectedProg.color}>📆 {w.title}</SLabel>
              {w.sessions?.map((s,si) => (
                <div key={si} style={{ marginBottom:12, paddingBottom:10, borderBottom:si<w.sessions.length-1?`1px solid ${D.border}`:"none" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                    <div style={{ fontSize:13, fontFamily:D.heading, color:D.textPrimary, letterSpacing:1 }}>{s.day} — {s.title}</div>
                    <span style={{ fontSize:10, color:selectedProg.color }}>{s.duration}min</span>
                  </div>
                  {s.exercises.map((e,ei) => (
                    <div key={ei} style={{ fontSize:11, color:D.textMuted, marginBottom:3, display:"flex", gap:6 }}>
                      <span style={{ color:selectedProg.color, flexShrink:0 }}>•</span>{e}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))}

          <div style={{ background:"rgba(0,230,118,0.06)", border:"1px solid rgba(0,230,118,0.2)", borderRadius:D.rl, padding:14, marginBottom:10 }}>
            <SLabel color={D.green}>🥗 NUTRITION</SLabel>
            <p style={{ fontSize:12, color:D.textSecondary, lineHeight:1.7, margin:0 }}>{selectedProg.nutrition}</p>
          </div>

          <div style={{ background:"rgba(168,85,247,0.06)", border:"1px solid rgba(168,85,247,0.2)", borderRadius:D.rl, padding:14 }}>
            <SLabel color="#a855f7">😴 RÉCUPÉRATION</SLabel>
            <p style={{ fontSize:12, color:D.textSecondary, lineHeight:1.7, margin:0 }}>{selectedProg.recuperation}</p>
          </div>
        </div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {RICH_PROGRAMS.map(p => (
            <div key={p.id} onClick={() => setSelectedProg(p)} style={{ background:D.bgCard, border:`1px solid ${p.color}25`, borderRadius:20, padding:16, cursor:"pointer", position:"relative", overflow:"hidden" }}>
              <div style={{ position:"absolute", right:-10, top:-10, fontSize:70, opacity:0.06 }}>{p.icon}</div>
              <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:10 }}>
                <div style={{ width:52, height:52, borderRadius:14, background:`${p.color}15`, border:`1px solid ${p.color}40`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24 }}>{p.icon}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:18, fontFamily:D.heading, color:D.textPrimary, letterSpacing:1 }}>{p.name}</div>
                  <div style={{ fontSize:11, color:D.textMuted, marginTop:2 }}>{p.weeks} semaines · {p.sessions}x/semaine</div>
                </div>
                <span style={{ fontSize:10, color:p.color, border:`1px solid ${p.color}50`, borderRadius:20, padding:"3px 10px", fontFamily:D.heading }}>{p.level}</span>
              </div>
              <p style={{ fontSize:12, color:D.textMuted, lineHeight:1.5, margin:"0 0 12px" }}>{p.desc}</p>
              <div style={{ background:`${p.color}10`, border:`1px solid ${p.color}30`, borderRadius:D.rm, padding:"10px 14px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ fontSize:12, fontFamily:D.heading, color:p.color, letterSpacing:1 }}>VOIR LE PROGRAMME</span>
                <span style={{ color:p.color }}>›</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )}

  {/* ── NUTRITION ── */}
  {tab==="nutrition" && (
    <div style={{ padding:"0 16px" }}>
      <div style={{ background:D.redMid, border:`1px solid ${D.borderHi}`, borderRadius:20, padding:16, marginBottom:16, textAlign:"center" }}>
        <div style={{ fontSize:36, marginBottom:8 }}>🥗</div>
        <div style={{ fontSize:20, fontFamily:D.heading, color:D.textPrimary, letterSpacing:2, marginBottom:4 }}>NUTRITION DU GUERRIER</div>
        <div style={{ fontSize:12, color:D.textSecondary, lineHeight:1.5 }}>Mange pour performer, récupère pour progresser</div>
      </div>
      {NUTRITION_TIPS.map(n => (
        <div key={n.title} style={{ background:D.bgCard, border:`1px solid ${D.border}`, borderRadius:D.rl, padding:14, marginBottom:10 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
            <span style={{ fontSize:28 }}>{n.icon}</span>
            <div style={{ fontSize:16, fontFamily:D.heading, color:n.color, letterSpacing:2 }}>{n.title}</div>
          </div>
          {n.tips.map((t,i) => (
            <div key={i} style={{ display:"flex", gap:8, marginBottom:6, alignItems:"flex-start" }}>
              <span style={{ color:n.color, fontSize:12, flexShrink:0, marginTop:1 }}>→</span>
              <span style={{ fontSize:12, color:D.textSecondary, lineHeight:1.5 }}>{t}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  )}

  {/* ── GLOSSAIRE ── */}
  {tab==="glossaire" && (
    <div style={{ padding:"0 16px" }}>
      <div style={{ background:D.bgCard, border:`1px solid ${D.border}`, borderRadius:D.rl, padding:"10px 14px", marginBottom:14, display:"flex", alignItems:"center", gap:8 }}>
        <span style={{ fontSize:16 }}>🔍</span>
        <input value={glossSearch} onChange={e=>setGlossSearch(e.target.value)} placeholder="Rechercher un terme..." style={{ flex:1, background:"none", border:"none", color:D.textPrimary, fontSize:13, fontFamily:D.body }} />
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {GLOSSAIRE.filter(g => !glossSearch || g.fr.toLowerCase().includes(glossSearch.toLowerCase()) || g.roman.toLowerCase().includes(glossSearch.toLowerCase())).map((g,i) => (
          <div key={i} style={{ background:D.bgCard, border:`1px solid ${D.border}`, borderRadius:D.rl, padding:14 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:6 }}>
              <div>
                <div style={{ fontSize:20, fontFamily:D.heading, color:D.red, letterSpacing:1 }}>{g.roman}</div>
                <div style={{ fontSize:16, color:D.textSecondary }}>{g.thai}</div>
              </div>
              <div style={{ background:D.redMid, border:`1px solid ${D.borderHi}`, borderRadius:D.r, padding:"4px 10px" }}>
                <div style={{ fontSize:11, fontFamily:D.heading, color:D.red, letterSpacing:1 }}>{g.fr}</div>
              </div>
            </div>
            <div style={{ fontSize:12, color:D.textMuted, fontStyle:"italic" }}>{g.desc}</div>
          </div>
        ))}
      </div>
    </div>
  )}
</div>
```

);
}

function ProgramsScreen({ isPremium, goPaywall }) {
return <TechniquesScreen isPremium={isPremium} goPaywall={goPaywall} initialTab="programs" />;
}

// ── PROFILE SCREEN ────────────────────────────────────────────
function ProfileScreen({ setScreen, isPremium, user, onSignOut, trialDaysLeft }) {
const progStats = progression.getStats();
const badgeCount = (JSON.parse(localStorage.getItem(“amt_badges_unlocked”) || “[]”)).length;

const menuItems = [
{ icon:“📈”, label:“MA PROGRESSION”, sub:“Séances, calories, streak”, screen:“progression”, color:D.green },
{ icon:“🏆”, label:“MES BADGES”, sub:`${badgeCount} badge${badgeCount!==1?"s":""} débloqué${badgeCount!==1?"s":""}`, screen:“badges”, color:D.gold },
{ icon:“⭐”, label:“AVIS & NOTES”, sub:“Laisser un avis sur l’app”, screen:“reviews”, color:D.gold },
{ icon:“🌟”, label:“PARRAINAGE”, sub:“Inviter des amis”, screen:“referral”, color:D.gold },
{ icon:“💬”, label:“CHAT COACH IA”, sub:“Poser des questions”, screen:“chat”, color:D.red },
{ icon:“🔔”, label:“NOTIFICATIONS”, sub:“Rappels d’entraînement”, screen:“notifications”, color:”#a855f7” },
];

return (
<div style={{ padding:“16px 16px 90px”, height:“100%”, overflowY:“auto”, background:D.bg }}>

```
  {/* Avatar */}
  <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:20, padding:"4px 0" }}>
    <div style={{ width:60, height:60, borderRadius:"50%", background:`linear-gradient(135deg,${D.red},${D.redDeep})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, border:`2px solid ${D.borderHi}`, boxShadow:D.shadowRed, flexShrink:0 }}>🥊</div>
    <div style={{ flex:1 }}>
      <div style={{ fontSize:18, fontFamily:D.heading, color:D.textPrimary, letterSpacing:1 }}>
        {user?.name || user?.email?.split("@")[0] || "MON PROFIL"}
      </div>
      <div style={{ fontSize:11, color:D.textMuted, marginTop:1 }}>{user?.email}</div>
      {isPremium && trialDaysLeft > 0 && <div style={{ fontSize:11, color:D.gold, marginTop:3 }}>🎁 Essai · {trialDaysLeft}j restants</div>}
      {isPremium && trialDaysLeft === 0 && <div style={{ fontSize:11, color:D.gold, marginTop:3 }}>⭐ Premium actif</div>}
      {!isPremium && <div style={{ fontSize:11, color:D.textMuted, marginTop:3 }}>Version gratuite</div>}
    </div>
    <button onClick={onSignOut} style={{ background:D.bgCard, border:`1px solid ${D.border}`, color:D.textMuted, borderRadius:D.rm, padding:"6px 12px", cursor:"pointer", fontSize:10, fontFamily:D.heading, letterSpacing:1 }}>DÉCO</button>
  </div>

  {/* Stats rapides */}
  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:16 }}>
    {[
      { icon:"🥊", value:progStats.sessions||0, label:"Séances" },
      { icon:"🔥", value:`${progStats.streak||0}j`, label:"Streak" },
      { icon:"💪", value:progStats.totalCalories||0, label:"Calories" },
    ].map(s => (
      <div key={s.label} style={{ background:D.bgCard, border:`1px solid ${D.border}`, borderRadius:D.rl, padding:"12px 8px", textAlign:"center" }}>
        <div style={{ fontSize:18, marginBottom:4 }}>{s.icon}</div>
        <div style={{ fontSize:18, fontFamily:D.heading, color:D.textPrimary }}>{s.value}</div>
        <div style={{ fontSize:9, color:D.textMuted, marginTop:2 }}>{s.label}</div>
      </div>
    ))}
  </div>

  {/* Premium banner */}
  {isPremium ? (
    <div style={{ background:D.goldSoft, border:"1px solid rgba(212,160,23,0.3)", borderRadius:D.rl, padding:14, marginBottom:14, display:"flex", alignItems:"center", gap:12 }}>
      <span style={{ fontSize:24 }}>⭐</span>
      <div>
        <div style={{ fontSize:14, fontFamily:D.heading, color:D.gold, letterSpacing:1 }}>PREMIUM ACTIF</div>
        <div style={{ fontSize:11, color:D.textMuted, marginTop:2 }}>Toutes les fonctionnalités débloquées</div>
      </div>
    </div>
  ) : (
    <div style={{ background:D.goldSoft, border:"1px solid rgba(212,160,23,0.3)", borderRadius:D.rl, padding:14, marginBottom:14 }}>
      <div style={{ fontSize:13, fontFamily:D.heading, color:D.gold, letterSpacing:1, marginBottom:8 }}>🔒 VERSION GRATUITE</div>
      <div style={{ fontSize:11, color:D.textMuted, marginBottom:12, lineHeight:1.5 }}>Passe Premium pour débloquer Coach IA illimité, combos, historique et plus.</div>
      <button onClick={() => setScreen("paywall")} style={{ width:"100%", border:"none", borderRadius:D.rm, padding:"12px", background:`linear-gradient(135deg,${D.gold},#b8860b)`, color:"#000", fontFamily:D.heading, letterSpacing:2, fontSize:14, cursor:"pointer" }}>
        ⭐ PASSER PREMIUM — 9.99€/mois
      </button>
    </div>
  )}

  {/* Menu items */}
  <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:16 }}>
    {menuItems.map(item => (
      <button key={item.screen} onClick={() => setScreen(item.screen)} style={{width:"100%", border:`1px solid ${D.border}`, borderRadius:D.rl, padding:"12px 14px", background:D.bgCard, cursor:"pointer", display:"flex", alignItems:"center", gap:12, textAlign:"left", transition:"all 0.15s",}}>
        <div style={{ width:38, height:38, borderRadius:D.rm, background:`rgba(255,255,255,0.04)`, border:`1px solid ${D.border}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>{item.icon}</div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:13, fontFamily:D.heading, color:D.textPrimary, letterSpacing:1 }}>{item.label}</div>
          <div style={{ fontSize:10, color:D.textMuted, marginTop:2 }}>{item.sub}</div>
        </div>
        <span style={{ color:D.textMuted, fontSize:16 }}>›</span>
      </button>
    ))}
  </div>

  {/* Admin */}
  {user?.email === ADMIN_EMAIL && (
    <button onClick={() => setScreen("admin")} style={{ width:"100%", border:`1px solid rgba(212,160,23,0.4)`, borderRadius:D.rl, padding:"14px", background:`linear-gradient(135deg,#92400e,#1a0a00)`, color:D.gold, fontFamily:D.heading, letterSpacing:2, fontSize:14, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:10, marginBottom:16, boxShadow:"0 0 20px rgba(212,160,23,0.15)" }}>
      <span style={{ fontSize:18 }}>👑</span> PANNEAU COACH ADMIN
    </button>
  )}

  {/* Liens légaux */}
  <div style={{ display:"flex", gap:8, justifyContent:"center", flexWrap:"wrap" }}>
    <button onClick={() => setScreen("legal-privacy")} style={{ background:"none", border:`1px solid ${D.border}`, color:D.textMuted, borderRadius:20, padding:"5px 12px", cursor:"pointer", fontSize:10, fontFamily:D.heading, letterSpacing:1 }}>🔒 CONFIDENTIALITÉ</button>
    <button onClick={() => setScreen("legal-terms")} style={{ background:"none", border:`1px solid ${D.border}`, color:D.textMuted, borderRadius:20, padding:"5px 12px", cursor:"pointer", fontSize:10, fontFamily:D.heading, letterSpacing:1 }}>📋 CGU</button>
  </div>
  <div style={{ textAlign:"center", marginTop:10, fontSize:9, color:D.textMuted }}>Autam Muay Thai v1.0 · contact@autammuaythai.com</div>
</div>
```

);
}

// ── NOTIFICATIONS SYSTEM ──────────────────────────────────────
const NOTIF_MESSAGES = [
“C’est l’heure de t’entraîner ! 🥊”,
“Rappel d’entraînement 💪”,
“Autam Muay Thai t’attend ! 🔥”,
“Guerrier, c’est l’heure ! 🥊”,
];

const notifStorage = {
get: () => { try{return JSON.parse(localStorage.getItem(“amt_notif_settings”)||”{}”);} catch{return {};} },
set: (d) => localStorage.setItem(“amt_notif_settings”, JSON.stringify(d)),
};

function NotificationsScreen({setScreen}) {
const [s, setS] = useState(() => ({
dailyReminder:true, dailyHour:12, customDays:[1,2,3,4,5],
inactivityAlert:true, inactivityDays:2, permission:“default”,
…notifStorage.get(),
}));
const [testSent, setTestSent] = useState(false);
const [permErr, setPermErr] = useState(””);
const save = u => { const n={…s,…u}; setS(n); notifStorage.set(n); };
const tog = on => ({width:44,height:24,borderRadius:12,background:on?D.red:“rgba(255,255,255,0.1)”,position:“relative”,cursor:“pointer”,border:“none”,flexShrink:0});
const dot = on => ({position:“absolute”,width:18,height:18,borderRadius:“50%”,background:”#fff”,top:3,left:on?23:3,transition:“all 0.2s”});
const days = [{id:0,l:“D”},{id:1,l:“L”},{id:2,l:“M”},{id:3,l:“M”},{id:4,l:“J”},{id:5,l:“V”},{id:6,l:“S”}];

const reqPerm = async () => {
setPermErr(””);
if(!(“Notification” in window)){setPermErr(“Non supporté sur ce navigateur.”);return;}
const p = await Notification.requestPermission();
save({permission:p});
if(p===“denied”) setPermErr(“Bloquées — active-les dans les réglages.”);
};
const testNotif = () => {
if(s.permission!==“granted”){reqPerm();return;}
new Notification(“C’est l’heure de t’entraîner ! 🥊”, {body:“Forge ton corps. Affûte ton esprit !”});
setTestSent(true); setTimeout(()=>setTestSent(false),3000);
};

return (
<div style={{height:“100%”,display:“flex”,flexDirection:“column”,background:D.bg}}>
<div style={{background:D.bg,padding:“20px 16px 16px”,borderBottom:`1px solid ${D.border}`,display:“flex”,alignItems:“center”,gap:12}}>
<button onClick={()=>setScreen(“profile”)} style={{background:D.bgCard,border:`1px solid ${D.border}`,color:D.textPrimary,borderRadius:“50%”,width:36,height:36,fontSize:16,cursor:“pointer”}}>←</button>
<div>
<div style={{fontSize:20,fontFamily:D.heading,color:D.textPrimary,letterSpacing:2}}>🔔 NOTIFICATIONS</div>
<div style={{fontSize:10,color:D.textMuted}}>Rappels personnalisés</div>
</div>
</div>
<div style={{flex:1,overflowY:“auto”,padding:16}}>
{s.permission!==“granted” ? (
<div style={{background:“rgba(255,26,26,0.06)”,border:`1px solid ${D.borderHi}`,borderRadius:D.rl,padding:14,marginBottom:14}}>
<div style={{fontSize:13,fontFamily:D.heading,color:D.red,marginBottom:8}}>🔔 ACTIVER LES NOTIFICATIONS</div>
<button onClick={reqPerm} style={{width:“100%”,border:“none”,borderRadius:D.rm,padding:“12px”,background:D.red,color:”#fff”,fontFamily:D.heading,letterSpacing:2,fontSize:14,cursor:“pointer”}}>AUTORISER</button>
{permErr && <div style={{fontSize:11,color:D.gold,marginTop:8}}>⚠ {permErr}</div>}
</div>
) : (
<div style={{background:D.greenSoft,border:“1px solid rgba(0,230,118,0.3)”,borderRadius:D.rm,padding:“10px 14px”,marginBottom:14,display:“flex”,alignItems:“center”,gap:8}}>
<span style={{fontSize:16}}>✅</span><span style={{fontSize:12,color:D.green}}>Notifications autorisées</span>
</div>
)}

```
    <div style={{background:D.bgCard,border:`1px solid ${D.border}`,borderRadius:D.rl,padding:14,marginBottom:10}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:s.dailyReminder?14:0}}>
        <div>
          <div style={{fontSize:14,fontFamily:D.heading,color:D.textPrimary,letterSpacing:1}}>📅 RAPPEL QUOTIDIEN</div>
          <div style={{fontSize:11,color:D.textMuted,marginTop:2}}>Un rappel chaque jour</div>
        </div>
        <button onClick={()=>save({dailyReminder:!s.dailyReminder})} style={tog(s.dailyReminder)}><div style={dot(s.dailyReminder)}/></button>
      </div>
      {s.dailyReminder && (
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {[7,8,9,12,13,17,18,19,20,21].map(h=>(
            <button key={h} onClick={()=>save({dailyHour:h})} style={{background:s.dailyHour===h?D.red:"rgba(255,255,255,0.06)",border:"none",borderRadius:8,padding:"6px 10px",color:s.dailyHour===h?"#fff":D.textMuted,cursor:"pointer",fontSize:12,fontFamily:D.heading}}>{h}h</button>
          ))}
        </div>
      )}
    </div>

    <div style={{background:D.bgCard,border:`1px solid ${D.border}`,borderRadius:D.rl,padding:14,marginBottom:10}}>
      <div style={{fontSize:14,fontFamily:D.heading,color:D.textPrimary,letterSpacing:1,marginBottom:10}}>📆 JOURS D'ENTRAÎNEMENT</div>
      <div style={{display:"flex",gap:6,justifyContent:"space-between"}}>
        {days.map(d=>(
          <button key={d.id} onClick={()=>{const ds=s.customDays.includes(d.id)?s.customDays.filter(x=>x!==d.id):[...s.customDays,d.id];save({customDays:ds});}} style={{width:36,height:36,borderRadius:"50%",background:s.customDays.includes(d.id)?D.red:"rgba(255,255,255,0.06)",border:"none",color:s.customDays.includes(d.id)?"#fff":D.textMuted,cursor:"pointer",fontSize:11,fontFamily:D.heading}}>{d.l}</button>
        ))}
      </div>
    </div>

    <div style={{background:D.bgCard,border:`1px solid ${D.border}`,borderRadius:D.rl,padding:14,marginBottom:10}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:s.inactivityAlert?14:0}}>
        <div>
          <div style={{fontSize:14,fontFamily:D.heading,color:D.textPrimary,letterSpacing:1}}>⚠️ ALERTE INACTIVITÉ</div>
          <div style={{fontSize:11,color:D.textMuted,marginTop:2}}>Si tu n'ouvres pas l'app</div>
        </div>
        <button onClick={()=>save({inactivityAlert:!s.inactivityAlert})} style={tog(s.inactivityAlert)}><div style={dot(s.inactivityAlert)}/></button>
      </div>
      {s.inactivityAlert && (
        <div style={{display:"flex",gap:8}}>
          {[1,2,3,5,7].map(d=>(
            <button key={d} onClick={()=>save({inactivityDays:d})} style={{background:s.inactivityDays===d?D.gold:"rgba(255,255,255,0.06)",border:"none",borderRadius:8,padding:"6px 12px",color:s.inactivityDays===d?"#000":D.textMuted,cursor:"pointer",fontSize:12,fontFamily:D.heading}}>{d}j</button>
          ))}
        </div>
      )}
    </div>

    <button onClick={testNotif} style={{width:"100%",border:`1px solid ${testSent?"rgba(0,230,118,0.3)":D.borderHi}`,borderRadius:D.rl,padding:"13px",background:testSent?D.greenSoft:D.redMid,color:testSent?D.green:D.red,fontFamily:D.heading,letterSpacing:2,fontSize:14,cursor:"pointer",marginBottom:12}}>
      {testSent?"✅ ENVOYÉE !":"🔔 TESTER UNE NOTIFICATION"}
    </button>
    <div style={{textAlign:"center",fontSize:10,color:D.textMuted,lineHeight:1.6}}>Notifications push complètes disponibles sur App Store et Google Play</div>
  </div>
</div>
```

);
}

// ── LEGAL SCREEN ──────────────────────────────────────────────
function LegalScreen({ setScreen, initialTab = “privacy” }) {
const [tab, setTab] = useState(initialTab);

const privacy = [
{ title: “Qui sommes-nous ?”, content: “Autam Muay Thai est une application mobile d’entraînement de Muay Thai. Contact : contact@autammuaythai.com” },
{ title: “Données collectées”, content: “Nous collectons : votre email et nom à l’inscription, vos statistiques d’entraînement, et temporairement les vidéos/photos que vous uploadez pour l’analyse Coach IA (supprimées immédiatement après analyse). Nous ne stockons jamais vos données bancaires (gérées par Stripe).” },
{ title: “Utilisation des données”, content: “Vos données servent uniquement à : gérer votre compte, fournir les fonctionnalités de l’app, traiter vos paiements, et améliorer nos services. Nous ne vendons jamais vos données.” },
{ title: “Partenaires”, content: “Stripe (paiements), Supabase (base de données, serveurs en Europe), Anthropic Claude (analyse IA des vidéos), Apple/Google (distribution).” },
{ title: “Vos droits (RGPD)”, content: “Vous pouvez à tout moment : accéder à vos données, les corriger, les supprimer, ou en demander une copie. Contactez : privacy@autammuaythai.com” },
{ title: “Sécurité”, content: “Vos données sont chiffrées SSL/TLS, mots de passe hashés, serveurs hébergés en Europe. Votre compte peut être supprimé depuis les paramètres.” },
{ title: “Enfants”, content: “L’application est destinée aux personnes de 13 ans et plus. Nous ne collectons pas de données d’enfants de moins de 13 ans.” },
];

const terms = [
{ title: “Acceptation”, content: “En utilisant Autam Muay Thai, vous acceptez ces conditions. Si vous n’acceptez pas, n’utilisez pas l’application.” },
{ title: “Essai gratuit”, content: “7 jours Premium gratuit à l’inscription, sans carte bancaire. L’essai se termine automatiquement.” },
{ title: “Abonnement Premium”, content: “9.99€/mois ou 99.99€/an, renouvelé automatiquement. Annulable à tout moment. Garantie remboursement 7 jours sur premier abonnement.” },
{ title: “Utilisations interdites”, content: “Il est interdit de : revendre les contenus, pirater l’app, partager votre compte, uploader du contenu illégal ou offensant.” },
{ title: “⚠️ Avertissement santé”, content: “Le Muay Thai comporte des risques de blessure. Consultez un médecin avant tout programme. L’app ne remplace pas un coach certifié. Entraînez-vous toujours en sécurité.” },
{ title: “Propriété intellectuelle”, content: “L’app, son logo, ses contenus sont protégés. Toute reproduction sans autorisation est interdite.” },
{ title: “Responsabilité”, content: “Autam Muay Thai n’est pas responsable des blessures survenues lors de l’utilisation. Notre responsabilité est limitée au montant payé sur les 3 derniers mois.” },
{ title: “Contact”, content: “support@autammuaythai.com — Réponse sous 48h ouvrées.” },
];

const items = tab === “privacy” ? privacy : terms;

return (
<div style={{ height: “100%”, display: “flex”, flexDirection: “column”, background: “#0a0a0a” }}>
{/* Header */}
<div style={{background: “linear-gradient(135deg, #0a0a0a, #1a0000)”, padding: “20px 16px 16px”, borderBottom: “1px solid rgba(239,68,68,0.15)”, display: “flex”, alignItems: “center”, gap: 12,}}>
<button onClick={() => setScreen(“profile”)} style={{background: “rgba(255,255,255,0.06)”, border: “1px solid rgba(255,255,255,0.1)”, color: “#fff”, borderRadius: “50%”, width: 36, height: 36, fontSize: 16, cursor: “pointer”,}}>←</button>
<div>
<div style={{ fontSize: 18, fontFamily: “‘Bebas Neue’, cursive”, color: “#fff”, letterSpacing: 2 }}>DOCUMENTS LÉGAUX</div>
<div style={{ fontSize: 10, color: “#666” }}>Autam Muay Thai · Version 1.0 · Avril 2025</div>
</div>
</div>

```
  {/* Tabs */}
  <div style={{ display: "flex", background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
    {[
      { id: "privacy", label: "🔒 Confidentialité" },
      { id: "terms", label: "📋 CGU" },
    ].map(t => (
      <button key={t.id} onClick={() => setTab(t.id)} style={{flex: 1, background: "none", border: "none", borderBottom: tab === t.id ? "2px solid #ef4444" : "2px solid transparent", color: tab === t.id ? "#fff" : "#666", padding: "12px 8px", cursor: "pointer", fontFamily: "'Bebas Neue', cursive", letterSpacing: 1, fontSize: 12, transition: "all 0.2s",}}>{t.label}</button>
    ))}
  </div>

  {/* Content */}
  <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
    {items.map((item, i) => (
      <div key={i} style={{background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: 14, marginBottom: 10,}}>
        <div style={{ fontSize: 13, fontFamily: "'Bebas Neue', cursive", color: item.title.includes("⚠️") ? "#f59e0b" : "#ef4444", letterSpacing: 1, marginBottom: 6 }}>
          {item.title}
        </div>
        <div style={{ fontSize: 12, color: "#aaa", lineHeight: 1.7 }}>{item.content}</div>
      </div>
    ))}

    <div style={{ textAlign: "center", padding: "20px 0", borderTop: "1px solid rgba(255,255,255,0.06)", marginTop: 10 }}>
      <div style={{ fontSize: 24, marginBottom: 6 }}>🥊</div>
      <div style={{ fontSize: 10, color: "#444" }}>Autam Muay Thai · contact@autammuaythai.com</div>
    </div>
  </div>
</div>
```

);
}

// ── STRIPE LINKS ──────────────────────────────────────────────
const STRIPE_MONTHLY = “https://buy.stripe.com/4gM3cugClel31oxgPB18c00”;
const STRIPE_YEARLY  = “https://buy.stripe.com/4gMdR80Dnel39V3fLx18c01”;

// ── PAYWALL SCREEN ────────────────────────────────────────────
function PaywallScreen({ setScreen, onActivate }) {
const [plan, setPlan] = useState(“monthly”);

const freeFeatures = [
“1 analyse Coach IA par jour”,
“Timer basique”,
“3 combos prédéfinis”,
“Techniques de base”,
];

const premiumFeatures = [
“Coach IA illimité”,
“Créer ses propres combos”,
“Vidéos de référence du coach”,
“Historique complet + graphiques”,
“Programmes personnalisés par l’IA”,
“Mode live illimité”,
“Badges et progression”,
“Toutes les techniques avancées”,
];

const handleSubscribe = () => {
const url = plan === “monthly” ? STRIPE_MONTHLY : STRIPE_YEARLY;
window.open(url, “_blank”);
setTimeout(() => { onActivate(); setScreen(“home”); }, 1000);
};

return (
<div style={{ padding: “0 0 80px”, height: “100%”, overflowY: “auto” }}>
{/* Header */}
<div style={{background: “linear-gradient(135deg, #1a0a00, #0a0a0a)”, padding: “28px 20px 24px”, textAlign: “center”, borderBottom: “1px solid rgba(245,158,11,0.2)”, position: “relative”,}}>
<button onClick={() => setScreen(“profile”)} style={{position: “absolute”, top: 16, left: 16, background: “rgba(255,255,255,0.06)”, border: “1px solid rgba(255,255,255,0.1)”, color: “#fff”, borderRadius: “50%”, width: 34, height: 34, fontSize: 15, cursor: “pointer”,}}>←</button>
<div style={{ fontSize: 36, marginBottom: 8 }}>⭐</div>
<div style={{ fontSize: 32, fontFamily: “‘Bebas Neue’, cursive”, color: “#f59e0b”, letterSpacing: 2 }}>AUTAM PREMIUM</div>
<div style={{ fontSize: 13, color: “#888”, marginTop: 6, fontStyle: “italic” }}>
Débloque tout le potentiel de ton entraînement
</div>
</div>

```
  <div style={{ padding: "20px 16px 0" }}>
    {/* Comparaison */}
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>
      {/* Gratuit */}
      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 14 }}>
        <div style={{ fontSize: 13, fontFamily: "'Bebas Neue', cursive', cursive", color: "#888", letterSpacing: 1, marginBottom: 12 }}>GRATUIT</div>
        {freeFeatures.map((f, i) => (
          <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "flex-start" }}>
            <span style={{ color: "#22c55e", fontSize: 12, marginTop: 1 }}>✓</span>
            <span style={{ fontSize: 11, color: "#888", lineHeight: 1.4 }}>{f}</span>
          </div>
        ))}
      </div>
      {/* Premium */}
      <div style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.35)", borderRadius: 16, padding: 14, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -12, right: -12, fontSize: 60, opacity: 0.06 }}>⭐</div>
        <div style={{ fontSize: 13, fontFamily: "'Bebas Neue', cursive", color: "#f59e0b", letterSpacing: 1, marginBottom: 12 }}>PREMIUM</div>
        {premiumFeatures.map((f, i) => (
          <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "flex-start" }}>
            <span style={{ color: "#f59e0b", fontSize: 12, marginTop: 1 }}>⭐</span>
            <span style={{ fontSize: 11, color: "#ddd", lineHeight: 1.4 }}>{f}</span>
          </div>
        ))}
      </div>
    </div>

    {/* Sélecteur de plan */}
    <div style={{ fontSize: 11, color: "#f59e0b", letterSpacing: 3, fontFamily: "'Bebas Neue', cursive", marginBottom: 12 }}>CHOISIR TON PLAN</div>
    <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
      {/* Mensuel */}
      <div onClick={() => setPlan("monthly")} style={{background: plan === "monthly" ? "rgba(245,158,11,0.1)" : "rgba(255,255,255,0.03)", border: `2px solid ${plan === "monthly" ? "#f59e0b" : "rgba(255,255,255,0.08)"}`, borderRadius: 14, padding: "14px 16px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", transition: "all 0.2s",}}>
        <div>
          <div style={{ fontSize: 15, fontFamily: "'Bebas Neue', cursive", color: plan === "monthly" ? "#f59e0b" : "#ccc", letterSpacing: 1 }}>MENSUEL</div>
          <div style={{ fontSize: 11, color: "#666", marginTop: 2 }}>Sans engagement · Résiliable à tout moment</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 22, fontFamily: "'Bebas Neue', cursive", color: plan === "monthly" ? "#f59e0b" : "#ccc" }}>9.99€</div>
          <div style={{ fontSize: 10, color: "#666" }}>/mois</div>
        </div>
      </div>

      {/* Annuel */}
      <div onClick={() => setPlan("yearly")} style={{background: plan === "yearly" ? "rgba(245,158,11,0.1)" : "rgba(255,255,255,0.03)", border: `2px solid ${plan === "yearly" ? "#f59e0b" : "rgba(255,255,255,0.08)"}`, borderRadius: 14, padding: "14px 16px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", transition: "all 0.2s", position: "relative", overflow: "hidden",}}>
        <div style={{position: "absolute", top: 0, right: 0, background: "#ef4444", color: "#fff", fontSize: 9, fontFamily: "'Bebas Neue', cursive", letterSpacing: 1, padding: "3px 10px", borderRadius: "0 14px 0 10px",}}>-17% 🔥</div>
        <div>
          <div style={{ fontSize: 15, fontFamily: "'Bebas Neue', cursive", color: plan === "yearly" ? "#f59e0b" : "#ccc", letterSpacing: 1 }}>ANNUEL</div>
          <div style={{ fontSize: 11, color: "#666", marginTop: 2 }}>99.99€/an · Économise 20€</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 22, fontFamily: "'Bebas Neue', cursive", color: plan === "yearly" ? "#f59e0b" : "#ccc" }}>8.33€</div>
          <div style={{ fontSize: 10, color: "#666" }}>/mois</div>
        </div>
      </div>
    </div>

    {/* CTA */}
    <button onClick={handleSubscribe} style={{width: "100%", border: "none", borderRadius: 16, padding: "16px", background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "#000", fontFamily: "'Bebas Neue', cursive", letterSpacing: 2, fontSize: 16, cursor: "pointer", boxShadow: "0 0 30px rgba(245,158,11,0.4)", transition: "all 0.3s", marginBottom: 8,}}>
      {`⭐ PASSER PREMIUM — ${plan === "monthly" ? "9.99€/mois" : "99.99€/an"}`}
    </button>

    {/* Stripe badge */}
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 10 }}>
      <span style={{ fontSize: 14 }}>🔒</span>
      <span style={{ fontSize: 11, color: "#f59e0b", fontFamily: "'Bebas Neue', cursive", letterSpacing: 1 }}>
        PAIEMENT SÉCURISÉ VIA STRIPE
      </span>
    </div>

    <div style={{ textAlign: "center", fontSize: 10, color: "#555", lineHeight: 1.7 }}>
      Tu seras redirigé vers la page de paiement Stripe<br/>
      Annulation à tout moment · Aucun frais caché<br/>
      Satisfait ou remboursé 7 jours
    </div>
  </div>
</div>
```

);
}

// ── PREMIUM LOCK OVERLAY ──────────────────────────────────────
function PremiumLock({ feature, onGoPaywall }) {
return (
<div onClick={onGoPaywall} style={{position: “absolute”, inset: 0, zIndex: 20, background: “rgba(10,10,10,0.88)”, backdropFilter: “blur(6px)”, display: “flex”, flexDirection: “column”, alignItems: “center”, justifyContent: “center”, borderRadius: “inherit”, cursor: “pointer”, padding: 24, textAlign: “center”,}}>
<div style={{ fontSize: 36, marginBottom: 10 }}>🔒</div>
<div style={{ fontSize: 18, fontFamily: “‘Bebas Neue’, cursive”, color: “#f59e0b”, letterSpacing: 2, marginBottom: 6 }}>
FONCTIONNALITÉ PREMIUM
</div>
<div style={{ fontSize: 12, color: “#888”, marginBottom: 16, lineHeight: 1.5 }}>{feature}</div>
<div style={{background: “linear-gradient(135deg, #f59e0b, #d97706)”, color: “#000”, borderRadius: 12, padding: “10px 20px”, fontFamily: “‘Bebas Neue’, cursive”, letterSpacing: 2, fontSize: 13,}}>⭐ DÉBLOQUER PREMIUM</div>
</div>
);
}

// ── ADMIN CONFIG ──────────────────────────────────────────────
const ADMIN_EMAIL = “mathispozner1@gmail.com”;
const isAdmin = (user) => user?.email === ADMIN_EMAIL;

// ── ADMIN SCREEN ──────────────────────────────────────────────
function AdminScreen({ setScreen }) {
const [tab, setTab] = useState(“combos”); // combos | techniques | users
const [combos, setCombos] = useState(() => {
try { return JSON.parse(localStorage.getItem(“admin_combos”) || “[]”); } catch { return []; }
});
const [techniques, setTechniques] = useState(() => {
try { return JSON.parse(localStorage.getItem(“admin_techniques”) || “[]”); } catch { return []; }
});
const [users] = useState(() => {
try { return Object.values(JSON.parse(localStorage.getItem(“amt_users”) || “{}”)); } catch { return []; }
});

const [showComboForm, setShowComboForm] = useState(false);
const [editCombo, setEditCombo] = useState(null);
const [comboName, setComboName] = useState(””);
const [comboSteps, setComboSteps] = useState(””);
const [comboCues, setComboCues] = useState(””);
const [comboLevel, setComboLevel] = useState(“Débutant”);
const [comboVideo, setComboVideo] = useState(null);
const [comboVideoPreview, setComboVideoPreview] = useState(null);
const comboVideoRef = useRef(null);

const [showTechForm, setShowTechForm] = useState(false);
const [editTech, setEditTech] = useState(null);
const [techName, setTechName] = useState(””);
const [techCategory, setTechCategory] = useState(“Poing”);
const [techEmoji, setTechEmoji] = useState(“🥊”);
const [techDesc, setTechDesc] = useState(””);
const [techVideo, setTechVideo] = useState(null);
const [techVideoPreview, setTechVideoPreview] = useState(null);
const techVideoRef = useRef(null);

const [saved, setSaved] = useState(false);

const saveCombo = () => {
if (!comboName.trim()) return;
const steps = comboSteps.split(”\n”).map(s => s.trim()).filter(Boolean);
const cues = comboCues.split(”\n”).map(s => s.trim()).filter(Boolean);
const newCombo = {
id: editCombo?.id || Date.now().toString(),
name: comboName, steps, cues, level: comboLevel,
refVideoUrl: comboVideoPreview || editCombo?.refVideoUrl || null,
createdAt: editCombo?.createdAt || Date.now(),
};
const updated = editCombo
? combos.map(c => c.id === editCombo.id ? newCombo : c)
: […combos, newCombo];
setCombos(updated);
localStorage.setItem(“admin_combos”, JSON.stringify(updated));
setShowComboForm(false); setEditCombo(null);
setComboName(””); setComboSteps(””); setComboCues(””); setComboVideoPreview(null);
showSaved();
};

const deleteCombo = (id) => {
const updated = combos.filter(c => c.id !== id);
setCombos(updated);
localStorage.setItem(“admin_combos”, JSON.stringify(updated));
};

const saveTech = () => {
if (!techName.trim()) return;
const newTech = {
id: editTech?.id || Date.now().toString(),
name: techName, category: techCategory, emoji: techEmoji, desc: techDesc,
videoUrl: techVideoPreview || editTech?.videoUrl || null,
createdAt: editTech?.createdAt || Date.now(),
};
const updated = editTech
? techniques.map(t => t.id === editTech.id ? newTech : t)
: […techniques, newTech];
setTechniques(updated);
localStorage.setItem(“admin_techniques”, JSON.stringify(updated));
setShowTechForm(false); setEditTech(null);
setTechName(””); setTechDesc(””); setTechVideoPreview(null);
showSaved();
};

const deleteTech = (id) => {
const updated = techniques.filter(t => t.id !== id);
setTechniques(updated);
localStorage.setItem(“admin_techniques”, JSON.stringify(updated));
};

const showSaved = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

const S = {
input: { width: “100%”, background: “rgba(255,255,255,0.07)”, border: “1px solid rgba(255,255,255,0.12)”, borderRadius: 10, color: “#fff”, fontSize: 12, padding: “10px 12px”, boxSizing: “border-box”, fontFamily: “Georgia, serif” },
btn: (color) => ({ background: color, border: “none”, color: “#fff”, borderRadius: 10, padding: “10px 14px”, cursor: “pointer”, fontFamily: “‘Bebas Neue’, cursive”, letterSpacing: 1, fontSize: 12 }),
};

return (
<div style={{ height: “100%”, display: “flex”, flexDirection: “column”, background: “#0a0a0a” }}>
{/* Header */}
<div style={{ background: “linear-gradient(135deg, #0a0000, #1a0a00)”, padding: “16px”, borderBottom: “1px solid rgba(245,158,11,0.3)”, display: “flex”, alignItems: “center”, gap: 10 }}>
<button onClick={() => setScreen(“profile”)} style={{ background: “rgba(255,255,255,0.06)”, border: “1px solid rgba(255,255,255,0.1)”, color: “#fff”, borderRadius: “50%”, width: 34, height: 34, fontSize: 15, cursor: “pointer” }}>←</button>
<div style={{ flex: 1 }}>
<div style={{ fontSize: 18, fontFamily: “‘Bebas Neue’, cursive”, color: “#f59e0b”, letterSpacing: 2 }}>👑 PANNEAU COACH</div>
<div style={{ fontSize: 10, color: “#666” }}>Accès exclusif · mathispozner1@gmail.com</div>
</div>
{saved && <div style={{ fontSize: 11, color: “#22c55e”, fontFamily: “‘Bebas Neue’, cursive” }}>✅ SAUVEGARDÉ</div>}
</div>

```
  {/* Tabs */}
  <div style={{ display: "flex", background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
    {[
      { id: "combos", label: "🥊 Combos", count: combos.length },
      { id: "techniques", label: "⚡ Techniques", count: techniques.length },
      { id: "users", label: "👥 Membres", count: users.length },
    ].map(t => (
      <button key={t.id} onClick={() => setTab(t.id)} style={{flex: 1, background: "none", border: "none", borderBottom: tab === t.id ? "2px solid #f59e0b" : "2px solid transparent", color: tab === t.id ? "#f59e0b" : "#666", padding: "10px 4px", cursor: "pointer", fontFamily: "'Bebas Neue', cursive", letterSpacing: 1, fontSize: 10,}}>{t.label} ({t.count})</button>
    ))}
  </div>

  <div style={{ flex: 1, overflowY: "auto", padding: 14 }}>

    {/* ── TAB COMBOS ── */}
    {tab === "combos" && (
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ fontSize: 11, color: "#f59e0b", fontFamily: "'Bebas Neue', cursive", letterSpacing: 2 }}>
            GÉRER LES COMBOS ({combos.length})
          </div>
          <button onClick={() => { setShowComboForm(true); setEditCombo(null); setComboName(""); setComboSteps(""); setComboCues(""); setComboVideoPreview(null); }} style={S.btn("#f59e0b")}>
            + NOUVEAU
          </button>
        </div>

        {showComboForm && (
          <div style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 14, padding: 14, marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontFamily: "'Bebas Neue', cursive", color: "#f59e0b", marginBottom: 12 }}>
              {editCombo ? "MODIFIER LE COMBO" : "NOUVEAU COMBO"}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <input placeholder="Nom du combo" value={comboName} onChange={e => setComboName(e.target.value)} style={S.input} />
              <div>
                <div style={{ fontSize: 10, color: "#666", marginBottom: 4 }}>Niveau</div>
                <select value={comboLevel} onChange={e => setComboLevel(e.target.value)} style={{ ...S.input, background: "rgba(255,255,255,0.07)" }}>
                  {["Débutant", "Intermédiaire", "Avancé"].map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <div style={{ fontSize: 10, color: "#666", marginBottom: 4 }}>Frappes (une par ligne)</div>
                <textarea placeholder={"Jab\nCross\nRight Middle Kick"} value={comboSteps} onChange={e => setComboSteps(e.target.value)} style={{ ...S.input, resize: "none", height: 70 }} />
              </div>
              <div>
                <div style={{ fontSize: 10, color: "#666", marginBottom: 4 }}>Points clés (un par ligne)</div>
                <textarea placeholder={"Garde haute\nRotation des hanches"} value={comboCues} onChange={e => setComboCues(e.target.value)} style={{ ...S.input, resize: "none", height: 60 }} />
              </div>
              <div>
                <div style={{ fontSize: 10, color: "#f59e0b", marginBottom: 6 }}>📹 Vidéo de référence du coach</div>
                <input ref={comboVideoRef} type="file" accept="video/*,image/*" style={{ display: "none" }} onChange={e => {
                  const f = e.target.files[0]; if (!f) return;
                  setComboVideo(f); setComboVideoPreview(URL.createObjectURL(f));
                }} />
                <div onClick={() => comboVideoRef.current?.click()} style={{ border: "2px dashed rgba(245,158,11,0.3)", borderRadius: 10, padding: 12, textAlign: "center", cursor: "pointer" }}>
                  {comboVideoPreview ? (
                    <video src={comboVideoPreview} controls style={{ width: "100%", borderRadius: 8, maxHeight: 100 }} />
                  ) : (
                    <div style={{ fontSize: 11, color: "#666" }}>📁 Appuie pour ajouter une vidéo</div>
                  )}
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <button onClick={() => setShowComboForm(false)} style={S.btn("rgba(255,255,255,0.08)")}>ANNULER</button>
                <button onClick={saveCombo} style={S.btn("#f59e0b")}>💾 SAUVEGARDER</button>
              </div>
            </div>
          </div>
        )}

        {combos.length === 0 ? (
          <div style={{ textAlign: "center", padding: 32, color: "#444", fontSize: 12 }}>
            Aucun combo ajouté.<br/>Crée ton premier combo !
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {combos.map(c => (
              <div key={c.id} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                  <div>
                    <div style={{ fontSize: 13, fontFamily: "'Bebas Neue', cursive", color: "#fff", letterSpacing: 1 }}>{c.name}</div>
                    <div style={{ fontSize: 10, color: "#f59e0b", marginTop: 2 }}>{c.level}</div>
                    <div style={{ fontSize: 10, color: "#666", marginTop: 2 }}>{c.steps?.join(" → ")}</div>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => { setEditCombo(c); setComboName(c.name); setComboSteps(c.steps?.join("\n")); setComboCues(c.cues?.join("\n")); setComboLevel(c.level); setComboVideoPreview(c.refVideoUrl); setShowComboForm(true); }} style={{ background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)", color: "#f59e0b", borderRadius: 8, padding: "4px 8px", cursor: "pointer", fontSize: 12 }}>✏️</button>
                    <button onClick={() => deleteCombo(c.id)} style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", borderRadius: 8, padding: "4px 8px", cursor: "pointer", fontSize: 12 }}>🗑</button>
                  </div>
                </div>
                {c.refVideoUrl && <div style={{ fontSize: 10, color: "#22c55e" }}>📹 Vidéo de référence ajoutée</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    )}

    {/* ── TAB TECHNIQUES ── */}
    {tab === "techniques" && (
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ fontSize: 11, color: "#f59e0b", fontFamily: "'Bebas Neue', cursive", letterSpacing: 2 }}>
            GÉRER LES TECHNIQUES ({techniques.length})
          </div>
          <button onClick={() => { setShowTechForm(true); setEditTech(null); setTechName(""); setTechDesc(""); setTechVideoPreview(null); }} style={S.btn("#f59e0b")}>
            + NOUVELLE
          </button>
        </div>

        {showTechForm && (
          <div style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 14, padding: 14, marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontFamily: "'Bebas Neue', cursive", color: "#f59e0b", marginBottom: 12 }}>
              {editTech ? "MODIFIER LA TECHNIQUE" : "NOUVELLE TECHNIQUE"}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <input placeholder="Nom de la technique" value={techName} onChange={e => setTechName(e.target.value)} style={S.input} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <div>
                  <div style={{ fontSize: 10, color: "#666", marginBottom: 4 }}>Catégorie</div>
                  <select value={techCategory} onChange={e => setTechCategory(e.target.value)} style={{ ...S.input, background: "rgba(255,255,255,0.07)" }}>
                    {["Poing", "Coup de pied", "Coude", "Genou", "Corps à corps"].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: "#666", marginBottom: 4 }}>Emoji</div>
                  <input placeholder="🥊" value={techEmoji} onChange={e => setTechEmoji(e.target.value)} style={S.input} />
                </div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: "#666", marginBottom: 4 }}>Description</div>
                <textarea placeholder="Décris la technique..." value={techDesc} onChange={e => setTechDesc(e.target.value)} style={{ ...S.input, resize: "none", height: 70 }} />
              </div>
              <div>
                <div style={{ fontSize: 10, color: "#f59e0b", marginBottom: 6 }}>📹 Vidéo de démonstration</div>
                <input ref={techVideoRef} type="file" accept="video/*,image/*" style={{ display: "none" }} onChange={e => {
                  const f = e.target.files[0]; if (!f) return;
                  setTechVideo(f); setTechVideoPreview(URL.createObjectURL(f));
                }} />
                <div onClick={() => techVideoRef.current?.click()} style={{ border: "2px dashed rgba(245,158,11,0.3)", borderRadius: 10, padding: 12, textAlign: "center", cursor: "pointer" }}>
                  {techVideoPreview ? (
                    <video src={techVideoPreview} controls style={{ width: "100%", borderRadius: 8, maxHeight: 100 }} />
                  ) : (
                    <div style={{ fontSize: 11, color: "#666" }}>📁 Appuie pour ajouter une vidéo</div>
                  )}
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <button onClick={() => setShowTechForm(false)} style={S.btn("rgba(255,255,255,0.08)")}>ANNULER</button>
                <button onClick={saveTech} style={S.btn("#f59e0b")}>💾 SAUVEGARDER</button>
              </div>
            </div>
          </div>
        )}

        {techniques.length === 0 ? (
          <div style={{ textAlign: "center", padding: 32, color: "#444", fontSize: 12 }}>
            Aucune technique ajoutée.<br/>Crée ta première technique !
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {techniques.map(t => (
              <div key={t.id} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <span style={{ fontSize: 24 }}>{t.emoji}</span>
                    <div>
                      <div style={{ fontSize: 13, fontFamily: "'Bebas Neue', cursive", color: "#fff" }}>{t.name}</div>
                      <div style={{ fontSize: 10, color: "#ef4444" }}>{t.category}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => { setEditTech(t); setTechName(t.name); setTechCategory(t.category); setTechEmoji(t.emoji); setTechDesc(t.desc); setTechVideoPreview(t.videoUrl); setShowTechForm(true); }} style={{ background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)", color: "#f59e0b", borderRadius: 8, padding: "4px 8px", cursor: "pointer", fontSize: 12 }}>✏️</button>
                    <button onClick={() => deleteTech(t.id)} style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", borderRadius: 8, padding: "4px 8px", cursor: "pointer", fontSize: 12 }}>🗑</button>
                  </div>
                </div>
                {t.videoUrl && <div style={{ fontSize: 10, color: "#22c55e", marginTop: 6 }}>📹 Vidéo de démonstration ajoutée</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    )}

    {/* ── TAB USERS ── */}
    {tab === "users" && (
      <div>
        <div style={{ fontSize: 11, color: "#f59e0b", fontFamily: "'Bebas Neue', cursive", letterSpacing: 2, marginBottom: 14 }}>
          MEMBRES INSCRITS ({users.length})
        </div>

        {/* Stats rapides */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
          {[
            { label: "Total membres", value: users.length, icon: "👥" },
            { label: "Inscrits aujourd'hui", value: users.filter(u => new Date(u.createdAt).toDateString() === new Date().toDateString()).length, icon: "🆕" },
          ].map(s => (
            <div key={s.label} style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 12, padding: 12, textAlign: "center" }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
              <div style={{ fontSize: 22, fontFamily: "'Bebas Neue', cursive", color: "#f59e0b" }}>{s.value}</div>
              <div style={{ fontSize: 10, color: "#666" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {users.length === 0 ? (
          <div style={{ textAlign: "center", padding: 32, color: "#444", fontSize: 12 }}>
            Aucun membre inscrit pour l'instant.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {users.map((u, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: 12, display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(239,68,68,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🥊</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: "#fff" }}>{u.name || "Sans nom"}</div>
                  <div style={{ fontSize: 10, color: "#666" }}>{u.email}</div>
                  <div style={{ fontSize: 10, color: "#444", marginTop: 2 }}>
                    Inscrit le {new Date(u.createdAt).toLocaleDateString("fr-FR")}
                  </div>
                </div>
                {u.email === ADMIN_EMAIL && (
                  <span style={{ fontSize: 10, color: "#f59e0b", fontFamily: "'Bebas Neue', cursive" }}>COACH</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    )}
  </div>
</div>
```

);
}

// ── REVIEW SYSTEM ────────────────────────────────────────────
const reviewStorage = {
get: () => { try { return JSON.parse(localStorage.getItem(“amt_reviews”) || “[]”); } catch { return []; } },
add: (r) => {
const reviews = reviewStorage.get();
reviews.unshift({ …r, id: Date.now(), date: new Date().toLocaleDateString(“fr-FR”) });
localStorage.setItem(“amt_reviews”, JSON.stringify(reviews.slice(0, 100)));
return reviews;
},
getMyReview: (userId) => {
const reviews = reviewStorage.get();
return reviews.find(r => r.userId === userId);
},
getStats: () => {
const reviews = reviewStorage.get();
if (!reviews.length) return { avg: 0, total: 0, dist: [0,0,0,0,0] };
const dist = [0,0,0,0,0];
reviews.forEach(r => { if(r.rating >= 1 && r.rating <= 5) dist[r.rating-1]++; });
const avg = reviews.reduce((s,r) => s + r.rating, 0) / reviews.length;
return { avg: Math.round(avg * 10) / 10, total: reviews.length, dist };
},
};

if (!localStorage.getItem(“amt_reviews_seeded”)) {
const demoReviews = [
{ id:1, userId:“demo1”, name:“Alex M.”, level:“Intermédiaire”, rating:5, comment:“Application incroyable ! Le Coach IA est révolutionnaire, mes techniques se sont vraiment améliorées en 2 semaines.”, date:“15/01/2025” },
{ id:2, userId:“demo2”, name:“Sarah K.”, level:“Débutant”, rating:5, comment:“Parfait pour débuter le Muay Thai. Les explications sont claires et le timer est super pratique pour s’entraîner seul.”, date:“12/01/2025” },
{ id:3, userId:“demo3”, name:“Marco R.”, level:“Avancé”, rating:4, comment:“Très bonne app. J’aurais aimé encore plus de combos avancés mais dans l’ensemble c’est excellent. Le défi du jour est ma fonctionnalité préférée !”, date:“08/01/2025” },
{ id:4, userId:“demo4”, name:“Léa D.”, level:“Débutant”, rating:5, comment:“Le chat avec le Coach IA m’aide énormément. Il répond à toutes mes questions sur la nutrition et les techniques. Top !”, date:“05/01/2025” },
{ id:5, userId:“demo5”, name:“Thomas B.”, level:“Intermédiaire”, rating:4, comment:“Application bien pensée. La progression et les badges motivent vraiment à s’entraîner régulièrement.”, date:“02/01/2025” },
];
localStorage.setItem(“amt_reviews”, JSON.stringify(demoReviews));
localStorage.setItem(“amt_reviews_seeded”, “1”);
}

function StarRating({ value, onChange, size = 32 }) {
const [hover, setHover] = useState(0);
return (
<div style={{ display:“flex”, gap:6 }}>
{[1,2,3,4,5].map(n => (
<span key={n}
onClick={() => onChange && onChange(n)}
onMouseEnter={() => onChange && setHover(n)}
onMouseLeave={() => onChange && setHover(0)}
style={{ fontSize:size, cursor:onChange?“pointer”:“default”, transition:“transform 0.1s”, transform:(hover||value)>=n?“scale(1.1)”:“scale(1)”, filter:(hover||value)>=n?“none”:“grayscale(1) opacity(0.3)” }}>
⭐
</span>
))}
</div>
);
}

function ReviewsScreen({ setScreen, user }) {
const [tab, setTab] = useState(“reviews”); // reviews | write
const [rating, setRating] = useState(0);
const [comment, setComment] = useState(””);
const [level, setLevel] = useState(“Débutant”);
const [submitted, setSubmitted] = useState(false);
const [reviews, setReviews] = useState(reviewStorage.get());
const stats = reviewStorage.getStats();
const myReview = reviewStorage.getMyReview(user?.id);

const submitReview = () => {
if (!rating || !comment.trim()) return;
reviewStorage.add({
userId: user?.id,
name: user?.name || user?.email?.split(”@”)[0] || “Anonyme”,
level, rating, comment: comment.trim(),
});
setReviews(reviewStorage.get());
setSubmitted(true);
setTab(“reviews”);
};

const levelColors = { “Débutant”:”#22c55e”, “Intermédiaire”:”#f59e0b”, “Avancé”:”#ef4444” };

return (
<div style={{ height:“100%”, display:“flex”, flexDirection:“column”, background:D.bg }}>
{/* Header */}
<div style={{ background:D.bg, padding:“20px 16px 16px”, borderBottom:`1px solid ${D.border}`, display:“flex”, alignItems:“center”, gap:12, flexShrink:0 }}>
<button onClick={() => setScreen(“profile”)} style={{ background:D.bgCard, border:`1px solid ${D.border}`, color:D.textPrimary, borderRadius:“50%”, width:36, height:36, fontSize:16, cursor:“pointer” }}>←</button>
<div style={{ flex:1 }}>
<div style={{ fontSize:20, fontFamily:D.heading, color:D.textPrimary, letterSpacing:2 }}>⭐ AVIS & NOTES</div>
<div style={{ fontSize:10, color:D.textMuted }}>{stats.total} avis · {stats.avg}/5 moyenne</div>
</div>
{!myReview && (
<button onClick={() => setTab(tab===“write”?“reviews”:“write”)} style={{ background:tab===“write”?D.red:D.redMid, border:`1px solid ${D.borderHi}`, color:”#fff”, borderRadius:20, padding:“6px 14px”, cursor:“pointer”, fontFamily:D.heading, letterSpacing:1, fontSize:12 }}>
{tab===“write” ? “VOIR AVIS” : “✍️ NOTER”}
</button>
)}
</div>

```
  <div style={{ flex:1, overflowY:"auto", padding:16 }}>

    {/* Stats globales */}
    <div style={{ background:D.bgCard, border:`1px solid ${D.border}`, borderRadius:20, padding:16, marginBottom:16 }}>
      <div style={{ display:"flex", alignItems:"center", gap:20, marginBottom:14 }}>
        <div style={{ textAlign:"center" }}>
          <div style={{ fontSize:52, fontFamily:D.heading, color:D.textPrimary, lineHeight:1 }}>{stats.avg || "—"}</div>
          <StarRating value={Math.round(stats.avg)} size={20} />
          <div style={{ fontSize:11, color:D.textMuted, marginTop:4 }}>{stats.total} avis</div>
        </div>
        <div style={{ flex:1 }}>
          {[5,4,3,2,1].map(n => {
            const count = stats.dist[n-1] || 0;
            const pct = stats.total ? (count/stats.total)*100 : 0;
            return (
              <div key={n} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:5 }}>
                <span style={{ fontSize:11, color:D.textMuted, width:8 }}>{n}</span>
                <span style={{ fontSize:12 }}>⭐</span>
                <div style={{ flex:1, height:6, background:"rgba(255,255,255,0.06)", borderRadius:3, overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${pct}%`, background:`linear-gradient(90deg,${D.red},${D.gold})`, borderRadius:3, transition:"width 0.5s ease" }}/>
                </div>
                <span style={{ fontSize:11, color:D.textMuted, width:16, textAlign:"right" }}>{count}</span>
              </div>
            );
          })}
        </div>
      </div>
      {submitted && (
        <div style={{ background:D.greenSoft, border:"1px solid rgba(0,230,118,0.3)", borderRadius:D.rm, padding:"10px 14px", display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:16 }}>✅</span>
          <span style={{ fontSize:12, color:D.green, fontFamily:D.heading, letterSpacing:1 }}>MERCI POUR TON AVIS !</span>
        </div>
      )}
    </div>

    {/* Formulaire d'avis */}
    {tab==="write" && !myReview && (
      <div style={{ background:D.bgCard, border:`1px solid ${D.borderHi}`, borderRadius:20, padding:16, marginBottom:16, animation:"scaleIn 0.3s ease" }}>
        <SLabel>✍️ LAISSER TON AVIS</SLabel>

        {/* Étoiles */}
        <div style={{ marginBottom:14 }}>
          <div style={{ fontSize:11, color:D.textMuted, marginBottom:8 }}>Ta note</div>
          <StarRating value={rating} onChange={setRating} size={36} />
          {rating > 0 && (
            <div style={{ fontSize:12, color:D.red, fontFamily:D.heading, letterSpacing:1, marginTop:6 }}>
              {["","😞 Mauvais","😕 Moyen","😊 Bien","😄 Très bien","🔥 Excellent !"][rating]}
            </div>
          )}
        </div>

        {/* Niveau */}
        <div style={{ marginBottom:14 }}>
          <div style={{ fontSize:11, color:D.textMuted, marginBottom:8 }}>Ton niveau</div>
          <div style={{ display:"flex", gap:8 }}>
            {["Débutant","Intermédiaire","Avancé"].map(l => (
              <button key={l} onClick={() => setLevel(l)} style={{flex:1, background:level===l?`${levelColors[l]}20`:"transparent", border:`1px solid ${level===l?levelColors[l]:D.border}`, borderRadius:D.rm, padding:"8px 4px", cursor:"pointer", fontFamily:D.heading, fontSize:10, letterSpacing:1, color:level===l?levelColors[l]:D.textMuted,}}>{l}</button>
            ))}
          </div>
        </div>

        {/* Commentaire */}
        <div style={{ marginBottom:14 }}>
          <div style={{ fontSize:11, color:D.textMuted, marginBottom:8 }}>Ton commentaire</div>
          <textarea
            value={comment} onChange={e => setComment(e.target.value)}
            placeholder="Partage ton expérience avec Autam Muay Thai..."
            style={{ width:"100%", background:"rgba(255,255,255,0.05)", border:`1px solid ${D.border}`, borderRadius:D.rm, color:D.textPrimary, fontSize:13, padding:"12px 14px", resize:"none", height:90, fontFamily:D.body, boxSizing:"border-box" }}
          />
          <div style={{ fontSize:10, color:D.textMuted, textAlign:"right", marginTop:4 }}>{comment.length}/300</div>
        </div>

        <button onClick={submitReview} disabled={!rating || !comment.trim()} style={{width:"100%", border:"none", borderRadius:D.rl, padding:"14px", background: rating && comment.trim() ? `linear-gradient(135deg,${D.red},${D.redDark})` : "rgba(255,255,255,0.05)", color: rating && comment.trim() ? "#fff" : D.textMuted, fontFamily:D.heading, letterSpacing:2, fontSize:15, cursor: rating && comment.trim() ? "pointer" : "not-allowed", boxShadow: rating && comment.trim() ? D.shadowRed : "none",}}>
          ⭐ PUBLIER MON AVIS
        </button>
      </div>
    )}

    {myReview && (
      <div style={{ background:D.redMid, border:`1px solid ${D.borderHi}`, borderRadius:D.rl, padding:14, marginBottom:16, display:"flex", alignItems:"center", gap:10 }}>
        <span style={{ fontSize:20 }}>✅</span>
        <div>
          <div style={{ fontSize:13, fontFamily:D.heading, color:D.red, letterSpacing:1 }}>TU AS DÉJÀ LAISSÉ UN AVIS</div>
          <div style={{ fontSize:11, color:D.textMuted, marginTop:2 }}>Merci pour ton retour !</div>
        </div>
      </div>
    )}

    {/* Liste des avis */}
    <SLabel>TOUS LES AVIS</SLabel>
    <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
      {reviews.map(r => (
        <div key={r.id} style={{ background:D.bgCard, border:`1px solid ${D.border}`, borderRadius:D.rl, padding:14 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ width:36, height:36, borderRadius:"50%", background:D.redMid, border:`1px solid ${D.borderHi}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>🥊</div>
              <div>
                <div style={{ fontSize:13, fontFamily:D.heading, color:D.textPrimary, letterSpacing:1 }}>{r.name}</div>
                <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:2 }}>
                  <span style={{ fontSize:9, color:levelColors[r.level]||D.red, border:`1px solid ${(levelColors[r.level]||D.red)}40`, borderRadius:20, padding:"1px 8px", fontFamily:D.heading, letterSpacing:1 }}>{r.level}</span>
                  <span style={{ fontSize:10, color:D.textMuted }}>{r.date}</span>
                </div>
              </div>
            </div>
            <StarRating value={r.rating} size={14} />
          </div>
          <p style={{ fontSize:13, color:D.textSecondary, lineHeight:1.6, margin:0 }}>{r.comment}</p>
        </div>
      ))}
    </div>
  </div>
</div>
```

);
}

// ── REFERRAL SYSTEM ──────────────────────────────────────────
const referral = {
getCode: (user) => {
if (!user?.email) return null;
const hash = user.email.split(””).reduce((a,c) => ((a<<5)-a)+c.charCodeAt(0), 0);
return “AUTAM” + Math.abs(hash).toString(36).toUpperCase().slice(0,5);
},
getStats: () => {
try { return JSON.parse(localStorage.getItem(“amt_referral”) || ‘{“invited”:[],“rewarded”:false}’); }
catch { return { invited:[], rewarded:false }; }
},
addInvited: (email) => {
const s = referral.getStats();
if (!s.invited.includes(email)) {
s.invited.push(email);
localStorage.setItem(“amt_referral”, JSON.stringify(s));
}
return s;
},
claimBadge: () => {
const s = referral.getStats();
s.rewarded = true;
localStorage.setItem(“amt_referral”, JSON.stringify(s));
},
};

function ReferralScreen({ setScreen, user, isPremium, onBadge }) {
const code = referral.getCode(user);
const stats = referral.getStats();
const [copied, setCopied] = useState(false);
const [email, setEmail] = useState(””);
const [sent, setSent] = useState(false);
const [claimed, setClaimed] = useState(stats.rewarded);

const inviteLink = `https://autammuaythai.com/join?ref=${code}`;
const inviteText = `🥊 Rejoins-moi sur Autam Muay Thai !\n\nL'app de Muay Thai avec Coach IA, défis quotidiens et suivi de progression.\n\n➡️ 7 jours Premium OFFERTS avec mon code : ${code}\n\n${inviteLink}`;

const copyCode = async () => {
try {
await navigator.clipboard.writeText(inviteLink);
setCopied(true);
setTimeout(() => setCopied(false), 2500);
} catch {
setCopied(true);
setTimeout(() => setCopied(false), 2500);
}
};

const shareInvite = async () => {
try {
if (navigator.share) {
await navigator.share({ title:“Autam Muay Thai”, text:inviteText, url:inviteLink });
} else {
await navigator.clipboard.writeText(inviteText);
alert(“Invitation copiée dans le presse-papiers !”);
}
} catch {}
};

const sendEmailInvite = () => {
if (!email.trim()) return;
referral.addInvited(email);
setSent(true);
setEmail(””);
setTimeout(() => setSent(false), 3000);
};

const claimAmbassador = () => {
if (stats.invited.length >= 1 && !claimed) {
referral.claimBadge();
setClaimed(true);
const ambassadorBadge = { id:“ambassador”, icon:“🌟”, name:“Ambassadeur”, desc:“Tu as invité des amis sur Autam Muay Thai !”, category:“Parrainage” };
const unlocked = JSON.parse(localStorage.getItem(“amt_badges_unlocked”) || “[]”);
if (!unlocked.includes(“ambassador”)) {
unlocked.push(“ambassador”);
localStorage.setItem(“amt_badges_unlocked”, JSON.stringify(unlocked));
setTimeout(() => onBadge && onBadge(ambassadorBadge), 500);
}
}
};

const progress = Math.min(stats.invited.length, 3);

return (
<div style={{ height:“100%”, display:“flex”, flexDirection:“column”, background:D.bg }}>
{/* Header */}
<div style={{ background:D.bg, padding:“20px 16px 16px”, borderBottom:`1px solid ${D.border}`, display:“flex”, alignItems:“center”, gap:12 }}>
<button onClick={() => setScreen(“profile”)} style={{ background:D.bgCard, border:`1px solid ${D.border}`, color:D.textPrimary, borderRadius:“50%”, width:36, height:36, fontSize:16, cursor:“pointer” }}>←</button>
<div>
<div style={{ fontSize:20, fontFamily:D.heading, color:D.textPrimary, letterSpacing:2 }}>🌟 PARRAINAGE</div>
<div style={{ fontSize:10, color:D.textMuted }}>Invite tes amis · Gagne des récompenses</div>
</div>
</div>

```
  <div style={{ flex:1, overflowY:"auto", padding:16 }}>

    {/* Hero */}
    <div style={{ background:`linear-gradient(135deg,${D.redDeep}30,${D.redMid})`, border:`1px solid ${D.borderHi}`, borderRadius:20, padding:20, textAlign:"center", marginBottom:16, position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", right:-20, top:-20, fontSize:80, opacity:0.06 }}>🌟</div>
      <div style={{ fontSize:48, marginBottom:8 }}>🥊</div>
      <div style={{ fontSize:24, fontFamily:D.heading, color:D.textPrimary, letterSpacing:2, marginBottom:6 }}>
        INVITE TES AMIS
      </div>
      <div style={{ fontSize:13, color:D.textSecondary, lineHeight:1.6 }}>
        Chaque ami invité reçoit <span style={{ color:D.gold, fontFamily:D.heading }}>7 JOURS PREMIUM</span> offerts.<br/>
        Toi tu gagnes le badge exclusif <span style={{ color:D.gold, fontFamily:D.heading }}>🌟 AMBASSADEUR</span> !
      </div>
    </div>

    {/* Ton code */}
    <div style={{ marginBottom:16 }}>
      <SLabel>TON CODE DE PARRAINAGE</SLabel>
      <div style={{ background:D.bgCard, border:`1px solid ${D.borderHi}`, borderRadius:D.rl, padding:16, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div>
          <div style={{ fontSize:28, fontFamily:D.heading, color:D.red, letterSpacing:4 }}>{code}</div>
          <div style={{ fontSize:11, color:D.textMuted, marginTop:2 }}>Partage ce code avec tes amis</div>
        </div>
        <button onClick={copyCode} style={{ background:copied?D.greenSoft:D.redMid, border:`1px solid ${copied?"rgba(0,230,118,0.3)":D.redBorder}`, borderRadius:D.rm, padding:"10px 14px", cursor:"pointer", color:copied?D.green:D.red, fontFamily:D.heading, letterSpacing:1, fontSize:12, transition:"all 0.3s" }}>
          {copied ? "✅ COPIÉ" : "📋 COPIER"}
        </button>
      </div>
    </div>

    {/* Progression ambassadeur */}
    <div style={{ marginBottom:16 }}>
      <SLabel>PROGRESSION AMBASSADEUR</SLabel>
      <div style={{ background:D.bgCard, border:`1px solid ${D.border}`, borderRadius:D.rl, padding:14 }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
          <span style={{ fontSize:12, color:D.textSecondary }}>Amis invités</span>
          <span style={{ fontSize:12, color:D.gold, fontFamily:D.heading }}>{stats.invited.length} / 3 pour le badge</span>
        </div>
        <div style={{ height:8, background:"rgba(255,255,255,0.06)", borderRadius:4, overflow:"hidden", marginBottom:10 }}>
          <div style={{ height:"100%", width:`${(progress/3)*100}%`, background:`linear-gradient(90deg,${D.red},${D.gold})`, borderRadius:4, transition:"width 0.5s ease", boxShadow:progress>0?D.shadowRed:"none" }}/>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          {[1,2,3].map(n => (
            <div key={n} style={{ flex:1, background:stats.invited.length>=n?D.redMid:"rgba(255,255,255,0.03)", border:`1px solid ${stats.invited.length>=n?D.borderHi:D.border}`, borderRadius:D.r, padding:"8px 4px", textAlign:"center" }}>
              <div style={{ fontSize:16 }}>{stats.invited.length>=n?"🥊":"○"}</div>
              <div style={{ fontSize:9, color:stats.invited.length>=n?D.red:D.textMuted, fontFamily:D.heading, letterSpacing:1, marginTop:2 }}>Ami {n}</div>
            </div>
          ))}
        </div>
        {stats.invited.length >= 1 && !claimed && (
          <button onClick={claimAmbassador} style={{ marginTop:12, width:"100%", border:"none", borderRadius:D.rm, padding:"12px", background:`linear-gradient(135deg,${D.gold},#b8860b)`, color:"#000", fontFamily:D.heading, letterSpacing:2, fontSize:14, cursor:"pointer", boxShadow:"0 0 20px rgba(212,160,23,0.4)" }}>
            🌟 RÉCLAMER MON BADGE AMBASSADEUR
          </button>
        )}
        {claimed && (
          <div style={{ marginTop:12, background:D.goldSoft, border:`1px solid rgba(212,160,23,0.3)`, borderRadius:D.rm, padding:"10px 14px", textAlign:"center" }}>
            <div style={{ fontSize:13, fontFamily:D.heading, color:D.gold, letterSpacing:1 }}>🌟 BADGE AMBASSADEUR OBTENU !</div>
          </div>
        )}
      </div>
    </div>

    {/* Partager */}
    <div style={{ marginBottom:16 }}>
      <SLabel>PARTAGER TON INVITATION</SLabel>
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        <button onClick={shareInvite} style={{ width:"100%", border:"none", borderRadius:D.rl, padding:"14px", background:`linear-gradient(135deg,${D.red},${D.redDark})`, color:"#fff", fontFamily:D.heading, letterSpacing:2, fontSize:14, cursor:"pointer", boxShadow:D.shadowRed, display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}>
          <span style={{ fontSize:18 }}>📤</span> PARTAGER MON INVITATION
        </button>
        <div style={{ background:D.bgCard, border:`1px solid ${D.border}`, borderRadius:D.rl, padding:14 }}>
          <div style={{ fontSize:11, color:D.textMuted, marginBottom:8 }}>Envoyer par email</div>
          <div style={{ display:"flex", gap:8 }}>
            <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="email@ami.com" type="email" style={{ flex:1, background:"rgba(255,255,255,0.05)", border:`1px solid ${D.border}`, borderRadius:D.r, color:D.textPrimary, fontSize:12, padding:"10px 12px", fontFamily:D.body }}/>
            <button onClick={sendEmailInvite} style={{ background:sent?D.greenSoft:D.redMid, border:`1px solid ${sent?"rgba(0,230,118,0.3)":D.redBorder}`, borderRadius:D.r, padding:"10px 14px", cursor:"pointer", color:sent?D.green:D.red, fontFamily:D.heading, fontSize:12, letterSpacing:1, flexShrink:0, transition:"all 0.3s" }}>
              {sent ? "✅" : "ENVOYER"}
            </button>
          </div>
        </div>
      </div>
    </div>

    {/* Amis invités */}
    {stats.invited.length > 0 && (
      <div>
        <SLabel>AMIS INVITÉS ({stats.invited.length})</SLabel>
        {stats.invited.map((e,i) => (
          <div key={i} style={{ background:D.bgCard, border:`1px solid ${D.border}`, borderRadius:D.rm, padding:"10px 14px", marginBottom:8, display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:32, height:32, borderRadius:"50%", background:D.redMid, border:`1px solid ${D.borderHi}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>🥊</div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:12, color:D.textPrimary }}>{e}</div>
              <div style={{ fontSize:10, color:D.textMuted, marginTop:1 }}>7 jours Premium offerts</div>
            </div>
            <div style={{ fontSize:10, color:D.green, fontFamily:D.heading, letterSpacing:1 }}>✓ INVITÉ</div>
          </div>
        ))}
      </div>
    )}

    {/* Message d'invitation */}
    <div style={{ background:D.bgCard, border:`1px solid ${D.border}`, borderRadius:D.rl, padding:14 }}>
      <SLabel color={D.textMuted}>APERÇU DU MESSAGE</SLabel>
      <div style={{ fontSize:11, color:D.textSecondary, lineHeight:1.8, fontStyle:"italic", whiteSpace:"pre-line" }}>
        {inviteText}
      </div>
    </div>
  </div>
</div>
```

);
}

// ── OFFLINE SYSTEM ───────────────────────────────────────────
const OFFLINE_DEFIS = {
“Débutant”: [
{ titre:“Fondamentaux du Guerrier”, emoji:“🌱”, objectif:“Maîtrise les bases et forge ta technique !”, niveau:“Débutant”, combo:[“Jab”,“Cross”,“Teep”], rounds:3, duree_round:90, repos:60, exercices:[{nom:“Shadowboxing”,reps:“3x2min”,desc:“Travaille ta garde et tes déplacements”},{nom:“Pompes”,reps:“3x15”,desc:“Force des bras pour des frappes puissantes”},{nom:“Gainage”,reps:“3x30s”,desc:“Core solide = frappes précises”}], conseil_coach:“Concentre-toi sur la qualité, pas la vitesse. Chaque frappe doit être parfaite !”, calories_estimees:200 },
{ titre:“Cardio Débutant”, emoji:“💪”, objectif:“Construis ton endurance pas à pas !”, niveau:“Débutant”, combo:[“Jab”,“Cross”,“Crochet”], rounds:4, duree_round:90, repos:60, exercices:[{nom:“Corde à sauter”,reps:“3x2min”,desc:“Rythme régulier, pointes de pieds”},{nom:“Squats”,reps:“3x20”,desc:“Jambes solides pour des kicks puissants”},{nom:“Abdos”,reps:“3x20”,desc:“Gainage dynamique”}], conseil_coach:“L’endurance se construit progressivement. Sois régulier !”, calories_estimees:250 },
],
“Intermédiaire”: [
{ titre:“Combat Conditioning”, emoji:“⚡”, objectif:“Pousse tes limites et améliore ta puissance !”, niveau:“Intermédiaire”, combo:[“Jab”,“Cross”,“Crochet”,“Low Kick”], rounds:5, duree_round:120, repos:45, exercices:[{nom:“Sac de frappe”,reps:“5x2min”,desc:“Travaille tes combinaisons avec intention”},{nom:“Burpees”,reps:“4x15”,desc:“Explosivité et cardio”},{nom:“Mountain climbers”,reps:“4x30”,desc:“Core et endurance”}], conseil_coach:“La puissance vient de la rotation des hanches. Pense à pivoter sur chaque frappe !”, calories_estimees:400 },
{ titre:“Technique Avancée”, emoji:“🎯”, objectif:“Perfectionne tes combinaisons et ta précision !”, niveau:“Intermédiaire”, combo:[“Jab”,“Cross”,“Coude”,“Genou”], rounds:5, duree_round:120, repos:45, exercices:[{nom:“Pad work imaginaire”,reps:“5x90s”,desc:“Visualise les cibles pour chaque frappe”},{nom:“Fentes”,reps:“4x20”,desc:“Mobilité et puissance des jambes”},{nom:“Dips”,reps:“3x15”,desc:“Force triceps pour les coudes”}], conseil_coach:“Chaque coude doit être lancé avec toute la rotation du buste !”, calories_estimees:380 },
],
“Avancé”: [
{ titre:“Guerrier Elite”, emoji:“🔥”, objectif:“Dépasse tes limites — entraîne-toi comme un champion !”, niveau:“Avancé”, combo:[“Jab”,“Cross”,“Crochet”,“Coude”,“Genou”,“Roundhouse”], rounds:8, duree_round:180, repos:40, exercices:[{nom:“Sparring shadowboxing”,reps:“6x3min”,desc:“Intensité maximale, technique parfaite”},{nom:“Sprints”,reps:“10x30s”,desc:“Explosivité et cardio anaérobie”},{nom:“Gainage dynamique”,reps:“5x45s”,desc:“Planche, mountain climbers, rotation”}], conseil_coach:“L’élite s’entraîne avec la même intensité que le jour du combat. Donne tout !”, calories_estimees:650 },
{ titre:“Cardio Muay Thai”, emoji:“💥”, objectif:“Endurance maximale — va chercher tes limites !”, niveau:“Avancé”, combo:[“Teep”,“Roundhouse”,“Genou”,“Coude”], rounds:8, duree_round:180, repos:35, exercices:[{nom:“Circuit training”,reps:“5 rounds”,desc:“Enchaîne sans pause entre les exercices”},{nom:“Sauts pliométriques”,reps:“4x20”,desc:“Explosivité des jambes”},{nom:“Abdos intenses”,reps:“5x30”,desc:“V-sit, bicycle crunch, russian twist”}], conseil_coach:“La fatigue est mentale. Ton corps peut beaucoup plus que tu ne le crois !”, calories_estimees:700 },
],
};

function useOnlineStatus() {
const [isOnline, setIsOnline] = useState(navigator.onLine);
useEffect(() => {
const on = () => setIsOnline(true);
const off = () => setIsOnline(false);
window.addEventListener(“online”, on);
window.addEventListener(“offline”, off);
return () => { window.removeEventListener(“online”, on); window.removeEventListener(“offline”, off); };
}, []);
return isOnline;
}

function OfflineBanner({ isOnline }) {
if (isOnline) return null;
return (
<div style={{position: “absolute”, top: 44, left: 0, right: 0, zIndex: 150, background: “rgba(245,158,11,0.95)”, padding: “8px 16px”, display: “flex”, alignItems: “center”, gap: 8, backdropFilter: “blur(8px)”,}}>
<span style={{ fontSize: 14 }}>📵</span>
<span style={{ fontSize: 12, color: “#000”, fontFamily: “‘Bebas Neue’, cursive”, letterSpacing: 1 }}>
MODE HORS LIGNE — Timer, techniques et progression disponibles
</span>
</div>
);
}

function OfflineMessage({ feature }) {
return (
<div style={{background: “rgba(245,158,11,0.08)”, border: “1px solid rgba(245,158,11,0.3)”, borderRadius: 14, padding: 16, margin: “12px 0”, display: “flex”, alignItems: “flex-start”, gap: 12,}}>
<span style={{ fontSize: 24, flexShrink: 0 }}>📵</span>
<div>
<div style={{ fontSize: 13, fontFamily: “‘Bebas Neue’, cursive”, color: “#f59e0b”, letterSpacing: 1, marginBottom: 4 }}>
MODE HORS LIGNE
</div>
<div style={{ fontSize: 12, color: “#888”, lineHeight: 1.5 }}>
{feature} nécessite une connexion internet. Reconnecte-toi pour utiliser cette fonctionnalité.
</div>
<div style={{ fontSize: 11, color: “#666”, marginTop: 6 }}>
✅ Timer · Techniques · Progression · Badges disponibles hors ligne
</div>
</div>
</div>
);
}

// ── SHARE SYSTEM ─────────────────────────────────────────────
function ShareCard({ title, subtitle, emoji, stats, color, onClose }) {
const canvasRef = useRef(null);
const [imageUrl, setImageUrl] = useState(null);

useEffect(() => {
const canvas = canvasRef.current;
if (!canvas) return;
const ctx = canvas.getContext(“2d”);
canvas.width = 1080;
canvas.height = 1080;

```
const bg = ctx.createLinearGradient(0, 0, 1080, 1080);
bg.addColorStop(0, "#0a0a0a");
bg.addColorStop(0.5, "#1a0000");
bg.addColorStop(1, "#0a0a0a");
ctx.fillStyle = bg;
ctx.fillRect(0, 0, 1080, 1080);

ctx.beginPath();
ctx.arc(900, 180, 300, 0, Math.PI * 2);
ctx.strokeStyle = `${color}30`;
ctx.lineWidth = 2;
ctx.stroke();
ctx.beginPath();
ctx.arc(900, 180, 220, 0, Math.PI * 2);
ctx.strokeStyle = `${color}20`;
ctx.lineWidth = 1;
ctx.stroke();

const corners = [[60,60,1,1],[1020,60,-1,1],[60,1020,1,-1],[1020,1020,-1,-1]];
corners.forEach(([x,y,dx,dy]) => {
  ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+dx*50,y);
  ctx.strokeStyle = `${color}80`;ctx.lineWidth = 3;ctx.stroke();
  ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x,y+dy*50);ctx.stroke();
});

ctx.font = "160px serif";
ctx.textAlign = "center";
ctx.fillText(emoji, 540, 380);

ctx.fillStyle = "#ffffff";
ctx.font = "bold 88px Arial, sans-serif";
ctx.letterSpacing = "8px";
ctx.fillText(title.toUpperCase(), 540, 500);

ctx.fillStyle = color;
ctx.font = "48px Arial, sans-serif";
ctx.fillText(subtitle, 540, 570);

if (stats && stats.length > 0) {
  const statW = 280;
  const startX = 540 - ((stats.length - 1) * statW / 2);
  stats.forEach((s, i) => {
    const x = startX + i * statW;
    ctx.fillStyle = `${color}20`;
    ctx.beginPath();
    ctx.roundRect(x - 110, 620, 220, 120, 16);
    ctx.fill();
    ctx.strokeStyle = `${color}50`;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 52px Arial";
    ctx.fillText(s.value, x, 690);
    ctx.fillStyle = "#888888";
    ctx.font = "28px Arial";
    ctx.fillText(s.label, x, 724);
  });
}

ctx.fillStyle = "#ef4444";
ctx.font = "bold 52px Arial";
ctx.fillText("AUTAM", 540, 860);
ctx.fillStyle = "#ffffff";
ctx.font = "36px Arial";
ctx.fillText("MUAY THAI", 540, 910);

ctx.fillStyle = "#444444";
ctx.font = "italic 28px Georgia, serif";
ctx.fillText("Forge ton corps · Affûte ton esprit", 540, 980);

setImageUrl(canvas.toDataURL("image/png"));
```

}, []);

const shareImage = async () => {
if (!imageUrl) return;
try {
const blob = await (await fetch(imageUrl)).blob();
const file = new File([blob], “autam-muaythai.png”, { type: “image/png” });
if (navigator.share && navigator.canShare({ files: [file] })) {
await navigator.share({ files: [file], title: “Autam Muay Thai”, text: subtitle });
} else {
const a = document.createElement(“a”);
a.href = imageUrl; a.download = “autam-muaythai.png”; a.click();
}
} catch {}
};

const shareText = async () => {
const text = `🥊 ${title}\n${subtitle}\n\nEntraîne-toi avec Autam Muay Thai !\nautammuaythai.com`;
try {
if (navigator.share) {
await navigator.share({ title: “Autam Muay Thai”, text });
} else {
await navigator.clipboard.writeText(text);
alert(“Texte copié dans le presse-papiers !”);
}
} catch {}
};

return (
<div style={{ position: “absolute”, inset: 0, zIndex: 200, background: “rgba(0,0,0,0.92)”, display: “flex”, flexDirection: “column”, padding: 20, overflowY: “auto” }}>
<canvas ref={canvasRef} style={{ display: “none” }} />
<div style={{ display: “flex”, justifyContent: “space-between”, alignItems: “center”, marginBottom: 16 }}>
<div style={{ fontSize: 18, fontFamily: “‘Bebas Neue’, cursive”, color: “#fff”, letterSpacing: 2 }}>📤 PARTAGER</div>
<button onClick={onClose} style={{ background: “rgba(255,255,255,0.06)”, border: “1px solid rgba(255,255,255,0.1)”, color: “#fff”, borderRadius: “50%”, width: 36, height: 36, fontSize: 16, cursor: “pointer” }}>✕</button>
</div>

```
  {/* Preview */}
  {imageUrl && (
    <div style={{ marginBottom: 16, borderRadius: 16, overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)" }}>
      <img src={imageUrl} alt="share preview" style={{ width: "100%", display: "block" }} />
    </div>
  )}
  {!imageUrl && (
    <div style={{ height: 200, background: "rgba(255,255,255,0.03)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
      <div style={{ fontSize: 13, color: "#555" }}>Génération en cours...</div>
    </div>
  )}

  {/* Share buttons */}
  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
    <button onClick={shareImage} style={{ width: "100%", border: "none", borderRadius: 14, padding: "14px", background: "linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)", color: "#fff", fontFamily: "'Bebas Neue', cursive", letterSpacing: 2, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
      <span style={{ fontSize: 20 }}>📸</span> PARTAGER L'IMAGE (INSTAGRAM / TIKTOK)
    </button>
    <button onClick={shareText} style={{ width: "100%", border: "1px solid rgba(37,211,102,0.4)", borderRadius: 14, padding: "14px", background: "rgba(37,211,102,0.08)", color: "#25d366", fontFamily: "'Bebas Neue', cursive", letterSpacing: 2, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
      <span style={{ fontSize: 20 }}>💬</span> PARTAGER VIA WHATSAPP / SMS
    </button>
  </div>

  <div style={{ textAlign: "center", marginTop: 12, fontSize: 10, color: "#444", lineHeight: 1.6 }}>
    L'image sera sauvegardée dans ta galerie<br />avant d'être partagée
  </div>
</div>
```

);
}

function useShare() {
const [shareData, setShareData] = useState(null);

const shareProgress = (stats) => {
const progStats = progression.getStats();
setShareData({
title: “Ma Progression”,
subtitle: `${progStats.sessions} séances · ${progStats.streak} jours de streak`,
emoji: “📈”,
color: “#22c55e”,
stats: [
{ value: String(progStats.sessions), label: “Séances” },
{ value: `${progStats.streak}j`, label: “Streak” },
{ value: `${progStats.totalCalories}`, label: “Calories” },
]
});
};

const shareBadge = (badge) => {
setShareData({
title: badge.name,
subtitle: `Badge débloqué sur Autam Muay Thai !`,
emoji: badge.icon,
color: “#f59e0b”,
stats: [{ value: badge.icon, label: badge.category }]
});
};

const shareDefi = (defi) => {
setShareData({
title: “Défi Complété !”,
subtitle: defi.titre,
emoji: defi.emoji || “⚡”,
color: “#ef4444”,
stats: [
{ value: `${defi.rounds}`, label: “Rounds” },
{ value: `~${defi.calories_estimees}`, label: “Calories” },
]
});
};

const closeShare = () => setShareData(null);

return { shareData, shareProgress, shareBadge, shareDefi, closeShare };
}

// ── COACH CHAT SCREEN ────────────────────────────────────────
const QUICK_QUESTIONS = [
“Comment améliorer ma garde ?”,
“Programme pour débutant ?”,
“Conseils nutrition avant entraînement ?”,
“Comment travailler le Teep ?”,
“Comment récupérer après une séance intense ?”,
“Quels exercices pour améliorer ma puissance ?”,
];

function CoachChatScreen({ setScreen, isPremium, goPaywall, isOnline }) {
const [messages, setMessages] = useState(() => {
try { return JSON.parse(localStorage.getItem(“amt_chat”) || “[]”); } catch { return []; }
});
const [input, setInput] = useState(””);
const [loading, setLoading] = useState(false);
const messagesEndRef = useRef(null);
const inputRef = useRef(null);
const stats = progression.getStats();

useEffect(() => {
messagesEndRef.current?.scrollIntoView({ behavior: “smooth” });
}, [messages]);

const saveMessages = (msgs) => {
localStorage.setItem(“amt_chat”, JSON.stringify(msgs.slice(-50))); // Keep last 50
};

const sendMessage = async (text) => {
if (!text.trim() || loading) return;
if (!isPremium) { goPaywall(); return; }
if (!isOnline) {
const offlineMsg = { role: “assistant”, content: “📵 Je suis hors ligne en ce moment. Reconnecte-toi à internet pour me parler. En attendant, tu peux utiliser le Timer, les Techniques et ta Progression !”, time: new Date().toLocaleTimeString(“fr-FR”, { hour: “2-digit”, minute: “2-digit” }) };
setMessages(prev => […prev, { role: “user”, content: text, time: new Date().toLocaleTimeString(“fr-FR”, { hour: “2-digit”, minute: “2-digit” }) }, offlineMsg]);
setInput(””);
return;
}

```
const userMsg = { role: "user", content: text, time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) };
const newMessages = [...messages, userMsg];
setMessages(newMessages);
setInput("");
setLoading(true);

try {
  const history = newMessages.slice(-10).map(m => ({
    role: m.role === "user" ? "user" : "assistant",
    content: m.content,
  }));

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514", max_tokens: 600,
      system: `Tu es un coach expert en Muay Thai, nutrition sportive et préparation physique. Tu t'appelles "Coach Autam". Tu réponds en français, de façon concise, motivante et pratique. Tu connais le profil de l'élève: ${stats.sessions} séances complétées, ${stats.streak} jours de streak, ${stats.totalMinutes} minutes d'entraînement total. Adapte tes conseils à son niveau. Sois direct, bienveillant et professionnel comme un vrai coach. Maximum 150 mots par réponse.`,
      messages: history,
    })
  });
  const data = await res.json();
  const reply = data.content?.map(c => c.text || "").join("") || "Désolé, je n'ai pas pu répondre. Réessaie !";
  const aiMsg = { role: "assistant", content: reply, time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) };
  const finalMessages = [...newMessages, aiMsg];
  setMessages(finalMessages);
  saveMessages(finalMessages);
} catch {
  const errMsg = { role: "assistant", content: "Connexion impossible. Vérifie ta connexion et réessaie.", time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) };
  const finalMessages = [...newMessages, errMsg];
  setMessages(finalMessages);
  saveMessages(finalMessages);
}
setLoading(false);
```

};

const clearChat = () => {
setMessages([]);
localStorage.removeItem(“amt_chat”);
};

return (
<div style={{ height: “100%”, display: “flex”, flexDirection: “column”, background: “#0a0a0a” }}>
{/* Header */}
<div style={{ background: “#0a0a0a”, padding: “16px”, borderBottom: “1px solid rgba(255,255,255,0.06)”, display: “flex”, alignItems: “center”, gap: 12, flexShrink: 0 }}>
<button onClick={() => setScreen(“home”)} style={{ background: “rgba(255,255,255,0.06)”, border: “1px solid rgba(255,255,255,0.1)”, color: “#fff”, borderRadius: “50%”, width: 36, height: 36, fontSize: 16, cursor: “pointer”, flexShrink: 0 }}>←</button>
<div style={{ width: 42, height: 42, borderRadius: “50%”, background: “linear-gradient(135deg, #ef4444, #7f1d1d)”, display: “flex”, alignItems: “center”, justifyContent: “center”, fontSize: 20, flexShrink: 0, boxShadow: “0 0 12px rgba(239,68,68,0.4)” }}>🥊</div>
<div style={{ flex: 1 }}>
<div style={{ fontSize: 16, fontFamily: “‘Bebas Neue’, cursive”, color: “#fff”, letterSpacing: 1 }}>COACH AUTAM</div>
<div style={{ display: “flex”, alignItems: “center”, gap: 5, marginTop: 2 }}>
<div style={{ width: 6, height: 6, borderRadius: “50%”, background: “#22c55e” }}/>
<span style={{ fontSize: 10, color: “#22c55e” }}>En ligne · Coach IA Muay Thai</span>
</div>
</div>
{messages.length > 0 && (
<button onClick={clearChat} style={{ background: “none”, border: “none”, color: “#555”, fontSize: 11, cursor: “pointer”, fontFamily: “‘Bebas Neue’, cursive”, letterSpacing: 1 }}>EFFACER</button>
)}
</div>

```
  {/* Premium lock */}
  {!isPremium && (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center" }}>
      <div style={{ fontSize: 60, marginBottom: 16 }}>🔒</div>
      <div style={{ fontSize: 22, fontFamily: "'Bebas Neue', cursive", color: "#f59e0b", letterSpacing: 2, marginBottom: 8 }}>COACH IA PREMIUM</div>
      <div style={{ fontSize: 13, color: "#888", marginBottom: 24, lineHeight: 1.6 }}>
        Pose toutes tes questions à ton coach IA personnel — techniques, nutrition, récupération, programmes...
      </div>
      <button onClick={goPaywall} style={{ width: "100%", border: "none", borderRadius: 16, padding: "15px", background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "#000", fontFamily: "'Bebas Neue', cursive", letterSpacing: 2, fontSize: 16, cursor: "pointer", boxShadow: "0 0 24px rgba(245,158,11,0.4)" }}>
        ⭐ DÉBLOQUER LE CHAT
      </button>
    </div>
  )}

  {/* Messages */}
  {isPremium && (
    <>
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px" }}>
        {/* Message de bienvenue */}
        {messages.length === 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg, #ef4444, #7f1d1d)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>🥊</div>
              <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: "0 14px 14px 14px", padding: "12px 14px", maxWidth: "80%" }}>
                <div style={{ fontSize: 13, color: "#fff", lineHeight: 1.6, marginBottom: 4 }}>
                  Salut ! Je suis ton Coach Autam 🥊 Je suis là pour t'aider sur tout ce qui concerne le Muay Thai, la nutrition et ta progression.
                </div>
                <div style={{ fontSize: 13, color: "#ddd", lineHeight: 1.6 }}>
                  Pose-moi n'importe quelle question, je suis là ! 💪
                </div>
                <div style={{ fontSize: 10, color: "#555", marginTop: 6 }}>Coach Autam</div>
              </div>
            </div>

            {/* Questions rapides */}
            <div style={{ fontSize: 11, color: "#555", letterSpacing: 2, fontFamily: "'Bebas Neue', cursive", marginBottom: 10 }}>QUESTIONS RAPIDES</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {QUICK_QUESTIONS.map(q => (
                <button key={q} onClick={() => sendMessage(q)} style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 20, padding: "8px 14px", cursor: "pointer", color: "#ddd", fontSize: 12, textAlign: "left", fontFamily: "Georgia, serif" }}>
                  💬 {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.map((msg, i) => (
          <div key={i} style={{ display: "flex", gap: 10, marginBottom: 14, flexDirection: msg.role === "user" ? "row-reverse" : "row" }}>
            {msg.role === "assistant" && (
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg, #ef4444, #7f1d1d)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0, alignSelf: "flex-end" }}>🥊</div>
            )}
            <div style={{ maxWidth: "78%" }}>
              <div style={{background: msg.role === "user" ? "#ef4444" : "rgba(255,255,255,0.06)", borderRadius: msg.role === "user" ? "14px 14px 0 14px" : "0 14px 14px 14px", padding: "10px 14px",}}>
                <div style={{ fontSize: 13, color: "#fff", lineHeight: 1.65 }}>{msg.content}</div>
              </div>
              <div style={{ fontSize: 10, color: "#444", marginTop: 4, textAlign: msg.role === "user" ? "right" : "left" }}>{msg.time}</div>
            </div>
          </div>
        ))}

        {/* Loading dots */}
        {loading && (
          <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
            <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg, #ef4444, #7f1d1d)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>🥊</div>
            <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: "0 14px 14px 14px", padding: "14px 16px" }}>
              <style>{`@keyframes dot{0%,80%,100%{opacity:0.3}40%{opacity:1}}`}</style>
              <div style={{ display: "flex", gap: 4 }}>
                {[0,1,2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "#aaa", animation: `dot 1.2s ease ${i*0.2}s infinite` }}/>)}
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef}/>
      </div>

      {/* Input */}
      <div style={{ padding: "10px 12px 20px", borderTop: "1px solid rgba(255,255,255,0.06)", background: "#0a0a0a", display: "flex", gap: 8, alignItems: "flex-end", flexShrink: 0 }}>
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if(e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
          placeholder="Pose ta question au Coach Autam..."
          style={{ flex: 1, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, color: "#fff", fontSize: 13, padding: "10px 14px", resize: "none", fontFamily: "Georgia, serif", maxHeight: 80, minHeight: 44, outline: "none" }}
          rows={1}
        />
        <button onClick={() => sendMessage(input)} disabled={!input.trim() || loading} style={{ width: 44, height: 44, borderRadius: "50%", background: input.trim() && !loading ? "#ef4444" : "rgba(255,255,255,0.06)", border: "none", color: "#fff", fontSize: 18, cursor: input.trim() && !loading ? "pointer" : "not-allowed", flexShrink: 0, boxShadow: input.trim() && !loading ? "0 0 16px rgba(239,68,68,0.4)" : "none", transition: "all 0.2s" }}>
          ↑
        </button>
      </div>
    </>
  )}
</div>
```

);
}

// ── DÉFI DU JOUR ──────────────────────────────────────────────
const defiStorage = {
get: () => { try { return JSON.parse(localStorage.getItem(“amt_defi”) || “null”); } catch { return null; } },
set: (d) => localStorage.setItem(“amt_defi”, JSON.stringify(d)),
isToday: (d) => d && new Date(d.date).toDateString() === new Date().toDateString(),
};

function DefiDuJourScreen({ setScreen, isPremium, goPaywall, onBadge, onShare, isOnline }) {
const [level, setLevel] = useState(() => localStorage.getItem(“amt_defi_level”) || “Débutant”);
const [defi, setDefi] = useState(() => {
const saved = defiStorage.get();
return defiStorage.isToday(saved) ? saved : null;
});
const [loading, setLoading] = useState(false);
const [completed, setCompleted] = useState(false);
const [showTimer, setShowTimer] = useState(false);
const [timerRound, setTimerRound] = useState(1);
const [timeLeft, setTimeLeft] = useState(0);
const [timerRunning, setTimerRunning] = useState(false);
const intRef = useRef(null);
const stats = progression.getStats();

const levelColors = { “Débutant”: “#22c55e”, “Intermédiaire”: “#f59e0b”, “Avancé”: “#ef4444” };
const color = levelColors[level] || “#ef4444”;

const generateDefi = async () => {
if (!isPremium) { goPaywall(); return; }
setLoading(true);
if (!isOnline) {
const offlineList = OFFLINE_DEFIS[level] || OFFLINE_DEFIS[“Débutant”];
const fallback = { …offlineList[Math.floor(Math.random() * offlineList.length)], date: new Date().toISOString(), level };
defiStorage.set(fallback);
setDefi(fallback);
setLoading(false);
return;
}
try {
const statsInfo = `${stats.sessions} séances, ${stats.streak} jours de streak, ${stats.totalMinutes} minutes d'entraînement total`;
const res = await fetch(“https://api.anthropic.com/v1/messages”, {
method: “POST”, headers: { “Content-Type”: “application/json” },
body: JSON.stringify({
model: “claude-sonnet-4-20250514”, max_tokens: 800,
system: `Tu es un coach Muay Thai expert qui crée des défis d'entraînement quotidiens personnalisés. Réponds UNIQUEMENT en JSON valide avec cette structure exacte: {"titre":"<nom accrocheur du défi>","emoji":"<1 emoji>","objectif":"<une phrase motivante>","niveau":"<niveau>","combo":["<frappe1>","<frappe2>","<frappe3>"],"rounds":<nombre>,"duree_round":<secondes>,"repos":<secondes>,"exercices":[{"nom":"<exercice>","reps":"<reps ou durée>","desc":"<conseil technique court>"}],"conseil_coach":"<conseil motivant et technique>","calories_estimees":<nombre>}`,
messages: [{
role: “user”,
content: `Crée un défi du jour en Muay Thai pour niveau ${level}. Progression de l'élève: ${statsInfo}. Date: ${new Date().toLocaleDateString("fr-FR")}. Adapte la difficulté au niveau ${level}. Le combo doit avoir 3-5 frappes. Les exercices doivent être 3-4 exercices complémentaires au Muay Thai. JSON uniquement, pas de markdown.`
}]
})
});
const data = await res.json();
const text = data.content?.map(c => c.text || “”).join(””) || “”;
const parsed = JSON.parse(text.replace(/`json|`/g, “”).trim());
const newDefi = { …parsed, date: new Date().toISOString(), level };
defiStorage.set(newDefi);
setDefi(newDefi);
} catch {
const fallback = {
titre: “Combat du Guerrier”, emoji: “🥊”,
objectif: “Forge ta technique et ta résistance aujourd’hui !”,
niveau: level, date: new Date().toISOString(), level,
combo: [“Jab”, “Cross”, “Crochet”, “Teep”],
rounds: level === “Débutant” ? 3 : level === “Intermédiaire” ? 5 : 8,
duree_round: level === “Débutant” ? 90 : level === “Intermédiaire” ? 120 : 180,
repos: level === “Débutant” ? 60 : 45,
exercices: [
{ nom: “Shadowboxing”, reps: “3 min”, desc: “Travaille ta garde et tes déplacements” },
{ nom: “Genoux sur sac”, reps: “4x20”, desc: “Monte le genou haut, rotation des hanches” },
{ nom: “Gainage”, reps: “3x45s”, desc: “Core solide = frappes puissantes” },
],
conseil_coach: “Concentre-toi sur la qualité plutôt que la quantité. Chaque frappe doit être précise !”,
calories_estimees: level === “Débutant” ? 250 : level === “Intermédiaire” ? 400 : 600,
};
defiStorage.set(fallback);
setDefi(fallback);
}
setLoading(false);
};

const startDefiTimer = () => {
setShowTimer(true);
setTimerRound(1);
setTimeLeft(defi.duree_round);
};

useEffect(() => {
if (timerRunning && showTimer) {
intRef.current = setInterval(() => {
setTimeLeft(t => {
if (t <= 1) {
if (timerRound >= defi?.rounds) {
clearInterval(intRef.current);
setTimerRunning(false);
setShowTimer(false);
setCompleted(true);
const { newBadges } = progression.addSession(Math.round((defi.rounds * defi.duree_round) / 60), `Défi: ${defi.titre}`);
if (newBadges.length > 0) setTimeout(() => onBadge(newBadges[0]), 500);
return 0;
}
setTimerRound(r => r + 1);
return defi.repos;
}
return t - 1;
});
}, 1000);
}
return () => clearInterval(intRef.current);
}, [timerRunning, showTimer, timerRound]);

const fmt = s => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
const isRest = timerRound > 1 && timeLeft > defi?.duree_round - 5;

return (
<div style={{ height: “100%”, display: “flex”, flexDirection: “column”, background: “#0a0a0a” }}>
<style>{`@keyframes celebrate{0%{transform:scale(1)}50%{transform:scale(1.05)}100%{transform:scale(1)}}`}</style>

```
  {/* Header */}
  <div style={{ background: "#0a0a0a", padding: "20px 16px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", gap: 12 }}>
    <button onClick={() => setScreen("home")} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", borderRadius: "50%", width: 36, height: 36, fontSize: 16, cursor: "pointer" }}>←</button>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 20, fontFamily: "'Bebas Neue', cursive", color: "#fff", letterSpacing: 2 }}>⚡ DÉFI DU JOUR</div>
      <div style={{ fontSize: 10, color: "#666" }}>{new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}</div>
    </div>
    {defi && <div style={{ fontSize: 10, color: color, fontFamily: "'Bebas Neue', cursive", border: `1px solid ${color}50`, borderRadius: 20, padding: "3px 10px" }}>{defi.level}</div>}
  </div>

  {/* Timer overlay */}
  {showTimer && defi && (
    <div style={{ position: "absolute", inset: 0, zIndex: 100, background: "#0a0a0a", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ fontSize: 13, color: color, fontFamily: "'Bebas Neue', cursive", letterSpacing: 3, marginBottom: 10 }}>
        {timerRound <= defi.rounds ? `ROUND ${timerRound} / ${defi.rounds}` : "⏸ REPOS"}
      </div>
      <div style={{ fontSize: 80, fontFamily: "'Bebas Neue', cursive", color: "#fff", letterSpacing: 4, marginBottom: 8 }}>{fmt(timeLeft)}</div>
      <div style={{ fontSize: 13, color: "#666", marginBottom: 32, fontStyle: "italic" }}>{defi.combo.join(" → ")}</div>
      <div style={{ display: "flex", gap: 16 }}>
        <button onClick={() => { clearInterval(intRef.current); setTimerRunning(r => !r); }} style={{ background: timerRunning ? "rgba(255,255,255,0.08)" : color, border: "none", color: "#fff", borderRadius: "50%", width: 72, height: 72, fontSize: 26, cursor: "pointer", boxShadow: timerRunning ? "none" : `0 0 24px ${color}60` }}>
          {timerRunning ? "⏸" : "▶"}
        </button>
        <button onClick={() => { clearInterval(intRef.current); setShowTimer(false); setTimerRunning(false); }} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", borderRadius: "50%", width: 56, height: 56, fontSize: 18, cursor: "pointer" }}>✕</button>
      </div>
    </div>
  )}

  <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>

    {/* Completed */}
    {completed && (
      <div style={{ background: `${color}15`, border: `1px solid ${color}40`, borderRadius: 18, padding: 20, textAlign: "center", marginBottom: 16, animation: "celebrate 0.5s ease" }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>🏆</div>
        <div style={{ fontSize: 22, fontFamily: "'Bebas Neue', cursive", color, letterSpacing: 2, marginBottom: 4 }}>DÉFI COMPLÉTÉ !</div>
        <div style={{ fontSize: 13, color: "#888" }}>~{defi?.calories_estimees} kcal brûlées · Séance sauvegardée</div>
      </div>
    )}

    {/* Sélecteur de niveau */}
    {!defi && (
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: "#ef4444", letterSpacing: 3, fontFamily: "'Bebas Neue', cursive", marginBottom: 12 }}>TON NIVEAU</div>
        <div style={{ display: "flex", gap: 8 }}>
          {["Débutant", "Intermédiaire", "Avancé"].map(l => (
            <button key={l} onClick={() => { setLevel(l); localStorage.setItem("amt_defi_level", l); }} style={{flex: 1, background: level === l ? `${levelColors[l]}20` : "rgba(255,255,255,0.03)", border: `2px solid ${level === l ? levelColors[l] : "rgba(255,255,255,0.08)"}`, borderRadius: 12, padding: "10px 6px", cursor: "pointer", fontFamily: "'Bebas Neue', cursive", fontSize: 11, letterSpacing: 1, color: level === l ? levelColors[l] : "#666",}}>
              {l === "Débutant" ? "🌱" : l === "Intermédiaire" ? "⚡" : "🔥"}<br />{l}
            </button>
          ))}
        </div>
      </div>
    )}

    {/* Pas de défi — bouton générer */}
    {!defi && (
      <div style={{ textAlign: "center", padding: "32px 0" }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>⚡</div>
        <div style={{ fontSize: 22, fontFamily: "'Bebas Neue', cursive", color: "#fff", letterSpacing: 2, marginBottom: 8 }}>PRÊT POUR LE DÉFI ?</div>
        <div style={{ fontSize: 13, color: "#666", marginBottom: 28, lineHeight: 1.6 }}>
          L'IA génère un défi unique<br />adapté à ton niveau et ta progression
        </div>
        {!isPremium && (
          <div style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: 14, padding: 14, marginBottom: 16, textAlign: "center" }}>
            <div style={{ fontSize: 12, color: "#f59e0b", fontFamily: "'Bebas Neue', cursive", marginBottom: 4 }}>⭐ FONCTIONNALITÉ PREMIUM</div>
            <div style={{ fontSize: 11, color: "#666" }}>Le défi IA est réservé aux membres Premium</div>
          </div>
        )}
        <button onClick={generateDefi} disabled={loading} style={{width: "100%", border: "none", borderRadius: 16, padding: "16px", background: loading ? "rgba(239,68,68,0.3)" : `linear-gradient(135deg, ${color}, ${color}aa)`, color: "#fff", fontFamily: "'Bebas Neue', cursive", letterSpacing: 2, fontSize: 16, cursor: loading ? "not-allowed" : "pointer", boxShadow: loading ? "none" : `0 0 30px ${color}40`,}}>
          {loading ? "⏳ L'IA PRÉPARE TON DÉFI..." : "⚡ GÉNÉRER MON DÉFI"}
        </button>
      </div>
    )}

    {/* Défi affiché */}
    {defi && !loading && (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {/* Hero du défi */}
        <div style={{ background: `linear-gradient(135deg, ${color}20, ${color}08)`, border: `1px solid ${color}35`, borderRadius: 18, padding: 18, textAlign: "center" }}>
          <div style={{ fontSize: 44, marginBottom: 8 }}>{defi.emoji}</div>
          <div style={{ fontSize: 26, fontFamily: "'Bebas Neue', cursive", color: "#fff", letterSpacing: 2, marginBottom: 6 }}>{defi.titre}</div>
          <div style={{ fontSize: 13, color: "#aaa", fontStyle: "italic", lineHeight: 1.5 }}>{defi.objectif}</div>
          <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 14 }}>
            {[
              { icon: "🔄", val: `${defi.rounds} rounds` },
              { icon: "⏱", val: `${defi.duree_round}s` },
              { icon: "💪", val: `~${defi.calories_estimees} kcal` },
            ].map(s => (
              <div key={s.val} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 16 }}>{s.icon}</div>
                <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>{s.val}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Combo */}
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 14 }}>
          <div style={{ fontSize: 11, color: color, letterSpacing: 3, fontFamily: "'Bebas Neue', cursive", marginBottom: 10 }}>🥊 COMBO DU DÉFI</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {defi.combo.map((f, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ background: `${color}20`, border: `1px solid ${color}40`, borderRadius: 8, padding: "5px 10px", fontSize: 12, color: "#fff" }}>{f}</span>
                {i < defi.combo.length - 1 && <span style={{ color: "#444" }}>→</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Exercices */}
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 14 }}>
          <div style={{ fontSize: 11, color: color, letterSpacing: 3, fontFamily: "'Bebas Neue', cursive", marginBottom: 10 }}>💪 PROGRAMME</div>
          {defi.exercices?.map((ex, i) => (
            <div key={i} style={{ marginBottom: 12, paddingBottom: 10, borderBottom: i < defi.exercices.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <div style={{ fontSize: 14, fontFamily: "'Bebas Neue', cursive", color: "#fff", letterSpacing: 1 }}>{ex.nom}</div>
                <span style={{ fontSize: 12, color, fontFamily: "'Bebas Neue', cursive", background: `${color}15`, borderRadius: 20, padding: "2px 10px" }}>{ex.reps}</span>
              </div>
              <div style={{ fontSize: 11, color: "#777", fontStyle: "italic" }}>💡 {ex.desc}</div>
            </div>
          ))}
        </div>

        {/* Conseil coach */}
        <div style={{ background: "rgba(168,85,247,0.06)", border: "1px solid rgba(168,85,247,0.2)", borderRadius: 14, padding: 14 }}>
          <div style={{ fontSize: 11, color: "#a855f7", letterSpacing: 3, fontFamily: "'Bebas Neue', cursive", marginBottom: 6 }}>👑 CONSEIL DU COACH</div>
          <div style={{ fontSize: 12, color: "#ccc", lineHeight: 1.7, fontStyle: "italic" }}>{defi.conseil_coach}</div>
        </div>

        {/* Boutons action */}
        {!completed && (
          <button onClick={startDefiTimer} style={{width: "100%", border: "none", borderRadius: 16, padding: "16px", background: `linear-gradient(135deg, ${color}, ${color}bb)`, color: color === "#22c55e" ? "#000" : "#fff", fontFamily: "'Bebas Neue', cursive", letterSpacing: 2, fontSize: 16, cursor: "pointer", boxShadow: `0 0 24px ${color}40`,}}>▶ DÉMARRER LE DÉFI</button>
        )}

      {completed && (
        <button onClick={() => onShare && onShare(defi)} style={{ width: "100%", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 14, padding: "12px", background: "rgba(239,68,68,0.08)", color: "#ef4444", fontFamily: "'Bebas Neue', cursive", letterSpacing: 2, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 4 }}>
          📤 PARTAGER MON DÉFI
        </button>
      )}
        <button onClick={() => { setDefi(null); defiStorage.set(null); }} style={{width: "100%", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "12px", background: "none", color: "#555", fontFamily: "'Bebas Neue', cursive", letterSpacing: 2, fontSize: 13, cursor: "pointer",}}>🔄 GÉNÉRER UN NOUVEAU DÉFI</button>
      </div>
    )}
  </div>
</div>
```

);
}

// ── BADGES SYSTEM ─────────────────────────────────────────────

function BadgeNotification({ badge, onClose }) {
useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, []);
return (
<div style={{position: “absolute”, top: 56, left: 16, right: 16, zIndex: 200, background: “linear-gradient(135deg, #1a1a0a, #0a0a0a)”, border: “1px solid rgba(245,158,11,0.5)”, borderRadius: 16, padding: “14px 16px”, display: “flex”, alignItems: “center”, gap: 14, boxShadow: “0 0 30px rgba(245,158,11,0.3)”, animation: “badgeSlide 0.4s ease”,}}>
<style>{`@keyframes badgeSlide{from{opacity:0;transform:translateY(-20px)}to{opacity:1;transform:translateY(0)}}`}</style>
<div style={{width: 52, height: 52, borderRadius: “50%”, flexShrink: 0, background: “rgba(245,158,11,0.15)”, border: “2px solid rgba(245,158,11,0.5)”, display: “flex”, alignItems: “center”, justifyContent: “center”, fontSize: 26, boxShadow: “0 0 16px rgba(245,158,11,0.4)”,}}>{badge.icon}</div>
<div style={{ flex: 1 }}>
<div style={{ fontSize: 10, color: “#f59e0b”, fontFamily: “‘Bebas Neue’, cursive”, letterSpacing: 2, marginBottom: 2 }}>
🏆 BADGE DÉBLOQUÉ !
</div>
<div style={{ fontSize: 15, fontFamily: “‘Bebas Neue’, cursive”, color: “#fff”, letterSpacing: 1 }}>{badge.name}</div>
<div style={{ fontSize: 11, color: “#888”, marginTop: 2 }}>{badge.desc}</div>
</div>
<button onClick={onClose} style={{ background: “none”, border: “none”, color: “#555”, fontSize: 18, cursor: “pointer”, padding: 4 }}>✕</button>
</div>
);
}

function BadgesScreen({ setScreen, onShare }) {
const unlocked = badgeStorage.getUnlocked();
const stats = badgeStorage.getStats();
const categories = […new Set(ALL_BADGES.map(b => b.category))];

return (
<div style={{ height: “100%”, display: “flex”, flexDirection: “column”, background: “#0a0a0a” }}>
<div style={{ background: “#0a0a0a”, padding: “20px 16px 16px”, borderBottom: “1px solid rgba(255,255,255,0.05)”, display: “flex”, alignItems: “center”, gap: 12 }}>
<button onClick={() => setScreen(“profile”)} style={{ background: “rgba(255,255,255,0.06)”, border: “1px solid rgba(255,255,255,0.1)”, color: “#fff”, borderRadius: “50%”, width: 36, height: 36, fontSize: 16, cursor: “pointer” }}>←</button>
<div style={{ flex: 1 }}>
<div style={{ fontSize: 20, fontFamily: “‘Bebas Neue’, cursive”, color: “#fff”, letterSpacing: 2 }}>🏆 MES BADGES</div>
<div style={{ fontSize: 10, color: “#666” }}>{unlocked.length} / {ALL_BADGES.length} débloqués</div>
</div>
{unlocked.length > 0 && (
<button onClick={() => onShare && onShare(ALL_BADGES.find(b => b.id === unlocked[unlocked.length-1]))} style={{ background: “rgba(245,158,11,0.1)”, border: “1px solid rgba(245,158,11,0.3)”, color: “#f59e0b”, borderRadius: 20, padding: “6px 12px”, cursor: “pointer”, fontSize: 11, fontFamily: “‘Bebas Neue’, cursive”, letterSpacing: 1 }}>📤 PARTAGER</button>
)}
</div>

```
  <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
    {/* Progress bar */}
    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 14, marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: 12, color: "#aaa" }}>Progression globale</span>
        <span style={{ fontSize: 12, color: "#f59e0b", fontFamily: "'Bebas Neue', cursive" }}>{Math.round(unlocked.length/ALL_BADGES.length*100)}%</span>
      </div>
      <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${unlocked.length/ALL_BADGES.length*100}%`, background: "linear-gradient(90deg,#ef4444,#f59e0b)", borderRadius: 3, transition: "width 0.5s ease" }}/>
      </div>
      <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
        {[
          { label: "Séances", value: stats.sessions, icon: "🥊" },
          { label: "Streak", value: `${stats.streak}j`, icon: "🔥" },
          { label: "Analyses", value: stats.analyses, icon: "🤖" },
        ].map(s => (
          <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ fontSize: 12 }}>{s.icon}</span>
            <span style={{ fontSize: 11, color: "#666" }}>{s.value} {s.label}</span>
          </div>
        ))}
      </div>
    </div>

    {/* Badges par catégorie */}
    {categories.map(cat => (
      <div key={cat} style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, color: "#ef4444", letterSpacing: 3, fontFamily: "'Bebas Neue', cursive", marginBottom: 12 }}>{cat.toUpperCase()}</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          {ALL_BADGES.filter(b => b.category === cat).map(b => {
            const isUnlocked = unlocked.includes(b.id);
            return (
              <div key={b.id} style={{background: isUnlocked ? "rgba(245,158,11,0.08)" : "rgba(255,255,255,0.02)", border: `1px solid ${isUnlocked ? "rgba(245,158,11,0.35)" : "rgba(255,255,255,0.06)"}`, borderRadius: 14, padding: "14px 8px", textAlign: "center", transition: "all 0.3s",}}>
                <div style={{fontSize: 30, marginBottom: 6, filter: isUnlocked ? "none" : "grayscale(1) opacity(0.3)", transition: "all 0.3s",}}>{b.icon}</div>
                <div style={{ fontSize: 10, fontFamily: "'Bebas Neue', cursive", color: isUnlocked ? "#f59e0b" : "#444", letterSpacing: 1, lineHeight: 1.3, marginBottom: 4 }}>
                  {b.name}
                </div>
                <div style={{ fontSize: 9, color: isUnlocked ? "#888" : "#333", lineHeight: 1.4 }}>
                  {b.desc}
                </div>
                {isUnlocked && (
                  <div style={{ marginTop: 6, fontSize: 8, color: "#f59e0b", fontFamily: "'Bebas Neue', cursive", letterSpacing: 1 }}>✓ OBTENU</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    ))}
  </div>
</div>
```

);
}

// ── PROGRESSION SYSTEM ───────────────────────────────────────
// ── SESSION COMPLETE MODAL ────────────────────────────────────
function SessionCompleteModal({ minutes, onClose, onBadge }) {
const [saved, setSaved] = useState(false);
const cal = Math.round(minutes * 8.5);

const saveSession = () => {
const { newBadges } = progression.addSession(minutes);
setSaved(true);
if(newBadges.length > 0) setTimeout(() => onBadge(newBadges[0]), 500);
setTimeout(onClose, 1800);
};

return (
<div style={{position: “absolute”, inset: 0, zIndex: 100, background: “rgba(10,10,10,0.92)”, backdropFilter: “blur(8px)”, display: “flex”, flexDirection: “column”, alignItems: “center”, justifyContent: “center”, padding: 24, textAlign: “center”,}}>
<style>{`@keyframes popIn{from{transform:scale(0.7);opacity:0}to{transform:scale(1);opacity:1}}`}</style>
<div style={{ animation: “popIn 0.4s ease”, width: “100%” }}>
<div style={{ fontSize: 60, marginBottom: 12 }}>{saved ? “🏆” : “🎉”}</div>
<div style={{ fontSize: 28, fontFamily: “‘Bebas Neue’, cursive”, color: “#fff”, letterSpacing: 2, marginBottom: 6 }}>
{saved ? “SAUVEGARDÉ !” : “SÉANCE TERMINÉE !”}
</div>
{!saved && (
<>
<div style={{ fontSize: 13, color: “#888”, marginBottom: 24, fontStyle: “italic” }}>
Excellent travail ! Voici ton résumé
</div>
<div style={{ display: “grid”, gridTemplateColumns: “1fr 1fr”, gap: 12, marginBottom: 24 }}>
{[
{ icon: “⏱”, value: `${minutes} min`, label: “Durée” },
{ icon: “🔥”, value: `~${cal} kcal`, label: “Calories” },
].map(s => (
<div key={s.label} style={{ background: “rgba(255,255,255,0.04)”, border: “1px solid rgba(255,255,255,0.08)”, borderRadius: 14, padding: 16 }}>
<div style={{ fontSize: 28, marginBottom: 6 }}>{s.icon}</div>
<div style={{ fontSize: 22, fontFamily: “‘Bebas Neue’, cursive”, color: “#fff” }}>{s.value}</div>
<div style={{ fontSize: 11, color: “#666”, marginTop: 2 }}>{s.label}</div>
</div>
))}
</div>
<button onClick={saveSession} style={{width: “100%”, border: “none”, borderRadius: 14, padding: “15px”, background: “linear-gradient(135deg, #ef4444, #b91c1c)”, color: “#fff”, fontFamily: “‘Bebas Neue’, cursive”, letterSpacing: 2, fontSize: 16, cursor: “pointer”, boxShadow: “0 0 24px rgba(239,68,68,0.4)”, marginBottom: 10,}}>💾 SAUVEGARDER MA SÉANCE</button>
<button onClick={onClose} style={{width: “100%”, border: “1px solid rgba(255,255,255,0.1)”, borderRadius: 14, padding: “12px”, background: “none”, color: “#666”, fontFamily: “‘Bebas Neue’, cursive”, letterSpacing: 2, fontSize: 14, cursor: “pointer”,}}>IGNORER</button>
</>
)}
</div>
</div>
);
}

// ── PROGRESSION SCREEN ────────────────────────────────────────
// ── STATS SCREEN (avancé) ────────────────────────────────────
function StatsScreen({ setScreen }) {
const stats = progression.getStats();
const history = stats.history || [];
const [period, setPeriod] = useState(“30”); // 7 | 30 | 90

// Records personnels
const calculateRecords = () => {
if (!history.length) return { longestStreak:0, bestMonth:0, bestDay:0, avgPerWeek:0, totalDays:0, mostType:”—” };

```
// Plus long streak (calcul depuis l'historique)
const dates = [...new Set(history.map(h => h.date))].sort();
let longestStreak = 0, currentStreak = 0, lastDate = null;
dates.forEach(dateStr => {
  const [d,m,y] = dateStr.split("/").map(Number);
  const date = new Date(y, m-1, d);
  if (!lastDate) { currentStreak = 1; }
  else {
    const diff = Math.round((date - lastDate) / 864e5);
    if (diff === 1) currentStreak++;
    else currentStreak = 1;
  }
  longestStreak = Math.max(longestStreak, currentStreak);
  lastDate = date;
});

// Meilleur mois
const monthCounts = {};
history.forEach(h => {
  const [d,m,y] = h.date.split("/");
  const key = `${m}/${y}`;
  monthCounts[key] = (monthCounts[key] || 0) + 1;
});
const bestMonth = Math.max(0, ...Object.values(monthCounts));

// Meilleur jour (max sessions en un jour)
const dayCounts = {};
history.forEach(h => { dayCounts[h.date] = (dayCounts[h.date] || 0) + 1; });
const bestDay = Math.max(0, ...Object.values(dayCounts));

// Moyenne par semaine
const totalDays = dates.length;
const weeks = Math.max(1, totalDays / 7);
const avgPerWeek = Math.round((stats.sessions / weeks) * 10) / 10;

// Type le plus fréquent
const typeCounts = {};
history.forEach(h => { typeCounts[h.type] = (typeCounts[h.type] || 0) + 1; });
const mostType = Object.entries(typeCounts).sort((a,b) => b[1]-a[1])[0]?.[0] || "—";

return { longestStreak, bestMonth, bestDay, avgPerWeek, totalDays, mostType };
```

};

const records = calculateRecords();

// Évolution sur N jours (graphique ligne)
const evolution = (() => {
const days = parseInt(period);
const data = [];
const today = new Date();
today.setHours(0,0,0,0);
for (let i = days - 1; i >= 0; i–) {
const d = new Date(today);
d.setDate(d.getDate() - i);
const ds = d.toLocaleDateString(“fr-FR”);
const count = history.filter(h => h.date === ds).length;
data.push({ date:d, count, ds });
}
return data;
})();

const maxEvol = Math.max(1, …evolution.map(e => e.count));

// Heatmap GitHub style — 90 derniers jours
const heatmap = (() => {
const data = [];
const today = new Date();
today.setHours(0,0,0,0);
for (let i = 89; i >= 0; i–) {
const d = new Date(today);
d.setDate(d.getDate() - i);
const ds = d.toLocaleDateString(“fr-FR”);
const count = history.filter(h => h.date === ds).length;
data.push({ date:d, count });
}
return data;
})();

// Répartition par type
const typeStats = (() => {
const counts = {};
history.forEach(h => { counts[h.type] = (counts[h.type] || 0) + 1; });
const total = Object.values(counts).reduce((s,n) => s+n, 0);
return Object.entries(counts).sort((a,b) => b[1]-a[1]).map(([type, count]) => ({
type, count, pct: total ? Math.round((count/total)*100) : 0,
}));
})();

const typeColors = [”#ef4444”, “#f59e0b”, “#22c55e”, “#a855f7”, “#06b6d4”, “#ec4899”];

return (
<div style={{ height:“100%”, display:“flex”, flexDirection:“column”, background:D.bg }}>
{/* Header */}
<div style={{ background:D.bg, padding:“20px 16px 16px”, borderBottom:`1px solid ${D.border}`, display:“flex”, alignItems:“center”, gap:12 }}>
<button onClick={() => setScreen(“progression”)} style={{ background:D.bgCard, border:`1px solid ${D.border}`, color:D.textPrimary, borderRadius:“50%”, width:36, height:36, fontSize:16, cursor:“pointer” }}>←</button>
<div>
<div style={{ fontSize:20, fontFamily:D.heading, color:D.textPrimary, letterSpacing:2 }}>📊 STATS AVANCÉES</div>
<div style={{ fontSize:10, color:D.textMuted }}>Records · graphiques · analyses</div>
</div>
</div>

```
  <div style={{ flex:1, overflowY:"auto", padding:16 }}>

    {/* Records personnels */}
    <SLabel>🏅 RECORDS PERSONNELS</SLabel>
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:20 }}>
      {[
        { icon:"🔥", label:"Plus long streak", value:`${records.longestStreak}j`, color:D.gold },
        { icon:"📅", label:"Meilleur mois", value:`${records.bestMonth}`, color:D.red, sub:"séances" },
        { icon:"⚡", label:"Meilleur jour", value:`${records.bestDay}`, color:D.green, sub:"séances" },
        { icon:"📈", label:"Moy/semaine", value:`${records.avgPerWeek}`, color:"#a855f7", sub:"séances" },
      ].map(r => (
        <div key={r.label} style={{ background:`${r.color}10`, border:`1px solid ${r.color}30`, borderRadius:D.rl, padding:14 }}>
          <div style={{ fontSize:22, marginBottom:6 }}>{r.icon}</div>
          <div style={{ fontSize:24, fontFamily:D.heading, color:r.color, lineHeight:1 }}>{r.value}</div>
          <div style={{ fontSize:10, color:D.textMuted, marginTop:4 }}>{r.sub || ""} {r.label}</div>
        </div>
      ))}
    </div>

    {/* Évolution */}
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
      <SLabel style={{ marginBottom:0 }}>📈 ÉVOLUTION</SLabel>
      <div style={{ display:"flex", gap:6 }}>
        {[{v:"7",l:"7j"},{v:"30",l:"30j"},{v:"90",l:"90j"}].map(p => (
          <button key={p.v} onClick={() => setPeriod(p.v)} style={{
            background: period===p.v ? D.red : "transparent",
            border: `1px solid ${period===p.v ? D.red : D.border}`,
            color: period===p.v ? "#fff" : D.textMuted,
            borderRadius:20, padding:"4px 10px", cursor:"pointer",
            fontSize:10, fontFamily:D.heading, letterSpacing:1,
          }}>{p.l}</button>
        ))}
      </div>
    </div>
    <div style={{ background:D.bgCard, border:`1px solid ${D.border}`, borderRadius:D.rl, padding:14, marginBottom:20 }}>
      {history.length === 0 ? (
        <div style={{ textAlign:"center", padding:"20px 0", color:D.textMuted, fontSize:12 }}>
          Aucune séance enregistrée
        </div>
      ) : (
        <>
          <div style={{ display:"flex", alignItems:"flex-end", gap:2, height:80, marginBottom:8 }}>
            {evolution.map((e, i) => (
              <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", justifyContent:"flex-end" }}>
                <div style={{
                  width:"100%",
                  height:`${(e.count/maxEvol)*72}px`,
                  minHeight: e.count > 0 ? 3 : 0,
                  background: e.count > 0 ? `linear-gradient(180deg,${D.red},${D.redDark})` : "transparent",
                  borderRadius:2,
                  transition:"all 0.3s",
                }}/>
              </div>
            ))}
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", fontSize:9, color:D.textMuted }}>
            <span>{evolution[0]?.date.toLocaleDateString("fr-FR",{day:"numeric",month:"short"})}</span>
            <span>Aujourd'hui</span>
          </div>
        </>
      )}
    </div>

    {/* Heatmap GitHub style */}
    <SLabel>🔥 ACTIVITÉ DES 90 DERNIERS JOURS</SLabel>
    <div style={{ background:D.bgCard, border:`1px solid ${D.border}`, borderRadius:D.rl, padding:14, marginBottom:20 }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(15, 1fr)", gap:3 }}>
        {heatmap.map((d, i) => {
          const intensity = Math.min(d.count, 4);
          const colors = ["rgba(255,255,255,0.04)", `${D.red}40`, `${D.red}70`, `${D.red}b0`, D.red];
          return (
            <div key={i} title={`${d.date.toLocaleDateString("fr-FR")} : ${d.count} séance${d.count>1?"s":""}`} style={{
              aspectRatio:"1", borderRadius:3,
              background: colors[intensity],
              border:`1px solid ${intensity > 0 ? D.borderHi : D.border}`,
              boxShadow: intensity >= 3 ? `0 0 4px ${D.red}80` : "none",
            }}/>
          );
        })}
      </div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:10, fontSize:10, color:D.textMuted }}>
        <span>Moins</span>
        <div style={{ display:"flex", gap:3 }}>
          {[0,1,2,3,4].map(i => (
            <div key={i} style={{ width:12, height:12, borderRadius:3, background:["rgba(255,255,255,0.04)", `${D.red}40`, `${D.red}70`, `${D.red}b0`, D.red][i] }}/>
          ))}
        </div>
        <span>Plus</span>
      </div>
    </div>

    {/* Répartition par type */}
    <SLabel>🥊 RÉPARTITION PAR TYPE</SLabel>
    <div style={{ background:D.bgCard, border:`1px solid ${D.border}`, borderRadius:D.rl, padding:14, marginBottom:16 }}>
      {typeStats.length === 0 ? (
        <div style={{ textAlign:"center", padding:"20px 0", color:D.textMuted, fontSize:12 }}>
          Pas encore assez de données
        </div>
      ) : (
        typeStats.map((t, i) => (
          <div key={t.type} style={{ marginBottom:i<typeStats.length-1?12:0 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
              <span style={{ fontSize:12, color:D.textPrimary, fontFamily:D.heading, letterSpacing:1 }}>{t.type}</span>
              <span style={{ fontSize:11, color:typeColors[i%6], fontFamily:D.heading }}>{t.count} ({t.pct}%)</span>
            </div>
            <div style={{ height:6, background:"rgba(255,255,255,0.06)", borderRadius:3, overflow:"hidden" }}>
              <div style={{ height:"100%", width:`${t.pct}%`, background:typeColors[i%6], borderRadius:3, transition:"width 0.5s" }}/>
            </div>
          </div>
        ))
      )}
    </div>

    {/* Stats globales */}
    <SLabel>📊 STATISTIQUES GLOBALES</SLabel>
    <div style={{ background:D.bgCard, border:`1px solid ${D.border}`, borderRadius:D.rl, padding:14 }}>
      {[
        { label:"Total séances", value:stats.sessions || 0 },
        { label:"Total minutes", value:`${stats.totalMinutes || 0}min` },
        { label:"Total calories", value:`${stats.totalCalories || 0}` },
        { label:"Jours actifs", value:records.totalDays },
        { label:"Type favori", value:records.mostType },
      ].map((s, i, arr) => (
        <div key={s.label} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:i<arr.length-1?`1px solid ${D.border}`:"none" }}>
          <span style={{ fontSize:12, color:D.textMuted }}>{s.label}</span>
          <span style={{ fontSize:13, color:D.textPrimary, fontFamily:D.heading, letterSpacing:1 }}>{s.value}</span>
        </div>
      ))}
    </div>
  </div>
</div>
```

);
}

function ProgressionScreen({ setScreen, onBadge, onShare }) {
const [stats, setStats] = useState(progression.getStats());
const [showManual, setShowManual] = useState(false);
const [manualMinutes, setManualMinutes] = useState(30);
const [manualType, setManualType] = useState(“Entraînement général”);
const [justSaved, setJustSaved] = useState(false);

const hours = Math.floor(stats.totalMinutes / 60);
const mins = stats.totalMinutes % 60;
const weekly = stats.weeklySessionss || [0,0,0,0,0,0,0];
const maxW = Math.max(…weekly, 1);
const today = new Date().getDay();

const addManual = () => {
const { newBadges } = progression.addSession(manualMinutes, manualType);
setStats(progression.getStats());
setShowManual(false);
setJustSaved(true);
setTimeout(() => setJustSaved(false), 2000);
if(newBadges.length > 0) setTimeout(() => onBadge(newBadges[0]), 500);
};

const types = [“Entraînement général”, “Cardio”, “Technique”, “Sparring”, “Sac de frappe”, “Pad work”];

return (
<div style={{ height: “100%”, display: “flex”, flexDirection: “column”, background: “#0a0a0a” }}>
{/* Header */}
<div style={{ background: “#0a0a0a”, padding: “20px 16px 16px”, borderBottom: “1px solid rgba(255,255,255,0.05)”, display: “flex”, alignItems: “center”, gap: 12 }}>
<button onClick={() => setScreen(“profile”)} style={{ background: “rgba(255,255,255,0.06)”, border: “1px solid rgba(255,255,255,0.1)”, color: “#fff”, borderRadius: “50%”, width: 36, height: 36, fontSize: 16, cursor: “pointer” }}>←</button>
<div style={{ flex: 1 }}>
<div style={{ fontSize: 20, fontFamily: “‘Bebas Neue’, cursive”, color: “#fff”, letterSpacing: 2 }}>📈 MA PROGRESSION</div>
<div style={{ fontSize: 10, color: “#666” }}>Suivi de tes entraînements</div>
</div>
{justSaved && <div style={{ fontSize: 11, color: “#22c55e”, fontFamily: “‘Bebas Neue’, cursive” }}>✅ SAUVEGARDÉ !</div>}
<button onClick={() => setScreen(“stats”)} style={{ background: “rgba(168,85,247,0.1)”, border: “1px solid rgba(168,85,247,0.3)”, color: “#a855f7”, borderRadius: 20, padding: “6px 12px”, cursor: “pointer”, fontSize: 11, fontFamily: “‘Bebas Neue’, cursive”, letterSpacing: 1 }}>📊 STATS</button>
<button onClick={() => onShare && onShare()} style={{ background: “rgba(34,197,94,0.1)”, border: “1px solid rgba(34,197,94,0.3)”, color: “#22c55e”, borderRadius: 20, padding: “6px 12px”, cursor: “pointer”, fontSize: 11, fontFamily: “‘Bebas Neue’, cursive”, letterSpacing: 1 }}>📤 PARTAGER</button>
</div>

```
  <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
    {/* Stats principales */}
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
      {[
        { icon: "🥊", value: stats.sessions, label: "Séances", color: "#ef4444" },
        { icon: "🔥", value: `${stats.streak}j`, label: "Streak actuel", color: "#f59e0b" },
        { icon: "⏱", value: hours > 0 ? `${hours}h${mins>0?mins+"m":""}` : `${mins}m`, label: "Temps total", color: "#22c55e" },
        { icon: "💪", value: `${stats.totalCalories}`, label: "Calories brûlées", color: "#a855f7" },
      ].map(s => (
        <div key={s.label} style={{ background: `${s.color}10`, border: `1px solid ${s.color}30`, borderRadius: 14, padding: 14 }}>
          <div style={{ fontSize: 24, marginBottom: 6 }}>{s.icon}</div>
          <div style={{ fontSize: 22, fontFamily: "'Bebas Neue', cursive", color: s.color }}>{s.value}</div>
          <div style={{ fontSize: 10, color: "#666", marginTop: 2 }}>{s.label}</div>
        </div>
      ))}
    </div>

    {/* Bouton Stats avancées */}
    <button onClick={() => setScreen("stats")} style={{ width:"100%", border:"1px solid rgba(168,85,247,0.3)", borderRadius:14, padding:"12px", background:"rgba(168,85,247,0.06)", color:"#a855f7", fontFamily:"'Bebas Neue', cursive", letterSpacing:2, fontSize:13, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:10, marginBottom:16 }}>
      <span style={{ fontSize:16 }}>📊</span> VOIR LES STATS AVANCÉES
    </button>

    {/* Activité semaine */}
    <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 14, marginBottom: 16 }}>
      <div style={{ fontSize: 11, color: "#ef4444", letterSpacing: 3, fontFamily: "'Bebas Neue', cursive", marginBottom: 12 }}>ACTIVITÉ CETTE SEMAINE</div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 60, marginBottom: 8 }}>
        {["D","L","M","M","J","V","S"].map((d,i) => {
          const val = weekly[i] || 0;
          const h = Math.max(4, (val/maxW)*52);
          const isToday = i === today;
          return (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{ width: "100%", borderRadius: 4, height: `${h}px`, background: isToday ? "#ef4444" : val > 0 ? "rgba(239,68,68,0.4)" : "rgba(255,255,255,0.06)", boxShadow: isToday ? "0 0 8px rgba(239,68,68,0.5)" : "none" }}/>
              <span style={{ fontSize: 9, color: isToday ? "#ef4444" : "#555", fontFamily: "'Bebas Neue', cursive" }}>{d}</span>
            </div>
          );
        })}
      </div>
    </div>

    {/* Ajouter séance manuelle */}
    <div style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 16, padding: 14, marginBottom: 16 }}>
      <div style={{ fontSize: 11, color: "#ef4444", letterSpacing: 3, fontFamily: "'Bebas Neue', cursive", marginBottom: 10 }}>AJOUTER UNE SÉANCE</div>
      {!showManual ? (
        <button onClick={() => setShowManual(true)} style={{width: "100%", border: "none", borderRadius: 12, padding: "12px", background: "#ef4444", color: "#fff", fontFamily: "'Bebas Neue', cursive", letterSpacing: 2, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,}}>+ AJOUTER UNE SÉANCE MANUELLEMENT</button>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div>
            <div style={{ fontSize: 11, color: "#888", marginBottom: 6 }}>Type d'entraînement</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {types.map(t => (
                <button key={t} onClick={() => setManualType(t)} style={{background: manualType === t ? "#ef4444" : "rgba(255,255,255,0.06)", border: "none", borderRadius: 20, padding: "6px 12px", color: manualType === t ? "#fff" : "#888", cursor: "pointer", fontSize: 11, fontFamily: "'Bebas Neue', cursive",}}>{t}</button>
              ))}
            </div>
          </div>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 11, color: "#888" }}>Durée</span>
              <span style={{ fontSize: 12, color: "#ef4444", fontFamily: "'Bebas Neue', cursive" }}>{manualMinutes} min · ~{Math.round(manualMinutes*8.5)} kcal</span>
            </div>
            <input type="range" min={5} max={120} step={5} value={manualMinutes} onChange={e => setManualMinutes(Number(e.target.value))} style={{ width: "100%", accentColor: "#ef4444" }}/>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <button onClick={() => setShowManual(false)} style={{ background: "rgba(255,255,255,0.06)", border: "none", borderRadius: 10, padding: "10px", color: "#888", cursor: "pointer", fontFamily: "'Bebas Neue', cursive", fontSize: 13 }}>ANNULER</button>
            <button onClick={addManual} style={{ background: "#ef4444", border: "none", borderRadius: 10, padding: "10px", color: "#fff", cursor: "pointer", fontFamily: "'Bebas Neue', cursive", fontSize: 13 }}>💾 SAUVEGARDER</button>
          </div>
        </div>
      )}
    </div>

    {/* Historique */}
    {stats.history && stats.history.length > 0 && (
      <div>
        <div style={{ fontSize: 11, color: "#ef4444", letterSpacing: 3, fontFamily: "'Bebas Neue', cursive", marginBottom: 12 }}>HISTORIQUE</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {stats.history.slice(0, 10).map(h => (
            <div key={h.id} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: 12, display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(239,68,68,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>🥊</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontFamily: "'Bebas Neue', cursive", color: "#fff", letterSpacing: 1 }}>{h.type}</div>
                <div style={{ fontSize: 10, color: "#666", marginTop: 2 }}>{h.date}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 12, color: "#ef4444", fontFamily: "'Bebas Neue', cursive" }}>{h.minutes} min</div>
                <div style={{ fontSize: 10, color: "#666" }}>~{h.cal} kcal</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}

    {(!stats.history || stats.history.length === 0) && (
      <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: 32, textAlign: "center" }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>📊</div>
        <div style={{ fontSize: 13, color: "#666" }}>Aucune séance enregistrée.</div>
        <div style={{ fontSize: 11, color: "#444", marginTop: 6 }}>Lance le timer ou ajoute une séance manuellement !</div>
      </div>
    )}
  </div>
</div>
```

);
}

// ── SPLASH SCREEN ─────────────────────────────────────────────
function SplashScreen() {
const [phase, setPhase] = useState(0);

useEffect(() => {
const t1 = setTimeout(() => setPhase(1), 400);
const t2 = setTimeout(() => setPhase(2), 900);
const t3 = setTimeout(() => setPhase(3), 1400);
return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
}, []);

return (
<div style={{display:“flex”, flexDirection:“column”, alignItems:“center”, justifyContent:“center”, width:“100%”, height:“100%”, background:D.bg, position: “relative”, overflow: “hidden”,}}>
<style>{`@keyframes splashGlow { 0%,100% { filter: drop-shadow(0 0 12px rgba(239,68,68,0.4)); } 50% { filter: drop-shadow(0 0 28px rgba(239,68,68,0.9)); } } @keyframes splashRing { from { transform: scale(0.6); opacity: 0; } to { transform: scale(1); opacity: 1; } } @keyframes splashFadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } } @keyframes splashBar { from { width: 0%; } to { width: 100%; } } @keyframes rotateSlow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

```
  {/* Background decorative rings */}
  <div style={{position: "absolute", width: 340, height: 340, borderRadius: "50%", border: "1px solid rgba(239,68,68,0.08)", top: "50%", left: "50%", transform: "translate(-50%,-50%)", animation: phase >= 1 ? "rotateSlow 20s linear infinite" : "none",}}/>
  <div style={{position: "absolute", width: 260, height: 260, borderRadius: "50%", border: "1px solid rgba(239,68,68,0.12)", top: "50%", left: "50%", transform: "translate(-50%,-50%)",}}/>
  <div style={{position: "absolute", width: 180, height: 180, borderRadius: "50%", border: "1px solid rgba(239,68,68,0.06)", top: "50%", left: "50%", transform: "translate(-50%,-50%)",}}/>

  {/* Red corner accents */}
  {[[0,0,"tl"],[0,"auto","tr"],["auto",0,"bl"],["auto","auto","br"]].map(([t,b,id]) => (
    <div key={id} style={{position: "absolute", top: t !== "auto" ? 24 : "auto", bottom: b !== "auto" ? 24 : "auto", left: id.includes("l") ? 24 : "auto", right: id.includes("r") ? 24 : "auto", width: 20, height: 20, borderTop: id.startsWith("t") ? "2px solid rgba(239,68,68,0.5)" : "none", borderBottom: id.startsWith("b") ? "2px solid rgba(239,68,68,0.5)" : "none", borderLeft: id.endsWith("l") ? "2px solid rgba(239,68,68,0.5)" : "none", borderRight: id.endsWith("r") ? "2px solid rgba(239,68,68,0.5)" : "none", opacity: phase >= 2 ? 1 : 0, transition: "opacity 0.5s ease",}}/>
  ))}

  {/* Glove icon */}
  <div style={{fontSize: 72, animation: phase >= 0 ? "splashGlow 2s ease infinite, splashRing 0.5s ease both" : "none", marginBottom: 24, transition: "all 0.3s",}}>🥊</div>

  {/* AUTAM text */}
  <div style={{fontSize: 54, fontFamily: "'Bebas Neue', cursive", color: "#ffffff", letterSpacing: 10, lineHeight: 1, opacity: phase >= 1 ? 1 : 0, transform: phase >= 1 ? "translateY(0)" : "translateY(20px)", transition: "all 0.5s ease", marginBottom: 2,}}>AUTAM</div>

  {/* MUAY THAI text */}
  <div style={{fontSize: 22, fontFamily: "'Bebas Neue', cursive", color: "#ef4444", letterSpacing: 12, opacity: phase >= 1 ? 1 : 0, transform: phase >= 1 ? "translateY(0)" : "translateY(10px)", transition: "all 0.5s ease 0.1s", marginBottom: 28,}}>MUAY THAI</div>

  {/* Tagline */}
  <div style={{fontSize: 12, color: "#555", letterSpacing: 3, fontStyle: "italic", fontFamily: "Georgia, serif", opacity: phase >= 2 ? 1 : 0, transition: "opacity 0.6s ease", marginBottom: 48,}}>Forge ton corps · Affûte ton esprit</div>

  {/* Loading bar */}
  <div style={{width: 120, height: 2, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden", opacity: phase >= 3 ? 1 : 0, transition: "opacity 0.3s ease",}}>
    <div style={{height: "100%", background: "linear-gradient(90deg, #ef4444, #ff6b6b)", borderRadius: 2, animation: phase >= 3 ? "splashBar 1.2s ease forwards" : "none",}}/>
  </div>
</div>
```

);
}

// ── MAIN APP ──────────────────────────────────────────────────
export default function App() {
const [screen, setScreen] = useState(“home”);
const [isPremium, setIsPremium] = useState(false);
const [dailyAnalyses, setDailyAnalyses] = useState(0);
const [user, setUser] = useState(null);
const [authChecked, setAuthChecked] = useState(false);
const [trialDaysLeft, setTrialDaysLeft] = useState(7);
const [newBadge, setNewBadge] = useState(null);
const { shareData, shareProgress, shareBadge, shareDefi, closeShare } = useShare();
const isOnline = useOnlineStatus();

useEffect(() => {
const user = supaAuth.getSession();
if (user) {
setUser(user);
const daysLeft = supaAuth.getTrialDaysLeft(user);
setTrialDaysLeft(daysLeft);
if (daysLeft > 0) setIsPremium(true);
}
setAuthChecked(true);
}, []);

const handleAuth = (user) => {
setUser(user);
setIsPremium(true);
setTrialDaysLeft(supaAuth.getTrialDaysLeft(user));
const stats = badgeStorage.getStats();
const earned = badgeStorage.checkAndUnlock(stats);
if(earned.length > 0) setTimeout(() => setNewBadge(earned[0]), 1500);
setScreen(“home”);
};

const handleSignOut = () => {
supaAuth.signOut();
setUser(null);
setIsPremium(false);
setScreen(“home”);
};

const goPaywall = () => setScreen(“paywall”);

if (!authChecked) return <SplashScreen />;

const renderScreen = () => {
if (!user) return <AuthScreen onAuth={handleAuth} onShowLegal={(tab) => setScreen(`legal-${tab}`)} />;
switch (screen) {
case “home”: return <HomeScreen setScreen={setScreen} isPremium={isPremium} trialDaysLeft={trialDaysLeft} user={user} />;
case “timer”: return <TimerScreen onSessionComplete={b => setNewBadge(b)} />;
case “techniques”: return <TechniquesScreen isPremium={isPremium} goPaywall={goPaywall} />;
case “programs”: return <ProgramsScreen isPremium={isPremium} goPaywall={goPaywall} />;
case “profile”: return <ProfileScreen setScreen={setScreen} isPremium={isPremium} user={user} onSignOut={handleSignOut} trialDaysLeft={trialDaysLeft} />;
case “coach”: return <CoachIAScreen isPremium={isPremium} dailyAnalyses={dailyAnalyses} setDailyAnalyses={setDailyAnalyses} goPaywall={goPaywall} isOnline={isOnline} />;
case “paywall”: return <PaywallScreen setScreen={setScreen} onActivate={() => setIsPremium(true)} />;
case “stats”: return <StatsScreen setScreen={setScreen} />;
case “reviews”: return <ReviewsScreen setScreen={setScreen} user={user} />;
case “referral”: return <ReferralScreen setScreen={setScreen} user={user} isPremium={isPremium} onBadge={b => setNewBadge(b)} />;
case “chat”: return <CoachChatScreen setScreen={setScreen} isPremium={isPremium} goPaywall={goPaywall} isOnline={isOnline} />;
case “defi”: return <DefiDuJourScreen setScreen={setScreen} isPremium={isPremium} goPaywall={goPaywall} onBadge={b => setNewBadge(b)} onShare={shareDefi} isOnline={isOnline} />;
case “progression”: return <ProgressionScreen setScreen={setScreen} onBadge={b => setNewBadge(b)} onShare={shareProgress} />;
case “badges”: return <BadgesScreen setScreen={setScreen} onShare={shareBadge} />;
case “notifications”: return <NotificationsScreen setScreen={setScreen} />;
case “admin”: return <AdminScreen setScreen={setScreen} />;
case “legal-privacy”: return <LegalScreen setScreen={setScreen} initialTab="privacy" />;
case “legal-terms”: return <LegalScreen setScreen={setScreen} initialTab="terms" />;
default: return <HomeScreen setScreen={setScreen} isPremium={isPremium} />;
}
};

return (
<>
<style>{GLOBAL_STYLES}</style>
<div style={{ display:“flex”, justifyContent:“center”, alignItems:“center”, minHeight:“100vh”, background:”#000”, fontFamily:D.body }}>
<div style={{width:375, height:780, background:D.bg, borderRadius:44, overflow:“hidden”, position:“relative”, boxShadow:`0 40px 100px rgba(0,0,0,0.95), 0 0 0 1px rgba(255,26,26,0.08), inset 0 0 80px rgba(255,26,26,0.02)`, color:D.textPrimary,}}>
{/* Status bar */}
<div style={{ height:44, background:D.bg, display:“flex”, alignItems:“center”, justifyContent:“space-between”, padding:“0 20px”, borderBottom:`1px solid ${D.border}` }}>
<span style={{ fontSize:12, color:D.textPrimary, fontWeight:700, fontFamily:D.heading, letterSpacing:1 }}>9:41</span>
<div style={{ width:120, height:28, background:”#000”, borderRadius:20 }}/>
<div style={{ display:“flex”, gap:6, alignItems:“center” }}>
{!isOnline && <span style={{ fontSize:10, color:D.gold }}>📵</span>}
{isPremium && <span style={{ fontSize:10, color:D.gold }}>⭐</span>}
<div style={{ display:“flex”, gap:3 }}>
{[1,2,3].map(i => <div key={i} style={{ width:4, height:4, borderRadius:“50%”, background:i===3?D.red:“rgba(255,255,255,0.4)” }}/>)}
</div>
</div>
</div>

```
      {/* Screen */}
      <div style={{ height:"calc(100% - 44px)", overflowY:"auto", position:"relative" }}>
        <OfflineBanner isOnline={isOnline} />
        {renderScreen()}
        {newBadge && <BadgeNotification badge={newBadge} onClose={() => setNewBadge(null)} />}
        {shareData && <ShareCard {...shareData} onClose={closeShare} />}
        {user && !["paywall","legal-privacy","legal-terms","admin","notifications","badges","progression","defi","chat","referral","reviews","stats"].includes(screen) && <NavBar active={screen} setScreen={setScreen} />}
      </div>
    </div>
  </div>
</>
```

);
}
