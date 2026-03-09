import { useState, useRef, useEffect } from "react";
import Sidebar from "../Sidebar/Sidebar";
import Navbar from "../Navbar/Navbar";
import { useResume } from "../../context/ResumeContext";

const PRINT_CSS = `
@page { size: A4; margin: 15mm; }
@media print {
  /* general */
  html, body { height: auto; -webkit-print-color-adjust: exact; }
  /* Make resume card fill the page width cleanly */
  .resume-card { 
    box-shadow: none !important;
    border-radius: 0 !important;
    width: auto !important;
    max-width: 100% !important;
    margin: 0 !important;
    padding: 12mm !important;
    color: #111827 !important;
    background: #fff !important;
  }

  /* Keep sections together, avoid awkward page breaks */
  .resume-section { 
    page-break-inside: avoid !important; 
    break-inside: avoid !important;
    -webkit-column-break-inside: avoid !important;
    margin-bottom: 6mm !important;
  }

  /* Tweak separators and heading spacing for print */
  .resume-card hr { border-top: 1px solid #d1d5db !important; margin: 6mm 0 !important; }
  .resume-section .sectionTitle { page-break-after: avoid !important; }

  /* hide ui-only elements */
  .no-print { display: none !important; }

  /* preserve bullets / inline layout */
  .resume-card span, .resume-card div { orphans: 3; widows: 3; }

  /* ensure links print nicely */
  a { color: inherit !important; text-decoration: none !important; }

  /* avoid clipping from fixed/absolute positioned elements outside resume */
  body > *:not(.resume-card) { display: none; }
}
`;


// Icons
import {
  FaLinkedin,
  FaGithub,
  FaGlobe,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
} from "react-icons/fa";

const DEFAULT_RESUME = {
  name: "",
  role: "",
  phone: "",
  email: "",
  linkedin: "",
  location: "",
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

const safeArray = (val) => (Array.isArray(val) ? val : []);

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

const DUMMY_SET = new Set(DUMMY_STRINGS);

const hasText = (val) => {
  if (typeof val !== "string") return false;
  const trimmed = val.trim();
  if (!trimmed) return false;
  const lower = trimmed.toLowerCase();
  if (trimmed === "-" || lower === "n/a" || lower === "na") return false;
  if (DUMMY_SET.has(lower)) return false;
  return true;
};

const cleanString = (val) => {
  if (!hasText(val)) return "";
  return val.trim();
};

const hasNonEmptyStringArray = (arr) =>
  safeArray(arr).some((v) => hasText(v));

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
  const data = {
    ...DEFAULT_RESUME,
    ...(raw || {}),
  };

  data.skills = safeArray(data.skills).filter(hasText);

  data.experience = safeArray(data.experience).map((exp) => ({
    title: cleanString(exp?.title),
    companyName: cleanString(exp?.companyName),
    date: cleanString(exp?.date),
    companyLocation: cleanString(exp?.companyLocation),
    accomplishment: safeArray(exp?.accomplishment).filter(hasText),
  }));

  data.education = safeArray(data.education).map((edu) => ({
    degree: cleanString(edu?.degree),
    institution: cleanString(edu?.institution),
    duration: cleanString(edu?.duration),
    location: cleanString(edu?.location),
  }));

  data.projects = safeArray(data.projects).map((p) => ({
    name: cleanString(p?.name),
    description: cleanString(p?.description),
    technologies: safeArray(p?.technologies).filter(hasText),
    link: cleanString(p?.link),
    github: cleanString(p?.github || p?.githubLink),
  }));

  data.certifications = safeArray(data.certifications).map((c) => ({
    title: cleanString(c?.title),
    issuer: cleanString(c?.issuer),
    date: cleanString(c?.date),
  }));

  data.achievements = safeArray(data.achievements).filter(hasText);
  data.languages = safeArray(data.languages).filter(hasText);
  data.interests = safeArray(data.interests).filter(hasText);

  // summary & basic contact fields
  data.summary = cleanString(data.summary);
  data.name = cleanString(data.name);
  data.role = cleanString(data.role);
  data.phone = cleanString(data.phone);
  data.email = cleanString(data.email);
  data.linkedin = cleanString(data.linkedin);
  data.github = cleanString(data.github);
  data.portfolio = cleanString(data.portfolio);
  data.location = cleanString(data.location);

  return data;
};

const Template7 = () => {
  const resumeRef = useRef(null);
  const { resumeData, setResumeData } = useResume();
  const [editMode, setEditMode] = useState(false);
  const [localData, setLocalData] = useState(() => normalizeData(resumeData));

  useEffect(() => {
    setLocalData(normalizeData(resumeData));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumeData]);

  // ===== FIXED persist: keep raw localData for UI, store cleaned to localStorage =====
  const persist = (updatedData) => {
    // keep raw data in state so new empty rows remain visible in edit mode
    setLocalData(updatedData);

    // write cleaned to localStorage (so saved resume has no placeholders)
    try {
      const cleaned = normalizeData(updatedData);
      localStorage.setItem("resumeData", JSON.stringify(cleaned));
    } catch (e) {
      console.error("Template7 localStorage error:", e);
    }
  };

  const handleFieldChange = (field, value) => {
    const updatedData = { ...localData, [field]: value };
    persist(updatedData);
  };

  const handleArrayFieldChange = (section, index, key, value) => {
    const current = safeArray(localData[section]);
    const updated = [...current];
    if (!updated[index]) updated[index] = {};
    updated[index] = { ...updated[index], [key]: value };
    const updatedData = { ...localData, [section]: updated };
    persist(updatedData);
  };

  const handleArrayStringChange = (section, index, value) => {
    const arr = [...safeArray(localData[section])];
    arr[index] = value;
    const updatedData = { ...localData, [section]: arr };
    persist(updatedData);
  };

  const handleSkillChange = (index, value) => {
    const skills = [...safeArray(localData.skills)];
    skills[index] = value;
    persist({ ...localData, skills });
  };

  const handleAddSection = (section) => {
    const templates = {
      experience: {
        title: "",
        companyName: "",
        date: "",
        companyLocation: "",
        accomplishment: [],
      },
      education: {
        degree: "",
        institution: "",
        duration: "",
        location: "",
      },
      projects: {
        name: "",
        description: "",
        technologies: [],
        link: "",
        github: "",
      },
      certifications: {
        title: "",
        issuer: "",
        date: "",
      },
      skills: "",
      achievements: "",
      languages: "",
      interests: "",
    };

    const newItem = templates[section];
    const current = safeArray(localData[section]);
    const updatedData = { ...localData, [section]: [...current, newItem] };
    persist(updatedData);
  };

  const handleRemoveSection = (section, index) => {
    const current = safeArray(localData[section]);
    const updated = current.filter((_, i) => i !== index);
    persist({ ...localData, [section]: updated });
  };

  const handleClearSection = (section) => {
    persist({ ...localData, [section]: [] });
  };

  const handleSave = () => {
    const cleaned = normalizeData(localData);
    try {
      setResumeData(cleaned);
      localStorage.setItem("resumeData", JSON.stringify(cleaned));
    } catch (e) {
      console.error("Template7 save error:", e);
    }
    setEditMode(false);
  };

  const handleCancel = () => {
    setLocalData(normalizeData(resumeData));
    setEditMode(false);
  };

  const handleEnhance = () => {
    // placeholder for AI enhance
  };

  // ===== raw vs filtered lists: render raw in edit mode, filtered in view mode =====
  const rawExperience = safeArray(localData.experience);
  const rawEducation = safeArray(localData.education);
  const rawProjects = safeArray(localData.projects);
  const rawCertifications = safeArray(localData.certifications);
  const rawAchievements = safeArray(localData.achievements);
  const rawLanguages = safeArray(localData.languages);
  const rawInterests = safeArray(localData.interests);
  const rawSkills = safeArray(localData.skills);

  const experienceList = rawExperience.filter((exp) => hasExperienceContent(exp));
  const educationList = rawEducation.filter((edu) => hasEducationContent(edu));
  const projectsList = rawProjects.filter((p) => hasProjectContent(p));
  const certificationsList = rawCertifications.filter(
    (c) => hasText(c.title) || hasText(c.issuer) || hasText(c.date)
  );
  const achievementsFiltered = rawAchievements.filter((a) => hasText(a));
  const languagesFiltered = rawLanguages.filter((l) => hasText(l));
  const interestsFiltered = rawInterests.filter((i) => hasText(i));
  const skillsFiltered = rawSkills.filter((s) => hasText(s));

  const displayExperience = editMode ? rawExperience : experienceList;
  const displayEducation = editMode ? rawEducation : educationList;
  const displayProjects = editMode ? rawProjects : projectsList;
  const displayCertifications = editMode ? rawCertifications : certificationsList;
  const displayAchievements = editMode ? rawAchievements : achievementsFiltered;
  const displayLanguages = editMode ? rawLanguages : languagesFiltered;
  const displayInterests = editMode ? rawInterests : interestsFiltered;
  const displaySkills = editMode ? rawSkills : skillsFiltered;

  const styles = {
    container: {
      minHeight: "100vh",
      backgroundColor: "#f9fafb",
      display: "flex",
      flexDirection: "column",
    },
    wrapper: {
      display: "flex",
      flexGrow: 1,
    },
    main: {
      flexGrow: 1,
      padding: "3rem",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    },
    card: {
      backgroundColor: "#ffffff",
      color: "#1f2937",
      width: "100%",
      maxWidth: "64rem",
      padding: "2rem",
      borderRadius: "1rem",
      boxShadow: "0 10px 15px rgba(0, 0, 0, 0.05)",
    },
    headerRow: {
      display: "flex",
      justifyContent: "space-between",
      marginBottom: "1.5rem",
      alignItems: "flex-start",
      gap: "1rem",
    },
    nameBlock: {
      flex: "1 1 60%",
      minWidth: 0,
    },
    name: {
      fontSize: "2rem",
      fontWeight: "700",
      marginBottom: "0.25rem",
      letterSpacing: "0",
    },
    role: {
      fontSize: "1.125rem",
      color: "#6b7280",
    },
    contact: {
      flex: "0 0 36%",
      textAlign: "right",
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-end",
      gap: "0.35rem",
    },
    iconWithText: {
      display: "flex",
      alignItems: "center",
      gap: "0.15rem",
      marginBottom: "0.15rem",
      justifyContent: "flex-end",
      fontSize: "0.9rem",
      color: "#4b5563",
    },
    section: {
      marginBottom: "1.6rem",
    },
    sectionTitle: {
      fontSize: "1.15rem",
      fontWeight: 700,
      marginBottom: "0.45rem",
      color: "#111827",
    },
    divider: {
      border: "none",
      borderTop: "1px solid #d1d5db",
      margin: "0 0 0.75rem",
    },
    input: {
      width: "100%",
      marginBottom: "0.5rem",
      padding: "0.5rem",
      border: "1px solid #d1d5db",
      borderRadius: "0.375rem",
      fontSize: "0.95rem",
    },
    textarea: {
      width: "100%",
      minHeight: "4rem",
      marginBottom: "0.5rem",
      padding: "0.5rem",
      border: "1px solid #d1d5db",
      borderRadius: "0.375rem",
      resize: "vertical",
      fontSize: "0.95rem",
    },
    smallButtonDashed: {
      fontSize: "0.8rem",
      color: "#111827",
      background: "none",
      border: "1px dashed #d1d5db",
      padding: "0.25rem 0.6rem",
      borderRadius: "999px",
      cursor: "pointer",
    },
    smallDangerBtn: {
      fontSize: "0.8rem",
      color: "#ef4444",
      background: "none",
      border: "none",
      cursor: "pointer",
    },
    actions: {
      textAlign: "center",
      marginTop: "1.5rem",
    },
    button: {
      padding: "0.6rem 1.2rem",
      border: "none",
      borderRadius: "0.5rem",
      fontWeight: "500",
      cursor: "pointer",
      marginRight: "0.5rem",
    },
    editBtn: {
      backgroundColor: "#3b82f6",
      color: "#fff",
    },
    saveBtn: {
      backgroundColor: "#10b981",
      color: "#fff",
    },
    cancelBtn: {
      backgroundColor: "#6b7280",
      color: "#fff",
    },
  };

  return (
    <div style={styles.container}>
      <style>{PRINT_CSS}</style>
      <Navbar />
      <div style={styles.wrapper}>
        <Sidebar onEnhance={handleEnhance} resumeRef={resumeRef} />
        <div style={styles.main}>
          <div ref={resumeRef} className="resume-card" style={styles.card}>
            {/* Header */}
            <div className="resume-section" style={styles.headerRow}>
              <div className="resume-section" style={styles.nameBlock}>
                {editMode ? (
                  <>
                    <input
                      value={localData.name}
                      onChange={(e) => handleFieldChange("name", e.target.value)}
                      placeholder="Full name"
                      style={styles.input}
                    />
                    <input
                      value={localData.role}
                      onChange={(e) => handleFieldChange("role", e.target.value)}
                      placeholder="Professional title"
                      style={styles.input}
                    />
                  </>
                ) : (
                  <>
                    <h1 style={styles.name}>{(localData.name || "").toUpperCase()}</h1>
                    {localData.role && <div style={styles.role}>{localData.role}</div>}
                  </>
                )}
              </div>

              <div className="resume-section" style={styles.contact}>
                {editMode ? (
                  <>
                    <div style={{ display: "flex", gap: "0.6rem", width: "100%", justifyContent: "flex-end", flexWrap: "wrap" }}>
                      <input
                        value={localData.email}
                        onChange={(e) => handleFieldChange("email", e.target.value)}
                        placeholder="Email"
                        style={{ ...styles.input, minWidth: 160 }}
                      />
                      <input
                        value={localData.phone}
                        onChange={(e) => handleFieldChange("phone", e.target.value)}
                        placeholder="Phone"
                        style={{ ...styles.input, minWidth: 120 }}
                      />
                      <input
                        value={localData.location}
                        onChange={(e) => handleFieldChange("location", e.target.value)}
                        placeholder="Location"
                        style={{ ...styles.input, minWidth: 140 }}
                      />
                      <input
                        value={localData.linkedin}
                        onChange={(e) => handleFieldChange("linkedin", e.target.value)}
                        placeholder="LinkedIn URL"
                        style={{ ...styles.input, minWidth: 160 }}
                      />
                      <input
                        value={localData.github}
                        onChange={(e) => handleFieldChange("github", e.target.value)}
                        placeholder="GitHub URL"
                        style={{ ...styles.input, minWidth: 160 }}
                      />
                      <input
                        value={localData.portfolio}
                        onChange={(e) => handleFieldChange("portfolio", e.target.value)}
                        placeholder="Portfolio URL"
                        style={{ ...styles.input, minWidth: 160 }}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    {localData.email && (
                      <div className="resume-section" style={styles.iconWithText}>
                        <FaEnvelope />
                        <a href={`mailto:${localData.email}`} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}>
                          {localData.email}
                        </a>
                      </div>
                    )}
                    {localData.phone && (
                      <div className="resume-section" style={styles.iconWithText}>
                        <FaPhone /> <span>{localData.phone}</span>
                      </div>
                    )}
                    {localData.location && (
                      <div className="resume-section" style={styles.iconWithText}>
                        <FaMapMarkerAlt /> <span>{localData.location}</span>
                      </div>
                    )}
                    {localData.linkedin && (
                      <div className="resume-section" style={styles.iconWithText}>
                        <FaLinkedin />
                        <a href={localData.linkedin} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}>
                          LinkedIn
                        </a>
                      </div>
                    )}
                    {localData.github && (
                      <div className="resume-section" style={styles.iconWithText}>
                        <FaGithub />
                        <a href={localData.github} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}>
                          GitHub
                        </a>
                      </div>
                    )}
                    {localData.portfolio && (
                      <div className="resume-section" style={styles.iconWithText}>
                        <FaGlobe />
                        <a href={localData.portfolio} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}>
                          Portfolio
                        </a>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            <hr className="resume-section" style={styles.divider} />

            {/* Summary */}
            {(editMode || hasText(localData.summary)) && (
              <div style={styles.section}>
                <div style={styles.sectionTitle}>Summary</div>
                <hr style={styles.divider} />
                {editMode ? (
                  <textarea
                    value={localData.summary}
                    onChange={(e) => handleFieldChange("summary", e.target.value)}
                    placeholder="Short summary about you"
                    style={styles.textarea}
                  />
                ) : (
                  <div style={{ color: "#374151", lineHeight: 1.6 }}>{localData.summary}</div>
                )}
              </div>
            )}

            {/* Skills */}
            {(editMode || displaySkills.length > 0) && (
              <div style={styles.section}>
                <div style={styles.sectionTitle}>Skills</div>
                <hr style={styles.divider} />
                {editMode ? (
                  <>
                    {displaySkills.map((skill, idx) => (
                      <div key={idx} style={{ display: "flex", alignItems: "center", marginBottom: "0.35rem" }}>
                        <input
                          type="text"
                          value={skill}
                          onChange={(e) => handleSkillChange(idx, e.target.value)}
                          placeholder="Skill"
                          style={styles.input}
                        />
                        <button type="button" onClick={() => handleRemoveSection("skills", idx)} style={{ marginLeft: 8, border: "none", background: "none", color: "#ef4444", cursor: "pointer" }}>
                          ✕
                        </button>
                      </div>
                    ))}
                    <div style={{ marginTop: 8, display: "flex", gap: "0.75rem" }}>
                      <button type="button" onClick={() => handleAddSection("skills")} style={styles.smallButtonDashed}>
                        + Add Skill
                      </button>
                      {displaySkills.length > 0 && (
                        <button type="button" onClick={() => handleClearSection("skills")} style={styles.smallDangerBtn}>
                          Remove Skills
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  <div>
                    {displaySkills.map((skill, idx) => (
                      <div key={idx} style={{ display: "flex", alignItems: "baseline", gap: "0.35rem", fontSize: "0.95rem", color: "#374151", marginBottom: "0.2rem" }}>
                        <span style={{ fontSize: "0.95rem" }}>•</span>
                        <span>{skill}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Education */}
            {(editMode || displayEducation.length > 0) && (
              <div style={styles.section}>
                <div style={styles.sectionTitle}>Education</div>
                <hr style={styles.divider} />
                {editMode ? (
                  <>
                    {displayEducation.length === 0 ? (
                      <div style={{ marginBottom: 8 }}>
                        <div style={{ marginTop: 8, display: "flex", gap: "0.75rem" }}>
                          <button
                            type="button"
                            onClick={() => handleAddSection("education")}
                            style={styles.smallButtonDashed}
                          >
                            + Add Education
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {displayEducation.map((edu, idx) => (
                          <div key={idx} style={{ marginBottom: "0.8rem" }}>
                            <input
                              value={edu.degree}
                              placeholder="Degree"
                              onChange={(e) => handleArrayFieldChange("education", idx, "degree", e.target.value)}
                              style={styles.input}
                            />
                            <input
                              value={edu.institution}
                              placeholder="Institution"
                              onChange={(e) => handleArrayFieldChange("education", idx, "institution", e.target.value)}
                              style={styles.input}
                            />
                            <input
                              value={edu.duration}
                              placeholder="Duration"
                              onChange={(e) => handleArrayFieldChange("education", idx, "duration", e.target.value)}
                              style={styles.input}
                            />
                            <input
                              value={edu.location}
                              placeholder="Location"
                              onChange={(e) => handleArrayFieldChange("education", idx, "location", e.target.value)}
                              style={styles.input}
                            />
                            <div style={{ marginTop: 8, display: "flex", gap: "0.75rem" }}>
                              <button
                                type="button"
                                onClick={() => handleAddSection("education")}
                                style={styles.smallButtonDashed}
                              >
                                + Add Education
                              </button>
                              {displayEducation.length > 0 && (
                                <button
                                  type="button"
                                  onClick={() => handleClearSection("education")}
                                  style={styles.smallDangerBtn}
                                >
                                  Remove Education
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </>
                ) : (
                  displayEducation.map((edu, idx) => (
                    <div key={idx} style={{ color: "#374151", marginBottom: "0.8rem" }}>
                      <div style={{ fontWeight: 700 }}>{edu.degree}</div>
                      <div style={{ color: "#6b7280" }}>{edu.institution} {edu.duration ? `| ${edu.duration}` : ""}</div>
                      {edu.location && <div style={{ color: "#6b7280" }}>{edu.location}</div>}
                    </div>
                  ))
                )}
              </div>
            )}


            {/* Work Experience */}
            {(editMode || displayExperience.length > 0) && (
              <div style={styles.section}>
                <div style={styles.sectionTitle}>Work Experience</div>
                <hr style={styles.divider} />
                {editMode ? (
                  <>
                    {displayExperience.length === 0 ? (
                      <div style={{ marginBottom: 8 }}>
                        <div style={{ marginTop: 8, display: "flex", gap: "0.75rem" }}>
                          <button
                            type="button"
                            onClick={() => handleAddSection("experience")}
                            style={styles.smallButtonDashed}
                          >
                            + Add Experience
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {displayExperience.map((exp, idx) => (
                          <div key={idx} style={{ marginBottom: "0.9rem" }}>
                            <input
                              value={exp.companyName}
                              placeholder="Company Name"
                              onChange={(e) => handleArrayFieldChange("experience", idx, "companyName", e.target.value)}
                              style={styles.input}
                            />
                            <input
                              value={exp.date}
                              placeholder="Duration (YYYY - YYYY)"
                              onChange={(e) => handleArrayFieldChange("experience", idx, "date", e.target.value)}
                              style={styles.input}
                            />
                            <input
                              value={exp.title}
                              placeholder="Job Title"
                              onChange={(e) => handleArrayFieldChange("experience", idx, "title", e.target.value)}
                              style={styles.input}
                            />
                            <input
                              value={exp.companyLocation}
                              placeholder="Location"
                              onChange={(e) => handleArrayFieldChange("experience", idx, "companyLocation", e.target.value)}
                              style={styles.input}
                            />
                            <textarea
                              value={safeArray(exp.accomplishment).join("\n")}
                              placeholder="Responsibilities & achievements (one per line)"
                              onChange={(e) =>
                                handleArrayFieldChange("experience", idx, "accomplishment", e.target.value.split("\n"))
                              }
                              style={styles.textarea}
                            />
                            <div style={{ marginTop: 8, display: "flex", gap: "0.75rem" }}>
                              <button
                                type="button"
                                onClick={() => handleAddSection("experience")}
                                style={styles.smallButtonDashed}
                              >
                                + Add Experience
                              </button>
                              {displayExperience.length > 0 && (
                                <button type="button" onClick={() => handleClearSection("experience")} style={styles.smallDangerBtn}>
                                  Remove Experience
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </>
                ) : (
                  displayExperience.map((exp, idx) => (
                    <div key={idx} style={{ marginBottom: "0.9rem" }}>
                      <div style={{ color: "#374151" }}>
                        <div style={{ fontWeight: 700 }}>{exp.title}</div>
                        <div style={{ color: "#6b7280" }}>{exp.companyName} {exp.date ? `| ${exp.date}` : ""}</div>
                        {exp.companyLocation && <div style={{ color: "#6b7280" }}>{exp.companyLocation}</div>}
                      </div>
                      {safeArray(exp.accomplishment).length > 0 && (
                        <div style={{ marginTop: 8 }}>
                          {safeArray(exp.accomplishment).map((item, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "baseline", gap: "0.3rem", fontSize: "0.95rem", color: "#374151", marginBottom: "0.15rem" }}>
                              <span>•</span>
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}


            {/* Projects */}
            {(editMode || displayProjects.length > 0) && (
              <div style={styles.section}>
                <div style={styles.sectionTitle}>Projects</div>
                <hr style={styles.divider} />
                {editMode ? (
                  <>
                    {displayProjects.length === 0 ? (
                      <div style={{ marginBottom: 8 }}>
                        <div style={{ marginTop: 8, display: "flex", gap: "0.75rem" }}>
                          <button
                            type="button"
                            onClick={() => handleAddSection("projects")}
                            style={styles.smallButtonDashed}
                          >
                            + Add Project
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {displayProjects.map((proj, idx) => (
                          <div key={idx} style={{ marginBottom: "0.8rem" }}>
                            <input
                              value={proj.name}
                              placeholder="Project Name"
                              onChange={(e) => handleArrayFieldChange("projects", idx, "name", e.target.value)}
                              style={styles.input}
                            />
                            <textarea
                              value={proj.description}
                              placeholder="Short project description"
                              onChange={(e) => handleArrayFieldChange("projects", idx, "description", e.target.value)}
                              style={styles.textarea}
                            />
                            <input
                              value={safeArray(proj.technologies).join(", ")}
                              placeholder="Technologies (comma separated)"
                              onChange={(e) =>
                                handleArrayFieldChange("projects", idx, "technologies", e.target.value.split(",").map((t) => t.trim()).filter(Boolean))
                              }
                              style={styles.input}
                            />
                            <input
                              value={proj.link}
                              placeholder="Live link (optional)"
                              onChange={(e) => handleArrayFieldChange("projects", idx, "link", e.target.value)}
                              style={styles.input}
                            />
                            <input
                              value={proj.github}
                              placeholder="GitHub link (optional)"
                              onChange={(e) => handleArrayFieldChange("projects", idx, "github", e.target.value)}
                              style={styles.input}
                            />
                            <div style={{ marginTop: 8, display: "flex", gap: "0.75rem" }}>
                              <button
                                type="button"
                                onClick={() => handleAddSection("projects")}
                                style={styles.smallButtonDashed}
                              >
                                + Add Project
                              </button>
                              {displayProjects.length > 0 && (
                                <button type="button" onClick={() => handleClearSection("projects")} style={styles.smallDangerBtn}>
                                  Remove Projects
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </>
                ) : (
                  displayProjects.map((proj, idx) => (
                    <div key={idx} style={{ color: "#374151", marginBottom: "0.8rem" }}>
                      <div style={{ fontWeight: 700 }}>{proj.name}</div>
                      {proj.description && <div style={{ color: "#374151" }}>{proj.description}</div>}
                      {safeArray(proj.technologies).length > 0 && <div style={{ color: "#6b7280" }}>Tech: {proj.technologies.join(", ")}</div>}
                      {(proj.link || proj.github) && (
                        <div style={{ marginTop: 6 }}>
                          {proj.link && (
                            <a href={proj.link} target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb", marginRight: 8 }}>
                              Live
                            </a>
                          )}
                          {proj.github && (
                            <a href={proj.github} target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb" }}>
                              GitHub
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}


            {/* Certifications */}
            {(editMode || displayCertifications.length > 0) && (
              <div style={styles.section}>
                <div style={styles.sectionTitle}>Certifications</div>
                <hr style={styles.divider} />
                {editMode ? (
                  <>
                    {displayCertifications.length === 0 ? (
                      <div style={{ marginBottom: 8 }}>
                        <div style={{ marginTop: 8, display: "flex", gap: "0.75rem" }}>
                          <button
                            type="button"
                            onClick={() => handleAddSection("certifications")}
                            style={styles.smallButtonDashed}
                          >
                            + Add Certification
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {displayCertifications.map((cert, idx) => (
                          <div key={idx} style={{ marginBottom: 8 }}>
                            <input
                              value={cert.title}
                              placeholder="Certification Title"
                              onChange={(e) => handleArrayFieldChange("certifications", idx, "title", e.target.value)}
                              style={styles.input}
                            />
                            <input
                              value={cert.issuer}
                              placeholder="Issuer"
                              onChange={(e) => handleArrayFieldChange("certifications", idx, "issuer", e.target.value)}
                              style={styles.input}
                            />
                            <input
                              value={cert.date}
                              placeholder="Date"
                              onChange={(e) => handleArrayFieldChange("certifications", idx, "date", e.target.value)}
                              style={styles.input}
                            />
                          </div>
                        ))}
                        <div style={{ marginTop: 8, display: "flex", gap: "0.75rem" }}>
                          <button type="button" onClick={() => handleAddSection("certifications")} style={styles.smallButtonDashed}>
                            + Add Certification
                          </button>
                          {displayCertifications.length > 0 && (
                            <button type="button" onClick={() => handleClearSection("certifications")} style={styles.smallDangerBtn}>
                              Remove Certifications
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div>
                    {displayCertifications.map((cert, idx) => (
                      <div key={idx} style={{ color: "#374151", marginBottom: 6 }}>
                        <div style={{ fontWeight: 700 }}>{cert.title}</div>
                        <div style={{ color: "#6b7280" }}>{cert.issuer} {cert.date ? `| ${cert.date}` : ""}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}


            {/* Achievements */}
            {(editMode || displayAchievements.length > 0) && (
              <div style={styles.section}>
                <div style={styles.sectionTitle}>Achievements</div>
                <hr style={styles.divider} />
                {editMode ? (
                  <>
                    {displayAchievements.map((ach, idx) => (
                      <div key={idx} style={{ display: "flex", alignItems: "center", marginBottom: "0.35rem" }}>
                        <input
                          type="text"
                          value={ach}
                          placeholder="Add achievement"
                          onChange={(e) => handleArrayStringChange("achievements", idx, e.target.value)}
                          style={styles.input}
                        />
                        <button type="button" onClick={() => handleRemoveSection("achievements", idx)} style={{ marginLeft: 8, border: "none", background: "none", color: "#ef4444", cursor: "pointer" }}>
                          ✕
                        </button>
                      </div>
                    ))}
                    <div style={{ marginTop: 8, display: "flex", gap: "0.75rem" }}>
                      <button type="button" onClick={() => handleAddSection("achievements")} style={styles.smallButtonDashed}>
                        + Add Achievement
                      </button>
                      {displayAchievements.length > 0 && (
                        <button type="button" onClick={() => handleClearSection("achievements")} style={styles.smallDangerBtn}>
                          Remove Achievements
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  <div>
                    {displayAchievements.map((ach, idx) => (
                      <div key={idx} style={{ display: "flex", alignItems: "baseline", gap: "0.35rem", fontSize: "0.95rem", color: "#374151", marginBottom: "0.2rem" }}>
                        <span>•</span>
                        <span>{ach}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Languages */}
            {(editMode || displayLanguages.length > 0) && (
              <div style={styles.section}>
                <div style={styles.sectionTitle}>Languages</div>
                <hr style={styles.divider} />
                {editMode ? (
                  <>
                    {displayLanguages.map((lang, idx) => (
                      <div key={idx} style={{ display: "flex", alignItems: "center", marginBottom: "0.35rem" }}>
                        <input
                          type="text"
                          value={lang}
                          placeholder="Language"
                          onChange={(e) => handleArrayStringChange("languages", idx, e.target.value)}
                          style={styles.input}
                        />
                        <button type="button" onClick={() => handleRemoveSection("languages", idx)} style={{ marginLeft: 8, border: "none", background: "none", color: "#ef4444", cursor: "pointer" }}>
                          ✕
                        </button>
                      </div>
                    ))}
                    <div style={{ marginTop: 8, display: "flex", gap: "0.75rem" }}>
                      <button type="button" onClick={() => handleAddSection("languages")} style={styles.smallButtonDashed}>
                        + Add Language
                      </button>
                      {displayLanguages.length > 0 && (
                        <button type="button" onClick={() => handleClearSection("languages")} style={styles.smallDangerBtn}>
                          Remove Languages
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  <div>
                    {displayLanguages.map((lang, idx) => (
                      <div key={idx} style={{ display: "flex", alignItems: "baseline", gap: "0.35rem", fontSize: "0.95rem", color: "#374151", marginBottom: "0.2rem" }}>
                        <span>•</span>
                        <span>{lang}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Interests */}
            {(editMode || displayInterests.length > 0) && (
              <div style={styles.section}>
                <div style={styles.sectionTitle}>Interests</div>
                <hr style={styles.divider} />
                {editMode ? (
                  <>
                    {displayInterests.map((interest, idx) => (
                      <div key={idx} style={{ display: "flex", alignItems: "center", marginBottom: "0.35rem" }}>
                        <input
                          type="text"
                          value={interest}
                          placeholder="Interest"
                          onChange={(e) => handleArrayStringChange("interests", idx, e.target.value)}
                          style={styles.input}
                        />
                        <button type="button" onClick={() => handleRemoveSection("interests", idx)} style={{ marginLeft: 8, border: "none", background: "none", color: "#ef4444", cursor: "pointer" }}>
                          ✕
                        </button>
                      </div>
                    ))}
                    <div style={{ marginTop: 8, display: "flex", gap: "0.75rem" }}>
                      <button type="button" onClick={() => handleAddSection("interests")} style={styles.smallButtonDashed}>
                        + Add Interest
                      </button>
                      {displayInterests.length > 0 && (
                        <button type="button" onClick={() => handleClearSection("interests")} style={styles.smallDangerBtn}>
                          Remove Interests
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  <div>
                    {displayInterests.map((interest, idx) => (
                      <div key={idx} style={{ display: "flex", alignItems: "baseline", gap: "0.35rem", fontSize: "0.95rem", color: "#374151", marginBottom: "0.2rem" }}>
                        <span>•</span>
                        <span>{interest}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div style={styles.actions}>
            {editMode ? (
              <>
                <button type="button" onClick={handleSave} style={{ ...styles.button, ...styles.saveBtn }}>
                  Save
                </button>
                <button type="button" onClick={handleCancel} style={{ ...styles.button, ...styles.cancelBtn }}>
                  Cancel
                </button>
              </>
            ) : (
              <button type="button" onClick={() => setEditMode(true)} style={{ ...styles.button, ...styles.editBtn }}>
                Edit
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Template7;
