import React from 'react';
import { TextInput, View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { radius } from '@tokens/radius';

interface InputProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  editable?: boolean;
  label?: string;
  error?: string;
  style?: ViewStyle;
  inputStyle?: TextStyle;
}

export const Input = ({
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
  editable = true,
  label,
  error,
  style,
  inputStyle,
}: InputProps) => {
  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          !editable && styles.disabled,
          error && styles.error,
          inputStyle,
        ]}
        placeholder={placeholder}
        placeholderTextColor="#999999"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        editable={editable}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 6,
  },
  input: {
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: radius.sm, // Phase 5.5: 8 → 12 (+50%)
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#1A1A1A',
    backgroundColor: '#FFFFFF',
  },
  disabled: {
    backgroundColor: '#F5F5F5',
    color: '#999999',
  },
  error: {
    borderColor: '#D32F2F',
  },
  errorText: {
    fontSize: 12,
    color: '#D32F2F',
    marginTop: 4,
  },
});
