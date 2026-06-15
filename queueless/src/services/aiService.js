const AI_ENDPOINT = process.env.REACT_APP_AI_ENDPOINT || "https://your-ai-endpoint.com/api";

// Estimate wait time using AI
export const estimateWaitTime = async (queueData) => {
  try {
    const response = await fetch(`${AI_ENDPOINT}/estimate-wait`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(queueData),
    });
    if (!response.ok) throw new Error("AI endpoint error");
    const data = await response.json();
    return data.estimatedMinutes;
  } catch (error) {
    console.error("estimateWaitTime error:", error);
    return null;
  }
};

// Get AI-based queue optimization suggestion
export const getQueueSuggestion = async (queueStats) => {
  try {
    const response = await fetch(`${AI_ENDPOINT}/suggest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(queueStats),
    });
    if (!response.ok) throw new Error("AI endpoint error");
    const data = await response.json();
    return data.suggestion;
  } catch (error) {
    console.error("getQueueSuggestion error:", error);
    return null;
  }
};
