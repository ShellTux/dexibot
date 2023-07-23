import {
	ChatInputCommandInteraction,
	Message,
	SlashCommandBuilder,
} from 'discord.js';
import { Command, YoutubeInfo } from '../../definitions';

const queue: Command = {
	data: new SlashCommandBuilder()
		.setName('queue')
		.setDescription('Show queue'),
	execute: async (
		message: Message | ChatInputCommandInteraction,
	) => {
		const queue: YoutubeInfo[] = message.client.queue.get(message.guildId);

		if (queue.length === 0)
			return message.reply('Queue is empty');

		const content = queue
			.map(function(track: YoutubeInfo): string {
				return track.title;
			})
			.join('\n');
		return message.reply(content);
	},
};

export = queue;
module.exports = queue;
