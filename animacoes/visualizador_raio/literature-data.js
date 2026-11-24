// Raios em picômetros. Os índices dos vetores covalentes seguem o número atômico.
radiusLab.literatureRadii = {
  // Z = 1–96. Cordero et al. (2008), tabela 2. C sp³ e Mn/Fe/Co em spin alto.
  // https://doi.org/10.1039/B801115J
  cordero: [
    31, 28, 128, 96, 84, 76, 71, 66, 57, 58, 166, 141,
    121, 111, 107, 105, 102, 106, 203, 176, 170, 160, 153, 139,
    161, 152, 150, 124, 132, 122, 122, 120, 119, 120, 120, 116,
    220, 195, 190, 175, 164, 154, 147, 146, 142, 139, 145, 144,
    142, 139, 139, 138, 139, 140, 244, 215, 207, 204, 203, 201,
    199, 198, 198, 196, 194, 192, 192, 189, 190, 187, 187, 175,
    170, 162, 151, 144, 141, 136, 136, 132, 145, 146, 148, 140,
    150, 150, 260, 221, 215, 206, 200, 196, 190, 187, 180, 169,
  ],
  // Z = 97–118. Pyykkö e Atsumi (2009), figura 2, ligação simples.
  // https://doi.org/10.1002/chem.200800987
  pyykko: [
    168, 168, 165, 167, 173, 176, 161, 157, 149, 143, 141,
    134, 129, 128, 121, 122, 136, 143, 162, 175, 165, 157,
  ],
  // Carga, NC, raio em pm, publicação e contexto opcional. Nulo marca dado indisponível.
  // Na²⁺: máximo externo de 2s (0,598 a₀), Al-Sharaa et al. (2026), tabela 1.
  // Na⁶⁺: distância média de 2p (0,58347 a₀), Al-Kazrajy e Al-Khafaji (2023), tabela 4.
  // Cl²⁻: relato contestado, sem raio. https://doi.org/10.1038/211963c0
  // Hawthorne e Gagné (2024), tabela 2. https://pmc.ncbi.nlm.nih.gov/articles/PMC11301896/#yv5019table2
  // Pauling (1927), tabela II. https://doi.org/10.1021/ja01402a019
  // Dawes et al. (1989), raios mínimos de Na⁻ a partir dos contatos no cristal. https://doi.org/10.1021/ic00310a023
  // Lang e Smith (2010), tabela 1. https://doi.org/10.1039/C0DT00401D
  // Rahm et al. (2016), tabelas S2–S3. Medidas para íons isolados. https://rahmlab.com/radii-of-the-elements/
  // David (1986), tabela 1, estimativas para actinídeos trivalentes em NC 6. https://doi.org/10.1016/0022-5088(86)90511-4
  // Previsões para superpesados: Bilewicz (2000), Ionova (2002, tabela 1), Pershina (2014, tabela 6),
  // Fricke (1975, tabela 5) e Keller et al. (1974).
  ions: {
    H: [
      [-1, null, 139.9, "lang"],
      [1, 2, 0.4, "hawthorne"],
      [1, 3, 55, "hawthorne"],
      [1, 4, 86.6, "hawthorne"],
      [-2, null, null, "sommerfeld", "Diânion atômico"],
    ],
    He: [
      [1, null, 105, "rahm"],
      [-1, null, null, "metastable", "J = 5/2 · 345 ± 10 µs"],
    ],
    Li: [
      [1, 3, 54.7, "hawthorne"],
      [1, 5, 74.2, "hawthorne"],
      [1, 7, 96.5, "hawthorne"],
    ],
    Be: [
      [1, null, 181, "rahm"],
      [-1, null, null, "metastable", "J = 3/2 · 42,07 ± 0,12 µs"],
    ],
    B: [
      [1, null, 176, "rahm"],
      [-1, null, 244, "rahm"],
    ],
    C: [
      [-4, null, 260, "pauling"],
      [1, null, 167, "rahm"],
      [-1, null, 223, "rahm"],
    ],
    N: [
      [-3, null, 147.2, "hawthorne"],
      [5, 4, 1.9, "hawthorne"],
      [1, null, 158, "rahm"],
    ],
    O: [
      [-2, null, 136.6, "hawthorne"],
      [1, null, 150, "rahm"],
      [-1, null, 203, "rahm"],
    ],
    F: [
      [-1, null, 130, "hawthorne"],
      [1, null, 144, "rahm"],
    ],
    Ne: [
      [1, null, 138, "rahm"],
    ],
    Na: [
      [1, 3, 94.1, "hawthorne"],
      [1, 10, 137.5, "hawthorne"],
      [1, null, 133, "rahm"],
      [-1, null, 220, "dawes", "Na⁺(C222)Na⁻"],
      [-1, null, 235, "dawes", "Cs⁺(18C6)₂Na⁻"],
      [-1, null, 260, "dawes", "Rb⁺(15C5)₂Na⁻"],
      [2, null, 31.6, "alSharaa", "Na III"],
      [6, null, 30.9, "alKazrajy", "Na VII"],
    ],
    Mg: [
      [1, null, 201, "rahm"],
    ],
    Al: [
      [1, null, 207, "rahm"],
      [-1, null, 273, "rahm"],
    ],
    Si: [
      [-4, null, 271, "pauling"],
      [1, null, 206, "rahm"],
      [-1, null, 263, "rahm"],
    ],
    P: [
      [-3, null, 212, "pauling"],
      [3, 3, 29, "hawthorne"],
      [1, null, 201, "rahm"],
      [-1, null, 251, "rahm"],
    ],
    S: [
      [4, 3, 16.3, "hawthorne"],
      [4, 4, 10.7, "hawthorne"],
      [1, null, 194, "rahm"],
      [-1, null, 240, "rahm"],
    ],
    Cl: [
      [-1, null, 174.3, "hawthorne"],
      [3, 2, 20.7, "hawthorne"],
      [3, 4, 86.7, "hawthorne"],
      [1, null, 188, "rahm"],
      [-1, null, 229, "rahm"],
      [4, 2, 17.05, "alsalman", "NOX +4"],
      [-2, null, null, "stuckey"],
    ],
    Ar: [
      [1, null, 181, "rahm"],
      [-1, null, null, "metastable", "J = 3/2 · 0,26 ± 0,03 µs"],
    ],
    K: [
      [1, 5, 143, "hawthorne"],
      [1, 11, 172.3, "hawthorne"],
      [1, 13, 178.3, "hawthorne"],
      [1, 14, 187.3, "hawthorne"],
      [1, 15, 181.6, "hawthorne"],
    ],
    Ca: [
      [2, 11, 124.8, "hawthorne"],
      [1, null, 230, "rahm"],
    ],
    Sc: [
      [3, 7, 79.7, "hawthorne"],
      [1, null, 225, "rahm"],
    ],
    Ti: [
      [3, 7, 74.2, "hawthorne"],
      [3, 8, 82.9, "hawthorne"],
      [4, 7, 69.8, "hawthorne"],
      [1, null, 191, "rahm"],
    ],
    V: [
      [1, null, 215, "rahm"],
    ],
    Cr: [
      [2, 4, 63.8, "hawthorne"],
      [2, 5, 74.7, "hawthorne"],
      [1, null, 185, "rahm"],
    ],
    Mn: [
      [3, 4, 53.5, "hawthorne"],
      [1, null, 206, "rahm"],
    ],
    Fe: [
      [2, 3, 47.8, "hawthorne"],
      [2, 5, 73.1, "hawthorne"],
      [1, null, 203, "rahm"],
    ],
    Co: [
      [2, 3, 48.8, "hawthorne"],
      [1, null, 178, "rahm"],
    ],
    Ni: [
      [2, 2, 32, "hawthorne"],
      [1, null, 176, "rahm"],
    ],
    Cu: [
      [1, 3, 60.3, "hawthorne"],
      [2, 8, 93.6, "hawthorne"],
      [3, 4, 48, "hawthorne"],
      [-1, null, 252, "rahm"],
    ],
    Zn: [
      [1, null, 192, "rahm"],
    ],
    Ga: [
      [1, null, 199, "rahm"],
      [-1, null, 268, "rahm"],
    ],
    Ge: [
      [-4, null, 272, "pauling"],
      [4, 5, 48.1, "hawthorne"],
      [1, null, 207, "rahm"],
      [-1, null, 265, "rahm"],
    ],
    As: [
      [-3, null, 222, "pauling"],
      [3, 3, 41, "hawthorne"],
      [3, 4, 66, "hawthorne"],
      [3, 5, 88.1, "hawthorne"],
      [3, 8, 111.4, "hawthorne"],
      [1, null, 208, "rahm"],
      [-1, null, 258, "rahm"],
    ],
    Se: [
      [4, 3, 32.5, "hawthorne"],
      [4, 4, 66.1, "hawthorne"],
      [4, 5, 87.1, "hawthorne"],
      [4, 7, 113.7, "hawthorne"],
      [4, 8, 116.4, "hawthorne"],
      [4, 9, 136.2, "hawthorne"],
      [4, 10, 151.6, "hawthorne"],
      [1, null, 205, "rahm"],
      [-1, null, 250, "rahm"],
    ],
    Br: [
      [5, 6, 91.5, "hawthorne"],
      [5, 7, 121.2, "hawthorne"],
      [5, 8, 130.5, "hawthorne"],
      [1, null, 201, "rahm"],
    ],
    Kr: [
      [1, null, 196, "rahm"],
    ],
    Rb: [
      [1, 4, 158.5, "hawthorne"],
      [1, 5, 149.8, "hawthorne"],
      [1, 13, 192.7, "hawthorne"],
      [1, 15, 197.2, "hawthorne"],
      [1, 17, 209, "hawthorne"],
      [1, 18, 211.2, "hawthorne"],
    ],
    Sr: [
      [2, 11, 143.2, "hawthorne"],
      [1, null, 237, "rahm"],
    ],
    Y: [
      [3, 10, 113, "hawthorne"],
      [3, 12, 117.5, "hawthorne"],
      [1, null, 255, "rahm"],
    ],
    Zr: [
      [4, 10, 91.7, "hawthorne"],
      [1, null, 235, "rahm"],
    ],
    Nb: [
      [5, 5, 56, "hawthorne"],
      [1, null, 230, "rahm"],
    ],
    Mo: [
      [5, 5, 55, "hawthorne"],
      [1, null, 207, "rahm"],
    ],
    Tc: [
      [1, null, 220, "rahm"],
    ],
    Ru: [
      [1, null, 201, "rahm"],
    ],
    Rh: [
      [1, null, 197, "rahm"],
    ],
    Pd: [
      [-1, null, 251, "rahm"],
    ],
    Ag: [
      [1, 3, 91.2, "hawthorne"],
      [1, 9, 133.8, "hawthorne"],
      [-1, null, 260, "rahm"],
    ],
    Cd: [
      [2, 9, 116.4, "hawthorne"],
      [1, null, 205, "rahm"],
    ],
    In: [
      [3, 7, 85.2, "hawthorne"],
      [1, null, 213, "rahm"],
      [-1, null, 277, "rahm"],
    ],
    Sn: [
      [-4, null, 294, "pauling"],
      [2, 3, 72.8, "hawthorne"],
      [2, 4, 91.5, "hawthorne"],
      [2, 5, 108.5, "hawthorne"],
      [2, 6, 114.2, "hawthorne"],
      [2, 7, 132.4, "hawthorne"],
      [2, 8, 134, "hawthorne"],
      [2, 9, 146.2, "hawthorne"],
      [1, null, 222, "rahm"],
      [-1, null, 278, "rahm"],
    ],
    Sb: [
      [-3, null, 245, "pauling"],
      [3, 3, 56.6, "hawthorne"],
      [3, 7, 112, "hawthorne"],
      [3, 8, 121.8, "hawthorne"],
      [3, 9, 139.2, "hawthorne"],
      [1, null, 225, "rahm"],
      [-1, null, 273, "rahm"],
    ],
    Te: [
      [4, 5, 88.5, "hawthorne"],
      [4, 7, 109.4, "hawthorne"],
      [4, 8, 122.8, "hawthorne"],
      [4, 9, 131.1, "hawthorne"],
      [4, 10, 146.7, "hawthorne"],
      [4, 11, 144.6, "hawthorne"],
      [4, 12, 156.2, "hawthorne"],
      [1, null, 223, "rahm"],
      [-1, null, 266, "rahm"],
    ],
    I: [
      [5, 7, 107.2, "hawthorne"],
      [5, 8, 122.1, "hawthorne"],
      [5, 9, 133.3, "hawthorne"],
      [1, null, 221, "rahm"],
    ],
    Xe: [
      [1, null, 217, "rahm"],
    ],
    Cs: [
      [1, 7, 182.7, "hawthorne"],
      [1, 13, 206, "hawthorne"],
      [1, 14, 207.8, "hawthorne"],
      [1, 15, 213.7, "hawthorne"],
      [1, 16, 218.4, "hawthorne"],
      [1, 17, 216.4, "hawthorne"],
      [1, 18, 220.4, "hawthorne"],
      [1, 20, 235.7, "hawthorne"],
    ],
    Ba: [
      [2, 13, 164.4, "hawthorne"],
      [2, 14, 171.4, "hawthorne"],
      [1, null, 250, "rahm"],
      [-1, null, null, "metastable", "J = 9/2 · cerca de 5 ms"],
    ],
    La: [
      [3, 11, 129.6, "hawthorne"],
      [1, null, 252, "rahm"],
    ],
    Ce: [
      [3, 11, 132, "hawthorne"],
      [4, 9, 102.7, "hawthorne"],
      [1, null, 227, "rahm"],
    ],
    Pr: [
      [3, 7, 107.5, "hawthorne"],
      [3, 10, 124.7, "hawthorne"],
      [3, 11, 132.2, "hawthorne"],
      [3, 12, 130.6, "hawthorne"],
      [1, null, 244, "rahm"],
    ],
    Nd: [
      [3, 7, 108.1, "hawthorne"],
      [3, 10, 121.9, "hawthorne"],
      [1, null, 242, "rahm"],
    ],
    Pm: [
      [1, null, 240, "rahm"],
    ],
    Sm: [
      [3, 10, 119.4, "hawthorne"],
      [1, null, 239, "rahm"],
    ],
    Eu: [
      [3, 10, 116.4, "hawthorne"],
      [1, null, 237, "rahm"],
    ],
    Gd: [
      [3, 10, 114.8, "hawthorne"],
      [3, 11, 126.1, "hawthorne"],
      [1, null, 241, "rahm"],
    ],
    Tb: [
      [3, 10, 114.7, "hawthorne"],
      [1, null, 235, "rahm"],
    ],
    Dy: [
      [3, 10, 111.6, "hawthorne"],
      [1, null, 233, "rahm"],
    ],
    Ho: [
      [3, 7, 97, "hawthorne"],
      [1, null, 232, "rahm"],
    ],
    Er: [
      [3, 10, 107, "hawthorne"],
      [1, null, 231, "rahm"],
    ],
    Tm: [
      [3, 7, 95.1, "hawthorne"],
      [3, 10, 106.4, "hawthorne"],
      [1, null, 230, "rahm"],
    ],
    Yb: [
      [3, 10, 105.5, "hawthorne"],
      [1, null, 237, "rahm"],
    ],
    Lu: [
      [3, 7, 92.9, "hawthorne"],
      [3, 10, 115, "hawthorne"],
      [1, null, 246, "rahm"],
    ],
    Hf: [
      [1, null, 239, "rahm"],
    ],
    Ta: [
      [1, null, 229, "rahm"],
    ],
    W: [
      [1, null, 225, "rahm"],
    ],
    Re: [
      [7, 5, 44.4, "hawthorne"],
      [1, null, 222, "rahm"],
    ],
    Os: [
      [7, 5, 45.9, "hawthorne"],
      [8, 5, 42.7, "hawthorne"],
      [8, 6, 51.9, "hawthorne"],
      [1, null, 218, "rahm"],
      [-1, null, 268, "rahm"],
    ],
    Ir: [
      [4, 4, 54.3, "hawthorne"],
      [1, null, 215, "rahm"],
      [-1, null, 263, "rahm"],
    ],
    Pt: [
      [1, null, 203, "rahm"],
      [-1, null, 255, "rahm"],
    ],
    Au: [
      [-1, null, 255, "rahm"],
    ],
    Hg: [
      [2, 5, 101.4, "hawthorne"],
      [2, 7, 113.9, "hawthorne"],
    ],
    Tl: [
      [1, 3, 115.1, "hawthorne"],
      [1, 4, 136, "hawthorne"],
      [1, 5, 147.4, "hawthorne"],
      [1, 7, 161, "hawthorne"],
      [1, 9, 162.5, "hawthorne"],
      [1, 10, 173.6, "hawthorne"],
      [1, 11, 176.8, "hawthorne"],
      [3, 7, 97, "hawthorne"],
      [-1, null, 273, "rahm"],
    ],
    Pb: [
      [2, 3, 84.4, "hawthorne"],
      [2, 5, 111.6, "hawthorne"],
      [1, null, 222, "rahm"],
      [-1, null, 280, "rahm"],
    ],
    Bi: [
      [3, 3, 70.3, "hawthorne"],
      [3, 4, 84.6, "hawthorne"],
      [3, 7, 113.1, "hawthorne"],
      [3, 9, 123.8, "hawthorne"],
      [3, 10, 130.4, "hawthorne"],
      [3, 12, 130.5, "hawthorne"],
      [5, 4, 61.3, "hawthorne"],
      [1, null, 227, "rahm"],
      [-1, null, 279, "rahm"],
    ],
    Po: [
      [1, null, 228, "rahm"],
      [-1, null, 275, "rahm"],
    ],
    At: [
      [1, null, 228, "rahm"],
      [-1, null, 269, "rahm"],
    ],
    Rn: [
      [1, null, 226, "rahm"],
    ],
    Ra: [
      [1, null, 253, "rahm"],
    ],
    Ac: [
      [1, null, 273, "rahm"],
    ],
    Th: [
      [1, null, 270, "rahm"],
    ],
    Pa: [
      [1, null, 254, "rahm"],
    ],
    U: [
      [4, 10, 109.4, "hawthorne"],
      [1, null, 264, "rahm"],
    ],
    Np: [
      [5, 7, 91.7, "hawthorne"],
      [5, 8, 100.3, "hawthorne"],
      [6, 7, 82.3, "hawthorne"],
      [6, 8, 89.5, "hawthorne"],
      [1, null, 243, "rahm"],
    ],
    Pu: [
      [1, null, 241, "rahm"],
    ],
    Am: [
      [3, 9, 113.7, "hawthorne"],
      [1, null, 238, "rahm"],
    ],
    Cm: [
      [3, 9, 112.4, "hawthorne"],
      [1, null, 237, "rahm"],
    ],
    Es: [
      [3, 6, 93.4, "david"],
    ],
    Fm: [
      [3, 6, 92.2, "david"],
    ],
    Md: [
      [3, 6, 91.2, "david"],
    ],
    Lr: [
      [3, 6, 89.6, "david"],
    ],
    Rf: [
      [4, 6, 74, "bilewicz"],
    ],
    Db: [
      [4, 6, 76, "ionova"],
      [5, 6, 66, "bilewicz"],
    ],
    Sg: [
      [4, 6, 73, "ionova"],
      [6, 6, 63, "bilewicz"],
    ],
    Bh: [
      [4, 6, 72, "ionova"],
      [7, 6, 58, "pershina"],
    ],
    Hs: [
      [4, 6, 70, "ionova"],
      [8, 4, 45, "pershina"],
    ],
    Mt: [
      [4, 6, 69, "ionova"],
    ],
    Ds: [
      [4, 6, 68, "ionova"],
    ],
    Nh: [
      [1, null, 140, "fricke"],
    ],
    Fl: [
      [2, null, 120, "fricke"],
    ],
    Mc: [
      [1, null, 150, "keller"],
      [3, null, 100, "keller"],
    ],
    Og: [
      [-1, null, null, "kaygorodov", "Afinidade de 0,076(4) eV"],
    ],
  },
};
