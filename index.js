const {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  ContextMenuCommandBuilder,
  ApplicationCommandType,
  ActivityType,
} = require("discord.js");
const axios = require("axios");
require("dotenv").config();

// можно оставить только Guilds; Presence-интент нужен только чтобы ЧИТАТЬ чужие presence
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

/* ---------------------- LibreTranslate ---------------------- */
async function translate(text, target) {
  const { data } = await axios.post("http://127.0.0.1:5000/translate", {
    q: text,
    source: "auto",
    target,
    format: "text",
  });
  return data.translatedText;
}

/* ---------------------- Markdown guard ---------------------- */
function splitSegments(text) {
  // code blocks ```...```, inline `...`, links [..](..)
  const regex = /(```[\s\S]*?```|`[^`]*`|\[.*?\]\(.*?\))/g;
  const segments = [];
  let m, last = 0;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) segments.push({ type: "translate", value: text.slice(last, m.index) });
    segments.push({ type: "protect", value: m[0] });
    last = regex.lastIndex;
  }
  if (last < text.length) segments.push({ type: "translate", value: text.slice(last) });
  return segments;
}

async function translateWithMarkdown(text, target) {
  const segments = splitSegments(text);
  for (const seg of segments) {
    if (seg.type !== "translate") continue;
    const lines = seg.value.split("\n").map((line) => {
      const h = line.match(/^(#{1,3})\s+(.*)$/);
      if (h) return { t: "h", hashes: h[1], content: h[2] };
      return { t: "p", content: line };
    });
    for (const l of lines) {
      if (l.content.trim() !== "") l.content = await translate(l.content, target);
    }
    seg.value = lines.map((l) => (l.t === "h" ? `${l.hashes} ${l.content}` : l.content)).join("\n");
  }
  return segments.map((s) => s.value).join("");
}

/* ---------------------- Commands (context menu) ---------------------- */
const commands = [
  new ContextMenuCommandBuilder()
    .setName("🌐 Translate to English")
    .setType(ApplicationCommandType.Message)
    .toJSON(),
  new ContextMenuCommandBuilder()
    .setName("🇹🇭 Translate to Thai")
    .setType(ApplicationCommandType.Message)
    .toJSON(),
];

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log("🔄 Registering global context menu commands…");
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
    console.log("✅ Commands registered");
  } catch (e) {
    console.error("❌ Command register error:", e);
  }
})();

/* ---------------------- Ready + rotating status ---------------------- */
client.on("ready", () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);

  const statuses = [
    { name: "Eating 7-11 toasties 🥪", type: ActivityType.Playing },
    { name: "Going to canteen 🍛", type: ActivityType.Watching },
    { name: "Playing discovery piscine 🏊", type: ActivityType.Playing },
    { name: "Knock-knocking at KLLC 🚪", type: ActivityType.Watching },
    { name: "At campus 🎓", type: ActivityType.Playing },
    { name: "Thinking about jQuery 🤯", type: ActivityType.Watching },
    { name: "Playing tennis with Palm 🎾", type: ActivityType.Playing },
    { name: "Getting TIG'd by Peek 😭", type: ActivityType.Listening },
    { name: "Coding 💻", type: ActivityType.Competing },
  ];

  let i = 0;
  const apply = () => {
    const s = statuses[i];
    client.user.setPresence({
      activities: [{ name: s.name, type: s.type }],
      status: "online",
    });
    i = (i + 1) % statuses.length;
  };
  apply();
  setInterval(apply, 10_000);
});

/* ---------------------- Interaction handler ---------------------- */
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isMessageContextMenuCommand()) return;

  const original = interaction.targetMessage?.content ?? "";
  const target =
    interaction.commandName === "🌐 Translate to English" ? "en" :
    interaction.commandName === "🇹🇭 Translate to Thai" ? "th" : null;

  if (!target || !original) return;

  await interaction.deferReply({ ephemeral: true });
  try {
    const out = await translateWithMarkdown(original, target);
    await interaction.editReply(out);
  } catch (e) {
    console.error(e);
    await interaction.editReply("❌ Translation failed.");
  }
});

client.login(process.env.DISCORD_TOKEN);
