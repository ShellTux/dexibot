import { ChatInputCommandInteraction, Message, SlashCommandBuilder } from 'discord.js';
import { Command } from '../../definitions';

module.exports = <Command>{
	data: new SlashCommandBuilder()
		.setName('stop')
		.setDescription('Stop Music Player'),
	execute: async (
		message: Message | ChatInputCommandInteraction,
	) => {
		const audioPlayer = message.client.audioPlayer.get(message.guildId);

		audioPlayer.stop();
		return message;
	},
};
