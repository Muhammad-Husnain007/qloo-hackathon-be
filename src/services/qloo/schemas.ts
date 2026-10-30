import { z } from 'zod'

// These response envelopes and entity/tag fields follow Qloo's public Insights
// and Tags API documentation. passthrough keeps forward-compatible metadata.
export const qlooTagsResponseSchema = z.object({
  success: z.boolean().optional(),
  results: z.object({
    tags: z.array(z.object({
      tag_id: z.string().min(1),
      name: z.string().min(1),
      types: z.array(z.string()).optional(),
    }).passthrough()),
  }).passthrough(),
}).passthrough()

export const qlooInsightsResponseSchema = z.object({
  success: z.boolean().optional(),
  results: z.object({
    entities: z.array(z.object({
      entity_id: z.string().min(1),
      name: z.string().min(1),
      type: z.string().optional(),
      subtype: z.string().optional(),
      properties: z.object({
        image: z.object({ url: z.string().url() }).passthrough().optional(),
      }).passthrough().optional(),
      tags: z.array(z.object({ id: z.string(), name: z.string() }).passthrough()).optional(),
      query: z.record(z.unknown()).optional(),
    }).passthrough()),
  }).passthrough(),
}).passthrough()

export type QlooTag = z.infer<typeof qlooTagsResponseSchema>['results']['tags'][number]
export type QlooEntity = z.infer<typeof qlooInsightsResponseSchema>['results']['entities'][number]
