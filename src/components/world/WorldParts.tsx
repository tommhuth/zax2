import BuildingsGap from "./parts/BuildingsGap"
import BuildingsLow from "./parts/BuildingsLow"
import Airstrip from "./parts/Airstrip"
import Start from "./parts/Start"
import BossPart from "./parts/Boss"
import RockValley from "./parts/RockValley"
import GrassPart from "./parts/Grass"
import { WorldPartType } from "@data/types"
import { useStore } from "@data/store"
import Default from "./parts/Default"
import { memo } from "react"

function WorldParts() {
    let parts = useStore(i => i.world.parts)

    return parts.map(i => {
        switch (i.type) {
            case WorldPartType.START:
                return <Start key={i.id} {...i} />
            case WorldPartType.ROCK_VALLEY:
                return <RockValley key={i.id} {...i} />
            case WorldPartType.DEFAULT:
                return <Default key={i.id} {...i} />
            case WorldPartType.BUILDINGS_GAP:
                return <BuildingsGap key={i.id} {...i} />
            case WorldPartType.BUILDINGS_LOW:
                return <BuildingsLow key={i.id} {...i} />
            case WorldPartType.AIRSTRIP:
                return <Airstrip key={i.id} {...i} />
            case WorldPartType.GRASS:
                return <GrassPart key={i.id} {...i} />
            case WorldPartType.BOSS:
                return <BossPart key={i.id} {...i} />
            default:
                throw new Error(`Unregistered part type: ${i.type}`)
        }
    })
}

export default memo(WorldParts)