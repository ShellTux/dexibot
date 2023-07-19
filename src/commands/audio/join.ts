import { Command } from '../../definitions.js';
import {
	VoiceConnection,
	VoiceConnectionStatus,
	entersState,
	joinVoiceChannel
} from '@discordjs/voice';
import {
	ChatInputCommandInteraction,
	Message,
	SlashCommandBuilder,
	VoiceBasedChannel
} from 'discord.js';

module.exports = <Command> {
	data: new SlashCommandBuilder().setName('join').setDescription('Join Voice Channel'),
	execute: async (message: Message | ChatInputCommandInteraction) => {
		let voiceChannel: VoiceBasedChannel;

		if (message instanceof Message) {
			voiceChannel = message.member.voice.channel;
		}

		const connection: VoiceConnection = joinVoiceChannel({
			channelId: voiceChannel.id,
			guildId: voiceChannel.guildId,
			adapterCreator: voiceChannel.guild.voiceAdapterCreator,
			selfDeaf: true,
		});

		try {
			await entersState(connection, VoiceConnectionStatus.Ready, 30_000);
			return connection;
		} catch (error) {
			connection.destroy();
			throw error;
		}
	},
};
