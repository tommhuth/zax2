import InstancedMesh from "../InstancedMesh"

export default function Sphere() { 
    return ( 
        <InstancedMesh
            name="sphere"
            count={10}
            castShadow
            receiveShadow
        >
            <sphereGeometry
                args={[1, 16, 16]}
                attach="geometry"
            />
            <meshBasicMaterial color="yellow" name="sphere" />
        </InstancedMesh>
    )
}