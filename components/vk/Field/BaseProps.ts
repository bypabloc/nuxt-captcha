/**
 * @component VKFieldBaseProps
 * @description Propiedades base para los componentes de campo del formulario
 * Establece propiedades y estilos comunes como ancho máximo para todos los campos.
 *
 * @author Pablo Contreras
 * @since 2025/04/25
 * @updated 2025/05/07
 */
import type { ColorName } from '@/design-system/presets/colors.preset'
import { COLOR_NAMES } from '@/design-system/presets/colors.preset'
import type {
    TypographyStyle,
    TypographyVariant,
} from '@/design-system/presets/typography.preset'
import {
    TYPOGRAPHY_STYLES,
    TYPOGRAPHY_VARIANTS,
} from '@/design-system/presets/typography.preset'
import type { ComputedRef, CSSProperties } from 'vue'

/**
 * Interfaz para las propiedades base de los campos.
 * Define propiedades comunes que deben compartir todos los tipos de campos.
 */
export interface VKFieldBaseProps {
  maxWidth?: string
  textColor?: ColorName
  textStyle?: TypographyStyle
  textVariant?: TypographyVariant
}

/**
 * Propiedades base que se pueden extender en los componentes de campo.
 */
export const fieldBaseProps = {
  maxWidth: {
    type: String,
    default: '',
  },
  bgColor: {
    type: String as () => ColorName,
    default: COLOR_NAMES.WHITE,
  },
  textColor: {
    type: String as () => ColorName,
    default: COLOR_NAMES.DARK_GRAY,
  },
  textStyle: {
    type: String as () => TypographyStyle,
    default: 'caption',
    validator: (value: string): boolean =>
      Object.values(TYPOGRAPHY_STYLES).includes(value as TypographyStyle),
  },
  textVariant: {
    type: String as () => TypographyVariant,
    default: 'regular',
    validator: (value: string): boolean =>
      Object.values(TYPOGRAPHY_VARIANTS).includes(value as TypographyVariant),
  },
}

/**
 * Interfaz para los estilos del contenedor.
 * Extiende de CSSProperties para ser compatible con la directiva :style de Vue.
 */
export type ContainerStyles = CSSProperties

/**
 * Interfaz para el resultado de useFieldBaseStyles.
 */
export interface FieldBaseStylesResult {
  containerStyles: ComputedRef<ContainerStyles>
}

/**
 * Hook para calcular estilos comunes basados en las propiedades del campo.
 *
 * @param props - Propiedades del componente con la propiedad maxWidth
 * @returns Objeto con estilos calculados para el contenedor
 */
export const useFieldBaseStyles = (props: {
  maxWidth?: string
}): FieldBaseStylesResult => {
  const containerStyles: ComputedRef<ContainerStyles> = computed(() => ({
    maxWidth: props.maxWidth || '',
    width: '100%',
  }))

  return {
    containerStyles,
  }
}
