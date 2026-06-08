export type InfoPageId =
  | 'help'
  | 'how-it-works'
  | 'about'
  | 'license';

export interface InfoPageConfig {
  id: InfoPageId;
  path: string;
  titleKey: string;
  bodyKeys: string[];
}

export const INFO_PAGES: Record<InfoPageId, InfoPageConfig> = {
  help: {
    id: 'help',
    path: '/help',
    titleKey: 'infoHelpTitle',
    bodyKeys: ['infoHelpP1', 'infoHelpP2', 'infoHelpP3'],
  },
  'how-it-works': {
    id: 'how-it-works',
    path: '/how-it-works',
    titleKey: 'infoHowTitle',
    bodyKeys: ['infoHowP1', 'infoHowP2', 'infoHowP3', 'infoHowP4'],
  },
  about: {
    id: 'about',
    path: '/about',
    titleKey: 'infoAboutTitle',
    bodyKeys: ['infoAboutP1', 'infoAboutP2', 'infoAboutP3'],
  },
  license: {
    id: 'license',
    path: '/license',
    titleKey: 'infoLicenseTitle',
    bodyKeys: [],
  },
};
