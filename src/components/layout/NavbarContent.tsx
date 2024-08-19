import { Tooltip, UnstyledButton, Stack, useMantineColorScheme, ActionIcon } from "@mantine/core";
import Link from "next/link";
import dynamic from 'next/dynamic';

// Dynamically import icons
const LuSparkles = dynamic(() => import('react-icons/lu').then((mod) => mod.LuSparkles), { ssr: false });
const LuSettings = dynamic(() => import('react-icons/lu').then((mod) => mod.LuSettings), { ssr: false });
const LuCroissant = dynamic(() => import('react-icons/lu').then((mod) => mod.LuCroissant), { ssr: false });
const LuHelpCircle = dynamic(() => import('react-icons/lu').then((mod) => mod.LuHelpCircle), { ssr: false });
const LuSun = dynamic(() => import('react-icons/lu').then((mod) => mod.LuSun), { ssr: false });
const LuMoon = dynamic(() => import('react-icons/lu').then((mod) => mod.LuMoon), { ssr: false });

const SidebarButton = ({ icon: Icon, label, href, onClick }: { icon: React.ElementType; label: string; href?: string; onClick?: () => void }) => (
  <Tooltip label={label} position="right" withArrow>
    {href ? (
      <UnstyledButton component={Link} href={href}>
        {Icon && <Icon size={24} />}
      </UnstyledButton>
    ) : (
      <UnstyledButton onClick={onClick}>
        {Icon && <Icon size={24} />}
      </UnstyledButton>
    )}
  </Tooltip>
);

export function NavbarContent({ openSettings }: { openSettings: () => void }) {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const dark = colorScheme === 'dark';

  return (
    <Stack justify="space-between" h="100%" py="md">
      <Stack align="center" gap="xl">
        <Tooltip label="Home" position="right" withArrow>
          <UnstyledButton component={Link} href="/">
            <LuSparkles size={32} />
          </UnstyledButton>
        </Tooltip>
        <Stack gap="xl">
          <SidebarButton icon={LuCroissant} label="App" href="/" />
          <SidebarButton icon={LuSettings} label="Settings" onClick={openSettings} />
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