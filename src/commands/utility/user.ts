import { ChatInputCommandInteraction, Message, SlashCommandBuilder } from 'discord.js';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('user')
        .setDescription('Provides information about the user.'),
    execute: async (interaction: ChatInputCommandInteraction | Message) => {
        if (interaction instanceof ChatInputCommandInteraction) {
            await interaction.reply(
                `This command was run by ${interaction.user.username}.`,
            );
        }
    },
};
