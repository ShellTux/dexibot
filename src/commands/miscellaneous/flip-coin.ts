import { ChatInputCommandInteraction, Message, SlashCommandBuilder } from 'discord.js';
import { Command } from '../../definitions';

const flipCoin: Command = {
	data: new SlashCommandBuilder()
		.setName('flip-coin')
		.setDescription('Flip a coin'),
	execute(message: Message | ChatInputCommandInteraction) {
		const coinFlipGif = './assets/flip-coin/coinflip.gif';
		const coinResults = {
			heads: './assets/flip-coin/heads.jpg',
			tails: './assets/flip-coin/tails.jpg',
		};

		message.channel
			.send({
				files: [coinFlipGif],
			})
			.then((response: Message) => {
				const keys = Object.keys(coinResults);
				const index = Math.floor(Math.random() * keys.length);
				const result = keys[index];
				const coinPath: string = coinResults[result];

				setTimeout(() => {
					response.delete()
						.then(() => {
							message.channel.send({
								content: result,
								files: [coinPath],
							});
						});
				}, 5 * 1e3);
			});
		return message;
	},
};

export = flipCoin;
module.exports = flipCoin;
