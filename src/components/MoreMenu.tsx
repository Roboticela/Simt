import { useRef, useState } from 'react';
import { useDismissOnOutsideClick } from '../hooks/useDismissOnOutsideClick';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  HelpCircle,
  BookOpen,
  Info,
  GitBranch,
  Scale,
  LifeBuoy,
  Shield,
  FileText,
  ExternalLink,
  type LucideIcon,
} from 'lucide-react';
import { useLang } from '../contexts/LanguageContext';
import { t } from '../lib/i18n';
import { SITE } from '../lib/site';
import { INFO_PAGES } from '../lib/infoPages';

type MenuItem =
  | { kind: 'route'; path: string; labelKey: string; icon: LucideIcon }
  | { kind: 'external'; href: string; labelKey: string; icon: LucideIcon };

const MENU_ITEMS: MenuItem[] = [
  { kind: 'route', path: INFO_PAGES.help.path, labelKey: 'menuHelp', icon: HelpCircle },
  { kind: 'route', path: INFO_PAGES['how-it-works'].path, labelKey: 'menuHowItWorks', icon: BookOpen },
  { kind: 'route', path: INFO_PAGES.about.path, labelKey: 'menuAbout', icon: Info },
  { kind: 'external', href: SITE.github, labelKey: 'menuGithub', icon: GitBranch },
  { kind: 'route', path: INFO_PAGES.license.path, labelKey: 'menuLicense', icon: Scale },
  { kind: 'external', href: SITE.supportUrl, labelKey: 'menuSupport', icon: LifeBuoy },
  { kind: 'external', href: SITE.privacyUrl, labelKey: 'menuPrivacy', icon: Shield },
  { kind: 'external', href: SITE.termsUrl, labelKey: 'menuTerms', icon: FileText },
];

interface Props {
  /** Drop panel opens above the button (sidebar) or below (top bar). */
  placement?: 'above' | 'below';
  className?: string;
  /** Show label beside the menu icon (matches lang/theme buttons). */
  showLabel?: boolean;
}

export function MoreMenu({ placement = 'below', className, showLabel = false }: Props) {
  const { lang } = useLang();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useDismissOnOutsideClick(rootRef, open, () => setOpen(false));

  function onItemClick(item: MenuItem) {
    setOpen(false);
    if (item.kind === 'route') navigate(item.path);
    else window.open(item.href, '_blank', 'noopener,noreferrer');
  }

  const panelPosition =
    placement === 'above'
      ? 'absolute bottom-full end-0 z-50 min-w-[13rem] pb-2'
      : 'absolute end-0 top-full z-50 min-w-[13rem] pt-2';

  return (
    <div ref={rootRef} className={['relative', className ?? ''].join(' ')}>
      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={t(lang, 'menuMore')}
        className={[
          'inline-flex items-center rounded-2xl border text-xs font-bold transition-colors',
          showLabel ? 'gap-1.5 px-3 py-2' : 'h-10 w-10 justify-center',
          open
            ? 'border-primary/50 bg-primary/10 text-primary'
            : 'border-border/60 bg-accent/40 text-foreground/70 hover:border-primary/30 hover:bg-accent hover:text-foreground',
        ].join(' ')}
      >
        <Menu className={showLabel ? 'h-4 w-4' : 'h-5 w-5'} />
        {showLabel && <span className="truncate">{t(lang, 'menuMore')}</span>}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            key="more-menu"
            role="menu"
            initial={{ opacity: 0, y: placement === 'below' ? -8 : 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: placement === 'below' ? -8 : 8, scale: 0.95 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className={panelPosition}
          >
            <div
              className="overflow-hidden rounded-2xl border border-primary/20 bg-card/95 shadow-xl backdrop-blur-xl"
              onMouseDown={(e) => e.stopPropagation()}
            >
            <div className="h-0.5 w-full bg-gradient-to-r from-primary to-tertiary" />
            <div className="max-h-[min(70vh,24rem)] space-y-0.5 overflow-y-auto p-1.5 custom-scrollbar">
              {MENU_ITEMS.map((item, i) => {
                const Icon = item.icon;
                const external = item.kind === 'external';
                return (
                  <motion.button
                    key={item.labelKey}
                    type="button"
                    role="menuitem"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      onItemClick(item);
                    }}
                    initial={{ opacity: 0, x: 6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.14, delay: i * 0.03 }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-start text-sm font-semibold text-foreground/75 transition-colors hover:bg-accent/70 hover:text-foreground"
                  >
                    <Icon className="h-4 w-4 shrink-0 text-primary" />
                    <span className="flex-1">{t(lang, item.labelKey)}</span>
                    {external && <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-45" />}
                  </motion.button>
                );
              })}
            </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
