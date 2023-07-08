import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChatInputCommandInteraction,
    ComponentType,
    Message,
    MessageComponentInteraction,
    MessageMentions,
    SlashCommandBuilder,
    User,
} from 'discord.js';
import { Command } from '../../definitions';

module.exports = <Command>{
    data: new SlashCommandBuilder()
        .setName('tictactoe')
        .setDescription('Play the Tic Tac Toe game!'),
    enabled: true,
    execute: async (message: Message | ChatInputCommandInteraction, args?: string[]) => {
        const players: User[] = [];

        if (message instanceof Message) players.push(message.author);
        else players.push(message.user);

        if (args.length == 0) players.push(message.client.user);
        else {
            const users = args[0].match(MessageMentions.UsersPattern);
            if (users == null)
                return message
                    .reply({
                        content: 'Problem with finding that user',
                    })
                    .then((msg) => {
                        setTimeout(() => msg.delete(), 10 * 1e3);
                    })
                    .catch(console.error);
            players.push(
                message.guild.members.cache.get(users[0]).user,
            );
        }

        const ROWS: number = 3;
        const COLS: number = 3;
        let turn: number = 0;
        const grid = new Array(ROWS)
            .fill(0)
            .map((_, row) =>
                new ActionRowBuilder<ButtonBuilder>().addComponents(
                    new Array(COLS)
                        .fill(0)
                        .map((_, col) =>
                            new ButtonBuilder()
                                .setCustomId(`${row},${col}`)
                                .setLabel('_')
                                .setStyle(ButtonStyle.Secondary),
                        ),
                ),
            );

        message
            .reply({
                components: grid,
                content: `Vez de <@!${players[turn].id}>`,
            })
            .then((msg) => {
                const message: Message = msg;
                const collector = message.createMessageComponentCollector({
                    componentType: ComponentType.Button,
                    time: 2 * 60 * 1e3,
                    filter: (interaction: MessageComponentInteraction) => {
                        if (players[turn].id === interaction.user.id) return true;
                        else {
                            interaction.deferUpdate();
                            return false;
                        }
                    },
                });

                collector.on('collect', (interaction: MessageComponentInteraction) => {
                    interaction.deferUpdate();
                    collector.resetTimer();

		    turn = (turn + 1) % players.length;
                });

                collector.on('end', () => {
                    grid.forEach((row) =>
                        row.components.forEach((button) => button.setDisabled(true)),
                    );
                    message.edit({ components: grid });
                });
            })
            .catch(console.error);
    },
};
