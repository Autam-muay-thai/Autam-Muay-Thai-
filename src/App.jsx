import { useState, useEffect, useRef } from “react”;

// ── DESIGN SYSTEM ─────────────────────────────────────────────
const D = {
red: “#ff1a1a”,
redDark: “#cc0000”,
redDeep: “#8b0000”,
redGlow: “rgba(255,26,26,0.4)”,
redMid: “rgba(255,26,26,0.15)”,
redSoft: “rgba(255,26,26,0.06)”,
redBorder:“rgba(255,26,26,0.25)”,

bg: “#050505”,
bgCard: “rgba(255,255,255,0.025)”,
bgHover: “rgba(255,255,255,0.05)”,
border: “rgba(255,255,255,0.06)”,
borderHi: “rgba(255,26,26,0.3)”,

textPrimary: “#ffffff”,
textSecondary: “#999999”,
textMuted: “#555555”,

gold: “#d4a017”,
goldSoft:“rgba(212,160,23,0.15)”,
green: “#00e676”,
greenSoft:“rgba(0,230,118,0.12)”,
purple: “#9c27b0”,

shadowRed: “0 0 32px rgba(255,26,26,0.35)”,
shadowCard: “0 4px 24px rgba(0,0,0,0.6)”,

r: 8,
rm: 12,
rl: 16,
rxl:20,

heading: “‘Bebas Neue’, cursive”,
body: “Georgia, serif”,

pad: “16px”,
};

const GLOBAL_STYLES = `
@import url(‘https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap’);

- { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
::-webkit-scrollbar { width: 0; background: transparent; }
input, textarea, select { outline: none; }
@keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
@keyframes fadeIn { from{opacity:0} to{opacity:1} }
@keyframes scaleIn { from{opacity:0;transform:scale(0.94)} to{opacity:1;transform:scale(1)} }
@keyframes slideDown{ from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
@keyframes glow { 0%,100%{filter:drop-shadow(0 0 8px rgba(255,26,26,0.5))} 50%{filter:drop-shadow(0 0 20px rgba(255,26,26,0.9))} }
@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
@keyframes badgeIn { from{opacity:0;transform:translateY(-24px) scale(0.9)} to{opacity:1;transform:translateY(0) scale(1)} }
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
@keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
@keyframes dot { 0%,80%,100%{opacity:0.2;transform:scale(0.8)} 40%{opacity:1;transform:scale(1)} }
@keyframes celebrate{ 0%{transform:scale(1)} 30%{transform:scale(1.06)} 100%{transform:scale(1)} }
@keyframes popIn { from{transform:scale(0.7);opacity:0} to{transform:scale(1);opacity:1} }
@keyframes flashFade{ from{opacity:1} to{opacity:0} }
@keyframes splashRing{from{transform:scale(0.6);opacity:0} to{transform:scale(1);opacity:1}}
@keyframes splashBar { from{width:0%} to{width:100%} }
@keyframes rotateSlow{from{transform:rotate(0deg)} to{transform:rotate(360deg)}}
@keyframes splashGlow{0%,100%{filter:drop-shadow(0 0 12px rgba(255,26,26,0.4))} 50%{filter:drop-shadow(0 0 32px rgba(255,26,26,1))}}
`;

function Btn({ children, onClick, variant=“primary”, disabled, style={}, …props }) {
const base = { border:“none”, borderRadius:D.rm, padding:“13px 16px”, cursor:disabled?“not-allowed”:“pointer”, fontFamily:D.heading, letterSpacing:2, fontSize:14, width:“100%”, display:“flex”, alignItems:“center”, justifyContent:“center”, gap:8, transition:“all 0.2s”, …style };
const variants = {
primary: { background: disabled ? `rgba(255,26,26,0.2)` : `linear-gradient(135deg,${D.red},${D.redDark})`, color:”#fff”, boxShadow: disabled ? “none” : D.shadowRed },
secondary:{ background:“rgba(255,255,255,0.05)”, color:D.textSecondary, border:`1px solid ${D.border}` },
gold: { background:`linear-gradient(135deg,${D.gold},#b8860b)`, color:”#000”, boxShadow:“0 0 24px rgba(212,160,23,0.4)” },
ghost: { background:“none”, color:D.textMuted, border:`1px solid ${D.border}` },
danger: { background:“rgba(255,26,26,0.08)”, color:D.red, border:`1px solid ${D.redBorder}` },
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
const [mode, setMode] = useState(“menu”); // menu | video | live
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
{ id:“home”, icon:“⊞”, label:“Accueil” },
{ id:“programs”, icon:“📋”, label:“Pro
