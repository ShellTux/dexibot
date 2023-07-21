import { ChatInputCommandInteraction, Message, SlashCommandBuilder } from 'discord.js';
import { Command } from '../../definitions';

module.exports = <Command> {
	data: new SlashCommandBuilder()
		.setName('server')
		.setDescription('Provides information about the server.'),
	execute: async (message: Message | ChatInputCommandInteraction) => {
		// TODO: Give more information about the server
		return message.reply(
			`This server is ${message.guild.name} ` +
                `and has ${message.guild.memberCount} members.`,
		);
	},
};
