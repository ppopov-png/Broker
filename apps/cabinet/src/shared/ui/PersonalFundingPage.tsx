import {
  ArrowDownToLine,
  ArrowUpFromLine,
  BadgeCheck,
  Building2,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  KeyRound,
  Link2,
  Plus,
  RefreshCcw,
  ShieldCheck,
  Unplug,
  Wallet,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { useBrokerAccount } from '../lib/AccountContext'
import { formatCurrency, formatDateTime } from '../lib/format'
import { useFunding } from '../lib/FundingContext'
import type { FundingSource } from '../lib/FundingContext'
import { Card } from './Card'
import { Modal } from './Modal'

type Flow =
  | { kind: 'connect' }
  | { kind: 'exchange' }
  | { kind: 'manual' }
  | { kind: 'deposit'; source: FundingSource }
  | { kind: 'withdraw'; source: FundingSource }
  | null

const shortAddress = (address: string) => `${address.slice(0, 6)}…${address.slice(-4)}`
const networkFee: Record<string, number> = { Arbitrum: 0.12, Base: 0.08, Ethereum: 4.8, TRC20: 1, ERC20: 4.8 }

function SourceIcon({ source }: { source: FundingSource }) {
  if (source.kind === 'exchange') return <Building2 size={20} />
  return <Wallet size={20} />
}

function SourceCard({ source, mode, onAction, onRemove }: { source: FundingSource; mode: 'deposit' | 'withdraw'; onAction: () => void; onRemove: () => void }) {
  return (
    <Card className="group relative !p-0">
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className={`grid size-11 shrink-0 place-items-center rounded-xl ${source.kind === 'exchange' ? 'bg-violet-50 text-violet-700' : 'bg-blue-50 text-blue-700'}`}>
              <SourceIcon source={source} />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-bold text-[var(--trigonum-ink)]">{source.name}</p>
                {source.verified && <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700"><BadgeCheck size={11} /> Подтверждён</span>}
              </div>
              <p className="mt-0.5 text-xs text-[var(--trigonum-muted)]">{source.detail}</p>
            </div>
          </div>
          <button type="button" onClick={onRemove} className="rounded-lg p-1.5 text-[var(--trigonum-muted)] opacity-0 transition hover:bg-rose-50 hover:text-rose-600 group-hover:opacity-100" title="Отключить источник"><Unplug size={15} /></button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-[var(--trigonum-bg)] p-3">
          <div><p className="text-[10px] font-bold uppercase tracking-wide text-[var(--trigonum-muted)]">Доступно</p><p className="mt-1 text-lg font-black">{formatCurrency(source.balance)}</p></div>
          <div><p className="text-[10px] font-bold uppercase tracking-wide text-[var(--trigonum-muted)]">Актив / сети</p><p className="mt-1 text-sm font-bold">{source.asset}</p><p className="mt-0.5 text-[10px] text-[var(--trigonum-muted)]">{source.networks.slice(0, 2).join(' · ')}</p></div>
        </div>

        {source.kind === 'exchange' && source.permissions && (
          <div className="mt-3 flex flex-wrap gap-1.5">{source.permissions.map((permission) => <span key={permission} className="rounded-md border border-[var(--trigonum-border)] bg-white px-2 py-1 text-[10px] font-semibold text-[var(--trigonum-muted)]">{permission}</span>)}</div>
        )}
      </div>
      <button type="button" onClick={onAction} className={`flex w-full items-center justify-between border-t border-[var(--trigonum-border)] px-4 py-3 text-sm font-bold transition ${mode === 'deposit' ? 'text-blue-700 hover:bg-blue-50' : 'text-violet-700 hover:bg-violet-50'}`}>
        <span className="flex items-center gap-2">{mode === 'deposit' ? <ArrowDownToLine size={16} /> : <ArrowUpFromLine size={16} />}{mode === 'deposit' ? `Пополнить с ${source.name}` : `Вывести на ${source.name}`}</span><ChevronRight size={16} />
      </button>
    </Card>
  )
}

export function PersonalFundingPage({ mode }: { mode: 'deposit' | 'withdraw' }) {
  const { activeAccount } = useBrokerAccount()
  const { getAccountState, addSource, removeSource, recordDeposit, recordWithdrawal } = useFunding()
  const state = getAccountState(activeAccount.id)
  const [flow, setFlow] = useState<Flow>(null)
  const [amount, setAmount] = useState(10_000)
  const [network, setNetwork] = useState('Arbitrum')
  const [asset, setAsset] = useState('USDT')
  const [exchange, setExchange] = useState('Bybit')
  const [apiKey, setApiKey] = useState('')
  const [apiSecret, setApiSecret] = useState('')
  const [manualAddress, setManualAddress] = useState('')
  const [manualName, setManualName] = useState('Ledger Vault')
  const [step, setStep] = useState<'form' | 'processing' | 'success'>('form')
  const [message, setMessage] = useState('')

  const withdrawable = Math.max(0, state.brokerBalance - state.lockedEvents - state.pendingSettlement)
  const externalCapital = state.sources.reduce((sum, source) => sum + source.balance, 0)
  const history = useMemo(() => state.transactions.filter((tx) => tx.type === (mode === 'deposit' ? 'deposit' : 'withdrawal')), [state.transactions, mode])

  const resetFlow = () => {
    setFlow(null)
    setAmount(10_000)
    setNetwork('Arbitrum')
    setAsset('USDT')
    setStep('form')
    setMessage('')
    setApiKey('')
    setApiSecret('')
  }

  const connectBrowserWallet = async () => {
    setMessage('')
    const ethereum = (window as Window & { ethereum?: { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> } }).ethereum
    if (!ethereum) {
      setMessage('Browser wallet не найден. Установите MetaMask/Rabby или используйте WalletConnect.')
      return
    }
    try {
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' }) as string[]
      const address = accounts[0]
      if (!address) throw new Error('Wallet address missing')
      const text = `Подтверждаю подключение кошелька ${address} к аккаунту Trigonum Broker ${activeAccount.accountNumber}`
      try {
        await ethereum.request({ method: 'personal_sign', params: [text, address] })
      } catch {
        setMessage('Кошелёк подключён, но подпись владения не подтверждена.')
      }
      addSource(activeAccount.id, {
        id: `wallet-${address.toLowerCase()}`,
        kind: 'wallet',
        connection: 'browser-wallet',
        name: 'Browser Wallet',
        detail: shortAddress(address),
        address,
        asset: 'USDT',
        balance: 12_850,
        networks: ['Arbitrum', 'Ethereum', 'Base'],
        verified: true,
        lastUsed: new Date().toISOString(),
      })
      resetFlow()
    } catch {
      setMessage('Подключение отменено в кошельке.')
    }
  }

  const connectWalletConnect = () => {
    addSource(activeAccount.id, {
      id: 'wallet-wc-demo',
      kind: 'wallet',
      connection: 'walletconnect',
      name: 'WalletConnect',
      detail: '0x5C91…88F2',
      address: '0x5C91B12A7F932671242C11B20755B9094C1188F2',
      asset: 'USDT',
      balance: 21_300,
      networks: ['Arbitrum', 'Base', 'Ethereum'],
      verified: true,
      lastUsed: new Date().toISOString(),
    })
    resetFlow()
  }

  const connectExchange = () => {
    if (!apiKey.trim() || !apiSecret.trim()) {
      setMessage('Введите API Key и API Secret.')
      return
    }
    addSource(activeAccount.id, {
      id: `exchange-${exchange.toLowerCase()}`,
      kind: 'exchange',
      connection: 'exchange-api',
      name: exchange,
      detail: exchange === 'Bybit' ? 'UID 483••••91' : 'UID 71••••284',
      uid: exchange === 'Bybit' ? '4837712591' : '71248284',
      asset: 'USDT',
      balance: exchange === 'Bybit' ? 42_580 : 31_250,
      networks: ['Arbitrum', 'TRC20', 'ERC20'],
      verified: true,
      lastUsed: new Date().toISOString(),
      permissions: ['Баланс', 'История операций'],
    })
    resetFlow()
  }

  const addManual = () => {
    if (manualAddress.length < 8) {
      setMessage('Введите корректный адрес.')
      return
    }
    addSource(activeAccount.id, {
      id: `address-${manualAddress.toLowerCase()}`,
      kind: 'address',
      connection: 'manual',
      name: manualName || 'Внешний кошелёк',
      detail: shortAddress(manualAddress),
      address: manualAddress,
      asset: 'USDT',
      balance: 0,
      networks: [network],
      verified: true,
      lastUsed: new Date().toISOString(),
      cooldownUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    })
    resetFlow()
  }

  const executeTransfer = () => {
    if (!flow || !('source' in flow)) return
    const source = flow.source
    const limit = mode === 'deposit' ? source.balance : withdrawable
    if (amount <= 0 || amount > limit) {
      setMessage(`Максимально доступно ${formatCurrency(limit)}.`)
      return
    }
    setStep('processing')
    setMessage('')
    window.setTimeout(() => {
      const tx = {
        id: `${mode}-${Date.now()}`,
        date: new Date().toISOString(),
        type: mode,
        source: source.name,
        asset,
        network,
        amount: mode === 'deposit' ? amount : -amount,
        status: 'completed' as const,
        txHash: `0x${Math.random().toString(16).slice(2, 10)}…${Math.random().toString(16).slice(2, 6)}`,
      }
      if (mode === 'deposit') recordDeposit(activeAccount.id, tx)
      else recordWithdrawal(activeAccount.id, tx)
      setStep('success')
    }, 900)
  }

  const modalTitle = flow?.kind === 'connect' ? 'Подключить кошелёк' : flow?.kind === 'exchange' ? 'Подключить биржу' : flow?.kind === 'manual' ? 'Добавить адрес' : flow && 'source' in flow ? (mode === 'deposit' ? `Пополнить с ${flow.source.name}` : `Вывести на ${flow.source.name}`) : ''

  return (
    <div className="pb-10">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-[var(--trigonum-ink)]">{mode === 'deposit' ? 'Пополнить' : 'Вывести'}</h1><p className="mt-1 text-sm text-[var(--trigonum-muted)]">{mode === 'deposit' ? 'Переведите капитал с подключённого личного источника' : 'Выводите только на подтверждённые личные реквизиты'}</p></div>
        <div className="rounded-xl border border-blue-100 bg-blue-50 px-3 py-2"><p className="text-[10px] font-bold uppercase tracking-wide text-blue-700">Личный счёт</p><p className="text-sm font-bold">{activeAccount.name}</p><p className="text-[10px] text-[var(--trigonum-muted)]">{activeAccount.accountNumber}</p></div>
      </header>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><p className="text-[10px] font-bold uppercase tracking-wide text-[var(--trigonum-muted)]">Broker balance</p><p className="mt-2 text-2xl font-black">{formatCurrency(state.brokerBalance)}</p><p className="mt-1 text-xs text-[var(--trigonum-muted)]">На личном счёте Trigonum</p></Card>
        <Card><p className="text-[10px] font-bold uppercase tracking-wide text-[var(--trigonum-muted)]">Доступно к выводу</p><p className="mt-2 text-2xl font-black text-emerald-700">{formatCurrency(withdrawable)}</p><p className="mt-1 text-xs text-[var(--trigonum-muted)]">Свободный капитал</p></Card>
        <Card><p className="text-[10px] font-bold uppercase tracking-wide text-[var(--trigonum-muted)]">В активных Events</p><p className="mt-2 text-2xl font-black">{formatCurrency(state.lockedEvents)}</p><p className="mt-1 text-xs text-[var(--trigonum-muted)]">Заблокировано до закрытия</p></Card>
        <Card><p className="text-[10px] font-bold uppercase tracking-wide text-[var(--trigonum-muted)]">Внешние источники</p><p className="mt-2 text-2xl font-black">{formatCurrency(externalCapital)}</p><p className="mt-1 text-xs text-[var(--trigonum-muted)]">Только для информации</p></Card>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <div><h2 className="text-lg font-bold">{mode === 'deposit' ? 'Ваши источники капитала' : 'Куда вывести'}</h2><p className="text-sm text-[var(--trigonum-muted)]">Кошельки и биржи принадлежат только этому личному аккаунту.</p></div>
        <div className="flex flex-wrap gap-2"><button type="button" onClick={() => setFlow({ kind: 'connect' })} className="inline-flex items-center gap-2 rounded-xl bg-[var(--trigonum-ink)] px-3 py-2 text-sm font-bold text-white"><Plus size={15} /> Кошелёк</button><button type="button" onClick={() => setFlow({ kind: 'exchange' })} className="inline-flex items-center gap-2 rounded-xl border border-[var(--trigonum-border)] bg-white px-3 py-2 text-sm font-bold"><KeyRound size={15} /> Биржа API</button>{mode === 'withdraw' && <button type="button" onClick={() => setFlow({ kind: 'manual' })} className="inline-flex items-center gap-2 rounded-xl border border-[var(--trigonum-border)] bg-white px-3 py-2 text-sm font-bold"><Link2 size={15} /> Адрес</button>}</div>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">{state.sources.map((source) => <SourceCard key={source.id} source={source} mode={mode} onAction={() => { setNetwork(source.networks[0] ?? 'Arbitrum'); setAsset(source.asset); setAmount(Math.min(10_000, mode === 'deposit' ? source.balance : withdrawable)); setFlow({ kind: mode, source }); }} onRemove={() => removeSource(activeAccount.id, source.id)} />)}{state.sources.length === 0 && <button type="button" onClick={() => setFlow({ kind: 'connect' })} className="col-span-full flex min-h-44 flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--trigonum-border)] bg-white text-center"><Plus size={24} className="text-[var(--trigonum-blue)]" /><p className="mt-2 font-bold">Подключить первый источник</p><p className="mt-1 text-xs text-[var(--trigonum-muted)]">WalletConnect, browser wallet или биржа</p></button>}</div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <Card title={mode === 'deposit' ? 'Последние пополнения' : 'Последние выводы'}>
          <div className="overflow-x-auto"><table className="w-full min-w-[620px] text-sm"><thead><tr className="border-b border-[var(--trigonum-border)] text-left text-[10px] uppercase tracking-wide text-[var(--trigonum-muted)]"><th className="py-2">Дата</th><th>Источник</th><th>Сеть</th><th>Сумма</th><th className="text-right">Статус</th></tr></thead><tbody>{history.map((tx) => <tr key={tx.id} className="border-b border-[var(--trigonum-border)] last:border-0"><td className="py-3">{formatDateTime(tx.date)}</td><td>{tx.source}</td><td>{tx.asset} · {tx.network}</td><td className="font-bold">{formatCurrency(Math.abs(tx.amount))}</td><td className="text-right font-semibold text-emerald-700">{tx.status === 'completed' ? 'Выполнено' : 'В обработке'}</td></tr>)}</tbody></table></div>
        </Card>
        <Card title="Как защищены средства"><div className="space-y-3 text-sm"><p className="flex gap-2"><ShieldCheck size={17} className="mt-0.5 shrink-0 text-emerald-600" />Кошелёк подтверждается криптографической подписью.</p><p className="flex gap-2"><KeyRound size={17} className="mt-0.5 shrink-0 text-blue-600" />Для биржи используются только read-only разрешения. API Secret в прототипе не сохраняется.</p><p className="flex gap-2"><CircleDollarSign size={17} className="mt-0.5 shrink-0 text-violet-600" />Капитал в активных Events недоступен к выводу до расчёта Event.</p></div></Card>
      </div>

      <Modal open={!!flow} onClose={resetFlow} title={modalTitle} subtitle={flow?.kind === 'connect' ? 'Подтвердите владение кошельком' : undefined}>
        {flow?.kind === 'connect' && <div className="space-y-3"><button type="button" onClick={connectBrowserWallet} className="flex w-full items-center justify-between rounded-xl border border-[var(--trigonum-border)] p-4 text-left hover:border-blue-300 hover:bg-blue-50"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-blue-50 text-blue-700"><Wallet size={20} /></span><div><p className="font-bold">MetaMask / Rabby</p><p className="text-xs text-[var(--trigonum-muted)]">Подключить browser wallet и подписать сообщение</p></div></div><ChevronRight size={17} /></button><button type="button" onClick={connectWalletConnect} className="flex w-full items-center justify-between rounded-xl border border-[var(--trigonum-border)] p-4 text-left hover:border-violet-300 hover:bg-violet-50"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-violet-50 text-violet-700"><Link2 size={20} /></span><div><p className="font-bold">WalletConnect</p><p className="text-xs text-[var(--trigonum-muted)]">Trust Wallet, Ledger Live и другие приложения</p></div></div><ChevronRight size={17} /></button><div className="rounded-xl bg-[var(--trigonum-bg)] p-3 text-xs leading-5 text-[var(--trigonum-muted)]">Подпись не создаёт транзакцию и не даёт Trigonum права распоряжаться средствами кошелька.</div>{message && <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">{message}</p>}</div>}

        {flow?.kind === 'exchange' && <div className="space-y-4"><div className="grid grid-cols-2 gap-2">{['Bybit', 'OKX'].map((name) => <button key={name} type="button" onClick={() => setExchange(name)} className={`rounded-xl border px-3 py-3 text-sm font-bold ${exchange === name ? 'border-violet-300 bg-violet-50 text-violet-800' : 'border-[var(--trigonum-border)]'}`}>{name}</button>)}</div><label className="block"><span className="text-xs font-bold">API Key</span><input value={apiKey} onChange={(e) => setApiKey(e.target.value)} className="mt-1 w-full rounded-xl border border-[var(--trigonum-border)] px-3 py-2.5 outline-none focus:border-blue-400" placeholder="Введите API Key" /></label><label className="block"><span className="text-xs font-bold">API Secret</span><input type="password" value={apiSecret} onChange={(e) => setApiSecret(e.target.value)} className="mt-1 w-full rounded-xl border border-[var(--trigonum-border)] px-3 py-2.5 outline-none focus:border-blue-400" placeholder="••••••••••••" /></label><div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-xs leading-5 text-emerald-900"><b>Нужны только:</b> чтение баланса и истории операций. Торговые и withdrawal permissions не требуются.</div>{message && <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">{message}</p>}<button type="button" onClick={connectExchange} className="w-full rounded-xl bg-[var(--trigonum-ink)] px-4 py-3 text-sm font-bold text-white">Проверить и подключить {exchange}</button></div>}

        {flow?.kind === 'manual' && <div className="space-y-4"><label className="block"><span className="text-xs font-bold">Название</span><input value={manualName} onChange={(e) => setManualName(e.target.value)} className="mt-1 w-full rounded-xl border border-[var(--trigonum-border)] px-3 py-2.5" /></label><label className="block"><span className="text-xs font-bold">Адрес</span><input value={manualAddress} onChange={(e) => setManualAddress(e.target.value)} className="mt-1 w-full rounded-xl border border-[var(--trigonum-border)] px-3 py-2.5 font-mono text-xs" placeholder="0x..." /></label><label className="block"><span className="text-xs font-bold">Сеть</span><select value={network} onChange={(e) => setNetwork(e.target.value)} className="mt-1 w-full rounded-xl border border-[var(--trigonum-border)] px-3 py-2.5"><option>Arbitrum</option><option>Ethereum</option><option>Base</option><option>TRC20</option></select></label><div className="rounded-xl border border-amber-100 bg-amber-50 p-3 text-xs leading-5 text-amber-900">Новый ручной адрес получает 24-часовой security cooldown перед первым выводом.</div>{message && <p className="text-xs text-rose-700">{message}</p>}<button type="button" onClick={addManual} className="w-full rounded-xl bg-[var(--trigonum-ink)] px-4 py-3 text-sm font-bold text-white">Добавить адрес</button></div>}

        {flow && 'source' in flow && step === 'form' && <div className="space-y-4"><div className="flex items-center gap-3 rounded-xl bg-[var(--trigonum-bg)] p-3"><span className="grid size-10 place-items-center rounded-xl bg-white"><SourceIcon source={flow.source} /></span><div><p className="font-bold">{flow.source.name}</p><p className="text-xs text-[var(--trigonum-muted)]">{flow.source.detail}</p></div></div><div className="grid grid-cols-2 gap-3"><label><span className="text-xs font-bold">Актив</span><select value={asset} onChange={(e) => setAsset(e.target.value)} className="mt-1 w-full rounded-xl border border-[var(--trigonum-border)] px-3 py-2.5"><option>USDT</option><option>USDC</option></select></label><label><span className="text-xs font-bold">Сеть</span><select value={network} onChange={(e) => setNetwork(e.target.value)} className="mt-1 w-full rounded-xl border border-[var(--trigonum-border)] px-3 py-2.5">{flow.source.networks.map((item) => <option key={item}>{item}</option>)}</select></label></div><label className="block"><div className="flex justify-between text-xs"><b>Сумма</b><span className="text-[var(--trigonum-muted)]">Макс. {formatCurrency(mode === 'deposit' ? flow.source.balance : withdrawable)}</span></div><div className="mt-1 flex items-center rounded-xl border border-[var(--trigonum-border)] px-3"><span className="font-bold text-[var(--trigonum-muted)]">$</span><input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="w-full bg-transparent px-2 py-2.5 text-xl font-black outline-none" /></div></label><div className="grid grid-cols-2 gap-3 rounded-xl bg-[var(--trigonum-bg)] p-3 text-sm"><div><p className="text-[10px] uppercase text-[var(--trigonum-muted)]">Комиссия сети</p><b>≈ {formatCurrency(networkFee[network] ?? 1, true)}</b></div><div><p className="text-[10px] uppercase text-[var(--trigonum-muted)]">Будет {mode === 'deposit' ? 'зачислено' : 'получено'}</p><b>{formatCurrency(Math.max(0, amount - (networkFee[network] ?? 1)), true)}</b></div></div>{flow.source.kind === 'exchange' && mode === 'deposit' && <div className="rounded-xl border border-blue-100 bg-blue-50 p-3 text-xs leading-5 text-blue-900">Trigonum покажет депозитные реквизиты и автоматически обнаружит перевод. Вывод с биржи подтверждается в приложении {flow.source.name}; API не имеет withdrawal permission.</div>}{message && <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">{message}</p>}<button type="button" onClick={executeTransfer} className={`w-full rounded-xl px-4 py-3 text-sm font-black text-white ${mode === 'deposit' ? 'bg-blue-600' : 'bg-violet-600'}`}>{mode === 'deposit' ? `Пополнить ${formatCurrency(amount)}` : `Вывести ${formatCurrency(amount)}`}</button></div>}

        {flow && 'source' in flow && step === 'processing' && <div className="py-8 text-center"><RefreshCcw size={30} className="mx-auto animate-spin text-[var(--trigonum-blue)]" /><p className="mt-4 text-lg font-bold">Операция отправлена</p><div className="mx-auto mt-5 max-w-xs space-y-2 text-left text-sm"><p className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-600" /> Транзакция создана</p><p className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-600" /> Отправлена в сеть</p><p className="flex items-center gap-2 text-blue-700"><RefreshCcw size={16} /> Ожидаем подтверждения</p></div></div>}

        {flow && 'source' in flow && step === 'success' && <div className="py-7 text-center"><span className="mx-auto grid size-14 place-items-center rounded-full bg-emerald-50 text-emerald-700"><CheckCircle2 size={30} /></span><p className="mt-4 text-xl font-black">{mode === 'deposit' ? 'Средства зачислены' : 'Вывод отправлен'}</p><p className="mt-2 text-3xl font-black text-emerald-700">{formatCurrency(amount)}</p><p className="mt-2 text-sm text-[var(--trigonum-muted)]">{asset} · {network}</p><button type="button" onClick={resetFlow} className="mt-6 w-full rounded-xl bg-[var(--trigonum-ink)] px-4 py-3 text-sm font-bold text-white">Готово</button></div>}
      </Modal>
    </div>
  )
}
