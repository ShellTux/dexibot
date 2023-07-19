import { ChatInputCommandInteraction, Message, SlashCommandBuilder } from 'discord.js';
import { Command } from '../../definitions.js';

module.exports = <Command> {
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
