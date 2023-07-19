import { Command } from '../../definitions';
import { getVoiceConnection } from '@discordjs/voice';
import {
	ChatInputCommandInteraction,
	Message,
	SlashCommandBuilder,
	VoiceBasedChannel
} from 'discord.js';

module.exports = <Command> {
	data: new SlashCommandBuilder().setName('leave').setDescription('Leave Voice Channel'),
	execute: async (message: Message | ChatInputCommandInteraction) => {
		let voiceChannel: VoiceBasedChannel;

		if (message instanceof Message) {
			voiceChannel = message.member.voice.channel;
		}

		const connection = getVoiceConnection(voiceChannel.guildId);

		connection.destroy();
	},
};
