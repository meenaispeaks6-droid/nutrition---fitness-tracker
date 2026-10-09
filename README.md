# 🥗 NutriFit AI — Nutrition & Fitness Tracker

An AI-powered nutrition and fitness tracker that runs everywhere: web, Android, and iOS. Log meals with your camera or voice, and get instant AI food analysis.

## Features

- 📸 Meal logging via native camera capture
- 🎤 Voice-based meal logging (speech-to-text)
- 🤖 AI food analysis (`/api/analyze-food`)
- 📱 One codebase — Web, Android & iOS (Capacitor)
- 📐 Safe-area aware layout for notched devices

## Tech Stack

- Next.js + TypeScript
- Capacitor (native shell)
- Tailwind CSS

## Web Development

```bash
npm install
npm run dev
```

## Native Mobile Setup (Android + iOS)

1. Install dependencies:

```bash
npm install
```

2. Set the web URL the native app should load:

```bash
export CAP_SERVER_URL="https://your-deployed-app-url.com"
```

If you do not set `CAP_SERVER_URL`, it uses the current Orchids preview URL from `capacitor.config.ts`.

3. Create native projects:

```bash
npm run mobile:add:android
npm run mobile:add:ios
```

4. Sync native projects after any plugin/config changes:

```bash
npm run mobile:sync
```

5. Open native IDE projects:

```bash
npm run mobile:open:android
npm run mobile:open:ios
```

## Implemented Native Features

- Native camera capture for meal logging (`@capacitor/camera`)
- Native speech-to-text for meal logging (`@capacitor-community/speech-recognition`)
- Safe-area aware layout for notched devices

## Notes

- iOS builds require Xcode on macOS.
- Android builds require Android Studio + SDK.
- Server APIs such as `/api/analyze-food` must be reachable from the mobile app URL.

## License

MIT
