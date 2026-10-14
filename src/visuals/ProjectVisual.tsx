import { useInView } from 'motion/react'
import * as m from 'motion/react-m'
import { useRef } from 'react'
import type { VisualKind } from '../data/site'

/**
 * Small illustrated mock-ups for each project. They are drawn in SVG from the
 * theme tokens, so they follow light and dark mode. They illustrate the kind of
 * work, not real figures: the only numbers shown come from the resume.
 */
export function ProjectVisual({ kind, className = '' }: { kind: VisualKind; className?: string }) {
  const Comp = {
    pipeline: Pipeline,
    stream: Stream,
    deploy: Deploy,
    unify: Unify,
    monitor: Monitor,
    components: Components,
    sprint: Sprint,
  }[kind]
  // looping animations pause while the visual is off screen
  const ref = useRef<HTMLDivElement>(null)
  const live = useInView(ref, { margin: '120px 0px' })
  return (
    <div
      ref={ref}
      data-live={live}
      className={`relative overflow-hidden rounded-[22px] border border-line bg-wash [container-type:size] ${className}`}
    >
      {/* a 4:3 stage centred in the box, so moving parts line up with the drawing at any size */}
      <div className="visual-stage absolute left-1/2 top-1/2 aspect-[4/3] -translate-x-1/2 -translate-y-1/2">
        <svg viewBox="0 0 400 300" className="block h-full w-full" role="img" aria-label={labels[kind]}>
          <Comp />
        </svg>
        {kind === 'pipeline' && <MovingCard />}
      </div>
    </div>
  )
}

const labels: Record<VisualKind, string> = {
  pipeline: 'Illustration: a Metro2 file moving from account segments to the four credit bureaus',
  stream: 'Illustration: a Kafka topic feeding a Spring Kafka consumer and PostgreSQL',
  deploy: 'Illustration: a Jenkins pipeline releasing to AWS Fargate with a blue-green switch',
  unify: 'Illustration: data sources merged into one reporting model behind role-based APIs',
  monitor: 'Illustration: deployment and issue-detection times with metrics and logs',
  components: 'Illustration: reusable React components with a Redux store, shared across four apps',
  sprint: 'Illustration: a sprint board and a Jenkins build log',
}

const MONO = 'font-mono'
const EASE = [0.22, 1, 0.36, 1] as const

function Chip({ x, y, label, dark = false, size = 8.5 }: { x: number; y: number; label: string; dark?: boolean; size?: number }) {
  const w = label.length * size * 0.61 + 16
  return (
    <g>
      <rect x={x} y={y} width={w} height={size + 10} rx={(size + 10) / 2} className={dark ? 'fill-ink' : 'fill-surface stroke-line'} />
      <text x={x + 8} y={y + size + 3.5} fontSize={size} className={`${MONO} ${dark ? 'fill-paper' : 'fill-ink'}`}>
        {label}
      </text>
    </g>
  )
}

function chipWidth(label: string, size = 8.5) {
  return label.length * size * 0.61 + 16
}

function ChipRow({ x, y, labels, darkFirst = false, gap = 6 }: { x: number; y: number; labels: string[]; darkFirst?: boolean; gap?: number }) {
  let cx = x
  return (
    <g>
      {labels.map((l, i) => {
        const el = <Chip key={l} x={cx} y={y} label={l} dark={darkFirst && i === 0} />
        cx += chipWidth(l) + gap
        return el
      })}
    </g>
  )
}

/** A small tick in a filled circle (passed, delivered). */
function Tick({ cx, cy, r = 7, dark = true }: { cx: number; cy: number; r?: number; dark?: boolean }) {
  const s = r / 8
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} className={dark ? 'fill-ink' : 'fill-paper'} />
      <path
        d={`M${cx - 4 * s} ${cy} l${3 * s} ${3 * s} l${5 * s} ${-6 * s}`}
        className={dark ? 'stroke-paper' : 'stroke-ink'}
        strokeWidth="1.6"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  )
}

/** Arrowheads for the flowing connectors. */
function Head({ x, y, dir }: { x: number; y: number; dir: 'right' | 'down' | 'up' | 'left' }) {
  const d = {
    right: `M${x - 6} ${y - 4} l6 4 -6 4`,
    left: `M${x + 6} ${y - 4} l-6 4 6 4`,
    down: `M${x - 4} ${y - 6} l4 6 4 -6`,
    up: `M${x - 4} ${y + 6} l4 -6 4 6`,
  }[dir]
  return <path d={d} className="stroke-ink" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
}

/* ------------------------------------------------- credit bureau reporting -- */
function Pipeline() {
  const cols = [
    { x: 14, title: 'Segments', rows: ['U.S.', 'Canada', 'Small Business', 'Commercial'] },
    { x: 140, title: 'Metro2 file', rows: ['HEADER', 'BASE SEGMENT', 'TRAILER'] },
    { x: 266, title: 'Bureaus', rows: ['Equifax', 'Experian', 'TransUnion', 'LexisNexis'] },
  ]
  return (
    <g>
      {cols.map((c) => {
        const tall = c.rows.length === 3
        const step = tall ? 60 : 44
        const h = tall ? 50 : 38
        return (
          <g key={c.title}>
            <text x={c.x + 4} y={24} fontSize="10" className={`${MONO} fill-ink-soft`}>
              {c.title.toUpperCase()}
            </text>
            <rect x={c.x} y={34} width={120} height={254} rx={14} className="fill-paper stroke-line" />
            {c.rows.map((label, i) => {
              const y = 44 + i * step
              return (
                <g key={label}>
                  <rect x={c.x + 8} y={y} width={104} height={h} rx={9} className="fill-surface stroke-line" />
                  <Chip x={c.x + 16} y={y + 8} label={label} size={7.5} />
                  <rect x={c.x + 16} y={y + (tall ? 34 : 29)} width={tall ? 80 : 64} height={4} rx={2} className="fill-wash" />
                  {tall && <rect x={c.x + 16} y={y + 42} width={52} height={4} rx={2} className="fill-wash" />}
                  {c.title === 'Bureaus' && <Tick cx={c.x + 99} cy={y + 17} />}
                </g>
              )
            })}
          </g>
        )
      })}
    </g>
  )
}

/**
 * The Metro2 file travelling from the segments to the file to the bureaus. It sits on its
 * own layer above the drawing, so the GPU slides it and nothing gets redrawn.
 */
function MovingCard() {
  return (
    <div className="pipeline-card absolute left-[5.5%] top-[76%] h-[16.667%] w-[26%]" aria-hidden>
      <svg viewBox="22 228 104 50" className="block h-full w-full overflow-visible">
        <rect x={22} y={228} width={104} height={50} rx={9} className="fill-ink" />
        <rect x={30} y={236} width={68} height={17} rx={8.5} className="fill-paper" opacity="0.18" />
        <text x={38} y={248} fontSize="7.5" className={`${MONO} fill-paper`}>
          METRO2 FILE
        </text>
        <rect x={30} y={262} width={80} height={4} rx={2} className="fill-paper" opacity="0.35" />
      </svg>
    </div>
  )
}

/* -------------------------------------------------- event-driven pipelines -- */
function Stream() {
  const lanes = [
    { y: 48, done: 4, waiting: 3 },
    { y: 110, done: 3, waiting: 2 },
    { y: 172, done: 5, waiting: 2 },
  ]
  return (
    <g>
      <text x={18} y={24} fontSize="10" className={`${MONO} fill-ink-soft`}>
        KAFKA TOPIC
      </text>
      <rect x={14} y={34} width={212} height={194} rx={14} className="fill-paper stroke-line" />
      {lanes.map((l, i) => (
        <g key={l.y}>
          <rect x={24} y={l.y} width={192} height={46} rx={10} className="fill-surface stroke-line" />
          <text x={36} y={l.y + 27} fontSize="9" className={`${MONO} fill-ink-soft`}>
            P{i}
          </text>
          {Array.from({ length: l.done + l.waiting }, (_, j) => (
            <rect
              key={j}
              x={60 + j * 20}
              y={l.y + 16}
              width={14}
              height={14}
              rx={3.5}
              className={j < l.done ? 'fill-wash' : j === l.done + l.waiting - 1 ? 'fill-ink' : 'fill-ink-soft'}
              opacity={j < l.done ? 1 : j === l.done + l.waiting - 1 ? 1 : 0.55}
            />
          ))}
          {/* the committed offset: everything left of it has been processed once */}
          <line x1={57 + l.done * 20} x2={57 + l.done * 20} y1={l.y + 9} y2={l.y + 37} className="stroke-ink" strokeWidth="1.6" />
        </g>
      ))}

      <path d="M226 87 H252" className="stroke-ink dash-flow" strokeWidth="2" fill="none" />
      <Head x={252} y={87} dir="right" />
      <rect x={252} y={56} width={134} height={62} rx={14} className="fill-ink" />
      <text x={268} y={83} fontSize="11.5" className="fill-paper font-display font-semibold">
        Spring Kafka
      </text>
      <text x={268} y={99} fontSize="8.5" className={`${MONO} fill-paper`} opacity="0.7">
        consumer group
      </text>

      <path d="M319 118 V148" className="stroke-ink dash-flow" strokeWidth="2" fill="none" />
      <Head x={319} y={148} dir="down" />
      <rect x={252} y={148} width={134} height={62} rx={14} className="fill-surface stroke-line" />
      <g transform="translate(266 164)">
        <ellipse cx={9} cy={4} rx={9} ry={3.5} className="fill-wash stroke-ink-soft" />
        <path d="M0 4 v20 c0 2 4 3.5 9 3.5 s9-1.5 9-3.5 v-20" className="fill-wash stroke-ink-soft" />
        <path d="M0 14 c0 2 4 3.5 9 3.5 s9-1.5 9-3.5" className="stroke-ink-soft" fill="none" />
      </g>
      <text x={294} y={176} fontSize="11.5" className="fill-ink font-display font-semibold">
        PostgreSQL
      </text>
      <text x={294} y={192} fontSize="8.5" className={`${MONO} fill-ink-soft`}>
        on AWS RDS
      </text>

      <ChipRow x={14} y={250} labels={['Exactly-once', 'Fault-tolerant', 'Splunk', 'New Relic']} darkFirst />
    </g>
  )
}

/* -------------------------------------------------------- cloud delivery -- */
function Deploy() {
  const stages = [
    { t: 'Build', s: 'Jenkins' },
    { t: 'Quality gate', s: 'SonarQube' },
    { t: 'Provision', s: 'CloudFormation' },
    { t: 'Run', s: 'AWS Fargate' },
  ]
  return (
    <g>
      {stages.map((st, i) => {
        const x = 14 + i * 95
        const dark = i === 3
        return (
          <g key={st.t}>
            <rect x={x} y={12} width={86} height={50} rx={12} className={dark ? 'fill-ink' : 'fill-surface stroke-line'} />
            <text x={x + 10} y={33} fontSize="10.5" className={`font-display font-semibold ${dark ? 'fill-paper' : 'fill-ink'}`}>
              {st.t}
            </text>
            <text x={x + 10} y={48} fontSize="7.5" className={`${MONO} ${dark ? 'fill-paper' : 'fill-ink-soft'}`} opacity={dark ? 0.75 : 1}>
              {st.s}
            </text>
            {i === 1 && <Tick cx={x + 75} cy={24} r={6} />}
            {i < 3 && (
              <path d={`M${x + 89} 33 l3 4 -3 4`} className="stroke-ink-soft" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            )}
          </g>
        )
      })}

      {/* blue-green: traffic goes to the new (green) version; blue stays on standby */}
      <rect x={14} y={112} width={86} height={56} rx={14} className="fill-surface stroke-line" />
      <text x={28} y={137} fontSize="11" className="fill-ink font-display font-semibold">
        Traffic
      </text>
      <text x={28} y={152} fontSize="8" className={`${MONO} fill-ink-soft`}>
        requests
      </text>
      <path d="M100 132 C 126 132 124 106 150 106" className="stroke-ink-soft" strokeWidth="1.5" fill="none" strokeDasharray="2 4" />
      <path d="M100 148 C 126 148 124 174 146 174" className="stroke-ink dash-flow" strokeWidth="2" fill="none" />
      <Head x={150} y={174} dir="right" />

      {[
        { y: 80, name: 'BLUE', sub: 'previous · standby', dark: false },
        { y: 146, name: 'GREEN', sub: 'new · live', dark: true },
      ].map((env) => (
        <g key={env.name}>
          <rect x={150} y={env.y} width={236} height={56} rx={14} className={env.dark ? 'fill-ink' : 'fill-surface stroke-line'} />
          <rect x={164} y={env.y + 12} width={chipWidth(env.name, 7.5)} height={17.5} rx={8.75} className="fill-paper" opacity={env.dark ? 0.18 : 1} />
          {!env.dark && <rect x={164} y={env.y + 12} width={chipWidth(env.name, 7.5)} height={17.5} rx={8.75} className="stroke-line" fill="none" />}
          <text x={172} y={env.y + 24} fontSize="7.5" className={`${MONO} ${env.dark ? 'fill-paper' : 'fill-ink'}`}>
            {env.name}
          </text>
          <text x={164} y={env.y + 44} fontSize="8" className={`${MONO} ${env.dark ? 'fill-paper' : 'fill-ink-soft'}`} opacity={env.dark ? 0.75 : 1}>
            {env.sub}
          </text>
          {[0, 1, 2].map((k) => (
            <rect
              key={k}
              x={292 + k * 30}
              y={env.y + 14}
              width={24}
              height={28}
              rx={5}
              className={env.dark ? 'fill-paper' : 'fill-wash'}
              opacity={env.dark ? 0.22 : 1}
            />
          ))}
        </g>
      ))}

      <rect x={14} y={216} width={180} height={72} rx={14} className="fill-paper stroke-line" />
      <text x={28} y={236} fontSize="9" className={`${MONO} fill-ink-soft`}>
        CONTAINER SIZE
      </text>
      <text x={180} y={237} textAnchor="end" fontSize="15" className="fill-ink font-display font-semibold" letterSpacing="-0.5">
        −60%
      </text>
      <text x={28} y={257} fontSize="7.5" className={`${MONO} fill-ink-soft`}>
        before
      </text>
      <rect x={68} y={251} width={112} height={7} rx={3.5} className="fill-wash" />
      <text x={28} y={276} fontSize="7.5" className={`${MONO} fill-ink-soft`}>
        after
      </text>
      <rect x={68} y={270} width={112} height={7} rx={3.5} className="fill-wash" />
      <m.rect
        x={68}
        y={270}
        height={7}
        rx={3.5}
        className="fill-ink"
        initial={{ width: 112 }}
        whileInView={{ width: 45 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, delay: 0.2, ease: EASE }}
      />

      <rect x={202} y={216} width={184} height={72} rx={14} className="fill-paper stroke-line" />
      <text x={216} y={236} fontSize="9" className={`${MONO} fill-ink-soft`}>
        WIRED TO
      </text>
      <ChipRow x={216} y={244} labels={['SNS', 'S3', 'RDS']} />
      <Chip x={216} y={266} label="Step Functions" size={7.5} />
    </g>
  )
}

/* --------------------------------------------------- unified reporting -- */
function Unify() {
  const sources = ['Source A', 'Source B', 'Source C']
  return (
    <g>
      {sources.map((s, i) => {
        const y = 22 + i * 60
        return (
          <g key={s}>
            <rect x={14} y={y} width={100} height={46} rx={12} className="fill-surface stroke-line" />
            <g transform={`translate(26 ${y + 12})`}>
              <ellipse cx={8} cy={3.5} rx={8} ry={3} className="fill-wash stroke-ink-soft" />
              <path d="M0 3.5 v15 c0 1.8 3.6 3 8 3 s8-1.2 8-3 v-15" className="fill-wash stroke-ink-soft" />
            </g>
            <text x={50} y={y + 21} fontSize="10" className="fill-ink font-display font-semibold">
              {s}
            </text>
            <rect x={50} y={y + 29} width={[48, 34, 42][i]} height={4} rx={2} className="fill-wash" />
          </g>
        )
      })}
      {[45, 105, 165].map((y) => (
        <path key={y} d={`M114 ${y} C 132 ${y} 130 105 146 105`} className="stroke-ink dash-flow" strokeWidth="1.8" fill="none" />
      ))}
      <Head x={150} y={105} dir="right" />

      <rect x={150} y={52} width={110} height={106} rx={14} className="fill-ink" />
      <text x={164} y={75} fontSize="11.5" className="fill-paper font-display font-semibold">
        Spring Boot
      </text>
      <text x={164} y={89} fontSize="8" className={`${MONO} fill-paper`} opacity="0.7">
        reporting model
      </text>
      {[0, 1, 2, 3].map((r) => (
        <g key={r}>
          {[0, 1, 2].map((c) => (
            <rect
              key={c}
              x={164 + c * 28}
              y={102 + r * 12}
              width={24}
              height={7}
              rx={2}
              className="fill-paper"
              opacity={r === 0 ? 0.55 : 0.2}
            />
          ))}
        </g>
      ))}

      <path d="M260 105 H288" className="stroke-ink dash-flow" strokeWidth="2" fill="none" />
      <Head x={292} y={105} dir="right" />
      <rect x={292} y={40} width={94} height={130} rx={14} className="fill-surface stroke-line" />
      <text x={304} y={62} fontSize="11" className="fill-ink font-display font-semibold">
        REST APIs
      </text>
      <text x={304} y={76} fontSize="8" className={`${MONO} fill-ink-soft`}>
        role-based
      </text>
      <g transform="translate(362 52)">
        <rect x={0} y={7} width={14} height={11} rx={2.5} className="fill-ink" />
        <path d="M3 7 v-2 a4 4 0 0 1 8 0 v2" className="stroke-ink" strokeWidth="1.6" fill="none" />
      </g>
      {[0, 1, 2].map((r) => {
        const y = 94 + r * 24
        return (
          <g key={r}>
            <circle cx={312} cy={y} r={4} className="fill-ink-soft" opacity="0.6" />
            <path d={`M305 ${y + 12} a7 6 0 0 1 14 0`} className="fill-ink-soft" opacity="0.6" />
            <rect x={326} y={y - 2} width={30} height={5} rx={2.5} className="fill-wash" />
            <Tick cx={369} cy={y + 2} r={6} />
          </g>
        )
      })}

      <rect x={14} y={202} width={372} height={86} rx={14} className="fill-paper stroke-line" />
      <text x={28} y={222} fontSize="9" className={`${MONO} fill-ink-soft`}>
        NEAR-REAL-TIME INGESTION
      </text>
      <Chip x={28} y={234} label="Upstream events" />
      <path d="M128 243 H150" className="stroke-ink dash-flow" strokeWidth="2" fill="none" />
      <Head x={154} y={243} dir="right" />
      <Chip x={158} y={234} label="Apache Kafka" dark />
      <path d="M242 243 H264" className="stroke-ink dash-flow" strokeWidth="2" fill="none" />
      <Head x={268} y={243} dir="right" />
      <Chip x={272} y={234} label="DynamoDB" />
      <text x={28} y={274} fontSize="8.5" className={`${MONO} fill-ink-soft`}>
        scales with upstream event volume
      </text>
    </g>
  )
}

/* -------------------------------------------------- release & monitoring -- */
function Monitor() {
  const cards = [
    { x: 14, title: 'DEPLOYMENT TIME', cut: '−70%', after: 0.3 },
    { x: 203, title: 'ISSUE DETECTION', cut: '−50%', after: 0.5 },
  ]
  const line = '24,212 44,206 64,209 84,200 104,204 124,197 144,201 160,160 172,194 192,199 212,193 232,196'
  return (
    <g>
      {cards.map((c) => (
        <g key={c.title}>
          <rect x={c.x} y={12} width={183} height={92} rx={14} className="fill-surface stroke-line" />
          <text x={c.x + 14} y={33} fontSize="9" className={`${MONO} fill-ink-soft`}>
            {c.title}
          </text>
          <text x={c.x + 169} y={35} textAnchor="end" fontSize="17" className="fill-ink font-display font-semibold" letterSpacing="-0.6">
            {c.cut}
          </text>
          <text x={c.x + 14} y={62} fontSize="7.5" className={`${MONO} fill-ink-soft`}>
            before
          </text>
          <rect x={c.x + 52} y={56} width={117} height={8} rx={4} className="fill-wash" />
          <rect x={c.x + 52} y={56} width={117} height={8} rx={4} className="fill-ink-soft" opacity="0.45" />
          <text x={c.x + 14} y={84} fontSize="7.5" className={`${MONO} fill-ink-soft`}>
            after
          </text>
          <rect x={c.x + 52} y={78} width={117} height={8} rx={4} className="fill-wash" />
          <m.rect
            x={c.x + 52}
            y={78}
            height={8}
            rx={4}
            className="fill-ink"
            initial={{ width: 117 }}
            whileInView={{ width: 117 * c.after }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, delay: 0.2, ease: EASE }}
          />
        </g>
      ))}

      <rect x={14} y={114} width={230} height={142} rx={14} className="fill-surface stroke-line" />
      <text x={28} y={134} fontSize="9" className={`${MONO} fill-ink-soft`}>
        PROMETHEUS
      </text>
      <line x1={24} x2={234} y1={178} y2={178} className="stroke-ink-soft" strokeDasharray="4 4" />
      <text x={234} y={172} textAnchor="end" fontSize="7.5" className={`${MONO} fill-ink-soft`}>
        alert
      </text>
      <line x1={24} x2={234} y1={236} y2={236} className="stroke-line" />
      <m.polyline
        points={line}
        className="stroke-ink"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.6, ease: EASE }}
      />
      <circle cx={160} cy={160} r={9} className="fill-ink" opacity="0.12" />
      <circle cx={160} cy={160} r={4} className="fill-ink" />
      <text x={28} y={250} fontSize="7.5" className={`${MONO} fill-ink-soft`}>
        Spring Actuator metrics
      </text>

      <rect x={252} y={114} width={134} height={142} rx={14} className="fill-surface stroke-line" />
      <text x={266} y={134} fontSize="9" className={`${MONO} fill-ink-soft`}>
        ELK · LOGS
      </text>
      {['INFO', 'INFO', 'WARN', 'INFO', 'ERROR', 'INFO'].map((lvl, i) => {
        const y = 146 + i * 17
        const err = lvl === 'ERROR'
        return (
          <g key={i}>
            <rect x={264} y={y} width={34} height={12} rx={6} className={err ? 'fill-ink' : lvl === 'WARN' ? 'fill-chip' : 'fill-wash'} />
            <text x={281} y={y + 8.5} textAnchor="middle" fontSize="6.5" className={`${MONO} ${err ? 'fill-paper' : 'fill-ink'}`}>
              {lvl}
            </text>
            <rect x={304} y={y + 4} width={[60, 44, 52, 66, 48, 38][i]} height={4} rx={2} className={err ? 'fill-ink-soft' : 'fill-wash'} />
          </g>
        )
      })}

      <ChipRow x={14} y={268} labels={['AWS ECS', 'Jenkins', 'Spring Actuator']} darkFirst />
    </g>
  )
}

/* ---------------------------------------------------- react front ends -- */
function Components() {
  return (
    <g>
      {/* the browser window with its components outlined */}
      <rect x={14} y={12} width={230} height={190} rx={14} className="fill-surface stroke-line" />
      {[28, 40, 52].map((cx) => (
        <circle key={cx} cx={cx} cy={25} r={3.5} className="fill-wash" />
      ))}
      <rect x={66} y={19} width={164} height={12} rx={6} className="fill-wash" />
      <line x1={14} x2={244} y1={38} y2={38} className="stroke-line" />

      <rect x={24} y={46} width={210} height={20} rx={6} className="fill-wash" />
      <rect x={21} y={43} width={216} height={26} rx={8} className="stroke-ink-soft" strokeDasharray="3 3" fill="none" />

      <rect x={21} y={77} width={104} height={117} rx={8} className="stroke-ink-soft" strokeDasharray="3 3" fill="none" />
      {[90, 110, 130].map((y) => (
        <g key={y}>
          <rect x={30} y={y} width={40} height={4} rx={2} className="fill-ink-soft" opacity="0.5" />
          <rect x={30} y={y + 7} width={86} height={9} rx={3} className="fill-wash" />
        </g>
      ))}
      <rect x={30} y={164} width={50} height={18} rx={9} className="fill-ink" />

      <rect x={133} y={77} width={104} height={117} rx={8} className="stroke-ink-soft" strokeDasharray="3 3" fill="none" />
      <rect x={140} y={86} width={90} height={12} rx={3} className="fill-ink" opacity="0.85" />
      {[104, 119, 134, 149, 164, 179].map((y, i) => (
        <rect key={y} x={140} y={y} width={90} height={9} rx={3} className={i === 2 ? 'fill-ink-soft' : 'fill-wash'} opacity={i === 2 ? 0.45 : 1} />
      ))}

      {['<Nav />', '<Form />', '<Table />'].map((t, i) => {
        const x = [176, 64, 176][i]
        const y = [36, 70, 70][i]
        return (
          <g key={t}>
            <rect x={x} y={y} width={chipWidth(t, 6.5) - 4} height={14} rx={7} className="fill-ink" />
            <text x={x + 6} y={y + 9.8} fontSize="6.5" className={`${MONO} fill-paper`}>
              {t}
            </text>
          </g>
        )
      })}

      {/* Redux store and the Spring MVC backend */}
      <rect x={262} y={12} width={124} height={92} rx={14} className="fill-ink" />
      <text x={276} y={35} fontSize="11.5" className="fill-paper font-display font-semibold">
        Redux store
      </text>
      {['state', 'actions', 'reducers'].map((t, i) => (
        <g key={t}>
          <circle cx={280} cy={54 + i * 15} r={2.5} className="fill-paper" opacity="0.6" />
          <text x={288} y={57 + i * 15} fontSize="8" className={`${MONO} fill-paper`} opacity="0.75">
            {t}
          </text>
        </g>
      ))}
      <path d="M244 58 H258" className="stroke-ink dash-flow" strokeWidth="2" fill="none" />
      <Head x={262} y={58} dir="right" />

      <rect x={262} y={124} width={124} height={78} rx={14} className="fill-surface stroke-line" />
      <text x={276} y={147} fontSize="11.5" className="fill-ink font-display font-semibold">
        Spring MVC
      </text>
      <text x={276} y={162} fontSize="8" className={`${MONO} fill-ink-soft`}>
        RESTful APIs
      </text>
      <text x={276} y={186} fontSize="8" className={`${MONO} fill-ink-soft`}>
        async fetch
      </text>
      <path d="M324 124 V108" className="stroke-ink dash-flow" strokeWidth="2" fill="none" />
      <Head x={324} y={106} dir="up" />

      {/* the same components, reused in four apps */}
      {[0, 1, 2, 3].map((i) => {
        const x = 14 + i * 95
        return (
          <g key={i}>
            <rect x={x} y={216} width={86} height={72} rx={12} className={i === 0 ? 'fill-surface stroke-ink-soft' : 'fill-surface stroke-line'} />
            <rect x={x + 9} y={226} width={68} height={6} rx={3} className="fill-wash" />
            <rect x={x + 9} y={238} width={30} height={30} rx={4} className="fill-wash" />
            <rect x={x + 45} y={238} width={32} height={6} rx={2} className="fill-ink" opacity="0.85" />
            <rect x={x + 45} y={248} width={32} height={4} rx={2} className="fill-wash" />
            <rect x={x + 45} y={256} width={32} height={4} rx={2} className="fill-wash" />
            <rect x={x + 45} y={264} width={32} height={4} rx={2} className="fill-wash" />
            <text x={x + 9} y={281} fontSize="7" className={`${MONO} fill-ink-soft`}>
              APP {i + 1}
            </text>
          </g>
        )
      })}
    </g>
  )
}

/* ------------------------------------------------------ the internship -- */
function Sprint() {
  const cols = [
    { title: 'TO DO', cards: 2 },
    { title: 'DOING', cards: 2 },
    { title: 'DONE', cards: 3 },
  ]
  const log = [
    { t: 'build failed', s: 'fail' },
    { t: 'read Jenkins logs', s: 'step' },
    { t: 'fix Bash script', s: 'step' },
    { t: 'fix Groovy stage', s: 'step' },
    { t: 'build passed', s: 'pass' },
    { t: 'build passed', s: 'pass' },
  ]
  return (
    <g>
      <rect x={14} y={12} width={232} height={232} rx={14} className="fill-surface stroke-line" />
      <text x={28} y={34} fontSize="9" className={`${MONO} fill-ink-soft`}>
        SPRINT BOARD
      </text>
      {/* the four developers */}
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <circle cx={186 + i * 14} cy={30} r={8} className="fill-surface" />
          <circle cx={186 + i * 14} cy={30} r={7} className={['fill-ink', 'fill-ink-soft', 'fill-chip', 'fill-line'][i]} />
        </g>
      ))}
      {cols.map((c, ci) => {
        const x = 24 + ci * 74
        return (
          <g key={c.title}>
            <rect x={x} y={46} width={66} height={188} rx={10} className="fill-paper stroke-line" />
            <text x={x + 8} y={62} fontSize="7.5" className={`${MONO} fill-ink-soft`}>
              {c.title}
            </text>
            {Array.from({ length: c.cards }, (_, k) => {
              const y = 72 + k * 52
              const done = ci === 2
              const active = ci === 1 && k === 0
              return (
                <g key={k}>
                  <rect x={x + 6} y={y} width={54} height={44} rx={7} className={active ? 'fill-ink' : 'fill-surface stroke-line'} />
                  <rect x={x + 12} y={y + 9} width={30} height={4} rx={2} className={active ? 'fill-paper' : 'fill-ink-soft'} opacity={active ? 0.6 : 0.5} />
                  <rect x={x + 12} y={y + 17} width={38} height={4} rx={2} className={active ? 'fill-paper' : 'fill-wash'} opacity={active ? 0.3 : 1} />
                  <rect x={x + 12} y={y + 25} width={22} height={4} rx={2} className={active ? 'fill-paper' : 'fill-wash'} opacity={active ? 0.3 : 1} />
                  {done && <Tick cx={x + 50} cy={y + 34} r={5} />}
                </g>
              )
            })}
          </g>
        )
      })}

      <rect x={254} y={12} width={132} height={232} rx={14} className="fill-ink" />
      <text x={268} y={34} fontSize="9" className={`${MONO} fill-paper`} opacity="0.6">
        JENKINS
      </text>
      {log.map((row, i) => {
        const y = 58 + i * 25
        return (
          <g key={i}>
            {row.s === 'fail' && (
              <path d={`M266 ${y - 7} l7 7 M273 ${y - 7} l-7 7`} className="stroke-paper" strokeWidth="1.6" strokeLinecap="round" opacity="0.6" />
            )}
            {row.s === 'step' && <path d={`M267 ${y - 7} l4 3.5 -4 3.5`} className="stroke-paper" strokeWidth="1.4" fill="none" opacity="0.5" />}
            {row.s === 'pass' && <Tick cx={269.5} cy={y - 3.5} r={5.5} dark={false} />}
            <text x={282} y={y} fontSize="8" className={`${MONO} fill-paper`} opacity={row.s === 'step' ? 0.65 : 0.95}>
              {row.t}
            </text>
          </g>
        )
      })}
      <text x={268} y={220} fontSize="7.5" className={`${MONO} fill-paper`} opacity="0.6">
        stability
      </text>
      <text x={372} y={220} textAnchor="end" fontSize="11" className="fill-paper font-display font-semibold">
        +40%
      </text>
      <rect x={268} y={227} width={104} height={5} rx={2.5} className="fill-paper" opacity="0.2" />
      <m.rect
        x={268}
        y={227}
        height={5}
        rx={2.5}
        className="fill-paper"
        initial={{ width: 74 }}
        whileInView={{ width: 104 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, delay: 0.2, ease: EASE }}
      />

      <ChipRow x={14} y={262} labels={['15+ MERN projects', 'Agile', 'JIRA', 'Bash', 'Groovy']} darkFirst />
    </g>
  )
}
