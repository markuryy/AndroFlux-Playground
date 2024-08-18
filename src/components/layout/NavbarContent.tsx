import { Tooltip, UnstyledButton, Stack, useMantineColorScheme, ActionIcon } from "@mantine/core";
import { LuSparkles, LuSettings, LuCroissant, LuHelpCircle, LuSun, LuMoon } from "react-icons/lu";
import Link from "next/link";

const SidebarButton = ({ icon: Icon, label, href, onClick }: { icon: React.ElementType; label: string; href?: string; onClick?: () => void }) => (
  <Tooltip label={label} position="right" withArrow>
    {href ? (
      <UnstyledButton component={Link} href={href} p="xs">
        <Icon size={24} />
      </UnstyledButton>
    ) : (
      <UnstyledButton onClick={onClick} p="xs">
        <Icon size={24} />
      </UnstyledButton>
    )}
  </Tooltip>
);

export function NavbarContent() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const dark = colorScheme === 'dark';

  return (
    <Stack justify="space-between" h="100%" p="md">
      <Stack align="center" gap="xl">
        <Tooltip label="Home" position="right" withArrow>
          <UnstyledButton component={Link} href="/">
            <LuSparkles size={32} />
          </UnstyledButton>
        </Tooltip>
        <Stack gap="lg">
          <SidebarButton icon={LuCroissant} label="App" href="/" />
          <SidebarButton icon={LuSettings} label="Settings" href="/settings" />
          <SidebarButton icon={LuHelpCircle} label="Docs" href="/docs" />
        </Stack>
      </Stack>
      <Stack align="center">
        <ActionIcon
          variant="outline"
          color={dark ? 'yellow' : 'blue'}
          onClick={() => toggleColorScheme()}
          title="Toggle color scheme"
        >
          {dark ? <LuSun size="1.1rem" /> : <LuMoon size="1.1rem" />}
        </ActionIcon>
      </Stack>
    </Stack>
  );
}
