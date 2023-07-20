import { Command, YoutubeInfo, YoutubeThumbnail } from '../../definitions.js';
import {
	AudioPlayerStatus,
	NoSubscriberBehavior,
	StreamType,
	VoiceConnection,
	VoiceConnectionStatus,
	createAudioPlayer,
	createAudioResource,
	entersState,
	getVoiceConnection,
	joinVoiceChannel
} from '@discordjs/voice';
import {
	ChatInputCommandInteraction,
	Message,
	SlashCommandBuilder,
	User,
	VoiceBasedChannel
} from 'discord.js';
import ytdl from 'ytdl-core';
import { exec, execSync } from 'node:child_process';

console.log(`ytdl-core version: ${ytdl.version}`);

const isUrl = function(url: string): boolean {
	const urlPattern = /^(https?|):\/\/[^\s/$.?#].[^\s]*$/i;
	return urlPattern.test(this);
};

const ytdlSearch = function(query: string, amount: number): YoutubeInfo[] {
	const results: YoutubeInfo[] = [];
	const youtube_dlFlags: string = '--flat-playlist --dump-single-json';
	const command: string = `youtube-dl ${youtube_dlFlags} "ytsearch${amount}:${query}"`;
	const biggestThumbnail = (previous: YoutubeThumbnail, current: YoutubeThumbnail, index: number, array: YoutubeThumbnail[]): YoutubeThumbnail => {
		if (previous.width * previous.height > current.width * current.height)
			return current;
		return previous;
	};

	const stdout = execSync(command);
	const resultJson = JSON.parse(stdout.toString());
	for (const entry of resultJson.entries) {
		// const thumbnails: YoutubeThumbnail[] = entry.thumbnails;
		const youtubeInfo: YoutubeInfo = {
			id: entry.id,
			url: entry.url,
			title: entry.title,
			duration: entry.duration,
			channel_url: entry.channel_url,
			view_count: entry.view_count,
		};
		results.push(youtubeInfo);
	}
	return results;
};

module.exports = <Command>{
	data: new SlashCommandBuilder().setName('play').setDescription('Play Music'),
	execute: async (
		message: Message | ChatInputCommandInteraction,
		args?: (string | User)[]
	) => {
		// TODO: Use join and leave function, instead of repeated code
		const voiceChannel: VoiceBasedChannel = (message instanceof Message)
			? message.member.voice.channel
			: undefined;

		if (!voiceChannel)
			return message.reply('You need to join a voice channel first');

		let connection: VoiceConnection = getVoiceConnection(message.guildId);

		if (!connection) {
			connection = joinVoiceChannel({
				channelId: voiceChannel.id,
				guildId: voiceChannel.guildId,
				adapterCreator: voiceChannel.guild.voiceAdapterCreator,
				selfDeaf: true,
			});

			try {
				await entersState(connection,
						  VoiceConnectionStatus.Ready, 30_000);
			} catch (error) {
				connection.destroy();
				throw error;
			}
		}

		const audioPlayer = createAudioPlayer({
			behaviors: {
				noSubscriber: NoSubscriberBehavior.Pause,
			},
		});
		
		// TODO: Give better feedback
		if (args.some(arg => arg instanceof User))
			return message.reply('Invalid query');

		if (args.length === 0)
			return message.reply('No query provided');

		const query: string = args.join(' ');

		let url: string;
		if (isUrl(query))
			url = query;
		else {
			// TODO: Magic number
			const results: YoutubeInfo[] = ytdlSearch(query, 5);

			if (results.length === 0)
				return message.reply('No results found!');

			// TODO: Magic Number, do we always want the first result?
			url = results[0].url;
		}

		// TODO: move ytdl options to a config file
		const ytdl_options: ytdl.downloadOptions = {
			filter: 'audioonly',
		};

		const audioStream = ytdl(url, ytdl_options);

		const audioResource = createAudioResource(audioStream, {
			inputType: StreamType.Arbitrary,
		});

		audioPlayer.play(audioResource);

		const subscription = connection.subscribe(audioPlayer);

		audioPlayer.on(AudioPlayerStatus.Idle, () => {
			subscription.unsubscribe();
			connection.destroy();
		});

		return message;
	},
};
