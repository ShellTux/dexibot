import { ChatInputCommandInteraction, Message, SlashCommandBuilder } from 'discord.js';
import { Command } from '../../definitions.js';

module.exports = <Command> {
	data: new SlashCommandBuilder()
		.setName('user')
		.setDescription('Provides information about the user.'),
	execute: async (message: ChatInputCommandInteraction | Message) => {
		// TODO: Give more information about the user
		let username: string;

		if (message instanceof ChatInputCommandInteraction)
			username = message.user.username;
		else if (message instanceof Message)
			username = message.member.user.username;

		return message.reply(
			`This command was run by ${username}.`,
		);
	},
};
