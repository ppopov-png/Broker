// A skipped or cancelled dependency must never turn the required check green.
const results = JSON.parse(process.env.GATE_RESULTS ?? '{}')
const required = ['gates', 'docker-smoke']
if (process.env.EVENT_NAME === 'push') required.push('publish-image')
for (const gate of required) console.log(`${gate}: ${results[gate]?.result ?? 'missing'}`)
process.exitCode = required.every((gate) => results[gate]?.result === 'success') ? 0 : 1
