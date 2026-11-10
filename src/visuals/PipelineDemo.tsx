import { useEffect, useReducer, type CSSProperties } from 'react'

/**
 * A pipeline to play with: a small working model of a Kafka topic, a consumer group and a database, in the
 * page. Send events and watch them queue in their partitions and get stored; stop a consumer and watch the
 * group hand its partitions to the other one, which redelivers the event that was in flight, and the
 * database skip the copy. It models how such a pipeline behaves; it is not the production system.
 *
 * The model: an event's account decides its partition (so one account's events stay in order); a partition
 * belongs to one consumer of the group at a time; a consumer stores an event, then confirms it to Kafka
 * (commits the offset); an event stored but not yet confirmed when its consumer stops is delivered again,
 * and the store, which knows each event by its id, keeps one copy.
 */

const ACCOUNTS = ['A', 'B', 'C', 'D', 'E', 'F'] as const
/** which partition each account's events go to (a key always hashes to the same one) */
const PARTITION_OF: Record<string, number> = { A: 0, B: 1, C: 2, D: 0, E: 1, F: 2 }
const PARTITIONS = 3
const SHOWN = 10 // events drawn per partition (the newest)
const TICK = 100 // ms
const PROCESS = 500
const CONFIRM = 250
const REBALANCE = 900

type Ev = { id: number; key: string }
type Work = { part: number; stored: boolean; left: number }
type State = {
  parts: { log: Ev[]; done: number; base: number }[] // done: how many of `log` are confirmed; base: offset of log[0]
  consumers: { alive: boolean; work: Work | null }[]
  owner: number[] // partition -> consumer (-1: nobody)
  rebalance: number // ms until the group has settled again (0: settled)
  stored: Set<number>
  skipped: number
  sent: number
  seed: number
  note: string
}
type Action = { type: 'send'; count: number } | { type: 'toggle'; consumer: number } | { type: 'tick' } | { type: 'reset' }

/** partitions shared out among the consumers that are up, in turn */
function assign(consumers: State['consumers']) {
  const up = consumers.map((c, i) => (c.alive ? i : -1)).filter((i) => i >= 0)
  return Array.from({ length: PARTITIONS }, (_, p) => (up.length ? up[p % up.length] : -1))
}

function start(): State {
  const consumers = [
    { alive: true, work: null },
    { alive: true, work: null },
  ]
  // a few events already through, so the picture isn't empty
  const seeded: Ev[] = ['A', 'B', 'C', 'D', 'E', 'A', 'F', 'B'].map((key, id) => ({ id, key }))
  const parts = Array.from({ length: PARTITIONS }, (_, p) => {
    const log = seeded.filter((e) => PARTITION_OF[e.key] === p)
    return { log, done: log.length, base: 0 }
  })
  return { parts, consumers, owner: assign(consumers), rebalance: 0, stored: new Set(seeded.map((e) => e.id)), skipped: 0, sent: seeded.length, seed: 7, note: 'Two consumers share three partitions.' }
}

function reduce(s: State, a: Action): State {
  if (a.type === 'reset') return start()
  if (a.type === 'send') {
    const parts = s.parts.map((p) => ({ ...p, log: [...p.log] }))
    let { seed, sent } = s
    for (let i = 0; i < a.count; i++) {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff
      const key = ACCOUNTS[(seed >> 8) % ACCOUNTS.length]
      parts[PARTITION_OF[key]].log.push({ id: sent++, key })
    }
    return { ...s, parts, seed, sent, note: a.count === 1 ? 'One event sent. Its account picks the partition.' : `${a.count} events sent. An account's events always go to the same partition, so they stay in order.` }
  }
  if (a.type === 'toggle') {
    const was = s.consumers[a.consumer]
    const stored = new Set(s.stored)
    let note: string
    if (was.alive) {
      // stopped in the middle of an event: it had stored the row but not yet confirmed it to Kafka
      if (was.work) {
        const part = s.parts[was.work.part]
        stored.add(part.log[part.done].id)
        note = `Consumer ${a.consumer + 1} stopped after storing an event, before confirming it. Its partitions move to the other consumer, which gets that event again.`
      } else note = `Consumer ${a.consumer + 1} stopped. Its partitions move to the other consumer.`
    } else note = `Consumer ${a.consumer + 1} is back. The group shares the partitions out again.`
    const consumers = s.consumers.map((c, i) => (i === a.consumer ? { alive: !c.alive, work: null } : { ...c, work: null }))
    if (!consumers.some((c) => c.alive)) note = 'No consumer is up. Events wait in their partitions; none is lost.'
    return { ...s, consumers, stored, rebalance: REBALANCE, note }
  }
  // tick
  if (s.rebalance > 0) {
    const rebalance = s.rebalance - TICK
    return rebalance > 0 ? { ...s, rebalance } : { ...s, rebalance: 0, owner: assign(s.consumers) }
  }
  const parts = s.parts.map((p) => ({ ...p }))
  const stored = new Set(s.stored)
  let { skipped, note } = s
  const consumers = s.consumers.map((c, i) => {
    if (!c.alive) return c
    let work = c.work ? { ...c.work, left: c.work.left - TICK } : null
    if (work && work.left <= 0) {
      const part = parts[work.part]
      if (!work.stored) {
        const { id } = part.log[part.done]
        if (stored.has(id)) {
          skipped++
          note = 'The redelivered event was already stored, so the database kept one copy and skipped this one.'
        } else stored.add(id)
        work = { ...work, stored: true, left: CONFIRM }
      } else {
        part.done++
        // keep only what is drawn
        if (part.done > SHOWN * 2) {
          part.log = part.log.slice(SHOWN)
          part.done -= SHOWN
          part.base += SHOWN
        }
        work = null
      }
    }
    if (!work) {
      // next: the owned partition with the most waiting
      let best = -1
      for (let p = 0; p < PARTITIONS; p++) {
        if (s.owner[p] !== i) continue
        const waiting = parts[p].log.length - parts[p].done
        if (waiting > 0 && (best < 0 || waiting > parts[best].log.length - parts[best].done)) best = p
      }
      if (best >= 0) work = { part: best, stored: false, left: PROCESS }
    }
    return { ...c, work }
  })
  return { ...s, parts, consumers, stored, skipped, note }
}

const waitingIn = (s: State) => s.parts.reduce((n, p) => n + p.log.length - p.done, 0)
const busy = (s: State) => s.rebalance > 0 || (s.consumers.some((c) => c.alive) && (waitingIn(s) > 0 || s.consumers.some((c) => c.work)))

export function PipelineDemo() {
  const [s, dispatch] = useReducer(reduce, undefined, start)
  const running = busy(s)
  // the clock runs only while something is moving
  useEffect(() => {
    if (!running) return
    const t = setInterval(() => dispatch({ type: 'tick' }), TICK)
    return () => clearInterval(t)
  }, [running])

  const waiting = waitingIn(s)
  return (
    <div className="pd">
      <div className="pd-controls">
        <button type="button" className="btn-solid btn-key btn-key--primary" onClick={() => dispatch({ type: 'send', count: 1 })}>
          Send an event
        </button>
        <button type="button" className="lift btn-fill btn-key" onClick={() => dispatch({ type: 'send', count: 12 })}>
          Send 12
        </button>
        <button type="button" className="lift btn-fill btn-key" onClick={() => dispatch({ type: 'toggle', consumer: 1 })} aria-pressed={!s.consumers[1].alive}>
          {s.consumers[1].alive ? 'Stop consumer 2' : 'Start consumer 2'}
        </button>
        <button type="button" className="lift btn-fill btn-key" onClick={() => dispatch({ type: 'reset' })}>
          Reset
        </button>
      </div>

      <div className="pd-stage">
        <section className="pd-col" aria-label="Kafka topic">
          <h3 className="eyebrow">Kafka topic · 3 partitions</h3>
          <ul className="pd-parts">
            {s.parts.map((part, p) => {
              const from = Math.max(0, part.log.length - SHOWN)
              const owner = s.owner[p]
              const working = s.rebalance === 0 && s.consumers.some((c) => c.alive && c.work?.part === p)
              return (
                <li key={p} className="pd-part">
                  <span className="pd-part-name">P{p}</span>
                  <span className="pd-log" aria-hidden>
                    {part.log.slice(from).map((e, j) => {
                      const i = from + j
                      const state = i < part.done ? 'done' : i === part.done && working ? 'now' : 'wait'
                      return (
                        <span key={e.id} className="pd-ev" data-state={state}>
                          {e.key}
                        </span>
                      )
                    })}
                  </span>
                  <span className="pd-part-meta">
                    {part.log.length - part.done} waiting · {s.rebalance > 0 ? 'moving' : owner < 0 ? 'no consumer' : `consumer ${owner + 1}`}
                  </span>
                </li>
              )
            })}
          </ul>
          <p className="pd-key">
            <span className="pd-ev" data-state="wait" aria-hidden /> waiting <span className="pd-ev" data-state="now" aria-hidden /> being processed{' '}
            <span className="pd-ev" data-state="done" aria-hidden /> stored and confirmed. The letter is the account.
          </p>
        </section>

        <section className="pd-col" aria-label="Consumer group and database">
          <h3 className="eyebrow">Consumer group</h3>
          <ul className="pd-consumers">
            {s.consumers.map((c, i) => {
              const owned = s.owner.map((o, p) => (o === i ? `P${p}` : '')).filter(Boolean)
              const part = c.work ? s.parts[c.work.part] : null
              const ev = part ? part.log[part.done] : null
              return (
                <li key={i} className="pd-consumer" data-up={c.alive}>
                  <span className="pd-consumer-name">
                    <span className={c.alive ? 'live-dot' : 'pd-off-dot'} aria-hidden /> Consumer {i + 1}
                  </span>
                  <span className="pd-consumer-state">
                    {!c.alive ? 'Stopped' : s.rebalance > 0 ? 'Rebalancing…' : ev ? `${c.work!.stored ? 'Confirming' : 'Storing'} account ${ev.key}, event ${ev.id}` : 'Idle'}
                  </span>
                  <span className="pd-consumer-parts">{c.alive && s.rebalance === 0 ? (owned.length ? `Reads ${owned.join(', ')}` : 'No partitions') : ' '}</span>
                </li>
              )
            })}
          </ul>
          <h3 className="eyebrow mt-5">Database</h3>
          <dl className="pd-stats">
            <div>
              <dt>Sent</dt>
              <dd className="tabular">{s.sent}</dd>
            </div>
            <div>
              <dt>Stored</dt>
              <dd className="tabular">{s.stored.size}</dd>
            </div>
            <div>
              <dt>Waiting</dt>
              <dd className="tabular">{waiting}</dd>
            </div>
            <div>
              <dt>Copies skipped</dt>
              <dd className="tabular" style={s.skipped ? ({ color: 'var(--accent-text)' } as CSSProperties) : undefined}>
                {s.skipped}
              </dd>
            </div>
          </dl>
        </section>
      </div>

      <p className="pd-note" role="status">
        {s.note}
      </p>
    </div>
  )
}
