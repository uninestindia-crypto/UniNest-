import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';

import { breakpoints } from '@/theme/tokens';

type ResponsiveValues<T> = {
  base: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
};

export function useResponsiveValue<T>(values: ResponsiveValues<T>): T {
  const { width } = useWindowDimensions();
  const { base, sm, md, lg, xl } = values;

  return useMemo(() => {
    if (width >= breakpoints.xl && xl !== undefined) {
      return xl;
    }

    if (width >= breakpoints.lg && lg !== undefined) {
      return lg;
    }

    if (width >= breakpoints.md && md !== undefined) {
      return md;
    }

    if (width >= breakpoints.sm && sm !== undefined) {
      return sm;
    }

    return base;
  }, [base, lg, md, sm, width, xl]);
}
