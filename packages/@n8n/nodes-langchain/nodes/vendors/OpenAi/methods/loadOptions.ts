import type { ILoadOptionsFunctions, INodePropertyOptions } from 'n8n-workflow';

import { apiRequest } from '../transport';

export async function getFiles(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	const { data } = await apiRequest.call(this, 'GET', '/files', { qs: { purpose: 'assistants' } });

	const returnData: INodePropertyOptions[] = [];

	for (const file of data || []) {
		returnData.push({
			name: file.filename as string,
			value: file.id as string,
		});
	}

	return returnData;
}

export async function getReasoningEffortOptions(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	// modelId is a resource locator; extract the actual id string
	let modelId = '';
	try {
		modelId = (this.getNodeParameter('modelId', '', { extractValue: true }) as string) || '';
	} catch {}

	const base: INodePropertyOptions[] = [
		{ name: 'Low', value: 'low', description: 'Favors speed and economical token usage' },
		{
			name: 'Medium',
			value: 'medium',
			description: 'Balance between speed and reasoning accuracy',
		},
		{
			name: 'High',
			value: 'high',
			description:
				'Favors more complete reasoning at the cost of more tokens generated and slower responses',
		},
	];

	if (/^gpt-5.*/i.test(modelId)) {
		return [
			{
				name: 'Minimal',
				value: 'minimal',
				description: 'Uses the fewest reasoning tokens for maximum speed',
			},
			...base,
		];
	}

	return base;
}
