import {
	type Lery,
	type Plugin,
	type QueryBaseConfig,
	type QueryState,
	serializeKey
} from 'lery'

type ChainMap = Map<number, unknown>

export function chainedQueries(): Plugin<any> {
	let leryInstance: Lery<any>
	const chains: ChainMap = new Map()

	return {
		onInit(instance) {
			leryInstance = instance
		},
		onBeforeQuery: async <T>(
			config: QueryBaseConfig<T, any, any>
		): Promise<QueryBaseConfig<T, any, any>> => {
			const meta = config.meta?.chainedQueries
			const dependsOn = meta?.query
			const chainId = meta?.chainId

			if (dependsOn) {
				await waitForQueryToComplete(leryInstance, dependsOn)
			}

			if (chainId) {
				const key = serializeKey(chainId)
				const lastResult = chains.get(key)

				const enhancedContext = {
					...(config.context || {}),
					chainId,
					chainedFrom: lastResult
				}

				const originalQueryFn = config.queryFn
				config.queryFn = (params: any) => {
					return originalQueryFn({
						...params,
						context: enhancedContext
					})
				}
			}

			return config
		},

		onSuccess: <T>(result: T, config: QueryBaseConfig<T, any, any>) => {
			const chainId = config.meta?.chainedQueries?.chainId
			if (chainId) {
				const key = serializeKey(chainId)
				chains.set(key, result)
			}
		}
	}
}

async function waitForQueryToComplete(
	lery: Lery<any>,
	key: [string, ...unknown[]]
): Promise<void> {
	const entry = lery['getEntry'](key)
	if (entry.state.isSuccess || entry.state.isError) return

	return new Promise<void>(resolve => {
		const unsubscribe = entry.subscribe((state: QueryState) => {
			if (state.isSuccess || state.isError) {
				unsubscribe()
				resolve()
			}
		})
	})
}
