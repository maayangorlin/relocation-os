import { useState, useEffect, useCallback, useRef } from "react";

const API_URL = "https://script.google.com/macros/s/AKfycbwicQIecb2RBGSOwgVgZgjh2hHO2giXcOUsTh4C_wy4wbOG4EmGecKaYLhjZEAuWO59iw/exec";

const T = {
  cream: "#FAF8F4", sand: "#F0EBE1", terracotta: "#C4622D", terracottaLight: "#F5E6DC",
  terracottaMid: "#E8C5A8", sage: "#4A7C59", sageLight: "#DCF0E4", dustyRose: "#C4607A",
  dustyRoseLight: "#F5E0E7", amber: "#B07D2A", amberLight: "#F5EDD6", ink: "#1C1917",
  inkMid: "#44403C", inkFaint: "#A8A29E", border: "#E5DDD4", borderLight: "#F0EAE2", white: "#FFFFFF",
};

// sans for UI, serif for display
const SANS = "system-ui, -apple-system, sans-serif";
const SERIF = "Georgia, 'Times New Roman', serif";

const S = {
  card: { background: "#FFFFFF", border: "1px solid #E5DDD4", borderRadius: 16, overflow: "hidden" },
  pill: (bg, color, border) => ({ display: "inline-flex", alignItems: "center", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 500, background: bg, color, border: `1px solid ${border}`, whiteSpace: "nowrap", letterSpacing: "0.02em", fontFamily: SANS }),
  input: { width: "100%", fontSize: 14, padding: "10px 14px", borderRadius: 12, border: "1px solid #E5DDD4", background: "#FFFFFF", color: "#1C1917", boxSizing: "border-box", outline: "none", fontFamily: SANS },
  btn: (primary) => ({ padding: primary ? "10px 20px" : "9px 18px", borderRadius: 12, fontSize: 13, fontWeight: 500, cursor: "pointer", border: primary ? "none" : "1px solid #E5DDD4", background: primary ? "#C4622D" : "#FFFFFF", color: primary ? "#FFFFFF" : "#44403C", fontFamily: SANS }),
};

const CATEGORIES = ["Living room","Art","Plants","Kitchen appliances","Kitchen cookware","Coffee & pantry","Bedroom","Bathroom","Tech","Books","Sports","Misc"];
const DESTINATIONS = [
  { id: "apt",       label: "APT",       bg: "#DCF0E4", text: "#4A7C59", border: "#A8D4B4" },
  { id: "ny",        label: "To NY",     bg: "#F5E0E7", text: "#C4607A", border: "#E4ABBE" },
  { id: "storage",   label: "Storage",   bg: "#F5EDD6", text: "#B07D2A", border: "#DCC07A" },
  { id: "undecided", label: "Undecided", bg: "#F0EBE1", text: "#A8A29E", border: "#E5DDD4" },
];
const PHASES = [
  { id: "decide",       label: "Decide & sort",    dates: "Apr 1–30",       color: "#7B6FCC", bg: "#EEEDFE", start: "2026-04-01", end: "2026-04-30", tasks: [
    { id: "d1", text: "Walk every room — tag items NY / Store / Leave" },
    { id: "d2", text: "Go through wardrobe: NY pile vs. store pile" },
    { id: "d3", text: "Decide on art pieces — leave on walls or pack?" },
    { id: "d4", text: "Go through kitchen — what stays for the apartment?" },
    { id: "d5", text: "Declutter bathroom — donate expired products" },
    { id: "d6", text: "Identify coffee gear going to NY vs. staying" },
    { id: "d7", text: "Sort books — decorative stays, sentimental stores" },
  ]},
  { id: "supplies",     label: "Get supplies",      dates: "Apr 28 – May 2", color: "#4A7C59", bg: "#DCF0E4", start: "2026-04-28", end: "2026-05-02", tasks: [
    { id: "s1", text: "Buy boxes: ~10 medium, ~5 large, ~3 small" },
    { id: "s2", text: "Get packing tape, bubble wrap, marker pens, labels" },
    { id: "s3", text: "Get color-coded stickers (NY / Storage / APT)" },
    { id: "s4", text: "Pull out suitcases — check condition" },
  ]},
  { id: "pack_storage", label: "Pack for storage",  dates: "May 1–10",       color: "#B07D2A", bg: "#F5EDD6", start: "2026-05-01", end: "2026-05-10", tasks: [
    { id: "p1", text: "Pack books into small/medium boxes (keep them light!)" },
    { id: "p2", text: "Pack sentimental items — art, framed photos, bubble wrap" },
    { id: "p3", text: "Pack off-season clothes and shoes" },
    { id: "p4", text: "Pack bedding and linens not staying for the apartment" },
    { id: "p5", text: "Label every box: contents + STORAGE" },
    { id: "p6", text: "Log every box in the Boxes tab" },
  ]},
  { id: "pack_ny",      label: "Pack for NY",        dates: "May 10–15",     color: "#C4607A", bg: "#F5E0E7", start: "2026-05-10", end: "2026-05-15", tasks: [
    { id: "n1", text: "Pack Suitcase 1: clothes (capsule wardrobe, 4 seasons)" },
    { id: "n2", text: "Pack Suitcase 2: shoes, toiletries, small tech, coffee gear" },
    { id: "n3", text: "Suitcase 3 (if needed): overflow, sports gear" },
    { id: "n4", text: "Weigh each suitcase — limit is 23kg checked" },
    { id: "n5", text: "Pack carry-on: laptop, documents, valuables" },
  ]},
  { id: "handover",     label: "Handover",           dates: "May 15–19",     color: "#3B82C4", bg: "#E6F1FB", start: "2026-05-15", end: "2026-05-20", tasks: [
    { id: "h1", text: "Move storage boxes to parents' house" },
    { id: "h2", text: "Deep clean bedroom and wardrobe area" },
    { id: "h3", text: "Leave handover note for the apartment" },
    { id: "h4", text: "Label shared kitchen items clearly" },
    { id: "h5", text: "Final walkthrough — anything forgotten?" },
    { id: "h6", text: "Hand over keys" },
  ]},
];
const SHOP_DEFAULTS = [
  { id: "sh1",  category: "Kitchen",      name: "Knife + cutting board",          store: "Amazon", url: "https://amazon.com", price: 30, bought: false },
  { id: "sh2",  category: "Kitchen",      name: "Small pot + frying pan set",      store: "Amazon", url: "https://amazon.com", price: 40, bought: false },
  { id: "sh3",  category: "Kitchen",      name: "Plates, bowls, mugs (×4)",        store: "Target", url: "https://target.com", price: 35, bought: false },
  { id: "sh4",  category: "Kitchen",      name: "Cutlery set",                     store: "Amazon", url: "https://amazon.com", price: 15, bought: false },
  { id: "sh5",  category: "Kitchen",      name: "Dish drying rack",                store: "Amazon", url: "https://amazon.com", price: 12, bought: false },
  { id: "sh6",  category: "Bedding & bath", name: "Fitted sheet + pillowcase (Twin XL)", store: "Amazon", url: "https://amazon.com", price: 35, bought: false },
  { id: "sh7",  category: "Bedding & bath", name: "Duvet + cover",                store: "Target", url: "https://target.com", price: 60, bought: false },
  { id: "sh8",  category: "Bedding & bath", name: "2 towels",                     store: "Target", url: "https://target.com", price: 25, bought: false },
  { id: "sh9",  category: "Bedding & bath", name: "Bath mat",                     store: "Amazon", url: "https://amazon.com", price: 12, bought: false },
  { id: "sh10", category: "Desk & misc",  name: "US power strip (surge protected)", store: "Amazon", url: "https://amazon.com", price: 20, bought: false },
  { id: "sh11", category: "Desk & misc",  name: "Desk lamp",                       store: "Amazon", url: "https://amazon.com", price: 25, bought: false },
  { id: "sh12", category: "Desk & misc",  name: "Hangers (×20)",                  store: "Amazon", url: "https://amazon.com", price: 10, bought: false },
  { id: "sh13", category: "Desk & misc",  name: "Laundry bag + detergent",        store: "Target", url: "https://target.com", price: 15, bought: false },
];
const DEST_BOX = [
  { id: "storage", label: "Storage", color: "#F5EDD6", border: "#DCC07A", text: "#B07D2A" },
  { id: "ny",      label: "To NY",   color: "#F5E0E7", border: "#E4ABBE", text: "#C4607A" },
  { id: "apt",     label: "APT",     color: "#DCF0E4", border: "#A8D4B4", text: "#4A7C59" },
];
const BOX_CATS = ["Clothes","Shoes","Books","Kitchen","Bathroom","Tech","Bedding","Art & decor","Sports","Misc"];
const SUIT_IDS = ["s1","s2","s3"];

function genId() { return "item_" + Date.now().toString(36) + Math.random().toString(36).slice(2,5); }
function today() { return new Date().toISOString().split("T")[0]; }
function destObj(id) { return DESTINATIONS.find(d => d.id === id) || DESTINATIONS[3]; }

function currentPhaseId() {
  const now = new Date();
  for (const p of [...PHASES].reverse()) {
    if (now >= new Date(p.start)) return p.id;
  }
  return PHASES[0].id;
}

const initialChecked = {};
PHASES.forEach(p => p.tasks.forEach(t => { initialChecked[t.id] = false; }));

function lsGet(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
}
function lsSet(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

// ── Swipe to delete ───────────────────────────────────────────────────────────
function SwipeRow({ onDelete, children, height = 52 }) {
  const [offset, setOffset] = useState(0);
  const [swiping, setSwiping] = useState(false);
  const startX = useRef(null);
  const threshold = 72;

  const onTouchStart = e => { startX.current = e.touches[0].clientX; setSwiping(true); };
  const onTouchMove = e => {
    if (startX.current === null) return;
    const dx = e.touches[0].clientX - startX.current;
    if (dx < 0) setOffset(Math.max(dx, -threshold - 20));
  };
  const onTouchEnd = () => {
    if (offset < -threshold * 0.6) setOffset(-threshold);
    else setOffset(0);
    setSwiping(false);
    startX.current = null;
  };

  return (
    <div style={{ position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: threshold, background: "#DC2626", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }} onClick={() => { setOffset(0); onDelete(); }}>
        <span style={{ color: "#FFFFFF", fontSize: 12, fontWeight: 600, fontFamily: SANS, letterSpacing: "0.03em" }}>Delete</span>
      </div>
      <div
        style={{ transform: `translateX(${offset}px)`, transition: swiping ? "none" : "transform .25s ease", position: "relative", zIndex: 1, background: "#FFFFFF" }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {children}
      </div>
    </div>
  );
}

// ── Confirm dialog ────────────────────────────────────────────────────────────
function Confirm({ message, onConfirm, onCancel }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(28,25,23,0.5)", zIndex: 100, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div style={{ background: "#FFFFFF", borderRadius: "20px 20px 0 0", padding: "24px 20px 36px", width: "100%", maxWidth: 480, fontFamily: SANS }}>
        <div style={{ fontSize: 15, color: T.ink, marginBottom: 20, textAlign: "center", lineHeight: 1.5 }}>{message}</div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onCancel} style={{ ...S.btn(false), flex: 1, padding: "12px", fontSize: 14 }}>Cancel</button>
          <button onClick={onConfirm} style={{ flex: 1, padding: "12px", borderRadius: 12, fontSize: 14, fontWeight: 500, cursor: "pointer", border: "none", background: "#DC2626", color: "#FFFFFF", fontFamily: SANS }}>Delete</button>
        </div>
      </div>
    </div>
  );
}

// ── Shared components ─────────────────────────────────────────────────────────
function DestPill({ dest }) {
  const d = destObj(dest);
  return <span style={S.pill(d.bg, d.text, d.border)}>{d.label}</span>;
}

function StatCard({ value, label, color, active, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: active ? color + "18" : "#FFFFFF",
      border: active ? `1.5px solid ${color}` : "1px solid #E5DDD4",
      borderRadius: 14, padding: "14px 12px", textAlign: "center",
      cursor: onClick ? "pointer" : "default",
      transition: "all .15s",
    }}>
      <div style={{ fontSize: 22, fontWeight: 600, color: color || T.ink, lineHeight: 1, fontFamily: SANS }}>{value}</div>
      <div style={{ fontSize: 11, color: active ? color : T.inkFaint, marginTop: 5, letterSpacing: "0.03em", fontFamily: SANS }}>{label}</div>
    </div>
  );
}

function FormDrawer({ title, onClose, onSave, onDelete, saving, children }) {
  return (
    <div style={{ background: "#F0EBE1", border: "1px solid #E5DDD4", borderRadius: 16, padding: 16, marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: T.ink, fontFamily: SANS }}>{title}</span>
        <button onClick={onClose} style={{ border: "none", background: "transparent", cursor: "pointer", fontSize: 20, color: T.inkFaint, lineHeight: 1, padding: 0, fontFamily: SANS }}>×</button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{children}</div>
      <div style={{ display: "flex", gap: 8, marginTop: 14, justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onSave} disabled={saving} style={S.btn(true)}>{saving ? "Saving…" : "Save"}</button>
          <button onClick={onClose} style={S.btn(false)}>Cancel</button>
        </div>
        {onDelete && (
          <button onClick={onDelete} style={{ padding: "9px 14px", borderRadius: 12, fontSize: 13, fontWeight: 500, cursor: "pointer", border: "1px solid #FECACA", background: "transparent", color: "#DC2626", fontFamily: SANS }}>Delete</button>
        )}
      </div>
    </div>
  );
}

// ── Floating add button ───────────────────────────────────────────────────────
function FloatingAdd({ onClick, color = T.terracotta }) {
  return (
    <button onClick={onClick} style={{
      position: "fixed", bottom: 80, right: "calc(50% - 228px)", width: 52, height: 52,
      borderRadius: "50%", background: color, border: "none", cursor: "pointer",
      fontSize: 26, color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: "0 4px 16px rgba(196,98,45,0.35)", zIndex: 20, fontFamily: SANS, lineHeight: 1,
    }}>+</button>
  );
}

// ── Header ────────────────────────────────────────────────────────────────────
function Header({ doneTasks, totalTasks }) {
  const pct = Math.round((doneTasks / totalTasks) * 100);
  const daysLeft = Math.max(0, Math.ceil((new Date("2026-05-20") - new Date()) / 86400000));
  return (
    <div style={{ background: T.terracotta, padding: "20px 20px 24px", paddingTop: "calc(20px + env(safe-area-inset-top))" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#FFFFFF", letterSpacing: "-0.02em", lineHeight: 1.1, fontFamily: SERIF }}>Jaffa → New York</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.72)", marginTop: 4, fontFamily: SANS }}>May 20, 2026 · {daysLeft} days to go</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#FFFFFF", lineHeight: 1, fontFamily: SERIF }}>{pct}%</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", marginTop: 2, fontFamily: SANS }}>packed</div>
        </div>
      </div>
      <div style={{ marginTop: 16, height: 4, background: "rgba(255,255,255,0.25)", borderRadius: 4, overflow: "hidden" }}>
        <div style={{ width: pct + "%", height: "100%", background: "#FFFFFF", borderRadius: 4, transition: "width .5s ease" }} />
      </div>
    </div>
  );
}

// ── Tab bar ───────────────────────────────────────────────────────────────────
function TabBar({ tab, setTab }) {
  const tabs = [
    { id: "inventory", label: "Items" },
    { id: "plan",      label: "Plan" },
    { id: "boxes",     label: "Boxes" },
    { id: "shopping",  label: "NY list" },
  ];
  return (
    <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, background: "#FFFFFF", borderTop: "1px solid #E5DDD4", display: "flex", zIndex: 10, paddingBottom: "env(safe-area-inset-bottom)" }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => setTab(t.id)} style={{
          flex: 1, padding: "10px 4px 14px", border: "none", background: "transparent", cursor: "pointer",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
          borderTop: tab === t.id ? "2px solid #C4622D" : "2px solid transparent",
          fontFamily: SANS,
        }}>
          <span style={{ fontSize: 10, fontWeight: tab === t.id ? 700 : 400, color: tab === t.id ? T.terracotta : T.inkFaint, letterSpacing: "0.05em", textTransform: "uppercase" }}>{t.label}</span>
        </button>
      ))}
    </div>
  );
}

// ── Inventory tab ─────────────────────────────────────────────────────────────
function InventoryTab({ items, loading, loadError, onAdd, onUpdate, onDelete, onRetry }) {
  const [search, setSearch] = useState("");
  const [filterDest, setFilterDest] = useState("all");
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: "", category: "", destination: "undecided", box_code: "", notes: "" });
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [openCats, setOpenCats] = useState({});

  const isSearching = search.length > 0;

  const filtered = items.filter(i => {
    const q = search.toLowerCase();
    return (!search || i.name.toLowerCase().includes(q) || i.category.toLowerCase().includes(q) || (i.notes||"").toLowerCase().includes(q) || (i.box_code||"").toLowerCase().includes(q))
      && (filterDest === "all" || i.destination === filterDest);
  });

  const counts = { apt: 0, ny: 0, storage: 0, undecided: 0 };
  items.forEach(i => { if (counts[i.destination] !== undefined) counts[i.destination]++; else counts.undecided++; });

  const allCats = [...new Set(items.map(i => i.category))].filter(Boolean).sort();
  const toggleCat = cat => setOpenCats(p => ({ ...p, [cat]: p[cat] === false ? true : false }));

  const openAdd = () => { setForm({ name: "", category: "", destination: "undecided", box_code: "", notes: "" }); setEditId(null); setAdding(true); };
  const openEdit = item => { setForm({ name: item.name, category: item.category, destination: item.destination || "undecided", box_code: item.box_code || "", notes: item.notes || "" }); setEditId(item.id); setAdding(true); };
  const cancel = () => { setAdding(false); setEditId(null); };

  const save = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    if (editId) { await onUpdate({ id: editId, ...form }); }
    else { await onAdd({ id: genId(), ...form, date_added: today() }); }
    setSaving(false); setAdding(false); setEditId(null);
  };

  const handleDelete = () => setConfirmDelete(editId);

  const ItemRow = ({ item, idx, total }) => (
    <SwipeRow onDelete={() => setConfirmDelete(item.id)}>
      <div onClick={() => openEdit(item)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderBottom: idx < total - 1 ? "1px solid #F0EAE2" : "none", cursor: "pointer" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, color: T.ink, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontFamily: SANS }}>{item.name}</div>
          {(isSearching || item.notes) && <div style={{ fontSize: 11, color: T.inkFaint, marginTop: 2, fontFamily: SANS }}>{isSearching ? item.category : ""}{isSearching && item.notes ? " · " : ""}{item.notes || ""}</div>}
        </div>
        <div style={{ display: "flex", gap: 5, flexShrink: 0, alignItems: "center" }}>
          {item.destination === "storage" && item.box_code && (
            <span style={S.pill("#F5EDD6", "#B07D2A", "#DCC07A")}>{item.box_code}</span>
          )}
          <DestPill dest={item.destination} />
        </div>
      </div>
    </SwipeRow>
  );

  const handleStatClick = destId => {
    setFilterDest(p => p === destId ? "all" : destId);
    setSearch("");
  };

  return (
    <div style={{ padding: "16px 16px 0" }}>
      {confirmDelete && (
        <Confirm
          message="Remove this item from your inventory?"
          onConfirm={async () => { await onDelete(confirmDelete); setConfirmDelete(null); setAdding(false); setEditId(null); }}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 16 }}>
        {[
          { id: "apt",       color: "#4A7C59", label: "APT"     },
          { id: "ny",        color: "#C4607A", label: "To NY"   },
          { id: "storage",   color: "#B07D2A", label: "Storage" },
          { id: "undecided", color: T.inkFaint, label: "?"      },
        ].map(d => (
          <StatCard key={d.id} value={counts[d.id] || 0} label={d.label} color={d.color}
            active={filterDest === d.id} onClick={() => handleStatClick(d.id)} />
        ))}
      </div>

      <div style={{ position: "relative", marginBottom: 10 }}>
        <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 15, color: T.inkFaint, pointerEvents: "none", fontFamily: SANS }}>⌕</span>
        <input value={search} onChange={e => { setSearch(e.target.value); setFilterDest("all"); }} placeholder="Find anything — name, category, box code…" style={{ ...S.input, paddingLeft: 38, fontSize: 14, padding: "11px 36px 11px 38px", background: search ? "#FFFFFF" : "#F0EBE1", border: search ? "1.5px solid #C4622D" : "1px solid #E5DDD4" }} />
        {search && <button onClick={() => setSearch("")} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", border: "none", background: "transparent", cursor: "pointer", fontSize: 18, color: T.inkFaint, lineHeight: 1, padding: 0 }}>×</button>}
      </div>
      {search && <div style={{ fontSize: 12, color: T.inkFaint, marginBottom: 10, paddingLeft: 2, fontFamily: SANS }}>{filtered.length} result{filtered.length !== 1 ? "s" : ""} for "{search}"</div>}

      {adding && (
        <FormDrawer
          title={editId ? "Edit item" : "Add item"}
          onClose={cancel} onSave={save} saving={saving}
          onDelete={editId ? handleDelete : null}
        >
          <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Item name" style={S.input} autoFocus />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} style={{ ...S.input, padding: "9px 12px" }}>
              <option value="">Category…</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={form.destination} onChange={e => setForm(p => ({ ...p, destination: e.target.value }))} style={{ ...S.input, padding: "9px 12px", background: destObj(form.destination).bg, color: destObj(form.destination).text, border: `1px solid ${destObj(form.destination).border}` }}>
              {DESTINATIONS.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
            </select>
          </div>
          {form.destination === "storage" && (
            <input value={form.box_code} onChange={e => setForm(p => ({ ...p, box_code: e.target.value }))} placeholder="Box code (e.g. S-3)" style={S.input} />
          )}
          <input value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Notes (fragile, where it is…)" style={S.input} />
        </FormDrawer>
      )}

      {loadError ? (
        <div style={{ textAlign: "center", padding: "2.5rem 1rem", background: "#FFF5F5", borderRadius: 16, border: "1px solid #FECACA" }}>
          <div style={{ fontSize: 14, color: "#DC2626", fontWeight: 500, marginBottom: 8, fontFamily: SANS }}>Couldn't load your items</div>
          <div style={{ fontSize: 13, color: T.inkFaint, marginBottom: 16, fontFamily: SANS }}>Check your connection and try again.</div>
          <button onClick={onRetry} style={{ ...S.btn(true), background: "#DC2626" }}>Retry</button>
        </div>
      ) : loading ? (
        <div style={{ textAlign: "center", padding: "3rem 0", color: T.inkFaint, fontSize: 13, fontFamily: SANS }}>Loading from Google Sheets…</div>
      ) : isSearching ? (
        <div style={S.card}>
          {filtered.length === 0
            ? <div style={{ padding: "2.5rem", textAlign: "center", fontSize: 13, color: T.inkFaint, fontFamily: SANS }}>Nothing matches "{search}"</div>
            : filtered.map((item, idx) => <ItemRow key={item.id} item={item} idx={idx} total={filtered.length} />)
          }
        </div>
      ) : (
        <div>
          {allCats.filter(cat => filtered.some(i => i.category === cat)).map(cat => {
            const catItems = filtered.filter(i => i.category === cat);
            const isOpen = openCats[cat] !== false;
            return (
              <div key={cat} style={{ ...S.card, marginBottom: 8 }}>
                <div onClick={() => toggleCat(cat)} style={{ padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", background: "#FAF8F4" }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: T.ink, fontFamily: SANS }}>{cat}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 12, color: T.inkFaint, fontFamily: SANS }}>{catItems.length}</span>
                    <span style={{ fontSize: 16, color: T.inkFaint, display: "inline-block", transform: isOpen ? "rotate(90deg)" : "none", transition: "transform .2s", fontFamily: SANS }}>›</span>
                  </div>
                </div>
                {isOpen && <div style={{ borderTop: "1px solid #F0EAE2" }}>{catItems.map((item, idx) => <ItemRow key={item.id} item={item} idx={idx} total={catItems.length} />)}</div>}
              </div>
            );
          })}
        </div>
      )}
      <div style={{ marginTop: 8, marginBottom: 8, fontSize: 11, color: T.inkFaint, textAlign: "right", fontFamily: SANS }}>{filtered.length} of {items.length} items</div>
      {!adding && <FloatingAdd onClick={openAdd} />}
    </div>
  );
}

// ── Plan tab ──────────────────────────────────────────────────────────────────
function PlanTab({ checked, toggle }) {
  const [openPhase, setOpenPhase] = useState(currentPhaseId);

  return (
    <div style={{ padding: "16px 16px 0" }}>
      {PHASES.map(phase => {
        const done = phase.tasks.filter(t => checked[t.id]).length;
        const isOpen = openPhase === phase.id;
        const allDone = done === phase.tasks.length;
        const now = new Date();
        const isCurrent = now >= new Date(phase.start) && now <= new Date(phase.end);
        return (
          <div key={phase.id} style={{ ...S.card, marginBottom: 10, opacity: allDone ? 0.7 : 1 }}>
            <div onClick={() => setOpenPhase(isOpen ? null : phase.id)} style={{ padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {isCurrent && !allDone && <div style={{ width: 7, height: 7, borderRadius: "50%", background: phase.color, flexShrink: 0 }} />}
                {allDone && <span style={{ fontSize: 13, color: phase.color, fontFamily: SANS }}>✓</span>}
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: allDone ? T.inkFaint : T.ink, textDecoration: allDone ? "line-through" : "none", fontFamily: SANS }}>
                    {phase.label}
                    {isCurrent && !allDone && <span style={{ fontSize: 10, marginLeft: 8, padding: "2px 7px", borderRadius: 10, background: phase.bg, color: phase.color, fontWeight: 600, letterSpacing: "0.04em", fontFamily: SANS }}>NOW</span>}
                  </div>
                  <div style={{ fontSize: 11, color: T.inkFaint, marginTop: 2, fontFamily: SANS }}>{phase.dates}</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ display: "flex", gap: 3 }}>
                  {phase.tasks.map((t, i) => <div key={i} style={{ width: 6, height: 6, borderRadius: 3, background: checked[t.id] ? phase.color : "#E5DDD4" }} />)}
                </div>
                <span style={{ fontSize: 12, color: T.inkFaint, fontFamily: SANS }}>{done}/{phase.tasks.length}</span>
                <span style={{ fontSize: 16, color: T.inkFaint, display: "inline-block", transform: isOpen ? "rotate(90deg)" : "none", transition: "transform .2s", fontFamily: SANS }}>›</span>
              </div>
            </div>
            {isOpen && (
              <div style={{ borderTop: "1px solid #F0EAE2" }}>
                {phase.tasks.map(t => (
                  <div key={t.id} onClick={() => toggle(t.id)} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "11px 16px", borderBottom: "1px solid #F0EAE2", cursor: "pointer" }}>
                    <div style={{ width: 18, height: 18, borderRadius: 6, border: "1.5px solid " + (checked[t.id] ? phase.color : "#E5DDD4"), background: checked[t.id] ? phase.color : "transparent", flexShrink: 0, marginTop: 1, display: "flex", alignItems: "center", justifyContent: "center", transition: "all .15s" }}>
                      {checked[t.id] && <span style={{ color: "#FFFFFF", fontSize: 10, lineHeight: 1, fontWeight: 700, fontFamily: SANS }}>✓</span>}
                    </div>
                    <span style={{ fontSize: 13, color: checked[t.id] ? T.inkFaint : T.ink, lineHeight: 1.5, textDecoration: checked[t.id] ? "line-through" : "none", fontFamily: SANS }}>{t.text}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Boxes tab ─────────────────────────────────────────────────────────────────
function BoxesTab() {
  const [boxes, setBoxes] = useState(() => lsGet("boxes", []));
  const [suitcases, setSuitcases] = useState(() => lsGet("suitcases", { s1: { items: [], weight: "" }, s2: { items: [], weight: "" }, s3: { items: [], weight: "" } }));
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ label: "", dest: "storage", category: "", items: "", notes: "", sealed: false });
  const [suitInput, setSuitInput] = useState({ suit: "s1", text: "" });
  const [search, setSearch] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => { lsSet("boxes", boxes); }, [boxes]);
  useEffect(() => { lsSet("suitcases", suitcases); }, [suitcases]);

  const addBox = () => {
    if (!form.label.trim()) return;
    const destPrefix = form.dest === "storage" ? "S" : form.dest === "ny" ? "NY" : "F";
    const num = boxes.filter(b => b.dest === form.dest).length + 1;
    if (editId) { setBoxes(p => p.map(b => b.id === editId ? { ...b, ...form } : b)); setEditId(null); }
    else { setBoxes(p => [...p, { ...form, id: genId(), boxNum: destPrefix + "-" + num }]); }
    setForm({ label: "", dest: "storage", category: "", items: "", notes: "", sealed: false });
    setAdding(false);
  };
  const startEdit = box => { setForm({ label: box.label, dest: box.dest, category: box.category, items: box.items, notes: box.notes, sealed: box.sealed }); setEditId(box.id); setAdding(true); };
  const deleteBox = id => { setBoxes(p => p.filter(b => b.id !== id)); setConfirmDelete(null); setAdding(false); setEditId(null); };
  const toggleSeal = id => setBoxes(p => p.map(b => b.id === id ? { ...b, sealed: !b.sealed } : b));
  const addSuitItem = () => {
    if (!suitInput.text.trim()) return;
    setSuitcases(p => ({ ...p, [suitInput.suit]: { ...p[suitInput.suit], items: [...p[suitInput.suit].items, { id: genId(), text: suitInput.text }] } }));
    setSuitInput(p => ({ ...p, text: "" }));
  };
  const removeSuitItem = (suit, id) => setSuitcases(p => ({ ...p, [suit]: { ...p[suit], items: p[suit].items.filter(i => i.id !== id) } }));
  const setWeight = (suit, val) => setSuitcases(p => ({ ...p, [suit]: { ...p[suit], weight: val } }));

  const filtered = boxes.filter(b => !search || b.label.toLowerCase().includes(search.toLowerCase()) || (b.items || "").toLowerCase().includes(search.toLowerCase()));
  const dObj = id => DEST_BOX.find(d => d.id === id) || DEST_BOX[0];

  return (
    <div style={{ padding: "16px 16px 0" }}>
      {confirmDelete && (
        <Confirm message="Delete this box?" onConfirm={() => deleteBox(confirmDelete)} onCancel={() => setConfirmDelete(null)} />
      )}

      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: T.inkFaint, marginBottom: 10, fontFamily: SANS }}>Boxes</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 12 }}>
        {DEST_BOX.map(d => (
          <div key={d.id} style={{ background: d.color, border: "1px solid " + d.border, borderRadius: 12, padding: "10px 12px", textAlign: "center" }}>
            <div style={{ fontSize: 20, fontWeight: 600, color: d.text, fontFamily: SANS }}>{boxes.filter(b => b.dest === d.id).length}</div>
            <div style={{ fontSize: 11, color: d.text, opacity: .8, marginTop: 2, fontFamily: SANS }}>{d.label}</div>
          </div>
        ))}
      </div>

      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search boxes or contents…" style={{ ...S.input, marginBottom: 10, fontSize: 13, padding: "9px 14px" }} />

      {adding && (
        <FormDrawer title={editId ? "Edit box" : "New box"} onClose={() => { setAdding(false); setEditId(null); }} onSave={addBox} saving={false} onDelete={editId ? () => setConfirmDelete(editId) : null}>
          <input value={form.label} onChange={e => setForm(p => ({ ...p, label: e.target.value }))} placeholder="Box label (e.g. Winter clothes)" style={S.input} autoFocus />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <select value={form.dest} onChange={e => setForm(p => ({ ...p, dest: e.target.value }))} style={{ ...S.input, padding: "9px 12px" }}>
              {DEST_BOX.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
            </select>
            <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} style={{ ...S.input, padding: "9px 12px" }}>
              <option value="">Category…</option>
              {BOX_CATS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <textarea value={form.items} onChange={e => setForm(p => ({ ...p, items: e.target.value }))} placeholder="Contents (one item per line)" rows={3} style={{ ...S.input, resize: "vertical" }} />
          <input value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Notes (fragile? where stored?)" style={S.input} />
        </FormDrawer>
      )}

      {!adding && (
        <button onClick={() => setAdding(true)} style={{ width: "100%", marginBottom: 12, padding: 11, fontSize: 13, background: "#F5EDD6", border: "1px dashed #B07D2A", borderRadius: 12, cursor: "pointer", color: "#B07D2A", fontWeight: 500, fontFamily: SANS }}>
          + Add a box
        </button>
      )}

      {filtered.length === 0 && !adding ? (
        <div style={{ textAlign: "center", padding: "2rem", fontSize: 13, color: T.inkFaint, fontFamily: SANS }}>
          {boxes.length === 0 ? "No boxes yet — add your first one above." : "No boxes match your search."}
        </div>
      ) : filtered.map(box => {
        const d = dObj(box.dest);
        return (
          <div key={box.id} style={{ ...S.card, marginBottom: 8, opacity: box.sealed ? .65 : 1 }}>
            <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 10, background: d.color + "80", borderBottom: "1px solid #F0EAE2" }}>
              <span style={S.pill(d.color, d.text, d.border)}>{box.boxNum}</span>
              <span style={{ fontSize: 14, fontWeight: 600, flex: 1, color: T.ink, fontFamily: SANS }}>{box.label}</span>
              {box.category && <span style={{ fontSize: 11, color: T.inkFaint, fontFamily: SANS }}>{box.category}</span>}
              {box.sealed && <span style={S.pill("#DCF0E4", "#4A7C59", "#A8D4B4")}>sealed</span>}
            </div>
            {box.items && (
              <div style={{ padding: "8px 16px", borderBottom: "1px solid #F0EAE2" }}>
                {box.items.split("\n").filter(Boolean).map((item, i) => <div key={i} style={{ fontSize: 12, color: T.inkMid, lineHeight: 1.9, fontFamily: SANS }}>· {item}</div>)}
              </div>
            )}
            {box.notes && <div style={{ padding: "6px 16px", fontSize: 12, color: T.inkFaint, fontStyle: "italic", fontFamily: SANS }}>{box.notes}</div>}
            <div style={{ padding: "8px 16px", display: "flex", gap: 8 }}>
              <button onClick={() => toggleSeal(box.id)} style={{ ...S.btn(false), fontSize: 12, padding: "5px 12px" }}>{box.sealed ? "Unseal" : "Mark sealed"}</button>
              <button onClick={() => startEdit(box)} style={{ ...S.btn(false), fontSize: 12, padding: "5px 12px" }}>Edit</button>
            </div>
          </div>
        );
      })}

      {search && filtered.length === 0 && boxes.length > 0 && (
        <div style={{ textAlign: "center", padding: "1.5rem", fontSize: 13, color: T.inkFaint, fontFamily: SANS }}>No boxes match "{search}"</div>
      )}

      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: T.inkFaint, marginBottom: 10, marginTop: 24, fontFamily: SANS }}>Suitcases</div>
      <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap", alignItems: "center" }}>
        <select value={suitInput.suit} onChange={e => setSuitInput(p => ({ ...p, suit: e.target.value }))} style={{ fontSize: 13, padding: "9px 12px", borderRadius: 12, border: "1px solid #E5DDD4", background: "#FFFFFF", fontFamily: SANS }}>
          {SUIT_IDS.map(s => <option key={s} value={s}>Suitcase {s[1]}</option>)}
        </select>
        <input value={suitInput.text} onChange={e => setSuitInput(p => ({ ...p, text: e.target.value }))} onKeyDown={e => e.key === "Enter" && addSuitItem()} placeholder="Add item…" style={{ ...S.input, flex: 1, minWidth: 120, padding: "9px 14px", fontSize: 13 }} />
        <button onClick={addSuitItem} style={{ ...S.btn(false), padding: "9px 16px" }}>Add</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 20 }}>
        {SUIT_IDS.map(s => {
          const w = parseFloat(suitcases[s].weight) || 0;
          const pct = Math.min((w / 23) * 100, 100);
          const barColor = w > 22 ? "#DC2626" : w > 20 ? "#B07D2A" : "#4A7C59";
          return (
            <div key={s} style={S.card}>
              <div style={{ padding: "10px 12px", background: "#F5E0E7", borderBottom: "1px solid #E5DDD4" }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#C4607A", fontFamily: SANS }}>Bag {s[1]}</div>
                <input value={suitcases[s].weight} onChange={e => setWeight(s, e.target.value)} placeholder="0 kg" style={{ width: "100%", fontSize: 12, padding: "4px 0", border: "none", background: "transparent", color: "#C4607A", fontWeight: 500, fontFamily: SANS, outline: "none" }} />
                <div style={{ height: 3, background: "rgba(196,96,122,0.2)", borderRadius: 3, overflow: "hidden", marginTop: 4 }}>
                  <div style={{ width: pct + "%", height: "100%", background: barColor, borderRadius: 3, transition: "width .3s" }} />
                </div>
                <div style={{ fontSize: 10, color: "#C4607A", marginTop: 3, opacity: .7, fontFamily: SANS }}>{Math.round(w)} / 23 kg</div>
              </div>
              <div style={{ padding: "6px 0", minHeight: 40 }}>
                {suitcases[s].items.length === 0
                  ? <div style={{ fontSize: 12, color: T.inkFaint, padding: "6px 12px", fontStyle: "italic", fontFamily: SANS }}>Empty</div>
                  : suitcases[s].items.map(item => (
                    <div key={item.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 12px" }}>
                      <span style={{ fontSize: 12, color: T.ink, fontFamily: SANS }}>{item.text}</span>
                      <button onClick={() => removeSuitItem(s, item.id)} style={{ border: "none", background: "transparent", cursor: "pointer", color: T.inkFaint, fontSize: 16, padding: "0 2px", lineHeight: 1, fontFamily: SANS }}>×</button>
                    </div>
                  ))
                }
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Shopping tab ──────────────────────────────────────────────────────────────
function ShoppingTab() {
  const [items, setItems] = useState(() => lsGet("shopping_items", SHOP_DEFAULTS));
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: "", category: "Kitchen", store: "", url: "", price: "" });
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => { lsSet("shopping_items", items); }, [items]);

  const toggle = id => setItems(p => p.map(i => i.id === id ? { ...i, bought: !i.bought } : i));
  const openEdit = item => { setForm({ name: item.name, category: item.category, store: item.store || "", url: item.url || "", price: String(item.price || "") }); setEditId(item.id); setAdding(true); };
  const saveItem = () => {
    if (!form.name.trim()) return;
    if (editId) { setItems(p => p.map(i => i.id === editId ? { ...i, ...form, price: parseFloat(form.price) || 0 } : i)); setEditId(null); }
    else { setItems(p => [...p, { ...form, id: genId(), price: parseFloat(form.price) || 0, bought: false }]); }
    setForm({ name: "", category: "Kitchen", store: "", url: "", price: "" });
    setAdding(false);
  };
  const deleteItem = id => { setItems(p => p.filter(i => i.id !== id)); setConfirmDelete(null); };

  const cats = [...new Set(items.map(i => i.category))];
  const total = items.reduce((s, i) => s + (i.price || 0), 0);
  const remaining = items.filter(i => !i.bought).reduce((s, i) => s + (i.price || 0), 0);
  const bought = items.filter(i => i.bought).length;

  return (
    <div style={{ padding: "16px 16px 0" }}>
      {confirmDelete && (
        <Confirm message="Remove this item from your list?" onConfirm={() => deleteItem(confirmDelete)} onCancel={() => setConfirmDelete(null)} />
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 16 }}>
        <StatCard value={items.length} label="Items" />
        <StatCard value={bought} label="Bought" color="#4A7C59" />
        <StatCard value={"$" + Math.round(total)} label="Est. total" color="#B07D2A" />
        <StatCard value={"$" + Math.round(remaining)} label="Left" color={T.inkFaint} />
      </div>

      {cats.map(cat => {
        const catItems = items.filter(i => i.category === cat);
        const catTotal = catItems.reduce((s, i) => s + (i.price || 0), 0);
        return (
          <div key={cat} style={{ ...S.card, marginBottom: 10 }}>
            <div style={{ padding: "12px 16px", borderBottom: "1px solid #F0EAE2", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: T.ink, fontFamily: SANS }}>{cat}</span>
              <span style={{ fontSize: 11, color: T.inkFaint, fontFamily: SANS }}>{catItems.length} items · ~${Math.round(catTotal)}</span>
            </div>
            {catItems.map((item, idx) => (
              <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 16px", borderBottom: idx < catItems.length - 1 ? "1px solid #F0EAE2" : "none" }}>
                <div onClick={() => toggle(item.id)} style={{ width: 20, height: 20, borderRadius: 6, border: "1.5px solid " + (item.bought ? "#4A7C59" : "#E5DDD4"), background: item.bought ? "#4A7C59" : "transparent", flexShrink: 0, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all .15s" }}>
                  {item.bought && <span style={{ color: "#FFFFFF", fontSize: 11, fontWeight: 700, fontFamily: SANS }}>✓</span>}
                </div>
                <span onClick={() => openEdit(item)} style={{ fontSize: 13, flex: 1, color: item.bought ? T.inkFaint : T.ink, textDecoration: item.bought ? "line-through" : "none", cursor: "pointer", fontFamily: SANS }}>{item.name}</span>
                {item.url && <a href={item.url} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: T.terracotta, textDecoration: "none", fontWeight: 500, flexShrink: 0, fontFamily: SANS }}>{item.store || "Link"}</a>}
                <span onClick={() => openEdit(item)} style={{ fontSize: 12, color: T.inkFaint, minWidth: 28, textAlign: "right", cursor: "pointer", fontFamily: SANS }}>${item.price}</span>
                <button onClick={() => setConfirmDelete(item.id)} style={{ border: "none", background: "transparent", cursor: "pointer", color: "#E5DDD4", fontSize: 18, padding: "0 4px", lineHeight: 1, fontFamily: SANS }}>×</button>
              </div>
            ))}
          </div>
        );
      })}

      {adding ? (
        <FormDrawer title={editId ? "Edit item" : "Add item"} onClose={() => { setAdding(false); setEditId(null); }} onSave={saveItem} saving={false} onDelete={editId ? () => setConfirmDelete(editId) : null}>
          <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Item name" style={S.input} autoFocus />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} style={{ ...S.input, padding: "9px 12px" }}>
              {[...cats, "Other"].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} placeholder="Price ($)" type="number" style={S.input} />
          </div>
          <input value={form.store} onChange={e => setForm(p => ({ ...p, store: e.target.value }))} placeholder="Store (Amazon, Target…)" style={S.input} />
          <input value={form.url} onChange={e => setForm(p => ({ ...p, url: e.target.value }))} placeholder="Link URL (optional)" style={S.input} />
        </FormDrawer>
      ) : (
        <button onClick={() => setAdding(true)} style={{ width: "100%", padding: 11, fontSize: 13, background: "#DCF0E4", border: "1px dashed #4A7C59", borderRadius: 12, cursor: "pointer", color: "#4A7C59", fontWeight: 500, fontFamily: SANS, marginBottom: 10 }}>
          + Add item
        </button>
      )}
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("inventory");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [checked, setChecked] = useState(() => lsGet("plan_checked", initialChecked));

  const fetchItems = useCallback(() => {
    setLoading(true);
    setLoadError(false);
    fetch(API_URL + "?action=getAll")
      .then(r => r.json())
      .then(data => { setItems(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => { setLoadError(true); setLoading(false); });
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);
  useEffect(() => { lsSet("plan_checked", checked); }, [checked]);

  const addItem = async item => {
    const params = new URLSearchParams({ action: "add", ...item });
    await fetch(API_URL + "?" + params.toString());
    setItems(p => [...p, item]);
  };
  const updateItem = async item => {
    const params = new URLSearchParams({ action: "update", ...item });
    await fetch(API_URL + "?" + params.toString());
    setItems(p => p.map(i => i.id === item.id ? { ...i, ...item } : i));
  };
  const deleteItem = async id => {
    const params = new URLSearchParams({ action: "delete", id });
    await fetch(API_URL + "?" + params.toString());
    setItems(p => p.filter(i => i.id !== id));
  };

  const toggle = id => setChecked(p => ({ ...p, [id]: !p[id] }));
  const totalTasks = Object.keys(checked).length;
  const doneTasks = Object.values(checked).filter(Boolean).length;

  return (
    <div style={{ fontFamily: SERIF, maxWidth: 480, margin: "0 auto", background: "#FAF8F4", minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
      <Header doneTasks={doneTasks} totalTasks={totalTasks} />
      <div style={{ flex: 1, overflowY: "auto", paddingBottom: "calc(80px + env(safe-area-inset-bottom))" }}>
        {tab === "inventory" && <InventoryTab items={items} loading={loading} loadError={loadError} onAdd={addItem} onUpdate={updateItem} onDelete={deleteItem} onRetry={fetchItems} />}
        {tab === "plan" && <PlanTab checked={checked} toggle={toggle} />}
        {tab === "boxes" && <BoxesTab />}
        {tab === "shopping" && <ShoppingTab />}
      </div>
      <TabBar tab={tab} setTab={setTab} />
    </div>
  );
}
