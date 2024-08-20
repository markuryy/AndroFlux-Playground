import React, { useState } from 'react';
import { Textarea, ActionIcon, Tooltip, Box, Loader } from '@mantine/core';
import { LuSparkles, LuUndo2 } from 'react-icons/lu';

interface EnhancedTextareaProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  rows?: number;
  error?: string | null;
}

export function EnhancedTextarea({ value, onChange, label, rows = 4, error }: EnhancedTextareaProps) {
  const [originalValue, setOriginalValue] = useState('');
  const [isEnhanced, setIsEnhanced] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);

  const handleEnhance = async () => {
    if (!value.trim()) return;

    setIsEnhancing(true);
    setOriginalValue(value);

    try {
      const groqApiKey = localStorage.getItem('groqApiKey');
      if (!groqApiKey) {
        throw new Error('Groq API key is missing. Please set it in the settings.');
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: value,
          groqApiKey,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to enhance prompt');
      }

      const result = await response.json();
      onChange(result.enhancedPrompt);
      setIsEnhanced(true);
    } catch (error) {
      console.error('Error enhancing prompt:', error);
      // You might want to show an error message to the user here
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleUndo = () => {
    onChange(originalValue);
    setIsEnhanced(false);
  };

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = event.currentTarget.value;
    onChange(newValue);
    if (isEnhanced && newValue !== value) {
      setIsEnhanced(false);
    }
  };

  return (
    <Box style={{ position: 'relative' }}>
      <Textarea
        label={label}
        value={value}
        onChange={handleChange}
        rows={rows}
        error={error}
        resize="vertical"
        style={{ minHeight: '100px' }}
      />
      <Tooltip label={isEnhanced ? "Undo enhancement" : "Enhance prompt"}>
        <ActionIcon
          style={{
            position: 'absolute',
            bottom: 10,
            right: 10,
            backgroundColor: 'transparent',
            color: 'var(--mantine-color-text)',
          }}
          onClick={isEnhanced ? handleUndo : handleEnhance}
          disabled={!value.trim() || isEnhancing}
        >
          {isEnhancing ? (
            <Loader size="sm" />
          ) : isEnhanced ? (
            <LuUndo2 size={16} />
          ) : (
            <LuSparkles size={16} />
          )}
        </ActionIcon>
      </Tooltip>
    </Box>
  );
}