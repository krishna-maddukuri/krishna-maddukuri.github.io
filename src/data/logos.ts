/* ==========================================================================
   Logos: one picture per element of the periodic table, plus the marks used elsewhere.
   The files live in /public/logos (built by scripts outside the repo from the SVG Logos,
   devicon, Simple Icons and AWS Architecture Icons sets; the concept skills have glyphs drawn
   for this site). `color` is the brand's colour: it tints the plate behind the picture and
   rings the active tile. `fit` lets a wide wordmark take more of the plate.
   ========================================================================== */

/**
 * `plate` fills the plate with that colour instead of the light brand tint (for marks drawn for a dark
 * ground); `wide` makes the plate that many times wider than it is tall (for a wordmark that is too
 * small to read on a square).
 */
export type Logo = { file: string; color: string; fit?: number; plate?: string; wide?: number }

export const skillLogos: Record<string, Logo> = {
  Jv: { file: 'logos/skills/java.svg', color: '#e76f00' },
  Py: { file: 'logos/skills/python.svg', color: '#3776ab' },
  Ts: { file: 'logos/skills/typescript.svg', color: '#3178c6' },
  Js: { file: 'logos/skills/javascript.svg', color: '#e0c500' },
  Sq: { file: 'logos/skills/sql.svg', color: '#0e8a8a' },
  Cp: { file: 'logos/skills/cplusplus.svg', color: '#00599c' },
  Sb: { file: 'logos/skills/spring.svg', color: '#6db33f' },
  Bt: { file: 'logos/skills/spring.svg', color: '#6db33f' },
  Sk: { file: 'logos/skills/spring.svg', color: '#6db33f' },
  Mv: { file: 'logos/skills/spring.svg', color: '#6db33f' },
  Hb: { file: 'logos/skills/hibernate.svg', color: '#a9956a' },
  Ms: { file: 'logos/skills/microservices.svg', color: '#6e56cf' },
  Ra: { file: 'logos/skills/rest.svg', color: '#0284c7' },
  Oa: { file: 'logos/skills/oauth.svg', color: '#4b4b55' },
  Nd: { file: 'logos/skills/nodejs.svg', color: '#5fa04e' },
  Ec: { file: 'logos/skills/aws-ecs.svg', color: '#ed7100' },
  Fg: { file: 'logos/skills/aws-fargate.svg', color: '#ed7100' },
  S3: { file: 'logos/skills/aws-s3.svg', color: '#7aa116' },
  Sn: { file: 'logos/skills/aws-sns.svg', color: '#e7157b' },
  La: { file: 'logos/skills/aws-lambda.svg', color: '#ed7100' },
  Rd: { file: 'logos/skills/aws-rds.svg', color: '#c925d1' },
  Sf: { file: 'logos/skills/aws-step-functions.svg', color: '#e7157b' },
  Cf: { file: 'logos/skills/aws-cloudformation.svg', color: '#e7157b' },
  Cw: { file: 'logos/skills/aws-cloudwatch.svg', color: '#e7157b' },
  Dk: { file: 'logos/skills/docker.svg', color: '#2496ed' },
  K8: { file: 'logos/skills/kubernetes.svg', color: '#326ce5' },
  Kf: { file: 'logos/skills/kafka.svg', color: '#5a5a66' },
  Pg: { file: 'logos/skills/postgresql.svg', color: '#336791' },
  Dy: { file: 'logos/skills/aws-dynamodb.svg', color: '#c925d1' },
  Ed: { file: 'logos/skills/event-driven.svg', color: '#d97706' },
  Et: { file: 'logos/skills/etl.svg', color: '#059669' },
  Je: { file: 'logos/skills/jenkins.svg', color: '#d33833' },
  Gt: { file: 'logos/skills/git.svg', color: '#f05032' },
  Bb: { file: 'logos/skills/bitbucket.svg', color: '#2684ff' },
  Mn: { file: 'logos/skills/maven.svg', color: '#c71a36' },
  So: { file: 'logos/skills/sonarqube.svg', color: '#549dd0' },
  Bg: { file: 'logos/skills/blue-green.svg', color: '#2f6fed' },
  Ju: { file: 'logos/skills/junit.svg', color: '#dc514a' },
  Mo: { file: 'logos/skills/mockito.svg', color: '#2e9e6b' },
  Cu: { file: 'logos/skills/cucumber.svg', color: '#23d96c' },
  Td: { file: 'logos/skills/tdd.svg', color: '#e5484d' },
  Sp: { file: 'logos/skills/splunk.svg', color: '#65a637', fit: 0.84 },
  Nr: { file: 'logos/skills/newrelic.svg', color: '#1ce783' },
  Pm: { file: 'logos/skills/prometheus.svg', color: '#e6522c' },
  Ek: { file: 'logos/skills/elastic.svg', color: '#00bfb3' },
  Re: { file: 'logos/skills/react.svg', color: '#61dafb' },
  Rx: { file: 'logos/skills/redux.svg', color: '#764abc' },
  Ng: { file: 'logos/skills/angular.svg', color: '#dd0031' },
}

export const brandLogos = {
  linkedin: { file: 'logos/brands/linkedin.svg', color: '#0a66c2' },
  aws: { file: 'logos/brands/aws.svg', color: '#ff9900', fit: 0.68 },
  infosys: { file: 'logos/brands/infosys.svg', color: '#007cc3', fit: 0.8 },
} satisfies Record<string, Logo>

/* ------------------------------------------- the companies, schools and badges -- */

/**
 * An organisation's mark: its logo when the file is in /public/logos/orgs, otherwise its
 * initials on a plate in its colour. `match` are the ways the organisation is written in site.ts.
 */
export type Org = { key: string; name: string; short: string; color: string; match: string[]; logo?: Logo; mark?: Logo }

/** `logo` is the full logo; `mark` (optional) a squarer cut of it for the smallest plates. */
export const orgs: Org[] = [
  { key: 'capital-one', name: 'Capital One', short: 'C1', color: '#013d5b', match: ['Capital One'], logo: { file: 'logos/orgs/capital-one-dark.svg', color: '#013d5b', fit: 0.9, plate: '#013d5b', wide: 1.7 } },
  {
    key: 'nga-group', name: 'NGA Group', short: 'NGA', color: '#3b5ba5', match: ['NGA Group'],
    logo: { file: 'logos/orgs/nga-group.svg', color: '#3b5ba5', fit: 0.86 },
    mark: { file: 'logos/orgs/nga-group-mark.svg', color: '#3b5ba5', fit: 0.8 },
  },
  { key: 'infosys', name: 'Infosys', short: 'In', color: '#007cc3', match: ['Infosys'], logo: brandLogos.infosys },
  {
    key: 'george-mason', name: 'George Mason University', short: 'GMU', color: '#006633', match: ['George Mason'],
    logo: { file: 'logos/orgs/george-mason.png', color: '#006633', fit: 0.84 },
    mark: { file: 'logos/orgs/george-mason-mark.webp', color: '#006633', fit: 0.74 },
  },
  { key: 'amrita', name: 'Amrita Vishwa Vidyapeetham', short: 'AV', color: '#b4232c', match: ['Amrita'], logo: { file: 'logos/orgs/amrita.svg', color: '#b4232c', fit: 0.76 } },
  {
    key: 'westcliff', name: 'Westcliff University', short: 'WU', color: '#1f3a5f', match: ['Westcliff'],
    logo: { file: 'logos/orgs/westcliff.png', color: '#1f3a5f', fit: 0.86 },
    mark: { file: 'logos/orgs/westcliff-mark.webp', color: '#1f3a5f', fit: 0.68 },
  },
  { key: 'aws', name: 'Amazon Web Services', short: 'AWS', color: '#ff9900', match: ['Amazon Web Services'], logo: brandLogos.aws },
]

/** The organisation a label refers to ("Infosys Limited · Mysore, India" → Infosys), if any. */
export function orgFor(label: string): Org | undefined {
  return orgs.find((o) => o.match.some((m) => label.includes(m)))
}

/** A certification's badge: the picture when the file is in /public/logos/badges, otherwise the AWS mark. */
export type Badge = { key: string; name: string; short: string; match: string[]; file?: string }

export const badges: Badge[] = [
  { key: 'aws-developer-associate', name: 'AWS Certified Developer', short: 'DVA', match: ['Developer'], file: 'logos/badges/aws-certified-developer-associate.png' },
  { key: 'aws-cloud-practitioner', name: 'AWS Certified Cloud Practitioner', short: 'CLF', match: ['Cloud Practitioner'], file: 'logos/badges/aws-certified-cloud-practitioner.png' },
]

export function badgeFor(label: string): Badge | undefined {
  return badges.find((b) => b.match.some((m) => label.includes(m)))
}

/* ------------------------------------------------------ tools named in projects -- */

/** Other names the projects use for things in the periodic table. */
export const toolAliases: Record<string, string> = {
  'AWS RDS': 'Rd',
  'New Relic': 'Nr',
  'Spring Actuator': 'Sb',
  'REST APIs': 'Ra',
}
