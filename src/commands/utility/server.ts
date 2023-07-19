import { ChatInputCommandInteraction, Message, SlashCommandBuilder } from 'discord.js';
import {Command} from '../../definitions.js';

module.exports = <Command> {
    data: new SlashCommandBuilder()
        .setName('server')
        .setDescription('Provides information about the server.'),
    execute: async (message: Message | ChatInputCommandInteraction) => {
        await message.reply(
            `This server is ${message.guild.name} ` +
                `and has ${message.guild.memberCount} members.`,
        );
    },
};
