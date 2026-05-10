const { spawnSync } = require("node:child_process");

const [, , channel = "production", policy = "optional", ...rawForwardArgs] = process.argv;

const normalizedChannel = channel.trim() || "production";
const normalizedPolicy = policy.trim().toLowerCase() === "required" ? "required" : "optional";
const environment = normalizedChannel === "preview" ? "preview" : "production";
const forwardArgs = normalizeForwardArgs(rawForwardArgs);
const messageFlagIndex = forwardArgs.findIndex(arg => arg === "--message" || arg === "-m");
const forwardedMessage = messageFlagIndex >= 0 ? forwardArgs[messageFlagIndex + 1] : undefined;
const easArgs = [
  "eas-cli",
  "update",
  "--channel",
  normalizedChannel,
  "--environment",
  environment,
  ...forwardArgs
];
const isWindows = process.platform === "win32";
const command = isWindows ? ["npx", ...easArgs.map(quoteWindowsArg)].join(" ") : "npx";
const args = isWindows ? [] : easArgs;

const result = spawnSync(command, args, {
  stdio: "inherit",
  shell: isWindows,
  env: {
    ...process.env,
    EAS_UPDATE_POLICY: normalizedPolicy,
    ...(forwardedMessage ? { EAS_UPDATE_MESSAGE: forwardedMessage } : {})
  }
});

if (result.error) {
  console.error(result.error.message);
}

process.exit(result.status ?? 1);

function normalizeForwardArgs(args) {
  const normalized = [];

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg !== "--message" && arg !== "-m") {
      normalized.push(arg);
      continue;
    }

    const messageParts = [];
    index += 1;

    while (index < args.length && !args[index].startsWith("-")) {
      messageParts.push(args[index]);
      index += 1;
    }

    normalized.push(arg, messageParts.join(" "));
    index -= 1;
  }

  return normalized;
}

function quoteWindowsArg(arg) {
  return `"${String(arg).replace(/"/g, '\\"')}"`;
}
