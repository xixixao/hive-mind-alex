import { useAction, useMutation, useQuery } from '../convex/_generated/react'
import { useState, useEffect } from 'react'
import { Id, Document } from '../convex/_generated/dataModel'
import { SubmissionResponse } from '../convex/submissions'

export default function App() {
  const setup = useMutation('puzzles:setup')
  const puzzle = useQuery('puzzles:get')

  useEffect(() => {
    setup()
  }, [setup])

  if (puzzle === undefined || puzzle === null) {
    return null
  }
  return <Puzzle puzzle={puzzle} />
}

function Puzzle({ puzzle }: { puzzle: Document<'puzzles'> }) {
  let otherLetters = puzzle.letters.filter(
    (letter) => letter !== puzzle.centerLetter
  )
  return (
    <div>
      The puzzle: <b>{puzzle.centerLetter}</b> {otherLetters.join(' ')}
      <SubmissionManager puzzleId={puzzle._id} />
      <Answers puzzleId={puzzle._id} />
    </div>
  )
}

function SubmissionManager({ puzzleId }: { puzzleId: Id<'puzzles'> }) {
  const submit = useMutation('submissions:submit')
  const [submission, setSubmission] = useState('')
  const [submissionResponse, setSubmissionResponse] =
    useState<SubmissionResponse>()

  return (
    <div>
      {submissionResponse === undefined ? (
        <br />
      ) : (
        <Response submissionResponse={submissionResponse} />
      )}
      <form>
        <input
          value={submission}
          onChange={(event) => {
            setSubmission(event.target.value)
          }}
        ></input>
        <button
          onClick={async (event) => {
            event.preventDefault()
            setSubmission('')
            setSubmissionResponse(undefined)
            setSubmissionResponse(await submit(puzzleId, submission))
          }}
        >
          Submit
        </button>
      </form>
    </div>
  )
}

function Response({
  submissionResponse,
}: {
  submissionResponse: SubmissionResponse
}) {
  const [fadeOut, setFadeOut] = useState('')
  useEffect(() => {
    const timeout = setTimeout(() => {
      setFadeOut('fade-out')
    }, 500)
    return () => {
      clearTimeout(timeout)
    }
  })

  if (submissionResponse.result == 'correct') {
    return <div className={'correct-response ' + fadeOut}>Correct!</div>
  } else {
    let text = null
    switch (submissionResponse.reason) {
      case 'already-submitted':
        text = 'Already submitted'
        break
      case 'invalid-letter':
        text = 'Bad letter'
        break
      case 'missing-center-letter':
        text = 'Missing center letter'
        break
      case 'not-a-word':
        text = 'Not a word'
        break
      case 'too-short':
        text = 'Too short'
        break
      default:
        const _: never = submissionResponse.reason
    }
    return (
      <div className={'incorrect-response ' + fadeOut}>Inccorect: {text}</div>
    )
  }
}

function Answers({ puzzleId }: { puzzleId: Id<'puzzles'> }) {
  const submissions = useQuery('submissions:getStatus', puzzleId)

  if (submissions === undefined) {
    return null
  }

  const { words, pointsByName, totalScore } = submissions
  console.log('XXX', pointsByName)
  return (
    <div className="answers">
      <div>
        <b>Total Score: {totalScore}</b>
      </div>
      <br />

      {pointsByName.map(({ name, id, points }) => (
        <div key={id.toString()}>
          {name}: {points} points
        </div>
      ))}
      <br />
      {words.map((word) => (
        <div key={word}>{word}</div>
      ))}
    </div>
  )
}
