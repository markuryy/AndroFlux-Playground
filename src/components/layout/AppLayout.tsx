'use client';

import { AppShell, ColorSchemeScript, MantineProvider, createTheme, Burger } from "@mantine/core";
import { NavbarContent } from "./NavbarContent";
import { FooterContent } from "./FooterContent";
import { useColorScheme } from '@mantine/hooks';
import { useState } from 'react';
import { SettingsModal } from "../SettingsModal";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const theme = createTheme({
    fontFamily: 'Open Sans, sans-serif',
    primaryColor: 'blue',
  });

  const [settingsOpened, setSettingsOpened] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [navbarOpened, setNavbarOpened] = useState(false);

  const openSettings = () => setSettingsOpened(true);
  const closeSettings = () => setSettingsOpened(false);

  return (
    <>
      <ColorSchemeScript />
      <MantineProvider defaultColorScheme="dark" theme={theme}>
        <AppShell
          padding="md"
          navbar={{
            width: { base: 80, sm: 80 },
            breakpoint: 'sm',
            collapsed: { mobile: !navbarOpened },
          }}
          footer={{
            height: 60,
          }}
          header={{
            height: 60,
            collapsed: !navbarOpened,
          }}
        >
          <AppShell.Header>
            <Burger
              opened={navbarOpened}
              onClick={() => setNavbarOpened((o) => !o)}
              hiddenFrom="sm"
              size="sm"
              style={{ position: 'absolute', top: 15, left: 15 }}
            />
          </AppShell.Header>

          <AppShell.Navbar>
            <NavbarContent openSettings={openSettings} />
          </AppShell.Navbar>

          <AppShell.Main>{children}</AppShell.Main>

          <AppShell.Footer p="md">
            <FooterContent />
          </AppShell.Footer>
        </AppShell>
        <SettingsModal
          opened={settingsOpened}
          onClose={closeSettings}
          apiKey={apiKey}
          setApiKey={setApiKey}
        />
      </MantineProvider>
    </>
  );
}