// Dynamische Expo-config: het buildnummer van GitHub Actions wordt het Android-versionCode,
// zodat elke nieuwe APK als update over de vorige heen te installeren is.
module.exports = () => ({
  expo: {
    name: 'Hablemos',
    slug: 'hablemos',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    scheme: 'hablemos',
    newArchEnabled: true,
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#FFF1CC',
    },
    android: {
      package: 'nl.hablemos.app',
      versionCode: Number(process.env.GITHUB_RUN_NUMBER || 1),
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#FF8A3D',
      },
    },
    plugins: [
      [
        'expo-notifications',
        {
          icon: './assets/notification-icon.png',
          color: '#FF8A3D',
        },
      ],
    ],
  },
});
