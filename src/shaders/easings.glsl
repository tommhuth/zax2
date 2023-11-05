float easeInOutCubic(float x) {
  return x < 0.5 ? 4. * x * x * x : 1. - pow(-2. * x + 2., 3.) / 2.;
}

float easeInOutSine(float x) { return -(cos(3.14159 * x) - 1.) / 2.; }

float easeInOutQuad(float x) {
  return x < 0.5 ? 2. * x * x : 1. - pow(-2. * x + 2., 2.) / 2.;
}

float easeInQuad(float x) { return x * x; }

float easeInSine(float x) { return 1. - cos((x * 3.14159) / 2.); }

float easeInCubic(float x) { return x * x * x; }

float easeOutCubic(float x) {
return 1. - pow(1. - x, 3.);
}