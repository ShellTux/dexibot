import { ChatInputCommandInteraction, Message, SlashCommandBuilder } from 'discord.js';
import { Command } from '../../definitions';

module.exports = <Command>{
	data: new SlashCommandBuilder()
		.setName('pause')
		.setDescription('Pause Music Player'),
	execute: async (
		message: Message | ChatInputCommandInteraction,
	) => {
		const audioPlayer = message.client.audioPlayer.get(message.guildId);

		audioPlayer.pause();
		return message;
	},
};
