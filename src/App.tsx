import Camera from "./components/Camera"
import {
    Suspense,
    startTransition,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import Player from "./components/Player"
import World from "./components/world/World"
import Ui from "./components/ui/Ui"
import Lights from "./components/Lights"
import {
    BasicShadowMap,
    InstancedMesh,
    MeshBasicMaterial,
    NoToneMapping,
} from "three"
import { dpr, pixelSize, store, useStore, zoom } from "./data/store"
import Models from "./components/world/models/Models"
import EdgeOverlay from "./components/EdgeOverlay"
import { Perf } from "r3f-perf"
import MaterialLoader from "./components/world/models/MaterialLoader"
import { Only, clamp, glsl, setMatrixAt } from "./data/utils"
import Config from "./data/Config"
import { setLoaded, setReady } from "./data/store/utils"
import Controls from "./components/Controls"
import { useShader } from "./data/hooks"
import random from "@huth/random"
import { easeInQuad, easeOutQuad } from "./data/shaping"
import { Tuple3 } from "./types"

export default function Wrapper() {
    let getSize = () => [
        Math.ceil(window.innerWidth / pixelSize) * pixelSize,
        Math.ceil(window.innerHeight / pixelSize) * pixelSize,
    ]
    let [size, setSize] = useState(() => getSize())
    let ready = useStore((i) => i.ready)

    useEffect(() => {
        let tid: ReturnType<typeof setTimeout>
        let update = () => {
            clearTimeout(tid)
            tid = setTimeout(() => setSize(getSize()), 50)
        }

        screen.orientation.addEventListener("change", update)
        window.addEventListener("resize", update)

        return () => {
            screen.orientation.removeEventListener("change", update)
            window.removeEventListener("resize", update)
        }
    }, [])

    return (
        <>
            <Ui />
            <Canvas
                gl={{
                    antialias: false,
                    depth: true,
                    stencil: false,
                    alpha: false,
                    powerPreference: "high-performance",
                    toneMapping: NoToneMapping,
                }}
                style={{
                    height: size[1],
                    width: size[0],
                    opacity: ready ? 1 : 0,
                    left: 0,
                    top: 0,
                    position: "fixed",
                }}
                shadows={{
                    type: BasicShadowMap,
                }}
                orthographic
                camera={{
                    zoom,
                    near: 0,
                    far: 150,
                }}
                dpr={dpr}
            >
                <Suspense fallback={null}>
                    <EdgeOverlay />
                    <Models />
                    <World />
                    <Player />
                    <Loader />
                </Suspense>

                <Controls />
                <Camera />
                <Lights />
                <MaterialLoader />
                <Speedlines />

                <Only if={Config.STATS}>
                    <Perf
                        deepAnalyze
                        style={{ zIndex: 90000 }}
                    />
                </Only>
            </Canvas>
        </>
    )
}

function Loader() {
    let { scene, gl, camera } = useThree()
    let loaded = useStore((i) => i.loaded)

    useEffect(() => {
        // not sure this is really needed
        gl.compile(scene, camera)
        startTransition(setLoaded)
    }, [scene, camera])

    useEffect(() => {
        if (loaded) {
            setTimeout(() => {
                document.getElementById("loading")?.remove()
                setReady()
            }, 1000)
        }
    }, [loaded])

    return null
}

interface Speedline {
    index: number 
    size: number 
    time: number 
    lifetime: number 
    speed: number 
    position: Tuple3
}

function Speedlines() {
    let ref = useRef<InstancedMesh>(null) 
    let ready = useStore(i => i.ready)  
    let count = 4  
    let lines = useMemo<Speedline[]>(() => {
        return new Array(count).fill(null).map((i, index) => {
            return {
                index,
                size: random.float(2, 4),
                time: 0,
                lifetime: 0,
                speed: random.float(.4, 3),
                position: [0, 0, 0],
            }
        })
    }, [count, ready])
    let { onBeforeCompile } = useShader({
        vertex: {
            head: glsl`
                varying vec3 vPosition; 
                varying vec3 vGlobalPosition;
            `,
            main: glsl`
                vPosition = position; 
                vGlobalPosition = (instanceMatrix * vec4(position, 1.)).xyz;
            `,
        },
        fragment: {
            head: glsl`
                varying vec3 vPosition;
                varying float vOpacity;
                varying vec3 vGlobalPosition;

                float easeOutCubic(float x) {
                    return 1. - pow(1. - x, 3.);
                }

                float easeInCubic(float x) {
                    return pow(x, 3.);
                } 
            `,
            main: glsl` 
                 gl_FragColor.a = (1. - clamp((abs(vPosition.z)) / .5, 0., 1.));
            `,
        },
    }) 

    useFrame((state, delta) => {  
        if (!ref.current) {
            return
        }

        let { velocity, position } = store.getState().player 

        for (let line of lines) { 
            let t = line.time/line.lifetime

            if (t < .5) {
                t = (t / .5)
            } else {
                t = easeInQuad(1 - (t - .5)  / .5)
            }
 
            line.position[2] -= (delta * line.speed * velocity.z)
            line.time += delta * 1000
 
            setMatrixAt({
                instance: ref.current,
                index: line.index,
                position: line.position, 
                scale: [line.size * .085, .01, velocity.z * 2* t * line.size],
            })

            if (line.time >= line.lifetime) {
                line.lifetime = random.integer(400, 1600)
                line.time = random.integer(0, 100)
                line.speed =  random.float(1, 4)
                line.position[0] = random.float(position.x - 1, position.x + 1 )
                line.position[1] = position.y + .25
                line.position[2] = random.float(position.z + 1, position.z + 5)
            }
        }
    })

    return (
        <instancedMesh
            ref={ref} 
            args={[undefined, undefined, count]}
        >
            <boxGeometry args={[1, 1, 1, 1, 1, 1]} />
            <meshBasicMaterial
                transparent
                depthWrite={false}
                onBeforeCompile={onBeforeCompile}
                color={"#20b"}
            />
        </instancedMesh>
    )
}