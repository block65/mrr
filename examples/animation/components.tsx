import type { FC } from 'react';
import { useRouteParams } from '@block65/mrr';
import type { hslRoute, rgbRoute } from './routes.js';

export const HSL: FC = () => {
  const { h, s, l } = useRouteParams<typeof hslRoute.path>() || {};

  return (
    <div
      className="grid place-items-center aspect-square w-32 font-mono text-sm font-medium"
      style={{ background: `hsl(${h}, ${s}%, ${l}%)` }}
    >
      <span className="mix-blend-difference text-white">
        hsl({h},{s}%,{l}%)
      </span>
    </div>
  );
};

export const RGB: FC = () => {
  const { r, g, b } = useRouteParams<typeof rgbRoute.path>() || {};

  return (
    <div
      className="grid place-items-center aspect-square w-40 font-mono text-sm font-medium"
      style={{ background: `rgb(${r}, ${g}, ${b})` }}
    >
      <span className="mix-blend-difference text-white">
        rgb({r},{g},{b})
      </span>
    </div>
  );
};
