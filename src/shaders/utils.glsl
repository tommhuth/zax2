const vec3 CAMERA_POSITION = normalize(vec3(-61.2372, 50., -61.237));

// https://github.com/hughsk/glsl-luma/blob/master/index.glsl
float luma(vec3 color) {
    return dot(color, vec3(0.299, 0.587, 0.114));
} 

// https://gist.github.com/companje/29408948f1e8be54dd5733a74ca49bb9
float map(float value, float min1, float max1, float min2, float max2) {
    return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
}