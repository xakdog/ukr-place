import React, {useCallback} from "react";
import {atom, useRecoilState} from "recoil";
import {twPaletteList} from "./palette-bar.colors";

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
    p-4 mb-8 mt-4 z-10
    w-80 md:w-fit px-4
    flex flex-wrap gap-1 place-content-center
    bg-zinc-900 select-none
    rounded-lg drop-shadow-xl ring-4 ring-black/10
  ">
    {twPaletteList.map(c =>
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
