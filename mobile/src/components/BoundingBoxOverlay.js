/**
 * BoundingBoxOverlay — draws normalized (0–1) YOLO bounding boxes over the
 * captured image. Boxes are positioned with percentages so they resize
 * correctly on any phone size.
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SEVERITY_COLORS } from '../constants';

export default function BoundingBoxOverlay({ boxes = [] }) {
    const [size, setSize] = useState({ width: 0, height: 0 });

    if (!boxes || boxes.length === 0) return null;

    return (
        <View
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
            onLayout={(event) => {
                const { width, height } = event.nativeEvent.layout;
                setSize({ width, height });
            }}
        >
            {size.width > 0 &&
                boxes.map((box, index) => {
                    const left = box.x1 * size.width;
                    const top = box.y1 * size.height;
                    const width = Math.max((box.x2 - box.x1) * size.width, 4);
                    const height = Math.max((box.y2 - box.y1) * size.height, 4);
                    const color = SEVERITY_COLORS[String(box.label).toLowerCase()] || '#2970ff';

                    return (
                        <View
                            key={box.id || index}
                            style={[styles.box, { left, top, width, height, borderColor: color }]}
                        >
                            <Text style={[styles.boxLabel, { backgroundColor: color }]}>
                                {String(box.label).replace(/_/g, ' ')} · {box.confidence}%
                            </Text>
                        </View>
                    );
                })}
        </View>
    );
}

const styles = StyleSheet.create({
    box: {
        position: 'absolute',
        borderWidth: 2.5,
        borderRadius: 4,
    },
    boxLabel: {
        position: 'absolute',
        top: -18,
        left: -1,
        color: '#ffffff',
        fontSize: 9,
        fontWeight: '800',
        paddingHorizontal: 5,
        paddingVertical: 2,
        borderRadius: 3,
        overflow: 'hidden',
    },
});