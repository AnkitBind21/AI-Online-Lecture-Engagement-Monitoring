export const calculateAttentionScore = (eyeStatus, headPosition) => {
  if (eyeStatus === "Closed") return 40;
  if (headPosition !== "Center") return 70;
  return 100;
};

export const determineAttentionState = (score) => {
  if (score >= 90) return "Attentive";
  if (score >= 60) return "Distracted";
  return "Drowsy";
};

export const formatTime = (seconds) => {
  const hrs = String(Math.floor(seconds / 3600)).padStart(2, "0");
  const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");
  return `${hrs}:${mins}:${secs}`;
};

export const generateMockReportData = (duration = 300) => {
  const data = [];
  for (let i = 0; i < duration; i += 5) {
    const score = Math.round(50 + Math.random() * 50);
    data.push({
      time: formatTime(i),
      averageAttention: score,
      state: score >= 90 ? "Attentive" : score >= 60 ? "Distracted" : "Drowsy",
    });
  }
  return data;
};
