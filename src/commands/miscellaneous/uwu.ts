import {
	ChatInputCommandInteraction,
	Message,
	SlashCommandBuilder,
	User
} from 'discord.js';
import { Command } from '../../definitions';
import { uwuify } from '../../functions';

const uwu: Command = {
	data: new SlashCommandBuilder()
		.setName('uwu')
		.setDescription('uwu-ify a sentence'),
	execute: async (
		message: Message | ChatInputCommandInteraction,
		args?: (string | User)[],
	) => {
		// TODO: Implement for ChatInputCommandInteraction
		if (message instanceof ChatInputCommandInteraction) return;

		const content = args
			.map(arg => (arg instanceof User) ? arg.toString() : arg)
			.join(' ');

		message.channel.send(uwuify(content));
	},
};

export = uwu;
module.exports = uwu;
