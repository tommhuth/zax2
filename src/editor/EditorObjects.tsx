import EditorObject, { useEditorObject } from "./data/hooks"
import { useEditorStore } from "./data/store"
import  BarellEditor   from "./objects/Barrel.editor"
import  ObstacleEditor   from "./objects/Obstacle.editor"

export default function EditorObjects(){
    let objects = useEditorStore(i => i.objects)

    return (
        <>
            {objects.map((i) => {
                return (
                    <EditorObject key={i.id} {...i}>
                        {i.type === "barrel" && (
                            <BarellEditor />
                        )} 
                        {i.type === "obstacle" && (
                            <ObstacleEditor />
                        )}
                    </EditorObject>
                )
            })}
        </>
    )
}

function Test() {
    let { width, height, depth, position } = useEditorObject()

    return (
        <> 
            <mesh position={position}>
                <boxGeometry args={[width, height, depth, 1, 1, 1]} />
                <meshPhongMaterial color="green" />
            </mesh>
        </>
    )
}