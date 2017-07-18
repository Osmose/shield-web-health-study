const MESSAGES = {
  c: '',
  vi: 'Net neutrality is one of the biggest First Amendment issues of the Internet. Without it, voices could be censored.',
  sice: 'Support Net Neutrality like {domain}, so that the Internet remains healthy and free',
  simo: 'Three quarters of Americans (76%) support net neutrality, including  the vast majority of Democrats and Republicans.',
  atsi: 'Without net neutrality, {domain} could run slower in the future and be harder to access.'
}
const SILENCE_LENGTHS_HOURS = {
  r1: Infinity,
  r2: 5*24,
  r4: 3*24,
  r14: 2*24
}

const variations = []

for (let m in MESSAGES)
	for (let r in SILENCE_LENGTHS_HOURS)
		variations.push({
			name: `${r}-${m}`,
			weight: 1,
			message: m,
			repitition: r
		})

console.log(variations)

