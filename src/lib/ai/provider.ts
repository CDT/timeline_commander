/**
 * Provider-agnostic AI interface.
 *
 * ClaudeProvider  — uses @anthropic-ai/sdk
 * DeepSeekProvider — uses openai SDK pointed at api.deepseek.com
 *
 * Both satisfy the AiProvider interface; game logic never sees the difference.
 */

export interface AiProvider {
  generateNarration(prompt: string, systemPrompt: string, maxTokens?: number): Promise<string>;
  streamNarration(prompt: string, systemPrompt: string, maxTokens?: number): AsyncIterable<string>;
}

// ─── Claude ─────────────────────────────────────────────────────────────────

export class ClaudeProvider implements AiProvider {
  private model: string;

  constructor(model = "claude-sonnet-4-6") {
    this.model = model;
  }

  async generateNarration(
    prompt: string,
    systemPrompt: string,
    maxTokens = 1024
  ): Promise<string> {
    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const response = await client.messages.create({
      model: this.model,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: "user", content: prompt }],
    });
    const block = response.content[0];
    if (block.type !== "text") throw new Error("Unexpected response type from Claude");
    return block.text;
  }

  async *streamNarration(
    prompt: string,
    systemPrompt: string,
    maxTokens = 1024
  ): AsyncGenerator<string> {
    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const stream = client.messages.stream({
      model: this.model,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: "user", content: prompt }],
    });
    for await (const event of stream) {
      if (
        event.type === "content_block_delta" &&
        event.delta.type === "text_delta"
      ) {
        yield event.delta.text;
      }
    }
  }
}

// ─── DeepSeek ────────────────────────────────────────────────────────────────

export class DeepSeekProvider implements AiProvider {
  private model: string;

  constructor(model = "deepseek-chat") {
    this.model = model;
  }

  async generateNarration(
    prompt: string,
    systemPrompt: string,
    maxTokens = 1024
  ): Promise<string> {
    const { default: OpenAI } = await import("openai");
    const client = new OpenAI({
      apiKey: process.env.DEEPSEEK_API_KEY,
      baseURL: "https://api.deepseek.com",
    });
    const response = await client.chat.completions.create({
      model: this.model,
      max_tokens: maxTokens,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
    });
    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("Empty response from DeepSeek");
    return content;
  }

  async *streamNarration(
    prompt: string,
    systemPrompt: string,
    maxTokens = 1024
  ): AsyncGenerator<string> {
    const { default: OpenAI } = await import("openai");
    const client = new OpenAI({
      apiKey: process.env.DEEPSEEK_API_KEY,
      baseURL: "https://api.deepseek.com",
    });
    const stream = await client.chat.completions.create({
      model: this.model,
      max_tokens: maxTokens,
      stream: true,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
    });
    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content;
      if (text) yield text;
    }
  }
}

// ─── Factory ─────────────────────────────────────────────────────────────────

export function createProvider(
  provider: string,
  model: string
): AiProvider {
  if (provider === "claude") return new ClaudeProvider(model);
  if (provider === "deepseek") return new DeepSeekProvider(model);
  throw new Error(`Unknown AI provider: ${provider}`);
}
