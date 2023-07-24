# Dexibot

This is a Discord bot designed to enhance your Discord server's functionality and provide additional features for a better user experience.
The bot is built using [Discord.js](https://discord.js.org/), a powerful library that allows easy interaction with the Discord API.

## Installation

To use this bot, follow these steps:

1. Clone the repository: `git clone https://github.com/ShellTux/dexibot.git`
2. Install dependencies: `npm install` and `npm install --save-dev`
```sh
npm install
npm install --save-dev
npm install --save-dev @types/node
```
3. Install youtube-dl: for searching videos on youtube

You can install through your package manager, or make sure you have the executable in your PATH

`Distro` | `Command`
--- | ---
`Ubuntu/Debian` | `sudo apt-get install youtube-dl`
`Fedora` | `sudo dnf install youtube-dl`
`Arch Linux` | `sudo pacman -Syu youtube-dl`

4. Create a `.env` file with the following content:
```env
DISCORD_TOKEN=bot_token
APPLICATION_ID=application_id
GUILD_ID=guild_id
PREFIX="*"
```

The `bot token` and the `application id` can be found at the [discord developer portal](https://discord.com/developers/applications/).

4. Compile the project and run the bot:

```sh
npm run build
npm run start
```

Note: Make sure you have Node.js installed on your system before proceeding with the installation.

## Configuration

The bot requires some configuration values to be set in the `.env` file. Open the `.env` file and update the following values:

- `APPLICATION_ID`: Your Discord Application Id, obtained on the [Discord Developer Portal](https://discord.com/developers/applications).
- `DISCORD_TOKEN`: Your Discord bot token. You can obtain this by creating a new bot application on the [Discord Developer Portal](https://discord.com/developers/applications).
- `PREFIX`: The command prefix to use for invoking the bot's commands. (Ex.: "*")
- `GUILD_ID`: The `server`/`guild` id to deploy the `slash (/) commands`.

## Usage

Once the bot is running and connected to your Discord server, you can use the following commands:

- `/command1 <parameter>`: Description of what the command does.
- `/command2 <parameter>`: Description of another command.
- `/command3`: Description of a command without parameters.

Feel free to modify or extend the bot's commands to suit your needs. You can find the available commands in the `commands/` directory.

<!-- TODO: ## Contributing -->

## Features

- [x] Help page `help`
- [x] Pagination
- [x] Ping/Latency `ping`
- [x] Show information about the guild `server`
- [x] Show information about the user `user`
- Audio
  - [x] Join Voice Channel `join`
  - [x] Leave Voice Channel `leave`
  - [x] Play song `play`
    - [x] Pause
    - [x] Resume
    - [x] Queue
      - [x] Show Queue
      - [ ] Shuffle
    - [x] Skip
    - [x] Now playing
    - [ ] Play time
- Miscellaneous
  - [x] Flip coin `flip-coin`
  ![Flipping a coin](assets/flip-coin/coinflip.gif)
  - [x] uwu `uwu`

## License

This project is licensed under the [MIT License](LICENSE). Feel free to modify and distribute the code as per the terms of the license.

## Acknowledgements

- https://discordjs.guide
- https://discordjs.guide/voice
- https://discord.js.org/docs

Thank you for using our Discord bot! We hope it enhances your Discord server experience.
