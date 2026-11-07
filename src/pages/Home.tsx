import { useEffect } from 'react'
import { useLocation, useNavigate } from '../lib/router'
import { About } from '../sections/About'
import { Achievements } from '../sections/Achievements'
import { Contact } from '../sections/Contact'
import { Experience } from '../sections/Experience'
import { Hero } from '../sections/Hero'
import { Learning } from '../sections/Learning'
import { Skills } from '../sections/Skills'
import { Work } from '../sections/Work'
import { useScrollTo } from '../lib/scroll'

export function Home() {
  const location = useLocation()
  const navigate = useNavigate()
  const scrollTo = useScrollTo()

  // Arriving from a case study with "take me to Skills" etc.
  useEffect(() => {
    const section = (location.state as { section?: string } | null)?.section
    if (!section) return
    const t = setTimeout(() => {
      scrollTo(section, { immediate: true })
      navigate('.', { replace: true, state: null })
    }, 60)
    return () => clearTimeout(t)
  }, [location.state, navigate, scrollTo])

  return (
    <main id="main">
      <Hero />
      <About />
      <Skills />
      <Work />
      <Learning />
      <Experience />
      <Achievements />
      <Contact />
    </main>
  )
}
