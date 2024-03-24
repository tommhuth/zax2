const vec3 CAMERA_POSITION = normalize(vec3(-61.2372, 50., -61.237));

float luma(vec3 color) {
    return dot(color, vec3(0.299, 0.587, 0.114));
}

float directionToCamera(vec3 normal) {
    return 1. - clamp(1. - dot(CAMERA_POSITION, normal), .0, 1.);
}