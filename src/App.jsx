import { useState, useEffect, useRef } from "react";

const API_URL = "https://script.google.com/macros/s/AKfycbwicQIecb2RBGSOwgVgZgjh2hHO2giXcOUsTh4C_wy4wbOG4EmGecKaYLhjZEAuWO59iw/exec";

const CATEGORIES = ["Living room","Art","Plants","Kitchen appliances","Kitchen cookware","Coffee & pantry","Bedroom","Bathroom","Tech","Books","Sports","Misc"];
const DESTINATIONS = [
  { id: "apt", label: "APT", color: "#E1F5EE", border: "#1D9E75", text: "#085041" },
  { id: "ny", label: "To NY", color: "#FBEAF0", border: "#D4537E", text: "#72243E" },
  { id: "storage", label: "Storage", color: "#FAEEDA", border: "#BA7517", text: "#633806" },
  { id: "undecided", label: "Undecided", color: "var(--color-background-secondary)", border: "var(--color-border-secondary)", text: "var(--color-text-secondary)" },
];
const PHASES = [
  { id: "decide", label: "Phase 1 — Decide & sort", dates: "Apr 1–30", color: "#7F77DD", bg: "#EEEDFE", textColor: "#3C3489", tasks: [
    { id: "d1", text: "Walk every room — tag items NY / Store / Leave" },
    { id: "d2", text: "Go through wardrobe: NY pile vs. store pile" },
    { id: "d3", text: "Decide on art pieces — leave on walls or pack?" },
    { id: "d4", text: "Go through kitchen — what stays for the apartment?" },
    { id: "d5", text: "Declutter bathroom — donate expired products" },
    { id: "d6", text: "Identify coffee gear going to NY vs. staying" },
    { id: "d7", text: "Sort books — decorative stays, sentimental stores" },
  ]},
  { id: "supplies", label: "Phase 2 — Get supplies", dates: "Apr 28 – May 2", color: "#1D9E75", bg: "#E1F5EE", textColor: "#085041", tasks: [
    { id: "s1", text: "Buy boxes: ~10 medium, ~5 large, ~3 small" },
    { id: "s2", text: "Get packing tape, bubble wrap, marker pens, labels" },
    { id: "s3", text: "Get color-coded stickers (NY / Storage / APT)" },
    { id: "s4", text: "Pull out suitcases — check condition" },
  ]},
  { id: "pack_storage", label: "Phase 3 — Pack for storage", dates: "May 1–10", color: "#BA7517", bg: "#FAEEDA", textColor: "#633806", tasks: [
    { id: "p1", text: "Pack books into small/medium boxes (keep boxes light!)" },
    { id: "p2", text: "Pack sentimental items — art, framed photos, bubble wrap" },
    { id: "p3", text: "Pack off-season clothes and shoes" },
    { id: "p4", text: "Pack bedding and linens not staying for the apartment" },
    { id: "p5", text: "Label every box: contents + 'STORAGE'" },
    { id: "p6", text: "Log every box in the Boxes tab" },
  ]},
  { id: "pack_ny", label: "Phase 4 — Pack for NY", dates: "May 10–15", color: "#D4537E", bg: "#FBEAF0", textColor: "#72243E", tasks: [
    { id: "n1", text: "Pack Suitcase 1: clothes (capsule wardrobe, 4 seasons)" },
    { id: "n2", text: "Pack Suitcase 2: shoes, toiletries, small tech, coffee gear" },
    { id: "n3", text: "Suitcase 3 (if needed): overflow, sports gear" },
    { id: "n4", text: "Weigh each suitcase — limit is 23kg checked" },
    { id: "n5", text: "Pack carry-on: laptop, documents, valuables" },
  ]},
  { id: "handover", label: "Phase 5 — Handover", dates: "May 15–19", color: "#378ADD", bg: "#E6F1FB", textColor: "#0C447C", tasks: [
    { id: "h1", text: "Move storage boxes to parents' house" },
    { id: "h2", text: "Deep clean bedroom and wardrobe area" },
    { id: "h3", text: "Leave handover note for the apartment" },
    { id: "h4", text: "Label shared kitchen items clearly" },
    { id: "h5", text: "Final walkthrough — anything forgotten?" },
    { id: "h6", text: "Hand over keys" },
  ]},
];
const SHOP_DEFAULTS = [
  { id: "sh1", category: "Kitchen", name: "Knife + cutting board", store: "Amazon", url: "https://amazon.com", price: 30, bought: false },
  { id: "sh2", category: "Kitchen", name: "Small pot + frying pan set", store: "Amazon", url: "https://amazon.com", price: 40, bought: false },
  { id: "sh3", category: "Kitchen", name: "Plates, bowls, mugs (×4)", store: "Target", url: "https://target.com", price: 35, bought: false },
  { id: "sh4", category: "Kitchen", name: "Cutlery set", store: "Amazon", url: "https://amazon.com", price: 15, bought: false },
  { id: "sh5", category: "Kitchen", name: "Dish drying rack", store: "Amazon", url: "https://amazon.com", price: 12, bought: false },
  { id: "sh6", category: "Bedding & bath", name: "Fitted sheet + pillowcase (Twin XL)", store: "Amazon", url: "https://amazon.com", price: 35, bought: false },
  { id: "sh7", category: "Bedding & bath", name: "Duvet + cover", store: "Target", url: "https://target.com", price: 60, bought: false },
  { id: "sh8", category: "Bedding & bath", name: "2 towels", store: "Target", url: "https://target.com", price: 25, bought: false },
  { id: "sh9", category: "Bedding & bath", name: "Bath mat", store: "Amazon", url: "https://amazon.com", price: 12, bought: false },
  { id: "sh10", category: "Desk & misc", name: "US power strip (surge protected)", store: "Amazon", url: "https://amazon.com", price: 20, bought: false },
  { id: "sh11", category: "Desk & misc", name: "Desk lamp", store: "Amazon", url: "https://amazon.com", price: 25, bought: false },
  { id: "sh12", category: "Desk & misc", name: "Hangers (×20)", store: "Amazon", url: "https://amazon.com", price: 10, bought: false },
  { id: "sh13", category: "Desk & misc", name: "Laundry bag + detergent", store: "Target", url: "https://target.com", price: 15, bought: false },
];

function genId() { return "item_" + Date.now().toString(36) + Math.random().toString(36).slice(2,5); }
function today() { return new Date().toISOString().split("T")[0]; }
function destObj(id) { return DESTINATIONS.find(d => d.id === id) || DESTINATIONS[3]; }

const initialChecked = {};
PHASES.forEach(p => p.tasks.forEach(t => { initialChecked[t.id] = false; }));

// ── Pill ──────────────────────────────────────────────────────────────────────
function DestPill({ dest }) {
  const d = destObj(dest);
  return (
    <span style={{ fontSize: 11, padding: "2px 9px", borderRadius: 20, background: d.color, color: d.text, border: `0.5px solid ${d.border}`, whiteSpace: "nowrap", flexShrink: 0 }}>{d.label}</span>
  );
}

// ── Top nav ───────────────────────────────────────────────────────────────────
function TopBar({ tab, setTab, totalTasks, doneTasks }) {
  const pct = Math.round((doneTasks / totalTasks) * 100);
  const tabs = [
    { id: "inventory", label: "Inventory" },
    { id: "plan", label: "Plan" },
    { id: "boxes", label: "Boxes" },
    { id: "shopping", label: "NY shopping" },
  ];
  return (
    <div style={{ borderBottom: "0.5px solid var(--color-border-tertiary)", marginBottom: "1.25rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem 0 .75rem" }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 500, color: "var(--color-text-primary)" }}>Jaffa → New York</div>
          <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 2 }}>Moving May 20, 2026</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 100, height: 4, background: "var(--color-background-secondary)", borderRadius: 3, overflow: "hidden" }}>
            <div style={{ width: pct + "%", height: "100%", background: "#7F77DD", borderRadius: 3, transition: "width .4s" }} />
          </div>
          <span style={{ fontSize: 11, color: "var(--color-text-secondary)", minWidth: 40 }}>{pct}% done</span>
        </div>
      </div>
      <div style={{ display: "flex", gap: 0 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: "6px 14px", fontSize: 13, cursor: "pointer", border: "none", background: "transparent",
            color: tab === t.id ? "var(--color-text-primary)" : "var(--color-text-secondary)",
            borderBottom: tab === t.id ? "2px solid #7F77DD" : "2px solid transparent",
            fontWeight: tab === t.id ? 500 : 400, marginBottom: -1,
          }}>{t.label}</button>
        ))}
      </div>
    </div>
  );
}

// ── Inventory tab ─────────────────────────────────────────────────────────────
function InventoryTab({ items, loading, onAdd, onUpdate }) {
  const [search, setSearch] = useState("");
  const [filterDest, setFilterDest] = useState("all");
  const [filterCat, setFilterCat] = useState("all");
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: "", category: "", destination: "undecided", box_code: "", notes: "" });
  const [saving, setSaving] = useState(false);

  const filtered = items.filter(i => {
    const matchSearch = !search || i.name.toLowerCase().includes(search.toLowerCase()) || i.category.toLowerCase().includes(search.toLowerCase()) || i.notes.toLowerCase().includes(search.toLowerCase());
    const matchDest = filterDest === "all" || i.destination === filterDest;
    const matchCat = filterCat === "all" || i.category === filterCat;
    return matchSearch && matchDest && matchCat;
  });

  const counts = { apt: 0, ny: 0, storage: 0, undecided: 0 };
  items.forEach(i => { if (counts[i.destination] !== undefined) counts[i.destination]++; else counts.undecided++; });

  const openAdd = () => { setForm({ name: "", category: "", destination: "undecided", box_code: "", notes: "" }); setEditId(null); setAdding(true); };
  const openEdit = (item) => { setForm({ name: item.name, category: item.category, destination: item.destination || "undecided", box_code: item.box_code || "", notes: item.notes || "" }); setEditId(item.id); setAdding(true); };
  const cancel = () => { setAdding(false); setEditId(null); };

  const save = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    if (editId) {
      await onUpdate({ id: editId, ...form });
    } else {
      await onAdd({ id: genId(), ...form, date_added: today() });
    }
    setSaving(false);
    setAdding(false);
    setEditId(null);
  };

  const cats = [...new Set(items.map(i => i.category))].filter(Boolean);

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: "1.25rem" }}>
        {[["apt","#085041"],["ny","#72243E"],["storage","#633806"],["undecided","var(--color-text-secondary)"]].map(([dest, color]) => (
          <div key={dest} style={{ background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)", padding: "10px 12px", textAlign: "center" }}>
            <div style={{ fontSize: 20, fontWeight: 500, color }}>{counts[dest] || 0}</div>
            <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginTop: 2 }}>{destObj(dest).label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search items — name, category, notes…" style={{ flex: 1, minWidth: 180, fontSize: 13, padding: "6px 10px", borderRadius: "var(--border-radius-md)", border: "0.5px solid var(--color-border-secondary)", background: "var(--color-background-primary)", color: "var(--color-text-primary)" }} />
        <select value={filterDest} onChange={e => setFilterDest(e.target.value)} style={{ fontSize: 13, padding: "6px 10px", borderRadius: "var(--border-radius-md)", border: "0.5px solid var(--color-border-secondary)" }}>
          <option value="all">All destinations</option>
          {DESTINATIONS.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
        </select>
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)} style={{ fontSize: 13, padding: "6px 10px", borderRadius: "var(--border-radius-md)", border: "0.5px solid var(--color-border-secondary)" }}>
          <option value="all">All categories</option>
          {cats.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {adding && (
        <div style={{ marginBottom: 12, padding: "1rem", border: "0.5px solid var(--color-border-secondary)", borderRadius: "var(--border-radius-lg)", background: "var(--color-background-secondary)" }}>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 10, color: "var(--color-text-primary)" }}>{editId ? "Edit item" : "Add item"}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
            <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Item name" style={{ gridColumn: "1/-1", fontSize: 13, padding: "6px 10px", borderRadius: "var(--border-radius-md)", border: "0.5px solid var(--color-border-secondary)" }} />
            <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} style={{ fontSize: 13, padding: "6px 10px", borderRadius: "var(--border-radius-md)", border: "0.5px solid var(--color-border-secondary)" }}>
              <option value="">Category…</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={form.destination} onChange={e => setForm(p => ({ ...p, destination: e.target.value }))} style={{ fontSize: 13, padding: "6px 10px", borderRadius: "var(--border-radius-md)", border: "0.5px solid var(--color-border-secondary)" }}>
              {DESTINATIONS.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
            </select>
            {form.destination === "storage" && (
              <input value={form.box_code} onChange={e => setForm(p => ({ ...p, box_code: e.target.value }))} placeholder="Box code (e.g. S-3)" style={{ fontSize: 13, padding: "6px 10px", borderRadius: "var(--border-radius-md)", border: "0.5px solid var(--color-border-secondary)" }} />
            )}
            <input value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Notes (fragile, location…)" style={{ gridColumn: form.destination === "storage" ? "2/-1" : "1/-1", fontSize: 13, padding: "6px 10px", borderRadius: "var(--border-radius-md)", border: "0.5px solid var(--color-border-secondary)" }} />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={save} disabled={saving} style={{ padding: "6px 16px", borderRadius: "var(--border-radius-md)", fontSize: 13, fontWeight: 500, background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-primary)", cursor: "pointer", color: "var(--color-text-primary)" }}>{saving ? "Saving…" : editId ? "Save changes" : "Add item"}</button>
            <button onClick={cancel} style={{ padding: "6px 14px", borderRadius: "var(--border-radius-md)", fontSize: 13, background: "transparent", border: "0.5px solid var(--color-border-tertiary)", cursor: "pointer", color: "var(--color-text-secondary)" }}>Cancel</button>
          </div>
        </div>
      )}

      {!adding && (
        <button onClick={openAdd} style={{ width: "100%", marginBottom: 10, padding: "7px", fontSize: 13, background: "transparent", border: "0.5px dashed var(--color-border-secondary)", borderRadius: "var(--border-radius-md)", cursor: "pointer", color: "var(--color-text-secondary)", textAlign: "left" }}>+ Add item</button>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: "2rem", fontSize: 13, color: "var(--color-text-secondary)" }}>Loading from Google Sheets…</div>
      ) : (
        <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", overflow: "hidden" }}>
          {filtered.length === 0 ? (
            <div style={{ padding: "2rem", textAlign: "center", fontSize: 13, color: "var(--color-text-secondary)" }}>{items.length === 0 ? "No items yet — add your first one above." : "No items match your search."}</div>
          ) : filtered.map((item, idx) => (
            <div key={item.id} onClick={() => openEdit(item)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", borderBottom: idx < filtered.length - 1 ? "0.5px solid var(--color-border-tertiary)" : "none", cursor: "pointer" }}>
              <span style={{ fontSize: 11, color: "var(--color-text-secondary)", minWidth: 100, flexShrink: 0 }}>{item.category}</span>
              <span style={{ fontSize: 13, color: "var(--color-text-primary)", flex: 1 }}>{item.name}</span>
              {item.notes && <span style={{ fontSize: 11, color: "var(--color-text-secondary)", fontStyle: "italic", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.notes}</span>}
              <DestPill dest={item.destination} />
              {item.destination === "storage" && item.box_code && (
                <span style={{ fontSize: 11, fontWeight: 500, color: "#633806", background: "#FAEEDA", border: "0.5px solid #BA7517", padding: "2px 7px", borderRadius: 20 }}>{item.box_code}</span>
              )}
            </div>
          ))}
        </div>
      )}
      <div style={{ marginTop: 8, fontSize: 11, color: "var(--color-text-secondary)", textAlign: "right" }}>{filtered.length} of {items.length} items · tap any item to edit</div>
    </div>
  );
}

// ── Plan tab ──────────────────────────────────────────────────────────────────
function PlanTab({ checked, toggle }) {
  const [handover, setHandover] = useState("Wi-Fi: [network name] / password: [password]\nThe boiler takes ~20 min to heat — switch on before showering.\nThe large plant needs water every 1–2 weeks. The pothos is very hard to kill.\n");
  const totalTasks = Object.keys(checked).length;
  const doneTasks = Object.values(checked).filter(Boolean).length;

  return (
    <div>
      {PHASES.map(phase => {
        const done = phase.tasks.filter(t => checked[t.id]).length;
        return (
          <div key={phase.id} style={{ marginBottom: "1.25rem", background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", overflow: "hidden" }}>
            <div style={{ padding: "10px 14px", borderBottom: "0.5px solid var(--color-border-tertiary)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ fontWeight: 500, fontSize: 14, color: "var(--color-text-primary)" }}>{phase.label}</span>
                <span style={{ fontSize: 12, color: "var(--color-text-secondary)", marginLeft: 10 }}>{phase.dates}</span>
              </div>
              <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: phase.bg, color: phase.textColor, border: `0.5px solid ${phase.color}40` }}>{done}/{phase.tasks.length}</span>
            </div>
            {phase.tasks.map(t => (
              <div key={t.id} onClick={() => toggle(t.id)} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "7px 14px", cursor: "pointer", opacity: checked[t.id] ? 0.45 : 1, borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
                <div style={{ width: 15, height: 15, borderRadius: 4, border: `1.5px solid ${checked[t.id] ? phase.color : "var(--color-border-secondary)"}`, background: checked[t.id] ? phase.bg : "transparent", flexShrink: 0, marginTop: 2, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {checked[t.id] && <div style={{ width: 7, height: 7, borderRadius: 2, background: phase.color }} />}
                </div>
                <span style={{ fontSize: 13, color: "var(--color-text-primary)", lineHeight: 1.5, textDecoration: checked[t.id] ? "line-through" : "none" }}>{t.text}</span>
              </div>
            ))}
          </div>
        );
      })}
      <div style={{ marginBottom: "1.25rem" }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 8 }}>Handover note for the apartment</div>
        <textarea value={handover} onChange={e => setHandover(e.target.value)} rows={5} style={{ width: "100%", fontSize: 13, padding: "10px 12px", borderRadius: "var(--border-radius-md)", border: "0.5px solid var(--color-border-secondary)", resize: "vertical", boxSizing: "border-box", lineHeight: 1.7, color: "var(--color-text-primary)", background: "var(--color-background-primary)", borderLeft: "3px solid #1D9E75" }} />
      </div>
    </div>
  );
}

// ── Boxes tab ─────────────────────────────────────────────────────────────────
const DEST_BOX = [
  { id: "storage", label: "Storage (parents)", color: "#FAEEDA", border: "#BA7517", text: "#633806" },
  { id: "ny", label: "Taking to NY", color: "#FBEAF0", border: "#D4537E", text: "#72243E" },
  { id: "apt", label: "Leaving for the apartment", color: "#E1F5EE", border: "#1D9E75", text: "#085041" },
];
const BOX_CATS = ["Clothes","Shoes","Books","Kitchen","Bathroom","Tech","Bedding","Art & decor","Sports","Misc"];
const SUIT_IDS = ["s1","s2","s3"];

function BoxesTab() {
  const [boxes, setBoxes] = useState([]);
  const [suitcases, setSuitcases] = useState({ s1: { items: [], weight: "" }, s2: { items: [], weight: "" }, s3: { items: [], weight: "" } });
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ label: "", dest: "storage", category: "", items: "", notes: "", sealed: false });
  const [suitInput, setSuitInput] = useState({ suit: "s1", text: "" });
  const [search, setSearch] = useState("");

  const addBox = () => {
    if (!form.label.trim()) return;
    const destPrefix = form.dest === "storage" ? "S" : form.dest === "ny" ? "NY" : "F";
    const num = boxes.filter(b => b.dest === form.dest).length + 1;
    if (editId) {
      setBoxes(p => p.map(b => b.id === editId ? { ...b, ...form } : b));
      setEditId(null);
    } else {
      setBoxes(p => [...p, { ...form, id: genId(), boxNum: `${destPrefix}-${num}` }]);
    }
    setForm({ label: "", dest: "storage", category: "", items: "", notes: "", sealed: false });
    setAdding(false);
  };

  const startEdit = (box) => { setForm({ label: box.label, dest: box.dest, category: box.category, items: box.items, notes: box.notes, sealed: box.sealed }); setEditId(box.id); setAdding(true); };
  const deleteBox = id => setBoxes(p => p.filter(b => b.id !== id));
  const toggleSeal = id => setBoxes(p => p.map(b => b.id === id ? { ...b, sealed: !b.sealed } : b));

  const addSuitItem = () => {
    if (!suitInput.text.trim()) return;
    setSuitcases(p => ({ ...p, [suitInput.suit]: { ...p[suitInput.suit], items: [...p[suitInput.suit].items, { id: genId(), text: suitInput.text }] } }));
    setSuitInput(p => ({ ...p, text: "" }));
  };
  const removeSuitItem = (suit, id) => setSuitcases(p => ({ ...p, [suit]: { ...p[suit], items: p[suit].items.filter(i => i.id !== id) } }));
  const setWeight = (suit, val) => setSuitcases(p => ({ ...p, [suit]: { ...p[suit], weight: val } }));

  const filtered = boxes.filter(b => !search || b.label.toLowerCase().includes(search.toLowerCase()) || b.items.toLowerCase().includes(search.toLowerCase()));
  const dObj = id => DEST_BOX.find(d => d.id === id) || DEST_BOX[0];

  return (
    <div>
      <div style={{ marginBottom: "1.25rem" }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 8 }}>Suitcases</div>
        <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap", alignItems: "center" }}>
          <select value={suitInput.suit} onChange={e => setSuitInput(p => ({ ...p, suit: e.target.value }))} style={{ fontSize: 13, padding: "6px 10px", borderRadius: "var(--border-radius-md)", border: "0.5px solid var(--color-border-secondary)" }}>
            {SUIT_IDS.map(s => <option key={s} value={s}>Suitcase {s[1]}</option>)}
          </select>
          <input value={suitInput.text} onChange={e => setSuitInput(p => ({ ...p, text: e.target.value }))} onKeyDown={e => e.key === "Enter" && addSuitItem()} placeholder="Add item to suitcase…" style={{ flex: 1, minWidth: 140, fontSize: 13, padding: "6px 10px", borderRadius: "var(--border-radius-md)", border: "0.5px solid var(--color-border-secondary)" }} />
          <button onClick={addSuitItem} style={{ padding: "6px 14px", borderRadius: "var(--border-radius-md)", fontSize: 13, background: "transparent", border: "0.5px solid var(--color-border-secondary)", cursor: "pointer" }}>Add</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
          {SUIT_IDS.map(s => {
            const w = parseFloat(suitcases[s].weight) || 0;
            const pct = Math.min((w / 23) * 100, 100);
            const barColor = w > 22 ? "#E24B4A" : w > 20 ? "#BA7517" : "#1D9E75";
            return (
              <div key={s} style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", overflow: "hidden" }}>
                <div style={{ padding: "8px 12px", background: "#FBEAF0", borderBottom: "0.5px solid #ED93B1" }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "#72243E" }}>Suitcase {s[1]}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                    <input value={suitcases[s].weight} onChange={e => setWeight(s, e.target.value)} placeholder="kg" style={{ width: 44, fontSize: 12, padding: "2px 6px", borderRadius: "var(--border-radius-md)", border: "0.5px solid #ED93B1", background: "transparent", color: "#72243E" }} />
                    <span style={{ fontSize: 11, color: "#72243E", opacity: .7 }}>/ 23 kg</span>
                  </div>
                  {w > 0 && <div style={{ marginTop: 5, height: 3, background: "#FBEAF0", borderRadius: 2, overflow: "hidden", border: "0.5px solid #ED93B1" }}><div style={{ width: pct + "%", height: "100%", background: barColor, borderRadius: 2 }} /></div>}
                </div>
                <div style={{ padding: "6px 0" }}>
                  {suitcases[s].items.length === 0 ? <div style={{ fontSize: 12, color: "var(--color-text-secondary)", padding: "4px 12px", fontStyle: "italic" }}>Empty</div> :
                    suitcases[s].items.map(item => (
                      <div key={item.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "3px 12px" }}>
                        <span style={{ fontSize: 12, color: "var(--color-text-primary)" }}>{item.text}</span>
                        <button onClick={() => removeSuitItem(s, item.id)} style={{ fontSize: 11, border: "none", background: "transparent", cursor: "pointer", color: "var(--color-text-secondary)", padding: "0 2px" }}>✕</button>
                      </div>
                    ))
                  }
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 8 }}>Boxes</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: "1rem" }}>
        {DEST_BOX.map(d => (
          <div key={d.id} style={{ background: d.color, border: `0.5px solid ${d.border}60`, borderRadius: "var(--border-radius-md)", padding: "8px 12px", textAlign: "center" }}>
            <div style={{ fontSize: 18, fontWeight: 500, color: d.text }}>{boxes.filter(b => b.dest === d.id).length}</div>
            <div style={{ fontSize: 11, color: d.text, opacity: .8 }}>{d.label}</div>
          </div>
        ))}
      </div>

      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search boxes or contents…" style={{ width: "100%", fontSize: 13, padding: "6px 10px", borderRadius: "var(--border-radius-md)", border: "0.5px solid var(--color-border-secondary)", marginBottom: 10, boxSizing: "border-box" }} />

      {adding && (
        <div style={{ marginBottom: 10, padding: "1rem", border: "0.5px solid var(--color-border-secondary)", borderRadius: "var(--border-radius-lg)", background: "var(--color-background-secondary)" }}>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 10 }}>{editId ? "Edit box" : "New box"}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
            <input value={form.label} onChange={e => setForm(p => ({ ...p, label: e.target.value }))} placeholder="Box label (e.g. Winter clothes)" style={{ gridColumn: "1/-1", fontSize: 13, padding: "6px 10px", borderRadius: "var(--border-radius-md)", border: "0.5px solid var(--color-border-secondary)" }} />
            <select value={form.dest} onChange={e => setForm(p => ({ ...p, dest: e.target.value }))} style={{ fontSize: 13, padding: "6px 10px", borderRadius: "var(--border-radius-md)", border: "0.5px solid var(--color-border-secondary)" }}>
              {DEST_BOX.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
            </select>
            <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} style={{ fontSize: 13, padding: "6px 10px", borderRadius: "var(--border-radius-md)", border: "0.5px solid var(--color-border-secondary)" }}>
              <option value="">Category…</option>
              {BOX_CATS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <textarea value={form.items} onChange={e => setForm(p => ({ ...p, items: e.target.value }))} placeholder="Contents (one item per line)" rows={3} style={{ width: "100%", fontSize: 13, padding: "6px 10px", borderRadius: "var(--border-radius-md)", border: "0.5px solid var(--color-border-secondary)", resize: "vertical", boxSizing: "border-box", marginBottom: 8 }} />
          <input value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Notes (fragile? where exactly stored?)" style={{ width: "100%", fontSize: 13, padding: "6px 10px", borderRadius: "var(--border-radius-md)", border: "0.5px solid var(--color-border-secondary)", boxSizing: "border-box", marginBottom: 10 }} />
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={addBox} style={{ padding: "6px 16px", borderRadius: "var(--border-radius-md)", fontSize: 13, fontWeight: 500, background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-primary)", cursor: "pointer" }}>{editId ? "Save" : "Add box"}</button>
            <button onClick={() => { setAdding(false); setEditId(null); }} style={{ padding: "6px 14px", borderRadius: "var(--border-radius-md)", fontSize: 13, background: "transparent", border: "0.5px solid var(--color-border-tertiary)", cursor: "pointer", color: "var(--color-text-secondary)" }}>Cancel</button>
          </div>
        </div>
      )}
      {!adding && <button onClick={() => setAdding(true)} style={{ width: "100%", marginBottom: 10, padding: "7px", fontSize: 13, background: "transparent", border: "0.5px dashed var(--color-border-secondary)", borderRadius: "var(--border-radius-md)", cursor: "pointer", color: "var(--color-text-secondary)", textAlign: "left" }}>+ Add a box</button>}

      {filtered.map(box => {
        const d = dObj(box.dest);
        return (
          <div key={box.id} style={{ marginBottom: 8, border: `0.5px solid ${d.border}50`, borderRadius: "var(--border-radius-lg)", background: "var(--color-background-primary)", overflow: "hidden", opacity: box.sealed ? .7 : 1 }}>
            <div style={{ padding: "9px 14px", display: "flex", alignItems: "center", gap: 10, background: d.color + "60" }}>
              <span style={{ fontSize: 11, fontWeight: 500, padding: "2px 8px", borderRadius: 20, background: d.color, color: d.text, border: `0.5px solid ${d.border}50` }}>{box.boxNum}</span>
              <span style={{ fontSize: 13, fontWeight: 500, flex: 1, color: "var(--color-text-primary)" }}>{box.label}</span>
              {box.category && <span style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>{box.category}</span>}
              {box.sealed && <span style={{ fontSize: 11, color: "#1D9E75", padding: "2px 8px", background: "#E1F5EE", borderRadius: 20 }}>sealed</span>}
            </div>
            {box.items && <div style={{ padding: "6px 14px", borderBottom: "0.5px solid var(--color-border-tertiary)" }}>{box.items.split("\n").filter(Boolean).map((item, i) => <div key={i} style={{ fontSize: 12, color: "var(--color-text-secondary)", lineHeight: 1.8 }}>· {item}</div>)}</div>}
            {box.notes && <div style={{ padding: "5px 14px", fontSize: 12, color: "var(--color-text-secondary)", fontStyle: "italic" }}>{box.notes}</div>}
            <div style={{ padding: "5px 14px", display: "flex", gap: 8, borderTop: "0.5px solid var(--color-border-tertiary)" }}>
              <button onClick={() => toggleSeal(box.id)} style={{ fontSize: 11, padding: "3px 10px", borderRadius: "var(--border-radius-md)", border: "0.5px solid var(--color-border-tertiary)", background: "transparent", cursor: "pointer", color: "var(--color-text-secondary)" }}>{box.sealed ? "Unseal" : "Mark sealed"}</button>
              <button onClick={() => startEdit(box)} style={{ fontSize: 11, padding: "3px 10px", borderRadius: "var(--border-radius-md)", border: "0.5px solid var(--color-border-tertiary)", background: "transparent", cursor: "pointer", color: "var(--color-text-secondary)" }}>Edit</button>
              <button onClick={() => deleteBox(box.id)} style={{ fontSize: 11, padding: "3px 10px", borderRadius: "var(--border-radius-md)", border: "0.5px solid var(--color-border-tertiary)", background: "transparent", cursor: "pointer", color: "var(--color-text-danger)" }}>Delete</button>
            </div>
          </div>
        );
      })}
      {filtered.length === 0 && !adding && <div style={{ textAlign: "center", padding: "2rem", fontSize: 13, color: "var(--color-text-secondary)" }}>{boxes.length === 0 ? "No boxes yet — add your first one above." : "No boxes match your search."}</div>}
    </div>
  );
}

// ── Shopping tab ──────────────────────────────────────────────────────────────
function ShoppingTab() {
  const [items, setItems] = useState(SHOP_DEFAULTS);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: "", category: "Kitchen", store: "", url: "", price: "" });

  const toggle = id => setItems(p => p.map(i => i.id === id ? { ...i, bought: !i.bought } : i));
  const addItem = () => {
    if (!form.name.trim()) return;
    setItems(p => [...p, { ...form, id: genId(), price: parseFloat(form.price) || 0, bought: false }]);
    setForm({ name: "", category: "Kitchen", store: "", url: "", price: "" });
    setAdding(false);
  };

  const cats = [...new Set(items.map(i => i.category))];
  const total = items.reduce((s, i) => s + (i.price || 0), 0);
  const remaining = items.filter(i => !i.bought).reduce((s, i) => s + (i.price || 0), 0);
  const bought = items.filter(i => i.bought).length;

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: "1.25rem" }}>
        {[["Items", items.length, "var(--color-text-primary)"], ["Bought", bought, "#085041"], ["Est. total", "$" + Math.round(total), "#633806"], ["Remaining", "$" + Math.round(remaining), "var(--color-text-secondary)"]].map(([l, v, c]) => (
          <div key={l} style={{ background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)", padding: "10px 12px", textAlign: "center" }}>
            <div style={{ fontSize: 18, fontWeight: 500, color: c }}>{v}</div>
            <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginTop: 2 }}>{l}</div>
          </div>
        ))}
      </div>

      {cats.map(cat => {
        const catItems = items.filter(i => i.category === cat);
        const catTotal = catItems.reduce((s, i) => s + (i.price || 0), 0);
        return (
          <div key={cat} style={{ marginBottom: "1rem", background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", overflow: "hidden" }}>
            <div style={{ padding: "9px 14px", borderBottom: "0.5px solid var(--color-border-tertiary)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)" }}>{cat}</span>
              <span style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>{catItems.length} items · ~${Math.round(catTotal)}</span>
            </div>
            {catItems.map(item => (
              <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 14px", borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
                <div onClick={() => toggle(item.id)} style={{ width: 14, height: 14, borderRadius: 3, border: `1.5px solid ${item.bought ? "#1D9E75" : "var(--color-border-secondary)"}`, background: item.bought ? "#1D9E75" : "transparent", flexShrink: 0, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {item.bought && <div style={{ width: 6, height: 6, borderRadius: 1, background: "white" }} />}
                </div>
                <span style={{ fontSize: 13, flex: 1, color: "var(--color-text-primary)", textDecoration: item.bought ? "line-through" : "none", opacity: item.bought ? .5 : 1 }}>{item.name}</span>
                {item.url && <a href={item.url} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: "#378ADD", textDecoration: "none", flexShrink: 0 }}>{item.store || "Link"}</a>}
                <span style={{ fontSize: 12, color: "var(--color-text-secondary)", minWidth: 32, textAlign: "right" }}>${item.price}</span>
              </div>
            ))}
          </div>
        );
      })}

      {adding ? (
        <div style={{ padding: "1rem", border: "0.5px solid var(--color-border-secondary)", borderRadius: "var(--border-radius-lg)", background: "var(--color-background-secondary)", marginBottom: 10 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
            <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Item name" style={{ gridColumn: "1/-1", fontSize: 13, padding: "6px 10px", borderRadius: "var(--border-radius-md)", border: "0.5px solid var(--color-border-secondary)" }} />
            <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} style={{ fontSize: 13, padding: "6px 10px", borderRadius: "var(--border-radius-md)", border: "0.5px solid var(--color-border-secondary)" }}>
              {[...cats, "Other"].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} placeholder="Price ($)" type="number" style={{ fontSize: 13, padding: "6px 10px", borderRadius: "var(--border-radius-md)", border: "0.5px solid var(--color-border-secondary)" }} />
            <input value={form.store} onChange={e => setForm(p => ({ ...p, store: e.target.value }))} placeholder="Store (Amazon, Target…)" style={{ fontSize: 13, padding: "6px 10px", borderRadius: "var(--border-radius-md)", border: "0.5px solid var(--color-border-secondary)" }} />
            <input value={form.url} onChange={e => setForm(p => ({ ...p, url: e.target.value }))} placeholder="Link (optional)" style={{ fontSize: 13, padding: "6px 10px", borderRadius: "var(--border-radius-md)", border: "0.5px solid var(--color-border-secondary)" }} />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={addItem} style={{ padding: "6px 16px", borderRadius: "var(--border-radius-md)", fontSize: 13, fontWeight: 500, background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-primary)", cursor: "pointer" }}>Add item</button>
            <button onClick={() => setAdding(false)} style={{ padding: "6px 14px", borderRadius: "var(--border-radius-md)", fontSize: 13, background: "transparent", border: "0.5px solid var(--color-border-tertiary)", cursor: "pointer", color: "var(--color-text-secondary)" }}>Cancel</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setAdding(true)} style={{ width: "100%", padding: "7px", fontSize: 13, background: "transparent", border: "0.5px dashed var(--color-border-secondary)", borderRadius: "var(--border-radius-md)", cursor: "pointer", color: "var(--color-text-secondary)", textAlign: "left" }}>+ Add item</button>
      )}
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("inventory");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checked, setChecked] = useState(initialChecked);

  useEffect(() => {
    fetch(API_URL + "?action=getAll")
      .then(r => r.json())
      .then(data => { setItems(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const addItem = async (item) => {
    const params = new URLSearchParams({ action: "add", ...item });
    await fetch(API_URL + "?" + params.toString());
    setItems(p => [...p, item]);
  };

  const updateItem = async (item) => {
    const params = new URLSearchParams({ action: "update", ...item });
    await fetch(API_URL + "?" + params.toString());
    setItems(p => p.map(i => i.id === item.id ? { ...i, ...item } : i));
  };

  const toggle = id => setChecked(p => ({ ...p, [id]: !p[id] }));
  const totalTasks = Object.keys(checked).length;
  const doneTasks = Object.values(checked).filter(Boolean).length;

  return (
    <div style={{ fontFamily: "var(--font-sans)", maxWidth: 720, margin: "0 auto", padding: "0 1rem 3rem" }}>
      <TopBar tab={tab} setTab={setTab} totalTasks={totalTasks} doneTasks={doneTasks} />
      {tab === "inventory" && <InventoryTab items={items} loading={loading} onAdd={addItem} onUpdate={updateItem} />}
      {tab === "plan" && <PlanTab checked={checked} toggle={toggle} />}
      {tab === "boxes" && <BoxesTab />}
      {tab === "shopping" && <ShoppingTab />}
    </div>
  );
}
