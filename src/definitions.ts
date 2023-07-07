import {
    ChatInputCommandInteraction,
    Message,
    SlashCommandBuilder,
    User,
} from 'discord.js';

export type Command = {
    data: SlashCommandBuilder;
    enabled?: boolean;
    execute: (
        message: Message | ChatInputCommandInteraction,
        args?: (string | User)[],
    ) => void;
    once?: boolean;
};
