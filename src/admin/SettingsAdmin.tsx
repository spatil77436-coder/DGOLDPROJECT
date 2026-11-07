import { useState } from "react";
import { Save, Plus, X, KeyRound, MapPin, Phone, Clock, Database } from "lucide-react";
import { db, type Settings } from "../lib/db";
import { isValidPhone, sanitizeText } from "../lib/helpers";
import { useStore } from "../context/StoreContext";
import { Spinner } from "../components/ui";

export default function SettingsAdmin({ settings, reload }: { settings: Settings; reload: () => Promise<void> }) {
  const { toast } = useStore();
  const [form, setForm] = useState<Settings>({ ...settings, slots: [...settings.slots], extraPins: [...settings.extraPins], blockedPins: [...settings.blockedPins] });
  const [newSlot, setNewSlot] = useState("");
  const [newExtra, setNewExtra] = useState("");
  const [newBlocked, setNewBlocked] = useState("");
  const [saving, setSaving] = useState(false);
  const [pwCurrent, setPwCurrent] = useState("");
  const [pwNew, setPwNew] = useState("");
  const [pwBusy, setPwBusy] = useState(false);

  const set = <K extends keyof Settings>(k: K, v: Settings[K]) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    if (!isValidPhone(form.phone) || !isValidPhone(form.whatsapp)) {
      toast("Phone and WhatsApp must be valid 10-digit Indian mobile numbers.", "error");
      return;
    }
    if (form.slots.length === 0) {
      toast("Keep at least one delivery slot.", "error");
      return;
    }
    setSaving(true);
    try {
      await db.saveSettings({
        ...form,
        email: sanitizeText(form.email, 80),
        unitAddress: sanitizeText(form.unitAddress, 200),
        deliveryNote: sanitizeText(form.deliveryNote, 300),
        lowStockThreshold: Math.max(1, form.lowStockThreshold || 10),
      });
      await reload();
      toast("Business settings saved — live on the website.", "success");
    } catch {
      toast("Could not save settings.", "error");
    } finally {
      setSaving(false);
    }
  };

  const addPin = (kind: "extraPins" | "blockedPins", value: string, clear: () => void) => {
    if (!/^\d{6}$/.test(value)) {
      toast("Enter a valid 6-digit PIN code.", "error");
      return;
    }
    if (form[kind].includes(value)) return;
    set(kind, [...form[kind], value]);
    clear();
  };

  const changePassword = async () => {
    if (pwNew.length < 8) {
      toast("New password must be at least 8 characters.", "error");
      return;
    }
    setPwBusy(true);
    try {
      const ok = await db.changeAdminPassword(pwCurrent, pwNew);
      if (ok) {
        setPwCurrent("");
        setPwNew("");
        toast("Admin password changed successfully.", "success");
      } else {
        toast("Current password is incorrect.", "error");
      }
    } catch {
      toast("Could not change the password.", "error");
    } finally {
      setPwBusy(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      {/* business contact */}
      <section className="rounded-2xl bg-emerald-950/70 border border-white/8 p-6">
        <h3 className="font-display text-lg font-bold text-white flex items-center gap-2 mb-5">
          <Phone className="w-4 h-4 text-gold-400" /> Business Contact
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="lbl">Phone (10-digit)</label>
            <input className="field" inputMode="numeric" maxLength={10} value={form.phone} onChange={(e) => set("phone", e.target.value.replace(/\D/g, "").slice(0, 10))} />
          </div>
          <div>
            <label className="lbl">WhatsApp (10-digit)</label>
            <input className="field" inputMode="numeric" maxLength={10} value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value.replace(/\D/g, "").slice(0, 10))} />
          </div>
          <div>
            <label className="lbl">Email</label>
            <input type="email" className="field" value={form.email} onChange={(e) => set("email", e.target.value)} />
          </div>
          <div>
            <label className="lbl">Low-Stock Alert Threshold</label>
            <input type="number" min={1} className="field" value={form.lowStockThreshold} onChange={(e) => set("lowStockThreshold", parseInt(e.target.value, 10) || 10)} />
          </div>
        </div>
        <div className="mt-4">
          <label className="lbl">Packing Unit Address</label>
          <textarea className="field resize-none" rows={2} value={form.unitAddress} onChange={(e) => set("unitAddress", e.target.value)} />
        </div>
      </section>

      {/* delivery */}
      <section className="rounded-2xl bg-emerald-950/70 border border-white/8 p-6">
        <h3 className="font-display text-lg font-bold text-white flex items-center gap-2 mb-2">
          <Clock className="w-4 h-4 text-gold-400" /> Delivery Settings
        </h3>
        <p className="text-xs text-emerald-100/50 mb-5">Service area is fixed to <strong className="text-gold-300">Bengaluru Only</strong> (560xxx). Use the lists below for exceptions.</p>
        <div>
          <label className="lbl">Delivery Note (shown on website)</label>
          <textarea className="field resize-none" rows={2} value={form.deliveryNote} onChange={(e) => set("deliveryNote", e.target.value)} />
        </div>
        <div className="mt-5">
          <label className="lbl">Time Slots</label>
          <div className="flex flex-wrap gap-2 mb-2.5">
            {form.slots.map((s) => (
              <span key={s} className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-emerald-100/80">
                {s}
                <button onClick={() => set("slots", form.slots.filter((x) => x !== s))} className="text-rose-300/70 hover:text-rose-300" aria-label={`Remove ${s}`}>
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input className="field flex-1" value={newSlot} onChange={(e) => setNewSlot(e.target.value)} placeholder="e.g. 8 AM – 10 AM" />
            <button onClick={() => { const v = sanitizeText(newSlot, 40); if (v && !form.slots.includes(v)) { set("slots", [...form.slots, v]); setNewSlot(""); } }} className="btn-gold !py-2.5 text-sm">
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>
        </div>

        <div className="mt-6 grid sm:grid-cols-2 gap-5">
          {([
            ["extraPins", "Extra Serviceable PINs", "PINs outside 560xxx to allow", newExtra, setNewExtra],
            ["blockedPins", "Blocked PINs", "560xxx PINs to exclude", newBlocked, setNewBlocked],
          ] as const).map(([kind, title, hint, val, setVal]) => (
            <div key={kind}>
              <label className="lbl flex items-center gap-1.5"><MapPin className="w-3 h-3" /> {title}</label>
              <p className="text-[10px] text-emerald-100/40 -mt-1 mb-2">{hint}</p>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {form[kind].map((p) => (
                  <span key={p} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-mono font-bold text-emerald-100/80">
                    {p}
                    <button onClick={() => set(kind, form[kind].filter((x) => x !== p))} className="text-rose-300/70 hover:text-rose-300" aria-label={`Remove ${p}`}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {form[kind].length === 0 && <span className="text-[11px] text-emerald-100/35">None</span>}
              </div>
              <div className="flex gap-2">
                <input className="field !py-2 flex-1" inputMode="numeric" maxLength={6} value={val} onChange={(e) => setVal(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="6-digit PIN" />
                <button onClick={() => addPin(kind, val, () => setVal(""))} className="px-3.5 py-2 rounded-xl border border-gold-400/40 text-gold-300 text-xs font-bold hover:bg-gold-400/10 transition-colors">
                  Add
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <button onClick={save} disabled={saving} className="btn-gold px-8 py-3.5 disabled:opacity-50">
        {saving ? <Spinner /> : (<><Save className="w-4 h-4" /> Save Settings</>)}
      </button>

      {/* security */}
      <section className="rounded-2xl bg-emerald-950/70 border border-white/8 p-6">
        <h3 className="font-display text-lg font-bold text-white flex items-center gap-2 mb-5">
          <KeyRound className="w-4 h-4 text-gold-400" /> Admin Security
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="lbl">Current Password</label>
            <input type="password" className="field" value={pwCurrent} onChange={(e) => setPwCurrent(e.target.value)} autoComplete="current-password" />
          </div>
          <div>
            <label className="lbl">New Password (min 8 chars)</label>
            <input type="password" className="field" value={pwNew} onChange={(e) => setPwNew(e.target.value)} autoComplete="new-password" />
          </div>
        </div>
        <button onClick={changePassword} disabled={pwBusy || !pwCurrent || !pwNew} className="mt-4 px-6 py-3 rounded-xl border border-gold-400/40 text-gold-300 text-sm font-bold hover:bg-gold-400/10 transition-colors disabled:opacity-40 inline-flex items-center gap-2">
          {pwBusy ? <Spinner className="w-4 h-4 border-gold-300/30 border-t-gold-300" /> : <KeyRound className="w-4 h-4" />} Change Password
        </button>
      </section>

      <div className="flex items-start gap-3 rounded-2xl border border-white/8 bg-emerald-950/50 p-5 text-xs text-emerald-100/50 leading-relaxed">
        <Database className="w-4 h-4 text-gold-400 flex-shrink-0 mt-0.5" />
        <p>
          <strong className="text-emerald-100/75">About data storage:</strong> orders, products and settings persist in this
          browser's IndexedDB database and sync live between the storefront and this dashboard. For access across devices,
          connect a hosted backend (e.g. Supabase/Firebase) — credentials were not provided, so no external service is
          simulated. Automated SMS/notifications are likewise not connected; use the built-in WhatsApp links for updates.
        </p>
      </div>
    </div>
  );
}