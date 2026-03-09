import React, { useState, useRef, useEffect } from "react";
import Sidebar from "../Sidebar/Sidebar";
import Navbar from "../Navbar/Navbar";
import { useResume } from "../../context/ResumeContext";

// Icons + keys used in the contact section
const contactFields = [
  { key: "phone", icon: "📞" },
  { key: "email", icon: "✉️" },
  { key: "location", icon: "📍" },
  { key: "linkedin", icon: "🔗" },
  { key: "github", icon: "🐙" },
  { key: "portfolio", icon: "🌐" },
];

const Template8 = () => {
  const resumeRef = useRef(null);
  const { resumeData, setResumeData } = useResume();
  const [editMode, setEditMode] = useState(false);
  const [localData, setLocalData] = useState(
    resumeData || {
      name: "",
      role: "",
      email: "",
      phone: "",
      location: "",
      linkedin: "",
      github: "",
      portfolio: "",
      summary: "",
      skills: [],
      languages: [],
      interests: [],
      experience: [],
      education: [],
      project: [],
      certifications: [],
      achievements: [],
    }
  );

  useEffect(() => {
    setLocalData(resumeData);
  }, [resumeData]);

  const [newExperience] = useState({
    title: "",
    companyName: "",
    date: "",
    companyLocation: "",
  });
  const [newEducation] = useState({
    degree: "",
    institution: "",
    duration: "",
    location: "",
  });

  const handleFieldChange = (field, value) => {
    const updatedData = { ...localData, [field]: value };
    setLocalData(updatedData);
    localStorage.setItem("resumeData", JSON.stringify(updatedData));
  };

  const handleSave = () => {
    setResumeData(localData);
    setEditMode(false);
  };

  const handleCancel = () => {
    setLocalData(resumeData);
    setEditMode(false);
  };

  const handleEnhance = () => { };

  const handleArrayFieldChange = (arrayField, index, subField, value) => {
    const updated = Array.isArray(localData[arrayField])
      ? [...localData[arrayField]]
      : [];
    if (!updated[index]) updated[index] = {};
    updated[index][subField] = value;
    handleFieldChange(arrayField, updated);
  };

  const handleArrayListChange = (arrayField, index, listField, value) => {
    const updated = Array.isArray(localData[arrayField])
      ? [...localData[arrayField]]
      : [];
    if (!updated[index]) updated[index] = {};
    updated[index][listField] = value
      .split("\n")
      .map((item) => item.trim())
      .filter((item) => item);
    handleFieldChange(arrayField, updated);
  };

  // === helper section visibility checks ===
  const hasSummary = (data) =>
    typeof data.summary === "string" && data.summary.trim() !== "";

  const hasSkills = (data) =>
    Array.isArray(data.skills) &&
    data.skills.some(
      (skill) => typeof skill === "string" && skill.trim() !== ""
    );

  const hasLanguages = (data) =>
    Array.isArray(data.languages) &&
    data.languages.some(
      (lang) => typeof lang === "string" && lang.trim() !== ""
    );

  const hasInterests = (data) =>
    Array.isArray(data.interests) &&
    data.interests.some(
      (interest) => typeof interest === "string" && interest.trim() !== ""
    );
  // LANGUAGES
  const handleAddLanguage = () => {
    const current = Array.isArray(localData.languages) ? localData.languages : [];
    const updated = [...current, ""];
    handleFieldChange("languages", updated);
  };

  const handleLanguageChange = (index, value) => {
    const current = Array.isArray(localData.languages) ? localData.languages : [];
    const updated = [...current];
    updated[index] = value;
    handleFieldChange("languages", updated);
  };

  const handleRemoveLanguage = (index) => {
    const current = Array.isArray(localData.languages) ? localData.languages : [];
    const updated = current.filter((_, i) => i !== index);
    handleFieldChange("languages", updated);
  };


  // INTERESTS
  const handleAddInterest = () => {
    const current = Array.isArray(localData.interests) ? localData.interests : [];
    const updated = [...current, ""];
    handleFieldChange("interests", updated);
  };

  const handleInterestChange = (index, value) => {
    const current = Array.isArray(localData.interests) ? localData.interests : [];
    const updated = [...current];
    updated[index] = value;
    handleFieldChange("interests", updated);
  };

  const handleRemoveInterest = (index) => {
    const current = Array.isArray(localData.interests) ? localData.interests : [];
    const updated = current.filter((_, i) => i !== index);
    handleFieldChange("interests", updated);
  };


  const skillsToShow = editMode
    ? (Array.isArray(localData.skills) && localData.skills.length > 0
      ? localData.skills
      : [""]) // at least one empty skill in edit mode
    : (resumeData.skills || []);

  const languagesToShow = editMode
    ? (Array.isArray(localData.languages) && localData.languages.length > 0
      ? localData.languages
      : [""]) // at least one empty box in edit mode
    : (Array.isArray(resumeData.languages)
      ? resumeData.languages
      : []);

  const interestsToShow = editMode
    ? (Array.isArray(localData.interests) && localData.interests.length > 0
      ? localData.interests
      : [""]) // at least one empty box in edit mode
    : (Array.isArray(resumeData.interests)
      ? resumeData.interests
      : []);

  const hasExperience = (data) =>
    Array.isArray(data.experience) &&
    data.experience.some(
      (exp) =>
        exp &&
        (exp.title ||
          exp.companyName ||
          exp.companyLocation
        )
    );

  const hasEducation = (data) =>
    Array.isArray(data.education) &&
    data.education.some(
      (edu) =>
        edu &&
        (edu.degree || edu.institution || edu.location || edu.duration)
    );

  const hasProject = (data) =>
    Array.isArray(data.project) &&
    data.project.some(
      (pro) =>
        pro &&
        (pro.title ||
          pro.description ||
          pro.technologies ||
          pro.livedemourl ||
          pro.githuburl)
    );

  const hasAchievements = (data) =>
    Array.isArray(data.achievements) &&
    data.achievements.some(
      (ach) => ach && (ach.title || ach.description || ach.year)
    );

  const hasCertifications = (data) =>
    Array.isArray(data.certifications) &&
    data.certifications.some((cert) => cert && (cert.name || cert.year));

  const experienceToShow = editMode
    ? localData.experience || []
    : resumeData.experience || [];

  const educationToShow = editMode
    ? Array.isArray(localData.education) && localData.education.length > 0
      ? localData.education
      : [{}]
    : resumeData.education || [];

  const ProjectToShow = editMode
    ? Array.isArray(localData.project) && localData.project.length > 0
      ? localData.project
      : [{}]
    : resumeData.project || [];

  const achievementsToShow = editMode
    ? Array.isArray(localData.achievements) && localData.achievements.length > 0
      ? localData.achievements
      : [{}]
    : resumeData.achievements || [];

  const certificationsToShow = editMode
    ? Array.isArray(localData.certifications) &&
      localData.certifications.length > 0
      ? localData.certifications
      : [{}]
    : resumeData.certifications || [];

  // === add/remove handlers ===
  const handleAddSkill = () => {
    const current = Array.isArray(localData.skills) ? localData.skills : [];
    const updated = [...current, ""];
    handleFieldChange("skills", updated);
  };

  const handleSkillChange = (index, value) => {
    const current = Array.isArray(localData.skills) ? localData.skills : [];
    const updated = [...current];
    updated[index] = value;
    handleFieldChange("skills", updated);
  };

  const handleRemoveSkill = (index) => {
    const current = Array.isArray(localData.skills) ? localData.skills : [];
    const updated = current.filter((_, i) => i !== index);
    handleFieldChange("skills", updated);
  };

  const emptyExperience = {
    title: "",
    date: "",
    companyName: "",
    companyLocation: "",
  };

  const handleAddExperience = () => {
    const current = Array.isArray(localData.experience)
      ? localData.experience
      : [];
    const updated = [...current, { ...emptyExperience }];
    setLocalData({ ...localData, experience: updated });
  };

  const handleRemoveExperience = (index) => {
    const current = Array.isArray(localData.experience)
      ? localData.experience
      : [];
    const updated = current.filter((_, i) => i !== index);
    setLocalData({ ...localData, experience: updated });
  };

  const emptyEducation = {
    degree: "",
    duration: "",
    institution: "",
    location: "",
  };

  const handleAddEducation = () => {
    const current = Array.isArray(localData.education)
      ? localData.education
      : [];
    const updated = [...current, { ...emptyEducation }];
    setLocalData({ ...localData, education: updated });
  };

  const handleRemoveEducation = (index) => {
    const current = Array.isArray(localData.education)
      ? localData.education
      : [];
    const updated = current.filter((_, i) => i !== index);
    setLocalData({ ...localData, education: updated });
  };

  const emptyProject = {
    title: "",
    description: "",
    technologies: "",
    livedemourl: "",
    githuburl: "",
  };

  const handleAddProject = () => {
    const current = Array.isArray(localData.project) ? localData.project : [];
    const updated = [...current, { ...emptyProject }];
    setLocalData({ ...localData, project: updated });
  };

  const handleRemoveProject = (index) => {
    const current = Array.isArray(localData.project) ? localData.project : [];
    const updated = current.filter((_, i) => i !== index);
    setLocalData({ ...localData, project: updated });
  };

  const emptyAchievement = {
    title: "",
    description: "",
    year: "",
  };

  const handleAddAchievement = () => {
    const current = Array.isArray(localData.achievements)
      ? localData.achievements
      : [];
    const updated = [...current, { ...emptyAchievement }];
    setLocalData({ ...localData, achievements: updated });
  };

  const handleRemoveAchievement = (index) => {
    const current = Array.isArray(localData.achievements)
      ? localData.achievements
      : [];
    const updated = current.filter((_, i) => i !== index);
    setLocalData({ ...localData, achievements: updated });
  };

  const emptyCertification = {
    name: "",
    year: "",
  };

  const handleAddCertification = () => {
    const current = Array.isArray(localData.certifications)
      ? localData.certifications
      : [];
    const updated = [...current, { ...emptyCertification }];
    setLocalData({ ...localData, certifications: updated });
  };

  const handleRemoveCertification = (index) => {
    const current = Array.isArray(localData.certifications)
      ? localData.certifications
      : [];
    const updated = current.filter((_, i) => i !== index);
    setLocalData({ ...localData, certifications: updated });
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f9fafb" }}>
      <Navbar />
      <div style={{ display: "flex" }}>
        <Sidebar onEnhance={handleEnhance} resumeRef={resumeRef} />

        <div
          style={{
            flexGrow: 1,
            padding: "2.5rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {/* Page container */}
          <div
            ref={resumeRef}
            style={{
              fontFamily: "Arial, sans-serif",
              width: "210mm",
              minHeight: "297mm",
              maxWidth: "800px",
              margin: "0 auto",
              padding: "30px",
              backgroundColor: "#fff",
              color: "#333",
              boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
              border: "1px solid #ddd",
              boxSizing: "border-box",
              pageBreakAfter: "always",
            }}
          >
            {/* Header */}
            <div
              style={{
                textAlign: "center",
                marginBottom: "20px",
                borderBottom: "2px solid #ff7b25",
                paddingBottom: "20px",
                position: "relative",
              }}
            >
              {editMode ? (
                <>
                  <input
                    type="text"
                    value={localData.name}
                    placeholder="your name"
                    onChange={(e) => handleFieldChange("name", e.target.value)}
                    style={{
                      fontSize: "28px",
                      fontWeight: "bold",
                      color: "#ff7b25",
                      marginBottom: "5px",
                      textTransform: "uppercase",
                      textAlign: "center",
                      border: "1px solid #ddd",
                      padding: "5px",
                      width: "100%",
                    }}
                  />
                  <input
                    type="text"
                    value={localData.role}
                    placeholder="your role"
                    onChange={(e) => handleFieldChange("role", e.target.value)}
                    style={{
                      fontSize: "18px",
                      color: "#ff7b25",
                      marginBottom: "15px",
                      textTransform: "uppercase",
                      textAlign: "center",
                      border: "1px solid #ddd",
                      padding: "5px",
                      width: "100%",
                    }}
                  />
                </>
              ) : (
                <>
                  <h1
                    style={{
                      fontSize: "28px",
                      fontWeight: "bold",
                      color: "#ff7b25",
                      marginBottom: "5px",
                      textTransform: "uppercase",
                      margin: "0",
                    }}
                  >
                    {resumeData.name}
                  </h1>
                  <h2
                    style={{
                      fontSize: "18px",
                      fontWeight: "bold",
                      color: "#ff7b25",
                      marginBottom: "15px",
                      textTransform: "uppercase",
                      margin: "5px 0 15px 0",
                    }}
                  >
                    {resumeData.role}
                  </h2>
                </>
              )}

              {/* Contact Info */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                {editMode ? (
                  <>
                    {/* Row 1: phone, email, location, linkedin */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        flexWrap: "wrap",
                        gap: "20px",
                      }}
                    >
                      {contactFields.slice(0, 4).map(({ key, icon }) => (
                        <div
                          key={key}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            fontSize: "14px",
                          }}
                        >
                          <span
                            style={{
                              color: "#ff7b25",
                              marginRight: "5px",
                              fontWeight: "bold",
                            }}
                          >
                            {icon}
                          </span>
                          <input
                            type="text"
                            value={localData[key] || ""}
                            onChange={(e) =>
                              handleFieldChange(key, e.target.value)
                            }
                            style={{
                              border: "1px solid #ddd",
                              padding: "2px 5px",
                              fontSize: "14px",
                            }}
                          />
                        </div>
                      ))}
                    </div>

                    {/* Row 2: github, portfolio */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        flexWrap: "wrap",
                        gap: "20px",
                      }}
                    >
                      {contactFields.slice(4).map(({ key, icon }) => (
                        <div
                          key={key}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            fontSize: "14px",
                          }}
                        >
                          <span
                            style={{
                              color: "#ff7b25",
                              marginRight: "5px",
                              fontWeight: "bold",
                            }}
                          >
                            {icon}
                          </span>
                          <input
                            type="text"
                            value={localData[key] || ""}
                            onChange={(e) =>
                              handleFieldChange(key, e.target.value)
                            }
                            style={{
                              border: "1px solid #ddd",
                              padding: "2px 5px",
                              fontSize: "14px",
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    {/* Row 1 */}
                    {(() => {
                      const filledTop = contactFields
                        .slice(0, 4)
                        .filter(
                          ({ key }) =>
                            (resumeData[key] || "").toString().trim() !== ""
                        );
                      if (filledTop.length === 0) return null;
                      return (
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            flexWrap: "wrap",
                            gap: "20px",
                          }}
                        >
                          {filledTop.map(({ key, icon }) => (
                            <div
                              key={key}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                fontSize: "14px",
                              }}
                            >
                              <span
                                style={{
                                  color: "#ff7b25",
                                  marginRight: "5px",
                                  fontWeight: "bold",
                                }}
                              >
                                {icon}
                              </span>
                              <span>{resumeData[key]}</span>
                            </div>
                          ))}
                        </div>
                      );
                    })()}

                    {/* Row 2 */}
                    {(() => {
                      const filledBottom = contactFields
                        .slice(4)
                        .filter(
                          ({ key }) =>
                            (resumeData[key] || "").toString().trim() !== ""
                        );
                      if (filledBottom.length === 0) return null;
                      return (
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            flexWrap: "wrap",
                            gap: "20px",
                          }}
                        >
                          {filledBottom.map(({ key, icon }) => (
                            <div
                              key={key}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                fontSize: "14px",
                              }}
                            >
                              <span
                                style={{
                                  color: "#ff7b25",
                                  marginRight: "5px",
                                  fontWeight: "bold",
                                }}
                              >
                                {icon}
                              </span>
                              <span>{resumeData[key]}</span>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </>
                )}
              </div>
            </div>

            {/* Summary */}
            {(editMode || hasSummary(resumeData)) && (
              <div style={{ marginBottom: "25px", position: "relative" }}>
                <h3
                  style={{
                    fontSize: "18px",
                    fontWeight: "bold",
                    color: "#ff7b25",
                    textTransform: "uppercase",
                    borderBottom: "1px solid #ddd",
                    paddingBottom: "5px",
                    marginBottom: "15px",
                  }}
                >
                  PROFESSIONAL SUMMARY
                </h3>
                {editMode ? (
                  <textarea
                    value={localData.summary || ""}
                    onChange={(e) =>
                      handleFieldChange("summary", e.target.value)
                    }
                    style={{
                      fontSize: "14px",
                      lineHeight: "1.5",
                      width: "100%",
                      minHeight: "80px",
                      border: "1px solid #ddd",
                      padding: "10px",
                      resize: "vertical",
                    }}
                  />
                ) : (
                  <p
                    style={{
                      fontSize: "14px",
                      lineHeight: "1.5",
                      margin: "0",
                    }}
                  >
                    {resumeData.summary}
                  </p>
                )}
              </div>
            )}

            {/* Skills */}
            {(editMode || hasSkills(resumeData)) && (
              <div style={{ marginBottom: "25px", position: "relative" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "15px",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "18px",
                      fontWeight: "bold",
                      color: "#ff7b25",
                      textTransform: "uppercase",
                      borderBottom: "1px solid #ddd",
                      paddingBottom: "5px",
                      marginBottom: 0,
                      flex: 1,
                    }}
                  >
                    SKILLS
                  </h3>

                  {editMode && (
                    <button
                      type="button"
                      onClick={handleAddSkill}
                      style={{
                        marginLeft: "10px",
                        padding: "5px 10px",
                        fontSize: "12px",
                        borderRadius: "4px",
                        border: "1px solid #ff7b25",
                        backgroundColor: "white",
                        color: "#ff7b25",
                        cursor: "pointer",
                      }}
                    >
                      + Add Skill
                    </button>
                  )}
                </div>

                {editMode ? (
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "10px",
                      marginTop: "10px",
                    }}
                  >
                    {skillsToShow.map((skill, index) => (
                      <div
                        key={index}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          border: "1px solid #ddd",
                          borderRadius: "4px",
                          padding: "4px 6px",
                          minWidth: "120px",
                          gap: "6px",
                        }}
                      >
                        <input
                          type="text"
                          value={skill}
                          onChange={(e) => handleSkillChange(index, e.target.value)}
                          placeholder="Skill"
                          style={{
                            border: "none",
                            outline: "none",
                            fontSize: "13px",
                            flex: 1,
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(index)}
                          style={{
                            border: "none",
                            background: "transparent",
                            cursor: "pointer",
                            fontWeight: "bold",
                            fontSize: "14px",
                            lineHeight: 1,
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "10px",
                      marginTop: "10px",
                    }}
                  >
                    {skillsToShow.map((skill, index) => (
                      <span
                        key={index}
                        style={{
                          backgroundColor: "#ff7b25",
                          color: "white",
                          padding: "5px 10px",
                          borderRadius: "3px",
                          fontSize: "13px",
                          display: "flex",
                          alignItems: "center",
                          gap: "5px",
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
            {/* Languages */}
            {(editMode || hasLanguages(resumeData)) && (
              <div style={{ marginBottom: "25px", position: "relative" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "15px",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "18px",
                      fontWeight: "bold",
                      color: "#ff7b25",
                      textTransform: "uppercase",
                      borderBottom: "1px solid #ddd",
                      paddingBottom: "5px",
                      marginBottom: 0,
                      flex: 1,
                    }}
                  >
                    LANGUAGES
                  </h3>

                  {editMode && (
                    <button
                      type="button"
                      onClick={handleAddLanguage}
                      style={{
                        marginLeft: "10px",
                        padding: "5px 10px",
                        fontSize: "12px",
                        borderRadius: "4px",
                        border: "1px solid #ff7b25",
                        backgroundColor: "white",
                        color: "#ff7b25",
                        cursor: "pointer",
                      }}
                    >
                      + Add Language
                    </button>
                  )}
                </div>

                {editMode ? (
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "10px",
                      marginTop: "10px",
                    }}
                  >
                    {languagesToShow.map((language, index) => (
                      <div
                        key={index}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          border: "1px solid #ddd",
                          borderRadius: "4px",
                          padding: "4px 6px",
                          minWidth: "120px",
                          gap: "6px",
                        }}
                      >
                        <input
                          type="text"
                          value={language}
                          onChange={(e) => handleLanguageChange(index, e.target.value)}
                          placeholder="Language"
                          style={{
                            border: "none",
                            outline: "none",
                            fontSize: "13px",
                            flex: 1,
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveLanguage(index)}
                          style={{
                            border: "none",
                            background: "transparent",
                            cursor: "pointer",
                            fontWeight: "bold",
                            fontSize: "14px",
                            lineHeight: 1,
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "10px",
                      marginTop: "10px",
                    }}
                  >
                    {languagesToShow.map((language, index) => (
                      <span
                        key={index}
                        style={{
                          backgroundColor: "#ff7b25",
                          color: "white",
                          padding: "5px 10px",
                          borderRadius: "3px",
                          fontSize: "13px",
                          display: "flex",
                          alignItems: "center",
                          gap: "5px",
                        }}
                      >
                        {language}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
            {/* Interests */}
            {(editMode || hasInterests(resumeData)) && (
              <div style={{ marginBottom: "25px", position: "relative" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "15px",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "18px",
                      fontWeight: "bold",
                      color: "#ff7b25",
                      textTransform: "uppercase",
                      borderBottom: "1px solid #ddd",
                      paddingBottom: "5px",
                      marginBottom: 0,
                      flex: 1,
                    }}
                  >
                    INTERESTS
                  </h3>

                  {editMode && (
                    <button
                      type="button"
                      onClick={handleAddInterest}
                      style={{
                        marginLeft: "10px",
                        padding: "5px 10px",
                        fontSize: "12px",
                        borderRadius: "4px",
                        border: "1px solid #ff7b25",
                        backgroundColor: "white",
                        color: "#ff7b25",
                        cursor: "pointer",
                      }}
                    >
                      + Add Interest
                    </button>
                  )}
                </div>

                {editMode ? (
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "10px",
                      marginTop: "10px",
                    }}
                  >
                    {interestsToShow.map((interest, index) => (
                      <div
                        key={index}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          border: "1px solid #ddd",
                          borderRadius: "4px",
                          padding: "4px 6px",
                          minWidth: "120px",
                          gap: "6px",
                        }}
                      >
                        <input
                          type="text"
                          value={interest}
                          onChange={(e) => handleInterestChange(index, e.target.value)}
                          placeholder="Interest"
                          style={{
                            border: "none",
                            outline: "none",
                            fontSize: "13px",
                            flex: 1,
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveInterest(index)}
                          style={{
                            border: "none",
                            background: "transparent",
                            cursor: "pointer",
                            fontWeight: "bold",
                            fontSize: "14px",
                            lineHeight: 1,
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "10px",
                      marginTop: "10px",
                    }}
                  >
                    {interestsToShow.map((interest, index) => (
                      <span
                        key={index}
                        style={{
                          backgroundColor: "#ff7b25",
                          color: "white",
                          padding: "5px 10px",
                          borderRadius: "3px",
                          fontSize: "13px",
                          display: "flex",
                          alignItems: "center",
                          gap: "5px",
                        }}
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Experience */}
            {(editMode || hasExperience(resumeData)) && (
              <div style={{ marginBottom: "25px", position: "relative" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "15px",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "18px",
                      fontWeight: "bold",
                      color: "#ff7b25",
                      textTransform: "uppercase",
                      borderBottom: "1px solid #ddd",
                      paddingBottom: "5px",
                      marginBottom: 0,
                      flex: 1,
                    }}
                  >
                    PROFESSIONAL EXPERIENCE
                  </h3>

                  {editMode && (
                    <button
                      type="button"
                      onClick={handleAddExperience}
                      style={{
                        marginLeft: "10px",
                        padding: "5px 10px",
                        fontSize: "12px",
                        borderRadius: "4px",
                        border: "1px solid #ff7b25",
                        backgroundColor: "white",
                        color: "#ff7b25",
                        cursor: "pointer",
                      }}
                    >
                      + Add Experience
                    </button>
                  )}
                </div>

                {(editMode
                  ? Array.isArray(localData.experience) &&
                    localData.experience.length > 0
                    ? localData.experience
                    : [emptyExperience]
                  : experienceToShow
                ).map((exp, index) => (
                  <div
                    key={index}
                    style={{
                      marginBottom: "20px",
                      border: editMode ? "1px solid #eee" : "none",
                      borderRadius: "4px",
                      padding: editMode ? "10px" : "0",
                      position: "relative",
                    }}
                  >
                    {editMode && (
                      <button
                        type="button"
                        onClick={() => handleRemoveExperience(index)}
                        style={{
                          position: "absolute",
                          top: "5px",
                          right: "5px",
                          border: "none",
                          background: "transparent",
                          cursor: "pointer",
                          fontWeight: "bold",
                          fontSize: "16px",
                          lineHeight: 1,
                        }}
                      >
                        ×
                      </button>
                    )}

                    {/* Title + Date */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontWeight: "bold",
                        marginBottom: "5px",
                        flexWrap: "wrap",
                        gap: "8px",
                      }}
                    >
                      {editMode ? (
                        <>
                          <input
                            type="text"
                            value={localData.experience?.[index]?.title || ""}
                            onChange={(e) =>
                              handleArrayFieldChange(
                                "experience",
                                index,
                                "title",
                                e.target.value
                              )
                            }
                            placeholder="Job Title"
                            style={{
                              border: "1px solid #ddd",
                              padding: "2px 5px",
                              marginBottom: "5px",
                              flex: "1",
                              minWidth: "150px",
                            }}
                          />
                          <input
                            type="text"
                            value={
                              typeof localData.experience?.[index]?.date ===
                                "string"
                                ? localData.experience?.[index]?.date.trim()
                                : ""
                            }
                            onChange={(e) =>
                              handleArrayFieldChange(
                                "experience",
                                index,
                                "date",
                                e.target.value
                              )
                            }
                            placeholder="Date / Duration"
                            style={{
                              border: "1px solid #ddd",
                              padding: "2px 5px",
                              marginBottom: "5px",
                              minWidth: "120px",
                            }}
                          />
                        </>
                      ) : (
                        <>
                          <span>{exp.title}</span>
                          <span>{exp.date}</span>
                        </>
                      )}
                    </div>

                    {/* Company + Location */}
                    <div style={{ fontStyle: "italic", marginBottom: "5px" }}>
                      {editMode ? (
                        <>
                          <input
                            type="text"
                            value={
                              localData.experience?.[index]?.companyName || ""
                            }
                            onChange={(e) =>
                              handleArrayFieldChange(
                                "experience",
                                index,
                                "companyName",
                                e.target.value
                              )
                            }
                            placeholder="Company Name"
                            style={{
                              border: "1px solid #ddd",
                              padding: "2px 5px",
                              marginBottom: "5px",
                              marginRight: "10px",
                              minWidth: "150px",
                            }}
                          />
                          <input
                            type="text"
                            value={
                              localData.experience?.[index]?.companyLocation ||
                              ""
                            }
                            onChange={(e) =>
                              handleArrayFieldChange(
                                "experience",
                                index,
                                "companyLocation",
                                e.target.value
                              )
                            }
                            placeholder="Location"
                            style={{
                              border: "1px solid #ddd",
                              padding: "2px 5px",
                              marginBottom: "5px",
                              minWidth: "120px",
                            }}
                          />
                        </>
                      ) : (
                        <span>
                          {exp.companyName}, {exp.companyLocation}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Education */}
            {(editMode || hasEducation(resumeData)) && (
              <div style={{ marginBottom: "25px", position: "relative" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "15px",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "18px",
                      fontWeight: "bold",
                      color: "#ff7b25",
                      textTransform: "uppercase",
                      borderBottom: "1px solid #ddd",
                      paddingBottom: "5px",
                      marginBottom: 0,
                      flex: 1,
                    }}
                  >
                    EDUCATION
                  </h3>

                  {editMode && (
                    <button
                      type="button"
                      onClick={handleAddEducation}
                      style={{
                        marginLeft: "10px",
                        padding: "5px 10px",
                        fontSize: "12px",
                        borderRadius: "4px",
                        border: "1px solid #ff7b25",
                        backgroundColor: "white",
                        color: "#ff7b25",
                        cursor: "pointer",
                      }}
                    >
                      + Add Education
                    </button>
                  )}
                </div>

                {(editMode
                  ? Array.isArray(localData.education) &&
                    localData.education.length > 0
                    ? localData.education
                    : [emptyEducation]
                  : educationToShow
                ).map((edu, index) => (
                  <div
                    key={index}
                    style={{
                      marginBottom: "20px",
                      border: editMode ? "1px solid #eee" : "none",
                      borderRadius: "4px",
                      padding: editMode ? "10px" : "0",
                      position: "relative",
                    }}
                  >
                    {editMode && (
                      <button
                        type="button"
                        onClick={() => handleRemoveEducation(index)}
                        style={{
                          position: "absolute",
                          top: "5px",
                          right: "5px",
                          border: "none",
                          background: "transparent",
                          cursor: "pointer",
                          fontWeight: "bold",
                          fontSize: "16px",
                          lineHeight: 1,
                        }}
                      >
                        ×
                      </button>
                    )}

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontWeight: "bold",
                        marginBottom: "5px",
                        flexWrap: "wrap",
                        gap: "8px",
                      }}
                    >
                      {editMode ? (
                        <>
                          <input
                            type="text"
                            value={localData.education?.[index]?.degree || ""}
                            onChange={(e) =>
                              handleArrayFieldChange(
                                "education",
                                index,
                                "degree",
                                e.target.value
                              )
                            }
                            placeholder="Degree / Program"
                            style={{
                              border: "1px solid #ddd",
                              padding: "2px 5px",
                              marginBottom: "5px",
                              flex: "1",
                              minWidth: "150px",
                            }}
                          />
                          <input
                            type="text"
                            value={
                              localData.education?.[index]?.duration || ""
                            }
                            onChange={(e) =>
                              handleArrayFieldChange(
                                "education",
                                index,
                                "duration",
                                e.target.value
                              )
                            }
                            placeholder="Duration / Year"
                            style={{
                              border: "1px solid #ddd",
                              padding: "2px 5px",
                              marginBottom: "5px",
                              minWidth: "120px",
                            }}
                          />
                        </>
                      ) : (
                        <>
                          <span>{edu.degree}</span>
                          <span>{edu.duration}</span>
                        </>
                      )}
                    </div>

                    <div style={{ fontStyle: "italic", marginBottom: "5px" }}>
                      {editMode ? (
                        <>
                          <input
                            type="text"
                            value={
                              localData.education?.[index]?.institution || ""
                            }
                            onChange={(e) =>
                              handleArrayFieldChange(
                                "education",
                                index,
                                "institution",
                                e.target.value
                              )
                            }
                            placeholder="Institution"
                            style={{
                              border: "1px solid #ddd",
                              padding: "2px 5px",
                              marginBottom: "5px",
                              marginRight: "10px",
                              minWidth: "150px",
                            }}
                          />
                          <input
                            type="text"
                            value={
                              localData.education?.[index]?.location || ""
                            }
                            onChange={(e) =>
                              handleArrayFieldChange(
                                "education",
                                index,
                                "location",
                                e.target.value
                              )
                            }
                            placeholder="Location"
                            style={{
                              border: "1px solid #ddd",
                              padding: "2px 5px",
                              marginBottom: "5px",
                              minWidth: "120px",
                            }}
                          />
                        </>
                      ) : (
                        <span>
                          {edu.institution}
                          {edu.location ? `, ${edu.location}` : ""}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Projects */}
            {(editMode || hasProject(resumeData)) && (
              <div style={{ marginBottom: "25px", position: "relative" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "15px",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "18px",
                      fontWeight: "bold",
                      color: "#ff7b25",
                      textTransform: "uppercase",
                      borderBottom: "1px solid #ddd",
                      paddingBottom: "5px",
                      marginBottom: 0,
                      flex: 1,
                    }}
                  >
                    Project
                  </h3>

                  {editMode && (
                    <button
                      type="button"
                      onClick={handleAddProject}
                      style={{
                        marginLeft: "10px",
                        padding: "5px 10px",
                        fontSize: "12px",
                        borderRadius: "4px",
                        border: "1px solid #ff7b25",
                        backgroundColor: "white",
                        color: "#ff7b25",
                        cursor: "pointer",
                      }}
                    >
                      + Add Project
                    </button>
                  )}
                </div>

                {(editMode
                  ? Array.isArray(localData.project) &&
                    localData.project.length > 0
                    ? localData.project
                    : [emptyProject]
                  : ProjectToShow
                ).map((pro, index) => (
                  <div
                    key={index}
                    style={{
                      marginBottom: "20px",
                      border: editMode ? "1px solid #eee" : "none",
                      borderRadius: "4px",
                      padding: editMode ? "10px" : "0",
                      position: "relative",
                    }}
                  >
                    {editMode && (
                      <button
                        type="button"
                        onClick={() => handleRemoveProject(index)}
                        style={{
                          position: "absolute",
                          top: "5px",
                          right: "5px",
                          border: "none",
                          background: "transparent",
                          cursor: "pointer",
                          fontWeight: "bold",
                          fontSize: "16px",
                          lineHeight: 1,
                        }}
                      >
                        ×
                      </button>
                    )}

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontWeight: "bold",
                        marginBottom: "5px",
                        flexWrap: "wrap",
                        gap: "8px",
                      }}
                    >
                      {editMode ? (
                        <>
                          <input
                            type="text"
                            value={localData.project?.[index]?.title || ""}
                            onChange={(e) =>
                              handleArrayFieldChange(
                                "project",
                                index,
                                "title",
                                e.target.value
                              )
                            }
                            placeholder="Project Title"
                            style={{
                              border: "1px solid #ddd",
                              padding: "2px 5px",
                              marginBottom: "5px",
                              flex: "1",
                              minWidth: "150px",
                            }}
                          />
                          <textarea
                            value={
                              localData.project?.[index]?.description || ""
                            }
                            onChange={(e) =>
                              handleArrayFieldChange(
                                "project",
                                index,
                                "description",
                                e.target.value
                              )
                            }
                            placeholder="Project Description"
                            style={{
                              border: "1px solid #ddd",
                              padding: "2px 5px",
                              marginBottom: "5px",
                              minWidth: "120px",
                            }}
                          />
                        </>
                      ) : (
                        <>
                          <span>{pro.title}</span>
                          <span>{pro.description}</span>
                        </>
                      )}
                    </div>

                    <div style={{ fontStyle: "italic", marginBottom: "5px" }}>
                      {editMode ? (
                        <>
                          <input
                            type="text"
                            value={
                              localData.project?.[index]?.technologies || ""
                            }
                            onChange={(e) =>
                              handleArrayFieldChange(
                                "project",
                                index,
                                "technologies",
                                e.target.value
                              )
                            }
                            placeholder="Technologies"
                            style={{
                              border: "1px solid #ddd",
                              padding: "2px 5px",
                              marginBottom: "5px",
                              marginRight: "10px",
                              minWidth: "150px",
                            }}
                          />
                          <input
                            type="text"
                            value={
                              localData.project?.[index]?.livedemourl || ""
                            }
                            onChange={(e) =>
                              handleArrayFieldChange(
                                "project",
                                index,
                                "livedemourl",
                                e.target.value
                              )
                            }
                            placeholder="Livedemourl"
                            style={{
                              border: "1px solid #ddd",
                              padding: "2px 5px",
                              marginBottom: "5px",
                              minWidth: "120px",
                            }}
                          />
                          <input
                            type="text"
                            value={localData.project?.[index]?.githuburl || ""}
                            onChange={(e) =>
                              handleArrayFieldChange(
                                "project",
                                index,
                                "githuburl",
                                e.target.value
                              )
                            }
                            placeholder="GithubUrl"
                            style={{
                              border: "1px solid #ddd",
                              padding: "2px 5px",
                              marginBottom: "5px",
                              minWidth: "120px",
                              marginLeft: "20px"
                            }}
                          />
                        </>
                      ) : (
                        <span>
                          {pro.technologies}
                          {pro.livedemourl ? `, ${pro.livedemourl}` : ""}
                          {pro.githuburl ? `, ${pro.githuburl}` : ""}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Achievements */}
            {(editMode || hasAchievements(resumeData)) && (
              <div style={{ marginBottom: "25px", position: "relative" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "15px",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "18px",
                      fontWeight: "bold",
                      color: "#ff7b25",
                      textTransform: "uppercase",
                      borderBottom: "1px solid #ddd",
                      paddingBottom: "5px",
                      marginBottom: 0,
                      flex: 1,
                    }}
                  >
                    ACHIEVEMENTS
                  </h3>

                  {editMode && (
                    <button
                      type="button"
                      onClick={handleAddAchievement}
                      style={{
                        marginLeft: "10px",
                        padding: "5px 10px",
                        fontSize: "12px",
                        borderRadius: "4px",
                        border: "1px solid #ff7b25",
                        backgroundColor: "white",
                        color: "#ff7b25",
                        cursor: "pointer",
                      }}
                    >
                      + Add Achievement
                    </button>
                  )}
                </div>

                {(editMode
                  ? Array.isArray(localData.achievements) &&
                    localData.achievements.length > 0
                    ? localData.achievements
                    : [emptyAchievement]
                  : achievementsToShow
                ).map((ach, index) => (
                  <div
                    key={index}
                    style={{
                      marginBottom: "20px",
                      border: editMode ? "1px solid #eee" : "none",
                      borderRadius: "4px",
                      padding: editMode ? "10px" : "0",
                      position: "relative",
                    }}
                  >
                    {editMode && (
                      <button
                        type="button"
                        onClick={() => handleRemoveAchievement(index)}
                        style={{
                          position: "absolute",
                          top: "5px",
                          right: "5px",
                          border: "none",
                          background: "transparent",
                          cursor: "pointer",
                          fontWeight: "bold",
                          fontSize: "16px",
                          lineHeight: 1,
                        }}
                      >
                        ×
                      </button>
                    )}

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontWeight: "bold",
                        marginBottom: "5px",
                        flexWrap: "wrap",
                        gap: "8px",
                      }}
                    >
                      {editMode ? (
                        <>
                          <input
                            type="text"
                            value={localData.achievements?.[index]?.title || ""}
                            onChange={(e) =>
                              handleArrayFieldChange(
                                "achievements",
                                index,
                                "title",
                                e.target.value
                              )
                            }
                            placeholder="Achievement title"
                            style={{
                              border: "1px solid #ddd",
                              padding: "2px 5px",
                              marginBottom: "5px",
                              flex: "1",
                              minWidth: "150px",
                            }}
                          />
                          <input
                            type="text"
                            value={localData.achievements?.[index]?.year || ""}
                            onChange={(e) =>
                              handleArrayFieldChange(
                                "achievements",
                                index,
                                "year",
                                e.target.value
                              )
                            }
                            placeholder="Year"
                            style={{
                              border: "1px solid #ddd",
                              padding: "2px 5px",
                              marginBottom: "5px",
                              minWidth: "80px",
                            }}
                          />
                        </>
                      ) : (
                        <>
                          <span>{ach.title}</span>
                          <span>{ach.year}</span>
                        </>
                      )}
                    </div>

                    <div style={{ marginTop: "5px" }}>
                      {editMode ? (
                        <textarea
                          value={
                            localData.achievements?.[index]?.description || ""
                          }
                          onChange={(e) =>
                            handleArrayFieldChange(
                              "achievements",
                              index,
                              "description",
                              e.target.value
                            )
                          }
                          placeholder="Describe the achievement"
                          style={{
                            width: "100%",
                            minHeight: "60px",
                            border: "1px solid #ddd",
                            padding: "5px",
                            fontSize: "14px",
                            resize: "vertical",
                          }}
                        />
                      ) : (
                        ach.description && (
                          <p style={{ margin: 0, fontSize: "14px" }}>
                            {ach.description}
                          </p>
                        )
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Certifications */}
            {(editMode || hasCertifications(resumeData)) && (
              <div style={{ marginBottom: "25px", position: "relative" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "15px",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "18px",
                      fontWeight: "bold",
                      color: "#ff7b25",
                      textTransform: "uppercase",
                      borderBottom: "1px solid #ddd",
                      paddingBottom: "5px",
                      marginBottom: 0,
                      flex: 1,
                    }}
                  >
                    CERTIFICATIONS
                  </h3>

                  {editMode && (
                    <button
                      type="button"
                      onClick={handleAddCertification}
                      style={{
                        marginLeft: "10px",
                        padding: "5px 10px",
                        fontSize: "12px",
                        borderRadius: "4px",
                        border: "1px solid #ff7b25",
                        backgroundColor: "white",
                        color: "#ff7b25",
                        cursor: "pointer",
                      }}
                    >
                      + Add Certification
                    </button>
                  )}
                </div>

                {(editMode
                  ? Array.isArray(localData.certifications) &&
                    localData.certifications.length > 0
                    ? localData.certifications
                    : [emptyCertification]
                  : certificationsToShow
                ).map((cert, index) => (
                  <div
                    key={index}
                    style={{
                      marginBottom: "15px",
                      border: editMode ? "1px solid #eee" : "none",
                      borderRadius: "4px",
                      padding: editMode ? "10px" : "0",
                      position: "relative",
                    }}
                  >
                    {editMode && (
                      <button
                        type="button"
                        onClick={() => handleRemoveCertification(index)}
                        style={{
                          position: "absolute",
                          top: "5px",
                          right: "5px",
                          border: "none",
                          background: "transparent",
                          cursor: "pointer",
                          fontWeight: "bold",
                          fontSize: "16px",
                          lineHeight: 1,
                        }}
                      >
                        ×
                      </button>
                    )}

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontWeight: "bold",
                        marginBottom: "5px",
                        flexWrap: "wrap",
                        gap: "8px",
                      }}
                    >
                      {editMode ? (
                        <>
                          <input
                            type="text"
                            value={localData.certifications?.[index]?.name || ""}
                            onChange={(e) =>
                              handleArrayFieldChange(
                                "certifications",
                                index,
                                "name",
                                e.target.value
                              )
                            }
                            placeholder="Certification name"
                            style={{
                              border: "1px solid #ddd",
                              padding: "2px 5px",
                              marginBottom: "5px",
                              flex: "1",
                              minWidth: "150px",
                            }}
                          />
                          <input
                            type="text"
                            value={localData.certifications?.[index]?.year || ""}
                            onChange={(e) =>
                              handleArrayFieldChange(
                                "certifications",
                                index,
                                "year",
                                e.target.value
                              )
                            }
                            placeholder="Year"
                            style={{
                              border: "1px solid #ddd",
                              padding: "2px 5px",
                              marginBottom: "5px",
                              minWidth: "80px",
                            }}
                          />
                        </>
                      ) : (
                        <>
                          <span>{cert.name}</span>
                          <span>{cert.year}</span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Edit/Save/Cancel Buttons */}
          <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
            {editMode ? (
              <>
                <button
                  onClick={handleSave}
                  style={{
                    backgroundColor: "#16a34a",
                    color: "#ffffff",
                    padding: "0.5rem 1rem",
                    borderRadius: "0.375rem",
                    margin: "0 0.5rem",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  style={{
                    backgroundColor: "#9ca3af",
                    color: "#ffffff",
                    padding: "0.5rem 1rem",
                    borderRadius: "0.375rem",
                    margin: "0 0.5rem",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditMode(true)}
                style={{
                  backgroundColor: "#2563eb",
                  color: "#ffffff",
                  padding: "0.5rem 1rem",
                  borderRadius: "0.375rem",
                  margin: "0 0.5rem",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Edit
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Template8;

