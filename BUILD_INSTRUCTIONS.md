# Android Build & Run Instructions

This project uses **Capacitor** to run the React web application as a native Android app.

## Prerequisites
1.  **Android Studio** installed and configured.
2.  **Android SDK** and **Platform Tools** (ADB) added to your system PATH.
3.  A physical Android device (with USB debugging enabled) or an Android Emulator running.

## Running the App

All commands should be run from the `frontend` directory:

### 1. Build and Sync (Recommended)
This command builds the web project and synchronizes the assets with the Android project.
```bash
npm run android:sync
```

### 2. Run on Device/Emulator
This command builds, syncs, and then attempts to run the app directly on your connected device or emulator.
```bash
npm run android:run
```

### 3. Open in Android Studio
If you want to build the APK manually or debug using Android Studio's tools:
```bash
npm run android:open
```

## Troubleshooting
- **Gradle Sync Issues**: If Android Studio shows Gradle errors, try `File > Invalidate Caches / Restart`.
- **API Connection**: Ensure your Android device can reach the backend server (use the server's IP address instead of `localhost`).
- **Cleartext Traffic**: If the app fails to connect to a local HTTP server, ensure `android:usesCleartextTraffic="true"` is set in `AndroidManifest.xml`.
