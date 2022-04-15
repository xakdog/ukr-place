export const twPalette: [string, number][] = [
  ['bg-[#ffffff]', 101],
  ['bg-[#e4e4e4]', 102],
  ['bg-[#888888]', 103],
  ['bg-[#222222]', 104],
  ['bg-[#ffa7d1]', 105],
  ['bg-[#e50000]', 106],
  ['bg-[#e59500]', 107],
  ['bg-[#a06a42]', 108],
  ['bg-[#e5d900]', 109],
  ['bg-[#94e044]', 110],
  ['bg-[#02be01]', 111],
  ['bg-[#00d3dd]', 112],
  ['bg-[#0083c7]', 113],
  ['bg-[#0000ea]', 114],
  ['bg-[#cf6ee4]', 115],
  ['bg-[#820080]', 116],
];

export const twPaletteList = twPalette.map(pair => pair[0]);

export const hexPaletteMap = twPalette
  .reduce((res, [tw, idx]): Record<string, number> => {
    res[tw.slice(4, -1)] = idx;

    return res;
  }, {});

export const hexPaletteMapReverse = twPalette
  .reduce((res, [tw, idx]): Record<number, string> => {
    res[idx] = tw.slice(4, -1);

    return res;
  }, {});
