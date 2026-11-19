"use client";
import { useState } from "react";

export default function RsvpForm() {
  const [f, setF] = useState<any>({
    name: "",
    email: "",
    attending: true,
    guests: 1,
    dietary: "",
    message: "",
  });
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [err, setErr] = useState("");
  const set = (k: string, v: any) => setF({ ...f, [k]: v });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("sending");
    setErr("");
    const r = await fetch("/api/rsvp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(f),
    });
    if (r.ok) setState("done");
    else {
      setErr(
        (await r.json()).error || "Something went wrong. Please try again.",
      );
      setState("idle");
    }
  }

  if (state === "done")
    return (
      <div className="max-w-2xl mx-auto bg-[#fffdfa] border border-[#173f3b]/10 p-10 md:p-14 text-center shadow-[0_20px_60px_rgba(45,70,62,.08)]">
        <div className="w-14 h-14 mx-auto rounded-full border border-[#c5a27a] flex items-center justify-center text-[#173f3b] text-2xl">
          ✓
        </div>
        <p className="mt-6 text-[10px] uppercase tracking-[0.28em] text-[#a07955]">
          Response received
        </p>
        <h3 className="mt-3 font-display text-4xl text-[#173f3b]">
          Thank you, {f.name}
        </h3>
        <p className="mt-4 text-sm text-[#65706d]">
          We have recorded your response and sent it for {f.email}.
        </p>
      </div>
    );

  return (
    <form
      onSubmit={submit}
      className="max-w-3xl mx-auto bg-[#fffdfa] border border-[#173f3b]/10 p-6 md:p-10 shadow-[0_20px_60px_rgba(45,70,62,.07)]"
    >
      <div className="grid md:grid-cols-2 gap-5">
        <label>
          <span className="text-[10px] uppercase tracking-[0.16em] text-[#65706d]">
            Full name
          </span>
          <input
            className="inp mt-2"
            placeholder="Your name"
            required
            value={f.name}
            onChange={(e) => set("name", e.target.value)}
          />
        </label>
        <label>
          <span className="text-[10px] uppercase tracking-[0.16em] text-[#65706d]">
            Email address
          </span>
          <input
            className="inp mt-2"
            type="email"
            placeholder="you@example.com"
            required
            value={f.email}
            onChange={(e) => set("email", e.target.value)}
          />
        </label>
      </div>

      <div className="mt-7">
        <p className="text-[10px] uppercase tracking-[0.16em] text-[#65706d] mb-3">
          Will you join us?
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          {[true, false].map((v) => (
            <button
              type="button"
              key={String(v)}
              onClick={() => set("attending", v)}
              className={`py-4 px-5 rounded-[3px] border text-sm transition-all ${f.attending === v ? "bg-[#173f3b] text-white border-[#173f3b] shadow-lg" : "bg-[#f8f5ef] text-[#65706d] border-[#173f3b]/10 hover:border-[#173f3b]/30"}`}
            >
              {v ? "Joyfully accept" : "Regretfully decline"}
            </button>
          ))}
        </div>
      </div>

      {f.attending && (
        <div className="grid md:grid-cols-2 gap-5 mt-7">
          <label>
            <span className="text-[10px] uppercase tracking-[0.16em] text-[#65706d]">
              Number of guests
            </span>
            <input
              className="inp mt-2"
              type="number"
              min={1}
              max={10}
              value={f.guests}
              onChange={(e) => set("guests", e.target.value)}
            />
          </label>
          <label>
            <span className="text-[10px] uppercase tracking-[0.16em] text-[#65706d]">
              Dietary notes
            </span>
            <input
              className="inp mt-2"
              placeholder="Allergies or preferences"
              value={f.dietary}
              onChange={(e) => set("dietary", e.target.value)}
            />
          </label>
        </div>
      )}

      <label className="block mt-7">
        <span className="text-[10px] uppercase tracking-[0.16em] text-[#65706d]">
          A note for the couple
        </span>
        <textarea
          className="inp mt-2"
          rows={4}
          placeholder="Share your wishes…"
          value={f.message}
          onChange={(e) => set("message", e.target.value)}
        />
      </label>
      {err && <p className="text-red-700 text-sm mt-4">{err}</p>}
      <button className="btn w-full mt-7" disabled={state === "sending"}>
        {state === "sending" ? "Sending your response…" : "Send RSVP"}
      </button>
    </form>
  );
}
