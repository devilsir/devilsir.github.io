import { node } from './ui.js?v=9';

export function insectReference(figure) {
  return node('figure', { className: 'card insect-reference' },
    node('img', { src: figure.image, alt: figure.title, loading: 'lazy' }),
    node('figcaption', {},
      node('strong', {}, figure.title),
      node('p', {},
        node('a', { href: figure.source, target: '_blank', rel: 'noopener noreferrer' }, figure.credit),
        ' · ',
        node('a', { href: figure.license, target: '_blank', rel: 'noopener noreferrer' }, 'CC BY 4.0')
      )
    )
  );
}
