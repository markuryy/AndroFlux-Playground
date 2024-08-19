import { Modal, TextInput, Button, Stack, Text, Anchor } from "@mantine/core";

interface SettingsModalProps {
  opened: boolean;
  onClose: () => void;
  apiKey: string;
  setApiKey: (key: string) => void;
}

export function SettingsModal({ opened, onClose, apiKey, setApiKey }: SettingsModalProps) {
  const saveApiKey = () => {
    localStorage.setItem('falApiKey', apiKey);
    onClose();
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Settings">
      <Stack gap="md">
        <TextInput
          label="fal API Key"
          value={apiKey}
          onChange={(event) => setApiKey(event.currentTarget.value)}
          placeholder="Enter your fal API key"
        />
        <Text size="sm">
          Don't have a key? <Anchor href="https://fal.ai/dashboard/keys" target="_blank" rel="noopener noreferrer">Get one here</Anchor>
        </Text>
        <Button onClick={saveApiKey}>Save API Key</Button>
      </Stack>
    </Modal>
  );
}