const vec3 CAMERA_POSITION = normalize(vec3(-61.2372, 50., -61.237));

// https://github.com/hughsk/glsl-luma/blob/master/index.glsl
float luma(vec3 color) {
    return dot(color, vec3(0.299, 0.587, 0.114));
}  