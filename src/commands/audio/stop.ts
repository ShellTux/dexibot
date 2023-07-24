import { ChatInputCommandInteraction, Message, SlashCommandBuilder } from 'discord.js';
import { Command } from '../../definitions';

module.exports = <Command>{
	data: new SlashCommandBuilder()
		.setName('stop')
		.setDescription('Stop Music Player'),
	execute: async (
		message: Message | ChatInputCommandInteraction,
	) => {
		message.client.queue.set(message.guildId, []);
		message.client.audioPlayer.get(message.guildId).stop();
	},
};
