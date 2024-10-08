'use client';

import { useState } from 'react';
import {
  Title, Stack, TextInput, NumberInput, Select, Button, Image,
  ActionIcon, Group, Text, Skeleton, Progress, Box, Modal
} from "@mantine/core";
import { useDisclosure } from '@mantine/hooks';
import { LuPlus, LuMinus, LuSettings, LuRefreshCw, LuDownload } from "react-icons/lu";
import AspectRatioSelector from '../components/AspectRatio';
import { SettingsModal } from '../components/SettingsModal';
import { EnhancedTextarea } from '../components/EnhancedTextarea';

const PRESELECTED_LORAS = [
  { value: 'https://huggingface.co/markury/AndroFlux/resolve/main/AndroFlux-v19.safetensors', label: 'AndroFlux v19' },
  // Add more preselected LoRAs here
];

interface LoRA {
  path: string;
  scale: number;
}

export default function Home() {
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 1000000));
  const [loras, setLoras] = useState<LoRA[]>([{ path: 'https://huggingface.co/markury/AndroFlux/resolve/main/AndroFlux-v19.safetensors', scale: 1.0 }]);
  const [prompt, setPrompt] = useState('');
  const [dimensions, setDimensions] = useState({ width: 1024, height: 1024 });
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [settingsOpened, settingsHandlers] = useDisclosure(false);

  const generateImage = async () => {
    const falApiKey = localStorage.getItem('falApiKey');
    if (!falApiKey) {
      settingsHandlers.open();
      return;
    }
  
    if (!prompt.trim()) {
      setError('Please enter a prompt before generating an image.');
      return;
    }
  
    setIsLoading(true);
    setProgress(0);
    setError(null);
    setCurrentImage(null);
  
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
          apiKey: falApiKey,
        }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to generate image');
      }
  
      const blob = await response.blob(); // Fetch as a Blob, not as JSON
      const imageUrl = URL.createObjectURL(blob);
  
      setCurrentImage(imageUrl);
      setSeed(seed);
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error generating image:', error.message);
        setError(error.message);
      } else {
        console.error('Unexpected error', error);
        setError('An unexpected error occurred.');
      }
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
  
  const downloadImage = async (imageUrl: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'AndroFlux.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  return (
    <Box>
      <Title order={1}>AndroFlux Playground</Title>
      <Group align="flex-start" grow>
        {/* Left Section */}
        <Stack style={{ width: '37.5%' }}>
          <Group align="flex-end">
            <NumberInput
              label="Seed"
              value={seed}
              onChange={(value) => setSeed(Number(value))}
              min={0}
              max={999999}
              style={{ flexGrow: 1 }}
            />
            <ActionIcon onClick={randomizeSeed} size="lg">
              <LuRefreshCw />
            </ActionIcon>
          </Group>
          <EnhancedTextarea
            label="Prompt"
            value={prompt}
            onChange={setPrompt}
            rows={4}
            error={error}
          />
          <AspectRatioSelector dimensions={dimensions} setDimensions={setDimensions} />
          {loras.map((lora, index) => (
            <Group key={index} align="flex-end">
              <Select
                label={`LoRA ${index + 1}`}
                data={[...PRESELECTED_LORAS, { value: 'custom', label: 'Custom URL' }]}
                value={PRESELECTED_LORAS.some(l => l.value === lora.path) ? lora.path : 'custom'}
                onChange={(value) => updateLora(index, 'path', value === 'custom' ? '' : value || '')}
                style={{ flexGrow: 1 }}
              />
              {!PRESELECTED_LORAS.some(l => l.value === lora.path) && (
                <TextInput
                  label="Custom LoRA URL"
                  value={lora.path}
                  onChange={(event) => updateLora(index, 'path', event.currentTarget.value)}
                  style={{ flexGrow: 1 }}
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
            <Button onClick={addLora} style={{ flexGrow: 1 }}>
              <LuPlus /> Add LoRA
            </Button>
            <Button onClick={generateImage} loading={isLoading} style={{ flexGrow: 1 }}>
              Generate Image
            </Button>
          </Group>
        </Stack>
  
        {/* Right Section */}
        <Stack style={{ flex: 1, overflowY: 'auto', height: '100vh' }}>
          {/* Main Generation Box */}
          <Box
            style={{
              padding: '10px',
              border: '1px solid #eaeaea',
              borderRadius: '10px',
              display: 'flex', 
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {isLoading ? (
              <>
                <Skeleton height={dimensions.height / 4} width="100%" mb={10} />
                <Progress value={progress} color="blue" size="xl" radius="xl" style={{ width: '100%' }} />
              </>
            ) : !currentImage ? (
              <Box
                style={{
                  padding: '20px',
                  border: '1px solid #eaeaea',
                  borderRadius: '10px',
                  width: '100%',
                  textAlign: 'center',
                  backgroundColor: '#f4f4f4',
                }}
              >
                <Text color="dimmed">Nothing here (yet)</Text>
              </Box>  
            ) : (
              <Box style={{ position: 'relative', width: '100%' }}>
                <Image
                  src={currentImage}
                  alt="Generated image"
                  radius="md"
                  style={{ objectFit: 'contain', width: '100%' }}
                />
                <ActionIcon
                  variant="filled"
                  color="blue"
                  style={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                  }}
                  onClick={() => downloadImage(currentImage)}  
                >
                  <LuDownload />
                </ActionIcon>
              </Box>
            )}
          </Box>
        </Stack>
      </Group>
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
      />
    </Box>
  );
}
