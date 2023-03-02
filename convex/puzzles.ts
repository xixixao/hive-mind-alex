import { maybeCreateCurrentUser } from './users'
import { Id } from './_generated/dataModel'
import { DatabaseReader, mutation, query } from './_generated/server'

export const setup = mutation(async (ctx) => {
  const { db, scheduler } = ctx
  await maybeCreateCurrentUser(ctx)

  if ((await getTodaysPuzzle(db)) === null) {
    scheduler.runAfter(0, 'actions/fetchTodaysPuzzle')
  }
})

function todayTimestamp() {
  return new Date().toLocaleString('en-US', {
    timeZone: 'America/Los_Angeles',
    dateStyle: 'short',
  })
}

async function getTodaysPuzzle(db: DatabaseReader) {
  return await db
    .query('puzzles')
    .withIndex('by_dateTimestamp', (q) =>
      q.eq('dateTimestamp', todayTimestamp())
    )
    .first()
}

export const insert = mutation(
  async (
    { db },
    letters: string[],
    centerLetter: string,
    answers: string[]
  ) => {
    await db.insert('puzzles', {
      letters,
      centerLetter,
      answers,
      dateTimestamp: todayTimestamp(),
    })
  }
)

export const get = query(async ({ db }) => {
  return getTodaysPuzzle(db)
})
