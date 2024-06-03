import { namedRoute } from '../../named-route.js';
import { animationRoute } from '../paths.js';

export const hslRoute = namedRoute(`${animationRoute.path}/hsl/:h/:s/:l`);
export const rgbRoute = namedRoute(`${animationRoute.path}/rgb/:r/:g/:b`);
