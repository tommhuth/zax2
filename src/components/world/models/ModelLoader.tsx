import { useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const files = [
    
]

export default function ModalLoader() {
    let models = useLoader(GLTFLoader,  files)
}