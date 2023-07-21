import { ChatInputCommandInteraction, Message, SlashCommandBuilder } from 'discord.js';
import { Command } from '../../definitions';

module.exports = <Command>{
	data: new SlashCommandBuilder()
		.setName('stop')
		.setDescription('Stop Music Player'),
	execute: async (
		message: Message | ChatInputCommandInteraction,
	) => {
		message.client.voice.audioPlayer.stop();
		return message;
	},
};
