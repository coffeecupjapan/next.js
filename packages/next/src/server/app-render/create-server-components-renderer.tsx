import type { RenderOpts } from './types'
import type { AppPageModule } from '../future/route-modules/app-page/module'
import type { createErrorHandler } from './create-error-handler'

/**
 * Create a component that renders the Flight stream.
 * This is only used for renderToHTML, the Flight response does not need additional wrappers.
 */
export function createReactServerRenderer(
  children: React.ReactNode,
  ComponentMod: AppPageModule,
  clientReferenceManifest: NonNullable<RenderOpts['clientReferenceManifest']>,
  onError: ReturnType<typeof createErrorHandler>,
  onPostpone: (reason: unknown) => void,
  isNotFound: boolean
): () => ReadableStream<Uint8Array> {
  let flightStream: ReadableStream<Uint8Array>
  return function renderToReactServerStream() {
    if (flightStream) {
      return flightStream
    } else {
      // remove not-found component from bundle if page is not not-found
      if (!isNotFound) {
        ComponentMod.tree.forEach((treeElement) => {
          if (typeof treeElement !== 'object') return
          Object.keys(treeElement).forEach((treeKey) => {
            // @ts-ignore
            if (treeKey === 'not-found') delete treeElement['not-found']
          })
        })
      }
      flightStream = ComponentMod.renderToReadableStream(
        children,
        clientReferenceManifest.clientModules,
        {
          onError,
          onPostpone,
        }
      )
      return flightStream
    }
  }
}
