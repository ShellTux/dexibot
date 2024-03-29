import chalk from 'chalk';
import {
	APIUser,
	ChatInputCommandInteraction,
	Message,
	SlashCommandBuilder,
	User,
} from 'discord.js';

export type Command = {
	data: SlashCommandBuilder;
	enabled?: boolean;
	execute: (
		message: Message | ChatInputCommandInteraction,
		args?: (string | User)[],
	) => unknown;
	once?: boolean;
};

/**
	* Represent a Youtube Thumbnail
*/
export type YoutubeThumbnail = {
	url: string;
	width: number;
	height: number;
};

/**
	* Represents basic information about a YouTube videos
*/
export type YoutubeBasicInfo = {
	id: string;
	url: string;
	title: string;
	duration: number;
	viewCount: number;
}

/**
	* Represents detailed information about a YouTube video
*/
export type YoutubeInfo = YoutubeBasicInfo & {
	channel: {
		name: string;
		url: string;
		id: string;
		userUrl?: string;
		subscriberCount?: number;
	};
	thumbnail?: YoutubeThumbnail;
	uploadDate: string;
	category?: string;
	isLive: boolean;
	likes: number;
	dislikes: number;
};

export type QueueTrack = {
	info: YoutubeInfo;
	requestedBy: User | APIUser;
};

export const error   = chalk.bold.red;
export const warning = chalk.yellow;
