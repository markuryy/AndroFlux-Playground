import { Modal, TextInput, Button, Stack, Text, Anchor, PasswordInput } from "@mantine/core";
import { useState, useEffect } from "react";

interface SettingsModalProps {
  opened: boolean;
  onClose: () => void;
}

export function SettingsModal({ opened, onClose }: SettingsModalProps) {
  const [falApiKey, setFalApiKey] = useState("");
  const [groqApiKey, setGroqApiKey] = useState("");

  useEffect(() => {
    const storedFalApiKey = localStorage.getItem('falApiKey') || "";
    const storedGroqApiKey = localStorage.getItem('groqApiKey') || "";
    setFalApiKey(storedFalApiKey);
    setGroqApiKey(storedGroqApiKey);
  }, [opened]);

  const saveApiKeys = () => {
    localStorage.setItem('falApiKey', falApiKey);
    localStorage.setItem('groqApiKey', groqApiKey);
    onClose();
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Settings">
      <Stack gap="md">
        <PasswordInput
          label="fal API Key"
          value={falApiKey}
          onChange={(event) => setFalApiKey(event.currentTarget.value)}
          placeholder="Enter your fal API key"
        />
        <PasswordInput
          label="Groq API Key"
          value={groqApiKey}
          onChange={(event) => setGroqApiKey(event.currentTarget.value)}
          placeholder="Enter your Groq API key"
        />
        <Text size="sm">
          Don't have a fal key? <Anchor href="https://fal.ai/dashboard/keys" target="_blank" rel="noopener noreferrer">Get one here</Anchor>
        </Text>
        <Text size="sm">
          Don't have a Groq key? <Anchor href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer">Get one here</Anchor>
        </Text>
        <Button onClick={saveApiKeys}>Save API Keys</Button>
      </Stack>
    </Modal>
  );
}