import { Command, YoutubeInfo, YoutubeThumbnail } from '../../definitions';
import { isUrl } from '../../functions';
import {
	AudioPlayerStatus,
	NoSubscriberBehavior,
	StreamType,
	VoiceConnection,
	createAudioPlayer,
	createAudioResource,
} from '@discordjs/voice';
import {
	ChatInputCommandInteraction,
	Message,
	SlashCommandBuilder,
	User,
} from 'discord.js';
import ytdl from 'ytdl-core';
import { execSync } from 'node:child_process';
import leave from './leave';
import join from './join';

console.log(`ytdl-core version: ${ytdl.version}`);

const ytdlSearch = function(query: string, amount: number): YoutubeInfo[] {
	const biggestThumbnail = (
		previous: YoutubeThumbnail,
		current: YoutubeThumbnail,
		index: number,
		array: YoutubeThumbnail[]
	): YoutubeThumbnail => {
		if (previous.width * previous.height > current.width * current.height)
			return current;
		return previous;
	};

	const flags: string = '--flat-playlist --dump-single-json';
	const command: string = `youtube-dl ${flags} "ytsearch${amount}:${query}"`;
	const stdout = execSync(command);
	return JSON
		.parse(stdout.toString())
		.entries
		.map(entry => <YoutubeInfo>{
			id: entry.id,
			url: entry.url,
			title: entry.title,
			duration: entry.duration,
			channel_url: entry.channel_url,
			view_count: entry.view_count,
		});
};

const play: Command = {
	data: new SlashCommandBuilder().setName('play').setDescription('Play Music'),
	execute: async (
		message: Message | ChatInputCommandInteraction,
		args?: (string | User)[]
	) => {
		const connection = <VoiceConnection> await join.execute(message);

		if (!connection) return;

		const audioPlayer = createAudioPlayer({
			behaviors: {
				noSubscriber: NoSubscriberBehavior.Pause,
			},
		});

		message.client.voice.audioPlayer = audioPlayer;
		
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

		audioPlayer.stop();
		const audioResource = createAudioResource(audioStream, {
			inputType: StreamType.Arbitrary,
		});

		audioPlayer.play(audioResource);

		const subscription = connection.subscribe(audioPlayer);

		audioPlayer.on(AudioPlayerStatus.Idle, () => {
			subscription.unsubscribe();
			leave.execute(message);
		});

		return message;
	},
};

export = play;
module.exports = play;
