import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const Hero = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const Title = styled.h1`
  font-size: 3rem;
  color: #333;
  margin-bottom: 1rem;
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: #666;
  max-width: 600px;
  margin: 0 auto;
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 3rem;
`;

const FeatureCard = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

const FeatureIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
`;

const FeatureTitle = styled.h3`
  color: #333;
  margin-bottom: 1rem;
`;

const FeatureDescription = styled.p`
  color: #666;
  line-height: 1.6;
`;

const HomePage: React.FC = () => {
  return (
    <Container>
      <Hero>
        <Title>Email Template Generator</Title>
        <Subtitle>
          Create, manage, and translate professional email templates with ease. 
          Generate personalized emails for any purpose using AI-powered technology.
        </Subtitle>
      </Hero>

      <FeatureGrid>
        <FeatureCard>
          <FeatureIcon>📧</FeatureIcon>
          <FeatureTitle>Template Management</FeatureTitle>
          <FeatureDescription>
            Create and manage email templates for different purposes. 
            Organize your templates by business, personal, or marketing categories.
          </FeatureDescription>
        </FeatureCard>

        <FeatureCard>
          <FeatureIcon>🤖</FeatureIcon>
          <FeatureTitle>AI-Powered Generation</FeatureTitle>
          <FeatureDescription>
            Generate professional email content based on your purpose and context. 
            Choose from different tones and styles to match your needs.
          </FeatureDescription>
        </FeatureCard>

        <FeatureCard>
          <FeatureIcon>🌐</FeatureIcon>
          <FeatureTitle>Multi-language Support</FeatureTitle>
          <FeatureDescription>
            Translate your emails to different languages instantly. 
            Support for multiple languages to reach a global audience.
          </FeatureDescription>
        </FeatureCard>
      </FeatureGrid>
    </Container>
  );
};

export default HomePage;
