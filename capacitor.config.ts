import type { CapacitorConfig } from "@capacitor/cli";

const defaultServerUrl =
  "https://3000-673581ed-0a24-4d77-8dc8-d7810c5837e0.orchids.cloud";
const serverUrl = process.env.CAP_SERVER_URL || defaultServerUrl;

const config: CapacitorConfig = {
  appId: "com.orchids.nutritiontracker",
  appName: "AI Nutrition & Fitness Tracker",
  webDir: "public",
  server: {
    url: serverUrl,
    cleartext: serverUrl.startsWith("http://"),
    androidScheme: "https",
    allowNavigation: ["*"],
  },
  plugins: {
    StatusBar: {
      style: "DARK",
      backgroundColor: "#121212",
      overlaysWebView: false,
    },
    Keyboard: {
      resize: "body",
    },
  },
};

export default config;
