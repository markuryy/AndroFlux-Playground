'use client';

import { useState, useEffect } from 'react';
import {
  Title, Stack, TextInput, NumberInput, Select, Button, Image,
  ActionIcon, Group, Text, Skeleton, Progress, Box, SimpleGrid,
  Modal,
  Textarea
} from "@mantine/core";
import { useDisclosure } from '@mantine/hooks';
import { LuPlus, LuMinus, LuSettings, LuRefreshCw, LuTrash2, LuDownload } from "react-icons/lu";
import AspectRatioSelector from '../components/AspectRatio';
import { SettingsModal } from '../components/SettingsModal';
import JSZip from 'jszip';

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
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [settingsOpened, settingsHandlers] = useDisclosure(false);
  const [clearStorageOpened, clearStorageHandlers] = useDisclosure(false);
  const [storageUsage, setStorageUsage] = useState(0);

  useEffect(() => {
    const storedApiKey = localStorage.getItem('falApiKey');
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
    loadImagesFromLocalStorage();
    checkLocalStorageUsage();
  }, []);

  const loadImagesFromLocalStorage = () => {
    const storedImages = localStorage.getItem('generatedImages');
    if (storedImages) {
      setGalleryImages(JSON.parse(storedImages));
    }
  };

  const saveImagesToLocalStorage = (images: string[]) => {
    localStorage.setItem('generatedImages', JSON.stringify(images));
  };

  const checkLocalStorageUsage = () => {
    let total = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += (localStorage[key].length * 2) / 1024 / 1024;
      }
    }
    setStorageUsage(total);
  };

  const generateImage = async () => {
    if (!apiKey) {
      settingsHandlers.open();
      return;
    }

    if (!prompt.trim()) {
      setError('Please enter a prompt before generating an image.');
      return;
    }

    if (currentImage) {
      setGalleryImages(prevImages => [currentImage, ...prevImages]);
      saveImagesToLocalStorage([currentImage, ...galleryImages]);
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
          apiKey,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate image');
      }

      const result = await response.json();
      setCurrentImage(result.images[0].url);
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
    setCurrentImage(null);
    setGalleryImages([]);
    localStorage.removeItem('generatedImages');
    checkLocalStorageUsage();
  };

  const downloadAllImages = () => {
    const allImages = currentImage ? [currentImage, ...galleryImages] : galleryImages;
    const zip = new JSZip();
    allImages.forEach((image, index) => {
      zip.file(`image-${index + 1}.png`, fetch(image).then(response => response.blob()));
    });
    zip.generateAsync({ type: 'blob' }).then((content: Blob) => {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = 'generated-images.zip';
      link.click();
    });
  };

  const downloadImage = async (imageUrl: string, index: number) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `image-${index + 1}.png`;
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
          <Textarea
            label="Prompt"
            value={prompt}
            rows={4}
            resize='vertical'
            onChange={(event) => setPrompt(event.currentTarget.value)}
            style={{ flexGrow: 1 }}
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
              maxHeight: 'calc(100vh - 150px)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              overflow: 'hidden',
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
                  onClick={() => downloadImage(currentImage, 0)}
                >
                  <LuDownload />
                </ActionIcon>
              </Box>
            )}
          </Box>

          {/* Gallery */}
          <Box
            style={{
              padding: '10px',
              border: '1px solid #eaeaea',
              borderRadius: '10px',
              overflow: 'auto',
              maxHeight: 'calc(100vh - 400px)',
            }}
          >
            <SimpleGrid cols={3}>
              {galleryImages.map((image, index) => (
                <Box key={index} style={{ position: 'relative' }}>
                  <Image src={image} alt={`Generated image ${index + 1}`} radius="md" style={{ objectFit: 'contain', width: '100%' }} />
                  <ActionIcon
                    variant="filled"
                    color="blue"
                    style={{
                      position: 'absolute',
                      top: 5,
                      right: 5,
                    }}
                    onClick={() => downloadImage(image, index + 1)}
                  >
                    <LuDownload />
                  </ActionIcon>
                </Box>
              ))}
            </SimpleGrid>
            <Button onClick={clearImages} color="red" fullWidth mt="md">
              Clear All Images
            </Button>
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
        apiKey={apiKey}
        setApiKey={setApiKey}
      />
      <Modal
        opened={clearStorageOpened}
        onClose={clearStorageHandlers.close}
        title="Clear Local Storage"
      >
        <Text>Current local storage usage: {storageUsage.toFixed(2)} MB</Text>
        <Text>Are you sure you want to clear all generated images from local storage?</Text>
        <Group mt="md">
          <Button onClick={() => {
            clearImages();
            clearStorageHandlers.close();
          }}>Clear Storage</Button>
          <Button onClick={downloadAllImages}>Download All Images</Button>
          <Button onClick={clearStorageHandlers.close} variant="outline">Cancel</Button>
        </Group>
      </Modal>
    </Box>
  );
}
