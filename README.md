# 🌐 42Translator

42Translator is a Discord bot designed to help international students at **42Bangkok** and **KMITL** communicate more easily. It integrates with [LibreTranslate](https://libretranslate.com) to provide **Thai ↔ English translation** directly in Discord through context menu commands.
## Developed by [ddivaev](https://profile-v3.intra.42.fr/users/ddivaev)
## Contributors: 
(Contribute to project, here can be your name)
---

## ✨ Features

- Context menu actions:
  - 🌐 **Translate to English** (right-click a message → Apps → Translate to English)
  - 🇹🇭 **Translate to Thai**
- Markdown-aware translation (code blocks, links, and formatting stay intact)
- Funny rotating statuses
- Easy to deploy using **Docker** and **Node.js**

---

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone git@github.com:TuskarMA/42Translator.git
cd 42Translator
```
### 2. Run LibreTranslate via Docker
Make sure that you [installed docker](https://docs.docker.com/engine/install/) on your machine
```bash
docker run -d \
  --name libretranslate \
  -p 127.0.0.1:5000:5000 \
  -e LT_LOAD_ONLY=th,en \
  libretranslate/libretranslate
```
### 3. Create your .env file
And put it in your root project directory
```
DISCORD_TOKEN=your_discord_bot_token
CLIENT_ID=your_discord_application_id
```
### 4. Make sure that node.js is installed
It is highly recommended to use nvm (Node Version Manager)
 to install and manage Node.js versions.
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
```
Update your sources
```bash
export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm
```
Install latest node.js version
```bash
nvm install latest
```
### 4. Install dependencies
Run command in root project directory
```bash
npm i
```
### 5. Run bot
```bash
node .
```
I highly recomnend ytou to use [pm2](https://pm2.keymetrics.io/)
```bash
pm2 start index.js --name translator
```
