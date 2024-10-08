"use client";

import React, { useState, useEffect } from 'react';
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
  const [selectedIndex, setSelectedIndex] = useState<number>(CENTER_INDEX);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const index = resolutions.findIndex(res => res.width === dimensions.width && res.height === dimensions.height);
    setSelectedIndex(index !== -1 ? index : CENTER_INDEX);
  }, [dimensions]);

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
        position: 'absolute' as const,
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

  if (!mounted) {
    return null;
  }

  return (
    <Box style={{ width: '100%', padding: '20px' }}>
      <Box style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        '@media (min-width: 769px)': {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        },
      }}>
        <Box
          style={{
            width: '200px',
            height: '200px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#f0f0f0',
            borderRadius: '8px',
            marginBottom: '20px',
            '@media (min-width: 769px)': {
              marginBottom: 0,
            },
          }}
        >
          <Box
            style={{
              width: `${(selectedResolution.width / Math.max(selectedResolution.width, selectedResolution.height)) * 180}px`,
              height: `${(selectedResolution.height / Math.max(selectedResolution.width, selectedResolution.height)) * 180}px`,
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
        <Stack style={{
          width: '100%',
          '@media (min-width: 769px)': {
            width: 'calc(100% - 220px)',
          },
        }}>
          <SegmentedControl
            value={selectedResolution.orientation}
            onChange={handleOrientationChange}
            data={[
              { label: 'Portrait', value: 'portrait' },
              { label: 'Square', value: 'square' },
              { label: 'Landscape', value: 'landscape' },
            ]}
            fullWidth
            styles={(theme) => ({
              root: {
                '@media (max-width: 768px)': {
                  flexDirection: 'column',
                  '& label': {
                    width: '100%',
                    '&:not(:last-of-type)': {
                      borderRight: 'none',
                      borderBottom: `1px solid ${
                        theme.colors.dark[4]
                      }`,
                    },
                  },
                },
              },
            })}
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
    </Box>
  );
};

export default AspectRatioSelector;
