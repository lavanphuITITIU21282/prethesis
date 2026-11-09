// Shared SVG paths keep navigation icons consistent across React components.
export const iconPaths: Record<string, string> = {
  home: 'M3 10l9-7 9 7v10H3z M9 20v-7h6v7',
  book: 'M3 4h6c2 0 3 1 3 3v14c0-2-2-3-4-3H3z M21 4h-6c-2 0-3 1-3 3v14c0-2 2-3 4-3h5z',
  cards: 'M7 3h13v15H7z M4 7H2v15h13v-2',
  quiz: 'M9 4H4v16h16V4h-5 M9 3h6v4H9z M8 12l2 2 5-5 M8 17h8',
  terminal: 'M4 5h16v14H4z M7 9l3 3-3 3 M13 15h4',
  chart: 'M4 3v17h17 M8 15v-4 M13 15V7 M18 15v-8',
  folder: 'M3 6h7l2 3h9v11H3z',
  shield: 'M12 3l8 3v5c0 5-3 8-8 11-5-3-8-6-8-11V6z M8 12l3 3 5-6',
  key: 'M9 15a6 6 0 1 1 4-4l-8 9H2v-3l2-2h3z',
  lock: 'M5 10h14v11H5z M8 10V7a4 4 0 0 1 8 0v3',
  fingerprint:
    'M5 12a7 7 0 0 1 14 0 M8 12a4 4 0 0 1 8 0v4 M11 20c2-3 1-6 1-9 M4 15v3 M7 16l-1 5 M18 8l2 1 M16 20l1-2',
  network: 'M9 2h6v6H9z M2 16h6v6H2z M16 16h6v6h-6z M12 8v5 M5 16v-3h14v3',
  leaf: 'M20 3C7 2 2 7 5 16c8 4 15-2 15-13z M3 21l11-12',
  arrow: 'M4 12h16 M15 7l5 5-5 5',
  check: 'M5 12l4 4L19 6',
  clock: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18 M12 7v6h4',
  flask: 'M9 3h6 M10 3v7L4 20h16l-6-10V3 M7 15h10',
};
