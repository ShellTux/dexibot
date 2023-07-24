import { ChatInputCommandInteraction, Message, SlashCommandBuilder } from 'discord.js';
import { Command } from '../../definitions';

module.exports = <Command>{
	data: new SlashCommandBuilder()
		.setName('skip')
		.setDescription('Skip to next track on the queue'),
	execute: async (
		message: Message | ChatInputCommandInteraction,
	) => {
		const audioPlayer = message.client.audioPlayer.get(message.guildId);

		audioPlayer.stop();
		return message;
	},
};
