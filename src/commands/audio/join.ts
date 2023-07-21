import { Command } from '../../definitions.js';
import {
	VoiceConnection,
	VoiceConnectionStatus,
	entersState,
	getVoiceConnection,
	joinVoiceChannel
} from '@discordjs/voice';
import {
	ChatInputCommandInteraction,
	Message,
	SlashCommandBuilder,
	VoiceBasedChannel
} from 'discord.js';

const join: Command = {
	data: new SlashCommandBuilder().setName('join').setDescription('Join Voice Channel'),
	execute: async (
		message: Message | ChatInputCommandInteraction
	): Promise<VoiceConnection> => {
		const voiceChannel: VoiceBasedChannel = (message instanceof Message)
			? message.member.voice.channel
			: undefined;

		if (!voiceChannel) {
			message.reply('You need to join a voice channel first');
			return;
		}

		let connection: VoiceConnection = getVoiceConnection(message.guildId);

		if (!connection) {
			connection = joinVoiceChannel({
				channelId: voiceChannel.id,
				guildId: voiceChannel.guildId,
				adapterCreator: voiceChannel.guild.voiceAdapterCreator,
				selfDeaf: true,
			});

			try {
				await entersState(
					connection,
					VoiceConnectionStatus.Ready,
					30_000);
			} catch (error) {
				connection.destroy();
				throw error;
			}
		}

		return connection;
	},
};

export = join;
module.exports = join;
