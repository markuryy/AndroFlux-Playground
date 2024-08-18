import { Modal, TextInput, Button, Stack } from "@mantine/core";

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
      <Stack>
        <TextInput
          label="fal API Key"
          value={apiKey}
          onChange={(event) => setApiKey(event.currentTarget.value)}
          placeholder="Enter your fal API key"
        />
        <Button onClick={saveApiKey}>Save API Key</Button>
      </Stack>
    </Modal>
  );
}