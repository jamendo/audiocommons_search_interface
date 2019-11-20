const translations = {
	generic: {
		and: 'and',
		yes: 'yes',
		no: 'no',
		clear: 'clear',
		monthNamesByIndex: {
			0: 'January',
			1: 'February',
			2: 'March',
			3: 'April',
			4: 'May',
			5: 'June',
			6: 'July',
			7: 'August',
			8: 'September',
			9: 'October',
			10: 'November',
			11: 'December'
		},
		startDate: 'Start Date',
		endDate: 'End Date'
	},
	data: {
		genres: {
			hiphop: 'Hip Hop',
			newage: 'New Age'
		},
		themes: {
			videogame: 'Video Game'
		},
		instruments: {
			electricguitar: 'Electric Guitar',
			slideguitar: 'Slide Guitar',
			classicalguitar: 'Classical Guitar',
			acousticguitar: 'Acoustic Guitar'
		}
	},
	views: {
		pagination: {
			paginationControl: {
				previousPage: 'previous',
				nextPage: 'next',
				of: 'of'
			}
		}
	},
	pages: {
		search: {
			heading1: 'Your search',
			searchFieldPlaceholder: 'Search for music and sound samples...',
			licenseSectionHeading: 'Choose CC license',
			allowFreeCommercialUseLabel: 'Allow commercial use for free',
			allowModificationsLabel: 'Allow modifications',
			allowModificationsAlasShareAlike: 'Yes, as long as others share alike',
			musicTypeHeading: 'What kind of audio',
			musicTypeSong: 'music',
			musicTypeSample: 'sound sample',
			vocalOrInstrumentalLabel: 'Vocals/Instrumental',
			withVocals: 'with vocals',
			instrumental: 'instrumental',
			instrumentsLabel: 'instruments',
			submitButtonLabel: 'Search',
			genresLabel: 'Genres',
			moodsLabel: 'Moods',
			themesLabel: 'Themes',
			licenseHeadingInfoOverlayContent: `
				Select which licenses you would like to include:
				<a href="https://creativecommons.org/licenses/" target="_blank">read more</a>
			`
		},
		results: {
			updateSearchButtonLabel: 'Search with your criteria',
			newSearchButtonLabel: 'new search',
			filterNotSupportedByProviderText: 'This filter is not supported by',
			filterSupportedBy: 'It is supported by',
			searchPanel: {
				refineYourSearch: 'refine your search',
				musicTypeLabel: 'kind of audio',
				creationDateLabel: 'creation date',
				licenseTypeLabel: 'license type',
				musicTypeSong: 'music',
				musicTypeSample: 'sound sample',
				channelsLabel: 'channels',
				channelsAll: 'all',
				channelsStereo: 'stereo',
				channelsMono: 'mono',
				durationLabel: 'duration (sec)',
				samplerateLabel: 'samplerate (kHz)',
				bitrateLabel: 'bitrate (kbps)',
				bitdepthLabel: 'bitdepth (bits)',
				fileSizeLabel: 'file size (Mb)'
			},
			warnings: {
				'Empty query parameter': 'Please enter a search term in the text field.',
				'Can\'t return unsupported field': 'Not all fields are supported.'
			},
			resultsPanel: {
				noResultsForThisProvider: 'No results found for this provider.',
				buyLicenseButtonLabel: 'buy a license',
				header: {
					resultsFound: 'results found',
					changeProviderLabel: 'change provider',
					sortingLabel: 'Sort by',
					sortByRelevanceAsc: 'Relevance: Low to High',
					sortByRelevanceDesc: 'Relevance: High to Low',
					sortByPopularityAsc: 'Popularity: Low to High',
					sortByPopularityDesc: 'Popularity: High to Low',
					sortByDurationAsc: 'Duration: Low to High',
					sortByDurationDesc: 'Duration: High to Low',
					sortByCreatedAsc: 'Created: Low to High',
					sortByCreatedDesc: 'Created: High to Low',
					sortByDownloadsAsc: 'Downloads: Low to High',
					sortByDownloadsDesc: 'Downloads: High to Low'
				},
				resultsListColumnName: {
					title: 'Title',
					author: 'Author',
					duration: 'Duration',
					license: 'License type',
					providerLinks: 'Provider Link',
					creationDate: 'Creation date',
					download: 'Download',
					waveform: 'waveform'
				},
				providerLinkText: {
					Jamendo: 'Get on Jamendo',
					Europeana: 'Get on Europeana',
					Freesound: 'Get on Freesound'
				}
			}
		}
	}
};

export default translations;
