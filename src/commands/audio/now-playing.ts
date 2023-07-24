import {
	ActionRowBuilder,
	ButtonBuilder,
	ChatInputCommandInteraction,
	ComponentType,
	EmbedBuilder,
	Message,
	SlashCommandBuilder,
} from 'discord.js';
import { Command, YoutubeInfo } from '../../definitions';
import { ButtonStyle } from 'discord.js';
import { AudioPlayerStatus } from '@discordjs/voice';

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
		const nextTrack = (queue.length <= 1)
			? queue[1]
			: undefined;

		// TODO: Improve current track message
		const embed: EmbedBuilder = new EmbedBuilder()
			.setTitle(':notes: Now Playing')
			.setThumbnail(message.guild.iconURL())
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
			.addFields({
				name: 'Channel',
				value: track.channel.name,
				inline: true,
			}, {
				name: 'Channel Subscriber Count',
				value: `:ballot_box_with_check: ${track
					.channel.subscriberCount}`,
				inline: true,
			}, {
				name: 'Channel URL',
				value: track.channel.url,
				inline: true,
			})
			.addFields({
				name: 'Link',
				value: track.url,
			})
			.addFields({
				name: 'Likes',
				value: `:thumbsup: ${track.likes}`,
				inline: true,
			}, {
				name: 'Dislikes',
				value: `:thumbsdown: ${track.dislikes}`,
				inline: true,
			}, {
				name: 'View Count',
				value: `:face_with_monocle: ${track.viewCount}`,
				inline: true,
			})
			.addFields({
				name: 'Upload Date',
				value: track.uploadDate,
			})
			.addFields((nextTrack)
				? {
					name: ':track_next: Next',
					value: nextTrack.title,
				} : {
					name: ':track_next: Next',
					value: ':no_entry_sign: Nothing next in the queue'
				})
			.setImage(track.thumbnail.url)
			.setTimestamp();

		const components: ActionRowBuilder<ButtonBuilder>[] = [
			new ActionRowBuilder<ButtonBuilder>()
				.addComponents([
					new ButtonBuilder()
						.setCustomId('resume')
						.setStyle(ButtonStyle.Success)
						.setEmoji('▶️'),
					new ButtonBuilder()
						.setCustomId('pause')
						.setStyle(ButtonStyle.Secondary)
						.setEmoji('⏸'),
					new ButtonBuilder()
						.setCustomId('leave')
						.setStyle(ButtonStyle.Danger)
						.setEmoji('⏹'),
					new ButtonBuilder()
						.setCustomId('skip')
						.setStyle(ButtonStyle.Primary)
						.setEmoji('⏭'),
					new ButtonBuilder()
						.setLabel('Video Link')
						.setStyle(ButtonStyle.Link)
						.setURL(track.url),
				])
		];

		const response = await message.reply({
			embeds: [embed] ,
			components: components,
		});

		const editResponse = () => response.edit({
			embeds: [embed],
			components: components,
		});

		const collector = response.createMessageComponentCollector({
			componentType: ComponentType.Button,
			filter: interaction => {
				interaction.deferUpdate();
				return interaction.user.id === message.member.user.id;
			},
		});

		const audioPlayer = message.client.audioPlayer.get(message.guildId);

		audioPlayer.once(AudioPlayerStatus.Idle, () => {
			collector.stop('Music ended');
		});

		collector.on('collect', async interaction => {
			collector.resetTimer();

			if (!message.client.commands.has(interaction.customId)) return;

			const command = message.client.commands.get(interaction.customId);
			command.execute(message);
		});

		collector.on('end', (collected, reason) => {
			components.forEach(
				component => component.components.forEach(
					button => button.setDisabled(true)
				)
			);

			editResponse();
		});

		return response;
	},
};

export = nowPlaying;
module.exports = nowPlaying;
