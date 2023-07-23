import {
	ChatInputCommandInteraction,
	EmbedBuilder,
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

		const currentTrack: YoutubeInfo = queue[0];

		const embed = new EmbedBuilder()
			.setColor(0xFFFFFF)
			.setTitle(':scroll: Queue List')
			.setThumbnail(message.guild.iconURL())
			.addFields({
				name: 'Current Track',
				value: `\`1)\` ${currentTrack.title}`,
				inline: true,
			}, {
				name: 'Requested by',
				value: 'WIP',
				inline: true,
			}, {
				name: 'Duration',
				value: `${currentTrack.duration}`,
				inline: true,
			});

		return message.reply({ embeds: [embed] });
	},
};

export = queue;
module.exports = queue;
