import React, { forwardRef } from 'react';
import {
  StyleSheet,
  Text as NativeText,
  TextInput as NativeTextInput,
  TextInputProps,
  TextProps,
  TextStyle,
} from 'react-native';

let customFontsEnabled = false;

export const enableCustomTypography = () => {
  customFontsEnabled = true;
};

const fontStyle = (style: TextProps['style'] | TextInputProps['style']): TextStyle => {
  const flattened = (StyleSheet.flatten(style) ?? {}) as TextStyle;
  if (!customFontsEnabled) return flattened;
  const weight = typeof flattened.fontWeight === 'string' ? parseInt(flattened.fontWeight, 10) : flattened.fontWeight ?? 400;
  const fontFamily = weight >= 700 ? 'IBMPlexSans_700Bold' : weight >= 600 ? 'IBMPlexSans_600SemiBold' : 'IBMPlexSans_500Medium';
  const { fontWeight: _fontWeight, fontFamily: _fontFamily, ...rest } = flattened;
  return { ...rest, fontFamily };
};

export const Text = forwardRef<React.ElementRef<typeof NativeText>, TextProps>((props, ref) =>
  <NativeText {...props} ref={ref} style={fontStyle(props.style)} />
);

export const TextInput = forwardRef<React.ElementRef<typeof NativeTextInput>, TextInputProps>((props, ref) =>
  <NativeTextInput {...props} ref={ref} style={fontStyle(props.style)} />
);

Text.displayName = 'Text';
TextInput.displayName = 'TextInput';
