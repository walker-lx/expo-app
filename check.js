#!/usr/bin/env node
const { execSync } = require("child_process");
const https = require("https");

// 工具函数：执行命令并捕获输出
function run(cmd) {
  try {
    return execSync(cmd, { stdio: "pipe" }).toString().trim();
  } catch (e) {
    return null;
  }
}

// 1. 检查 CLI 版本
console.log("=== Step 1: CLI 版本检查 ===");
const easVersion = run("eas --version");
const expoVersion = run("expo --version");
console.log("eas-cli:", easVersion || "未安装");
console.log("expo-cli:", expoVersion || "未安装");

// 2. 检查网络连通性
console.log("\n=== Step 2: 网络测试 ===");
const url = "https://storage.googleapis.com";
https
  .get(url, (res) => {
    console.log(`访问 ${url} 状态码:`, res.statusCode);
    if (res.statusCode === 200) {
      console.log("✅ 可以访问 Google Cloud Storage");
    } else {
      console.log("⚠️ 状态异常，可能被防火墙或代理拦截");
    }
  })
  .on("error", (err) => {
    console.log("❌ 访问失败:", err.message);
    console.log("建议: 使用 VPN / 代理，切换海外网络节点");
  });

// 3. 检查代理环境变量
console.log("\n=== Step 3: 代理配置检查 ===");
["http_proxy", "https_proxy", "HTTP_PROXY", "HTTPS_PROXY"].forEach((key) => {
  if (process.env[key]) {
    console.log(`检测到代理变量 ${key} = ${process.env[key]}`);
  }
});

// 4. 提示清理缓存
console.log("\n=== Step 4: 缓存检查 ===");
console.log("如果问题依旧，可以尝试清理缓存:");
console.log("  eas build --clear-cache\n");
