import { getCurrentUser } from './users'
import { Id } from './_generated/dataModel'
import { mutation, query } from './_generated/server'

export const getStatus = query(async ({ db }, puzzleId: Id<'puzzles'>) => {
  const submissions = await db
    .query('submissions')
    .withIndex('by_puzzle', (q) => q.eq('puzzleId', puzzleId))
    .collect()

  let totalScore = 0
  const scoreById = new Map<string, number>()

  for (const submission of submissions) {
    const submitterId = submission.submitterId.toString()
    const points = score(submission.word)
    totalScore += points
    if (scoreById.has(submitterId)) {
      scoreById.set(submitterId, scoreById.get(submitterId)! + points)
    } else {
      scoreById.set(submitterId, points)
    }
  }

  console.log('XXX submittermap', scoreById)

  const pointsByName = await Promise.all(
    Array.from(scoreById.entries()).map(async ([submitterId, points]) => {
      const submitter = (await db.get(new Id('users', submitterId)))!
      return {
        name: submitter.name,
        points,
        id: submitterId,
      }
    })
  )
  pointsByName.sort((entry1, entry2) => {
    return entry2.points - entry1.points
  })

  const words = submissions.map((submission) => submission.word)
  words.sort()

  return {
    pointsByName,
    totalScore,
    words,
  }
})

function score(word: string) {
  if (word.length === 4) {
    return 1
  }
  const numLetters = new Set(word).size
  if (numLetters === 7) {
    return word.length + 7
  }
  return word.length
}

export type SubmissionResponse =
  | {
      result: 'correct'
    }
  | {
      result: 'incorrect'
      reason:
        | 'too-short'
        | 'invalid-letter'
        | 'missing-center-letter'
        | 'not-a-word'
        | 'already-submitted'
    }

export const submit = mutation(
  async (
    ctx,
    puzzleId: Id<'puzzles'>,
    word: string
  ): Promise<SubmissionResponse> => {
    const { db } = ctx
    const puzzle = (await db.get(puzzleId))!
    const upperWord = word.toUpperCase()
    if (!upperWord.includes(puzzle.centerLetter)) {
      return {
        result: 'incorrect',
        reason: 'missing-center-letter',
      }
    }

    for (const letter of upperWord) {
      if (!puzzle.letters.includes(letter)) {
        return {
          result: 'incorrect',
          reason: 'invalid-letter',
        }
      }
    }

    if (upperWord.length < 4) {
      return {
        result: 'incorrect',
        reason: 'too-short',
      }
    }

    if (!puzzle.answers.includes(upperWord)) {
      return {
        result: 'incorrect',
        reason: 'not-a-word',
      }
    }

    let prevSubmission = await db
      .query('submissions')
      .withIndex('by_puzzle', (q) =>
        q.eq('puzzleId', puzzleId).eq('word', upperWord)
      )
      .first()

    if (prevSubmission !== null) {
      return {
        result: 'incorrect',
        reason: 'already-submitted',
      }
    }

    const user = await getCurrentUser(ctx)

    db.insert('submissions', {
      word: upperWord,
      puzzleId,
      submitterId: user!._id,
    })

    return {
      result: 'correct',
    }
  }
)
