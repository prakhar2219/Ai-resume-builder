import { useState, useRef, useEffect } from "react";
import Sidebar from "../Sidebar/Sidebar";
import Navbar from "../Navbar/Navbar";
import { useResume } from "../../context/ResumeContext";
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Briefcase,
  GraduationCap,
  Sparkles,
  Zap,
  BookOpen,
  Code,
  Award, 
  Trophy, 
  Activity, 
} from "lucide-react";

// --- Reusable Editable Components ---

// Basic Input Field
const EditableField = ({ value, onChange, isEditing, placeholder = "" }) => {
  if (isEditing) {
    return (
      <input
        type="text"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%",
          padding: "0.2rem",
          margin: "0.1rem 0",
          border: "1px solid #ccc",
          borderRadius: "4px",
          fontFamily: "inherit",
          fontSize: "inherit",
        }}
      />
    );
  }
  return <>{value}</>;
};

// Text Area for longer content (Summary, Descriptions)
const EditableTextArea = ({ value, onChange, isEditing, style = {} }) => {
  if (isEditing) {
    return (
      <textarea
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        rows={Math.max(3, (value || "").split('\n').length)}
        style={{
          width: "100%",
          padding: "0.4rem",
          margin: "0.5rem 0",
          border: "1px solid #ccc",
          borderRadius: "4px",
          fontFamily: "inherit",
          fontSize: "0.95rem",
          lineHeight: "1.5",
          ...style,
        }}
      />
    );
  }
  return <p style={{ lineHeight: "1.7", color: style.color || "#343a40", margin: 0 }}>{value}</p>;
};


// --- Main Template Component ---

const Template24 = () => {
  const resumeRef = useRef(null);
  const { resumeData, setResumeData } = useResume();
  const [editMode, setEditMode] = useState(false);
  const [localData, setLocalData] = useState(resumeData);

  // --- Constants for Enhanced Styling (Professional Two-Column - Gray/Black Accent) ---
  const ACCENT_COLOR = "#707070";
  const PRIMARY_TEXT_COLOR = "#343a40";
  const LIGHT_BACKGROUND = "#f4f7f6";
  const SECTION_HEADER_BG = "#f5f5f5";
  const FONT_HEADER = "Georgia, serif";
  const FONT_BODY = "Arial, sans-serif";

  // --- State Management and Handlers ---
  useEffect(() => {
    setLocalData(resumeData);
  }, [resumeData]);

  // Main handler for simple top-level fields (name, role, contact info)
  const handleFieldChange = (field, value) => {
    setLocalData((prev) => ({ ...prev, [field]: value }));
  };

  // Handler for nested array fields (experience, education, etc.)
  const handleArrayFieldChange = (section, index, key, value) => {
    const updated = [...localData[section]];
    if (key) {
      // Ensure the object exists before trying to set a key
      if (!updated[index]) updated[index] = {}; 
      updated[index][key] = value;
    } 
    // Handle simple string change (e.g., in a simple list)
    else {
      updated[index] = value;
    }
    setLocalData({ ...localData, [section]: updated });
  };

  // Handler for bullet point array descriptions (handles text -> array conversion)
  const handleDescriptionChange = (section, index, value) => {
    const updated = [...localData[section]];
    if (!updated[index]) updated[index] = {};
    // Convert textarea content (lines) back to an array of strings
    const newDescriptionArray = value.split('\n').map(s => s.trim()).filter(s => s.length > 0);
    updated[index].description = newDescriptionArray;
    setLocalData({ ...localData, [section]: updated });
  };


  const handleSave = () => {
    setResumeData(localData);
    setEditMode(false);
  };

  const handleCancel = () => {
    setLocalData(resumeData); // Revert to last saved data
    setEditMode(false);
  };

  // --- Style Definitions ---

  // For the main content(right column) headers 

  const sectionTitleContainerStyle = {
    backgroundColor: SECTION_HEADER_BG,
    padding: "0.4rem 0.8rem",
    marginBottom: "1rem",
    marginTop: "1.5rem",
    textTransform: "uppercase",
    fontWeight: "bold",
    fontSize: "0.9rem",
    letterSpacing: "0.5px",
    color: PRIMARY_TEXT_COLOR,
    borderBottom: `1px solid ${ACCENT_COLOR}`,
  };

  //For the left column headers(Contact, Education, Skills, Languages)

  const leftColumnSectionTitleStyle = {
    backgroundColor: SECTION_HEADER_BG,
    padding: "0.75rem 0.5rem",
    margin: "1rem 0 0.5rem 0",
    textTransform: "uppercase",
    fontWeight: "bold",
    fontSize: "1rem",
    letterSpacing: "1px",
    color: PRIMARY_TEXT_COLOR,
    textAlign: "left",
    borderBottom: `2px solid ${ACCENT_COLOR}`,
    borderTop: `2px solid ${ACCENT_COLOR}`,
  };

  const cardStyle = {
    backgroundColor: "#ffffff",
    padding: "0",
    marginBottom: "2.5rem",
  };

  const contactIconStyle = {
    color: ACCENT_COLOR,
    marginRight: "0.5rem",
    verticalAlign: "middle",
  };

  // --- Array Item Renderer Function ---

  const renderArrayItem = (item, index, sectionKey) => {
    const titleKey = sectionKey === "education" ? "degree" : "title";
    const secondaryKey = sectionKey === "experience" ? "company" : sectionKey === "education" ? "institution" : "client";
    const tertiaryKey = sectionKey === "education" ? "duration" : "date";
    const tertiaryDisplay = item.duration || item.date;
    const descriptionKey = sectionKey === "education" ? "details" : "description";
    const descriptionAsString = Array.isArray(item[descriptionKey]) 
      ? item[descriptionKey].join('\n') 
      : item[descriptionKey] || '';


    // Case 1: Item is a simple string (e.g., skills, interests, achievements) - NOT USED HERE
    // The main render logic for simple lists is handled directly in the sections below 
    // (Skills, Languages, Certifications, Achievements) for better control over the `EditableField`.
    
    // Case 2: Item is a complex object (e.g., experience, projects)
    if (sectionKey === "experience" || sectionKey === "projects") {
      return (
        <div
          key={index}
          style={{
            marginBottom: "1.5rem",
            paddingBottom: "0.5rem",
            borderBottom: `1px solid ${SECTION_HEADER_BG}`,
          }}
        >
          {/* Company/Client and Duration */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              marginBottom: "0.2rem",
            }}
          >
            <h4
              style={{
                margin: 0,
                fontSize: "1rem",
                fontWeight: "bold",
                color: PRIMARY_TEXT_COLOR,
              }}
            >
              <EditableField
                value={item[secondaryKey]}
                onChange={(v) => handleArrayFieldChange(sectionKey, index, secondaryKey, v)}
                isEditing={editMode}
                placeholder={secondaryKey}
              />
            </h4>
            <span
              style={{
                fontSize: "0.85rem",
                color: ACCENT_COLOR,
                fontWeight: "500",
              }}
            >
              <EditableField
                value={tertiaryDisplay}
                onChange={(v) => handleArrayFieldChange(sectionKey, index, tertiaryKey, v)}
                isEditing={editMode}
                placeholder="Date/Duration"
              />
            </span>
          </div>

          {/* Title/Role */}
          <p
            style={{
              margin: "0",
              fontSize: "0.95rem",
              color: PRIMARY_TEXT_COLOR,
              fontWeight: "500",
              fontStyle: "italic",
            }}
          >
            <EditableField
              value={item[titleKey]}
              onChange={(v) => handleArrayFieldChange(sectionKey, index, titleKey, v)}
              isEditing={editMode}
              placeholder="Title/Role"
            />
          </p>

          {/* Description/Details as bullet points */}
          <div style={{ paddingLeft: editMode ? 0 : "1.2rem", lineHeight: "1.5", margin: "0.5rem 0 0 0" }}>
            <EditableTextArea
              value={descriptionAsString}
              onChange={(v) => handleDescriptionChange(sectionKey, index, v)}
              isEditing={editMode}
              style={{ paddingLeft: 0, margin: 0, border: editMode ? '1px solid #ccc' : 'none', minHeight: '50px' }}
            />
            {!editMode && Array.isArray(item[descriptionKey]) && (
              <ul style={{ paddingLeft: 0, margin: 0 }}>
                {item[descriptionKey].map((bullet, i) => (
                  <li
                    key={i}
                    style={{ marginBottom: "0.2rem", listStyleType: "disc", fontSize: "0.9rem" }}
                  >
                    {bullet}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  // --- Main Component Render ---
  return (
    <div style={{ minHeight: "100vh", backgroundColor: LIGHT_BACKGROUND }}>
      <Navbar />
      <div style={{ display: "flex" }}>
        <Sidebar resume={resumeData} />
        <div
          style={{
            flexGrow: 1,
            padding: "2.5rem",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            ref={resumeRef}
            style={{
              backgroundColor: "#ffffff",
              width: "100%",
              maxWidth: "800px",
              padding: "2rem",
              borderRadius: "16px",
              border: "1px solid #e0e0e0",
              boxShadow: "0px 10px 30px rgba(0,0,0,0.1)",
              fontFamily: FONT_BODY,
              color: PRIMARY_TEXT_COLOR,
            }}
          >
            {/* HEADER (Name & Role) */}
            <div
              style={{
                marginBottom: "1rem",
                textAlign: "center",
                borderBottom: `1px solid ${ACCENT_COLOR}`,
                paddingBottom: "0.5rem",
              }}
            >
              {/* Name (EDITABLE) */}
              <h1
                style={{
                  fontSize: "3rem",
                  margin: 0,
                  fontWeight: "900",
                  letterSpacing: "3px",
                  color: PRIMARY_TEXT_COLOR,
                  fontFamily: FONT_HEADER,
                  filter: "opacity(0.8)",
                }}
              >
                <EditableField
                  value={localData.name}
                  onChange={(v) => handleFieldChange("name", v)}
                  isEditing={editMode}
                  placeholder="Your Full Name"
                />
              </h1>
              {/* Role (EDITABLE) */}
              <h2
                style={{
                  fontSize: "1.2rem",
                  marginTop: "0.5rem",
                  color: ACCENT_COLOR,
                  fontWeight: "600",
                  fontFamily: FONT_BODY,
                  textTransform: "uppercase",
                  letterSpacing: "2px",
                }}
              >
                <EditableField
                  value={localData.role}
                  onChange={(v) => handleFieldChange("role", v)}
                  isEditing={editMode}
                  placeholder="Professional Role"
                />
              </h2>
            </div>

            {/* MAIN TWO-COLUMN CONTAINER */}
            <div style={{ display: "flex", gap: "20px" }}>
              {/* === LEFT COLUMN (35%) - STATIC CONTENT === */}
              <div style={{ flex: "0 0 35%", paddingRight: "10px" }}>
                {/* CONTACT (EDITABLE) */}
                <div style={{ ...leftColumnSectionTitleStyle, borderTop: "none" }}>CONTACT</div>
                <div style={{ padding: "0 0.5rem", fontSize: "0.9rem" }}>
                  {[
                    { key: "phone", icon: Phone, label: "phone" },
                    { key: "email", icon: Mail, label: "email" },
                    { key: "location", icon: MapPin, label: "location" },
                    { key: "linkedin", icon: Globe, label: "linkedin", isLink: true },
                    { key: "github", icon: Globe, label: "github", isLink: true },
                    { key: "portfolio", icon: Globe, label: "portfolio", isLink: true },
                  ].map((item) => {
                    if (localData[item.label] || editMode) {
                      const Icon = item.icon;
                      return (
                        <p key={item.key} style={{ margin: "0.5rem 0" }}>
                          <Icon size={14} style={contactIconStyle} />
                          {item.isLink && !editMode ? (
                            <a
                              href={localData[item.label]}
                              style={{ color: PRIMARY_TEXT_COLOR, textDecoration: "none" }}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {item.key.charAt(0).toUpperCase() + item.key.slice(1)}
                            </a>
                          ) : (
                            <EditableField
                              value={localData[item.label]}
                              onChange={(v) => handleFieldChange(item.label, v)}
                              isEditing={editMode}
                              placeholder={item.label}
                            />
                          )}
                        </p>
                      );
                    }
                    return null;
                  })}
                </div>

                {/* EDUCATION (EDITABLE) - Simplified Left Column Display */}
                {resumeData.education && (resumeData.education.length > 0 || editMode) && (
                  <>
                    <div style={leftColumnSectionTitleStyle}>EDUCATION</div>
                    <div style={{ padding: "0 0.5rem" }}>
                      <ul style={{ paddingLeft: 0, listStyleType: "none", margin: 0 }}>
                        {localData.education.map((item, idx) => (
                          <li key={idx} style={{ marginBottom: "1rem" }}>
                            <div style={{ fontSize: "0.95rem" }}>
                              {/* Date */}
                              <p style={{ margin: 0, fontWeight: "bold" }}>
                                <EditableField
                                  value={item.duration || item.date}
                                  onChange={(v) => handleArrayFieldChange("education", idx, "duration", v)}
                                  isEditing={editMode}
                                  placeholder="Date/Duration"
                                />
                              </p>
                              {/* Institution */}
                              <p
                                style={{
                                  margin: "0.1rem 0",
                                  color: ACCENT_COLOR,
                                  fontWeight: "600",
                                }}
                              >
                                <EditableField
                                  value={item.institution}
                                  onChange={(v) => handleArrayFieldChange("education", idx, "institution", v)}
                                  isEditing={editMode}
                                  placeholder="Institution Name"
                                />
                              </p>
                              {/* Degree/Title */}
                              <p
                                style={{
                                  margin: "0.1rem 0",
                                  fontSize: "0.9rem",
                                  fontStyle: "italic",
                                }}
                              >
                                <EditableField
                                  value={item.degree || item.title}
                                  onChange={(v) => handleArrayFieldChange("education", idx, "degree", v)}
                                  isEditing={editMode}
                                  placeholder="Degree/Field"
                                />
                              </p>
                              {/* GPA/Details */}
                              <p style={{ margin: "0.1rem 0", fontSize: "0.85rem" }}>
                                {item.gpa && !editMode ? `GPA: ${item.gpa}` : (
                                  <EditableField
                                    value={item.gpa || item.details}
                                    onChange={(v) => handleArrayFieldChange("education", idx, "gpa", v)}
                                    isEditing={editMode}
                                    placeholder="GPA / Details"
                                  />
                                )}
                              </p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}

                {/* SKILLS (EDITABLE) */}
                {resumeData.skills && (resumeData.skills.length > 0 || editMode) && (
                  <>
                    <div style={leftColumnSectionTitleStyle}>SKILLS</div>
                    <div style={{ padding: "0 0.5rem" }}>
                      {/* Note: For simplicity, I will treat the skills array as simple strings */}
                      <ul
                        style={{
                          paddingLeft: "1rem",
                          listStyleType: "none",
                          margin: 0,
                          columns: 1,
                        }}
                      >
                        {localData.skills.map((item, idx) => {
                          const skillName = typeof item === 'string' ? item : item.name;
                          return (
                            <li key={idx} style={{ marginBottom: "0.4rem", fontSize: "0.9rem", position: 'relative', paddingLeft: '1em' }}>
                              <span style={{ position: 'absolute', left: 0, color: ACCENT_COLOR, fontSize: '0.6rem' }}>&#9679;</span>
                              <EditableField
                                value={skillName}
                                onChange={(v) => handleArrayFieldChange("skills", idx, null, v)} // Changing the whole string item
                                isEditing={editMode}
                                placeholder="Skill Name"
                              />
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </>
                )}

                {/* LANGUAGES (EDITABLE) */}
                {resumeData.languages && (resumeData.languages.length > 0 || editMode) && (
                  <>
                    <div style={leftColumnSectionTitleStyle}>LANGUAGES</div>
                    <div style={{ padding: "0 0.5rem" }}>
                      <ul style={{ paddingLeft: 0, listStyleType: "none", margin: 0 }}>
                        {localData.languages.map((item, idx) => (
                          <li key={idx} style={{ marginBottom: "0.4rem" }}>
                            <p style={{ margin: 0, fontSize: "0.9rem" }}>
                              {/* Name */}
                              <strong>
                                <EditableField
                                  value={item.name}
                                  onChange={(v) => handleArrayFieldChange("languages", idx, "name", v)}
                                  isEditing={editMode}
                                  placeholder="Language"
                                />
                                :
                              </strong>{" "}
                              {/* Level */}
                              <EditableField
                                value={item.level}
                                onChange={(v) => handleArrayFieldChange("languages", idx, "level", v)}
                                isEditing={editMode}
                                placeholder="Level"
                              />
                            </p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}
              </div>

              {/* === RIGHT COLUMN (65%) - MAIN CONTENT === */}
              <div
                style={{
                  flex: "0 0 65%",
                  borderLeft: `1px solid ${SECTION_HEADER_BG}`,
                  paddingLeft: "20px",
                }}
              >
                {/* PROFILE SUMMARY (EDITABLE) */}
                {(resumeData.summary || editMode) && (
                  <div style={cardStyle}>
                    <div style={sectionTitleContainerStyle}>PROFESSIONAL SUMMARY</div>
                    <div style={{ padding: "0 0.5rem", fontSize: "0.95rem" }}>
                      <EditableTextArea
                        value={localData.summary}
                        onChange={(v) => handleFieldChange("summary", v)}
                        isEditing={editMode}
                        style={{ color: PRIMARY_TEXT_COLOR }}
                      />
                    </div>
                  </div>
                )}

                {/* PROFESSIONAL EXPERIENCE (EDITABLE) */}
                {resumeData.experience && (resumeData.experience.length > 0 || editMode) && (
                  <div style={cardStyle}>
                    <div style={sectionTitleContainerStyle}>PROFESSIONAL EXPERIENCE</div>
                    <div style={{ padding: "0 0.5rem" }}>
                      <ul style={{ paddingLeft: 0, listStyleType: "none", margin: 0 }}>
                        {localData.experience.map((item, idx) => (
                          <li key={idx} style={{ marginBottom: "1rem" }}>
                            {renderArrayItem(item, idx, "experience")}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* KEY PROJECTS (EDITABLE) */}
                {resumeData.projects && (resumeData.projects.length > 0 || editMode) && (
                  <div style={cardStyle}>
                    <div style={sectionTitleContainerStyle}>KEY PROJECTS</div>
                    <div style={{ padding: "0 0.5rem" }}>
                      <ul style={{ paddingLeft: 0, listStyleType: "none", margin: 0 }}>
                        {localData.projects.map((item, idx) => (
                          <li key={idx} style={{ marginBottom: "1rem" }}>
                            {renderArrayItem(item, idx, "projects")}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* CERTIFICATIONS & ACHIEVEMENTS (EDITABLE LISTS) */}
                {(resumeData.certifications || resumeData.achievements) && (
                  <div style={cardStyle}>
                    {/* CERTIFICATIONS */}
                    {resumeData.certifications && (resumeData.certifications.length > 0 || editMode) && (
                      <>
                        <div style={sectionTitleContainerStyle}>CERTIFICATIONS</div>
                        <div style={{ padding: "0 0.5rem" }}>
                          <ul style={{ paddingLeft: "1.2rem", listStyleType: "disc", margin: 0, fontSize: "0.95rem" }}>
                            {localData.certifications.map((item, idx) => (
                              <li key={idx} style={{ marginBottom: "0.4rem" }}>
                                <EditableField
                                  value={typeof item === 'string' ? item : `${item.title || item.name} (${item.issuer || ''}${item.issuer && item.date ? ', ' : ''}${item.date || ''})`}
                                  onChange={(v) => handleArrayFieldChange("certifications", idx, null, v)}
                                  isEditing={editMode}
                                  placeholder="Certification Name (Issuer, Date)"
                                />
                              </li>
                            ))}
                          </ul>
                        </div>
                      </>
                    )}
                    {/* AWARDS & ACHIEVEMENTS */}
                    {resumeData.achievements && (resumeData.achievements.length > 0 || editMode) && (
                      <>
                        <div style={sectionTitleContainerStyle}>AWARDS & ACHIEVEMENTS</div>
                        <div style={{ padding: "0 0.5rem" }}>
                          <ul style={{ paddingLeft: "1.2rem", listStyleType: "disc", margin: 0, fontSize: "0.95rem" }}>
                            {localData.achievements.map((item, idx) => {
                              const displayText = typeof item === 'string' ? item : `${item.description || item.title || ''}${item.issuer || item.date ? ` (${item.issuer || ''}${item.issuer && item.date ? ' - ' : ''}${item.date || ''})` : ''}`;
                              return (
                                <li key={idx} style={{ marginBottom: "0.4rem" }}>
                                  <EditableField
                                    value={displayText}
                                    onChange={(v) => handleArrayFieldChange("achievements", idx, null, v)}
                                    isEditing={editMode}
                                    placeholder="Achievement Description (Source, Date)"
                                  />
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* INTERESTS (EDITABLE - Single Line) */}
                {resumeData.interests && (resumeData.interests.length > 0 || editMode) && (
                  <div style={cardStyle}>
                    <div style={sectionTitleContainerStyle}>INTERESTS</div>
                    <div style={{ padding: "0 0.5rem" }}>
                      <p style={{ margin: 0, fontSize: "0.9rem" }}>
                        {/* Joining/Splitting the simple array with " | " for editing */}
                        <EditableField
                          value={localData.interests.join(" | ")}
                          onChange={(v) => handleFieldChange("interests", v.split(/\s*\|\s*/).filter(s => s.length > 0))}
                          isEditing={editMode}
                          placeholder="Interests (e.g., Reading | Hiking | Coding)"
                        />
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* BUTTONS (Edit/Save/Cancel) - UNCHANGED */}
            <div style={{ textAlign: "center", marginTop: "3rem" }}>
              {editMode ? (
                <>
                  <button
                    onClick={handleSave}
                    style={{
                      background: ACCENT_COLOR,
                      color: "white",
                      padding: "0.7rem 1.4rem",
                      borderRadius: "8px",
                      marginRight: "1rem",
                      border: "none",
                      cursor: "pointer",
                      fontWeight: "600",
                    }}
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={handleCancel}
                    style={{
                      background: "#6c757d",
                      color: "white",
                      padding: "0.7rem 1.4rem",
                      borderRadius: "8px",
                      border: "none",
                      cursor: "pointer",
                      fontWeight: "600",
                    }}
                  >
                    Cancel Edit
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditMode(true)}
                  style={{
                    background: ACCENT_COLOR,
                    color: "white",
                    padding: "0.7rem 1.4rem",
                    borderRadius: "8px",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: "600",
                  }}
                >
                  Edit Resume
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Template24;