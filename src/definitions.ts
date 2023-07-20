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
	) => void;
	once?: boolean;
};

export type YoutubeThumbnail = {
	url: string;
	width: number;
	height: number;
};

export type YoutubeInfo = {
	id: string;
	url: string;
	title: string;
	duration: number;
	channel_url: string;
	thumbnail?: YoutubeThumbnail;
	view_count: number;
};
