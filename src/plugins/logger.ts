import type { Plugin } from 'lery'

export const logger: Plugin<Record<string, unknown>> = {
	onInit: lery => {
		console.log('Lery initialized', lery)
	},
	onBeforeQuery: async config => {
		console.log('Before query', config)
		return config
	},
	onSuccess: (data, config) => {
		console.log('Query success', data, config)
	},
	onError: (error, config) => {
		console.error('Query error', error, config)
	},
	onFinish: state => {
		console.log('Query finished', state)
	}
}
