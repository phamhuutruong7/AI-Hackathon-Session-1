import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const PageTitle = styled.h1`
  color: #333;
  margin-bottom: 2rem;
`;

const PlaceholderCard = styled.div`
  background: white;
  padding: 3rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

const PlaceholderText = styled.p`
  color: #666;
  font-size: 1.1rem;
  margin-bottom: 1rem;
`;

const GeneratorPage: React.FC = () => {
  return (
    <Container>
      <PageTitle>Email Generator</PageTitle>
      <PlaceholderCard>
        <PlaceholderText>🤖</PlaceholderText>
        <PlaceholderText>AI-powered email generation functionality will be implemented here.</PlaceholderText>
        <PlaceholderText>Features to include:</PlaceholderText>
        <ul style={{ textAlign: 'left', maxWidth: '400px', margin: '0 auto' }}>
          <li>Select email purpose (business, personal, marketing)</li>
          <li>Provide context and details</li>
          <li>Choose tone (professional, casual, friendly, formal)</li>
          <li>Select target language</li>
          <li>Generate email content using AI</li>
          <li>Preview and edit generated content</li>
          <li>Save as template</li>
        </ul>
      </PlaceholderCard>
    </Container>
  );
};

export default GeneratorPage;
