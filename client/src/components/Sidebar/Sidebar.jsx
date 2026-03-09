/* src/components/Sidebar/Sidebar.jsx */
import React, { useState, useEffect } from "react";
import { useResume } from "../../context/ResumeContext";
import { useAuth } from "../../context/AuthContext";
import resumeService from "../../services/resumeService";
import { enhanceTextWithGemini } from "../../services/geminiService";
import { toast } from "react-toastify";
import { FaChevronLeft, FaChevronRight, FaMagic, FaFileDownload, FaShareAlt, FaUserCircle } from "react-icons/fa";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

/**
 * Sidebar - fixed:
 * - replaced html2pdf.js with html2canvas + jsPDF (avoids html2pdf's CSS parsing which triggers "oklch" error)
 * - safe color/gradient usage
 * - preserves earlier UX + enhancements API calls
 */

const enhancementOptions = [
  "summary",
  "experience",
  "education",
  "skills",
  "achievements",
  "projects",
  "certifications",
  "languages",
  "interests",
];

const Sidebar = ({ onEnhance, resumeRef }) => {
  const { resumeData, setResumeData } = useResume();
  const { isAuthenticated } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [enhancingSection, setEnhancingSection] = useState(null);
  const [downloadRequested, setDownloadRequested] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!downloadRequested) return;
    if (!resumeRef?.current) {
      toast.error("Resume element not found");
      setDownloadRequested(false);
      return;
    }

    (async () => {
      let originalStyles = [];
      try {
        // small delay to allow UI changes (hiding controls etc.)
        await new Promise((r) => setTimeout(r, 200));

        const element = resumeRef.current;

        // Hide elements with hide-in-pdf class before capturing
        const hideElements = element.querySelectorAll('.hide-in-pdf');
        hideElements.forEach((el) => {
          originalStyles.push({
            element: el,
            display: el.style.display,
            visibility: el.style.visibility,
            opacity: el.style.opacity,
            height: el.style.height,
            margin: el.style.margin,
            padding: el.style.padding,
          });
          el.style.display = 'none';
          el.style.visibility = 'hidden';
          el.style.opacity = '0';
          el.style.height = '0';
          el.style.margin = '0';
          el.style.padding = '0';
        });

        // Use html2canvas to render with error handling for color parsing
        let canvas;
        try {
          canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            logging: false,
            allowTaint: true,
            backgroundColor: '#ffffff',
            ignoreElements: (el) => {
              // Ignore elements that might cause issues
              return el.classList?.contains('hide-in-pdf');
            },
          });
        } catch (colorError) {
          // If error is due to color parsing, try with a simpler config
          if (
            colorError.message &&
            (colorError.message.includes('oklab') ||
              colorError.message.includes('oklch') ||
              colorError.message.toLowerCase().includes('color'))
          ) {
            console.warn('Color parsing error, retrying with simplified config...');
            // Force all elements to use simple, widely supported colors temporarily
            const allElements = element.querySelectorAll('*');
            const styleBackups = [];

            allElements.forEach((el) => {
              const computed = window.getComputedStyle(el);
              const backupEntry = { element: el, styles: {} };

              const recordAndSet = (prop, value) => {
                if (!(prop in backupEntry.styles)) {
                  backupEntry.styles[prop] = el.style[prop];
                }
                el.style[prop] = value;
              };

              // Simplify background / gradients
              const bgImage = computed.backgroundImage || '';
              if (bgImage && (bgImage.includes('oklab') || bgImage.includes('oklch'))) {
                recordAndSet('backgroundImage', 'none');
              }

              const bg = computed.background || '';
              if (bg && (bg.includes('oklab') || bg.includes('oklch'))) {
                recordAndSet('background', '#ffffff');
              }

              const bgColor = computed.backgroundColor || '';
              if (
                bgColor &&
                bgColor !== 'rgba(0, 0, 0, 0)' &&
                bgColor !== 'transparent' &&
                (bgColor.includes('oklab') || bgColor.includes('oklch'))
              ) {
                recordAndSet('backgroundColor', '#ffffff');
              }

              // Simplify text / border colors if they use unsupported functions
              const color = computed.color || '';
              if (color && (color.includes('oklab') || color.includes('oklch'))) {
                recordAndSet('color', '#000000');
              }

              const borderColor = computed.borderColor || '';
              if (borderColor && (borderColor.includes('oklab') || borderColor.includes('oklch'))) {
                recordAndSet('borderColor', '#000000');
              }

              const outlineColor = computed.outlineColor || '';
              if (outlineColor && (outlineColor.includes('oklab') || outlineColor.includes('oklch'))) {
                recordAndSet('outlineColor', '#000000');
              }

              const boxShadow = computed.boxShadow || '';
              if (boxShadow && (boxShadow.includes('oklab') || boxShadow.includes('oklch'))) {
                recordAndSet('boxShadow', 'none');
              }

              if (Object.keys(backupEntry.styles).length > 0) {
                styleBackups.push(backupEntry);
              }
            });

            try {
              canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                logging: false,
                allowTaint: true,
                backgroundColor: '#ffffff',
              });
            } finally {
              // Restore original styles
              styleBackups.forEach(({ element: el, styles }) => {
                Object.entries(styles).forEach(([prop, original]) => {
                  el.style[prop] = original;
                });
              });
            }
          } else {
            throw colorError;
          }
        }

        const imgData = canvas.toDataURL("image/png");

        // Create PDF with jsPDF
        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: "a4",
        });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        const imgWidth = pageWidth;
        const imgHeight = (canvas.height * pageWidth) / canvas.width;

        let heightLeft = imgHeight;
        let position = 0;

        // Add first page
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft > 0) {
          position -= pageHeight;
          pdf.addPage();
          pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }

        pdf.save("My_Resume.pdf");
        toast.success("Resume downloaded");
      } catch (err) {
        console.error("❌ PDF Download Error:", err);
        toast.error("Failed to generate PDF. Try disabling custom fonts or unusual CSS.");
      } finally {
        // Restore original styles for hidden elements
        if (originalStyles && originalStyles.length > 0) {
          originalStyles.forEach(({ element, display, visibility, opacity, height, margin, padding }) => {
            element.style.display = display;
            element.style.visibility = visibility;
            element.style.opacity = opacity;
            element.style.height = height;
            element.style.margin = margin;
            element.style.padding = padding;
          });
        }
        setDownloadRequested(false);
      }
    })();
  }, [downloadRequested, resumeRef]);

  const handleDownloadPDF = () => {
    setDownloadRequested(true);
  };

  // --- Enhancement logic (kept mostly same, just defensive)
  const handleEnhanceSection = async (section) => {
    setEnhancingSection(section);
    try {
      let contentToSend = "";

      switch (section) {
        case "summary":
          contentToSend = resumeData.summary || "";
          break;
        case "skills":
          contentToSend = Array.isArray(resumeData.skills) ? resumeData.skills.join(", ") : (resumeData.skills || "");
          break;
        case "education":
          contentToSend = JSON.stringify(resumeData.education || []);
          break;
        case "experience":
          // Collect all experience descriptions/accomplishments
          const experienceContent = (resumeData.experience || [])
            .map((e) => {
              if (e.description) return e.description;
              if (Array.isArray(e.accomplishment)) return e.accomplishment.join("\n");
              if (e.accomplishment) return e.accomplishment;
              return "";
            })
            .filter(Boolean)
            .join("\n\n");
          contentToSend = experienceContent || "";
          break;
        default:
          contentToSend = JSON.stringify(resumeData[section] || "");
      }

      if (!contentToSend || contentToSend.trim() === "") {
        toast.info("Nothing to enhance in this section.");
        return;
      }

      const aiResponse = await enhanceTextWithGemini(section, contentToSend);
      if (!aiResponse) {
        toast.error("AI enhancement failed");
        return;
      }

      const updated = { ...resumeData };

      if (section === "summary") {
        // For summary, keep as string (some templates like Template16 expect string)
        updated[section] = aiResponse.trim();
      } else if (["achievements", "languages", "interests"].includes(section)) {
        // keep as array of lines
        updated[section] = aiResponse
          .split("\n")
          .map((s) => s.replace(/^[-*•]\s*/, "").trim())
          .filter(Boolean);
      } else if (section === "skills") {
        updated.skills = aiResponse.split(/,|\n/).map(s => s.trim()).filter(Boolean);
      } else if (section === "experience") {
        // Handle experience - support both accomplishment and description fields
        // Template8 uses accomplishment array, Template16 uses description string
        if (!updated.experience || updated.experience.length === 0) {
          // If no experience exists, create a new entry
          // Check if template uses accomplishment (Template8) or description (Template16)
          updated.experience = [{
            title: "",
            company: "",
            companyName: "",
            duration: "",
            date: "",
            description: aiResponse.trim(),
            accomplishment: aiResponse.split("\n").filter(Boolean),
          }];
        } else {
          // Update the first experience entry with enhanced content
          const enhancedLines = aiResponse.split("\n").filter(Boolean);
          const enhancedText = aiResponse.trim();
          
          updated.experience[0] = {
            ...updated.experience[0],
            // Support both description (Template16) and accomplishment (Template8)
            description: enhancedText,
            accomplishment: enhancedLines,
            // Preserve existing fields
            title: updated.experience[0].title || "",
            company: updated.experience[0].company || updated.experience[0].companyName || "",
            companyName: updated.experience[0].companyName || updated.experience[0].company || "",
            duration: updated.experience[0].duration || updated.experience[0].date || "",
            date: updated.experience[0].date || updated.experience[0].duration || "",
            companyLocation: updated.experience[0].companyLocation || "",
          };
        }
      } else if (section === "education") {
        // Handle education enhancement
        if (!updated.education || updated.education.length === 0) {
          // If no education exists, create a new entry
          updated.education = [{
            degree: aiResponse.split("\n")[0] || "",
            institution: "",
            year: ""
          }];
        } else {
          // Enhance the first education entry's degree
          updated.education[0] = {
            ...updated.education[0],
            degree: aiResponse.split("\n")[0] || updated.education[0].degree || "",
          };
        }
      } else if (section === "projects") {
        if (!updated.projects) updated.projects = [{}];
        updated.projects[0].description = aiResponse;
      } else {
        updated[section] = aiResponse;
      }

      setResumeData(updated);
      if (onEnhance) onEnhance(section, updated);
      toast.success("Enhanced!");
    } catch (e) {
      console.error(e);
      toast.error("Enhancement failed");
    } finally {
      setEnhancingSection(null);
    }
  };

  const normalizeForSave = (data) => {
    const toArray = (v) => (Array.isArray(v) ? v : (v ? [v] : []));
    const experience = toArray(data.experience).map((e) => ({
      title: e?.title || "",
      company: e?.company || e?.companyName || "",
      duration: e?.duration || e?.date || "",
      description: Array.isArray(e?.accomplishment) ? e.accomplishment.join("\n") : (e?.description || "")
    }));
    const education = toArray(data.education).map((ed) => ({
      degree: ed?.degree || "",
      institution: ed?.institution || "",
      year: ed?.year || ed?.duration || "",
    }));
    const projects = toArray(data.projects).map((p) => ({
      name: p?.name || "",
      description: Array.isArray(p?.description) ? p.description.join("\n") : (p?.description || ""),
      technologies: Array.isArray(p?.technologies) ? p.technologies : ((p?.technologies || "").split(',').map(s => s.trim()).filter(Boolean))
    }));
    const certifications = toArray(data.certifications).map((c) => ({
      name: c?.name || c?.title || "",
      organization: c?.organization || c?.issuer || "",
      year: c?.year || c?.date || ""
    }));
    return {
      templateId: data?.templateId || null,
      personalInfo: {
        name: data?.name || "",
        role: data?.role || "",
        email: data?.email || "",
        phone: data?.phone || "",
        location: data?.location || "",
        linkedin: data?.linkedin || "",
        github: data?.github || "",
        portfolio: data?.portfolio || "",
      },
      summary: data?.summary || "",
      skills: Array.isArray(data?.skills) ? data.skills : [],
      experience,
      education,
      projects,
      certifications,
      achievements: toArray(data?.achievements),
      interests: toArray(data?.interests),
      languages: toArray(data?.languages).map((l) => (typeof l === 'string' ? l : (l?.language || ""))).filter(Boolean)
    };
  };

  const handleSaveToAccount = async () => {
    if (!isAuthenticated) {
      toast.info("Please login to save this resume to your account.");
      return;
    }
    try {
      setSaving(true);
      const structured = normalizeForSave(resumeData || {});
      const title = (resumeData?.title || resumeData?.name || 'Resume') + '';
      const result = await resumeService.saveResumeData(structured, `${title}`);
      if (result?.success) toast.success('✅ Saved to My Resumes');
      else toast.error(result?.error || 'Failed to save');
    } catch (e) {
      console.error(e);
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className={`min-h-screen bg-gradient-to-b from-white to-gray-50 shadow-xl border-r border-gray-200 p-6 flex flex-col justify-start gap-6 transition-all duration-300 ${collapsed ? "w-20" : "w-72"}`}
      style={{ position: "relative" }}
    >
      {/* Toggle Button */}
      <button
        className="absolute -right-4 top-6 bg-white border-2 border-indigo-200 rounded-full p-2 shadow-lg hover:bg-indigo-50 hover:border-indigo-300 transition-all duration-200 z-10"
        onClick={() => setCollapsed((prev) => !prev)}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <FaChevronRight className="text-indigo-600 text-sm" /> : <FaChevronLeft className="text-indigo-600 text-sm" />}
      </button>

      {/* Header */}
      <div className={`flex items-center gap-3 mb-4 ${collapsed ? "justify-center" : ""}`}>
        <div className="relative">
          <FaUserCircle size={collapsed ? 36 : 48} className="text-indigo-600 drop-shadow-sm" />
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
        </div>
        {!collapsed && (
          <div className="flex flex-col">
            <span className="font-bold text-xl text-indigo-800 tracking-tight">My Resume</span>
            <span className="text-xs text-gray-500 font-medium">Professional Builder</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-4">
        <button
          disabled={saving}
          className={`w-full flex items-center gap-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-60 ${collapsed ? "justify-center px-3" : ""}`}
          onClick={handleSaveToAccount}
          title="Save to My Resumes"
        >
          <FaFileDownload className={saving ? "animate-bounce" : ""} />
          {!collapsed && <span className="font-semibold">{saving ? 'Saving…' : 'Save to My Resumes'}</span>}
        </button>

        <div className="relative">
          <button
            className={`w-full flex items-center gap-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 ${collapsed ? "justify-center px-3" : ""}`}
            onClick={() => setShowOptions((prev) => !prev)}
            title="Enhance with AI"
          >
            <FaMagic className={`${showOptions ? "animate-pulse" : ""}`} />
            {!collapsed && <span className="font-semibold">Enhance with AI</span>}
            {!collapsed && <FaChevronRight className={`ml-auto transition-transform duration-200 ${showOptions ? "rotate-90" : ""}`} />}
          </button>

          {showOptions && !collapsed && (
            <div className="mt-3 bg-white border border-gray-200 rounded-xl shadow-lg p-4 space-y-2">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Select Section to Enhance</div>
              <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
                {enhancementOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleEnhanceSection(option)}
                    disabled={enhancingSection === option}
                    className="flex items-center gap-3 text-left p-3 text-indigo-700 hover:bg-indigo-50 rounded-lg transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed border border-transparent hover:border-indigo-200"
                  >
                    <FaMagic className="text-indigo-500 text-sm" />
                    <span className="font-medium">
                      {enhancingSection === option ? `Enhancing ${option}...` : `${option.charAt(0).toUpperCase() + option.slice(1)}`}
                    </span>
                    {enhancingSection === option && (
                      <div className="ml-auto"><div className="animate-spin rounded-full h-4 w-4 border-2 border-indigo-500 border-t-transparent" /></div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <button
          disabled={downloadRequested}
          className={`w-full flex items-center gap-3 bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-60 ${collapsed ? "justify-center px-3" : ""}`}
          onClick={handleDownloadPDF}
          title="Download PDF"
        >
          <FaFileDownload className={downloadRequested ? "animate-bounce" : ""} />
          {!collapsed && <span className="font-semibold">{downloadRequested ? "Generating..." : "Download PDF"}</span>}
          {downloadRequested && !collapsed && (<div className="ml-auto"><div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /></div>)}
        </button>

        <button
          className={`w-full flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 ${collapsed ? "justify-center px-3" : ""}`}
          onClick={() => {
            if (navigator.share) {
              navigator.share({ title: "My Resume", url: window.location.href });
            } else {
              navigator.clipboard.writeText(window.location.href).then(() => toast.info("URL copied"));
            }
          }}
          title="Share Resume"
        >
          <FaShareAlt />
          {!collapsed && <span className="font-semibold">Share Resume</span>}
        </button>
      </div>

      {!collapsed && (
        <div className="mt-auto pt-6 border-t border-gray-200">
          <div className="text-center">
            <div className="text-xs text-gray-500 font-medium">Last updated: {new Date().toLocaleDateString()}</div>
            <div className="flex items-center justify-center gap-2 mt-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs text-gray-600">Auto-saved</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
