import {
	AudioPlayerStatus,
	NoSubscriberBehavior,
	StreamType,
	createAudioPlayer,
	createAudioResource
} from '@discordjs/voice';
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ChatInputCommandInteraction,
	Client,
	ComponentType,
	EmbedBuilder,
	Message
} from 'discord.js';
import * as queueCommand from './commands/audio/queue';
import leave from './commands/audio/leave';
import nowPlaying from './commands/audio/now-playing';
import { YoutubeInfo } from './definitions';
import ytdl from 'ytdl-core';

export const isUrl = function(url: string): boolean {
	const urlPattern = /^(https?|):\/\/[^\s/$.?#].[^\s]*$/i;
	return urlPattern.test(url);
};

export const ytdlMoreVideoDetails2YoutubeInfo = function(
	details: ytdl.MoreVideoDetails
): YoutubeInfo {
	const info: YoutubeInfo = {
		id: details.videoId,
		url: details.video_url,
		title: details.title,
		duration: parseInt(details.lengthSeconds),
		channel: {
			name: details.author.name,
			url: details.author.channel_url,
			id: details.author.id,
			userUrl: details.author.user_url,
			subscriberCount: details.author.subscriber_count,
		},
		viewCount: parseInt(details.viewCount),
		uploadDate: details.uploadDate,
		category: details.category,
		isLive: details.isLiveContent,
		likes: details.likes,
		dislikes: details.dislikes,
		thumbnail: details.thumbnails.reduce((
			previous: ytdl.thumbnail,
			current: ytdl.thumbnail,
		) => {
			if (current.width * current.height > previous.width * previous.height)
				return current;
			return previous;
		}, { url: '', width: 0, height: 0 }),
	};

	return info;
};

export const getYoutubeInfo = async function(url: string): Promise<YoutubeInfo> {
	if (!isUrl(url)) return;

	const info = await ytdl.getBasicInfo(url)
		.then((response: ytdl.videoInfo) => response.videoDetails)
		.then(ytdlMoreVideoDetails2YoutubeInfo)
		.catch(console.error);

	if (!info) return;

	return info;
};

enum PageButtonID {
	Home     = 'home',
	Next     = 'next',
	Previous = 'previous',
}

const pageButtonLabel = function (id: PageButtonID): string {
	switch (id) {
	case PageButtonID.Home:
		return 'Home';
	case PageButtonID.Next:
		return 'Next Page';
	case PageButtonID.Previous:
		return 'Previous Page';
	}
};

export const pagination = async function(
	message: Message | ChatInputCommandInteraction,
	pages: EmbedBuilder[],
	pageIndex: number = 0
) {
	if (pages.length === 0) {
		console.error('Empty pages');
		return;
	}
		
	const defaultPageIndex: number = pageIndex;
	const paginationButtonRow = new ActionRowBuilder<ButtonBuilder>()
		.addComponents(
			new ButtonBuilder()
				.setCustomId(PageButtonID.Previous)
				.setLabel(pageButtonLabel(PageButtonID.Previous))
				.setStyle(ButtonStyle.Secondary)
				.setEmoji('⬅️'),
			new ButtonBuilder()
				.setCustomId(PageButtonID.Home)
				.setLabel(pageButtonLabel(PageButtonID.Home))
				.setStyle(ButtonStyle.Primary)
				.setEmoji('🏠'),
			new ButtonBuilder()
				.setCustomId(PageButtonID.Next)
				.setLabel(pageButtonLabel(PageButtonID.Next))
				.setStyle(ButtonStyle.Success)
				.setEmoji('➡️'),
		);

	const response = await message.reply({
		embeds: [pages[defaultPageIndex]],
		components: [paginationButtonRow],
	});

	const editResponse = async () => await response.edit({
		embeds: [pages[pageIndex]],
		components: [paginationButtonRow],
	});

	const collector = response.createMessageComponentCollector({
		componentType: ComponentType.Button,
		// TODO: Magic Number
		time: 5 * 60 * 1e3,
		filter: interaction => {
			interaction.deferUpdate();
			return interaction.user.id === message.member.user.id;
		},
	});

	collector.on('collect', async interaction => {
		collector.resetTimer();

		if (interaction.customId === PageButtonID.Home)
			pageIndex = defaultPageIndex;
		else if (interaction.customId === PageButtonID.Previous)
			pageIndex = (pages.length + pageIndex - 1) % pages.length;
		else if (interaction.customId === PageButtonID.Next)
			pageIndex = (pageIndex + 1) % pages.length;

		editResponse();
	});

	collector.on('end', () => {
		paginationButtonRow.components.forEach(button => button.setDisabled(true));

		editResponse();
	});
};

export const initializeClient = function(message: Message | ChatInputCommandInteraction) {
	const client: Client = message.client;
	const guildId: string = message.guildId;

	if (!client.queue.has(guildId))
		client.queue.set(guildId, []);

	if (!client.audioPlayer.has(guildId)) {
		const audioPlayer = createAudioPlayer({
			behaviors: {
				noSubscriber: NoSubscriberBehavior.Pause,
			}
		});

		// TODO: Move AudioPlayer config to a file
		client.audioPlayer.set(guildId, audioPlayer);

		audioPlayer.on(AudioPlayerStatus.Playing, () => {
			queueCommand.execute(message);
			nowPlaying.execute(message);
		});

		audioPlayer.on(AudioPlayerStatus.Idle, () => {
			const queue: YoutubeInfo[] = client.queue.get(guildId);
			queue.shift();
			if (queue.length === 0) {
				leave.execute(message);
			} else {
				// TODO: move ytdl options to a config file
				const ytdlOptions: ytdl.downloadOptions = {
					filter: 'audioonly',
				};

				const track: YoutubeInfo = queue[0];
				const audioStream = ytdl(track.url, ytdlOptions);
				const audioResource = createAudioResource(audioStream, {
					inputType: StreamType.Arbitrary,
				});

				audioPlayer.play(audioResource);
			}
		});

	}
};
