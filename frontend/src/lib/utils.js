export function formatMessageTime(date) {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

// Presence is polling-based (no persistent socket on Vercel serverless), so
// a user counts as online if their last authenticated heartbeat was recent.
const ONLINE_THRESHOLD_MS = 20000;

export function isUserOnline(lastSeen) {
  if (!lastSeen) return false;
  return Date.now() - new Date(lastSeen).getTime() < ONLINE_THRESHOLD_MS;
}