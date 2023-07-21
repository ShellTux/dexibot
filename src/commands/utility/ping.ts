import { ChatInputCommandInteraction, Message, SlashCommandBuilder } from 'discord.js';
import {Command} from '../../definitions';

module.exports = <Command> {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!'),
	execute: async (message: Message | ChatInputCommandInteraction) => {
		await message.reply('Pong!');
	},
	enabled: false,
};
