import { Title, Text, Stack, Container, Space } from "@mantine/core";
import docsData from '../../data/docs.json';

const Section = ({ title, content, subsections }: { title: string, content?: string[], subsections?: { title: string, content: string[] }[] }) => (
  <Stack>
    <Title order={2}>{title}</Title>
    {content && content.map((paragraph, index) => (
      <Text key={index}>{paragraph}</Text>
    ))}
    {subsections && subsections.map((subsection, index) => (
      <Stack key={index} ml="md">
        <Title order={3}>{subsection.title}</Title>
        {subsection.content.map((paragraph, pIndex) => (
          <Text key={pIndex}>{paragraph}</Text>
        ))}
      </Stack>
    ))}
  </Stack>
);

export default function DocsPage() {
  return (
    <Container size="md">
      <Stack>
        <Title order={1}>{docsData.title}</Title>
        <Space h="md" />
        {docsData.sections.map((section, index) => (
          <Section key={index} {...section} />
        ))}
      </Stack>
    </Container>
  );
}
