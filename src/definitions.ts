import {Message, SlashCommandBuilder} from "discord.js";

export type Command = {
    data: SlashCommandBuilder;
    execute: (message: Message) => void;
};
