import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { Client, Collection, GatewayIntentBits } from 'discord.js';
import { AudioPlayer, generateDependencyReport } from '@discordjs/voice';
import { Command, QueueTrack, warning } from './definitions.js';
import { version as ytdlVersion } from 'ytdl-core';
import chalk from 'chalk';
import { Debug, debugMessage } from './functions.js';

declare module 'discord.js' {
	interface Client {
		commands: Collection<string, Command>;
		cooldowns: Collection<string, Collection<string, number>>;
		audioPlayer: Collection<string, AudioPlayer>;
		queue: Collection<string, QueueTrack[]>;
	}
}

const client: Client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.DirectMessages,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildVoiceStates,
	],
});

client.commands    = new Collection<string, Command>();
client.cooldowns   = new Collection<string, Collection<string, number>>;
client.audioPlayer = new Collection<string, AudioPlayer>();
client.queue       = new Collection<string, QueueTrack[]>();

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs
		.readdirSync(commandsPath)
		.filter((file) => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command: Command = require(filePath);

		if (command.enabled === false) {
			console.log(`[WARNING] The command ${command.data.name} is disabled!`);
			continue;
		}

		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(
				`[WARNING] The command at ${filePath} ` +
					'is missing a required "data" or "execute" property.',
			);
		}
	}
}

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter((file) => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

if (!process.env.DISCORD_TOKEN)
	throw new Error('DISCORD_TOKEN environment variable missing.');

console.log(generateDependencyReport());
debugMessage(Debug.INFO, chalk.bold('ytdl-core version: ') + chalk.underline(ytdlVersion));
client.login(process.env.DISCORD_TOKEN);
