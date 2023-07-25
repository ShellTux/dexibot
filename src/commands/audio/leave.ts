import { Command, QueueTrack } from '../../definitions';
import { getVoiceConnection } from '@discordjs/voice';
import {
	ChatInputCommandInteraction,
	Message,
	SlashCommandBuilder,
	VoiceBasedChannel
} from 'discord.js';

const leave: Command = {
	data: new SlashCommandBuilder().setName('leave').setDescription('Leave Voice Channel'),
	execute: async (message: Message | ChatInputCommandInteraction) => {
		let voiceChannel: VoiceBasedChannel;

		if (message instanceof Message) {
			voiceChannel = message.member.voice.channel;
		}

		const connection = getVoiceConnection(voiceChannel.guildId);

		if (!connection)
			return message.reply('Not connected to a voice channel!');

		const queue: QueueTrack[] = message.client.queue.get(message.guildId);
		queue.splice(0, queue.length);

		connection.destroy();
	},
};

export = leave;
module.exports = leave;
