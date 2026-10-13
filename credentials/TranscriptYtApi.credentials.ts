import type {
	IAuthenticateGeneric,
	Icon,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class TranscriptYtApi implements ICredentialType {
	name = 'transcriptYtApi';

	displayName = 'TranscriptYT API';

	icon: Icon = { light: 'file:../icons/transcriptyt.svg', dark: 'file:../icons/transcriptyt.dark.svg' };

	documentationUrl = 'https://transcript-yt.com/docs';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			description: 'Your ts_live_ key from https://transcript-yt.com/dashboard/keys (100 free credits)',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'x-api-key': '={{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://transcript-yt.com',
			url: '/v1/usage',
			method: 'GET',
		},
	};
}
