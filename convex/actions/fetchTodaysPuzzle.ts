import { action } from '../_generated/server'
import fetch from 'node-fetch'

const gameDataRegex = new RegExp('window.gameData = ([^<]*)<')

type PuzzleJSON = {
  today: {
    answers: string[]
    centerLetter: string
    validLetters: string[]
  }
}

export default action(async ({ runMutation }) => {
  const response = await fetch('https://www.nytimes.com/puzzles/spelling-bee')
  const html = await response.text()
  const json = html.match(gameDataRegex)![1]
  const results: PuzzleJSON = JSON.parse(json)

  await runMutation(
    'puzzles:insert',
    results.today.validLetters.map((letter) => letter.toUpperCase()),
    results.today.centerLetter.toUpperCase(),
    results.today.answers.map((answer) => answer.toUpperCase())
  )
})
