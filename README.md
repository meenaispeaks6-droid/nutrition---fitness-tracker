# AI Nutrition & Fitness Tracker

This project is a Next.js app with a Capacitor native shell, so it can run as:
- Web app
- Android app
- iOS app

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
