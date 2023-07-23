import {
	ChatInputCommandInteraction,
	EmbedBuilder,
	Message,
	SlashCommandBuilder,
} from 'discord.js';
import { Command, YoutubeInfo } from '../../definitions';
import { pagination } from '../../functions';

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

		const pages: EmbedBuilder[] = [];

		// TODO: Magic number
		const stride = 5;
		for(let i = 0; i < queue.length; i += stride) {
			const batch = queue.slice(i, i + stride);

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
				})
				.addFields({
					name: 'Queue',
					value: batch
						.map((track, i) => `${i + 1}) `
					+ `${track.title}`)
						.join('\n'),
				});

			pages.push(embed);
		}

		if (pages.length === 1)
			return message.reply({ embeds: pages });

		pagination(message, pages);
	},
};

export = queue;
module.exports = queue;
