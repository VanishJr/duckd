/**
 * LLM providers.
 *
 * `core` never imports a vendor SDK. Everything that needs a model goes through
 * this interface, which is what makes the engine testable without a network and
 * what keeps "which model runs the duck" a deployment decision rather than an
 * architectural one.
 */

export interface ProviderMessage {
  readonly role: 'system' | 'user' | 'assistant'
  readonly content: string
}

export interface CompletionRequest {
  readonly messages: readonly ProviderMessage[]
  readonly maxOutputTokens?: number
  readonly temperature?: number
  readonly signal?: AbortSignal
}

export interface CompletionResult {
  readonly text: string
  readonly inputTokens?: number
  readonly outputTokens?: number
}

export interface LlmProvider {
  readonly id: string
  complete(request: CompletionRequest): Promise<CompletionResult>
}

/** Deterministic provider for tests and for eval fixtures. */
export class ScriptedProvider implements LlmProvider {
  readonly id = 'scripted'
  #next = 0

  constructor(private readonly replies: readonly string[]) {}

  async complete(_request: CompletionRequest): Promise<CompletionResult> {
    const text = this.replies[this.#next++]
    if (text === undefined) throw new Error('ScriptedProvider: ran out of scripted replies')
    return { text }
  }
}

// TODO(providers): AnthropicProvider, OpenAIProvider, and a host-delegated provider
// for the case where the surrounding agent runs the model itself (see ADR on MCP sampling).
