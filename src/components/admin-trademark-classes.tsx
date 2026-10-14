import { useCallback, useEffect, useState } from "react";
import { Loader2, Plus, Save, Trash2, Info } from "lucide-react";

/**
 * Admin console -> Trade mark classes.
 *
 * Maps what a company will mainly do to the trade mark classes the name check should test. The first
 * class is the business's OWN class (a same-brand mark there is high risk); the others are RELATED
 * classes (a match there is only a caution). NIC prefixes let an applicant who types a NIC code land
 * on the right activity: "62,63" claims 6201, 6311 and so on, and the longest prefix wins.
 */

const BACKEND = (import.meta.env.VITE_BACKEND_URL || "").replace(/\/$/, "");
const API = `${BACKEND}/api/trademarks/admin/activities`;

type Row = { id: number; label: string; classes: number[]; nicPrefixes: string[]; sortOrder: number; active: boolean };
/** What the inputs hold while editing: the two lists as the comma text the admin types. */
type Draft = { label: string; classes: string; nic: string; active: boolean };

const toDraft = (r: Row): Draft => ({ label: r.label, classes: r.classes.join(", "), nic: r.nicPrefixes.join(", "), active: r.active });
const EMPTY: Draft = { label: "", classes: "", nic: "", active: true };

async function call(url: string, method: string, body?: unknown) {
  const res = await fetch(url, {
    method,
    credentials: "include",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export function AdminTrademarkClassesPanel() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [drafts, setDrafts] = useState<Record<number, Draft>>({});
  const [adding, setAdding] = useState<Draft>(EMPTY);
  const [busy, setBusy] = useState<number | "new" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<number | "new" | null>(null);

  const load = useCallback(async () => {
    try {
      const data: Row[] = await call(API, "GET");
      setRows(data);
      setDrafts(Object.fromEntries(data.map((r) => [r.id, toDraft(r)])));
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  const run = async (key: number | "new", fn: () => Promise<unknown>) => {
    setBusy(key);
    setError(null);
    try {
      await fn();
      await load();
      setSaved(key);
      setTimeout(() => setSaved((s) => (s === key ? null : s)), 1800);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const body = (d: Draft) => ({ label: d.label, classes: d.classes, nicPrefixes: d.nic, active: d.active });
  const input = "h-9 w-full rounded-lg border border-border bg-white px-2.5 text-sm";

  if (!rows && !error) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" /> Loading…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2.5 rounded-xl border border-border bg-muted/40 p-3.5 text-[13px] text-foreground/85">
        <Info className="mt-0.5 size-4 shrink-0 text-primary" />
        <div>
          Write the classes as numbers from 1 to 45, <b>the business's own class first</b>, then related ones (for example{" "}
          <span className="mono">42, 9, 35, 41</span>). NIC prefixes are 2 to 5 digits (<span className="mono">62, 63, 5820</span>); a typed
          NIC code picks the activity with the longest matching prefix. Changes apply to the home page straight away.
        </div>
      </div>

      {error && <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">{error}</div>}

      <div className="overflow-x-auto rounded-xl border border-border bg-surface">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-muted/50 text-[11px] uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-3 py-2.5 font-semibold">Activity</th>
              <th className="px-3 py-2.5 font-semibold w-44">Classes (own first)</th>
              <th className="px-3 py-2.5 font-semibold w-44">NIC prefixes</th>
              <th className="px-3 py-2.5 font-semibold w-16 text-center">Shown</th>
              <th className="px-3 py-2.5 w-28" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {(rows ?? []).map((r) => {
              const d = drafts[r.id] ?? toDraft(r);
              const dirty = JSON.stringify(d) !== JSON.stringify(toDraft(r));
              const set = (patch: Partial<Draft>) => setDrafts((all) => ({ ...all, [r.id]: { ...d, ...patch } }));
              return (
                <tr key={r.id} className={r.active ? "" : "opacity-60"}>
                  <td className="px-3 py-2"><input className={input} value={d.label} onChange={(e) => set({ label: e.target.value })} /></td>
                  <td className="px-3 py-2"><input className={`${input} mono`} value={d.classes} onChange={(e) => set({ classes: e.target.value })} /></td>
                  <td className="px-3 py-2"><input className={`${input} mono`} value={d.nic} onChange={(e) => set({ nic: e.target.value })} /></td>
                  <td className="px-3 py-2 text-center">
                    <input type="checkbox" checked={d.active} onChange={(e) => set({ active: e.target.checked })} aria-label={`Show ${d.label}`} />
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        disabled={!dirty || busy === r.id}
                        onClick={() => run(r.id, () => call(`${API}/${r.id}`, "PUT", body(d)))}
                        className="inline-flex h-8 items-center gap-1 rounded-lg bg-primary px-2.5 text-xs font-semibold text-white disabled:opacity-40"
                      >
                        {busy === r.id ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
                        {saved === r.id ? "Saved" : "Save"}
                      </button>
                      <button
                        type="button"
                        aria-label={`Delete ${r.label}`}
                        onClick={() => window.confirm(`Delete "${r.label}"?`) && run(r.id, () => call(`${API}/${r.id}`, "DELETE"))}
                        className="grid size-8 place-items-center rounded-lg border border-border text-muted-foreground hover:border-destructive hover:text-destructive"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {/* New activity */}
            <tr className="bg-muted/30">
              <td className="px-3 py-2"><input className={input} placeholder="New activity, e.g. Drones & aerospace" value={adding.label} onChange={(e) => setAdding({ ...adding, label: e.target.value })} /></td>
              <td className="px-3 py-2"><input className={`${input} mono`} placeholder="12, 35" value={adding.classes} onChange={(e) => setAdding({ ...adding, classes: e.target.value })} /></td>
              <td className="px-3 py-2"><input className={`${input} mono`} placeholder="3030" value={adding.nic} onChange={(e) => setAdding({ ...adding, nic: e.target.value })} /></td>
              <td className="px-3 py-2 text-center">
                <input type="checkbox" checked={adding.active} onChange={(e) => setAdding({ ...adding, active: e.target.checked })} aria-label="Show new activity" />
              </td>
              <td className="px-3 py-2 text-right">
                <button
                  type="button"
                  disabled={busy === "new" || !adding.label.trim() || !adding.classes.trim()}
                  onClick={() => run("new", async () => { await call(API, "POST", { ...body(adding), sortOrder: (rows?.length ?? 0) * 10 + 10 }); setAdding(EMPTY); })}
                  className="inline-flex h-8 items-center gap-1 rounded-lg bg-primary px-2.5 text-xs font-semibold text-white disabled:opacity-40"
                >
                  {busy === "new" ? <Loader2 className="size-3.5 animate-spin" /> : <Plus className="size-3.5" />}
                  {saved === "new" ? "Added" : "Add"}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
