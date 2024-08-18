"use client";

import React, { useState } from 'react';
import { Slider, SegmentedControl, Text, Box, Stack, MantineTheme, SliderProps, CSSProperties } from '@mantine/core';

interface Resolution {
  width: number;
  height: number;
  orientation: 'portrait' | 'square' | 'landscape';
}

const resolutions: Resolution[] = [
  { width: 768, height: 1344, orientation: 'portrait' },
  { width: 832, height: 1216, orientation: 'portrait' },
  { width: 896, height: 1152, orientation: 'portrait' },
  { width: 1024, height: 1024, orientation: 'square' },
  { width: 1152, height: 896, orientation: 'landscape' },
  { width: 1216, height: 832, orientation: 'landscape' },
  { width: 1344, height: 768, orientation: 'landscape' },
];

const CENTER_INDEX = 3;
const TOTAL_POSITIONS = 7;

interface AspectRatioSelectorProps {
  dimensions: { width: number; height: number };
  setDimensions: (dimensions: { width: number; height: number }) => void;
}

const AspectRatioSelector: React.FC<AspectRatioSelectorProps> = ({ dimensions, setDimensions }) => {
  const [selectedIndex, setSelectedIndex] = useState<number>(() => {
    return resolutions.findIndex(res => res.width === dimensions.width && res.height === dimensions.height) || CENTER_INDEX;
  });
  const selectedResolution = resolutions[selectedIndex];

  const handleSliderChange = (value: number) => {
    const newIndex = Math.round(value);
    setSelectedIndex(newIndex);
    setDimensions({ width: resolutions[newIndex].width, height: resolutions[newIndex].height });
  };

  const handleOrientationChange = (value: string) => {
    let newIndex: number;
    if (value === 'portrait') {
      newIndex = 1; // 832x1216
    } else if (value === 'landscape') {
      newIndex = 5; // 1216x832
    } else {
      newIndex = CENTER_INDEX; // 1024x1024
    }
    setSelectedIndex(newIndex);
    setDimensions({ width: resolutions[newIndex].width, height: resolutions[newIndex].height });
  };

  const getSliderStyles = (theme: MantineTheme, props: SliderProps): Partial<Record<string, CSSProperties>> => {
    const isLeftFill = selectedIndex < CENTER_INDEX;
    const fillLength = Math.abs(selectedIndex - CENTER_INDEX);
    const fillPercentage = (fillLength / (TOTAL_POSITIONS - 1)) * 100;

    return {
      track: {
        '&::before': {
          backgroundColor: theme.colors.gray[2],
        },
      },
      bar: {
        position: 'absolute' as const, // Explicitly set the type of position
        backgroundColor: theme.colors.blue[6],
        height: '100%',
        width: `${fillPercentage}%`,
        left: isLeftFill ? `${50 - fillPercentage}%` : '50%',
        right: isLeftFill ? 'auto' : `${50 - fillPercentage}%`,
      },
      thumb: {
        borderWidth: 2,
        padding: 3,
      },
    };
  };

  return (
    <Box style={{ width: 'auto', padding: '20px' }}>
      <Stack gap="md">
        <Box
          style={{
            width: '100%',
            height: '150px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#f0f0f0',
            borderRadius: '8px',
          }}
        >
          <Box
            style={{
              width: `${(selectedResolution.width / Math.max(selectedResolution.width, selectedResolution.height)) * 130}px`,
              height: `${(selectedResolution.height / Math.max(selectedResolution.width, selectedResolution.height)) * 130}px`,
              backgroundColor: 'white',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              boxShadow: '0 0 10px rgba(0,0,0,0.1)',
              borderRadius: '4px',
            }}
          >
            <Text size="sm" ta="center">
              {selectedResolution.width}x{selectedResolution.height}
            </Text>
          </Box>
        </Box>
        <SegmentedControl
          value={selectedResolution.orientation}
          onChange={handleOrientationChange}
          data={[
            { label: 'Portrait', value: 'portrait' },
            { label: 'Square', value: 'square' },
            { label: 'Landscape', value: 'landscape' },
          ]}
          fullWidth
        />
        <Slider
          value={selectedIndex}
          onChange={handleSliderChange}
          min={0}
          max={resolutions.length - 1}
          step={1}
          label={null}
          styles={getSliderStyles}
        />
      </Stack>
    </Box>
  );
};

export default AspectRatioSelector;
