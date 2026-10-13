import {
	NodeConnectionTypes,
	type INodeProperties,
	type INodeType,
	type INodeTypeDescription,
} from 'n8n-workflow';

const transcriptOptions: INodeProperties[] = [
	{
		displayName: 'Language',
		name: 'language',
		type: 'string',
		default: '',
		placeholder: 'en',
		description: 'BCP-47 code of the caption track to fetch. Defaults to the original or English track.',
		routing: { send: { type: 'body', property: 'language', value: '={{ $value || undefined }}' } },
	},
	{
		displayName: 'Translate To',
		name: 'translateTo',
		type: 'string',
		default: '',
		placeholder: 'es',
		description: 'Machine-translate the transcript into this BCP-47 language (150+ supported)',
		routing: { send: { type: 'body', property: 'translate_to', value: '={{ $value || undefined }}' } },
	},
	{
		displayName: 'Timestamps',
		name: 'timestamps',
		type: 'boolean',
		default: false,
		description: 'Whether to prefix each line with [HH:MM:SS] in Text and Markdown output',
		routing: { send: { type: 'body', property: 'timestamps' } },
	},
	{
		displayName: 'Paragraphs',
		name: 'paragraphs',
		type: 'boolean',
		default: false,
		description: 'Whether to merge caption lines into paragraphs',
		routing: { send: { type: 'body', property: 'paragraphs' } },
	},
	{
		displayName: 'Paragraph Size',
		name: 'chunkSize',
		type: 'number',
		typeOptions: { minValue: 50, maxValue: 10000 },
		default: 1000,
		description: 'Max characters per paragraph when Paragraphs is on',
		routing: { send: { type: 'body', property: 'chunkSize' } },
	},
	{
		displayName: 'Include Segments',
		name: 'includeSegments',
		type: 'boolean',
		default: true,
		description: 'Whether to include timed segments in JSON output. Turn off to get only the full text.',
		routing: { send: { type: 'body', property: 'includeSegments' } },
	},
	{
		displayName: 'Caption Type',
		name: 'captionType',
		type: 'options',
		options: [
			{ name: 'Any', value: 'any' },
			{ name: 'Manual (Uploaded) Only', value: 'manual' },
			{ name: 'Auto-Generated Only', value: 'auto' },
		],
		default: 'any',
		routing: { send: { type: 'body', property: 'captionType' } },
	},
	{
		displayName: 'Mode',
		name: 'mode',
		type: 'options',
		options: [
			{
				name: 'Auto',
				value: 'auto',
				description: 'Use captions, fall back to AI transcription when a video has none',
			},
			{ name: 'Captions Only', value: 'captions', description: 'Never use AI transcription' },
			{ name: 'AI', value: 'ai', description: 'Transcribe the audio even if captions exist' },
		],
		default: 'auto',
		routing: { send: { type: 'body', property: 'mode' } },
	},
	{
		displayName: 'Prefer Original Language',
		name: 'originalLanguage',
		type: 'boolean',
		default: false,
		description: 'Whether to prefer captions in the spoken language over English when no language is set',
		routing: { send: { type: 'body', property: 'originalLanguage' } },
	},
	{
		displayName: 'Start Time (Seconds)',
		name: 'startTime',
		type: 'number',
		default: 0,
		description: 'Return only the transcript from this point on',
		routing: { send: { type: 'body', property: 'startTime' } },
	},
	{
		displayName: 'End Time (Seconds)',
		name: 'endTime',
		type: 'number',
		default: 0,
		description: 'Return only the transcript before this point',
		routing: { send: { type: 'body', property: 'endTime' } },
	},
	{
		displayName: 'Search',
		name: 'search',
		type: 'string',
		default: '',
		description: 'Return only lines containing this text (case-insensitive)',
		routing: { send: { type: 'body', property: 'search' } },
	},
];

const show = (resource: string, operation: string) => ({
	show: { resource: [resource], operation: [operation] },
});

export class TranscriptYt implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'TranscriptYT',
		name: 'transcriptYt',
		icon: { light: 'file:transcriptyt.svg', dark: 'file:transcriptyt.dark.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description:
			'Get YouTube transcripts, search YouTube, list playlists and channels, and summarize videos',
		defaults: { name: 'TranscriptYT' },
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [{ name: 'transcriptYtApi', required: true }],
		requestDefaults: {
			baseURL: 'https://transcript-yt.com',
			headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Transcript', value: 'transcript' },
					{ name: 'Video', value: 'video' },
					{ name: 'Summary', value: 'summary' },
					{ name: 'Account', value: 'account' },
				],
				default: 'transcript',
			},

			// ---------------- Transcript ----------------
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['transcript'] } },
				options: [
					{
						name: 'Get',
						value: 'get',
						action: 'Get a video transcript',
						description: 'Get the transcript of one YouTube video (1 credit)',
						routing: { request: { method: 'POST', url: '/v1/transcript' } },
					},
					{
						name: 'Get Many',
						value: 'getMany',
						action: 'Get transcripts for many videos',
						description:
							'Get up to 50 transcripts in one call, from a list of videos or a playlist or channel (1 credit each)',
						routing: {
							request: { method: 'POST', url: '/v1/transcripts' },
							output: {
								postReceive: [{ type: 'rootProperty', properties: { property: 'results' } }],
							},
						},
					},
				],
				default: 'get',
			},
			{
				displayName: 'Video URL or ID',
				name: 'url',
				type: 'string',
				required: true,
				default: '',
				placeholder: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
				description: 'A YouTube watch, youtu.be, Shorts or embed URL, or an 11-character video ID',
				displayOptions: show('transcript', 'get'),
				routing: { send: { type: 'body', property: 'url' } },
			},
			{
				displayName: 'Format',
				name: 'format',
				type: 'options',
				options: [
					{ name: 'CSV', value: 'csv' },
					{ name: 'JSON', value: 'json', description: 'Text, timed segments and video metadata' },
					{ name: 'Markdown', value: 'md' },
					{ name: 'SRT', value: 'srt' },
					{ name: 'Text', value: 'text' },
					{ name: 'VTT', value: 'vtt' },
				],
				default: 'json',
				description: 'Non-JSON formats are returned in the "content" field',
				displayOptions: show('transcript', 'get'),
				routing: {
					send: { type: 'body', property: 'format' },
					output: {
						postReceive: [
							{
								type: 'set',
								enabled: '={{ $value !== "json" }}',
								properties: {
									value: '={{ { "content": $response.body, "format": $value } }}',
								},
							},
						],
					},
				},
			},
			{
				displayName: 'Source',
				name: 'source',
				type: 'options',
				options: [
					{ name: 'List of Videos', value: 'urls' },
					{ name: 'Playlist or Channel', value: 'playlist' },
				],
				default: 'urls',
				displayOptions: show('transcript', 'getMany'),
			},
			{
				displayName: 'Video URLs or IDs',
				name: 'urls',
				type: 'string',
				required: true,
				default: '',
				placeholder: 'dQw4w9WgXcQ, https://youtu.be/jNQXAC9IVRw',
				description: 'Comma- or newline-separated YouTube URLs or video IDs, up to 50',
				displayOptions: { show: { resource: ['transcript'], operation: ['getMany'], source: ['urls'] } },
				routing: {
					send: {
						type: 'body',
						property: 'urls',
						value:
							'={{ (Array.isArray($value) ? $value : String($value).split(/[\\s,]+/)).filter(Boolean) }}',
					},
				},
			},
			{
				displayName: 'Playlist or Channel URL',
				name: 'playlist',
				type: 'string',
				required: true,
				default: '',
				placeholder: 'https://www.youtube.com/@mkbhd',
				displayOptions: {
					show: { resource: ['transcript'], operation: ['getMany'], source: ['playlist'] },
				},
				routing: { send: { type: 'body', property: 'playlist' } },
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				typeOptions: { minValue: 1, maxValue: 50 },
				default: 50,
				description: 'Max number of results to return',
				displayOptions: {
					show: { resource: ['transcript'], operation: ['getMany'], source: ['playlist'] },
				},
				routing: { send: { type: 'body', property: 'limit' } },
			},
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				displayOptions: { show: { resource: ['transcript'] } },
				options: transcriptOptions,
			},

			// ---------------- Video ----------------
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['video'] } },
				options: [
					{
						name: 'Search',
						value: 'search',
						action: 'Search videos',
						description: 'Search YouTube, optionally within one channel (free)',
						routing: {
							request: { method: 'GET', url: '/v1/search' },
							output: {
								postReceive: [{ type: 'rootProperty', properties: { property: 'videos' } }],
							},
						},
					},
					{
						name: 'List Playlist or Channel',
						value: 'playlist',
						action: 'List videos in a playlist or channel',
						description: "List the videos in a playlist or a channel's uploads (free)",
						routing: {
							request: { method: 'GET', url: '/v1/playlist' },
							output: {
								postReceive: [{ type: 'rootProperty', properties: { property: 'videos' } }],
							},
						},
					},
					{
						name: 'List Languages',
						value: 'languages',
						action: 'List caption languages of a video',
						description: 'List the caption tracks a video has (free)',
						routing: { request: { method: 'GET', url: '/v1/languages' } },
					},
				],
				default: 'search',
			},
			{
				displayName: 'Query',
				name: 'q',
				type: 'string',
				required: true,
				default: '',
				displayOptions: show('video', 'search'),
				routing: { send: { type: 'query', property: 'q' } },
			},
			{
				displayName: 'Channel',
				name: 'channel',
				type: 'string',
				default: '',
				placeholder: '@mkbhd',
				description: 'Restrict the search to this channel URL or @handle',
				displayOptions: show('video', 'search'),
				routing: { send: { type: 'query', property: 'channel', value: '={{ $value || undefined }}' } },
			},
			{
				displayName: 'Playlist or Channel URL',
				name: 'listUrl',
				type: 'string',
				required: true,
				default: '',
				placeholder: 'https://www.youtube.com/playlist?list=...',
				displayOptions: show('video', 'playlist'),
				routing: { send: { type: 'query', property: 'url' } },
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				typeOptions: { minValue: 1, maxValue: 500 },
				default: 50,
				description: 'Max number of results to return',
				displayOptions: { show: { resource: ['video'], operation: ['search', 'playlist'] } },
				routing: { send: { type: 'query', property: 'limit' } },
			},
			{
				displayName: 'Video URL or ID',
				name: 'videoUrl',
				type: 'string',
				required: true,
				default: '',
				displayOptions: show('video', 'languages'),
				routing: { send: { type: 'query', property: 'url' } },
			},

			// ---------------- Summary ----------------
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['summary'] } },
				options: [
					{
						name: 'Get',
						value: 'get',
						action: 'Summarize a video',
						description: 'AI summary, key points and timestamped notes for a video',
						routing: { request: { method: 'POST', url: '/v1/summary' } },
					},
				],
				default: 'get',
			},
			{
				displayName: 'Video URL or ID',
				name: 'summaryUrl',
				type: 'string',
				required: true,
				default: '',
				displayOptions: show('summary', 'get'),
				routing: { send: { type: 'body', property: 'url' } },
			},
			{
				displayName: 'Options',
				name: 'summaryOptions',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				displayOptions: show('summary', 'get'),
				options: transcriptOptions.slice(0, 2),
			},

			// ---------------- Account ----------------
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['account'] } },
				options: [
					{
						name: 'Get Usage',
						value: 'getUsage',
						action: 'Get credit usage',
						description: 'Plan, credits used and credits remaining',
						routing: { request: { method: 'GET', url: '/v1/usage' } },
					},
				],
				default: 'getUsage',
			},
		],
	};
}
