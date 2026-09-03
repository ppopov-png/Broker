import { Globe2, LockKeyhole, ShieldCheck, UsersRound } from 'lucide-react'
import { useI18n } from '../i18n/I18nProvider'

export function ValueStrip() {
  const { t } = useI18n()
  const items = [
    { icon: ShieldCheck, title: t('value.transparency'), text: t('value.transparencyText') },
    { icon: UsersRound, title: t('value.client'), text: t('value.clientText') },
    { icon: LockKeyhole, title: t('value.tech'), text: t('value.techText') },
    { icon: Globe2, title: t('value.global'), text: t('value.globalText') },
  ]

  return (
    <section className="value-strip" id="how">
      {items.map(({ icon: Icon, title, text }) => (
        <article className="value-item" key={title}>
          <Icon strokeWidth={1.8} />
          <div><h3>{title}</h3><p>{text}</p></div>
        </article>
      ))}
    </section>
  )
}
