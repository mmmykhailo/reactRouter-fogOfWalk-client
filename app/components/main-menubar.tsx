import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "~/components/ui/menubar";
import { fogStyles, mapStyles, type FogStyle, type MapStyle } from "./map";

type MainMenubarProps = {
  fogOpacity: number;
  mapStyle: MapStyle;
  fogStyle: FogStyle;
  setFogOpacity: (value: number) => void;
  setMapStyle: (value: MapStyle) => void;
  setFogStyle: (value: FogStyle) => void;
  onSelectFilesClick: () => void;
  onClearTracksClick: () => void;
};

export function MainMenubar({
  fogOpacity,
  mapStyle,
  fogStyle,
  setFogOpacity,
  setMapStyle,
  setFogStyle,
  onClearTracksClick,
  onSelectFilesClick,
}: MainMenubarProps) {
  return (
    <Menubar className="absolute top-4 left-4 z-10">
      <MenubarMenu>
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent>
          <MenubarItem onClick={onSelectFilesClick}>
            Add other tracks
          </MenubarItem>
          <MenubarItem onClick={onClearTracksClick}>Clear tracks</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>View</MenubarTrigger>
        <MenubarContent>
          <MenubarSub>
            <MenubarSubTrigger>Fog opacity</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarRadioGroup
                value={fogOpacity.toString()}
                onValueChange={(value) => setFogOpacity(parseFloat(value))}
              >
                <MenubarRadioItem value="0">Hidden</MenubarRadioItem>
                <MenubarRadioItem value="0.5">50%</MenubarRadioItem>
                <MenubarRadioItem value="0.7">70%</MenubarRadioItem>
                <MenubarRadioItem value="0.8">80%</MenubarRadioItem>
              </MenubarRadioGroup>
            </MenubarSubContent>
          </MenubarSub>
          <MenubarSub>
            <MenubarSubTrigger>Map style</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarRadioGroup
                value={mapStyle}
                onValueChange={(value) => setMapStyle(value as MapStyle)}
              >
                {mapStyles.map((style) => (
                  <MenubarRadioItem key={style} value={style}>
                    {style}
                  </MenubarRadioItem>
                ))}
              </MenubarRadioGroup>
            </MenubarSubContent>
          </MenubarSub>
           <MenubarSub>
            <MenubarSubTrigger>Fog style</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarRadioGroup
                value={fogStyle}
                onValueChange={(value) => setFogStyle(value as FogStyle)}
              >
                {fogStyles.map((style) => (
                  <MenubarRadioItem key={style} value={style} disabled={mapStyle === "satelite"}>
                    {style}
                  </MenubarRadioItem>
                ))}
              </MenubarRadioGroup>
            </MenubarSubContent>
          </MenubarSub>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}
