'use client';

import { useState, useEffect } from 'react';
import {
  Title, Stack, TextInput, NumberInput, Select, Button, Image,
  ActionIcon, Group, Text, Skeleton, Progress, Box
} from "@mantine/core";
import { useDisclosure } from '@mantine/hooks';
import { LuPlus, LuMinus, LuSettings, LuRefreshCw, LuTrash2 } from "react-icons/lu";
import AspectRatioSelector from '../components/AspectRatio';
import { SettingsModal } from '../components/SettingsModal';

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
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 1000000));
  const [loras, setLoras] = useState<LoRA[]>([{ path: 'https://civitai.com/api/download/models/736458?type=Model&format=SafeTensor', scale: 1.0 }]);
  const [prompt, setPrompt] = useState('');
  const [dimensions, setDimensions] = useState({ width: 1024, height: 1024 });
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [settingsOpened, settingsHandlers] = useDisclosure(false);

  useEffect(() => {
    const storedApiKey = localStorage.getItem('falApiKey');
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
    const storedImages = localStorage.getItem('generatedImages');
    if (storedImages) {
      setGeneratedImages(JSON.parse(storedImages));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('generatedImages', JSON.stringify(generatedImages));
  }, [generatedImages]);

  const generateImage = async () => {
    if (!apiKey) {
      settingsHandlers.open();
      return;
    }

    setIsLoading(true);
    setProgress(0);
    setError(null);

    const interval = setInterval(() => {
      setProgress((p) => (p < 100 ? p + 1.67 : p));
    }, 1000);

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
      clearInterval(interval);
      setProgress(100);
      setTimeout(() => {
        setIsLoading(false);
        setProgress(0);
      }, 500); // Small delay to ensure progress bar fills
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

  const randomizeSeed = () => {
    setSeed(Math.floor(Math.random() * 1000000));
  };

  const clearImages = () => {
    setGeneratedImages([]);
    localStorage.removeItem('generatedImages');
  };

  return (
    <Stack>
      <Title order={1}>AndroFlux Playground</Title>
      <Group align="flex-start">
        <Stack style={{ flex: 1 }}>
          <Group align="flex-end">
            <NumberInput
              label="Seed"
              value={seed}
              onChange={(value) => setSeed(Number(value))}
              min={0}
              max={999999}
              style={{ flex: 1 }}
            />
            <ActionIcon onClick={randomizeSeed} size="lg">
              <LuRefreshCw />
            </ActionIcon>
          </Group>
          <TextInput
            label="Prompt"
            value={prompt}
            onChange={(event) => setPrompt(event.currentTarget.value)}
          />
          <AspectRatioSelector dimensions={dimensions} setDimensions={setDimensions} />
          {loras.map((lora, index) => (
            <Group key={index} align="flex-end">
              <Select
                label={`LoRA ${index + 1}`}
                data={[...PRESELECTED_LORAS, { value: 'custom', label: 'Custom URL' }]}
                value={PRESELECTED_LORAS.some(l => l.value === lora.path) ? lora.path : 'custom'}
                onChange={(value) => updateLora(index, 'path', value === 'custom' ? '' : value || '')}
                style={{ flex: 1 }}
              />
              {!PRESELECTED_LORAS.some(l => l.value === lora.path) && (
                <TextInput
                  label="Custom LoRA URL"
                  value={lora.path}
                  onChange={(event) => updateLora(index, 'path', event.currentTarget.value)}
                  style={{ flex: 1 }}
                />
              )}
              <NumberInput
                label="Weight"
                value={lora.scale}
                onChange={(value) => updateLora(index, 'scale', Number(value))}
                min={0}
                max={2}
                step={0.1}
                style={{ width: '80px' }}
              />
              <ActionIcon onClick={() => removeLora(index)} disabled={loras.length === 1} size="lg">
                <LuMinus />
              </ActionIcon>
            </Group>
          ))}
          <Group>
          <Button onClick={addLora}><LuPlus /> Add LoRA</Button>
            <Button onClick={generateImage} loading={isLoading}>
              Generate Image
            </Button>
          </Group>
          {error && <Text color="red">{error}</Text>}
        </Stack>
  
        <Stack style={{ flex: 1 }}>
          {isLoading ? (
            <>
              <Skeleton height={dimensions.height / 4} />
              <Progress value={progress} color="blue" />
            </>
          ) : (
            generatedImages.map((image, index) => (
              <Image key={index} src={image} alt={`Generated image ${index + 1}`} radius="md" />
            ))
          )}
        </Stack>
      </Group>
      <ActionIcon
        onClick={clearImages}
        size="lg"
        style={{
          position: 'fixed',
          bottom: 20,
          left: 20,
        }}
      >
        <LuTrash2 />
      </ActionIcon>
      <ActionIcon
        onClick={settingsHandlers.open}
        size="lg"
        style={{
          position: 'fixed',
          bottom: 20,
          right: 20,
        }}
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