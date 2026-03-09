import { useState, useRef, useEffect } from "react";
import Sidebar from "../Sidebar/Sidebar";
import Navbar from "../Navbar/Navbar";
import { useResume } from "../../context/ResumeContext";

/*
  Template4.jsx — final updated version
  - Auto-cleans stored resumeData on mount and when context changes (safe, non-destructive)
  - Hides entire sections in view mode when they are empty
  - Prevents duplicate Add buttons (top Add only when empty; bottom controls only when items exist)
  - Projects inputs are stacked full-width (no overlap)
  - After Save localData is replaced with cleaned data so empty placeholders do not reappear
  - All add/remove/clear controls are wired and use type="button"
*/

const DEFAULT_RESUME = {
  name: "",
  role: "",
  phone: "",
  email: "",
  location: "",
  linkedin: "",
  github: "",
  portfolio: "",
  summary: "",
  skills: [],
  experience: [],
  education: [],
  projects: [],
  certifications: [],
  achievements: [],
  languages: [],
  interests: [],
};

const safeArray = (v) => (Array.isArray(v) ? v : []);

const DUMMY_STRINGS = [
  "company name",
  "job title",
  "yyyy - yyyy",
  "city, country",
  "describe your work here.",
  "degree",
  "institution",
  "project name",
  "short project description.",
  "new skill",
  "new achievement",
  "new language",
  "new interest",
];

const DUMMY_SET = new Set(DUMMY_STRINGS.map((s) => s.toLowerCase()));

const hasText = (val) => {
  if (typeof val !== "string") return false;
  const t = val.trim();
  if (!t) return false;
  const low = t.toLowerCase();
  if (t === "-" || low === "n/a" || low === "na") return false;
  if (DUMMY_SET.has(low)) return false;
  return true;
};

const cleanString = (v) => (hasText(v) ? v.trim() : "");

const hasNonEmptyStringArray = (arr) => safeArray(arr).some((s) => hasText(s));

const hasExperienceContent = (exp) =>
  hasText(exp?.companyName) ||
  hasText(exp?.title) ||
  hasText(exp?.date) ||
  hasText(exp?.companyLocation) ||
  hasNonEmptyStringArray(exp?.accomplishment);

const hasEducationContent = (edu) =>
  hasText(edu?.institution) ||
  hasText(edu?.degree) ||
  hasText(edu?.duration) ||
  hasText(edu?.location);

const hasProjectContent = (p) =>
  hasText(p?.name) ||
  hasText(p?.description) ||
  hasNonEmptyStringArray(p?.technologies) ||
  hasText(p?.link) ||
  hasText(p?.github);

const normalizeData = (raw) => {
  const data = { ...DEFAULT_RESUME, ...(raw || {}) };

  data.name = cleanString(data.name);
  data.role = cleanString(data.role);
  data.phone = cleanString(data.phone);
  data.email = cleanString(data.email);
  data.location = cleanString(data.location);
  data.linkedin = cleanString(data.linkedin);
  data.github = cleanString(data.github);
  data.portfolio = cleanString(data.portfolio);
  data.summary = cleanString(data.summary);

  data.skills = safeArray(data.skills).filter(hasText);

  data.experience = safeArray(data.experience).map((exp) => ({
    title: cleanString(exp?.title),
    date: cleanString(exp?.date),
    companyName: cleanString(exp?.companyName),
    companyLocation: cleanString(exp?.companyLocation),
    accomplishment: safeArray(exp?.accomplishment).filter(hasText),
  }));

  data.education = safeArray(data.education).map((edu) => ({
    degree: cleanString(edu?.degree),
    duration: cleanString(edu?.duration),
    institution: cleanString(edu?.institution),
    location: cleanString(edu?.location),
  }));

  data.projects = safeArray(data.projects).map((p) => ({
    name: cleanString(p?.name),
    description: cleanString(p?.description),
    technologies: safeArray(p?.technologies).filter(hasText),
    link: cleanString(p?.link),
    github: cleanString(p?.github),
  }));

  data.certifications = safeArray(data.certifications).map((c) => ({
    title: cleanString(c?.title),
    issuer: cleanString(c?.issuer),
    date: cleanString(c?.date),
  }));

  data.achievements = safeArray(data.achievements).filter(hasText);
  data.languages = safeArray(data.languages).filter(hasText);
  data.interests = safeArray(data.interests).filter(hasText);

  return data;
};

const Template4 = () => {
  const resumeRef = useRef(null);
  const { resumeData, setResumeData } = useResume();

  const [editMode, setEditMode] = useState(false);
  const [localData, setLocalData] = useState(() => normalizeData(resumeData || {}));

  // Single effect: auto-clean stored resumeData (safe) and sync localData when resumeData changes.
  useEffect(() => {
    try {
      const key = "resumeData";
      const raw = localStorage.getItem(key);
      if (!raw) {
        // No saved data, use context
        setLocalData(normalizeData(resumeData || {}));
        return;
      }

      let parsed;
      try {
        parsed = JSON.parse(raw);
      } catch {
        // corrupted, replace with normalized context
        const fromContext = normalizeData(resumeData || {});
        localStorage.setItem(key, JSON.stringify(fromContext));
        setLocalData(fromContext);
        if (typeof setResumeData === "function") setResumeData(fromContext);
        return;
      }

      const cleaned = normalizeData(parsed);
      const rawStr = JSON.stringify(parsed);
      const cleanStr = JSON.stringify(cleaned);

      if (rawStr !== cleanStr) {
        // write cleaned back and update context & local state
        localStorage.setItem(key, cleanStr);
        setLocalData(cleaned);
        if (typeof setResumeData === "function") setResumeData(cleaned);
      } else {
        // nothing to change; prefer context if present, otherwise stored
        setLocalData(normalizeData(resumeData || parsed || {}));
      }
    } catch (err) {
      console.error("Auto-clean failed:", err);
      setLocalData(normalizeData(resumeData || {}));
    }
    // runs on mount and whenever resumeData changes from context
  }, [resumeData, setResumeData]);

  // persist: keep raw localData for edit UI; write cleaned to localStorage for storage
  const persist = (updatedData) => {
    setLocalData(updatedData);
    try {
      const cleaned = normalizeData(updatedData);
      localStorage.setItem("resumeData", JSON.stringify(cleaned));
    } catch (e) {
      console.error("persist error", e);
    }
  };

  const handleFieldChange = (field, value) => persist({ ...localData, [field]: value });

  // For object-array fields (experience, education, projects, certifications)
  const handleArrayFieldChange = (arrayField, index, subField, value) => {
    const arr = [...safeArray(localData[arrayField])];
    if (!arr[index]) arr[index] = {};
    arr[index] = { ...arr[index], [subField]: value };
    persist({ ...localData, [arrayField]: arr });
  };

  // For list fields stored as string array inside objects (accomplishments)
  const handleArrayListChange = (arrayField, index, listField, value) => {
    const arr = [...safeArray(localData[arrayField])];
    if (!arr[index]) arr[index] = {};
    arr[index] = { ...arr[index], [listField]: value.split("\n").map((s) => s.trim()).filter(Boolean) };
    persist({ ...localData, [arrayField]: arr });
  };

  // For sections that are arrays of strings (achievements, languages, interests, skills)
  const handleArrayStringChange = (arrayField, index, value) => {
    const arr = [...safeArray(localData[arrayField])];
    arr[index] = value;
    persist({ ...localData, [arrayField]: arr });
  };

  const handleProjectTechsChange = (index, csv) => {
    const arr = [...safeArray(localData.projects)];
    if (!arr[index]) arr[index] = {};
    arr[index].technologies = csv.split(",").map((s) => s.trim()).filter(Boolean);
    persist({ ...localData, projects: arr });
  };

  const handleSkillChange = (index, value) => {
    const arr = [...safeArray(localData.skills)];
    arr[index] = value;
    persist({ ...localData, skills: arr });
  };

  const handleAddSection = (section) => {
    const templates = {
      experience: { title: "", date: "", companyName: "", companyLocation: "", accomplishment: [] },
      education: { degree: "", duration: "", institution: "", location: "" },
      projects: { name: "", description: "", technologies: [], link: "", github: "" },
      certifications: { title: "", issuer: "", date: "" },
      skills: "",
      achievements: "",
      languages: "",
      interests: "",
    };
    const current = safeArray(localData[section]);
    persist({ ...localData, [section]: [...current, templates[section]] });
  };

  const handleRemoveSection = (section, idx) => {
    const arr = safeArray(localData[section]).filter((_, i) => i !== idx);
    persist({ ...localData, [section]: arr });
  };

  const handleClearSection = (section) => persist({ ...localData, [section]: [] });

  const handleSave = () => {
    const cleaned = normalizeData(localData);
    setResumeData(cleaned);
    try {
      localStorage.setItem("resumeData", JSON.stringify(cleaned));
    } catch (e) {
      console.error("save error", e);
    }
    // set localData to cleaned so no placeholders exist after save
    setLocalData(cleaned);
    setEditMode(false);
  };

  const handleCancel = () => {
    setLocalData(normalizeData(resumeData || {}));
    setEditMode(false);
  };

  // Raw arrays (from localData)
  const rawExperience = safeArray(localData.experience);
  const rawEducation = safeArray(localData.education);
  const rawProjects = safeArray(localData.projects);
  const rawCertifications = safeArray(localData.certifications);
  const rawAchievements = safeArray(localData.achievements);
  const rawLanguages = safeArray(localData.languages);
  const rawInterests = safeArray(localData.interests);
  const rawSkills = safeArray(localData.skills);

  // Filtered versions for view mode
  const expFiltered = rawExperience.filter((e) => hasExperienceContent(e));
  const eduFiltered = rawEducation.filter((ed) => hasEducationContent(ed));
  const projFiltered = rawProjects.filter((p) => hasProjectContent(p));
  const certFiltered = rawCertifications.filter((c) => hasText(c.title) || hasText(c.issuer) || hasText(c.date));
  const achFiltered = rawAchievements.filter((a) => hasText(a));
  const langFiltered = rawLanguages.filter((l) => hasText(l));
  const intFiltered = rawInterests.filter((i) => hasText(i));
  const skillsFiltered = rawSkills.filter((s) => hasText(s));

  // displayXxx picks raw in edit mode and filtered in view mode
  const displayExperience = editMode ? rawExperience : expFiltered;
  const displayEducation = editMode ? rawEducation : eduFiltered;
  const displayProjects = editMode ? rawProjects : projFiltered;
  const displayCertifications = editMode ? rawCertifications : certFiltered;
  const displayAchievements = editMode ? rawAchievements : achFiltered;
  const displayLanguages = editMode ? rawLanguages : langFiltered;
  const displayInterests = editMode ? rawInterests : intFiltered;
  const displaySkills = editMode ? rawSkills : skillsFiltered;

  const styles = {
    pageWrap: { flexGrow: 1, padding: "2.5rem", display: "flex", flexDirection: "column", alignItems: "center" },
    resumeCard: {
      fontFamily: "Arial, sans-serif",
      width: "210mm",
      minHeight: "210mm",
      maxWidth: "800px",
      margin: "0 auto",
      padding: "30px",
      background: "linear-gradient(to bottom right, #ffffff, #f3f4f6)",
      color: "#333",
      boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
      borderRadius: "10px",
      border: "1px solid #e5e7eb",
      boxSizing: "border-box",
    },
    sectionTitle: { fontSize: "18px", fontWeight: 600, color: "#00796b", textTransform: "uppercase", borderBottom: "2px solid #b2dfdb", paddingBottom: "6px", marginBottom: "12px", letterSpacing: "1px" },
    input: { border: "1px solid #ccc", padding: "8px 10px", marginBottom: "8px", borderRadius: "6px", fontSize: "14px", width: "100%", boxSizing: "border-box" },
    textarea: { width: "100%", minHeight: 80, border: "1px solid #ccc", borderRadius: 8, padding: 10, fontSize: 14, resize: "vertical", boxSizing: "border-box" },
    dashedBtn: { border: "1px dashed #b2dfdb", background: "none", padding: "6px 10px", borderRadius: "999px", cursor: "pointer" },
    smallDanger: { border: "none", background: "none", color: "#ef4444", cursor: "pointer" },
    pill: { backgroundColor: "#00796b", color: "#fff", padding: "6px 12px", borderRadius: "20px", fontSize: "13px", fontWeight: 500 },
    sectionBottomControls: { marginTop: 8, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" },
  };

  return (
    <div>
      <Navbar />
      <div style={{ display: "flex" }}>
        <Sidebar onEnhance={() => { }} resumeRef={resumeRef} />

        <div style={styles.pageWrap}>
          {/* Print / PDF fixes */}
          <style>{`
            @page { size: A4 portrait; margin: 12mm; }
            @media print {
              /* make the resume use the full printable width and remove decorations */
              .resume-card {
                width: auto !important;
                max-width: 100% !important;
                box-shadow: none !important;
                border: none !important;
                background: white !important;
                -webkit-print-color-adjust: exact !important;
                color-adjust: exact !important;
                padding: 12mm !important;
                box-sizing: border-box !important;
              }

              /* avoid splitting the header or any section across pages */
              .resume-card,
              .resume-card > * {
                page-break-inside: avoid;
                break-inside: avoid;
                -webkit-column-break-inside: avoid;
              }

              /* more precise: prevent splitting inside these structural elements */
              .resume-card h1,
              .resume-card h2,
              .resume-card h3,
              .resume-card .section,
              .resume-card .section-block,
              .resume-card textarea,
              .resume-card img {
                page-break-inside: avoid;
                break-inside: avoid;
              }

              /* allow content to flow naturally across pages while preserving section blocks */
              .resume-card .section-content { page-break-inside: auto; }

              /* ensure lists and bullets are printed correctly */
              .resume-card ul, .resume-card li {
                page-break-inside: avoid;
                break-inside: avoid;
              }

              /* ensure images scale correctly */
              .resume-card img, .resume-card svg {
                max-width: 100% !important;
                height: auto !important;
              }

              /* remove visual-only spacing that may cause overflow */
              .resume-card { box-shadow:none; border-radius:0; }

              /* force background colors to print (browser-dependent) */
              * { -webkit-print-color-adjust: exact !important; color-adjust: exact !important; }
            }
          `}</style>

          <div ref={resumeRef} className="resume-card" style={styles.resumeCard}>
            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: 20, borderBottom: `2px solid #14b8a6`, paddingBottom: 20, position: "relative", background: "linear-gradient(to right, #e0f7fa, #ffffff)", borderRadius: 10, paddingTop: 20 }}>
              {editMode ? (
                <>
                  <input type="text" value={localData.name} onChange={(e) => handleFieldChange("name", e.target.value)} placeholder="Full name" style={{ fontSize: 30, fontWeight: "bold", color: "#1e293b", marginBottom: 10, textTransform: "uppercase", textAlign: "center", border: "1px solid #ccc", borderRadius: 6, padding: 10, width: "100%", backgroundColor: "#f0faff", boxSizing: "border-box" }} />
                  <input type="text" value={localData.role} onChange={(e) => handleFieldChange("role", e.target.value)} placeholder="Role" style={{ fontSize: 20, color: "#14b8a6", marginBottom: 10, textTransform: "uppercase", textAlign: "center", border: "1px solid #ccc", borderRadius: 6, padding: 8, width: "100%", backgroundColor: "#f0fdfa", boxSizing: "border-box" }} />
                </>
              ) : (
                <>
                  <h1 style={{ fontSize: 30, fontWeight: "bold", color: "#1e293b", marginBottom: 5, textTransform: "uppercase" }}>{localData.name || resumeData.name}</h1>
                  <h2 style={{ fontSize: 20, color: "#14b8a6", marginBottom: 15, textTransform: "uppercase" }}>{localData.role || resumeData.role}</h2>
                </>
              )}

              <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 20 }}>
                <div style={{ display: "flex", alignItems: "center", fontSize: 14 }}>
                  <span style={{ color: "#ff7b25", marginRight: 5, fontWeight: "bold" }}>📞</span>
                  {editMode ? <input type="text" value={localData.phone} onChange={(e) => handleFieldChange("phone", e.target.value)} placeholder="Phone" style={{ border: "1px solid #ddd", padding: "2px 6px", fontSize: 14 }} /> : <span>{localData.phone || resumeData.phone}</span>}
                </div>

                <div style={{ display: "flex", alignItems: "center", fontSize: 14 }}>
                  <span style={{ color: "#ff7b25", marginRight: 5, fontWeight: "bold" }}>✉️</span>
                  {editMode ? <input type="text" value={localData.email} onChange={(e) => handleFieldChange("email", e.target.value)} placeholder="Email" style={{ border: "1px solid #ddd", padding: "2px 6px", fontSize: 14 }} /> : <span>{localData.email || resumeData.email}</span>}
                </div>

                <div style={{ display: "flex", alignItems: "center", fontSize: 14 }}>
                  <span style={{ color: "#ff7b25", marginRight: 5, fontWeight: "bold" }}>📍</span>
                  {editMode ? <input type="text" value={localData.location} onChange={(e) => handleFieldChange("location", e.target.value)} placeholder="Location" style={{ border: "1px solid #ddd", padding: "2px 6px", fontSize: 14 }} /> : <span>{localData.location || resumeData.location}</span>}
                </div>

                <div style={{ display: "flex", alignItems: "center", fontSize: 14 }}>
                  <span style={{ color: "#ff7b25", marginRight: 5, fontWeight: "bold" }}>🔗</span>
                  {editMode ? <input type="text" value={localData.linkedin} onChange={(e) => handleFieldChange("linkedin", e.target.value)} placeholder="LinkedIn" style={{ border: "1px solid #ddd", padding: "2px 6px", fontSize: 14 }} /> : <span>{localData.linkedin || resumeData.linkedin}</span>}
                </div>

                <div style={{ display: "flex", alignItems: "center", fontSize: 14 }}>
                  <span style={{ color: "#ff7b25", marginRight: 5, fontWeight: "bold" }}>🐙</span>
                  {editMode ? <input type="text" value={localData.github} onChange={(e) => handleFieldChange("github", e.target.value)} placeholder="GitHub" style={{ border: "1px solid #ddd", padding: "2px 6px", fontSize: 14 }} /> : <span>{localData.github || resumeData.github}</span>}
                </div>

                <div style={{ display: "flex", alignItems: "center", fontSize: 14 }}>
                  <span style={{ color: "#ff7b25", marginRight: 5, fontWeight: "bold" }}>🌐</span>
                  {editMode ? <input type="text" value={localData.portfolio} onChange={(e) => handleFieldChange("portfolio", e.target.value)} placeholder="Portfolio" style={{ border: "1px solid #ddd", padding: "2px 6px", fontSize: 14 }} /> : <span>{localData.portfolio || resumeData.portfolio}</span>}
                </div>
              </div>
            </div>

            {/* Summary */}
            <div style={{ marginBottom: 25, position: "relative", padding: 20, borderRadius: 10, background: "linear-gradient(to right, #e0f7fa, #ffffff)" }}>
              <h3 style={{ fontSize: 18, fontWeight: "bold", color: "#ff7b25", textTransform: "uppercase", borderBottom: "1px solid #ccc", paddingBottom: 5, marginBottom: 12 }}>PROFESSIONAL SUMMARY</h3>
              {editMode ? <textarea value={localData.summary} onChange={(e) => handleFieldChange("summary", e.target.value)} style={styles.textarea} /> : <p style={{ margin: 0 }}>{localData.summary || resumeData.summary}</p>}
            </div>

            {/* Skills */}
            <div style={{ marginBottom: 25 }}>
              {(editMode || displaySkills.length > 0) && <h3 style={styles.sectionTitle}>Skills</h3>}
              {editMode ? (
                <>
                  {displaySkills.length === 0 ? (
                    <div style={{ marginBottom: 10 }}>
                      <button type="button" onClick={() => handleAddSection("skills")} style={styles.dashedBtn}>+ Add Skill</button>
                    </div>
                  ) : (
                    <>
                      {displaySkills.map((skill, idx) => (
                        <div key={idx} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                          <input type="text" value={skill} onChange={(e) => handleSkillChange(idx, e.target.value)} placeholder="Skill" style={{ ...styles.input, flex: 1 }} />
                          <button type="button" onClick={() => handleRemoveSection("skills", idx)} style={styles.smallDanger}>✕</button>
                        </div>
                      ))}
                      <div style={styles.sectionBottomControls}>
                        <button type="button" onClick={() => handleAddSection("skills")} style={styles.dashedBtn}>+ Add Skill</button>
                        <button type="button" onClick={() => handleClearSection("skills")} style={styles.smallDanger}>Remove Skills</button>
                      </div>
                    </>
                  )}
                </>
              ) : (
                displaySkills.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 6 }}>
                    {displaySkills.filter(hasText).map((s, i) => <span key={i} style={styles.pill}>{s}</span>)}
                  </div>
                )
              )}
            </div>

            {/* Experience */}
            <div style={{ marginBottom: 25 }}>
              {(editMode || displayExperience.length > 0) && <h3 style={styles.sectionTitle}>Professional Experience</h3>}
              {editMode ? (
                <>
                  {displayExperience.length === 0 ? (
                    <div style={{ marginBottom: 10 }}>
                      <button type="button" onClick={() => handleAddSection("experience")} style={styles.dashedBtn}>+ Add Experience</button>
                    </div>
                  ) : (
                    <>
                      {displayExperience.map((exp, idx) => (
                        <div key={idx} style={{ marginBottom: 16 }}>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 160px", gap: 12, marginBottom: 8 }}>
                            <input type="text" value={exp?.title || ""} onChange={(e) => handleArrayFieldChange("experience", idx, "title", e.target.value)} placeholder="Job Title" style={styles.input} />
                            <input type="text" value={exp?.date || ""} onChange={(e) => handleArrayFieldChange("experience", idx, "date", e.target.value)} placeholder="Date" style={styles.input} />
                          </div>

                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 8 }}>
                            <input type="text" value={exp?.companyName || ""} onChange={(e) => handleArrayFieldChange("experience", idx, "companyName", e.target.value)} placeholder="Company Name" style={styles.input} />
                            <input type="text" value={exp?.companyLocation || ""} onChange={(e) => handleArrayFieldChange("experience", idx, "companyLocation", e.target.value)} placeholder="Location" style={styles.input} />
                          </div>

                          <textarea value={safeArray(exp?.accomplishment).join("\n")} onChange={(e) => handleArrayListChange("experience", idx, "accomplishment", e.target.value)} placeholder="Enter accomplishments, one per line" style={styles.textarea} />

                          <div style={styles.sectionBottomControls}>
                            <button type="button" onClick={() => handleAddSection("experience")} style={styles.dashedBtn}>+ Add Experience</button>
                            <button type="button" onClick={() => handleRemoveSection("experience", idx)} style={styles.smallDanger}>Remove This</button>
                            <button type="button" onClick={() => handleClearSection("experience")} style={styles.smallDanger}>Remove All</button>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </>
              ) : (
                displayExperience.length > 0 && displayExperience.map((exp, idx) => (
                  <div key={idx} style={{ marginBottom: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontWeight: 600 }}>
                      <span>{exp.title}</span>
                      <span>{exp.date}</span>
                    </div>
                    <div style={{ fontStyle: "italic", color: "#555", marginBottom: 8 }}>{exp.companyName}{exp.companyLocation ? `, ${exp.companyLocation}` : ""}</div>
                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                      {safeArray(exp.accomplishment).filter(hasText).map((a, i) => <li key={i} style={{ marginBottom: 6 }}>{a}</li>)}
                    </ul>
                  </div>
                ))
              )}
            </div>


            {/* Education */}
            <div style={{ marginBottom: 25 }}>
              {(editMode || displayEducation.length > 0) && <h3 style={styles.sectionTitle}>Education</h3>}
              {editMode ? (
                <>
                  {displayEducation.length === 0 ? (
                    <div style={{ marginBottom: 10 }}>
                      <button type="button" onClick={() => handleAddSection("education")} style={styles.dashedBtn}>+ Add Education</button>
                    </div>
                  ) : (
                    <>
                      {displayEducation.map((edu, idx) => (
                        <div key={idx} style={{ marginBottom: 16 }}>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 160px", gap: 12, marginBottom: 8 }}>
                            <input type="text" value={edu?.degree || ""} onChange={(e) => handleArrayFieldChange("education", idx, "degree", e.target.value)} placeholder="Degree" style={styles.input} />
                            <input type="text" value={edu?.duration || ""} onChange={(e) => handleArrayFieldChange("education", idx, "duration", e.target.value)} placeholder="Duration" style={styles.input} />
                          </div>

                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 8 }}>
                            <input type="text" value={edu?.institution || ""} onChange={(e) => handleArrayFieldChange("education", idx, "institution", e.target.value)} placeholder="Institution" style={styles.input} />
                            <input type="text" value={edu?.location || ""} onChange={(e) => handleArrayFieldChange("education", idx, "location", e.target.value)} placeholder="Location" style={styles.input} />
                          </div>

                          <div style={styles.sectionBottomControls}>
                            <button type="button" onClick={() => handleAddSection("education")} style={styles.dashedBtn}>+ Add Education</button>
                            <button type="button" onClick={() => handleRemoveSection("education", idx)} style={styles.smallDanger}>Remove This</button>
                            <button type="button" onClick={() => handleClearSection("education")} style={styles.smallDanger}>Remove All</button>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </>
              ) : (
                displayEducation.length > 0 && displayEducation.map((edu, idx) => (
                  <div key={idx} style={{ marginBottom: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontWeight: 600 }}>
                      <span>{edu.degree}</span>
                      <span>{edu.duration}</span>
                    </div>
                    <div style={{ fontStyle: "italic", color: "#555" }}>{edu.institution}{edu.location ? `, ${edu.location}` : ""}</div>
                  </div>
                ))
              )}
            </div>


            {/* Projects */}
            <div style={{ marginBottom: 25 }}>
              {(editMode || displayProjects.length > 0) && <h3 style={styles.sectionTitle}>Projects</h3>}
              {editMode ? (
                <>
                  {displayProjects.length === 0 ? (
                    <div style={{ marginBottom: 10 }}>
                      <button type="button" onClick={() => handleAddSection("projects")} style={styles.dashedBtn}>+ Add Project</button>
                    </div>
                  ) : (
                    <>
                      {displayProjects.map((p, idx) => (
                        <div key={idx} style={{ marginBottom: 16 }}>
                          <input type="text" value={p?.name || ""} placeholder="Project Name" onChange={(e) => handleArrayFieldChange("projects", idx, "name", e.target.value)} style={styles.input} />
                          <textarea value={p?.description || ""} placeholder="Short project description" onChange={(e) => handleArrayFieldChange("projects", idx, "description", e.target.value)} style={styles.textarea} />
                          <input type="text" value={safeArray(p?.technologies).join(", ")} placeholder="Technologies (comma separated)" onChange={(e) => handleProjectTechsChange(idx, e.target.value)} style={styles.input} />
                          <input type="text" value={p?.link || ""} placeholder="Live link (optional)" onChange={(e) => handleArrayFieldChange("projects", idx, "link", e.target.value)} style={styles.input} />
                          <input type="text" value={p?.github || ""} placeholder="GitHub link (optional)" onChange={(e) => handleArrayFieldChange("projects", idx, "github", e.target.value)} style={styles.input} />

                          <div style={styles.sectionBottomControls}>
                            <button type="button" onClick={() => handleAddSection("projects")} style={styles.dashedBtn}>+ Add Project</button>
                            <button type="button" onClick={() => handleRemoveSection("projects", idx)} style={styles.smallDanger}>Remove This</button>
                            <button type="button" onClick={() => handleClearSection("projects")} style={styles.smallDanger}>Remove All</button>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </>
              ) : (
                displayProjects.length > 0 && displayProjects.map((p, idx) => (
                  <div key={idx} style={{ marginBottom: 12 }}>
                    <div style={{ fontWeight: 700 }}>{p.name}</div>
                    {p.description && <div style={{ color: "#333" }}>{p.description}</div>}
                    {safeArray(p.technologies).length > 0 && <div style={{ color: "#6b7280" }}>Tech: {p.technologies.join(", ")}</div>}
                    <div style={{ marginTop: 6 }}>
                      {p.link && <a href={p.link} rel="noreferrer" target="_blank" style={{ marginRight: 8 }}>Live</a>}
                      {p.github && <a href={p.github} rel="noreferrer" target="_blank">GitHub</a>}
                    </div>
                  </div>
                ))
              )}
            </div>


            {/* Certifications */}
            <div style={{ marginBottom: 25 }}>
              {(editMode || displayCertifications.length > 0) && <h3 style={styles.sectionTitle}>Certifications</h3>}
              {editMode ? (
                <>
                  {displayCertifications.length === 0 ? (
                    <div style={{ marginBottom: 10 }}>
                      <button type="button" onClick={() => handleAddSection("certifications")} style={styles.dashedBtn}>+ Add Certification</button>
                    </div>
                  ) : (
                    <>
                      {displayCertifications.map((c, idx) => (
                        <div key={idx} style={{ marginBottom: 12 }}>
                          <input type="text" value={c?.title || ""} placeholder="Certification Title" onChange={(e) => handleArrayFieldChange("certifications", idx, "title", e.target.value)} style={styles.input} />
                          <input type="text" value={c?.issuer || ""} placeholder="Issuer" onChange={(e) => handleArrayFieldChange("certifications", idx, "issuer", e.target.value)} style={styles.input} />
                          <input type="text" value={c?.date || ""} placeholder="Date" onChange={(e) => handleArrayFieldChange("certifications", idx, "date", e.target.value)} style={styles.input} />

                          <div style={styles.sectionBottomControls}>
                            <button type="button" onClick={() => handleAddSection("certifications")} style={styles.dashedBtn}>+ Add Certification</button>
                            <button type="button" onClick={() => handleRemoveSection("certifications", idx)} style={styles.smallDanger}>Remove This</button>
                            <button type="button" onClick={() => handleClearSection("certifications")} style={styles.smallDanger}>Remove All</button>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </>
              ) : (
                displayCertifications.length > 0 && displayCertifications.map((c, idx) => (
                  <div key={idx} style={{ marginBottom: 10 }}>
                    <div style={{ fontWeight: 700 }}>{c.title}</div>
                    <div style={{ color: "#6b7280" }}>{c.issuer} {c.date ? `| ${c.date}` : ""}</div>
                  </div>
                ))
              )}
            </div>

            {/* Achievements */}
            <div style={{ marginBottom: 25 }}>
              {(editMode || displayAchievements.length > 0) && <h3 style={styles.sectionTitle}>Achievements</h3>}
              {editMode ? (
                <>
                  {displayAchievements.length === 0 ? (
                    <div style={{ marginBottom: 10 }}>
                      <button type="button" onClick={() => handleAddSection("achievements")} style={styles.dashedBtn}>+ Add Achievement</button>
                    </div>
                  ) : (
                    <>
                      {displayAchievements.map((a, idx) => (
                        <div key={idx} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                          <input type="text" value={a} placeholder="Achievement" onChange={(e) => handleArrayStringChange("achievements", idx, e.target.value)} style={{ ...styles.input, flex: 1 }} />
                          <button type="button" onClick={() => handleRemoveSection("achievements", idx)} style={styles.smallDanger}>✕</button>
                        </div>
                      ))}
                      <div style={styles.sectionBottomControls}>
                        <button type="button" onClick={() => handleAddSection("achievements")} style={styles.dashedBtn}>+ Add Achievement</button>
                        <button type="button" onClick={() => handleClearSection("achievements")} style={styles.smallDanger}>Remove Achievements</button>
                      </div>
                    </>
                  )}
                </>
              ) : (
                displayAchievements.length > 0 && <ul style={{ margin: 0, paddingLeft: 20 }}>{displayAchievements.map((a, i) => <li key={i} style={{ marginBottom: 6 }}>{a}</li>)}</ul>
              )}
            </div>


            {/* Languages */}
            <div style={{ marginBottom: 25 }}>
              {(editMode || displayLanguages.length > 0) && <h3 style={styles.sectionTitle}>Languages</h3>}
              {editMode ? (
                <>
                  {displayLanguages.length === 0 ? (
                    <div style={{ marginBottom: 10 }}>
                      <button type="button" onClick={() => handleAddSection("languages")} style={styles.dashedBtn}>+ Add Language</button>
                    </div>
                  ) : (
                    <>
                      {displayLanguages.map((l, idx) => (
                        <div key={idx} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                          <input type="text" value={l} placeholder="Language" onChange={(e) => handleArrayStringChange("languages", idx, e.target.value)} style={{ ...styles.input, flex: 1 }} />
                          <button type="button" onClick={() => handleRemoveSection("languages", idx)} style={styles.smallDanger}>✕</button>
                        </div>
                      ))}
                      <div style={styles.sectionBottomControls}>
                        <button type="button" onClick={() => handleAddSection("languages")} style={styles.dashedBtn}>+ Add Language</button>
                        <button type="button" onClick={() => handleClearSection("languages")} style={styles.smallDanger}>Remove Languages</button>
                      </div>
                    </>
                  )}
                </>
              ) : (
                displayLanguages.length > 0 && <ul style={{ margin: 0, paddingLeft: 20 }}>{displayLanguages.map((l, i) => <li key={i} style={{ marginBottom: 6 }}>{l}</li>)}</ul>
              )}
            </div>


            {/* Interests */}
            <div style={{ marginBottom: 25 }}>
              {(editMode || displayInterests.length > 0) && <h3 style={styles.sectionTitle}>Interests</h3>}
              {editMode ? (
                <>
                  {displayInterests.length === 0 ? (
                    <div style={{ marginBottom: 10 }}>
                      <button type="button" onClick={() => handleAddSection("interests")} style={styles.dashedBtn}>+ Add Interest</button>
                    </div>
                  ) : (
                    <>
                      {displayInterests.map((it, idx) => (
                        <div key={idx} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                          <input type="text" value={it} placeholder="Interest" onChange={(e) => handleArrayStringChange("interests", idx, e.target.value)} style={{ ...styles.input, flex: 1 }} />
                          <button type="button" onClick={() => handleRemoveSection("interests", idx)} style={styles.smallDanger}>✕</button>
                        </div>
                      ))}
                      <div style={styles.sectionBottomControls}>
                        <button type="button" onClick={() => handleAddSection("interests")} style={styles.dashedBtn}>+ Add Interest</button>
                        <button type="button" onClick={() => handleClearSection("interests")} style={styles.smallDanger}>Remove Interests</button>
                      </div>
                    </>
                  )}
                </>
              ) : (
                displayInterests.length > 0 && <ul style={{ margin: 0, paddingLeft: 20 }}>{displayInterests.map((it, i) => <li key={i} style={{ marginBottom: 6 }}>{it}</li>)}</ul>
              )}
            </div>


            {/* Footer actions */}
            <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
              {editMode ? (
                <>
                  <button type="button" onClick={handleSave} style={{ backgroundColor: "#16a34a", color: "#fff", padding: "0.5rem 1rem", borderRadius: "0.375rem", margin: "0 0.5rem", border: "none", cursor: "pointer" }}>Save</button>
                  <button type="button" onClick={handleCancel} style={{ backgroundColor: "#9ca3af", color: "#fff", padding: "0.5rem 1rem", borderRadius: "0.375rem", margin: "0 0.5rem", border: "none", cursor: "pointer" }}>Cancel</button>
                </>
              ) : (
                <button type="button" onClick={() => setEditMode(true)} style={{ backgroundColor: "#14b8a6", color: "#fff", padding: "0.5rem 1rem", borderRadius: "0.375rem", margin: "0 0.5rem", border: "none", cursor: "pointer" }}>Edit</button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Template4;
