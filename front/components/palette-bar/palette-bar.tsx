import React, {useCallback} from "react";
import {atom, useRecoilState} from "recoil";

type ColorTrayProps = {
  onClick(): void;
  color: string;
  selected?: boolean;
}

const ColorTray: React.FC<ColorTrayProps> = ({ color, selected, onClick }) => {
  return <div onClick={onClick} className={`
    h-8 w-8 ${color}
    duration-100
    ${selected ? 'scale-110 shadow-lg' : ''}
    ${!selected ? 'border border-white/40' : 'border-2 border-white/80'}
    rounded shadow cursor-pointer 
  `} />
};

const pallette = [
  'bg-[#ffffff]',
  'bg-[#e4e4e4]',
  'bg-[#888888]',
  'bg-[#222222]',
  'bg-[#ffa7d1]',
  'bg-[#E50000]',
  'bg-[#E59500]',
  'bg-[#A06A42]',
  'bg-[#E5D900]',
  'bg-[#94E044]',
  'bg-[#02BE01]',
  'bg-[#00D3DD]',
  'bg-[#0083C7]',
  'bg-[#0000EA]',
  'bg-[#CF6EE4]',
  'bg-[#820080]',
];

export const paletteColorState = atom({
  key: 'globalPaletteColor',
  default: 'transparent',
});

const PaletteBar: React.FC = () => {
  const [selected, setSelected] = useRecoilState(paletteColorState);

  const toggleColor = useCallback((customTailwindColor: string) => {
    const hexColor = customTailwindColor.slice(4, -1);
    const reset = selected === hexColor;

    setSelected(reset ? 'transparent' : hexColor);
  }, [selected, setSelected]);

  return <div className="
    absolute bottom-0 right-0 left-0 p-4 mb-8 z-10
    w-80 md:w-fit px-4 transform -translate-x-1/2 left-1/2
    flex flex-wrap gap-1 place-content-center
    bg-zinc-800 select-none
    rounded-lg drop-shadow-xl ring-4 ring-black/10
  ">
    {pallette.map(c =>
      <ColorTray
        key={c}
        color={c}
        selected={c.includes(selected)}
        onClick={() => toggleColor(c)}
      />
    )}
  </div>;
};

export default PaletteBar;
