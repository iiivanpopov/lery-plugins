import type { Plugin, QueryBaseConfig } from 'lery'

type ChainMap = Map<string, unknown>

export function chainedQueries(): Plugin<any> {
	const chains: ChainMap = new Map()

	return {
		onSuccess: <T>(result: T, config: QueryBaseConfig<T, any, any>) => {
			const chainId = config.meta?.chainedQueries?.chainId
			if (chainId) {
				chains.set(chainId, result)
			}
			return config
		},

		onBeforeQuery: async <T>(config: QueryBaseConfig<T, any, any>) => {
			const chainId = config.meta?.chainedQueries?.chainId

			if (chainId && !config.context) {
				config.context = {}
			}

			if (chainId) {
				const lastResult = chains.get(chainId)
				Object.assign(config.context, {
					chainId,
					chainedFrom: lastResult
				})
			}

			return config
		}
	}
}
