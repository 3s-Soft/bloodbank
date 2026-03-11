importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// Initialize Firebase app in the service worker
// The configuration needs to match the one in our clientApp.ts
// Usually, we can pass these via URL query strings or just have them hardcoded / injected, 
// but for standard nextjs, users generally rely on Next.js env vars during build and passing them to sw.js is tricky.
// Instead, often people fetch from an API route or define them.

// For MVP, since NEXT_PUBLIC_ vars are replaced at compile time in JS but not static SW (unless using next-pwa plugin),
// We'll rely on the default FCM initialization which works with the `getToken` registration.
// Actually, firebase-messaging-sw.js only needs the config if handling background messages.
firebase.initializeApp({
  apiKey: "YOUR_API_KEY", // this is a placeholder if not processing background data payloads.
  projectId: "bloodbank-mvp",
  messagingSenderId: "SENDER_ID",
  appId: "APP_ID"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon || '/assets/favicon.png'
  };

  self.registration.showNotification(notificationTitle,
    notificationOptions);
});
