import { ChatInputCommandInteraction, Message, SlashCommandBuilder } from 'discord.js';
import { Command } from '../../definitions';

module.exports = <Command> {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!'),
	execute: async (message: Message | ChatInputCommandInteraction) => {
		message.reply({
			content: 'Calculating ping',
		}).then(result => {
			const deltaTime = result.createdTimestamp - message.createdTimestamp;

			return result.edit({
				content: `Bot latency: ${deltaTime}\nPing: ${message.client.ws.ping}`,
			});
		});
	},
};
