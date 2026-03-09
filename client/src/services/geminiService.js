const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "/api" : "http://localhost:5000/api");

export const enhanceTextWithGemini = async (section, data) => {
  try {
    const response = await fetch(`${API_BASE}/enhance`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        section,
        data,
      }),
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.enhanced;
  } catch (error) {
    console.error("❌ Enhance API error:", error);
    return null;
  }
};
