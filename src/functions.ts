import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ChatInputCommandInteraction,
	ComponentType,
	EmbedBuilder,
	Message
} from 'discord.js';

enum PageButtonID {
	Home     = 'home',
	Next     = 'next',
	Previous = 'previous',
}

const pageButtonLabel = function (id: PageButtonID): string {
	switch (id) {
	case PageButtonID.Home:
		return 'Home';
	case PageButtonID.Next:
		return 'Next Page';
	case PageButtonID.Previous:
		return 'Previous Page';
	}
};

export const pagination = async function(
	message: Message | ChatInputCommandInteraction,
	pages: EmbedBuilder[],
	pageIndex: number = 0
) {
	if (pages.length === 0) {
		console.error('Empty pages');
		return;
	}
		
	const defaultPageIndex: number = pageIndex;
	const paginationButtonRow = new ActionRowBuilder<ButtonBuilder>()
		.addComponents(
			new ButtonBuilder()
				.setCustomId(PageButtonID.Previous)
				.setLabel(pageButtonLabel(PageButtonID.Previous))
				.setStyle(ButtonStyle.Secondary)
				.setEmoji('⬅️'),
			new ButtonBuilder()
				.setCustomId(PageButtonID.Home)
				.setLabel(pageButtonLabel(PageButtonID.Home))
				.setStyle(ButtonStyle.Primary)
				.setEmoji('🏠'),
			new ButtonBuilder()
				.setCustomId(PageButtonID.Next)
				.setLabel(pageButtonLabel(PageButtonID.Next))
				.setStyle(ButtonStyle.Success)
				.setEmoji('➡️'),
		);

	const response = await message.reply({
		embeds: [pages[defaultPageIndex]],
		components: [paginationButtonRow],
	});

	const editResponse = async () => await response.edit({
		embeds: [pages[pageIndex]],
		components: [paginationButtonRow],
	});

	const collector = response.createMessageComponentCollector({
		componentType: ComponentType.Button,
		// TODO: Magic Number
		time: 5 * 60 * 1e3,
		filter: interaction => {
			interaction.deferUpdate();
			return interaction.user.id === message.member.user.id;
		},
	});

	collector.on('collect', async interaction => {
		collector.resetTimer();

		if (interaction.customId === PageButtonID.Home)
			pageIndex = defaultPageIndex;
		else if (interaction.customId === PageButtonID.Previous)
			pageIndex = (pages.length + pageIndex - 1) % pages.length;
		else if (interaction.customId === PageButtonID.Next)
			pageIndex = (pageIndex + 1) % pages.length;

		editResponse();
	});

	collector.on('end', () => {
		paginationButtonRow.components.forEach(button => button.setDisabled(true));

		editResponse();
	});
};
