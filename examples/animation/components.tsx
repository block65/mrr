import { type CSSProperties, type FC } from 'react';
import { useRouteParams } from '../../index.js';
import type { hslRoute, rgbRoute } from './routes.js';

export const HSL: FC<{ style?: CSSProperties }> = (props) => {
  const { h, s, l } = useRouteParams<typeof hslRoute.path>() || {};

  return (
    <div
      {...props}
      style={{
        ...props.style,
        height: '5em',
        aspectRatio: '1/1',
        background: `hsl(${h}, ${s}%, ${l}%)`,
        display: 'grid',
        placeItems: 'center',
      }}
    >
      hsl({h}, {s}%, {l}%)
    </div>
  );
};
export const RGB: FC<{ style?: CSSProperties }> = (props) => {
  const { r, g, b } = useRouteParams<typeof rgbRoute.path>() || {};
  return (
    <div
      {...props}
      style={{
        ...props.style,
        height: '10em',
        aspectRatio: '1/1',
        background: `rgb(${r}, ${g}, ${b})`,
        display: 'grid',
        placeItems: 'center',
      }}
    >
      rgb({r}, {g}, {b})
    </div>
  );
};
