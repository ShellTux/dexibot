import {ChatInputCommandInteraction, Message, SlashCommandBuilder} from "discord.js";

export type Command = {
    data: SlashCommandBuilder;
    enabled?: boolean,
    execute: (message: Message | ChatInputCommandInteraction, args?: string[]) => void,
    once?: boolean,
};
