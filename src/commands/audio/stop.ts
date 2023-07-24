import { ChatInputCommandInteraction, Message, SlashCommandBuilder } from 'discord.js';
import { Command } from '../../definitions';
import leave from './leave';

module.exports = <Command>{
	data: new SlashCommandBuilder()
		.setName('stop')
		.setDescription('Stop Music Player'),
	execute: async (
		message: Message | ChatInputCommandInteraction,
	) => {
		leave.execute(message);
	},
};
