import { useEffect, type FC } from 'react';

/**
 * Sometimes you want to run parent effects before those of the children. E.g.
   when setting something up or binding document event listeners. By passing the
   effect to the first child it will run before any effects by later children.
 * @param {Function} effect
  * @returns {null}
  */
export const DelayedEffect: FC<{ effect: () => void }> = ({ effect }) => {
  useEffect(() => effect(), [effect]);
  return null;
};
