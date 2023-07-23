import {
	ChatInputCommandInteraction,
	EmbedBuilder,
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
		const embed: EmbedBuilder = new EmbedBuilder()
			.setTitle(':notes: Now Playing')
			.addFields({
				name: 'Track',
				value: track.title,
				inline: true
			}, {
				name: 'Requested by',
				value: 'WIP',
				inline: true
			}, {
				name: 'Duration',
				// TODO: convert duration in seconds to locale format
				value: `\`${track.duration}\``,
				inline: true,
			})
			.setImage(track.thumbnail.url)
			.setTimestamp();

		return message.reply({ embeds: [embed] });
	},
};

export = nowPlaying;
module.exports = nowPlaying;
