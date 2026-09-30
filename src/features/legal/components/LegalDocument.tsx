import { Link } from 'react-router-dom'

type Block = { type: 'paragraph' | 'list' | 'heading'; lines: string[] }
type Section = { id: string; title: string; blocks: Block[] }

function parseDocument(text: string) {
  const metadata: string[] = []
  const sections: Section[] = []

  for (const line of text.split(/\r?\n/).map((value) => value.trim()).filter(Boolean)) {
    if (line.startsWith('## ')) {
      sections.push({ id: `section-${sections.length + 1}`, title: line.slice(3), blocks: [] })
      continue
    }
    const section = sections[sections.length - 1]
    if (!section) {
      metadata.push(line)
    } else if (line.startsWith('### ')) {
      section.blocks.push({ type: 'heading', lines: [line.slice(4)] })
    } else if (line.startsWith('- ')) {
      const item = line.replace(/^-\s+/, '')
      const previous = section.blocks[section.blocks.length - 1]
      if (previous?.type === 'list') previous.lines.push(item)
      else section.blocks.push({ type: 'list', lines: [item] })
    } else {
      section.blocks.push({ type: 'paragraph', lines: [line] })
    }
  }
  return { metadata, sections }
}

type Props = {
  title: string
  text: string
  related: { to: string; label: string }
}

export default function LegalDocument({ title, text, related }: Props) {
  const { metadata, sections } = parseDocument(text)

  return (
    <main lang="fr" dir="ltr" className="min-h-screen bg-[var(--app-bg)] px-4 py-6 text-[var(--app-text)] sm:px-6 sm:py-10">
      <div className="mx-auto max-w-6xl">
        <Link to="/settings" className="inline-flex min-h-11 items-center gap-2 rounded-lg font-semibold text-[var(--app-orange)] underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">
          <span aria-hidden="true">←</span> Retour aux réglages
        </Link>
        <header id="document-top" className="mb-8 mt-5 scroll-mt-6 overflow-hidden rounded-3xl border border-[var(--app-border)] bg-[var(--app-surface)]">
          <div className="h-1.5 bg-[var(--app-orange)]" />
          <div className="p-6 sm:p-10">
            <p className="mb-4 text-xs font-black uppercase tracking-[0.2em] text-[var(--app-orange)]">Pulse · Informations légales</p>
            <h1 className="max-w-3xl text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">{title}</h1>
            <div className="mt-6 flex flex-wrap gap-2">
              {metadata.map((line) => (
                <p key={line} className="rounded-xl bg-[var(--app-surface-soft)] px-3 py-2 text-sm font-medium text-[var(--app-muted)]">{line}</p>
              ))}
            </div>
          </div>
        </header>
        <div className="grid items-start gap-6 lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-8">
          <nav aria-label="Sommaire du document" className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-5 lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto">
            <h2 className="mb-4 text-sm font-extrabold uppercase tracking-wider">Sommaire</h2>
            <ol className="grid gap-1 sm:grid-cols-2 lg:grid-cols-1">
              {sections.map((section, index) => (
                <li key={section.id}>
                  <a href={`#${section.id}`} className="flex min-h-11 items-center gap-3 rounded-lg px-2 py-2 text-sm leading-snug hover:bg-[var(--app-surface-soft)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--app-orange)]">
                    <span aria-hidden="true" className="text-xs font-bold tabular-nums text-[var(--app-orange)]">{String(index + 1).padStart(2, '0')}</span>
                    {section.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
          <article aria-label={title} className="min-w-0 space-y-5">
            {sections.map((section, index) => (
              <section key={section.id} id={section.id} aria-labelledby={`${section.id}-title`} className="scroll-mt-6 rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6 sm:p-8">
                <div className="mb-6 flex items-start gap-4 border-b border-[var(--app-border-soft)] pb-5">
                  <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--app-surface-soft)] text-sm font-extrabold text-[var(--app-orange)]">{String(index + 1).padStart(2, '0')}</span>
                  <h2 id={`${section.id}-title`} className="pt-1 text-xl font-bold tracking-tight sm:text-2xl">{section.title}</h2>
                </div>
                <div className="space-y-4 break-words text-base leading-7">
                  {section.blocks.map((block, blockIndex) => {
                    if (block.type === 'heading') return <h3 key={blockIndex} className="!mt-7 text-lg font-bold text-[var(--app-text-strong)]">{block.lines[0]}</h3>
                    if (block.type === 'list') return (
                      <ul key={blockIndex} className="list-disc space-y-2 rounded-xl bg-[var(--app-surface-soft)] py-4 pl-9 pr-5 marker:text-[var(--app-orange)]">
                        {block.lines.map((line, itemIndex) => <li key={itemIndex} className="pl-1">{line}</li>)}
                      </ul>
                    )
                    return <p key={blockIndex}>{block.lines[0]}</p>
                  })}
                </div>
              </section>
            ))}
            <footer className="flex flex-wrap items-center justify-between gap-4 px-2 py-5 text-sm font-semibold text-[var(--app-orange)]">
              <Link to={related.to} className="py-2 underline underline-offset-4">{related.label}</Link>
              <a href="#document-top" className="py-2 underline underline-offset-4">Retour en haut ↑</a>
            </footer>
          </article>
        </div>
      </div>
    </main>
  )
}
