"use client";

import { useState } from "react";
import { Field, TextArea, Card, SmallButton, RepeatItem, AddTile } from "./ui";
import ImageUpload from "./ImageUpload";
import { SKILL_ICON_KEYS } from "@/lib/skillIcons";
import { SOCIAL_PLATFORMS } from "@/lib/socialIcons";

// ---- immutable path setter ----------------------------------------------
function setIn(obj, path, value) {
  const keys = Array.isArray(path) ? path : path.split(".");
  const clone = Array.isArray(obj) ? [...obj] : { ...obj };
  let cur = clone;
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    const next = cur[k];
    cur[k] = Array.isArray(next) ? [...next] : { ...(next || {}) };
    cur = cur[k];
  }
  cur[keys[keys.length - 1]] = value;
  return clone;
}

const TABS = [
  "Home",
  "About",
  "Experience",
  "Education",
  "Skills",
  "Stats",
  "Projects",
  "Achievements",
  "Certificates",
  "Services",
  "Contact",
  "Socials",
];

export default function PortfolioEditor({ data, onChange }) {
  const [tab, setTab] = useState("Home");
  const set = (path, value) => onChange(setIn(data, path, value));

  // helpers for array sections
  const addTo = (key, item) => set(key, [...(data[key] || []), item]);
  const removeFrom = (key, idx) => set(key, (data[key] || []).filter((_, i) => i !== idx));
  const setItem = (key, idx, field, value) => {
    const next = [...(data[key] || [])];
    next[idx] = { ...next[idx], [field]: value };
    set(key, next);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Tab bar */}
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`text-sm rounded-full px-4 py-1.5 border transition-colors ${
              tab === t
                ? "bg-accent text-primary border-accent"
                : "border-white/10 text-white/60 hover:text-white hover:border-white/30"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ---------------- HOME ---------------- */}
      {tab === "Home" && (
        <Card title="Home / Hero">
          <Field label="Role / headline" value={data.home?.role} onChange={(v) => set("home.role", v)} placeholder="Software Developer" />
          <Field label="Display name" value={data.home?.name} onChange={(v) => set("home.name", v)} placeholder="Your Name" />
          <TextArea
            label="Typewriter lines (one per line)"
            value={(data.home?.typewriter || []).join("\n")}
            onChange={(v) => set("home.typewriter", v.split("\n").map((s) => s).filter((s) => s.trim() !== ""))}
            placeholder={"I build delightful web apps.\nI turn ideas into products."}
            rows={3}
          />
          <ImageUpload label="Profile photo" value={data.home?.photoUrl} onChange={(v) => set("home.photoUrl", v)} folder="profile" crop />
          <ImageUpload label="Resume (PDF or image)" value={data.home?.resumeUrl} onChange={(v) => set("home.resumeUrl", v)} folder="resume" accept="application/pdf,image/*" />
        </Card>
      )}

      {/* ---------------- ABOUT ---------------- */}
      {tab === "About" && (
        <Card
          title="About"
          action={<SmallButton onClick={() => set("about.info", [...(data.about?.info || []), { fieldName: "", fieldValue: "" }])}>+ Add info</SmallButton>}
        >
          <Field label="Title" value={data.about?.title} onChange={(v) => set("about.title", v)} />
          <TextArea label="Description" value={data.about?.description} onChange={(v) => set("about.description", v)} />
          {(data.about?.info || []).map((row, i) => (
            <RepeatItem key={i} onRemove={() => set("about.info", data.about.info.filter((_, j) => j !== i))}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field label="Label" value={row.fieldName} onChange={(v) => { const n = [...data.about.info]; n[i] = { ...n[i], fieldName: v }; set("about.info", n); }} />
                <Field label="Value" value={row.fieldValue} onChange={(v) => { const n = [...data.about.info]; n[i] = { ...n[i], fieldValue: v }; set("about.info", n); }} />
              </div>
            </RepeatItem>
          ))}
        </Card>
      )}

      {/* ---------------- EXPERIENCE ---------------- */}
      {tab === "Experience" && (
        <Card
          title="Experience"
          action={<SmallButton onClick={() => set("experience.items", [...(data.experience?.items || []), { company: "", position: "", duration: "" }])}>+ Add</SmallButton>}
        >
          <Field label="Section title" value={data.experience?.title} onChange={(v) => set("experience.title", v)} />
          <TextArea label="Description" value={data.experience?.description} onChange={(v) => set("experience.description", v)} rows={2} />
          {(data.experience?.items || []).map((it, i) => (
            <RepeatItem key={i} onRemove={() => set("experience.items", data.experience.items.filter((_, j) => j !== i))}>
              <Field label="Position" value={it.position} onChange={(v) => { const n = [...data.experience.items]; n[i] = { ...n[i], position: v }; set("experience.items", n); }} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field label="Company" value={it.company} onChange={(v) => { const n = [...data.experience.items]; n[i] = { ...n[i], company: v }; set("experience.items", n); }} />
                <Field label="Duration" value={it.duration} onChange={(v) => { const n = [...data.experience.items]; n[i] = { ...n[i], duration: v }; set("experience.items", n); }} />
              </div>
            </RepeatItem>
          ))}
        </Card>
      )}

      {/* ---------------- EDUCATION ---------------- */}
      {tab === "Education" && (
        <Card
          title="Education"
          action={<SmallButton onClick={() => set("education.items", [...(data.education?.items || []), { institute: "", degree: "", duration: "" }])}>+ Add</SmallButton>}
        >
          <Field label="Section title" value={data.education?.title} onChange={(v) => set("education.title", v)} />
          <TextArea label="Description" value={data.education?.description} onChange={(v) => set("education.description", v)} rows={2} />
          {(data.education?.items || []).map((it, i) => (
            <RepeatItem key={i} onRemove={() => set("education.items", data.education.items.filter((_, j) => j !== i))}>
              <Field label="Degree" value={it.degree} onChange={(v) => { const n = [...data.education.items]; n[i] = { ...n[i], degree: v }; set("education.items", n); }} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field label="Institute" value={it.institute} onChange={(v) => { const n = [...data.education.items]; n[i] = { ...n[i], institute: v }; set("education.items", n); }} />
                <Field label="Duration" value={it.duration} onChange={(v) => { const n = [...data.education.items]; n[i] = { ...n[i], duration: v }; set("education.items", n); }} />
              </div>
            </RepeatItem>
          ))}
        </Card>
      )}

      {/* ---------------- SKILLS ---------------- */}
      {tab === "Skills" && (
        <Card title="Skills">
          <Field label="Section title" value={data.skills?.title} onChange={(v) => set("skills.title", v)} />
          <TextArea label="Description" value={data.skills?.description} onChange={(v) => set("skills.description", v)} rows={2} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(data.skills?.skillList || []).map((sk, i) => (
              <RepeatItem key={i} onRemove={() => set("skills.skillList", data.skills.skillList.filter((_, j) => j !== i))}>
                <label className="flex flex-col gap-1.5">
                  <span className="text-sm text-white/60">Icon</span>
                  <select
                    value={sk.iconKey}
                    onChange={(e) => { const n = [...data.skills.skillList]; n[i] = { ...n[i], iconKey: e.target.value }; set("skills.skillList", n); }}
                    className="bg-[#1c1c22] border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-accent"
                  >
                    {SKILL_ICON_KEYS.map((k) => <option key={k} value={k}>{k}</option>)}
                  </select>
                </label>
                <Field label="Label" value={sk.name} onChange={(v) => { const n = [...data.skills.skillList]; n[i] = { ...n[i], name: v }; set("skills.skillList", n); }} />
              </RepeatItem>
            ))}
            <AddTile label="Add skill" onClick={() => set("skills.skillList", [...(data.skills?.skillList || []), { iconKey: "react", name: "" }])} />
          </div>
        </Card>
      )}

      {/* ---------------- STATS ---------------- */}
      {tab === "Stats" && (
        <Card title="Stats" action={<SmallButton onClick={() => addTo("stats", { num: 0, text: "" })}>+ Add</SmallButton>}>
          {(data.stats || []).map((st, i) => (
            <RepeatItem key={i} onRemove={() => removeFrom("stats", i)}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field label="Number" type="number" value={st.num} onChange={(v) => setItem("stats", i, "num", Number(v))} />
                <Field label="Label" value={st.text} onChange={(v) => setItem("stats", i, "text", v)} />
              </div>
            </RepeatItem>
          ))}
        </Card>
      )}

      {/* ---------------- PROJECTS ---------------- */}
      {tab === "Projects" && (
        <Card
          title="Projects"
          action={<SmallButton onClick={() => addTo("projects", { num: String((data.projects?.length || 0) + 1).padStart(2, "0"), category: "", title: "", description: "", stack: [], image: "", live: "", github: "" })}>+ Add project</SmallButton>}
        >
          {(data.projects || []).map((p, i) => (
            <RepeatItem key={i} onRemove={() => removeFrom("projects", i)}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Field label="Number" value={p.num} onChange={(v) => setItem("projects", i, "num", v)} />
                <Field label="Category" value={p.category} onChange={(v) => setItem("projects", i, "category", v)} />
                <Field label="Title" value={p.title} onChange={(v) => setItem("projects", i, "title", v)} />
              </div>
              <TextArea label="Description" value={p.description} onChange={(v) => setItem("projects", i, "description", v)} rows={2} />
              <Field
                label="Tech stack (comma separated)"
                value={(p.stack || []).map((s) => s.name).join(", ")}
                onChange={(v) => setItem("projects", i, "stack", v.split(",").map((s) => ({ name: s.trim() })).filter((s) => s.name))}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field label="Live URL" value={p.live} onChange={(v) => setItem("projects", i, "live", v)} />
                <Field label="GitHub URL" value={p.github} onChange={(v) => setItem("projects", i, "github", v)} />
              </div>
              <ImageUpload label="Thumbnail" value={p.image} onChange={(v) => setItem("projects", i, "image", v)} folder="projects" />
            </RepeatItem>
          ))}
        </Card>
      )}

      {/* ---------------- ACHIEVEMENTS ---------------- */}
      {tab === "Achievements" && (
        <Card
          title="Achievements"
          action={<SmallButton onClick={() => addTo("achievements", { num: String((data.achievements?.length || 0) + 1).padStart(2, "0"), category: "", title: "", description: "", tags: [], image: "" })}>+ Add</SmallButton>}
        >
          {(data.achievements || []).map((a, i) => (
            <RepeatItem key={i} onRemove={() => removeFrom("achievements", i)}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Field label="Number" value={a.num} onChange={(v) => setItem("achievements", i, "num", v)} />
                <Field label="Category" value={a.category} onChange={(v) => setItem("achievements", i, "category", v)} />
                <Field label="Title" value={a.title} onChange={(v) => setItem("achievements", i, "title", v)} />
              </div>
              <TextArea label="Description" value={a.description} onChange={(v) => setItem("achievements", i, "description", v)} rows={2} />
              <Field
                label="Tags (comma separated)"
                value={(a.tags || []).join(", ")}
                onChange={(v) => setItem("achievements", i, "tags", v.split(",").map((s) => s.trim()).filter(Boolean))}
              />
              <ImageUpload label="Image" value={a.image} onChange={(v) => setItem("achievements", i, "image", v)} folder="achievements" />
            </RepeatItem>
          ))}
        </Card>
      )}

      {/* ---------------- CERTIFICATES ---------------- */}
      {tab === "Certificates" && (
        <Card
          title="Certificates"
          action={<SmallButton onClick={() => addTo("certificates", { num: String((data.certificates?.length || 0) + 1).padStart(2, "0"), category: "", description: "", image: "" })}>+ Add</SmallButton>}
        >
          {(data.certificates || []).map((c, i) => (
            <RepeatItem key={i} onRemove={() => removeFrom("certificates", i)}>
              <Field label="Title / category" value={c.category} onChange={(v) => setItem("certificates", i, "category", v)} />
              <TextArea label="Description" value={c.description} onChange={(v) => setItem("certificates", i, "description", v)} rows={2} />
              <ImageUpload label="Certificate image" value={c.image} onChange={(v) => setItem("certificates", i, "image", v)} folder="certificates" />
            </RepeatItem>
          ))}
        </Card>
      )}

      {/* ---------------- SERVICES ---------------- */}
      {tab === "Services" && (
        <Card
          title="Services"
          action={<SmallButton onClick={() => addTo("services", { num: String((data.services?.length || 0) + 1).padStart(2, "0"), title: "", description: "", href: "" })}>+ Add</SmallButton>}
        >
          {(data.services || []).map((s, i) => (
            <RepeatItem key={i} onRemove={() => removeFrom("services", i)}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Field label="Number" value={s.num} onChange={(v) => setItem("services", i, "num", v)} />
                <Field label="Title" value={s.title} onChange={(v) => setItem("services", i, "title", v)} />
                <Field label="Link (optional)" value={s.href} onChange={(v) => setItem("services", i, "href", v)} />
              </div>
              <TextArea label="Description" value={s.description} onChange={(v) => setItem("services", i, "description", v)} rows={2} />
            </RepeatItem>
          ))}
        </Card>
      )}

      {/* ---------------- CONTACT ---------------- */}
      {tab === "Contact" && (
        <Card title="Contact">
          <Field label="Heading" value={data.contact?.heading} onChange={(v) => set("contact.heading", v)} />
          <TextArea label="Description" value={data.contact?.description} onChange={(v) => set("contact.description", v)} rows={2} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Field label="Phone" value={data.contact?.phone} onChange={(v) => set("contact.phone", v)} />
            <Field label="Email" value={data.contact?.email} onChange={(v) => set("contact.email", v)} />
            <Field label="Address" value={data.contact?.address} onChange={(v) => set("contact.address", v)} />
          </div>
          <Field
            label="Services offered (comma separated, shown in the contact form dropdown)"
            value={(data.contact?.services || []).join(", ")}
            onChange={(v) => set("contact.services", v.split(",").map((s) => s.trim()).filter(Boolean))}
          />
        </Card>
      )}

      {/* ---------------- SOCIALS ---------------- */}
      {tab === "Socials" && (
        <Card title="Social links" action={<SmallButton onClick={() => addTo("socials", { platform: "github", url: "" })}>+ Add</SmallButton>}>
          {(data.socials || []).map((s, i) => (
            <RepeatItem key={i} onRemove={() => removeFrom("socials", i)}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <label className="flex flex-col gap-1.5">
                  <span className="text-sm text-white/60">Platform</span>
                  <select
                    value={s.platform}
                    onChange={(e) => setItem("socials", i, "platform", e.target.value)}
                    className="bg-[#1c1c22] border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-accent"
                  >
                    {SOCIAL_PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </label>
                <Field label="URL (or email for 'email')" value={s.url} onChange={(v) => setItem("socials", i, "url", v)} />
              </div>
            </RepeatItem>
          ))}
        </Card>
      )}
    </div>
  );
}
