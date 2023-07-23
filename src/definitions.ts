import {
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

export type YoutubeThumbnail = {
	url: string;
	width: number;
	height: number;
};

export type YoutubeBasicInfo = {
	id: string;
	url: string;
	title: string;
	duration: number;
	viewCount: number;
}

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
