'use client';

import { useState, useEffect } from 'react';
import { Title, Stack, TextInput, NumberInput, Select, Button, Image, Box, SimpleGrid, ActionIcon, Group, Text } from "@mantine/core";
import { useDisclosure } from '@mantine/hooks';
import { LuPlus, LuMinus, LuSettings } from "react-icons/lu";
import AspectRatioSelector from '@/components/AspectRatio';
import { SettingsModal } from '@/components/SettingsModal';

const PRESELECTED_LORAS = [
  { value: 'https://civitai.com/api/download/models/736458?type=Model&format=SafeTensor', label: 'AndroFlux v19' },
  // Add more preselected LoRAs here
];

interface LoRA {
  path: string;
  scale: number;
}

export default function Home() {
  const [apiKey, setApiKey] = useState('');
  const [seed, setSeed] = useState(Math.floor(Math.random() * 1000000));
  const [loras, setLoras] = useState<LoRA[]>([{ path: 'https://civitai.com/api/download/models/736458?type=Model&format=SafeTensor', scale: 1.0 }]);
  const [prompt, setPrompt] = useState('');
  const [dimensions, setDimensions] = useState({ width: 1024, height: 1024 });
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settingsOpened, settingsHandlers] = useDisclosure(false);

  useEffect(() => {
    const storedApiKey = localStorage.getItem('falApiKey');
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, []);

  const generateImage = async () => {
    if (!apiKey) {
      settingsHandlers.open();
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          seed,
          loras,
          prompt,
          dimensions,
          apiKey,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate image');
      }

      const result = await response.json();
      setGeneratedImages(prevImages => [result.images[0].url, ...prevImages]);
      setSeed(result.seed);
    } catch (error) {
      console.error('Error generating image:', error);
      setError('Failed to generate image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const addLora = () => {
    setLoras([...loras, { path: '', scale: 1.0 }]);
  };

  const removeLora = (index: number) => {
    setLoras(loras.filter((_, i) => i !== index));
  };

  const updateLora = (index: number, field: 'path' | 'scale', value: string | number) => {
    const newLoras = [...loras];
    if (field === 'path') {
      newLoras[index].path = value as string;
    } else {
      newLoras[index].scale = value as number;
    }
    setLoras(newLoras);
  };

  return (
    <Stack>
      <Title order={1} >AndroFlux Playground</Title>
      <SimpleGrid cols={{ base: 1, sm: 2 }}>
        <Stack>
          <NumberInput
            label="Seed"
            value={seed}
            onChange={(value) => setSeed(Number(value))}
            min={0}
            max={999999}
          />
          <TextInput
            label="Prompt"
            value={prompt}
            onChange={(event) => setPrompt(event.currentTarget.value)}
          />
          <AspectRatioSelector dimensions={dimensions} setDimensions={setDimensions} />
          {loras.map((lora, index) => (
            <Box key={index}>
              <Group grow>
                <Select
                  label={`LoRA ${index + 1}`}
                  data={[...PRESELECTED_LORAS, { value: 'custom', label: 'Custom URL' }]}
                  value={PRESELECTED_LORAS.some(l => l.value === lora.path) ? lora.path : 'custom'}
                  onChange={(value) => updateLora(index, 'path', value === 'custom' ? '' : value || '')}
                />
                {(!PRESELECTED_LORAS.some(l => l.value === lora.path)) && (
                  <TextInput
                    label="Custom LoRA URL"
                    value={lora.path}
                    onChange={(event) => updateLora(index, 'path', event.currentTarget.value)}
                  />
                )}
                <NumberInput
                  label="Weight"
                  value={lora.scale}
                  onChange={(value) => updateLora(index, 'scale', Number(value))}
                  min={0}
                  max={2}
                  step={0.1}
                />
              </Group>
              <ActionIcon onClick={() => removeLora(index)} disabled={loras.length === 1}>
                <LuMinus />
              </ActionIcon>
            </Box>
          ))}
          <Button onClick={addLora}>
            <LuPlus />
            Add LoRA
          </Button>
          <Button onClick={generateImage} loading={isLoading}>
            Generate Image
          </Button>
          {error && <Text>{error}</Text>}
        </Stack>
        <Stack>
          {generatedImages.map((image, index) => (
            <Image key={index} src={image} alt={`Generated image ${index + 1}`} />
          ))}
        </Stack>
      </SimpleGrid>
      <ActionIcon
        onClick={settingsHandlers.open}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
        }}
        size="lg"
      >
        <LuSettings />
      </ActionIcon>
      <SettingsModal
        opened={settingsOpened}
        onClose={settingsHandlers.close}
        apiKey={apiKey}
        setApiKey={setApiKey}
      />
    </Stack>
  );
}