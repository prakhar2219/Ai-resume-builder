/* eslint-disable no-unused-vars */
import { useState, useRef, useEffect } from "react";
import Sidebar from "../Sidebar/Sidebar";
import Navbar from "../Navbar/Navbar";
import { useResume } from "../../context/ResumeContext";

// ---------- DATA HELPERS ----------

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

// Strings we used earlier as "fake placeholders" – treat them as empty now
const PLACEHOLDERS = new Set([
  "Company Name",
  "Job Title",
  "YYYY - YYYY",
  "City, Country",
  "Describe your work here.",
  "Degree",
  "Institution",
  "Project Name",
  "Short project description.",
  "Tech1",
  "Tech2",
  "Certification Title",
  "Issuer",
  "New Skill",
  "New Achievement",
  "New Language",
  "New Interest",
]);

// Text helper (treats "-", "n/a", placeholder strings as empty)
const hasText = (val) => {
  if (typeof val !== "string") return false;
  const trimmed = val.trim();
  if (!trimmed) return false;
  if (PLACEHOLDERS.has(trimmed)) return false;
  const lower = trimmed.toLowerCase();
  if (trimmed === "-" || lower === "n/a" || lower === "na") return false;
  return true;
};

// Normalize a single text field
const cleanText = (val) => (hasText(val) ? val.trim() : "");


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
    title: cleanText(exp?.title),
    companyName: cleanText(exp?.companyName),
    date: cleanText(exp?.date),
    companyLocation: cleanText(exp?.companyLocation),
    accomplishment: safeArray(exp?.accomplishment).filter(hasText),
  }));


   data.education = safeArray(data.education).map((edu) => ({
    degree: cleanText(edu?.degree),
    institution: cleanText(edu?.institution),
    duration: cleanText(edu?.duration),
    location: cleanText(edu?.location),
  }));


  data.projects = safeArray(data.projects).map((p) => ({
    name: cleanText(p?.name),
    description: cleanText(p?.description),
    technologies: safeArray(p?.technologies).filter(hasText),
    link: cleanText(p?.link),
    github: cleanText(p?.github || p?.githubLink),
  }));


   data.certifications = safeArray(data.certifications).map((c) => ({
    title: cleanText(c?.title),
    issuer: cleanText(c?.issuer),
    date: cleanText(c?.date),
  }));


  data.achievements = safeArray(data.achievements).filter(hasText);
  data.languages = safeArray(data.languages).filter(hasText);
  data.interests = safeArray(data.interests).filter(hasText);

  return data;
};

// ---------- SMALL PRESENTATION HELPERS ----------

const sectionHeadingStyle = {
  fontWeight: "bold",
  fontSize: "1.25rem",
  textTransform: "none",
  letterSpacing: "0",
  color: "#111827",
  marginBottom: "0.5rem",
};


const sectionDividerStyle = {
  border: "none",
  borderTop: "1px solid #e5e7eb",
  margin: "0 0 0.75rem",
};

const Template2 = () => {
  const resumeRef = useRef(null);
  const { resumeData, updateResumeData } = useResume();

  const [editMode, setEditMode] = useState(false);
  const [localData, setLocalData] = useState(() => normalizeData(resumeData));

  useEffect(() => {
    setLocalData(normalizeData(resumeData));
  }, [resumeData]);

  const persist = (updatedData) => {
    setLocalData(updatedData);
    try {
      localStorage.setItem("resumeData", JSON.stringify(updatedData));
    } catch (e) {
      console.error("Template2 localStorage error:", e);
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

    if (key === "accomplishment") {
      updated[index][key] = Array.isArray(value) ? value : [value];
    } else if (key === "technologies") {
      updated[index][key] = Array.isArray(value) ? value : safeArray(value);
    } else {
      updated[index][key] = value;
    }

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
    const updatedData = { ...localData, skills };
    persist(updatedData);
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
    const updatedData = { ...localData, [section]: updated };
    persist(updatedData);
  };

  const handleClearSection = (section) => {
    const updatedData = { ...localData, [section]: [] }
    persist(updatedData)
  }

  const handleSave = () => {
    updateResumeData(localData);
    try {
      localStorage.setItem("resumeData", JSON.stringify(localData));
    } catch (e) {
      console.error("Template2 save error:", e);
    }
    setEditMode(false);
  };

  const handleCancel = () => {
    setLocalData(normalizeData(resumeData));
    setEditMode(false);
  };

  const handleEnhance = () => {
    // placeholder for AI enhance hook
  };

  // ---------- RENDER ----------

  const hasSummary = hasText(localData.summary);

  const experienceList = safeArray(localData.experience).filter(
    (exp) => editMode || hasExperienceContent(exp)
  );
  const educationList = safeArray(localData.education).filter(
    (edu) => editMode || hasEducationContent(edu)
  );
  const projectsList = safeArray(localData.projects).filter(
    (p) => editMode || hasProjectContent(p)
  );
  const certificationsList = safeArray(localData.certifications).filter(
    (c) => editMode || hasText(c.title) || hasText(c.issuer) || hasText(c.date)
  );
  const achievementsList = safeArray(localData.achievements).filter(
    (a) => editMode || hasText(a)
  );
  const languagesList = safeArray(localData.languages).filter(
    (l) => editMode || hasText(l)
  );
  const interestsList = safeArray(localData.interests).filter(
    (i) => editMode || hasText(i)
  );
  const skillsList = safeArray(localData.skills).filter(
    (s) => editMode || hasText(s)
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        backgroundColor: "#f3f4f6",
      }}
    >
      <Navbar />
      <div style={{ display: "flex" }}>
        <Sidebar onEnhance={handleEnhance} resumeRef={resumeRef} />

        <div
          style={{
            flexGrow: 1,
            padding: "1.5rem 0.75rem",
            marginTop: "4rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >

          {/* Resume page */}
          <div
            ref={resumeRef}
            style={{
              backgroundColor: "#ffffff",
              color: "#111827",
              width: "100%",
              maxWidth: "52rem",
              padding: "2.5rem 3rem",
              marginBottom: "2rem",
              boxShadow: "0 20px 45px -30px rgba(15,23,42,0.8)",
            }}
          >
            {/* HEADER */}
            <div
              style={{
                textAlign: "center",
                marginBottom: "1.75rem",
              }}
            >
              {editMode ? (
                <>
                  <input
                    type="text"
                    value={localData.name}
                    onChange={(e) =>
                      handleFieldChange("name", e.target.value)
                    }
                    placeholder="Full Name"
                    style={{
                      fontSize: "2.1rem",
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: "0",
                      width: "100%",
                      border: "1px solid #d1d5db",
                      borderRadius: "0.375rem",
                      padding: "0.6rem 0.75rem",
                      marginBottom: "0.4rem",
                    }}
                  />
                  <input
                    type="text"
                    value={localData.role}
                    onChange={(e) =>
                      handleFieldChange("role", e.target.value)
                    }
                    placeholder="Professional Title"
                    style={{
                      fontSize: "1rem",
                      fontWeight: 500,
                      color: "#4b5563",
                      width: "100%",
                      border: "1px solid #d1d5db",
                      borderRadius: "0.375rem",
                      padding: "0.4rem 0.75rem",
                    }}
                  />
                </>
              ) : (
                <>
                  <h1
                    style={{
                      fontSize: "2.2rem",
                      fontWeight: 800,
                      letterSpacing: "0.02",
                      textTransform: "uppercase",
                    }}
                  >
                    {localData.name}
                  </h1>
                  {localData.role && (
                    <p
                      style={{
                        fontSize: "1.05rem",
                        color: "#4b5563",
                        marginTop: "0.25rem",
                      }}
                    >
                      {localData.role}
                    </p>
                  )}
                </>
              )}

              {/* Contact row */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  flexWrap: "wrap",
                  gap: "0.65rem 1rem",
                  marginTop: "0.55rem",
                  fontSize: "0.85rem",
                  color: "#4b5563",
                }}
              >

                {["phone", "email", "location"].map((field) => {
                  const icon =
                    field === "phone"
                      ? "📞"
                      : field === "email"
                        ? "✉️"
                        : "📍";
                  const label = localData[field];
                  if (!editMode && !hasText(label)) return null;

                  return editMode ? (
                    <span key={field} style={{ display: "flex", gap: "0.3rem" }}>
                      <span>{icon}</span>
                      <input
                        type="text"
                        value={label || ""}
                        onChange={(e) =>
                          handleFieldChange(field, e.target.value)
                        }
                        placeholder={
                          field === "phone"
                            ? "Phone"
                            : field === "email"
                              ? "Email"
                              : "Location"
                        }
                        style={{
                          border: "1px solid #d1d5db",
                          borderRadius: "999px",
                          padding: "0.2rem 0.75rem",
                          fontSize: "0.8rem",
                          minWidth: "140px",
                        }}
                      />
                    </span>
                  ) : (
                    <span
                      key={field}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.15rem",
                      }}
                    >
                      <span>{icon}</span>
                      <span>{label}</span>
                    </span>
                  );
                })}

                {/* LinkedIn / GitHub / Portfolio with icons */}
                {["linkedin", "github", "portfolio"].map((field) => {
                  const label = localData[field];
                  const icon =
                    field === "linkedin"
                      ? "🔗"
                      : field === "github"
                        ? "🐙"
                        : "🌐";

                  if (!editMode && !hasText(label)) return null;

                  return editMode ? (
                    <span
                      key={field}
                      style={{ display: "flex", alignItems: "center", gap: "0.15rem" }}
                    >
                      <span>{icon}</span>
                      <input
                        type="text"
                        value={label || ""}
                        onChange={(e) =>
                          handleFieldChange(field, e.target.value)
                        }
                        placeholder={
                          field.charAt(0).toUpperCase() + field.slice(1)
                        }
                        style={{
                          border: "1px solid #d1d5db",
                          borderRadius: "999px",
                          padding: "0.2rem 0.75rem",
                          fontSize: "0.8rem",
                          minWidth: "160px",
                        }}
                      />
                    </span>
                  ) : (
                    label && (
                      <span
                        key={field}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.3rem",
                        }}
                      >
                        <span>{icon}</span>
                        <span>{label}</span>
                      </span>
                    )
                  );
                })}
              </div>


            </div>

            {/* ABOUT ME (SUMMARY) */}
            {(editMode || hasSummary) && (
              <section style={{ marginBottom: "1.75rem" }}>
                <h2 style={sectionHeadingStyle}>About Me</h2>
                <hr style={sectionDividerStyle} />
                {editMode ? (
                  <textarea
                    value={localData.summary}
                    onChange={(e) =>
                      handleFieldChange("summary", e.target.value)
                    }
                    style={{
                      width: "100%",
                      minHeight: "5rem",
                      border: "1px solid #d1d5db",
                      borderRadius: "0.375rem",
                      padding: "0.5rem 0.75rem",
                      fontSize: "0.9rem",
                    }}
                  />
                ) : (
                  <p
                    style={{
                      fontSize: "0.9rem",
                      color: "#374151",
                      lineHeight: 1.6,
                    }}
                  >
                    {localData.summary}
                  </p>
                )}
              </section>
            )}

            {/* EDUCATION */}
            {(editMode || educationList.length > 0) && (
              <section style={{ marginBottom: "1.75rem" }}>
                <h2 style={sectionHeadingStyle}>Education</h2>
                <hr style={sectionDividerStyle} />

                {educationList.map((edu, idx) => (
                  <div key={idx} style={{ marginBottom: "1rem" }}>
                    {editMode ? (
                      <>
                        <input
                          type="text"
                          value={edu.institution}
                          onChange={(e) =>
                            handleArrayFieldChange(
                              "education",
                              idx,
                              "institution",
                              e.target.value
                            )
                          }
                          placeholder="Institution"
                          style={{
                            width: "100%",
                            border: "1px solid #d1d5db",
                            borderRadius: "0.375rem",
                            padding: "0.45rem 0.6rem",
                            fontSize: "0.9rem",
                            marginBottom: "0.3rem",
                          }}
                        />
                        <input
                          type="text"
                          value={edu.degree}
                          onChange={(e) =>
                            handleArrayFieldChange(
                              "education",
                              idx,
                              "degree",
                              e.target.value
                            )
                          }
                          placeholder="Degree"
                          style={{
                            width: "100%",
                            border: "1px solid #d1d5db",
                            borderRadius: "0.375rem",
                            padding: "0.4rem 0.6rem",
                            fontSize: "0.85rem",
                            marginBottom: "0.3rem",
                          }}
                        />
                        <input
                          type="text"
                          value={edu.duration}
                          onChange={(e) =>
                            handleArrayFieldChange(
                              "education",
                              idx,
                              "duration",
                              e.target.value
                            )
                          }
                          placeholder="Duration"
                          style={{
                            width: "100%",
                            border: "1px solid #d1d5db",
                            borderRadius: "0.375rem",
                            padding: "0.4rem 0.6rem",
                            fontSize: "0.85rem",
                            marginBottom: "0.3rem",
                          }}
                        />
                        <input
                          type="text"
                          value={edu.location}
                          onChange={(e) =>
                            handleArrayFieldChange(
                              "education",
                              idx,
                              "location",
                              e.target.value
                            )
                          }
                          placeholder="Location"
                          style={{
                            width: "100%",
                            border: "1px solid #d1d5db",
                            borderRadius: "0.375rem",
                            padding: "0.4rem 0.6rem",
                            fontSize: "0.85rem",
                            marginBottom: "0.3rem",
                          }}
                        />
                        <button
                          onClick={() =>
                            handleRemoveSection("education", idx)
                          }
                          style={{
                            fontSize: "0.8rem",
                            color: "#ef4444",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                          }}
                        >
                          Remove Education
                        </button>
                      </>
                    ) : (
                      <>
                        <p
                          style={{
                            fontSize: "0.85rem",
                            color: "#4b5563",
                            marginBottom: "0.1rem",
                          }}
                        >
                          {edu.institution}
                          {edu.duration ? ` | ${edu.duration}` : ""}
                        </p>
                        <p
                          style={{
                            fontSize: "0.9rem",
                            fontWeight: 600,
                          }}
                        >
                          {edu.degree}
                        </p>
                        {edu.location && (
                          <p
                            style={{
                              fontSize: "0.8rem",
                              color: "#6b7280",
                            }}
                          >
                            {edu.location}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                ))}
                {editMode && (
                  <button
                    onClick={() => handleAddSection("education")}
                    style={{
                      fontSize: "0.8rem",
                      color: "#111827",
                      background: "none",
                      border: "1px dashed #d1d5db",
                      padding: "0.25rem 0.6rem",
                      borderRadius: "999px",
                      cursor: "pointer",
                    }}
                  >
                    + Add Education
                  </button>
                )}
              </section>
            )}

            {/* WORK EXPERIENCE */}
            {(editMode || experienceList.length > 0) && (
              <section style={{ marginBottom: "1.75rem" }}>
                <h2 style={sectionHeadingStyle}>Work Experience</h2>
                <hr style={sectionDividerStyle} />

                {experienceList.map((exp, idx) => (
                  <div key={idx} style={{ marginBottom: "1rem" }}>
                    {editMode ? (
                      <>
                        <input
                          type="text"
                          value={exp.companyName}
                          onChange={(e) =>
                            handleArrayFieldChange(
                              "experience",
                              idx,
                              "companyName",
                              e.target.value
                            )
                          }
                          placeholder="Company Name"
                          style={{
                            width: "100%",
                            border: "1px solid #d1d5db",
                            borderRadius: "0.375rem",
                            padding: "0.45rem 0.6rem",
                            fontSize: "0.9rem",
                            marginBottom: "0.3rem",
                          }}
                        />
                        <input
                          type="text"
                          value={exp.date}
                          onChange={(e) =>
                            handleArrayFieldChange(
                              "experience",
                              idx,
                              "date",
                              e.target.value
                            )
                          }
                          placeholder="Duration"
                          style={{
                            width: "100%",
                            border: "1px solid #d1d5db",
                            borderRadius: "0.375rem",
                            padding: "0.4rem 0.6rem",
                            fontSize: "0.85rem",
                            marginBottom: "0.3rem",
                          }}
                        />
                        <input
                          type="text"
                          value={exp.title}
                          onChange={(e) =>
                            handleArrayFieldChange(
                              "experience",
                              idx,
                              "title",
                              e.target.value
                            )
                          }
                          placeholder="Job Title"
                          style={{
                            width: "100%",
                            border: "1px solid #d1d5db",
                            borderRadius: "0.375rem",
                            padding: "0.4rem 0.6rem",
                            fontSize: "0.85rem",
                            marginBottom: "0.3rem",
                          }}
                        />
                        <input
                          type="text"
                          value={exp.companyLocation}
                          onChange={(e) =>
                            handleArrayFieldChange(
                              "experience",
                              idx,
                              "companyLocation",
                              e.target.value
                            )
                          }
                          placeholder="Location"
                          style={{
                            width: "100%",
                            border: "1px solid #d1d5db",
                            borderRadius: "0.375rem",
                            padding: "0.4rem 0.6rem",
                            fontSize: "0.85rem",
                            marginBottom: "0.3rem",
                          }}
                        />
                        <textarea
                          value={safeArray(exp.accomplishment).join("\n")}
                          onChange={(e) =>
                            handleArrayFieldChange(
                              "experience",
                              idx,
                              "accomplishment",
                              e.target.value.split("\n")
                            )
                          }
                          placeholder="Responsibilities & achievements (one per line)"
                          style={{
                            width: "100%",
                            minHeight: "4rem",
                            border: "1px solid #d1d5db",
                            borderRadius: "0.375rem",
                            padding: "0.45rem 0.6rem",
                            fontSize: "0.85rem",
                            marginBottom: "0.3rem",
                          }}
                        />
                        <button
                          onClick={() =>
                            handleRemoveSection("experience", idx)
                          }
                          style={{
                            fontSize: "0.8rem",
                            color: "#ef4444",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                          }}
                        >
                          Remove Experience
                        </button>
                      </>
                    ) : (
                      <>
                        <p
                          style={{
                            fontSize: "0.85rem",
                            color: "#4b5563",
                            marginBottom: "0.1rem",
                          }}
                        >
                          {exp.companyName}
                          {exp.date ? ` | ${exp.date}` : ""}
                        </p>
                        <p
                          style={{
                            fontSize: "0.9rem",
                            fontWeight: 600,
                          }}
                        >
                          {exp.title}
                        </p>
                        {exp.companyLocation && (
                          <p
                            style={{
                              fontSize: "0.8rem",
                              color: "#6b7280",
                            }}
                          >
                            {exp.companyLocation}
                          </p>
                        )}
                        {safeArray(exp.accomplishment).length > 0 && (
                          <ul
                            style={{
                              marginTop: "0.25rem",
                              paddingLeft: "1.1rem",
                              fontSize: "0.85rem",
                              color: "#374151",
                            }}
                          >
                            {safeArray(exp.accomplishment).map((item, i) => (
                              <li key={i}>{item}</li>
                            ))}
                          </ul>
                        )}
                      </>
                    )}
                  </div>
                ))}
                {editMode && (
                  <button
                    onClick={() => handleAddSection("experience")}
                    style={{
                      fontSize: "0.8rem",
                      color: "#111827",
                      background: "none",
                      border: "1px dashed #d1d5db",
                      padding: "0.25rem 0.6rem",
                      borderRadius: "999px",
                      cursor: "pointer",
                    }}
                  >
                    + Add Experience
                  </button>
                )}
              </section>
            )}

            {/* SKILLS – vertical, clean list */}
            {(editMode || skillsList.length > 0) && (
              <section style={{ marginBottom: "1.75rem" }}>
                <h2 style={sectionHeadingStyle}>Skills</h2>
                <hr style={sectionDividerStyle} />
                {editMode ? (
                  <>
                    {skillsList.map((skill, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          marginBottom: "0.35rem",
                        }}
                      >
                        <input
                          type="text"
                          value={skill}
                          onChange={(e) => handleSkillChange(idx, e.target.value)}
                          style={{
                            flex: 1,
                            border: "1px solid #d1d5db",
                            borderRadius: "0.375rem",
                            padding: "0.25rem 0.4rem",
                            fontSize: "0.85rem",
                          }}
                        />
                        <button
                          onClick={() => handleRemoveSection("skills", idx)}
                          style={{
                            fontSize: "0.75rem",
                            color: "#ef4444",
                            background: "none",
                            border: "none",
                            marginLeft: "0.3rem",
                            cursor: "pointer",
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}

                    {/* new buttons area */}
                    <div style={{ marginTop: "0.5rem", display: "flex", gap: "0.75rem" }}>
                      <button
                        onClick={() => handleAddSection("skills")}
                        style={{
                          fontSize: "0.8rem",
                          color: "#111827",
                          background: "none",
                          border: "1px dashed #d1d5db",
                          padding: "0.25rem 0.6rem",
                          borderRadius: "999px",
                          cursor: "pointer",
                        }}
                      >
                        + Add Skill
                      </button>

                      {skillsList.length > 0 && (
                        <button
                          onClick={() => handleClearSection("skills")}
                          style={{
                            fontSize: "0.8rem",
                            color: "#ef4444",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                          }}
                        >
                          Remove Skills
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  <div>
                    {skillsList.map((skill, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          alignItems: "baseline",
                          gap: "0.35rem",
                          fontSize: "0.9rem",
                          color: "#374151",
                          marginBottom: "0.2rem",
                        }}
                      >
                        <span style={{ fontSize: "0.9rem" }}>•</span>
                        <span>{skill}</span>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}


            {/* PROJECTS */}
            {(editMode || projectsList.length > 0) && (
              <section style={{ marginBottom: "1.75rem" }}>
                <h2 style={sectionHeadingStyle}>Projects</h2>
                <hr style={sectionDividerStyle} />

                {projectsList.map((project, idx) => (
                  <div key={idx} style={{ marginBottom: "1rem" }}>
                    {editMode ? (
                      <>
                        <input
                          type="text"
                          value={project.name}
                          onChange={(e) =>
                            handleArrayFieldChange("projects", idx, "name", e.target.value)
                          }
                          placeholder="Project Name"
                          style={{
                            width: "100%",
                            border: "1px solid #d1d5db",
                            borderRadius: "0.375rem",
                            padding: "0.45rem 0.6rem",
                            fontSize: "0.9rem",
                            marginBottom: "0.3rem",
                          }}
                        />
                        <textarea
                          value={project.description}
                          onChange={(e) =>
                            handleArrayFieldChange(
                              "projects",
                              idx,
                              "description",
                              e.target.value
                            )
                          }
                          placeholder="Short project description"
                          style={{
                            width: "100%",
                            minHeight: "3.5rem",
                            border: "1px solid #d1d5db",
                            borderRadius: "0.375rem",
                            padding: "0.45rem 0.6rem",
                            fontSize: "0.85rem",
                            marginBottom: "0.3rem",
                          }}
                        />
                        <input
                          type="text"
                          value={safeArray(project.technologies).join(", ")}
                          onChange={(e) =>
                            handleArrayFieldChange(
                              "projects",
                              idx,
                              "technologies",
                              e.target.value
                                .split(",")
                                .map((t) => t.trim())
                                .filter(Boolean)
                            )
                          }
                          placeholder="Technologies (comma separated)"
                          style={{
                            width: "100%",
                            border: "1px solid #d1d5db",
                            borderRadius: "0.375rem",
                            padding: "0.4rem 0.6rem",
                            fontSize: "0.85rem",
                            marginBottom: "0.3rem",
                          }}
                        />
                        <input
                          type="text"
                          value={project.link || ""}
                          onChange={(e) =>
                            handleArrayFieldChange("projects", idx, "link", e.target.value)
                          }
                          placeholder="Live link (optional)"
                          style={{
                            width: "100%",
                            border: "1px solid #d1d5db",
                            borderRadius: "0.375rem",
                            padding: "0.4rem 0.6rem",
                            fontSize: "0.85rem",
                            marginBottom: "0.3rem",
                          }}
                        />
                        <input
                          type="text"
                          value={project.github || ""}
                          onChange={(e) =>
                            handleArrayFieldChange(
                              "projects",
                              idx,
                              "github",
                              e.target.value
                            )
                          }
                          placeholder="GitHub link (optional)"
                          style={{
                            width: "100%",
                            border: "1px solid #d1d5db",
                            borderRadius: "0.375rem",
                            padding: "0.4rem 0.6rem",
                            fontSize: "0.85rem",
                            marginBottom: "0.3rem",
                          }}
                        />
                        <button
                          onClick={() => handleRemoveSection("projects", idx)}
                          style={{
                            fontSize: "0.8rem",
                            color: "#ef4444",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                          }}
                        >
                          Remove Project
                        </button>
                      </>
                    ) : (
                      <>
                        <p
                          style={{
                            fontSize: "0.9rem",
                            fontWeight: 600,
                            marginBottom: "0.1rem",
                          }}
                        >
                          {project.name}
                        </p>
                        {project.description && (
                          <p
                            style={{
                              fontSize: "0.9rem",
                              color: "#374151",
                              marginBottom: "0.1rem",
                            }}
                          >
                            {project.description}
                          </p>
                        )}
                        {safeArray(project.technologies).length > 0 && (
                          <p
                            style={{
                              fontSize: "0.8rem",
                              color: "#6b7280",
                              marginBottom: "0.1rem",
                            }}
                          >
                            <strong>Tech:</strong>{" "}
                            {safeArray(project.technologies).join(", ")}
                          </p>
                        )}
                        {(project.link || project.github) && (
                          <p
                            style={{
                              fontSize: "0.8rem",
                              color: "#2563eb",
                              marginTop: "0.15rem",
                            }}
                          >
                            {project.link && (
                              <span>
                                <a
                                  href={project.link}
                                  target="_blank"
                                  rel="noreferrer"
                                  style={{ color: "inherit" }}
                                >
                                  Live
                                </a>
                                {project.github ? " · " : ""}
                              </span>
                            )}
                            {project.github && (
                              <a
                                href={project.github}
                                target="_blank"
                                rel="noreferrer"
                                style={{ color: "inherit" }}
                              >
                                GitHub
                              </a>
                            )}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                ))}
                {editMode && (
                  <button
                    onClick={() => handleAddSection("projects")}
                    style={{
                      fontSize: "0.8rem",
                      color: "#111827",
                      background: "none",
                      border: "1px dashed #d1d5db",
                      padding: "0.25rem 0.6rem",
                      borderRadius: "999px",
                      cursor: "pointer",
                    }}
                  >
                    + Add Project
                  </button>
                )}
              </section>
            )}


            {/* CERTIFICATIONS */}
            {(editMode || certificationsList.length > 0) && (
              <section style={{ marginBottom: "1.75rem" }}>
                <h2 style={sectionHeadingStyle}>Certifications</h2>
                <hr style={sectionDividerStyle} />

                {certificationsList.map((cert, idx) => (
                  <div key={idx} style={{ marginBottom: "0.8rem" }}>
                    {editMode ? (
                      <>
                        <input
                          type="text"
                          value={cert.title}
                          onChange={(e) =>
                            handleArrayFieldChange(
                              "certifications",
                              idx,
                              "title",
                              e.target.value
                            )
                          }
                          placeholder="Certification Title"
                          style={{
                            width: "100%",
                            border: "1px solid #d1d5db",
                            borderRadius: "0.375rem",
                            padding: "0.45rem 0.6rem",
                            fontSize: "0.9rem",
                            marginBottom: "0.3rem",
                          }}
                        />
                        <input
                          type="text"
                          value={cert.issuer}
                          onChange={(e) =>
                            handleArrayFieldChange(
                              "certifications",
                              idx,
                              "issuer",
                              e.target.value
                            )
                          }
                          placeholder="Issuer"
                          style={{
                            width: "100%",
                            border: "1px solid #d1d5db",
                            borderRadius: "0.375rem",
                            padding: "0.4rem 0.6rem",
                            fontSize: "0.85rem",
                            marginBottom: "0.3rem",
                          }}
                        />
                        <input
                          type="text"
                          value={cert.date}
                          onChange={(e) =>
                            handleArrayFieldChange(
                              "certifications",
                              idx,
                              "date",
                              e.target.value
                            )
                          }
                          placeholder="Date"
                          style={{
                            width: "100%",
                            border: "1px solid #d1d5db",
                            borderRadius: "0.375rem",
                            padding: "0.4rem 0.6rem",
                            fontSize: "0.85rem",
                            marginBottom: "0.3rem",
                          }}
                        />
                        <button
                          onClick={() => handleRemoveSection("certifications", idx)}
                          style={{
                            fontSize: "0.8rem",
                            color: "#ef4444",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                          }}
                        >
                          Remove Certification
                        </button>
                      </>
                    ) : (
                      <p
                        style={{
                          fontSize: "0.9rem",
                          color: "#374151",
                        }}
                      >
                        <strong>{cert.title}</strong>
                        {hasText(cert.issuer) && ` · ${cert.issuer}`}
                        {hasText(cert.date) && ` · ${cert.date}`}
                      </p>
                    )}
                  </div>
                ))}
                {editMode && (
                  <button
                    onClick={() => handleAddSection("certifications")}
                    style={{
                      fontSize: "0.8rem",
                      color: "#111827",
                      background: "none",
                      border: "1px dashed #d1d5db",
                      padding: "0.25rem 0.6rem",
                      borderRadius: "999px",
                      cursor: "pointer",
                    }}
                  >
                    + Add Certification
                  </button>
                )}
              </section>
            )}

            {/* ACHIEVEMENTS */}
            {(editMode || achievementsList.length > 0) && (
              <section style={{ marginBottom: "1.75rem" }}>
                <h2 style={sectionHeadingStyle}>Achievements</h2>
                <hr style={sectionDividerStyle} />

                {editMode ? (
                  <>
                    {achievementsList.map((ach, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          marginBottom: "0.35rem",
                        }}
                      >
                        <input
                          type="text"
                          value={ach}
                          placeholder="Achievement"
                          onChange={(e) =>
                            handleArrayStringChange("achievements", idx, e.target.value)
                          }
                          style={{
                            flex: 1,
                            border: "1px solid #d1d5db",
                            borderRadius: "0.375rem",
                            padding: "0.25rem 0.4rem",
                            fontSize: "0.85rem",
                          }}
                        />
                        <button
                          onClick={() => handleRemoveSection("achievements", idx)}
                          style={{
                            fontSize: "0.75rem",
                            color: "#ef4444",
                            background: "none",
                            border: "none",
                            marginLeft: "0.3rem",
                            cursor: "pointer",
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    <div style={{ marginTop: "0.5rem", display: "flex", gap: "0.75rem" }}>
                      <button
                        onClick={() => handleAddSection("achievements")}
                        style={{
                          fontSize: "0.8rem",
                          color: "#111827",
                          background: "none",
                          border: "1px dashed #d1d5db",
                          padding: "0.25rem 0.6rem",
                          borderRadius: "999px",
                          cursor: "pointer",
                        }}
                      >
                        + Add Achievement
                      </button>

                      {achievementsList.length > 0 && (
                        <button
                          onClick={() => handleClearSection("achievements")}
                          style={{
                            fontSize: "0.8rem",
                            color: "#ef4444",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                          }}
                        >
                          Remove Achievements
                        </button>
                      )}
                    </div>

                  </>
                ) : (
                  <div>
                    {achievementsList.map((ach, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          alignItems: "baseline",
                          gap: "0.35rem",
                          fontSize: "0.9rem",
                          color: "#374151",
                          marginBottom: "0.2rem",
                        }}
                      >
                        <span style={{ fontSize: "0.9rem" }}>•</span>
                        <span>{ach}</span>
                      </div>
                    ))}
                  </div>
                )}

              </section>
            )}


            {/* LANGUAGES */}
            {(editMode || languagesList.length > 0) && (
              <section style={{ marginBottom: "1.75rem" }}>
                <h2 style={sectionHeadingStyle}>Languages</h2>
                <hr style={sectionDividerStyle} />

                {editMode ? (
                  <>
                    {languagesList.map((lang, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          marginBottom: "0.35rem",
                        }}
                      >
                        <input
                          type="text"
                          value={lang}
                          placeholder="Language"
                          onChange={(e) =>
                            handleArrayStringChange("languages", idx, e.target.value)
                          }
                          style={{
                            flex: 1,
                            border: "1px solid #d1d5db",
                            borderRadius: "0.375rem",
                            padding: "0.25rem 0.4rem",
                            fontSize: "0.85rem",
                          }}
                        />
                        <button
                          onClick={() => handleRemoveSection("languages", idx)}
                          style={{
                            fontSize: "0.75rem",
                            color: "#ef4444",
                            background: "none",
                            border: "none",
                            marginLeft: "0.3rem",
                            cursor: "pointer",
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}

                    {/* new buttons area */}
                    <div style={{ marginTop: "0.5rem", display: "flex", gap: "0.75rem" }}>
                      <button
                        onClick={() => handleAddSection("languages")}
                        style={{
                          fontSize: "0.8rem",
                          color: "#111827",
                          background: "none",
                          border: "1px dashed #d1d5db",
                          padding: "0.25rem 0.6rem",
                          borderRadius: "999px",
                          cursor: "pointer",
                        }}
                      >
                        + Add Language
                      </button>

                      {languagesList.length > 0 && (
                        <button
                          onClick={() => handleClearSection("languages")}
                          style={{
                            fontSize: "0.8rem",
                            color: "#ef4444",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                          }}
                        >
                          Remove Languages
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  <div>
                    {languagesList.map((lang, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          alignItems: "baseline",
                          gap: "0.35rem",
                          fontSize: "0.9rem",
                          color: "#374151",
                          marginBottom: "0.2rem",
                        }}
                      >
                        <span style={{ fontSize: "0.9rem" }}>•</span>
                        <span>{lang}</span>
                      </div>
                    ))}
                  </div>
                )}


              </section>
            )}
            {/* INTERESTS */}
            {(editMode || interestsList.length > 0) && (
              <section style={{ marginBottom: "1.75rem" }}>
                <h2 style={sectionHeadingStyle}>Interests</h2>
                <hr style={sectionDividerStyle} />

                {editMode ? (
                  <>
                    {interestsList.map((interest, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          marginBottom: "0.35rem",
                        }}
                      >
                        <input
                          type="text"
                          value={interest}
                          placeholder="Interest"
                          onChange={(e) =>
                            handleArrayStringChange("interests", idx, e.target.value)
                          }
                          style={{
                            flex: 1,
                            border: "1px solid #d1d5db",
                            borderRadius: "0.375rem",
                            padding: "0.25rem 0.4rem",
                            fontSize: "0.85rem",
                          }}
                        />
                        <button
                          onClick={() => handleRemoveSection("interests", idx)}
                          style={{
                            fontSize: "0.75rem",
                            color: "#ef4444",
                            background: "none",
                            border: "none",
                            marginLeft: "0.3rem",
                            cursor: "pointer",
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    <div style={{ marginTop: "0.5rem", display: "flex", gap: "0.75rem" }}>
                      <button
                        onClick={() => handleAddSection("interests")}
                        style={{
                          fontSize: "0.8rem",
                          color: "#111827",
                          background: "none",
                          border: "1px dashed #d1d5db",
                          padding: "0.25rem 0.6rem",
                          borderRadius: "999px",
                          cursor: "pointer",
                        }}
                      >
                        + Add Interest
                      </button>

                      {interestsList.length > 0 && (
                        <button
                          onClick={() => handleClearSection("interests")}
                          style={{
                            fontSize: "0.8rem",
                            color: "#ef4444",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                          }}
                        >
                          Remove Interests
                        </button>
                      )}
                    </div>

                  </>
                ) : (
                  <div>
                    {interestsList.map((interest, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          alignItems: "baseline",
                          gap: "0.35rem",
                          fontSize: "0.9rem",
                          color: "#374151",
                          marginBottom: "0.2rem",
                        }}
                      >
                        <span style={{ fontSize: "0.9rem" }}>•</span>
                        <span>{interest}</span>
                      </div>
                    ))}
                  </div>
                )}

              </section>
            )}



          </div>

          {/* Edit Controls */}
          <div style={{ marginTop: "1rem", textAlign: "center" }}>
            {editMode ? (
              <>
                <button
                  onClick={handleSave}
                  style={{
                    backgroundColor: "#10b981",
                    color: "white",
                    padding: "0.75rem 1.5rem",
                    borderRadius: "0.375rem",
                    marginRight: "0.5rem",
                    border: "none",
                    fontSize: "1rem",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.3s",
                  }}
                  onMouseOver={(e) =>
                    (e.target.style.backgroundColor = "#059669")
                  }
                  onMouseOut={(e) =>
                    (e.target.style.backgroundColor = "#10b981")
                  }
                >
                  Save Changes
                </button>
                <button
                  onClick={handleCancel}
                  style={{
                    backgroundColor: "#6b7280",
                    color: "white",
                    padding: "0.75rem 1.5rem",
                    borderRadius: "0.375rem",
                    border: "none",
                    fontSize: "1rem",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.3s",
                  }}
                  onMouseOver={(e) =>
                    (e.target.style.backgroundColor = "#4b5563")
                  }
                  onMouseOut={(e) =>
                    (e.target.style.backgroundColor = "#6b7280")
                  }
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditMode(true)}
                style={{
                  backgroundColor: "#3b82f6",
                  color: "white",
                  padding: "0.75rem 1.5rem",
                  borderRadius: "0.375rem",
                  border: "none",
                  fontSize: "1rem",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.3s",
                }}
                onMouseOver={(e) =>
                  (e.target.style.backgroundColor = "#2563eb")
                }
                onMouseOut={(e) =>
                  (e.target.style.backgroundColor = "#3b82f6")
                }
              >
                Edit Resume
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Template2;
