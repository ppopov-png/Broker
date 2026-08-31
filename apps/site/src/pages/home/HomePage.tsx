import { Button } from '@trigonum/ui'

export function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-7xl items-center px-8">
      <section>
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
          Trigonum Broker 2.0
        </p>
        <h1 className="max-w-4xl text-6xl font-bold tracking-tight text-slate-950">
          Публичный сайт готов к реализации
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-slate-600">
          Здесь будет маркетинговая часть Broker. Регистрация и личный кабинет развёрнуты как отдельные приложения.
        </p>
        <Button className="mt-8 bg-blue-600 text-white">Открыть счёт</Button>
      </section>
    </main>
  )
}
