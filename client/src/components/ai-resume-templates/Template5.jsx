import React, { useState, useRef, useEffect } from "react";
import Navbar from "../Navbar/Navbar";
import Sidebar from "../Sidebar/Sidebar";
import { useResume } from "../../context/ResumeContext";

const Template5 = () => {
  const resumeRef = useRef();
  const { resumeData, setResumeData } = useResume() || { resumeData: {}, setResumeData: () => {} };
  const [editMode, setEditMode] = useState(false);
  const [localData, setLocalData] = useState(resumeData);

  const getDefaulted = (data) => ({
  name: data?.name || "",
  role: data?.role || "",
  phone: data?.phone || "",
  email: data?.email || "",
  linkedin: data?.linkedin || "",
  location: data?.location || "",

  summary: data?.summary || "",

  experience: Array.isArray(data?.experience) ? data.experience : [],
  education: Array.isArray(data?.education) ? data.education : [],
  achievements: Array.isArray(data?.achievements) ? data.achievements : [],
  skills: Array.isArray(data?.skills) ? data.skills : [],
  courses: Array.isArray(data?.courses) ? data.courses : [],
  projects: Array.isArray(data?.projects) ? data.projects : []
});

  // UI State
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  useEffect(() => {
  setLocalData(getDefaulted(resumeData));
}, [resumeData]);


  // Section Settings
  const [sectionSettings, setSectionSettings] = useState({
    header: {
      showTitle: true,
      showPhone: true,
      showEmail: true,
      showLink: true,
      showLocation: true,
      uppercaseName: false,
    },
    summary: { showSummary: true },
    experience: { showExperience: true },
    education: { showEducation: true },
    achievements: { showAchievements: true },
    skills: { showSkills: true },
    courses: { showCourses: true },
    projects: { showProjects: true },
  });
  
  const [activeSection, setActiveSection] = useState(null);
  const [sectionsOrder, setSectionsOrder] = useState([
    "summary",
    "experience",
    "education",
    "achievements",
    "skills",
    "courses",
    "projects",
  ]);

  useEffect(() => {
    if (resumeData) {
      setLocalData(resumeData);
    }
  }, [resumeData]);

  useEffect(() => {
  if (!editMode) return;
  const timeout = setTimeout(() => {
    localStorage.setItem("resumeData", JSON.stringify(localData));
  }, 700);

  return () => clearTimeout(timeout);
}, [localData, editMode]);

  // ---- FIXED: STRICT DATA CHECKING FUNCTION ----
  const hasSectionData = (section) => {
    const data = editMode ? localData : resumeData;
    const content = data?.[section];

    // 1. If completely null/undefined, it's empty
    if (!content) return false;

    // 2. EDIT MODE: We allow empty sections so the inputs are visible to type in
    if (editMode) return true;

    // 3. VIEW MODE: STRICT CHECKS
    if (Array.isArray(content)) {
      if (content.length === 0) return false;

      // Filter through the array. If we find at least ONE item with actual text, return true.
      const hasValidItem = content.some((item) => {
        if (typeof item === 'string') return item.trim().length > 0;
        
        if (typeof item === 'object' && item !== null) {
          // Specific checks for complex sections
          if (section === 'experience') {
             return (item.companyName && item.companyName.trim().length > 0) || 
                    (item.title && item.title.trim().length > 0) ||
                    (item.description && item.description.trim().length > 0);
          }
          if (section === 'education') {
             return (item.institution && item.institution.trim().length > 0) || 
                    (item.degree && item.degree.trim().length > 0);
          }
          if (section === 'projects') {
             return (item.name && item.name.trim().length > 0) || 
                    (item.title && item.title.trim().length > 0) ||
                    (item.description && item.description.trim().length > 0);
          }
          if (section === 'courses') {
             return (item.title && item.title.trim().length > 0);
          }
          if (section === 'achievements') {
             // Handle both string achievements and object achievements
             if (item.keyAchievements) return item.keyAchievements.trim().length > 0;
             return Object.values(item).some(val => typeof val === 'string' && val.trim().length > 0);
          }
          // Generic fallback for other objects
          return Object.values(item).some(val => typeof val === 'string' && val.trim().length > 0);
        }
        return false;
      });

      return hasValidItem;
    }

    // 4. String checks (Summary)
    return typeof content === 'string' && content.trim().length > 0;
  };

  const handleEnhance = (section) => {
    console.log(`Enhancing section: ${section}`);
  };

  const handleSave = () => {
  const cleaned = getDefaulted(localData);

  // Save to global context
  setResumeData(cleaned);

  // Save to localStorage (Template-19 does this)
  localStorage.setItem("resumeData", JSON.stringify(cleaned));

  setEditMode(false);
};


  const handleCancel = () => {
    setLocalData(resumeData);
    setEditMode(false);
  };

  const handleRemoveSection = (section, index) => {
    if (index !== undefined) {
      setLocalData((prevData) => {
        if (Array.isArray(prevData[section])) {
          const updatedSection = [...prevData[section]];
          updatedSection.splice(index, 1);
          return { ...prevData, [section]: updatedSection };
        }
        return prevData;
      });
    } else {
      // Logic for hiding whole section toggle if needed
    }
  };

  const handleInputChange = (section, field, value, index) => {
    let updatedData = { ...localData };

    if (section && index !== undefined) {
      if (Array.isArray(updatedData[section])) {
        const updatedItem = { ...updatedData[section][index], [field]: value };
        const updatedSection = [...updatedData[section]];
        updatedSection[index] = updatedItem;
        updatedData = { ...updatedData, [section]: updatedSection };
      }
    } else if (section) {
      updatedData = { ...updatedData, [section]: value };
    } else {
      updatedData = { ...updatedData, [field]: value };
    }

    setLocalData(updatedData);
  };

  const handleAddSection = (section) => {
    if (section === 'summary') {
         if(!localData.summary) {
             setLocalData(prev => ({...prev, summary: ""}))
         }
         return;
    }

    const defaultItems = {
      experience: {
        title: "",
        companyName: "",
        date: "",
        companyLocation: "",
        description: "",
        accomplishment: ["", ""],
      },
      education: {
        degree: "",
        institution: "",
        duration: "",
        location: "",
        grade: "", 
      },
      achievements: { keyAchievements: "", describe: "" },
      courses: {
        title: "",
        description: "",
      },
      skills: "",
      projects: {
        name: "", 
        description: "",
        technologies: "",
        link: "",
        github: "",
      },
    };

    let newItem = defaultItems[section] || {};

    setLocalData((prev) => ({
      ...prev,
      [section]: [...(prev[section] || []), newItem],
    }));
    
    // Ensure visibility toggle is on
    setSectionSettings((prevSettings) => ({
        ...prevSettings,
        [section]: {
          ...prevSettings[section],
          [`show${section.charAt(0).toUpperCase() + section.slice(1)}`]: true,
        },
    }));
  };

  const handleSectionClick = (section) => setActiveSection(section === activeSection ? null : section);

  // --- STYLES ---
  const inputStyle = {
    width: "100%",
    padding: "0.5rem",
    marginBottom: "0.5rem",
    border: "1px solid #ccc",
    borderRadius: "0.25rem",
    fontSize: "0.9rem",
    backgroundColor: "#fff"
  };

  const labelStyle = {
    display: "block",
    fontSize: "0.75rem",
    fontWeight: "bold",
    color: "#6b7280",
    marginBottom: "0.2rem"
  };

  const emptySectionPlaceholderStyle = {
    padding: "1.5rem",
    border: "2px dashed #d1d5db",
    borderRadius: "0.5rem",
    textAlign: "center",
    color: "#6b7280",
    marginBottom: "1.5rem",
    backgroundColor: "rgba(249, 250, 251, 0.5)",
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const sectionTitles = {
    summary: "Summary",
    experience: "Experience",
    education: "Education",
    achievements: "Key Achievements",
    skills: "Skills",
    courses: "Courses",
    projects: "Projects"
  };

  // Helper to verify if a single item has data (used inside maps to prevent rendering empty dashes)
  const isItemEmpty = (item) => {
      if (!item) return true;
      if (typeof item === 'string') return item.trim().length === 0;
      return Object.values(item).every(val => !val || (typeof val === 'string' && val.trim() === ''));
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#fef3c7" }}>
      <Navbar />

      {loading && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
          <div style={{ backgroundColor: "white", padding: "2rem", borderRadius: "0.5rem", boxShadow: "0 10px 15px rgba(0,0,0,0.1)" }}>
            <p style={{ fontSize: "1.125rem", fontWeight: "600", color: "#374151" }}>Loading...</p>
          </div>
        </div>
      )}

      <div style={{ display: "flex" }}>
        <Sidebar onEnhance={handleEnhance} resumeRef={resumeRef} />

        <button
          style={{ position: "fixed", top: "1rem", left: "1rem", zIndex: 50, color: "white", background: "linear-gradient(to right, #fbbf24, #ec4899)", padding: "0.5rem", borderRadius: "50%", boxShadow: "0 4px 6px rgba(0,0,0,0.1)", display: sidebarOpen ? "none" : "block" }}
          className="md:hidden" onClick={() => setSidebarOpen(true)}
        >
          ☰
        </button>

        <div style={{ flexGrow: 1, padding: "1rem", marginLeft: "10rem", marginRight: "8rem", marginTop: "4rem" }} className="md:ml-72 mt-16 md:mt-0">
          <div
            ref={resumeRef}
            style={{ maxWidth: "100%", width: "95%", margin: "1.25rem auto", padding: "1.5rem", backgroundColor: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "0.5rem", boxShadow: "0 25px 50px rgba(0,0,0,0.25)" }}
            className="max-w-full mx-auto my-5 p-6 bg-gray-50 border border-gray-200 rounded-lg shadow-xl"
          >
            {/* --- HEADER SECTION --- */}
            <div style={{ textAlign: "center", marginBottom: "1.5rem", padding: "1rem" }}>
              {editMode ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxWidth: "400px", margin: "0 auto" }}>
                   <label style={labelStyle}>Full Name</label>
                   <input type="text" value={localData?.name || ""} onChange={(e) => handleInputChange(null, "name", e.target.value)} style={inputStyle} placeholder="Full Name" />
                   
                   <label style={labelStyle}>Job Title</label>
                   <input type="text" value={localData?.role || ""} onChange={(e) => handleInputChange(null, "role", e.target.value)} style={inputStyle} placeholder="Job Title" />
                   
                   <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                      <input type="text" value={localData?.phone || ""} onChange={(e) => handleInputChange(null, "phone", e.target.value)} style={inputStyle} placeholder="Phone" />
                      <input type="text" value={localData?.email || ""} onChange={(e) => handleInputChange(null, "email", e.target.value)} style={inputStyle} placeholder="Email" />
                      <input type="text" value={localData?.linkedin || ""} onChange={(e) => handleInputChange(null, "linkedin", e.target.value)} style={inputStyle} placeholder="LinkedIn/Link" />
                      <input type="text" value={localData?.location || ""} onChange={(e) => handleInputChange(null, "location", e.target.value)} style={inputStyle} placeholder="Location" />
                   </div>
                   <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", justifyContent: "center" }}>
                        <input 
                            type="checkbox" 
                            checked={sectionSettings.header.uppercaseName} 
                            onChange={(e) => setSectionSettings({...sectionSettings, header: {...sectionSettings.header, uppercaseName: e.target.checked}})} 
                        />
                        <span style={{ fontSize: "0.8rem" }}>Uppercase Name</span>
                   </div>
                </div>
              ) : (
                <>
                  <h1 style={{ fontWeight: "bold", wordBreak: "break-words", textTransform: sectionSettings.header.uppercaseName ? "uppercase" : "none", fontSize: "2rem" }}>
                    {resumeData?.name}
                  </h1>
                  {sectionSettings.header.showTitle && <p style={{ fontSize: "1.125rem", color: "#6b7280", marginTop: "0.5rem" }}>{resumeData?.role}</p>}
                  <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "1rem", marginTop: "0.5rem", fontSize: "1rem", color: "#374151" }}>
                    {sectionSettings.header.showPhone && <span>{resumeData?.phone}</span>}
                    {sectionSettings.header.showEmail && <span>{resumeData?.email}</span>}
                    {sectionSettings.header.showLink && <span>{resumeData?.linkedin}</span>}
                    {sectionSettings.header.showLocation && <span>{resumeData?.location}</span>}
                  </div>
                </>
              )}
            </div>

            {/* --- SECTIONS LOOP --- */}
            {sectionsOrder.map((section) => {
               // Strict check for View Mode
               const isDataPresent = hasSectionData(section);
               
               // If strict check fails AND we are not editing, hide the section entirely
               if (!isDataPresent && !editMode) return null;

               // If checking failed (empty data) BUT we are in Edit Mode, show placeholder
               // We check localData directly here to see if the array is empty to show "Add" button
               const localSectionData = localData?.[section];
               const isEmptyArrayInEdit = Array.isArray(localSectionData) && localSectionData.length === 0;
               const isEmptyStringInEdit = typeof localSectionData === 'string' && localSectionData === "";

               if (editMode && (isEmptyArrayInEdit || isEmptyStringInEdit || !localSectionData)) {
                   return (
                       <div key={`${section}-placeholder`} style={emptySectionPlaceholderStyle}>
                           <p style={{fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: '#9ca3af'}}>
                               {sectionTitles[section]} Section is Empty
                           </p>
                           <button
                               onClick={() => handleAddSection(section)}
                               style={{ backgroundColor: "#3b82f6", color: "white", padding: "0.5rem 1.5rem", borderRadius: "0.375rem", border: "none", cursor: "pointer", fontSize: '1rem', display: 'flex', alignItems: 'center' }}
                           >
                               <span style={{marginRight: '0.5rem', fontSize: '1.25rem'}}>+</span> Add {sectionTitles[section]}
                           </button>
                       </div>
                   );
               }

               return (
              <div key={section} style={{ position: "relative", marginBottom: "1.5rem" }}>
                
                {/* --- SUMMARY --- */}
                {section === "summary" && sectionSettings.summary.showSummary && (
                    <div>
                      <h2 onClick={() => handleSectionClick("summary")} style={{ fontSize: "1.25rem", fontWeight: "bold", borderBottom: "2px solid #d1d5db", paddingBottom: "0.25rem", marginBottom: "0.5rem" }}>Summary</h2>
                      {editMode ? (
                        <textarea 
                            rows="4" 
                            style={{...inputStyle, height: 'auto'}} 
                            value={localData?.summary || ""} 
                            onChange={(e) => handleInputChange(null, "summary", e.target.value)}
                            placeholder="Write a summary about yourself..."
                        />
                      ) : (
                        <p style={{ fontSize: "1rem", color: "#374151" }}>{resumeData?.summary}</p>
                      )}
                      {editMode && <button onClick={() => handleRemoveSection("summary")} style={{ position: "absolute", top: 0, right: 0, fontSize: "0.75rem", color: "#ef4444", border: "none", background: "none", cursor: "pointer" }}>X</button>}
                    </div>
                  )}

                {/* --- EXPERIENCE --- */}
                {section === "experience" && sectionSettings.experience.showExperience && (
                    <div>
                      <h2 onClick={() => handleSectionClick("experience")} style={{ fontSize: "1.25rem", fontWeight: "bold", borderBottom: "2px solid #d1d5db", paddingBottom: "0.25rem", marginBottom: "0.5rem" }}>Experience</h2>
                      {((editMode ? localData?.experience : resumeData?.experience) || []).map((exp, idx) => {
                          // In View Mode, skip this specific item if it's effectively empty
                          if (!editMode && isItemEmpty(exp)) return null;

                          return (
                        <div key={idx} style={{ marginBottom: "1.5rem", padding: editMode ? "1rem" : "0", border: editMode ? "1px dashed #cbd5e1" : "none", borderRadius: "0.5rem" }}>
                          {editMode ? (
                              <>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                                    <div><label style={labelStyle}>Company</label><input style={inputStyle} value={exp.companyName} onChange={(e) => handleInputChange("experience", "companyName", e.target.value, idx)} /></div>
                                    <div><label style={labelStyle}>Title</label><input style={inputStyle} value={exp.title} onChange={(e) => handleInputChange("experience", "title", e.target.value, idx)} /></div>
                                    <div><label style={labelStyle}>Date</label><input style={inputStyle} value={exp.date} onChange={(e) => handleInputChange("experience", "date", e.target.value, idx)} /></div>
                                    <div><label style={labelStyle}>Location</label><input style={inputStyle} value={exp.companyLocation} onChange={(e) => handleInputChange("experience", "companyLocation", e.target.value, idx)} /></div>
                                </div>
                                <label style={labelStyle}>Description</label>
                                <textarea rows="3" style={{...inputStyle, height: 'auto'}} value={exp.description} onChange={(e) => handleInputChange("experience", "description", e.target.value, idx)} />
                                <label style={labelStyle}>Accomplishments (Bullets)</label>
                                {Array.isArray(exp.accomplishment) && exp.accomplishment.map((acc, accIdx) => (
                                    <div key={accIdx} style={{display:'flex', gap:'5px', marginBottom:'5px'}}>
                                        <input 
                                            style={{...inputStyle, marginBottom: 0}} 
                                            value={acc} 
                                            onChange={(e) => { const updated = [...exp.accomplishment]; updated[accIdx] = e.target.value; handleInputChange("experience", "accomplishment", updated, idx); }} 
                                        />
                                        <button onClick={() => { const updated = [...exp.accomplishment]; updated.splice(accIdx, 1); handleInputChange("experience", "accomplishment", updated, idx); }} style={{color: 'red', border:'none', background:'none'}}>X</button>
                                    </div>
                                ))}
                                <button style={{fontSize:'0.8rem', color:'blue', background:'none', border:'none', cursor:'pointer'}} onClick={() => { const updated = [...(exp.accomplishment || [])]; updated.push(""); handleInputChange("experience", "accomplishment", updated, idx); }}>+ Add Bullet</button>
                                <div style={{textAlign: 'right', marginTop: '0.5rem'}}>
                                    <button onClick={() => handleRemoveSection("experience", idx)} style={{ color: "#ef4444", border: "1px solid #ef4444", background: "white", padding: "0.25rem 0.5rem", borderRadius: "4px", cursor: "pointer" }}>Delete Entry</button>
                                </div>
                              </>
                          ) : (
                              <>
                                <h3 style={{ fontSize: "1.125rem", fontWeight: "600" }}>{exp.companyName}</h3>
                                <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>{exp.title}</p>
                                <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>{exp.date}</p>
                                <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>{exp.companyLocation}</p>
                                <p style={{ fontSize: "0.875rem", color: "#374151" }}>{exp.description}</p>
                                {Array.isArray(exp.accomplishment) && (
                                    <ul style={{listStyle:'disc', paddingLeft:'1.5rem'}}>
                                    {exp.accomplishment.filter(a => a.trim()).map((acc, accIdx) => ( <li key={accIdx} style={{ fontSize: "0.875rem", color: "#374151" }}>{acc}</li> ))}
                                    </ul>
                                )}
                              </>
                          )}
                        </div>
                      );
                      })}
                      {editMode && <button onClick={() => handleAddSection("experience")} style={{ fontSize: "0.875rem", color: "#3b82f6", border: "none", background: "none", cursor: "pointer" }}>+ Add Experience</button>}
                      {editMode && <button onClick={() => handleRemoveSection("experience")} style={{ position: "absolute", top: 0, right: 0, fontSize: "0.75rem", color: "#ef4444", border: "none", background: "none", cursor: "pointer" }}>X</button>}
                    </div>
                  )}

                {/* --- EDUCATION --- */}
                {section === "education" && sectionSettings.education.showEducation && (
                    <div>
                      <h2 onClick={() => handleSectionClick("education")} style={{ fontSize: "1.25rem", fontWeight: "bold", borderBottom: "2px solid #d1d5db", paddingBottom: "0.25rem", marginBottom: "0.5rem" }}>Education</h2>
                      {((editMode ? localData?.education : resumeData?.education) || []).map((edu, idx) => {
                          if (!editMode && isItemEmpty(edu)) return null;
                          return (
                        <div key={idx} style={{ marginBottom: "1rem", padding: editMode ? "1rem" : "0", border: editMode ? "1px dashed #cbd5e1" : "none" }}>
                          {editMode ? (
                              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                                  <div><label style={labelStyle}>Institution</label><input style={inputStyle} value={edu.institution} onChange={(e) => handleInputChange("education", "institution", e.target.value, idx)} /></div>
                                  <div><label style={labelStyle}>Degree</label><input style={inputStyle} value={edu.degree} onChange={(e) => handleInputChange("education", "degree", e.target.value, idx)} /></div>
                                  <div><label style={labelStyle}>Duration</label><input style={inputStyle} value={edu.duration} onChange={(e) => handleInputChange("education", "duration", e.target.value, idx)} /></div>
                                  <div><label style={labelStyle}>Grade/GPA</label><input style={inputStyle} value={edu.grade} onChange={(e) => handleInputChange("education", "grade", e.target.value, idx)} /></div>
                                  <button onClick={() => handleRemoveSection("education", idx)} style={{ color: "red", gridColumn: "span 2", justifySelf: "end", border: "none", background: "none", cursor: "pointer" }}>Remove</button>
                              </div>
                          ) : (
                              <>
                                <h3 style={{ fontSize: "1.125rem", fontWeight: "600" }}>{edu.institution}</h3>
                                <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>{edu.degree}</p>
                                <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>{edu.duration}</p>
                                <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>{edu.grade}</p>
                              </>
                          )}
                        </div>
                      );
                      })}
                      {editMode && <button onClick={() => handleAddSection("education")} style={{ fontSize: "0.875rem", color: "#3b82f6", border: "none", background: "none", cursor: "pointer" }}>+ Add Education</button>}
                      {editMode && <button onClick={() => handleRemoveSection("education")} style={{ position: "absolute", top: 0, right: 0, fontSize: "0.75rem", color: "#ef4444", border: "none", background: "none", cursor: "pointer" }}>X</button>}
                    </div>
                  )}

                {/* --- ACHIEVEMENTS --- */}
                {section === "achievements" && sectionSettings.achievements.showAchievements && (
                    <div>
                        <h2 style={{ fontSize: "1.25rem", fontWeight: "bold", borderBottom: "2px solid #d1d5db", paddingBottom: "0.25rem", marginBottom: "0.5rem" }}>Key Achievements</h2>
                        {((editMode ? localData?.achievements : resumeData?.achievements) || []).map((achievement, idx) => {
                             if (!editMode && isItemEmpty(achievement)) return null;
                             return (
                            <div key={idx} style={{ marginBottom: "1rem", padding: editMode ? "1rem" : "0", border: editMode ? "1px dashed #cbd5e1" : "none" }}>
                                {editMode ? (
                                    <>
                                        {typeof achievement === "object" ? (
                                            <>
                                                <label style={labelStyle}>Title</label>
                                                <input style={inputStyle} value={achievement.keyAchievements} onChange={(e) => handleInputChange("achievements", "keyAchievements", e.target.value, idx)} />
                                                <label style={labelStyle}>Description</label>
                                                <textarea rows="2" style={{...inputStyle, height: 'auto'}} value={achievement.describe} onChange={(e) => handleInputChange("achievements", "describe", e.target.value, idx)} />
                                            </>
                                        ) : (
                                            <input style={inputStyle} value={achievement} onChange={(e) => { const updated = [...localData.achievements]; updated[idx] = e.target.value; setLocalData(p => ({...p, achievements: updated})); }} />
                                        )}
                                        <button onClick={() => handleRemoveSection("achievements", idx)} style={{ color: "red", border: "none", background: "none", cursor: "pointer" }}>Remove</button>
                                    </>
                                ) : (
                                    <>
                                        {typeof achievement === "object" ? (
                                            <>
                                                <h3 style={{ fontSize: "1.125rem", fontWeight: "600" }}>{achievement.keyAchievements}</h3>
                                                <p style={{ fontSize: "0.875rem", color: "#374151" }}>{achievement.describe}</p>
                                            </>
                                        ) : (
                                            <p style={{ fontSize: "0.875rem", color: "#374151" }}>{achievement}</p>
                                        )}
                                    </>
                                )}
                            </div>
                        );
                        })}
                        {editMode && <button onClick={() => handleAddSection("achievements")} style={{ fontSize: "0.875rem", color: "#3b82f6", border: "none", background: "none", cursor: "pointer" }}>+ Add Achievement</button>}
                        {editMode && <button onClick={() => handleRemoveSection("achievements")} style={{ position: "absolute", top: 0, right: 0, fontSize: "0.75rem", color: "#ef4444", border: "none", background: "none", cursor: "pointer" }}>X</button>}
                    </div>
                )}

                {/* --- SKILLS --- */}
               {section === "skills" && sectionSettings.skills.showSkills && (
  <div>
    <h2 style={{ fontSize: "1.25rem", fontWeight: "bold", borderBottom: "2px solid #d1d5db", paddingBottom: "0.25rem", marginBottom: "0.5rem" }}>
      Skills
    </h2>

    <div style={{ display: editMode ? "block" : "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.5rem" }}>
      {((editMode ? localData?.skills : resumeData?.skills) || []).map((skill, idx) => {
        
        // FIX 1: Safety check. If skill is an object (the bug), treat it as empty string.
        const skillValue = typeof skill === 'object' ? '' : skill;

        if (!editMode && (!skillValue || skillValue.trim() === '')) return null;

        return (
          <div key={idx} style={{ marginBottom: editMode ? "0.5rem" : "0" }}>
            {editMode ? (
              <div style={{ display: 'flex', gap: '5px' }}>
                <input
                  style={inputStyle}
                  // FIX 2: Use the sanitized 'skillValue' here
                  value={skillValue}
                  placeholder="Enter a skill"
                  onChange={(e) => {
                    const updated = [...(localData.skills || [])];
                    updated[idx] = e.target.value;
                    setLocalData(p => ({ ...p, skills: updated }));
                  }}
                />
                <button
                  onClick={() => handleRemoveSection("skills", idx)}
                  style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}
                >
                  X
                </button>
              </div>
            ) : (
              <li className="flex items-center">
                <span style={{ fontSize: "0.875rem", color: "#374151" }}>{skillValue}</span>
              </li>
            )}
          </div>
        );
      })}
    </div>

    {/* FIX 3: Rewrote Add Button to push a clean String, preventing [object Object] */}
    {editMode && (
      <button
        onClick={() => {
            setLocalData(prev => ({
                ...prev,
                skills: [...(prev.skills || []), ""] // Adds a simple empty string
            }));
        }}
        style={{ fontSize: "0.875rem", color: "#3b82f6", border: "none", background: "none", cursor: "pointer", marginTop: "0.5rem" }}
      >
        + Add Skill
      </button>
    )}
    
    {/* Clean up the section delete button */}
    {editMode && (
        <button 
            onClick={() => handleRemoveSection("skills")} 
            style={{ position: "absolute", top: 0, right: 0, fontSize: "0.75rem", color: "#ef4444", border: "none", background: "none", cursor: "pointer" }}
        >
            X
        </button>
    )}
  </div>
)}

                {/* --- COURSES --- */}
                {section === "courses" && sectionSettings.courses.showCourses && (
                    <div>
                      <h2 style={{ fontSize: "1.25rem", fontWeight: "bold", borderBottom: "2px solid #d1d5db", paddingBottom: "0.25rem", marginBottom: "0.5rem" }}>Courses</h2>
                      {((editMode ? localData?.courses : resumeData?.courses) || []).map((course, idx) => {
                          if (!editMode && isItemEmpty(course)) return null;
                          return (
                        <div key={idx} style={{ marginBottom: "1rem", padding: editMode ? "1rem" : "0", border: editMode ? "1px dashed #cbd5e1" : "none" }}>
                          {editMode ? (
                              <>
                                  <label style={labelStyle}>Course Title</label>
                                  <input style={inputStyle} value={course.title} onChange={(e) => handleInputChange("courses", "title", e.target.value, idx)} />
                                  <label style={labelStyle}>Description</label>
                                  <textarea rows="2" style={{...inputStyle, height: 'auto'}} value={course.description} onChange={(e) => handleInputChange("courses", "description", e.target.value, idx)} />
                                  <button onClick={() => handleRemoveSection("courses", idx)} style={{color:'red', border:'none', background:'none', cursor:'pointer'}}>Remove</button>
                              </>
                          ) : (
                              <>
                                <h3 style={{ fontSize: "1.125rem", fontWeight: "600" }}>{course.title}</h3>
                                <p style={{ fontSize: "0.875rem", color: "#374151" }}>{course.description}</p>
                              </>
                          )}
                        </div>
                      );
                      })}
                      {editMode && <button onClick={() => handleAddSection("courses")} style={{ fontSize: "0.875rem", color: "#3b82f6", border: "none", background: "none", cursor: "pointer" }}>+ Add Course</button>}
                      {editMode && <button onClick={() => handleRemoveSection("courses")} style={{ position: "absolute", top: 0, right: 0, fontSize: "0.75rem", color: "#ef4444", border: "none", background: "none", cursor: "pointer" }}>X</button>}
                    </div>
                  )}

                {/* --- PROJECTS --- */}
                {section === "projects" && sectionSettings.projects.showProjects && (
                    <div>
                      <h2 style={{ fontSize: "1.25rem", fontWeight: "bold", borderBottom: "2px solid #d1d5db", paddingBottom: "0.25rem", marginBottom: "0.5rem" }}>Projects</h2>
                      {((editMode ? localData?.projects : resumeData?.projects) || []).map((project, idx) => {
                          if (!editMode && isItemEmpty(project)) return null;
                          return (
                        <div key={idx} style={{ marginBottom: "1.5rem", padding: editMode ? "1rem" : "0", border: editMode ? "1px dashed #cbd5e1" : "none", borderRadius: "0.5rem" }}>
                          {editMode ? (
                              <>
                                  <label style={labelStyle}>Project Name</label>
                                  <input style={inputStyle} value={project.name || project.title || ""} onChange={(e) => handleInputChange("projects", "name", e.target.value, idx)} placeholder="Project Name"/>
                                  
                                  <label style={labelStyle}>Description</label>
                                  <textarea rows="3" style={{...inputStyle, height: 'auto'}} value={project.description || ""} onChange={(e) => handleInputChange("projects", "description", e.target.value, idx)} placeholder="Description"/>
                                  
                                  <label style={labelStyle}>Technologies (comma separated)</label>
                                  <input 
                                    style={inputStyle} 
                                    value={Array.isArray(project.technologies) ? project.technologies.join(", ") : project.technologies || ""} 
                                    onChange={(e) => handleInputChange("projects", "technologies", e.target.value, idx)} 
                                    placeholder="React, Node.js, MongoDB"
                                  />

                                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                                      <div><label style={labelStyle}>Live Link</label><input style={inputStyle} value={project.link || ""} onChange={(e) => handleInputChange("projects", "link", e.target.value, idx)} /></div>
                                      <div><label style={labelStyle}>GitHub Link</label><input style={inputStyle} value={project.github || ""} onChange={(e) => handleInputChange("projects", "github", e.target.value, idx)} /></div>
                                  </div>
                                  <button onClick={() => handleRemoveSection("projects", idx)} style={{ color: "red", border: "none", background: "none", cursor: "pointer", marginTop: "0.5rem" }}>Remove Project</button>
                              </>
                          ) : (
                              <>
                                <h3 style={{ fontSize: "1.125rem", fontWeight: "600" }}>{project.name || project.title}</h3>
                                <p style={{ fontSize: "0.875rem", color: "#374151" }}>{project.description}</p>
                                {project.technologies && (
                                    <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                                        <strong>Technologies:</strong> {Array.isArray(project.technologies) ? project.technologies.join(", ") : project.technologies}
                                    </div>
                                )}
                                {(project.link || project.github) && (
                                    <div style={{ marginTop: "0.5rem" }}>
                                    {project.link && <a href={project.link} target="_blank" rel="noopener noreferrer" style={{ color: "#3b82f6", marginRight: "1rem" }}>Live Demo</a>}
                                    {project.github && <a href={project.github} target="_blank" rel="noopener noreferrer" style={{ color: "#3b82f6" }}>GitHub</a>}
                                    </div>
                                )}
                              </>
                          )}
                        </div>
                      );
                      })}
                      {editMode && <button onClick={() => handleAddSection("projects")} style={{ fontSize: "0.875rem", color: "#3b82f6", border: "none", background: "none", cursor: "pointer" }}>+ Add Project</button>}
                      {editMode && <button onClick={() => handleRemoveSection("projects")} style={{ position: "absolute", top: 0, right: 0, fontSize: "0.75rem", color: "#ef4444", border: "none", background: "none", cursor: "pointer" }}>X</button>}
                    </div>
                  )}
              </div>
            );
            })}
          </div>

          {/* Edit/Save Controls */}
          <div style={{ marginTop: "1rem", textAlign: "center", marginBottom: "3rem" }}>
            {editMode ? (
              <>
                <button onClick={handleSave} style={{ backgroundColor: "#10b981", color: "white", padding: "0.5rem 1rem", borderRadius: "0.375rem", marginRight: "0.5rem", border: "none", cursor: "pointer", fontSize: "1rem" }}>Save Changes</button>
                <button onClick={handleCancel} style={{ backgroundColor: "#6b7280", color: "white", padding: "0.5rem 1rem", borderRadius: "0.375rem", border: "none", cursor: "pointer", fontSize: "1rem" }}>Cancel</button>
              </>
            ) : (
              <button onClick={() => setEditMode(true)} style={{ backgroundColor: "#3b82f6", color: "white", padding: "0.5rem 1.5rem", borderRadius: "0.375rem", border: "none", cursor: "pointer", fontSize: "1rem", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>Edit Resume</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Template5;