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
	Message,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder
} from 'discord.js';
import * as queueCommand from './commands/audio/queue';
import leave from './commands/audio/leave';
import nowPlaying from './commands/audio/now-playing';
import { YoutubeInfo } from './definitions';
import ytdl from 'ytdl-core';

/**
	* Checks if a given string is a valid URL.
	*
	* @param {string} url - The string to be checked.
	* @returns {boolean} Returns true if the string is a valid URL, otherwise false.
	*/
export const isUrl = function(url: string): boolean {
	const urlPattern = /^(https?|):\/\/[^\s/$.?#].[^\s]*$/i;
	return urlPattern.test(url);
};

/**
	* Converts ytdl.MoreVideoDetails to YoutubeInfo object.
	*
	* @param {ytdl.MoreVideoDetails} details - The ytdl.MoreVideoDetails object containing video details.
	* @returns {YoutubeInfo} The converted YoutubeInfo object.
	*/
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

/**
	* Retrieves YouTube video information from a given URL.
	*
	* @param {string} url - The YouTube video URL.
	* @returns {Promise<YoutubeInfo>} A promise that resolves to the YouTube video information.
    */
export const getYoutubeInfo = async function(url: string): Promise<YoutubeInfo> {
	if (!isUrl(url)) return;

	const info = await ytdl.getBasicInfo(url)
		.then((response: ytdl.videoInfo) => response.videoDetails)
		.then(ytdlMoreVideoDetails2YoutubeInfo)
		.catch(console.error);

	if (!info) return;

	return info;
};

/**
	* Enum representing page button IDs.
	* @enum {string}
*/
enum PageButtonID {
	Home     = 'home',
	Next     = 'next',
	Previous = 'previous',
}

/**
	* Returns the label associated with a given page button ID.
	*
	* @param {PageButtonID} id - The page button ID.
	* @returns {string} The label associated with the page button ID.
	*/
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

/**
	* Displays a paginated menu with buttons and a select menu for navigation.
	*
	* @param {Message | ChatInputCommandInteraction} message - The message or interaction to reply to.
	* @param {EmbedBuilder[]} pages - An array of EmbedBuilders representing the pages to display.
	* @param {number} [pageIndex=0] - The initial page index to display. Defaults to 0.
	* @param {number} [timeout=300000] - The timeout in milliseconds for collecting user interactions. Defaults to 5 minutes (300,000 milliseconds).
	* @returns {Promise<void>}
*/
export const pagination = async function(
	message: Message | ChatInputCommandInteraction,
	pages: EmbedBuilder[],
	pageIndex: number = 0,
	timeout: number = 5 * 60 * 1e3,
): Promise<void> {
	if (pages.length === 0) {
		console.error('Empty pages');
		return;
	}
		
	const defaultPageIndex: number = pageIndex;

	const menuRow = new ActionRowBuilder<StringSelectMenuBuilder>()
		.addComponents(
			new StringSelectMenuBuilder()
				.setCustomId('Page')
				.setPlaceholder('Select Page')
				.addOptions(pages.map((embed, index) => {
					// TODO: Make options configurable
					return new StringSelectMenuOptionBuilder()
						.setLabel(`Page ${index + 1}`)
						.setDescription(embed.data.description)
						.setValue(index.toString());
				}))
		);

	const buttonRow = new ActionRowBuilder<ButtonBuilder>()
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
		components: [menuRow, buttonRow],
	});

	const editResponse = async () => await response.edit({
		embeds: [pages[pageIndex]],
		components: [menuRow, buttonRow],
	});

	const buttonCollector = response.createMessageComponentCollector({
		componentType: ComponentType.Button,
		time: timeout,
		filter: interaction => {
			interaction.deferUpdate();
			return interaction.user.id === message.member.user.id;
		},
	});

	buttonCollector.on('collect', async interaction => {
		buttonCollector.resetTimer();

		if (interaction.customId === PageButtonID.Home)
			pageIndex = defaultPageIndex;
		else if (interaction.customId === PageButtonID.Previous)
			pageIndex = (pages.length + pageIndex - 1) % pages.length;
		else if (interaction.customId === PageButtonID.Next)
			pageIndex = (pageIndex + 1) % pages.length;

		editResponse();
	});

	buttonCollector.on('end', () => {
		buttonRow.components.forEach(button => button.setDisabled(true));

		editResponse();
	});

	const menuCollector = response.createMessageComponentCollector({
		componentType: ComponentType.StringSelect,
		time: timeout,
		filter: interaction => {
			interaction.deferUpdate();
			return interaction.user.id === message.member.user.id;
		},
	});

	menuCollector.on('collect', async interaction => {
		buttonCollector.resetTimer();

		pageIndex = parseInt(interaction.values[0]);

		editResponse();
	});

	menuCollector.on('end', () => {
		menuRow.components.forEach(menu => menu.setDisabled(true));

		editResponse();
	});
};

/**
	* Initializes the client for audio playback.
	*
	* @param {Message | ChatInputCommandInteraction} message - The message or interaction triggering the initialization
*/
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
		});

		audioPlayer.on(AudioPlayerStatus.Idle, () => {
			const queue = client.queue.get(guildId);
			if (queue === undefined) return;

			queue.shift();
			if (queue.length === 0) {
				leave.execute(message);
			} else {
				// TODO: move ytdl options to a config file
				const ytdlOptions: ytdl.downloadOptions = {
					filter: 'audioonly',
				};

				const track = queue[0];
				const audioStream = ytdl(track.info.url, ytdlOptions);
				const audioResource = createAudioResource(audioStream, {
					inputType: StreamType.Arbitrary,
				});

				audioPlayer.play(audioResource);
				queueCommand.execute(message);
				nowPlaying.execute(message);
			}
		});

	}
};

/**
	* Capitalizes the first letter of each word in a sentence.
	*
	* @param {string} sentence - The sentence to capitalize.
	* @returns {string} The capitalized sentence
*/
export const capitalizeWords = function(sentence: string): string {
	return sentence
		.split(' ')
		.map(word => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
};

export const uwuRules = {
	faces: [
		'＾ω＾',
		'(≧◡≦)',
		'(≧∇≦)/',
		'ヾ(・ω・ｏ)',
		':3',
		'OwO',
		'UwU',
		'uwu',
		'owo',
		'qwq'
	],
	replacements: [
		{ toReplace: /(?:r|l)/g, with: 'w' },
		{ toReplace: /n([aeiou])/g, with: 'ny$1' },
		{ toReplace: /ove/g, with: 'uv' },
		{ toReplace: /ame/g, with: 'ayme' },
	],
};

/**
	* Converts a sentence into "uwu" style.
	*
	* @param {string} sentence - The sentence to be uwuified.
	* @returns {string} The uwuified sentence
*/
export const uwuify = function(sentence: string): string {
	sentence = sentence.toLowerCase();

	uwuRules.replacements.forEach((letter) => {
		sentence = sentence.replace(letter.toReplace, letter.with);
	});

	if (sentence[0].match(/[a-z]/i)) sentence = `${sentence[0]}-${sentence}`;
	if (sentence[sentence.length - 1].match(/[a-z]/i)) sentence += '~~';
	sentence += ` ${uwuRules.faces[Math.floor(Math.random() * uwuRules.faces.length)]}`;

	return sentence;
};
