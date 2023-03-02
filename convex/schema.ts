import { defineSchema, defineTable, s } from 'convex/schema'

export default defineSchema({
  users: defineTable({
    name: s.string(),
    tokenIdentifier: s.string(),
  }).index('by_token', ['tokenIdentifier']),

  submissions: defineTable({
    word: s.string(),
    puzzleId: s.id('puzzles'),
    submitterId: s.id('users'),
  }).index('by_puzzle', ['puzzleId', 'word']),

  puzzles: defineTable({
    letters: s.array(s.string()),
    centerLetter: s.string(),
    answers: s.array(s.string()),
    dateTimestamp: s.string(),
  }).index('by_dateTimestamp', ['dateTimestamp']),
})
