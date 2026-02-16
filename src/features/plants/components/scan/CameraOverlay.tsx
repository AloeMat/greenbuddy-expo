/**
 * CameraOverlay Component
 * Displays camera UI with capture button and instructions
 */

import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface CameraOverlayProps {
  onCapture: () => void;
}

export const CameraOverlay: React.FC<CameraOverlayProps> = ({ onCapture }) => {
  return (
    <View style={styles.overlay}>
      {/* Top instructions */}
      <View style={styles.topOverlay}>
        <Text style={styles.instructionText}>
          📸 Centrez la plante dans le cadre
        </Text>
      </View>

      {/* Center frame guide */}
      <View style={styles.frameGuide}>
        <View style={[styles.frameCorner, { top: 0, left: 0 }]} />
        <View style={[styles.frameCorner, { top: 0, right: 0 }]} />
        <View style={[styles.frameCorner, { bottom: 0, left: 0 }]} />
        <View style={[styles.frameCorner, { bottom: 0, right: 0 }]} />
      </View>

      {/* Bottom controls */}
      <View style={styles.bottomOverlay}>
        <TouchableOpacity
          style={styles.captureButton}
          onPress={onCapture}
        >
          <View style={styles.captureButtonInner} />
        </TouchableOpacity>
        <Text style={styles.tapText}>Appuyez pour photographier</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20
  },
  topOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8
  },
  instructionText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center'
  },
  frameGuide: {
    width: SCREEN_WIDTH * 0.8,
    height: SCREEN_WIDTH * 0.8,
    borderWidth: 2,
    borderColor: 'rgba(16, 185, 129, 0.5)',
    borderRadius: 12,
    position: 'relative'
  },
  frameCorner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: '#10B981',
    borderWidth: 3
  },
  bottomOverlay: {
    alignItems: 'center',
    gap: 12
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#10B981'
  },
  tapText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500'
  }
});
