import 'dotenv/config';
import {
	ChatInputCommandInteraction,
	EmbedBuilder,
	Message,
	SlashCommandBuilder
} from 'discord.js';
import { Command } from '../../definitions';
import { pagination } from '../../functions';

const PREFIX = process.env.PREFIX;

const help: Command = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Bot Help page'),
	execute: async (message: Message | ChatInputCommandInteraction) => {
		// TODO: add help page for single command
		// TODO: Add menu selection, spread commands over categories
		// TODO: Add options

		const embedCommands: EmbedBuilder[] = Array
			.from(message.client.commands.values())
			.sort((commandA: Command, commandB: Command) => {
				if (commandA.data.name === 'help')
					return -1;

				if (commandB.data.name === 'help')
					return 1;

				return commandA.data.name > commandB.data.name ? 1 : -1;
			})
			.map((command, i, array) => {
				return new EmbedBuilder()
					.setTitle('Help Page')
					.setDescription(`/${command.data.name}`)
					.setColor(0x00FF00)
					.setTimestamp()
					.setFooter({
						text: `Page ${i + 1} / ${array.length}`
					})
					.addFields(
						{
							name: `${PREFIX}${command.data.name}`,
							value: command.data.description,
						}
					);
			});

		pagination(message, embedCommands);
	},
};

export = help;
module.exports = help;
