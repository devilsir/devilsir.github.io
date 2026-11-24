export const reference = 'ATGGAACTGTTTCCTGGCTATTAA';
export const intron = 'GUACAG';
export const baseColors = { A: '#73e5bb', T: '#f39f9d', C: '#75c5fa', G: '#f1cc80', U: '#d99aef' };
export const complements = { A: 'T', T: 'A', G: 'C', C: 'G' };
const codeOrder = 'UCAG';
const standardCode = 'FFLLSSSSYY**CC*WLLLLPPPPHHQQRRRRIIIMTTTTNNKKSSRRVVVVAAAADDEEGGGG';
export const codons = {};
for (const first of codeOrder) for (const second of codeOrder) for (const third of codeOrder) {
  const index = 16 * codeOrder.indexOf(first) + 4 * codeOrder.indexOf(second) + codeOrder.indexOf(third);
  codons[first + second + third] = standardCode[index];
}

export const aminoNames = {
  F: 'Fenilalanina', L: 'Leucina', S: 'Serina', Y: 'Tirosina', C: 'Cisteína', W: 'Triptofano',
  P: 'Prolina', H: 'Histidina', Q: 'Glutamina', R: 'Arginina', I: 'Isoleucina', M: 'Metionina',
  T: 'Treonina', N: 'Asparagina', K: 'Lisina', V: 'Valina', A: 'Alanina', D: 'Aspartato',
  E: 'Glutamato', G: 'Glicina', '*': 'Parada'
};

export const transcribe = dna => dna.replaceAll('T', 'U');

export function translate(dna) {
  const rna = transcribe(dna);
  const start = rna.indexOf('AUG');
  const entries = [];
  const protein = [];
  let stop = -1;
  if (start < 0) return { rna, start, entries, protein, stop, remaining: rna };
  for (let i = start; i < rna.length; i += 3) {
    const codon = rna.slice(i, i + 3);
    const amino = codons[codon];
    if (!amino) break;
    entries.push({ index: i, codon, amino });
    if (amino === '*') { stop = i; break; }
    protein.push(amino);
  }
  return { rna, start, entries, protein, stop, remaining: rna.slice(start + entries.length * 3) };
}

const original = translate(reference);

export function classify(dna) {
  if (dna === reference) return ['Sequência de referência', 'Edite uma base da fita codificante para comparar DNA, mRNA e proteína.'];
  const result = translate(dna);
  if ((reference.length - dna.length) % 3 !== 0) return ['Frameshift', 'A deleção desloca o quadro de leitura a partir da alteração. O ribossomo passa a ler outros grupos de três bases.'];
  if (result.start !== original.start) return ['Alteração do início', result.start < 0 ? 'Sem AUG neste trecho, a tradução didática não inicia.' : 'O primeiro AUG mudou de posição, alterando o local de início da tradução.'];
  if (result.stop >= 0 && result.stop < original.stop) return ['Nonsense', 'O ribossomo encontrou um códon de parada prematuro. A cadeia produzida é mais curta.'];
  if (result.stop !== original.stop && dna.length === reference.length) return ['Perda do códon de parada', 'O códon final passou a codificar um aminoácido. Neste trecho, não há mais um sinal de término na posição original.'];
  if (result.protein.join('') === original.protein.join('')) return ['Mutação silenciosa', 'Mudou a sequência de bases, mas os códons traduzidos especificam a mesma sequência de aminoácidos.'];
  if (dna.length !== reference.length) return ['Deleção em fase', 'O número total de bases removidas é múltiplo de três. O quadro global está em fase, embora códons e aminoácidos possam ter mudado.'];
  return ['Missense', 'A substituição mudou o aminoácido especificado pelo códon.'];
}