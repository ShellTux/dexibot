require('dotenv').config();
import { ChatInputCommandInteraction, Message, SlashCommandBuilder } from 'discord.js';
import { Command } from '../../definitions.js';

const PREFIX = process.env.PREFIX;

export const data = new SlashCommandBuilder()
    .setName('help')
    .setDescription('Bot Help page');

export async function execute(message: Message | ChatInputCommandInteraction) {
    // TODO: add help page for single command
    await message.reply(
        message.client.commands
            .sort((commandA: Command, commandB: Command) =>
                commandA.data.name > commandB.data.name ? 1 : -1,
            )
            .map(
                (command: Command, key: string) =>
                    `${PREFIX}${key}: ${command.data.description}`,
            )
            .join('\n'),
    );
}
