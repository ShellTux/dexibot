import { Command, YoutubeBasicInfo, YoutubeInfo } from '../../definitions';
import { getYoutubeInfo, isUrl } from '../../functions';
import {
	AudioPlayer,
	StreamType,
	VoiceConnection,
	createAudioResource,
} from '@discordjs/voice';
import {
	ChatInputCommandInteraction,
	Client,
	Message,
	SlashCommandBuilder,
	User,
} from 'discord.js';
import ytdl from 'ytdl-core';
import { execSync } from 'node:child_process';
import join from './join';
import * as queueCommand from './queue';
import nowPlaying from './now-playing';

console.log(`ytdl-core version: ${ytdl.version}`);

const ytdlSearch = function(query: string, amount: number): YoutubeBasicInfo[] {
	// TODO: Pick biggest thumbnail
	// const biggestThumbnail = (
	// 	previous: YoutubeThumbnail,
	// 	current: YoutubeThumbnail,
	// 	index: number,
	// 	array: YoutubeThumbnail[]
	// ): YoutubeThumbnail => {
	// 	if (previous.width * previous.height > current.width * current.height)
	// 		return current;
	// 	return previous;
	// };

	const flags: string = '--flat-playlist --dump-single-json';
	const command: string = `youtube-dl ${flags} "ytsearch${amount}:${query}"`;
	const stdout = execSync(command);
	return JSON
		.parse(stdout.toString())
		.entries
		.map((entry: {
			id: string;
			title: string;
			duration: number;
			view_count: number;
		}) => {
			const info: YoutubeBasicInfo = {
				id: entry.id,
				url: `https://www.youtube.com/watch?v=${entry.id}`,
				title: entry.title,
				duration: entry.duration,
				viewCount: entry.view_count,
			};

			return info;
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

		// TODO: Give better feedback
		if (args.some(arg => arg instanceof User))
			return message.reply('Invalid query');

		if (args.length === 0)
			return message.reply('No query provided');

		const query: string = args.join(' ');
		const client: Client = message.client;
		const audioPlayer: AudioPlayer = client.audioPlayer.get(message.guildId);
		const queue: YoutubeInfo[] = client.queue.get(message.guildId);

		message.channel.send({
			content: ':mag_right: Searching for Music :musical_note:',
		});

		if (isUrl(query)) {
			const result = await getYoutubeInfo(query);
			queue.push(result);
		} else {
			// TODO: Magic number
			const results: YoutubeBasicInfo[] = ytdlSearch(query, 5);

			if (results.length === 0)
				return message.reply('No results found!');

			// TODO: Magic Number, do we always want the first result?
			const result: YoutubeInfo = await getYoutubeInfo(results[0].url);

			queue.push(result);
		}

		// TODO: move ytdl options to a config file
		const ytdlOptions: ytdl.downloadOptions = {
			filter: 'audioonly',
		};

		if (!audioPlayer.checkPlayable()) {
			const track: YoutubeInfo = queue[0];
			const audioStream = ytdl(track.url, ytdlOptions);
			const audioResource = createAudioResource(audioStream, {
				inputType: StreamType.Arbitrary,
			});

			audioPlayer.play(audioResource);
			nowPlaying.execute(message);
		} else {
			queueCommand.execute(message);
		}

		connection.subscribe(audioPlayer);

		return message;
	},
};

export = play;
module.exports = play;
