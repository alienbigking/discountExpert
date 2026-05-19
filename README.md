This is a new [**React Native**](https://reactnative.dev) project, bootstrapped using [`@react-native-community/cli`](https://github.com/react-native-community/cli).

# Getting Started

> **Note**: Make sure you have completed the [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.

## Step 1: Start Metro

First, you will need to run **Metro**, the JavaScript build tool for React Native.

To start the Metro dev server, run the following command from the root of your React Native project:

```sh
# Using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Build and run your app

With Metro running, open a new terminal window/pane from the root of your React Native project, and use one of the following commands to build and run your Android or iOS app:

### Android

```sh
# Using npm
npm run android

# OR using Yarn
yarn android
```

### iOS

For iOS, remember to install CocoaPods dependencies (this only needs to be run on first clone or after updating native deps).

The first time you create a new project, run the Ruby bundler to install CocoaPods itself:

```sh
bundle install
```

Then, and every time you update your native dependencies, run:

```sh
bundle exec pod install
```

For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

```sh
# Using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

This is one way to run your app — you can also build it directly from Android Studio or Xcode.

## Step 3: Modify your app

Now that you have successfully run the app, let's make changes!

Open `App.tsx` in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes — this is powered by [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

When you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:

- **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Dev Menu**, accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).
- **iOS**: Press <kbd>R</kbd> in iOS Simulator.

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [docs](https://reactnative.dev/docs/getting-started).

# Android Release 打包

## 前置条件

1. 确保 `android/app/release.keystore` 存在（生成命令见下方）
2. 确保 `android/gradle.properties` 中已填写签名配置（该文件已加入 `.gitignore`，不会提交到 git）

```properties
MYAPP_RELEASE_STORE_FILE=release.keystore
MYAPP_RELEASE_KEY_ALIAS=littlememo
MYAPP_RELEASE_STORE_PASSWORD=your_store_password
MYAPP_RELEASE_KEY_PASSWORD=your_key_password
```

## 生成签名 keystore（只需一次）

```bash
keytool -genkeypair -v \
  -keystore android/app/release.keystore \
  -alias littlememo \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -dname "CN=your_name, OU=your_org, O=your_org, L=your_city, ST=your_province, C=CN" \
  -storepass your_store_password \
  -keypass your_key_password
```

## 打 Release APK

```bash
cd android && ./gradlew assembleRelease
```

产物路径：

```text
android/app/build/outputs/apk/release/app-release.apk
```

## 打 Release AAB（上传 Google Play 用）

```bash
cd android && ./gradlew bundleRelease
```

产物路径：

```text
android/app/build/outputs/bundle/release/app-release.aab
```

## 安装到设备

```bash
adb install android/app/build/outputs/apk/release/app-release.apk
```

---

# Troubleshooting

If you're having issues getting the above steps to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.

### 检测 npm 库是否支持新架构如：Fabric、Hermes 等

grep -R "codegenConfig" node_modules/\*/package.json
结果解读：
• ✅ 有 codegenConfig → Fabric 友好

# Bundle React Native code and images

set -e
set -x

# 🔹 强制使用 nvm Node 20

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 20.19.5

# 🔹 使用绝对路径 Node

export NODE_BINARY="$(which node)"
echo "Xcode 实际使用 Node: $($NODE_BINARY -v)"

# 🔹 调用 React Native 默认打包脚本

REACT_NATIVE_PATH="$PROJECT_DIR/../node_modules/react-native"
"$REACT_NATIVE_PATH/scripts/react-native-xcode.sh"

# 以下命令时默认的命令

#set -e

#WITH_ENVIRONMENT="$REACT_NATIVE_PATH/scripts/xcode/with-environment.sh"
#REACT_NATIVE_XCODE="$REACT_NATIVE_PATH/scripts/react-native-xcode.sh"

#/bin/sh -c "\"$WITH_ENVIRONMENT\" \"$REACT_NATIVE_XCODE\""
