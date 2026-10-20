/* ==========================================================================
   All of the site's words live in this one file.
   Edit here and every section, case study and the resume page update.
   ========================================================================== */

export const site = {
  name: 'Krishna Koushik Maddukuri',
  shortName: 'Krishna Maddukuri',
  first: 'Krishna',
  monogram: 'KM',
  role: 'Senior Software Engineer',
  headline: ['Senior Software', 'Engineer'],
  /**
   * His intro under the hero title. It appears word by word, each word fading from faint to clear.
   * Words **marked like this** (here and in the About lead) are the key words: bold, in the accent colour.
   */
  intro:
    "Hi, I'm Krishna, a senior software engineer. For more than six years, I've built **distributed systems** for financial services, from **Kafka pipelines** and **Spring Boot microservices** to **zero-downtime releases on AWS**.",
  location: 'Richmond, VA',
  email: 'm.krishnakoushik@icloud.com',
  linkedin: 'https://www.linkedin.com/in/krishna-koushik',
  linkedinLabel: 'linkedin.com/in/krishna-koushik',
  openTo: 'Open to Senior Engineer roles',

  /**
   * Hero: his full-body paper figure (a cut-out with a see-through background, in /public/avatar,
   * with the facet mesh beside it) and the chat bubble that pops up beside his head.
   * Empty bubble = no bubble. Empty image = a placeholder figure until a picture is added.
   */
  hero: {
    image: 'avatar/krishna-origami.webp',
    bubble: "Hi, I'm Krishna.",
  },

  /** Picture for the ID card (a portrait crop works best). Empty = initials. */
  photo: 'krishna-portrait.webp',

  /** The PDF in /public that every "Résumé" button downloads. Empty hides the buttons. */
  resumePdf: 'Krishna_Koushik_Maddukuri_Resume.pdf',
}

export const navItems = [
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'work', label: 'Work' },
  { id: 'experience', label: 'Experience' },
  { id: 'achievements', label: 'Achievements' },
  { id: 'contact', label: 'Contact' },
] as const

export const about = {
  hello: 'Krishna.',
  lead: 'Senior Software Engineer with 6+ years designing, building and operating large-scale **distributed systems** and cloud-native microservices in financial services. I build secure, compliant, high-throughput data platforms with **Java, Spring Boot, Apache Kafka and AWS**.',
  more: 'I work across microservices, event-driven pipelines, REST APIs, CI/CD and production observability.',
  facts: [
    { k: 'Based in', v: 'Richmond, VA' },
    { k: 'Role', v: 'Full Stack Software Engineer · Bank of America' },
    { k: 'Experience', v: '6+ years · financial services' },
    { k: 'Studied', v: 'M.S. Computer Science, George Mason' },
    { k: 'Certified', v: 'AWS Developer' },
    { k: 'Focus', v: 'Java · Kafka · AWS' },
  ],
  quote: 'From the first commit to production.',
  card: {
    title: 'Engineer ID',
    sub: 'Portfolio · 2026',
    idNo: 'KKM-0820',
    dept: 'FinTech',
    since: '2020',
    /** printed down the lanyard strap, after his first name */
    strap: 'engineer',
  },
}

/* ---------------------------------------------------------------- skills -- */

export type FamilyId = 'lang' | 'back' | 'cloud' | 'data' | 'devops' | 'test' | 'obs' | 'front'

/** Ordered dark to light. The last family is drawn as outlined tiles. */
export const families: { id: FamilyId; label: string }[] = [
  { id: 'lang', label: 'Languages' },
  { id: 'back', label: 'Backend & Frameworks' },
  { id: 'cloud', label: 'Cloud & AWS' },
  { id: 'data', label: 'Data & Messaging' },
  { id: 'devops', label: 'DevOps & CI/CD' },
  { id: 'test', label: 'Testing & Quality' },
  { id: 'obs', label: 'Observability' },
  { id: 'front', label: 'Frontend' },
]

export type Element = {
  sym: string
  name: string
  family: FamilyId
  note: string
  n: number
}

const rawElements: Omit<Element, 'n'>[] = [
  // Languages
  { sym: 'Jv', name: 'Java', family: 'lang', note: 'Scalable, secure Spring Boot microservices for credit bureau reporting at Capital One.' },
  { sym: 'Py', name: 'Python', family: 'lang', note: 'Scripting, automation and tooling.' },
  { sym: 'Ts', name: 'TypeScript', family: 'lang', note: 'Typed JavaScript for front ends and Node.js services.' },
  { sym: 'Js', name: 'JavaScript', family: 'lang', note: 'React and Redux front ends at Infosys, and MERN projects as an intern.' },
  { sym: 'Sq', name: 'SQL', family: 'lang', note: 'PostgreSQL on AWS RDS behind event-driven financial workflows.' },
  { sym: 'Cp', name: 'C++', family: 'lang', note: 'Computer science fundamentals: data structures, algorithms and memory.' },
  // Backend & Frameworks
  { sym: 'Sb', name: 'Spring Boot', family: 'back', note: 'Microservices for Capital One and a cloud-ready reporting service at NGA Group.' },
  { sym: 'Bt', name: 'Spring Batch', family: 'back', note: 'A paginated reader that took Metro2 file generation from 7 hours to 4.' },
  { sym: 'Sk', name: 'Spring Kafka', family: 'back', note: 'Event-driven pipelines with fault-tolerant, exactly-once processing.' },
  { sym: 'Mv', name: 'Spring MVC', family: 'back', note: 'Backend services behind React front ends at Infosys.' },
  { sym: 'Hb', name: 'Hibernate & JPA', family: 'back', note: 'Object-relational mapping between Java services and relational data.' },
  { sym: 'Ms', name: 'Microservices', family: 'back', note: 'Distributed, cloud-native services for the Enterprise Credit Bureau Reporting Service.' },
  { sym: 'Ra', name: 'REST APIs', family: 'back', note: 'Secure, role-based APIs so teams consume curated data without direct database access.' },
  { sym: 'Oa', name: 'OAuth2', family: 'back', note: 'OAuth2-protected REST APIs that strengthened security and compliance.' },
  { sym: 'Nd', name: 'Node.js', family: 'back', note: 'Back-end work in the MERN ecosystem during the Infosys internship.' },
  // Cloud & AWS
  { sym: 'Ec', name: 'AWS ECS', family: 'cloud', note: 'Containerized the NGA Group application on ECS, part of a 70% cut in deployment time.' },
  { sym: 'Fg', name: 'AWS Fargate', family: 'cloud', note: 'Containerized services at Capital One, with containers 60% smaller.' },
  { sym: 'S3', name: 'Amazon S3', family: 'cloud', note: 'Object storage wired into the Fargate services.' },
  { sym: 'Sn', name: 'Amazon SNS', family: 'cloud', note: 'Messaging integrated with the Fargate services.' },
  { sym: 'La', name: 'AWS Lambda', family: 'cloud', note: 'Serverless functions for event-driven work.' },
  { sym: 'Rd', name: 'Amazon RDS', family: 'cloud', note: 'PostgreSQL on RDS for sensitive financial workflows.' },
  { sym: 'Sf', name: 'Step Functions', family: 'cloud', note: 'Workflow orchestration integrated with the Fargate services.' },
  { sym: 'Cf', name: 'CloudFormation', family: 'cloud', note: 'Infrastructure as code for the Fargate deployments.' },
  { sym: 'Cw', name: 'CloudWatch', family: 'cloud', note: 'Metrics and logs for services running on AWS.' },
  { sym: 'Dk', name: 'Docker', family: 'cloud', note: 'Containers for ECS at NGA Group and Fargate at Capital One, where they got 60% smaller.' },
  { sym: 'K8', name: 'Kubernetes', family: 'cloud', note: 'Container orchestration.' },
  // Data & Messaging
  { sym: 'Kf', name: 'Apache Kafka', family: 'data', note: 'High-throughput event pipelines at Capital One and NGA Group.' },
  { sym: 'Pg', name: 'PostgreSQL', family: 'data', note: 'The relational store behind event-driven reporting workflows.' },
  { sym: 'Dy', name: 'DynamoDB', family: 'data', note: 'Near-real-time ingestion at NGA Group that scales with event volume.' },
  { sym: 'Ed', name: 'Event-Driven', family: 'data', note: 'Event-driven architecture for fault-tolerant financial workflows.' },
  { sym: 'Et', name: 'ETL', family: 'data', note: 'Moving and reshaping data for reporting and analytics.' },
  // DevOps & CI/CD
  { sym: 'Je', name: 'Jenkins', family: 'devops', note: 'Enterprise CI/CD: automated builds, quality gates and blue-green releases.' },
  { sym: 'Gt', name: 'Git', family: 'devops', note: 'Version control for every project.' },
  { sym: 'Bb', name: 'Bitbucket', family: 'devops', note: 'CI/CD pipelines that tripled deployment frequency at Infosys.' },
  { sym: 'Mn', name: 'Maven', family: 'devops', note: 'Builds and dependency management for Java services.' },
  { sym: 'So', name: 'SonarQube', family: 'devops', note: 'Quality gates enforced in the Jenkins pipelines.' },
  { sym: 'Bg', name: 'Blue-Green', family: 'devops', note: 'Blue-green deployments for zero-downtime releases.' },
  // Testing & Quality
  { sym: 'Ju', name: 'JUnit', family: 'test', note: 'Automated test suites that reduced production defects.' },
  { sym: 'Mo', name: 'Mockito', family: 'test', note: 'Mocks for fast, isolated unit tests.' },
  { sym: 'Cu', name: 'Cucumber', family: 'test', note: 'Behavior-driven, automated test suites.' },
  { sym: 'Td', name: 'TDD', family: 'test', note: 'Test-driven development: tests first, then the code.' },
  // Observability
  { sym: 'Sp', name: 'Splunk', family: 'obs', note: 'Dashboards and alerting that sped up incident response.' },
  { sym: 'Nr', name: 'New Relic APM', family: 'obs', note: 'Root-cause analysis across distributed microservices.' },
  { sym: 'Pm', name: 'Prometheus', family: 'obs', note: 'Metrics that helped cut issue-detection time 50% at NGA Group.' },
  { sym: 'Ek', name: 'ELK Stack', family: 'obs', note: 'Log analytics alongside Spring Actuator and Prometheus.' },
  // Frontend
  { sym: 'Re', name: 'React', family: 'front', note: 'Reusable components across 4 large-scale applications at Infosys.' },
  { sym: 'Rx', name: 'Redux', family: 'front', note: 'State management and asynchronous data fetching from REST APIs.' },
  { sym: 'Ng', name: 'Angular', family: 'front', note: 'Component-based front ends.' },
]

/** Numbered in reading order across an 8-column table. */
export const elements: Element[] = rawElements.map((el, i) => ({ ...el, n: i + 1 }))

/* -------------------------------------------------------------- projects -- */

export type VisualKind = 'pipeline' | 'stream' | 'deploy' | 'unify' | 'monitor' | 'components' | 'sprint'

export type Project = {
  slug: string
  title: string
  accent: string
  eyebrow: string
  role: string
  org: string
  period: string
  summary: string
  context: string
  highlights: string[]
  did: string[]
  outcomes: string[]
  metrics: { value: string; label: string }[]
  tools: string[]
  visual: VisualKind
}

export const projects: Project[] = [
  {
    slug: 'credit-bureau-reporting',
    title: 'Credit Bureau Reporting',
    accent: 'in Metro2',
    eyebrow: 'Senior Software Engineer · Capital One',
    role: 'Senior Software Engineer',
    org: 'Capital One',
    period: 'Sep 2024 – Oct 2026',
    summary:
      "Capital One's Enterprise Credit Bureau Reporting Service. I build the Java/Spring Boot microservices that generate its compliant Metro2 files for four credit bureaus.",
    context:
      'The Enterprise Credit Bureau Reporting Service generates the Metro2 files Capital One reports to the credit bureaus. It covers U.S., Canada, Small Business and Commercial segments across Equifax, Experian, TransUnion and LexisNexis, so the services behind it have to be scalable, secure and compliant.',
    highlights: [
      'Java/Spring Boot microservices',
      'Metro2 files for four segments',
      'Spring Batch: 7 hours down to 4',
      'OAuth2 APIs, JUnit and Cucumber',
    ],
    did: [
      'Designed and built scalable, secure Java/Spring Boot microservices for the Enterprise Credit Bureau Reporting Service.',
      'Generate compliant Metro2 files for U.S., Canada, Small Business and Commercial segments across Equifax, Experian, TransUnion and LexisNexis.',
      'Improved batch performance by 43% (7 hours to 4) by replacing cursor-based readers with a paginated reader in Spring Batch for high-volume Metro2 file generation.',
      'Designed OAuth2-protected REST APIs and built automated test suites with JUnit and Cucumber, reducing production defects.',
    ],
    outcomes: [
      'Compliant Metro2 files for four segments and four credit bureaus',
      'Batch processing 43% faster: 7 hours down to 4',
      'Fewer production defects',
    ],
    metrics: [
      { value: '43%', label: 'faster batch processing' },
      { value: '4', label: 'credit bureaus' },
      { value: '4', label: 'reporting segments' },
    ],
    tools: ['Java', 'Spring Boot', 'Spring Batch', 'OAuth2', 'JUnit', 'Cucumber'],
    visual: 'pipeline',
  },
  {
    slug: 'event-driven-pipelines',
    title: 'Event-Driven Pipelines',
    accent: 'exactly once',
    eyebrow: 'Senior Software Engineer · Capital One',
    role: 'Senior Software Engineer',
    org: 'Capital One',
    period: 'Sep 2024 – Oct 2026',
    summary:
      'High-throughput, event-driven pipelines on Apache Kafka, Spring Kafka and PostgreSQL/RDS that process sensitive financial workflows exactly once.',
    context:
      'Credit bureau reporting moves sensitive financial data between services. The pipelines that carry it have to keep up at enterprise scale, survive failures and process every event exactly once.',
    highlights: [
      'Apache Kafka and Spring Kafka',
      'PostgreSQL on AWS RDS',
      'Fault-tolerant, exactly-once',
      'Splunk and New Relic alerting',
    ],
    did: [
      'Engineered high-throughput, event-driven pipelines with Apache Kafka, Spring Kafka and PostgreSQL/RDS.',
      'Built them for fault-tolerant, exactly-once processing of sensitive financial workflows at enterprise scale.',
      'Integrated Splunk and New Relic APM with actionable dashboards and alerting across the distributed microservices.',
    ],
    outcomes: ['Fault-tolerant, exactly-once processing at enterprise scale', 'Faster incident response and root-cause analysis'],
    metrics: [],
    tools: ['Apache Kafka', 'Spring Kafka', 'PostgreSQL', 'AWS RDS', 'Splunk', 'New Relic'],
    visual: 'stream',
  },
  {
    slug: 'cloud-delivery',
    title: 'Cloud Delivery',
    accent: 'on AWS Fargate',
    eyebrow: 'Senior Software Engineer · Capital One',
    role: 'Senior Software Engineer',
    org: 'Capital One',
    period: 'Sep 2024 – Oct 2026',
    summary:
      'Containerized services on AWS Fargate, deployed with CloudFormation and released through Jenkins with blue-green, zero-downtime deployments.',
    context:
      'The reporting services run as containers on AWS Fargate and work with SNS, S3, RDS and Step Functions. Every release goes through enterprise Jenkins pipelines, so each change is built, checked and deployed the same way.',
    highlights: [
      'AWS Fargate via CloudFormation',
      'SNS, S3, RDS, Step Functions',
      'Jenkins with SonarQube gates',
      'Blue-green, zero-downtime releases',
    ],
    did: [
      'Deployed containerized services on AWS Fargate via CloudFormation, integrating SNS, S3, RDS and Step Functions.',
      'Reduced container size by 60%, lowering compute costs and improving runtime efficiency.',
      'Implemented enterprise CI/CD pipelines with Jenkins to automate builds and enforce SonarQube quality gates.',
      'Manage blue-green deployments with zero-downtime releases.',
    ],
    outcomes: ['Containers 60% smaller, with lower compute costs', 'Zero-downtime releases'],
    metrics: [{ value: '60%', label: 'smaller containers' }],
    tools: ['AWS Fargate', 'CloudFormation', 'Step Functions', 'Docker', 'Jenkins', 'SonarQube'],
    visual: 'deploy',
  },
  {
    slug: 'unified-reporting',
    title: 'Unified Reporting',
    accent: 'one data model',
    eyebrow: 'Software Engineer · NGA Group',
    role: 'Software Engineer',
    org: 'NGA Group Inc',
    period: 'Sep 2023 – Sep 2024',
    summary:
      'A cloud-ready Spring Boot service that brought disparate data sources into one standardized reporting model, served through secure, role-based REST APIs.',
    context:
      'Analytics work depended on data from disparate sources that had to be reconciled by hand. Downstream teams also needed the curated datasets without direct access to the database.',
    highlights: [
      'Cloud-ready Spring Boot service',
      'One standardized reporting model',
      'Secure, role-based REST APIs',
      'Kafka and DynamoDB ingestion',
    ],
    did: [
      'Designed a cloud-ready Spring Boot service that unifies disparate data sources into a standardized reporting model.',
      'Delivered secure, role-based REST APIs so downstream teams consume curated datasets without direct database access.',
      'Built a high-velocity ingestion pipeline with Apache Kafka and DynamoDB that propagates updates in near real time and scales with upstream event volume.',
    ],
    outcomes: [
      'No more manual reconciliation across analytics workflows',
      'Better data accessibility and stronger data governance',
      'Near-real-time updates that scale with event volume',
    ],
    metrics: [],
    tools: ['Java', 'Spring Boot', 'REST APIs', 'Apache Kafka', 'DynamoDB'],
    visual: 'unify',
  },
  {
    slug: 'release-and-monitoring',
    title: 'Release & Monitoring',
    accent: 'on AWS ECS',
    eyebrow: 'Software Engineer · NGA Group',
    role: 'Software Engineer',
    org: 'NGA Group Inc',
    period: 'Sep 2023 – Sep 2024',
    summary:
      'I containerized the application on AWS ECS, automated its build and release pipelines in Jenkins, and wired in Spring Actuator, Prometheus and ELK to catch issues sooner.',
    context:
      'The reporting application needed faster, more reliable releases and better operational visibility once it was running.',
    highlights: [
      'Containerized on AWS ECS',
      'Jenkins build and release',
      'Spring Actuator and Prometheus',
      'ELK log analytics',
    ],
    did: [
      'Containerized the application on AWS ECS.',
      'Automated build and release pipelines through Jenkins, reducing deployment time by 70% and improving release reliability.',
      'Improved operational visibility by integrating Spring Actuator, Prometheus and ELK analytics, cutting issue-detection time by 50%.',
    ],
    outcomes: ['Deployment time down 70%', 'Issue-detection time down 50%', 'More reliable releases'],
    metrics: [
      { value: '70%', label: 'less deployment time' },
      { value: '50%', label: 'faster issue detection' },
    ],
    tools: ['AWS ECS', 'Docker', 'Jenkins', 'Spring Actuator', 'Prometheus', 'ELK Stack'],
    visual: 'monitor',
  },
  {
    slug: 'react-front-ends',
    title: 'React Front Ends',
    accent: 'for four apps',
    eyebrow: 'Software Engineer · Infosys',
    role: 'Software Engineer',
    org: 'Infosys Limited',
    period: 'Aug 2020 – Aug 2021',
    summary:
      'Modular, reusable React components with Redux state management that gave four large-scale applications consistent UI behavior.',
    context:
      'Four large-scale applications needed consistent UI behavior, dependable data from Spring MVC backend services and a faster way to ship.',
    highlights: [
      'Reusable React and Redux components',
      'Async data from RESTful APIs',
      'Forms, routing, events',
      'Bitbucket CI/CD to AWS',
    ],
    did: [
      'Developed modular, reusable React components with Redux state management, delivering consistent UI behavior across 4 large-scale applications.',
      'Integrated RESTful APIs with React and Redux for asynchronous data fetching, improving client-server communication and content rendering.',
      'Built front-end features (forms, routing, events, custom components) integrated with Spring MVC backend services.',
      'Modernized legacy codebases and applied engineering best practices, reducing bug rates by 25%.',
      'Implemented CI/CD pipelines with Bitbucket and automated multi-region AWS deployments, increasing deployment frequency 3×.',
    ],
    outcomes: ['Consistent UI across 4 large-scale applications', 'Bug rates down 25%', 'Deployment frequency up 3×'],
    metrics: [
      { value: '4', label: 'large-scale applications' },
      { value: '25%', label: 'lower bug rates' },
      { value: '3×', label: 'deployment frequency' },
    ],
    tools: ['React', 'Redux', 'Spring MVC', 'REST APIs', 'Bitbucket', 'AWS'],
    visual: 'components',
  },
  {
    slug: 'internship-projects',
    title: 'Internship Projects',
    accent: 'MERN & CI/CD',
    eyebrow: 'Software Engineer Intern · Infosys',
    role: 'Software Engineer Intern',
    org: 'Infosys Limited',
    period: 'Jan 2020 – Aug 2020',
    summary:
      '15+ projects across back-end and front-end development in the MERN ecosystem, plus build fixes that made the CI/CD pipeline 40% more stable.',
    context:
      'An eight-month internship at Infosys in Mysore, covering back-end and front-end development in the MERN ecosystem and the build pipeline behind it.',
    highlights: [
      '15+ projects in the MERN stack',
      'Jenkins log analysis',
      'Bash and Groovy script fixes',
      'Sprint planning in JIRA',
    ],
    did: [
      'Completed 15+ projects and certification-aligned exercises across back-end and front-end development within the MERN ecosystem.',
      'Diagnosed and resolved backend build failures by analyzing Jenkins logs and debugging deployment scripts in Bash and Groovy, improving CI/CD pipeline stability by 40%.',
      'Coordinated sprint planning for a four-developer team using Agile methodology and JIRA, ensuring on-time delivery of project milestones.',
    ],
    outcomes: ['CI/CD pipeline stability up 40%', 'Project milestones delivered on time'],
    metrics: [
      { value: '15+', label: 'projects completed' },
      { value: '40%', label: 'more stable CI/CD' },
    ],
    tools: ['MERN', 'Jenkins', 'Bash', 'Groovy', 'Agile', 'JIRA'],
    visual: 'sprint',
  },
]

/* ------------------------------------------------------- always learning -- */

export const learning = {
  sub: 'A doctorate in progress, two AWS certifications and two computer science degrees.',
  items: [
    { title: 'DBA, Technology Management', from: 'Westcliff University · Jul 2026 – Aug 2029 (expected)' },
    { title: 'AWS Certified Developer', from: 'Amazon Web Services · Certification' },
    { title: 'AWS Certified Cloud Practitioner', from: 'Amazon Web Services · Certification' },
    { title: 'M.S., Computer Science', from: 'George Mason University · Fairfax, VA · 2023' },
    { title: 'B.Tech, Computer Science', from: 'Amrita Vishwa Vidyapeetham · Coimbatore, India · 2020' },
  ],
}

/* ------------------------------------------------- education & experience -- */

export type Milestone = {
  year: string
  kind: 'Education' | 'Experience'
  title: string
  org: string
  period: string
  badge: string
  current?: boolean
}

export const timeline: Milestone[] = [
  {
    year: '2020',
    kind: 'Experience',
    title: 'Software Engineer Intern',
    org: 'Infosys Limited · Mysore, India',
    period: 'Jan 2020 – Aug 2020',
    badge: 'MERN · Jenkins · Agile',
  },
  {
    year: '2020',
    kind: 'Education',
    title: 'B.Tech, Computer Science',
    org: 'Amrita Vishwa Vidyapeetham · Coimbatore, India',
    period: 'Graduated 2020',
    badge: "Bachelor's degree",
  },
  {
    year: '2020',
    kind: 'Experience',
    title: 'Software Engineer',
    org: 'Infosys Limited · Hyderabad, India',
    period: 'Aug 2020 – Aug 2021',
    badge: 'React · Redux · Spring MVC',
  },
  {
    year: '2023',
    kind: 'Education',
    title: 'M.S., Computer Science',
    org: 'George Mason University · Fairfax, VA',
    period: 'Graduated 2023',
    badge: "Master's degree",
  },
  {
    year: '2023',
    kind: 'Experience',
    title: 'Software Engineer',
    org: 'NGA Group Inc · New Brunswick, NJ',
    period: 'Sep 2023 – Sep 2024',
    badge: 'Spring Boot · Kafka · AWS ECS',
  },
  {
    year: '2024',
    kind: 'Experience',
    title: 'Senior Software Engineer',
    org: 'Capital One · McLean, VA',
    period: 'Sep 2024 – Oct 2026',
    badge: 'Spring Boot · Kafka · Fargate',
  },
  {
    year: '2026',
    kind: 'Education',
    title: 'DBA, Technology Management',
    org: 'Westcliff University',
    period: 'Jul 2026 – Aug 2029 (expected)',
    badge: 'In progress',
    current: true,
  },
  {
    year: '2026',
    kind: 'Experience',
    title: 'Full Stack Software Engineer',
    org: 'Bank of America · Pennington, NJ',
    period: 'Oct 2026 – Present',
    badge: 'Current role',
    current: true,
  },
]

/* ------------------------------------------------------ the web resume -- */

/* Everything below is used by the web resume page (/#/resume), word for word from the PDF. */
export type Role = {
  period: string
  current?: boolean
  role: string
  org: string
  where: string
  points: string[]
}

export const resume = {
  title: 'Senior Software Engineer',
  tagline: 'Java · Spring Boot · Apache Kafka · AWS · Angular · React',
  summary:
    'Senior Full Stack Software Engineer with 6+ years of experience designing, building, and operating large-scale distributed systems and cloud-native microservices for financial services firms including Bank of America and Capital One. Expert in Java, Spring Boot, Apache Kafka, REST API design, system design, Angular/React, and Amazon Web Services (AWS), with a record of delivering secure, regulatory-compliant, high-throughput data platforms. Reduced batch processing time by 43%, cut deployment time by 70%, and lowered compute costs through container optimization. AWS Certified Developer – Associate with deep experience in event-driven architecture, CI/CD automation, test-driven development (TDD), and production observability.',
  skills: [
    { label: 'Languages', items: 'Java (8/11/17), Python, SQL, TypeScript, JavaScript, C++, Bash, Groovy' },
    { label: 'Backend & Frameworks', items: 'Spring Boot, Spring MVC, Spring Batch, Spring Kafka, Spring Security, Spring Data JPA, Hibernate, Microservices, Distributed Systems, System Design, RESTful APIs, OpenAPI/Swagger, GraphQL, OAuth2, JWT, Node.js, Liquibase' },
    { label: 'Cloud & Infrastructure', items: 'AWS (ECS, Fargate, EC2, Lambda, S3, SNS, SQS, RDS, DynamoDB, Step Functions, CloudFormation, CloudWatch, IAM, Glue, EMR), Microsoft Azure, Docker, Kubernetes, Serverless Architecture, Infrastructure as Code (IaC)' },
    { label: 'Data & Messaging', items: 'Apache Kafka, PostgreSQL, MySQL, SQL Server, DynamoDB, MongoDB, Event-Driven Architecture, Real-Time Data Pipelines, ETL, Metro 2 Credit Reporting' },
    { label: 'DevOps & CI/CD', items: 'Jenkins, Git, Bitbucket, GitHub, Maven, Gradle, SonarQube, Blue-Green Deployments, Zero-Downtime Releases, Agile/Scrum, Jira, Confluence' },
    { label: 'Testing & Quality', items: 'JUnit, Mockito, Cucumber, Selenium, WireMock, Postman, Test-Driven Development (TDD), Behavior-Driven Development (BDD), Code Review' },
    { label: 'Observability & Security', items: 'Splunk, New Relic APM, Prometheus, ELK Stack, Spring Actuator, Log4j, Performance Tuning, Secure SDLC, Regulatory Compliance' },
    { label: 'Frontend', items: 'Angular, React.js, Redux, TypeScript, HTML5, CSS3, Bootstrap, jQuery, Jasmine' },
  ],
  certifications: ['AWS Certified Developer – Associate (Nov 2023)', 'AWS Certified Cloud Practitioner (Jun 2023)'],
}

export const experience: Role[] = [
  {
    period: 'Oct 2026 – Present',
    current: true,
    role: 'Application Programmer III (Full Stack Software Engineer)',
    org: 'Bank of America',
    where: 'Pennington, NJ',
    points: [
      'Develop and maintain full-stack features for Bank of America\'s Wealth Management Technology platform: Java/Spring Boot microservices and RESTful APIs on the back end, Angular and React front ends, delivering secure, scalable, high-availability financial applications.',
      'Build event-driven integrations with Apache Kafka and relational data stores, following the bank\'s secure SDLC, code review, and regulatory compliance standards.',
      'Write automated unit and integration tests (JUnit, Mockito, Jasmine) and ship through CI/CD pipelines, collaborating in Agile/Scrum ceremonies with product, QA, and platform teams.',
    ],
  },
  {
    period: 'Sep 2024 – Oct 2026',
    role: 'Senior Software Engineer',
    org: 'Capital One',
    where: 'McLean, VA',
    points: [
      "Designed and built scalable, secure Java/Spring Boot microservices for Capital One's Enterprise Credit Bureau Reporting Service, generating compliant Metro2 files for approximately 30 million consumer, small-business, and commercial accounts each month across Equifax, Experian, TransUnion, and LexisNexis.",
      'Engineered high-throughput, event-driven pipelines with Apache Kafka, Spring Kafka, and PostgreSQL/RDS, achieving fault-tolerant, exactly-once processing for sensitive financial workflows at enterprise scale.',
      'Improved batch performance by 43% (7 hours to 4) by replacing cursor-based readers with a paginated reader in Spring Batch for high-volume Metro2 file generation.',
      'Deployed containerized services on AWS Fargate via CloudFormation, integrating SNS, S3, RDS, and Step Functions; reduced container size by 60%, lowering compute costs and improving runtime efficiency.',
      'Implemented enterprise CI/CD pipelines with Jenkins to automate builds, enforce SonarQube quality gates, and manage blue-green deployments with zero-downtime releases.',
      'Strengthened security and compliance by designing OAuth2-protected REST APIs and building automated test suites with JUnit and Cucumber, reducing production defects.',
      'Integrated Splunk and New Relic APM with actionable dashboards and alerting, accelerating incident response and root-cause analysis across distributed microservices.',
      'Onboarded Discover account portfolios into the credit bureau reporting pipeline following the Capital One–Discover merger, extending the platform to new product segments without disrupting monthly regulatory deadlines.',
    ],
  },
  {
    period: 'Sep 2023 – Sep 2024',
    role: 'Software Engineer',
    org: 'NGA Group Inc',
    where: 'New Brunswick, NJ',
    points: [
      'Designed a cloud-ready Spring Boot service unifying disparate data sources into a standardized reporting model, improving data accessibility and eliminating manual reconciliation across analytics workflows.',
      'Delivered secure, role-based REST APIs enabling downstream teams to consume curated datasets without direct database access, strengthening data governance.',
      'Built a high-velocity ingestion pipeline with Apache Kafka and DynamoDB, supporting near-real-time propagation of updates and scaling with increased upstream event volume.',
      'Containerized the application on AWS ECS and automated build/release pipelines through Jenkins, reducing deployment time by 70% and improving release reliability.',
      'Improved operational visibility by integrating Spring Actuator, Prometheus, and ELK analytics, cutting issue-detection time by 50%.',
    ],
  },
  {
    period: 'Aug 2020 – Aug 2021',
    role: 'Software Engineer',
    org: 'Infosys Limited',
    where: 'Hyderabad, India',
    points: [
      'Developed modular, reusable React components with Redux state management, delivering consistent UI behavior across 4 large-scale applications.',
      'Integrated RESTful APIs with React and Redux for asynchronous data fetching, improving client-server communication and content rendering.',
      'Built frontend features (forms, routing, events, custom components) integrated with Spring MVC backend services for reliable API orchestration.',
      'Modernized legacy codebases and applied engineering best practices, reducing bug rates by 25% and improving maintainability and performance.',
      'Implemented CI/CD pipelines with Bitbucket and automated multi-region AWS deployments, increasing deployment frequency by 3×.',
    ],
  },
  {
    period: 'Jan 2020 – Aug 2020',
    role: 'Software Engineer Intern',
    org: 'Infosys Limited',
    where: 'Mysore, India',
    points: [
      'Completed 15+ projects and certification-aligned exercises across back-end and front-end development within the MERN ecosystem.',
      'Diagnosed and resolved backend build failures by analyzing Jenkins logs and debugging deployment scripts in Bash and Groovy, improving CI/CD pipeline stability by 40%.',
      'Coordinated sprint planning for a four-developer team using Agile methodology and JIRA, ensuring on-time delivery of project milestones.',
    ],
  },
]

export const education: Role[] = [
  {
    period: 'Jul 2026 – Aug 2029 (expected)',
    role: 'Doctorate in Business Administration (DBA), Technology Management',
    org: 'Westcliff University',
    where: '',
    points: [],
  },
  {
    period: '2021 – 2023',
    role: 'Master of Science in Computer Science',
    org: 'George Mason University',
    where: 'Fairfax, VA',
    points: [],
  },
  {
    period: '2016 – 2020',
    role: 'Bachelor of Technology in Computer Science',
    org: 'Amrita Vishwa Vidyapeetham',
    where: 'Coimbatore, India',
    points: [],
  },
]

/* ---------------------------------------------------------- achievements -- */

export type IconName =
  | 'chart'
  | 'report'
  | 'clock'
  | 'target'
  | 'hourglass'
  | 'shield'
  | 'trophy'
  | 'bug'
  | 'people'
  | 'box'
  | 'rocket'
  | 'pulse'
  | 'repeat'
  | 'bank'

export type Achievement = {
  value: number
  suffix: string
  title: string
  source: string
  detail: string
  icon: IconName
}

export const achievements: Achievement[] = [
  { value: 43, suffix: '%', title: 'Faster batch processing', source: 'Capital One', detail: '7 hours down to 4 in Spring Batch', icon: 'clock' },
  { value: 60, suffix: '%', title: 'Smaller containers', source: 'Capital One', detail: 'AWS Fargate services, lower compute costs', icon: 'box' },
  { value: 4, suffix: '', title: 'Credit bureaus reported to', source: 'Capital One', detail: 'Equifax, Experian, TransUnion and LexisNexis', icon: 'bank' },
  { value: 70, suffix: '%', title: 'Less deployment time', source: 'NGA Group', detail: 'AWS ECS with Jenkins release pipelines', icon: 'rocket' },
  { value: 50, suffix: '%', title: 'Faster issue detection', source: 'NGA Group', detail: 'Spring Actuator, Prometheus and ELK', icon: 'pulse' },
  { value: 3, suffix: '×', title: 'Deployment frequency', source: 'Infosys', detail: 'Bitbucket CI/CD to multi-region AWS', icon: 'repeat' },
  { value: 25, suffix: '%', title: 'Lower bug rates', source: 'Infosys', detail: 'Legacy codebases modernized', icon: 'bug' },
  { value: 40, suffix: '%', title: 'More stable CI/CD', source: 'Infosys', detail: 'Jenkins logs, Bash and Groovy fixes', icon: 'shield' },
  { value: 6, suffix: '+', title: 'Years building software', source: 'Since 2020', detail: 'Distributed systems in financial services', icon: 'trophy' },
]
