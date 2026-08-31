import { Button } from '@trigonum/ui'

export function ClientTypePage() {
  return (
    <main className="mx-auto min-h-screen max-w-6xl px-8 py-20">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-600">Просто. Быстро. Безопасно.</p>
      <h1 className="mt-4 text-5xl font-bold text-slate-950">Открыть счёт</h1>
      <p className="mt-3 text-xl text-slate-600">Выберите тип клиента</p>
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <article className="rounded-2xl border bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-blue-700">Физическое лицо</h2>
          <p className="mt-2 text-slate-600">Для частных инвесторов</p>
          <Button className="mt-8 w-full bg-blue-600 text-white">Выбрать</Button>
        </article>
        <article className="rounded-2xl border bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-green-700">Юридическое лицо</h2>
          <p className="mt-2 text-slate-600">Для компаний и организаций</p>
          <Button className="mt-8 w-full bg-green-600 text-white">Выбрать</Button>
        </article>
      </div>
    </main>
  )
}
