import {
	ChatInputCommandInteraction,
	Message,
	SlashCommandBuilder,
} from 'discord.js';
import { Command, YoutubeInfo } from '../../definitions';

const nowPlaying: Command = {
	data: new SlashCommandBuilder()
		.setName('now-playing')
		.setDescription('Show current playing music'),
	execute: async (
		message: Message | ChatInputCommandInteraction,
	) => {
		const queue: YoutubeInfo[] = message.client.queue.get(message.guildId);

		if (queue.length === 0)
			return message.reply('Queue is empty');

		const track: YoutubeInfo = queue[0];
		// TODO: Improve current track message
		return message.reply(track.title);
	},
};

export = nowPlaying;
module.exports = nowPlaying;
